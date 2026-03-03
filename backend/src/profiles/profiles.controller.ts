import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AssignProfileDto } from './dto/assign-profile.dto';
import { CheckPermissionDto } from './dto/check-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermission } from './decorators/require-permission.decorator';
import { RequireSuperAdmin } from './decorators/require-super-admin.decorator';

@ApiTags('Perfiles y Permisos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @RequireSuperAdmin()
  @ApiOperation({ summary: 'Crear un nuevo perfil (Solo Super Admin)' })
  @ApiResponse({ status: 201, description: 'Perfil creado exitosamente' })
  @ApiResponse({ status: 403, description: 'Se requiere ser super administrador' })
  async create(@Body() createProfileDto: CreateProfileDto, @Request() req) {
    return this.profilesService.create(
      createProfileDto,
      req.user.id,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get()
  @RequireSuperAdmin()
  @ApiOperation({ summary: 'Listar todos los perfiles (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de perfiles' })
  @ApiResponse({ status: 403, description: 'Se requiere ser super administrador' })
  async findAll(@Query('tenantId') tenantId?: string) {
    return this.profilesService.findAll(tenantId);
  }

  @Get(':id')
  @RequireSuperAdmin()
  @ApiOperation({ summary: 'Obtener un perfil por ID (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Perfil encontrado' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @ApiResponse({ status: 403, description: 'Se requiere ser super administrador' })
  async findOne(@Param('id') id: string) {
    return this.profilesService.findOne(id);
  }

  @Patch(':id')
  @RequireSuperAdmin()
  @ApiOperation({ summary: 'Actualizar un perfil (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado' })
  @ApiResponse({ status: 403, description: 'Se requiere ser super administrador o no se pueden editar perfiles del sistema' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req,
  ) {
    return this.profilesService.update(
      id,
      updateProfileDto,
      req.user.id,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete(':id')
  @RequireSuperAdmin()
  @ApiOperation({ summary: 'Eliminar un perfil (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Perfil eliminado' })
  @ApiResponse({ status: 403, description: 'Se requiere ser super administrador o no se pueden eliminar perfiles del sistema' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.profilesService.remove(
      id,
      req.user.id,
      req.ip,
      req.headers['user-agent'],
    );
    return { message: 'Perfil eliminado exitosamente' };
  }

  @Post('assign')
  @RequireSuperAdmin()
  @ApiOperation({ summary: 'Asignar un perfil a un usuario (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Perfil asignado exitosamente' })
  @ApiResponse({ status: 403, description: 'Se requiere ser super administrador' })
  async assignToUser(@Body() assignProfileDto: AssignProfileDto, @Request() req) {
    return this.profilesService.assignToUser(
      assignProfileDto.profileId,
      assignProfileDto.userId,
      req.user.id,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete('revoke/:userId')
  @RequireSuperAdmin()
  @ApiOperation({ summary: 'Revocar el perfil de un usuario (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Perfil revocado exitosamente' })
  @ApiResponse({ status: 403, description: 'Se requiere ser super administrador' })
  async revokeFromUser(@Param('userId') userId: string, @Request() req) {
    return this.profilesService.revokeFromUser(
      userId,
      req.user.id,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get(':id/audit')
  @RequireSuperAdmin()
  @ApiOperation({ summary: 'Obtener auditoría de un perfil (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Auditoría del perfil' })
  @ApiResponse({ status: 403, description: 'Se requiere ser super administrador' })
  async getAudit(@Param('id') id: string) {
    return this.profilesService.getProfileAudit(id);
  }

  @Post('check-permission')
  @ApiOperation({ summary: 'Verificar si un usuario tiene un permiso' })
  @ApiResponse({ status: 200, description: 'Resultado de la verificación' })
  async checkPermission(@Body() checkPermissionDto: CheckPermissionDto) {
    const hasPermission = await this.profilesService.checkUserPermission(
      checkPermissionDto.userId,
      checkPermissionDto.module,
      checkPermissionDto.action,
    );
    return { hasPermission };
  }

  @Get('user/:userId/permissions')
  @ApiOperation({ summary: 'Obtener todos los permisos de un usuario' })
  @ApiResponse({ status: 200, description: 'Permisos del usuario' })
  async getUserPermissions(@Param('userId') userId: string) {
    const user = await this.profilesService['userRepository'].findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user || !user.profile) {
      return { permissions: [] };
    }

    return {
      permissions: user.profile.getFlatPermissions(),
      profile: {
        id: user.profile.id,
        name: user.profile.name,
        description: user.profile.description,
      },
    };
  }
}
