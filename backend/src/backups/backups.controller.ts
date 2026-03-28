import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../roles/entities/role.entity';
import { BackupsService } from './backups.service';

@ApiTags('backups')
@ApiBearerAuth()
@Controller('backups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.SUPER_ADMIN) // Solo Super Admin puede acceder
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los backups disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de backups obtenida correctamente' })
  async listBackups() {
    return this.backupsService.listBackups();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de backups' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas correctamente' })
  async getStats() {
    return this.backupsService.getBackupStats();
  }

  @Get(':fileName')
  @ApiOperation({ summary: 'Obtener información de un backup específico' })
  @ApiResponse({ status: 200, description: 'Información del backup obtenida' })
  @ApiResponse({ status: 404, description: 'Backup no encontrado' })
  async getBackupInfo(@Param('fileName') fileName: string) {
    return this.backupsService.getBackupInfo(fileName);
  }

  @Get(':fileName/download-url')
  @ApiOperation({ summary: 'Obtener URL de descarga pre-firmada' })
  @ApiResponse({ status: 200, description: 'URL generada correctamente' })
  async getDownloadUrl(@Param('fileName') fileName: string) {
    return this.backupsService.getDownloadUrl(fileName);
  }

  @Post('create')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Crear un backup manual' })
  @ApiResponse({ status: 202, description: 'Backup iniciado correctamente' })
  async createBackup() {
    return this.backupsService.createBackup();
  }

  @Post(':fileName/restore')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Restaurar un backup' })
  @ApiResponse({ status: 202, description: 'Restauración iniciada' })
  @ApiResponse({ status: 404, description: 'Backup no encontrado' })
  async restoreBackup(@Param('fileName') fileName: string) {
    return this.backupsService.restoreBackup(fileName);
  }

  @Delete(':fileName')
  @ApiOperation({ summary: 'Eliminar un backup' })
  @ApiResponse({ status: 200, description: 'Backup eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Backup no encontrado' })
  async deleteBackup(@Param('fileName') fileName: string) {
    return this.backupsService.deleteBackup(fileName);
  }

  @Get('schedule/current')
  @ApiOperation({ summary: 'Obtener horario actual de backups automáticos' })
  @ApiResponse({ status: 200, description: 'Horario obtenido correctamente' })
  async getCurrentSchedule() {
    return this.backupsService.getCurrentSchedule();
  }

  @Post('schedule/update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar horario de backups automáticos' })
  @ApiResponse({ status: 200, description: 'Horario actualizado correctamente' })
  async updateSchedule(@Body() scheduleDto: { schedule1: string; schedule2: string }) {
    return this.backupsService.updateSchedule(scheduleDto.schedule1, scheduleDto.schedule2);
  }

}
