import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Módulos del Sistema')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('modules')
export class ModulesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los módulos del sistema' })
  @ApiResponse({ status: 200, description: 'Lista de módulos' })
  async findAll() {
    return this.profilesService.getAllModules();
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Listar módulos agrupados por categoría' })
  @ApiResponse({ status: 200, description: 'Módulos agrupados por categoría' })
  async findByCategory() {
    return this.profilesService.getModulesByCategory();
  }

  @Get(':id/actions')
  @ApiOperation({ summary: 'Obtener acciones de un módulo' })
  @ApiResponse({ status: 200, description: 'Acciones del módulo' })
  async getActions(@Param('id') id: string) {
    return this.profilesService.getModuleActions(id);
  }
}
