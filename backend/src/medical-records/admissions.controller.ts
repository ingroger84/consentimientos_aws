import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto, UpdateAdmissionDto, CloseAdmissionDto } from './dto/admission.dto';

@ApiTags('Admissions')
@ApiBearerAuth()
@Controller('admissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Post()
  @RequirePermissions('medical_records.create')
  @ApiOperation({ summary: 'Crear nueva admisión para una HC existente' })
  @ApiResponse({ status: 201, description: 'Admisión creada exitosamente' })
  @ApiResponse({ status: 404, description: 'Historia clínica no encontrada' })
  async create(@Body() createDto: CreateAdmissionDto, @Request() req) {
    return this.admissionsService.create(
      createDto,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('medical-record/:medicalRecordId')
  @RequirePermissions('medical_records.view')
  @ApiOperation({ summary: 'Obtener todas las admisiones de una HC' })
  @ApiResponse({ status: 200, description: 'Lista de admisiones' })
  async findByMedicalRecord(
    @Param('medicalRecordId') medicalRecordId: string,
    @Request() req,
  ) {
    return this.admissionsService.findByMedicalRecord(
      medicalRecordId,
      req.user.tenantId,
    );
  }

  @Get(':id')
  @RequirePermissions('medical_records.view')
  @ApiOperation({ summary: 'Obtener una admisión específica' })
  @ApiResponse({ status: 200, description: 'Admisión encontrada' })
  @ApiResponse({ status: 404, description: 'Admisión no encontrada' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.admissionsService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @RequirePermissions('medical_records.update')
  @ApiOperation({ summary: 'Actualizar una admisión' })
  @ApiResponse({ status: 200, description: 'Admisión actualizada' })
  @ApiResponse({ status: 404, description: 'Admisión no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdmissionDto,
    @Request() req,
  ) {
    return this.admissionsService.update(id, updateDto, req.user.tenantId);
  }

  @Patch(':id/close')
  @RequirePermissions('medical_records.update')
  @ApiOperation({ summary: 'Cerrar una admisión' })
  @ApiResponse({ status: 200, description: 'Admisión cerrada' })
  @ApiResponse({ status: 404, description: 'Admisión no encontrada' })
  async close(
    @Param('id') id: string,
    @Body() closeDto: CloseAdmissionDto,
    @Request() req,
  ) {
    return this.admissionsService.close(
      id,
      closeDto,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Patch(':id/reopen')
  @RequirePermissions('medical_records.update')
  @ApiOperation({ summary: 'Reabrir una admisión cerrada' })
  @ApiResponse({ status: 200, description: 'Admisión reabierta' })
  @ApiResponse({ status: 404, description: 'Admisión no encontrada' })
  async reopen(@Param('id') id: string, @Request() req) {
    return this.admissionsService.reopen(id, req.user.tenantId);
  }

  @Patch(':id/cancel')
  @RequirePermissions('medical_records.delete')
  @ApiOperation({ summary: 'Cancelar una admisión' })
  @ApiResponse({ status: 200, description: 'Admisión cancelada' })
  @ApiResponse({ status: 404, description: 'Admisión no encontrada' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.admissionsService.cancel(id, reason, req.user.tenantId);
  }

  @Get('medical-record/:medicalRecordId/active')
  @RequirePermissions('medical_records.view')
  @ApiOperation({ summary: 'Obtener la admisión activa de una HC' })
  @ApiResponse({ status: 200, description: 'Admisión activa encontrada' })
  @ApiResponse({ status: 404, description: 'No hay admisión activa' })
  async getActiveAdmission(
    @Param('medicalRecordId') medicalRecordId: string,
    @Request() req,
  ) {
    const admission = await this.admissionsService.getActiveAdmission(
      medicalRecordId,
      req.user.tenantId,
    );

    if (!admission) {
      return { message: 'No hay admisión activa para esta HC' };
    }

    return admission;
  }
}
