import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions';
import { MedicalRecordsService } from './medical-records.service';
import { AnamnesisService } from './anamnesis.service';
import { PhysicalExamService } from './physical-exam.service';
import { DiagnosisService } from './diagnosis.service';
import { EvolutionService } from './evolution.service';
import { MedicalOrdersService } from './medical-orders.service';
import { PrescriptionsService } from './prescriptions.service';
import { ProceduresService } from './procedures.service';
import { TreatmentPlansService } from './treatment-plans.service';
import { EpicrisisService } from './epicrisis.service';
import { MedicalRecordDocumentsService } from './medical-record-documents.service';
import { StorageService } from '../common/services/storage.service';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  CreateAnamnesisDto,
  UpdateAnamnesisDto,
  CreatePhysicalExamDto,
  UpdatePhysicalExamDto,
  CreateDiagnosisDto,
  UpdateDiagnosisDto,
  CreateEvolutionDto,
  UpdateEvolutionDto,
  CreateMedicalOrderDto,
  UpdateMedicalOrderDto,
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  CreateProcedureDto,
  UpdateProcedureDto,
  CreateTreatmentPlanDto,
  UpdateTreatmentPlanDto,
  CreateEpicrisisDto,
  UpdateEpicrisisDto,
  UploadDocumentDto,
} from './dto';

