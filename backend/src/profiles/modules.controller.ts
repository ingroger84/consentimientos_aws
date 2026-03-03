import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequireSuperAdmin } from './decorators/require-super-admin.decorator';

@ApiTags('Módulos del Sistema')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireSuperAdmin()
@Controller('modules')
export class ModulesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los módulos del sistema (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de módulos' })
  @ApiResponse({ status: 403, description: 'Se requiere ser super administrador' })
  async findAll() {
    return this.profilesService.getAllModules();
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Listar módulos agrupados por categoría (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Módulos agrupados por categoría' })
  @ApiResponse({ status: 403, description: 'Se requiere ser super administrador' })
  async findByCategory() {
    return this.profilesService.getModulesByCategory();
  }

  @Get(':id/actions')
  @ApiOperation({ summary: 'Obtener acciones de un módulo (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Acciones del módulo' })
  @ApiResponse({ status: 403, description: 'Se requiere ser super administrador' })
  async getActions(@Param('id') id: string) {
    return this.profilesService.getModuleActions(id);
  }
}
