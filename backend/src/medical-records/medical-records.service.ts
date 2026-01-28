import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { MedicalRecordAudit } from './entities/medical-record-audit.entity';
import { MedicalRecordConsent } from './entities/medical-record-consent.entity';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto';
import { ClientsService } from '../clients/clients.service';
import { ClientDocumentType } from '../clients/entities/client.entity';
import { MRConsentTemplatesService } from '../medical-record-consent-templates/mr-consent-templates.service';
import { TemplateRendererService } from '../common/services/template-renderer.service';
import { MedicalRecordsPdfService } from './medical-records-pdf.service';
import { StorageService } from '../common/services/storage.service';
import { SettingsService } from '../settings/settings.service';
import { MailService } from '../mail/mail.service';
import { TenantsService } from '../tenants/tenants.service';
import { getPlanConfig } from '../tenants/plans.config';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
    @InjectRepository(MedicalRecordAudit)
    private auditRepository: Repository<MedicalRecordAudit>,
    @InjectRepository(MedicalRecordConsent)
    private medicalRecordConsentsRepository: Repository<MedicalRecordConsent>,
    private clientsService: ClientsService,
    private mrConsentTemplatesService: MRConsentTemplatesService,
    private templateRendererService: TemplateRendererService,
    private medicalRecordsPdfService: MedicalRecordsPdfService,
    private storageService: StorageService,
    private settingsService: SettingsService,
    private mailService: MailService,
    @Inject(forwardRef(() => TenantsService))
    private tenantsService: TenantsService,
  ) {}

  async create(
    createDto: CreateMedicalRecordDto,
    userId: string,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<MedicalRecord> {
    // Validar límite de historias clínicas del plan
    await this.checkMedicalRecordsLimit(tenantId);

    let clientId = createDto.clientId;

    // Si no se proporciona clientId pero sí clientData, crear o buscar el cliente
    if (!clientId && createDto.clientData) {
      const { fullName, documentType, documentNumber, email, phone } = createDto.clientData;

      // Buscar si ya existe un cliente con ese documento
      const existingClient = await this.clientsService.findByDocument(
        documentType as ClientDocumentType,
        documentNumber,
        tenantId,
      );

      if (existingClient) {
        // Si existe, usar ese cliente
        clientId = existingClient.id;
      } else {
        // Si no existe, crear nuevo cliente
        console.log('=== CREANDO NUEVO CLIENTE ===');
        console.log('tenantId:', tenantId);
        console.log('clientData:', { fullName, documentType, documentNumber, email, phone });
        
        const newClient = await this.clientsService.create(
          {
            fullName,
            documentType: documentType as ClientDocumentType,
            documentNumber,
            email,
            phone,
          },
          tenantId,
        );
        console.log('Cliente creado:', newClient.id);
        clientId = newClient.id;
      }
    }

    // Validar que tengamos un clientId
    if (!clientId) {
      throw new BadRequestException('Debe proporcionar clientId o clientData');
    }

    // Generar número único de HC
    const recordNumber = await this.generateRecordNumber(tenantId);

    const medicalRecord = this.medicalRecordsRepository.create({
      clientId,
      branchId: createDto.branchId,
      admissionDate: createDto.admissionDate,
      admissionType: createDto.admissionType,
      recordNumber,
      tenantId,
      createdBy: userId,
    });

    const saved = await this.medicalRecordsRepository.save(medicalRecord);

    // Auditoría
    await this.logAudit({
      action: 'create',
      entityType: 'medical_record',
      entityId: saved.id,
      medicalRecordId: saved.id,
      userId,
      tenantId,
      newValues: saved,
      ipAddress,
      userAgent,
    });

    return this.findOne(saved.id, tenantId, userId);
  }

  async findAll(
    tenantId: string,
    filters?: any,
  ): Promise<MedicalRecord[]> {
    const query = this.medicalRecordsRepository
      .createQueryBuilder('mr')
      .leftJoinAndSelect('mr.client', 'client')
      .leftJoinAndSelect('mr.branch', 'branch')
      .leftJoinAndSelect('mr.creator', 'creator')
      .where('mr.tenantId = :tenantId', { tenantId });

    if (filters?.clientId) {
      query.andWhere('mr.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters?.status) {
      query.andWhere('mr.status = :status', { status: filters.status });
    }

    if (filters?.dateFrom) {
      query.andWhere('mr.admissionDate >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      query.andWhere('mr.admissionDate <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters?.branchId) {
      query.andWhere('mr.branchId = :branchId', { branchId: filters.branchId });
    }

    return query
      .orderBy('mr.admissionDate', 'DESC')
      .take(filters?.limit || 50)
      .skip(filters?.offset || 0)
      .getMany();
  }

  async findOne(
    id: string,
    tenantId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<MedicalRecord> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id, tenantId },
      relations: [
        'client',
        'branch',
        'creator',
        'anamnesis',
        'anamnesis.creator',
        'physicalExams',
        'physicalExams.creator',
        'diagnoses',
        'diagnoses.creator',
        'evolutions',
        'evolutions.creator',
        'evolutions.signer',
        'consents',
        'consents.creator',
      ],
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    // Auditar acceso
    await this.logAudit({
      action: 'view',
      entityType: 'medical_record',
      entityId: id,
      medicalRecordId: id,
      userId,
      tenantId,
      ipAddress,
      userAgent,
    });

    return medicalRecord;
  }

  async update(
    id: string,
    updateDto: UpdateMedicalRecordDto,
    userId: string,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<MedicalRecord> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    if (medicalRecord.isLocked) {
      throw new ForbiddenException('Historia clínica bloqueada');
    }

    if (medicalRecord.status === 'closed') {
      throw new ForbiddenException('No se puede modificar una historia clínica cerrada');
    }

    const oldValues = { ...medicalRecord };

    Object.assign(medicalRecord, updateDto);
    const updated = await this.medicalRecordsRepository.save(medicalRecord);

    // Auditoría
    await this.logAudit({
      action: 'update',
      entityType: 'medical_record',
      entityId: id,
      medicalRecordId: id,
      userId,
      tenantId,
      oldValues,
      newValues: updated,
      ipAddress,
      userAgent,
    });

    return this.findOne(id, tenantId, userId);
  }

  async close(
    id: string,
    userId: string,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<MedicalRecord> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    medicalRecord.status = 'closed';
    medicalRecord.closedAt = new Date();
    medicalRecord.closedBy = userId;
    medicalRecord.isLocked = true;

    const updated = await this.medicalRecordsRepository.save(medicalRecord);

    // Auditoría
    await this.logAudit({
      action: 'close',
      entityType: 'medical_record',
      entityId: id,
      medicalRecordId: id,
      userId,
      tenantId,
      newValues: { status: 'closed', closedAt: updated.closedAt },
      ipAddress,
      userAgent,
    });

    return this.findOne(id, tenantId, userId);
  }

  private async generateRecordNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.medicalRecordsRepository.count({
      where: { tenantId },
    });

    return `HC-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  // Método para Super Admin: obtener todas las historias clínicas agrupadas por tenant
  async getAllGroupedByTenant() {
    const allRecords = await this.medicalRecordsRepository.find({
      relations: ['tenant', 'client', 'branch', 'creator'],
      order: {
        createdAt: 'DESC',
      },
    });

    // Agrupar por tenant
    const groupedMap = new Map<string, any>();

    allRecords.forEach(record => {
      const tenantId = record.tenantId;
      
      if (!groupedMap.has(tenantId)) {
        groupedMap.set(tenantId, {
          tenantId: record.tenant.id,
          tenantName: record.tenant.name,
          tenantSlug: record.tenant.slug,
          totalRecords: 0,
          activeRecords: 0,
          closedRecords: 0,
          archivedRecords: 0,
          records: [],
        });
      }

      const group = groupedMap.get(tenantId);
      group.totalRecords++;
      
      if (record.status === 'active') group.activeRecords++;
      else if (record.status === 'closed') group.closedRecords++;
      else if (record.status === 'archived') group.archivedRecords++;

      group.records.push({
        id: record.id,
        recordNumber: record.recordNumber,
        admissionDate: record.admissionDate,
        admissionType: record.admissionType,
        status: record.status,
        clientName: record.client.fullName,
        clientDocument: record.client.documentNumber,
        branchName: record.branch?.name || 'Sin sede',
        tenantName: record.tenant.name,
        tenantSlug: record.tenant.slug,
        createdAt: record.createdAt,
        createdBy: record.creator?.name || 'Desconocido',
      });
    });

    // Convertir Map a Array y ordenar por total de registros
    const grouped = Array.from(groupedMap.values())
      .sort((a, b) => b.totalRecords - a.totalRecords);

    return grouped;
  }

  // ==================== MÉTODOS DE CONSENTIMIENTOS ====================

  async createConsentFromMedicalRecord(
    medicalRecordId: string,
    dto: any, // CreateConsentFromMedicalRecordDto
    userId: string,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ consent: any; medicalRecordConsent: MedicalRecordConsent; pdfUrl?: string }> {
    try {
      console.log('=== CREAR CONSENTIMIENTO DESDE HC ===');
      console.log('medicalRecordId:', medicalRecordId);
      console.log('dto:', dto);
      console.log('tenantId:', tenantId);

      // 1. Verificar que la HC existe y pertenece al tenant
      const medicalRecord = await this.medicalRecordsRepository.findOne({
        where: { id: medicalRecordId, tenantId },
        relations: ['client', 'branch', 'tenant'],
      });

      console.log('medicalRecord encontrado:', !!medicalRecord);
      console.log('medicalRecord.tenant:', medicalRecord?.tenant);

      if (!medicalRecord) {
        throw new NotFoundException('Historia clínica no encontrada');
      }

      // 2. Verificar que la HC no esté cerrada
      if (medicalRecord.status === 'closed' || medicalRecord.isLocked) {
        throw new ForbiddenException(
          'No se pueden crear consentimientos en una HC cerrada',
        );
      }

      // 3. Obtener los IDs de las plantillas seleccionadas
      const templateIds = dto.templateIds || [];
      console.log('templateIds:', templateIds);
      
      if (templateIds.length === 0) {
        throw new BadRequestException('Debe seleccionar al menos una plantilla');
      }

      // 4. Obtener las plantillas desde la base de datos
      console.log('Obteniendo plantillas HC con tenantId:', tenantId);
      
      const templates = await Promise.all(
        templateIds.map(async (id) => {
          try {
            return await this.mrConsentTemplatesService.findOne(id, tenantId);
          } catch (error) {
            console.error(`Error al obtener plantilla HC ${id}:`, error);
            throw new NotFoundException(`Plantilla HC no encontrada: ${id}`);
          }
        }),
      );

      console.log('Plantillas HC obtenidas:', templates.length);

    // 5. Preparar variables para renderizado
    const variables = {
      clientName: medicalRecord.client.fullName,
      clientId: medicalRecord.client.documentNumber,
      clientEmail: medicalRecord.client.email || '',
      clientPhone: medicalRecord.client.phone || '',
      clientAddress: medicalRecord.client.address || '',
      branchName: medicalRecord.branch?.name || 'Sin sede',
      branchAddress: medicalRecord.branch?.address || '',
      branchPhone: medicalRecord.branch?.phone || '',
      branchEmail: medicalRecord.branch?.email || '',
      companyName: medicalRecord.tenant?.name || '',
      recordNumber: medicalRecord.recordNumber,
      admissionDate: this.formatDate(medicalRecord.admissionDate),
      procedureName: dto.procedureName || '',
      diagnosisCode: dto.diagnosisCode || '',
      diagnosisDescription: dto.diagnosisDescription || '',
      signDate: this.formatDate(new Date()),
      signTime: this.formatTime(new Date()),
      currentDate: this.formatDate(new Date()),
      currentYear: new Date().getFullYear().toString(),
    };

    // 6. Renderizar plantillas con variables
    const renderedTemplates = templates.map((template) => ({
      name: template.name,
      content: this.templateRendererService.render(template.content, variables),
    }));

    // 6.5. Cargar settings y seleccionar logos HC (con fallback a CN)
    const settings = await this.settingsService.getSettings(tenantId);
    const logoUrl = settings.hcLogoUrl || settings.logoUrl;
    const footerLogoUrl = settings.hcFooterLogoUrl || settings.footerLogoUrl;
    const watermarkLogoUrl = settings.hcWatermarkLogoUrl || settings.watermarkLogoUrl;
    const primaryColor = settings.primaryColor || '#3B82F6';

    console.log('Logos a usar en PDF HC:');
    console.log('  - Logo principal:', logoUrl ? 'Configurado' : 'No configurado');
    console.log('  - Logo footer:', footerLogoUrl ? 'Configurado' : 'No configurado');
    console.log('  - Marca de agua:', watermarkLogoUrl ? 'Configurado' : 'No configurado');
    console.log('  - Color primario:', primaryColor);

    // 7. Generar PDF compuesto con logos HC y datos del cliente
    const pdfBuffer = await this.medicalRecordsPdfService.generateCompositePDF(
      renderedTemplates,
      {
        clientName: medicalRecord.client.fullName,
        clientDocument: medicalRecord.client.documentNumber,
        clientEmail: medicalRecord.client.email,
        clientPhone: medicalRecord.client.phone,
        recordNumber: medicalRecord.recordNumber,
        admissionDate: this.formatDate(medicalRecord.admissionDate),
        branchName: medicalRecord.branch?.name,
        companyName: medicalRecord.tenant?.name,
        signatureData: dto.signatureData,
        clientPhoto: dto.clientPhoto,
        logoUrl,
        footerLogoUrl,
        watermarkLogoUrl,
        primaryColor,
        footerText: `${medicalRecord.tenant?.name || ''} - Documento generado electrónicamente`,
      },
    );

    // 8. Subir PDF a S3
    const timestamp = Date.now();
    const fileName = `consent-${timestamp}.pdf`;
    const folder = `consents/medical-records/${medicalRecordId}`;
    
    let pdfUrl: string | undefined;
    try {
      pdfUrl = await this.storageService.uploadBuffer(
        pdfBuffer,
        folder,
        fileName,
        'application/pdf',
      );
    } catch (error) {
      console.error('Error al subir PDF a S3:', error);
      // Continuar sin URL si falla la subida
    }

    // 9. Crear el consentimiento (objeto temporal, no se guarda en tabla consents)
    const consentNumber = `CONS-${medicalRecord.recordNumber}-${timestamp}`;
    
    // Generar un UUID válido para el consentimiento temporal
    const crypto = require('crypto');
    const consentId = crypto.randomUUID();
    
    const consent = {
      id: consentId,
      consentNumber,
      status: 'generated',
      clientId: medicalRecord.clientId,
      clientName: medicalRecord.client?.fullName,
      procedureName: dto.procedureName,
      diagnosisCode: dto.diagnosisCode,
      diagnosisDescription: dto.diagnosisDescription,
      templateIds: templateIds,
      templateCount: templateIds.length,
      templateNames: templates.map((t) => t.name),
      pdfUrl,
      generatedAt: new Date(),
    };

    // 10. Crear la relación HC-Consentimiento
    // IMPORTANTE: No guardamos consentId porque no existe en la tabla consents
    // Los consentimientos de HC son independientes de los consentimientos tradicionales
    console.log('Creando medical_record_consent con userId:', userId);
    
    const medicalRecordConsent = this.medicalRecordConsentsRepository.create({
      medicalRecordId,
      consentId: null, // No guardar FK a consents, estos son consentimientos HC independientes
      pdfUrl, // Guardar URL del PDF generado
      consentNumber, // Guardar número de consentimiento
      consentMetadata: { // Guardar metadata del consentimiento
        templateIds: templateIds,
        templateCount: templateIds.length,
        templateNames: templates.map((t) => t.name),
        generatedAt: new Date(),
      },
      evolutionId: dto.evolutionId || null,
      createdDuringConsultation: true,
      requiredForProcedure: dto.requiredForProcedure || false,
      procedureName: dto.procedureName || null,
      diagnosisCode: dto.diagnosisCode || null,
      diagnosisDescription: dto.diagnosisDescription || null,
      notes: dto.notes || null,
      createdBy: userId,
    });

    console.log('medicalRecordConsent antes de guardar:', medicalRecordConsent);

    const saved = await this.medicalRecordConsentsRepository.save(
      medicalRecordConsent,
    );

    // 11. Registrar en auditoría
    await this.logAudit({
      medicalRecordId,
      action: 'CREATE_CONSENT',
      entityType: 'medical_record_consent',
      entityId: saved.id,
      newValues: {
        consentNumber,
        pdfUrl,
        procedureName: dto.procedureName,
        templateIds: templateIds,
        templateCount: templateIds.length,
        templateNames: templates.map((t) => t.name),
      },
      userId,
      tenantId,
      ipAddress,
      userAgent,
    });

    // 12. Enviar email al paciente con el PDF
    if (medicalRecord.client.email && pdfUrl) {
      try {
        console.log('Enviando email al paciente:', medicalRecord.client.email);
        await this.mailService.sendMedicalRecordConsentEmail({
          to: medicalRecord.client.email,
          clientName: medicalRecord.client.fullName,
          consentNumber,
          pdfUrl,
          companyName: medicalRecord.tenant?.name || '',
        });
        console.log('Email enviado exitosamente');
      } catch (emailError) {
        console.error('Error al enviar email:', emailError);
        // No lanzar error, el consentimiento ya fue creado
      }
    }

    console.log('=== CONSENTIMIENTO CREADO EXITOSAMENTE ===');
    return { consent, medicalRecordConsent: saved, pdfUrl };
    } catch (error) {
      console.error('=== ERROR AL CREAR CONSENTIMIENTO ===');
      console.error('Error:', error);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async getConsents(
    medicalRecordId: string,
    tenantId: string,
  ): Promise<MedicalRecordConsent[]> {
    // Verificar que la HC existe
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    // No cargar la relación 'consent' porque puede ser un placeholder temporal
    return await this.medicalRecordConsentsRepository.find({
      where: { medicalRecordId },
      relations: ['creator', 'evolution'],
      order: { createdAt: 'DESC' },
    });
  }

  async resendConsentEmail(
    medicalRecordId: string,
    consentId: string,
    tenantId: string,
  ): Promise<void> {
    // Verificar que la HC existe
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId, tenantId },
      relations: ['client', 'tenant'],
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    // Buscar el consentimiento
    const consent = await this.medicalRecordConsentsRepository.findOne({
      where: { id: consentId, medicalRecordId },
    });

    if (!consent) {
      throw new NotFoundException('Consentimiento no encontrado');
    }

    if (!consent.pdfUrl) {
      throw new BadRequestException('El consentimiento no tiene PDF generado');
    }

    if (!medicalRecord.client.email) {
      throw new BadRequestException('El paciente no tiene email registrado');
    }

    // Enviar email
    await this.mailService.sendMedicalRecordConsentEmail({
      to: medicalRecord.client.email,
      clientName: medicalRecord.client.fullName,
      consentNumber: consent.consentNumber,
      pdfUrl: consent.pdfUrl,
      companyName: medicalRecord.tenant?.name || '',
    });
  }

  async deleteConsent(
    medicalRecordId: string,
    consentId: string,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    // Verificar que la HC existe
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    if (medicalRecord.isLocked || medicalRecord.status === 'closed') {
      throw new ForbiddenException(
        'No se pueden eliminar consentimientos de una HC cerrada o bloqueada',
      );
    }

    // Buscar el consentimiento
    const consent = await this.medicalRecordConsentsRepository.findOne({
      where: { id: consentId, medicalRecordId },
    });

    if (!consent) {
      throw new NotFoundException('Consentimiento no encontrado');
    }

    // Eliminar el consentimiento
    await this.medicalRecordConsentsRepository.remove(consent);

    // Auditar eliminación
    await this.logAudit({
      medicalRecordId,
      action: 'DELETE_CONSENT',
      entityType: 'medical_record_consent',
      entityId: consentId,
      oldValues: consent,
      userId,
      tenantId,
    });
  }

  async getConsentById(
    medicalRecordId: string,
    consentId: string,
    tenantId: string,
  ): Promise<MedicalRecordConsent> {
    // Verificar que la HC existe
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    // Buscar el consentimiento
    const consent = await this.medicalRecordConsentsRepository.findOne({
      where: { id: consentId, medicalRecordId },
    });

    if (!consent) {
      throw new NotFoundException('Consentimiento no encontrado');
    }

    return consent;
  }

  private async logAudit(data: {
    action: string;
    entityType: string;
    entityId?: string;
    medicalRecordId?: string;
    userId: string;
    tenantId: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const audit = this.auditRepository.create(data);
    await this.auditRepository.save(audit);
  }

  /**
   * Valida que el tenant no haya excedido el límite de historias clínicas de su plan
   */
  private async checkMedicalRecordsLimit(tenantId: string): Promise<void> {
    const tenant = await this.tenantsService.findOne(tenantId);
    const plan = getPlanConfig(tenant.plan);
    
    if (!plan) {
      throw new BadRequestException('Plan no encontrado');
    }

    // Si el límite es -1, es ilimitado
    if (plan.limits.medicalRecords === -1) {
      return;
    }
    
    // Contar historias clínicas del tenant
    const count = await this.medicalRecordsRepository.count({
      where: { tenantId }
    });
    
    if (count >= plan.limits.medicalRecords) {
      throw new BadRequestException(
        `Has alcanzado el límite de ${plan.limits.medicalRecords} historias clínicas de tu plan ${plan.name}. Actualiza tu plan para crear más.`
      );
    }
  }

  /**
   * Obtener estadísticas de historias clínicas
   */
  async getStatistics(tenantId: string) {
    // Total de historias clínicas
    const total = await this.medicalRecordsRepository.count({
      where: { tenantId },
    });

    // Historias clínicas activas (status = OPEN)
    const active = await this.medicalRecordsRepository.count({
      where: { tenantId, status: 'OPEN' },
    });

    // Historias clínicas cerradas (status = CLOSED)
    const closed = await this.medicalRecordsRepository.count({
      where: { tenantId, status: 'CLOSED' },
    });

    // Historias clínicas por fecha (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const byDate = await this.medicalRecordsRepository
      .createQueryBuilder('mr')
      .select('DATE(mr."created_at")', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('mr."tenantId" = :tenantId', { tenantId })
      .andWhere('mr."created_at" >= :date', { date: thirtyDaysAgo })
      .groupBy('DATE(mr."created_at")')
      .orderBy('DATE(mr."created_at")', 'ASC')
      .getRawMany();

    // Historias clínicas por sede
    const byBranch = await this.medicalRecordsRepository
      .createQueryBuilder('mr')
      .leftJoin('mr.branch', 'branch')
      .select('branch.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .where('mr.tenantId = :tenantId', { tenantId })
      .groupBy('branch.id')
      .getRawMany();

    // Total de consentimientos generados desde HC
    const totalConsents = await this.medicalRecordConsentsRepository
      .createQueryBuilder('consent')
      .innerJoin('consent.medicalRecord', 'mr')
      .where('mr.tenantId = :tenantId', { tenantId })
      .getCount();

    // Historias clínicas recientes
    const recent = await this.medicalRecordsRepository.find({
      where: { tenantId },
      relations: ['client', 'branch'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      total,
      active,
      closed,
      byDate: byDate.map(item => ({
        date: item.date,
        count: parseInt(item.count),
      })),
      byBranch: byBranch.map(item => ({
        name: item.name || 'Sin sede',
        count: parseInt(item.count),
      })),
      totalConsents,
      recent: recent.map(mr => ({
        id: mr.id,
        recordNumber: mr.recordNumber,
        clientName: mr.client?.fullName || 'N/A',
        branch: mr.branch?.name || 'N/A',
        status: mr.status,
        createdAt: mr.createdAt,
      })),
    };
  }
}