@Controller('medical-records')
@UseGuards(AuthGuard('jwt'))
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly anamnesisService: AnamnesisService,
    private readonly physicalExamService: PhysicalExamService,
    private readonly diagnosisService: DiagnosisService,
    private readonly evolutionService: EvolutionService,
    private readonly medicalOrdersService: MedicalOrdersService,
    private readonly prescriptionsService: PrescriptionsService,
    private readonly proceduresService: ProceduresService,
    private readonly treatmentPlansService: TreatmentPlansService,
    private readonly epicrisisService: EpicrisisService,
    private readonly medicalRecordDocumentsService: MedicalRecordDocumentsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  async create(
    @Body() createDto: CreateMedicalRecordDto,
    @Request() req: any,
  ) {
    console.log('=== CONTROLADOR MEDICAL RECORDS ===');
    console.log('req.user:', req.user);
    console.log('req.user.tenantId:', req.user.tenantId);
    console.log('createDto:', createDto);
    
    return this.medicalRecordsService.create(
      createDto,
      req.user.sub,
      req.user.tenantId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  // Endpoint para Super Admin: obtener todas las historias clínicas agrupadas por tenant
  @Get('all/grouped')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_GLOBAL_STATS)
  async getAllGrouped(@Request() req: any) {
    return this.medicalRecordsService.getAllGroupedByTenant();
  }

  @Get('stats/overview')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
  async getStats(@Request() req: any) {
    return this.medicalRecordsService.getStatistics(req.user.tenantId);
  }

  @Get()
  async findAll(@Request() req: any, @Query() filters: any) {
    return this.medicalRecordsService.findAll(req.user.tenantId, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.medicalRecordsService.findOne(
      id,
      req.user.tenantId,
      req.user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMedicalRecordDto,
    @Request() req: any,
  ) {
    return this.medicalRecordsService.update(
      id,
      updateDto,
      req.user.sub,
      req.user.tenantId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/close')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CLOSE_MEDICAL_RECORDS)
  async close(@Param('id') id: string, @Request() req: any) {
    return this.medicalRecordsService.close(
      id,
      req.user.sub,
      req.user.tenantId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/archive')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.ARCHIVE_MEDICAL_RECORDS)
  async archive(@Param('id') id: string, @Request() req: any) {
    return this.medicalRecordsService.archive(
      id,
      req.user.sub,
      req.user.tenantId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/reopen')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.REOPEN_MEDICAL_RECORDS)
  async reopen(@Param('id') id: string, @Request() req: any) {
    return this.medicalRecordsService.reopen(
      id,
      req.user.sub,
      req.user.tenantId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DELETE_MEDICAL_RECORDS)
  async delete(@Param('id') id: string, @Request() req: any) {
    await this.medicalRecordsService.delete(
      id,
      req.user.tenantId,
      req.user.sub,
      req.ip,
      req.headers['user-agent'],
    );
    return { message: 'Historia clínica eliminada exitosamente' };
  }

  // Anamnesis endpoints
  @Post(':id/anamnesis')
  async createAnamnesis(
    @Param('id') medicalRecordId: string,
    @Body() createDto: CreateAnamnesisDto,
    @Request() req: any,
  ) {
    return this.anamnesisService.create(
      medicalRecordId,
      createDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  @Get(':id/anamnesis')
  async getAnamnesis(
    @Param('id') medicalRecordId: string,
    @Request() req: any,
  ) {
    return this.anamnesisService.findByMedicalRecord(
      medicalRecordId,
      req.user.tenantId,
    );
  }

  @Put(':id/anamnesis/:anamnesisId')
  async updateAnamnesis(
    @Param('anamnesisId') anamnesisId: string,
    @Body() updateDto: UpdateAnamnesisDto,
    @Request() req: any,
  ) {
    return this.anamnesisService.update(
      anamnesisId,
      updateDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  // Physical Exam endpoints
  @Post(':id/physical-exams')
  async createPhysicalExam(
    @Param('id') medicalRecordId: string,
    @Body() createDto: CreatePhysicalExamDto,
    @Request() req: any,
  ) {
    return this.physicalExamService.create(
      medicalRecordId,
      createDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  @Get(':id/physical-exams')
  async getPhysicalExams(
    @Param('id') medicalRecordId: string,
    @Request() req: any,
  ) {
    return this.physicalExamService.findByMedicalRecord(
      medicalRecordId,
      req.user.tenantId,
    );
  }

  @Put(':id/physical-exams/:examId')
  async updatePhysicalExam(
    @Param('examId') examId: string,
    @Body() updateDto: UpdatePhysicalExamDto,
    @Request() req: any,
  ) {
    return this.physicalExamService.update(
      examId,
      updateDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  // Diagnosis endpoints
  @Post(':id/diagnoses')
  async createDiagnosis(
    @Param('id') medicalRecordId: string,
    @Body() createDto: CreateDiagnosisDto,
    @Request() req: any,
  ) {
    return this.diagnosisService.create(
      medicalRecordId,
      createDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  @Get(':id/diagnoses')
  async getDiagnoses(
    @Param('id') medicalRecordId: string,
    @Request() req: any,
  ) {
    return this.diagnosisService.findByMedicalRecord(
      medicalRecordId,
      req.user.tenantId,
    );
  }

  @Put(':id/diagnoses/:diagnosisId')
  async updateDiagnosis(
    @Param('diagnosisId') diagnosisId: string,
    @Body() updateDto: UpdateDiagnosisDto,
    @Request() req: any,
  ) {
    return this.diagnosisService.update(
      diagnosisId,
      updateDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  // Evolution endpoints
  @Post(':id/evolutions')
  async createEvolution(
    @Param('id') medicalRecordId: string,
    @Body() createDto: CreateEvolutionDto,
    @Request() req: any,
  ) {
    return this.evolutionService.create(
      medicalRecordId,
      createDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  @Get(':id/evolutions')
  async getEvolutions(
    @Param('id') medicalRecordId: string,
    @Request() req: any,
  ) {
    return this.evolutionService.findByMedicalRecord(
      medicalRecordId,
      req.user.tenantId,
    );
  }

  @Put(':id/evolutions/:evolutionId')
  async updateEvolution(
    @Param('evolutionId') evolutionId: string,
    @Body() updateDto: UpdateEvolutionDto,
    @Request() req: any,
  ) {
    return this.evolutionService.update(
      evolutionId,
      updateDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  // ==================== ENDPOINTS DE CONSENTIMIENTOS ====================

  @Post(':id/consents')
  async createConsent(
    @Param('id') id: string,
    @Body() dto: any, // CreateConsentFromMedicalRecordDto
    @Request() req: any,
  ) {
    console.log('=== CONTROLADOR: POST /medical-records/:id/consents ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('medicalRecordId:', id);
    console.log('dto:', JSON.stringify(dto, null, 2));
    console.log('userId:', req.user?.sub);
    console.log('tenantId:', req.user?.tenantId);
    console.log('=== LLAMANDO A createConsentFromMedicalRecord ===');
    
    return this.medicalRecordsService.createConsentFromMedicalRecord(
      id,
      dto,
      req.user.sub,
      req.user.tenantId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get(':id/consents')
  async getConsents(@Param('id') id: string, @Request() req: any) {
    return this.medicalRecordsService.getConsents(id, req.user.tenantId);
  }

  @Post(':id/consents/:consentId/resend-email')
  async resendConsentEmail(
    @Param('id') id: string,
    @Param('consentId') consentId: string,
    @Request() req: any,
  ) {
    await this.medicalRecordsService.resendConsentEmail(
      id,
      consentId,
      req.user.tenantId,
    );
    return { message: 'Email reenviado exitosamente' };
  }

  @Delete(':id/consents/:consentId')
  async deleteConsent(
    @Param('id') id: string,
    @Param('consentId') consentId: string,
    @Request() req: any,
  ) {
    await this.medicalRecordsService.deleteConsent(
      id,
      consentId,
      req.user.tenantId,
      req.user.sub,
    );
    return { message: 'Consentimiento eliminado exitosamente' };
  }

  @Get(':id/consents/:consentId/pdf')
  async getConsentPdf(
    @Param('id') id: string,
    @Param('consentId') consentId: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    try {
      // Obtener el consentimiento
      const consent = await this.medicalRecordsService.getConsentById(
        id,
        consentId,
        req.user.tenantId,
      );

      if (!consent.pdfUrl) {
        return res.status(404).json({ message: 'PDF no encontrado' });
      }

      const filename = `consentimiento-hc-${consent.consentNumber || consentId}.pdf`;

      // Si la URL es de S3 (empieza con http), descargar el archivo
      if (consent.pdfUrl.startsWith('http')) {
        console.log(`Descargando PDF desde S3 para visualización: ${consent.pdfUrl}`);
        const pdfBuffer = await this.storageService.downloadFile(consent.pdfUrl);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        
        return res.send(pdfBuffer);
      } else {
        // Si es una ruta local (no debería pasar con S3, pero por compatibilidad)
        return res.status(400).json({ message: 'Formato de URL no soportado' });
      }
    } catch (error) {
      console.error('Error al servir PDF:', error);
      return res.status(500).json({ message: 'Error al cargar el PDF' });
    }
  }

  // ==================== ENDPOINTS PARA HC COMPLETA (PDF Y EMAIL) ====================

  @Get(':id/pdf')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.PREVIEW_MEDICAL_RECORDS)
  async getMedicalRecordPdf(
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.medicalRecordsService.generateMedicalRecordPDF(
        id,
        req.user.tenantId,
      );

      const medicalRecord = await this.medicalRecordsService.findOne(
        id,
        req.user.tenantId,
        req.user.sub,
      );

      const filename = `historia-clinica-${medicalRecord.recordNumber}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());

      return res.send(pdfBuffer);
    } catch (error) {
      console.error('Error al generar PDF de HC:', error);
      return res.status(500).json({ message: 'Error al generar el PDF' });
    }
  }

  @Post(':id/send-email')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.SEND_EMAIL_MEDICAL_RECORDS)
  async sendMedicalRecordEmail(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.medicalRecordsService.sendMedicalRecordEmail(
      id,
      req.user.tenantId,
    );
    return { message: 'Historia clínica enviada por email exitosamente' };
  }

  // ==================== ENDPOINTS DE ÓRDENES MÉDICAS ====================

  @Post(':id/orders')
  async createOrder(
    @Param('id') id: string,
    @Body() createDto: CreateMedicalOrderDto,
    @Request() req: any,
  ) {
    return this.medicalOrdersService.create(
      id,
      createDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  @Get(':id/orders')
  async getOrders(@Param('id') id: string, @Request() req: any) {
    return this.medicalOrdersService.findByMedicalRecord(id, req.user.tenantId);
  }

  @Put(':id/orders/:orderId')
  async updateOrder(
    @Param('orderId') orderId: string,
    @Body() updateDto: UpdateMedicalOrderDto,
    @Request() req: any,
  ) {
    return this.medicalOrdersService.update(
      orderId,
      updateDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  @Delete(':id/orders/:orderId')
  async deleteOrder(
    @Param('orderId') orderId: string,
    @Request() req: any,
  ) {
    await this.medicalOrdersService.delete(orderId, req.user.tenantId);
    return { message: 'Orden eliminada exitosamente' };
  }

  // ==================== ENDPOINTS DE PRESCRIPCIONES ====================

  @Post(':id/prescriptions')
  async createPrescription(
    @Param('id') id: string,
    @Body() createDto: CreatePrescriptionDto,
    @Request() req: any,
  ) {
    return this.prescriptionsService.create(
      id,
      createDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  @Get(':id/prescriptions')
  async getPrescriptions(@Param('id') id: string, @Request() req: any) {
    return this.prescriptionsService.findByMedicalRecord(id, req.user.tenantId);
  }

  @Put(':id/prescriptions/:prescriptionId')
  async updatePrescription(
    @Param('prescriptionId') prescriptionId: string,
    @Body() updateDto: UpdatePrescriptionDto,
    @Request() req: any,
  ) {
    return this.prescriptionsService.update(
      prescriptionId,
      updateDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  // ==================== ENDPOINTS DE PROCEDIMIENTOS ====================

  @Post(':id/procedures')
  async createProcedure(
    @Param('id') id: string,
    @Body() createDto: CreateProcedureDto,
    @Request() req: any,
  ) {
    return this.proceduresService.create(
      id,
      createDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  @Get(':id/procedures')
  async getProcedures(@Param('id') id: string, @Request() req: any) {
    return this.proceduresService.findByMedicalRecord(id, req.user.tenantId);
  }

  @Put(':id/procedures/:procedureId')
  async updateProcedure(
    @Param('procedureId') procedureId: string,
    @Body() updateDto: UpdateProcedureDto,
    @Request() req: any,
  ) {
    return this.proceduresService.update(
      procedureId,
      updateDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  // ==================== ENDPOINTS DE PLANES DE TRATAMIENTO ====================

  @Post(':id/treatment-plans')
  async createTreatmentPlan(
    @Param('id') id: string,
    @Body() createDto: CreateTreatmentPlanDto,
    @Request() req: any,
  ) {
    return this.treatmentPlansService.create(
      id,
      createDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  @Get(':id/treatment-plans')
  async getTreatmentPlans(@Param('id') id: string, @Request() req: any) {
    return this.treatmentPlansService.findByMedicalRecord(id, req.user.tenantId);
  }

  @Put(':id/treatment-plans/:planId')
  async updateTreatmentPlan(
    @Param('planId') planId: string,
    @Body() updateDto: UpdateTreatmentPlanDto,
    @Request() req: any,
  ) {
    return this.treatmentPlansService.update(
      planId,
      updateDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  // ==================== ENDPOINTS DE EPICRISIS ====================

  @Post(':id/epicrisis')
  async createEpicrisis(
    @Param('id') id: string,
    @Body() createDto: CreateEpicrisisDto,
    @Request() req: any,
  ) {
    return this.epicrisisService.create(
      id,
      createDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  @Get(':id/epicrisis')
  async getEpicrisis(@Param('id') id: string, @Request() req: any) {
    return this.epicrisisService.findByMedicalRecord(id, req.user.tenantId);
  }

  @Put(':id/epicrisis/:epicrisisId')
  async updateEpicrisis(
    @Param('epicrisisId') epicrisisId: string,
    @Body() updateDto: UpdateEpicrisisDto,
    @Request() req: any,
  ) {
    return this.epicrisisService.update(
      epicrisisId,
      updateDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  // ==================== ENDPOINTS DE DOCUMENTOS ====================

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
    @Request() req: any,
  ) {
    return this.medicalRecordDocumentsService.upload(
      id,
      file,
      uploadDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  @Get(':id/documents')
  async getDocuments(@Param('id') id: string, @Request() req: any) {
    return this.medicalRecordDocumentsService.findByMedicalRecord(
      id,
      req.user.tenantId,
    );
  }

  @Get(':id/documents/:documentId/download')
  async downloadDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    try {
      const document = await this.medicalRecordDocumentsService.findOne(
        documentId,
        req.user.tenantId,
      );

      const fileBuffer = await this.medicalRecordDocumentsService.downloadFile(
        document.fileUrl,
      );

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${document.fileName}"`,
      );
      res.setHeader('Content-Length', fileBuffer.length.toString());

      return res.send(fileBuffer);
    } catch (error) {
      console.error('Error al descargar documento:', error);
      return res.status(500).json({ message: 'Error al descargar el documento' });
    }
  }

  @Delete(':id/documents/:documentId')
  async deleteDocument(
    @Param('documentId') documentId: string,
    @Request() req: any,
  ) {
    await this.medicalRecordDocumentsService.delete(
      documentId,
      req.user.tenantId,
    );
    return { message: 'Documento eliminado exitosamente' };
  }

  // ==================== ENDPOINT PARA BUSCAR HC POR CLIENTE ====================

  @Get('client/:clientId')
  async findByClient(
    @Param('clientId') clientId: string,
    @Request() req: any,
  ) {
    return this.medicalRecordsService.findByClient(clientId, req.user.tenantId);
  }
}

