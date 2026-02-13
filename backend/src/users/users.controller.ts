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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CREATE_USERS)
  @ApiOperation({ 
    summary: 'Crear usuario',
    description: 'Crea un nuevo usuario en el tenant actual. Requiere permiso CREATE_USERS.'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.usersService.create(createUserDto, tenantId);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_USERS)
  @ApiOperation({ 
    summary: 'Listar usuarios',
    description: 'Obtiene todos los usuarios del tenant actual. Super Admin ve todos los usuarios.'
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async findAll(@CurrentUser() user: User) {
    // SEGURIDAD CRÍTICA: Si el usuario tiene tenant, SOLO ver usuarios de su tenant
    // Si es Super Admin (sin tenant), ver todos los usuarios
    const tenantId = user.tenant?.id;
    const users = await this.usersService.findAll(tenantId);
    
    return users;
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_USERS)
  @ApiOperation({ 
    summary: 'Obtener usuario por ID',
    description: 'Obtiene los detalles de un usuario específico'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    // SEGURIDAD CRÍTICA: Pasar tenantId para validar acceso
    const tenantId = user.tenant?.id;
    return this.usersService.findOne(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.EDIT_USERS)
  @ApiOperation({ 
    summary: 'Actualizar usuario',
    description: 'Actualiza los datos de un usuario existente'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    // SEGURIDAD CRÍTICA: Pasar tenantId para validar que solo se editen usuarios del mismo tenant
    const tenantId = user.tenant?.id;
    return this.usersService.update(id, updateUserDto, tenantId);
  }

  @Patch(':id/change-password')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CHANGE_PASSWORDS)
  @ApiOperation({ 
    summary: 'Cambiar contraseña',
    description: 'Cambia la contraseña de un usuario'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    // SEGURIDAD CRÍTICA: Pasar tenantId para validar que solo se cambien contraseñas de usuarios del mismo tenant
    const tenantId = user.tenant?.id;
    return this.usersService.changePassword(id, changePasswordDto.newPassword, tenantId);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DELETE_USERS)
  @ApiOperation({ 
    summary: 'Eliminar usuario',
    description: 'Elimina un usuario del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    // SEGURIDAD CRÍTICA: Pasar tenantId para validar que solo se eliminen usuarios del mismo tenant
    const tenantId = user.tenant?.id;
    return this.usersService.remove(id, tenantId);
  }
}
