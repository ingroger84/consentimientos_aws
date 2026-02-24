import { Injectable, NotFoundException, ForbiddenException, BadRequestException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
import { AdmissionsService } from './admissions.service';

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
    @Inject(forwardRef(() => AdmissionsService))
    private admissionsService: AdmissionsService,
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

    // ⚠️ VALIDACIÓN CRÍTICA: Verificar que el paciente NO tenga ya una HC activa
    // Normativa colombiana: Una historia clínica por paciente por IPS
    const existingActiveHC = await this.medicalRecordsRepository.findOne({
      where: { 
        clientId, 
        tenantId, 
        status: In(['active']) 
      }
    });

    if (existingActiveHC) {
      throw new BadRequestException(
        `El paciente ya tiene una historia clínica activa: ${existingActiveHC.recordNumber}. ` +
        `No se puede crear una nueva HC mientras exista una activa. ` +
        `Si desea continuar la atención, use la HC existente o ciérrela primero.`
      );
    }

    // Verificar si tiene HC cerradas (informar al usuario)
    const existingClosedHC = await this.medicalRecordsRepository.findOne({
      where: { 
        clientId, 
        tenantId, 
        status: 'closed' 
      },
      order: { closedAt: 'DESC' }
    });

    if (existingClosedHC) {
      console.log(
        `INFO: El paciente tiene una HC cerrada: ${existingClosedHC.recordNumber}. ` +
        `Considere reabrirla en lugar de crear una nueva.`
      );
    }

    // Retry logic para manejar race conditions en la generación de números
    let saved: MedicalRecord;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
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

        saved = await this.medicalRecordsRepository.save(medicalRecord);
        break; // Éxito, salir del loop
      } catch (error) {
        attempts++;
        
        // Si es error de clave duplicada y aún tenemos intentos, reintentar
        if (error.code === '23505' && error.constraint === 'medical_records_record_number_key' && attempts < maxAttempts) {
          console.log(`⚠️ Número de HC duplicado detectado, reintentando... (intento ${attempts}/${maxAttempts})`);
          // Esperar un poco antes de reintentar (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          continue;
        }
        
        // Si no es error de duplicado o ya no hay más intentos, lanzar el error
        throw error;
      }
    }

    if (!saved) {
      throw new InternalServerErrorException('No se pudo generar un número único de historia clínica después de varios intentos');
    }

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

    // ✅ CREAR AUTOMÁTICAMENTE LA PRIMERA ADMISIÓN
    // Cuando se crea una HC nueva, se debe crear automáticamente la primera admisión
    // con el tipo seleccionado en el formulario
    try {
      console.log('=== CREANDO PRIMERA ADMISIÓN AUTOMÁTICA ===');
      console.log('HC ID:', saved.id);
      console.log('Tipo de admisión:', createDto.admissionType);
      
      await this.admissionsService.create(
        {
          medicalRecordId: saved.id,
          admissionDate: createDto.admissionDate,
          admissionType: createDto.admissionType as any,
          reason: 'Primera admisión - Apertura de Historia Clínica',
        },
        userId,
        tenantId,
      );
      
      console.log('✅ Primera admisión creada exitosamente');
    } catch (error) {
      console.error('❌ Error al crear primera admisión:', error);
      // No lanzar error, la HC ya fue creada exitosamente
      // Solo registrar el error para debugging
    }

    return this.findOne(saved.id, tenantId, userId);
  }

  async findByClient(
      clientId: string,
      tenantId: string,
      userId?: string,
      filters?: { status?: string },
    ): Promise<MedicalRecord[]> {
      const where: any = { clientId, tenantId };

      // Agregar filtro de status si se proporciona
      if (filters?.status) {
        where.status = filters.status;
      }

      return this.medicalRecordsRepository.find({
        where,
        relations: ['client', 'branch', 'creator', 'closer'],
        order: { createdAt: 'DESC' },
      });
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
      .where('mr.tenant_id = :tenantId', { tenantId });

    if (filters?.clientId) {
      query.andWhere('mr.client_id = :clientId', { clientId: filters.clientId });
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
      query.andWhere('mr.branch_id = :branchId', { branchId: filters.branchId });
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
    // Si tenantId es null (Super Admin), buscar sin restricción de tenant
    const whereCondition = tenantId ? { id, tenantId } : { id };
    
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: whereCondition,
      relations: [
        'client',
        'branch',
        'creator',
        'closer',
        'admissions',
        'admissions.creator',
        'admissions.anamnesis',
        'admissions.physicalExams',
        'admissions.diagnoses',
        'admissions.evolutions',
        'admissions.evolutions.creator',
        'admissions.consents',
        'admissions.consents.creator',
        'anamnesis',
        'physicalExams',
        'diagnoses',
        'evolutions',
        'evolutions.creator',
        'consents',
        'consents.creator',
      ],
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    // Auditar acceso - usar el tenantId de la HC encontrada
    await this.logAudit({
      action: 'view',
      entityType: 'medical_record',
      entityId: id,
      medicalRecordId: id,
      userId,
      tenantId: medicalRecord.tenantId, // Usar el tenantId de la HC
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

    if (medicalRecord.status === 'closed') {
      throw new BadRequestException('La historia clínica ya está cerrada');
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

  async archive(
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

    if (medicalRecord.status === 'archived') {
      throw new BadRequestException('La historia clínica ya está archivada');
    }

    const oldStatus = medicalRecord.status;
    medicalRecord.status = 'archived';
    medicalRecord.isLocked = true;

    const updated = await this.medicalRecordsRepository.save(medicalRecord);

    // Auditoría
    await this.logAudit({
      action: 'archive',
      entityType: 'medical_record',
      entityId: id,
      medicalRecordId: id,
      userId,
      tenantId,
      oldValues: { status: oldStatus },
      newValues: { status: 'archived' },
      ipAddress,
      userAgent,
    });

    return this.findOne(id, tenantId, userId);
  }

  async reopen(
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

    if (medicalRecord.status === 'active') {
      throw new BadRequestException('La historia clínica ya está activa');
    }

    const oldStatus = medicalRecord.status;
    medicalRecord.status = 'active';
    medicalRecord.isLocked = false;
    medicalRecord.closedAt = null;
    medicalRecord.closedBy = null;

    const updated = await this.medicalRecordsRepository.save(medicalRecord);

    // Auditoría
    await this.logAudit({
      action: 'reopen',
      entityType: 'medical_record',
      entityId: id,
      medicalRecordId: id,
      userId,
      tenantId,
      oldValues: { status: oldStatus },
      newValues: { status: 'active', isLocked: false },
      ipAddress,
      userAgent,
    });

    return this.findOne(id, tenantId, userId);
  }

  async delete(
    id: string,
    tenantId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id, tenantId },
      relations: ['consents'],
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    // Validar que la HC no esté cerrada (solo se pueden eliminar HC activas o archivadas)
    if (medicalRecord.status === 'closed') {
      throw new ForbiddenException(
        'No se puede eliminar una historia clínica cerrada. Debe archivarla en su lugar.',
      );
    }

    // Guardar datos para auditoría antes de eliminar
    const oldValues = { ...medicalRecord };

    // Eliminar consentimientos asociados primero
    // Auditoría ANTES de eliminar (para evitar error de foreign key)
    await this.logAudit({
      action: 'delete',
      entityType: 'medical_record',
      entityId: id,
      medicalRecordId: id,
      userId,
      tenantId,
      oldValues,
      ipAddress,
      userAgent,
    });

    // Eliminar consentimientos asociados
    if (medicalRecord.consents && medicalRecord.consents.length > 0) {
      await this.medicalRecordConsentsRepository.remove(medicalRecord.consents);
    }

    // Eliminar la historia clínica
    await this.medicalRecordsRepository.remove(medicalRecord);
  }

  private async generateRecordNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    
    // Usar MAX para obtener el último número de forma atómica
    // Esto evita race conditions cuando múltiples usuarios crean HCs simultáneamente
    const lastRecord = await this.medicalRecordsRepository
      .createQueryBuilder('mr')
      .select('MAX(mr.recordNumber)', 'maxNumber')
      .where('mr.tenantId = :tenantId', { tenantId })
      .andWhere('mr.recordNumber LIKE :pattern', { pattern: `HC-${year}-%` })
      .getRawOne();

    let nextNumber = 1;
    
    if (lastRecord?.maxNumber) {
      // Extraer el número del formato HC-2026-000004
      const match = lastRecord.maxNumber.match(/HC-\d{4}-(\d{6})/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `HC-${year}-${nextNumber.toString().padStart(6, '0')}`;
  }

  // Método para Super Admin: obtener todas las historias clínicas agrupadas por tenant
  async getAllGroupedByTenant() {
    const allRecords = await this.medicalRecordsRepository.find({
      relations: ['tenant', 'client', 'branch', 'creator', 'closer'],
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
    console.log('admissionId recibido:', dto.admissionId);
    
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
      admissionId: dto.admissionId || null, // ✅ AGREGAR: Guardar el admissionId si se proporciona
      createdDuringConsultation: true,
      requiredForProcedure: dto.requiredForProcedure || false,
      procedureName: dto.procedureName || null,
      diagnosisCode: dto.diagnosisCode || null,
      diagnosisDescription: dto.diagnosisDescription || null,
      notes: dto.notes || null,
      createdBy: userId, // Agregar el usuario que creó el consentimiento
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

  /**
   * Formatea los signos vitales de forma legible en español
   */
  private formatVitalSigns(vitalSigns: Record<string, any>): string {
    const labels: Record<string, string> = {
      height: 'Altura',
      weight: 'Peso',
      heartRate: 'Frecuencia Cardíaca',
      temperature: 'Temperatura',
      respiratoryRate: 'Frecuencia Respiratoria',
      oxygenSaturation: 'Saturación de Oxígeno',
      bloodPressureSystolic: 'Presión Arterial Sistólica',
      bloodPressureDiastolic: 'Presión Arterial Diastólica',
      bloodPressure: 'Presión Arterial',
      pulse: 'Pulso',
      bmi: 'Índice de Masa Corporal',
    };

    const units: Record<string, string> = {
      height: 'cm',
      weight: 'kg',
      heartRate: 'lpm',
      temperature: '°C',
      respiratoryRate: 'rpm',
      oxygenSaturation: '%',
      bloodPressureSystolic: 'mmHg',
      bloodPressureDiastolic: 'mmHg',
      bloodPressure: 'mmHg',
      pulse: 'lpm',
      bmi: 'kg/m²',
    };

    let formatted = '';
    
    // Si hay presión arterial sistólica y diastólica, combinarlas
    if (vitalSigns.bloodPressureSystolic && vitalSigns.bloodPressureDiastolic) {
      formatted += `• Presión Arterial: ${vitalSigns.bloodPressureSystolic}/${vitalSigns.bloodPressureDiastolic} mmHg\n`;
    }

    // Procesar el resto de signos vitales
    for (const [key, value] of Object.entries(vitalSigns)) {
      // Saltar si ya procesamos la presión arterial
      if (key === 'bloodPressureSystolic' || key === 'bloodPressureDiastolic') {
        continue;
      }

      if (value !== null && value !== undefined && value !== '') {
        const label = labels[key] || key;
        const unit = units[key] || '';
        formatted += `• ${label}: ${value}${unit ? ' ' + unit : ''}\n`;
      }
    }

    return formatted || 'No se registraron signos vitales';
  }

  /**
   * Formatea la revisión por sistemas de forma legible en español
   */
  private formatSystemsReview(systemsReview: Record<string, any>): string {
    const systemLabels: Record<string, string> = {
      cardiovascular: 'Sistema Cardiovascular',
      respiratory: 'Sistema Respiratorio',
      gastrointestinal: 'Sistema Gastrointestinal',
      genitourinary: 'Sistema Genitourinario',
      musculoskeletal: 'Sistema Musculoesquelético',
      neurological: 'Sistema Neurológico',
      skin: 'Piel y Anexos',
      endocrine: 'Sistema Endocrino',
      hematologic: 'Sistema Hematológico',
      psychiatric: 'Sistema Psiquiátrico',
      eyes: 'Ojos',
      ears: 'Oídos',
      nose: 'Nariz',
      throat: 'Garganta',
      head: 'Cabeza',
      neck: 'Cuello',
      chest: 'Tórax',
      abdomen: 'Abdomen',
      extremities: 'Extremidades',
    };

    let formatted = '';

    for (const [key, value] of Object.entries(systemsReview)) {
      if (value !== null && value !== undefined && value !== '') {
        const label = systemLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);
        formatted += `• ${label}: ${value}\n`;
      }
    }

    return formatted || 'No se registró revisión por sistemas';
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
      relations: ['evolution'],
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

  // ==================== MÉTODOS PARA PDF Y EMAIL DE HC COMPLETA ====================

  /**
   * Genera un PDF completo de la Historia Clínica con toda la información recopilada
   */
  async generateMedicalRecordPDF(
    medicalRecordId: string,
    tenantId: string,
  ): Promise<Buffer> {
    // Obtener la HC completa con todas sus relaciones
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId, tenantId },
      relations: [
        'client',
        'branch',
        'tenant',
        'creator',
        'closer',
        'anamnesis',
        'physicalExams',
        'diagnoses',
        'evolutions',
        'evolutions.creator',
      ],
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    // Cargar settings para logos
    const settings = await this.settingsService.getSettings(tenantId);
    const logoUrl = settings.hcLogoUrl || settings.logoUrl;
    const footerLogoUrl = settings.hcFooterLogoUrl || settings.footerLogoUrl;
    const watermarkLogoUrl = settings.hcWatermarkLogoUrl || settings.watermarkLogoUrl;
    const primaryColor = settings.primaryColor || '#3B82F6';

    // Construir el contenido de la HC como plantillas
    const templates = [];

    // 1. Información General
    let generalInfo = `HISTORIA CLÍNICA\n\n`;
    generalInfo += `Número de HC: ${medicalRecord.recordNumber}\n`;
    generalInfo += `Fecha de Admisión: ${this.formatDate(medicalRecord.admissionDate)}\n`;
    generalInfo += `Tipo de Admisión: ${this.getAdmissionTypeText(medicalRecord.admissionType)}\n`;
    generalInfo += `Estado: ${this.getStatusText(medicalRecord.status)}\n\n`;
    
    if (medicalRecord.branch) {
      generalInfo += `Sede: ${medicalRecord.branch.name}\n`;
      if (medicalRecord.branch.address) generalInfo += `Dirección: ${medicalRecord.branch.address}\n`;
      if (medicalRecord.branch.phone) generalInfo += `Teléfono: ${medicalRecord.branch.phone}\n`;
    }

    templates.push({
      name: 'Información General',
      content: generalInfo,
    });

    // 2. Anamnesis
    if (medicalRecord.anamnesis && medicalRecord.anamnesis.length > 0) {
      medicalRecord.anamnesis.forEach((anamnesis, index) => {
        let anamnesisContent = `Fecha: ${this.formatDate(anamnesis.createdAt)}\n\n`;
        
        if (anamnesis.chiefComplaint) {
          anamnesisContent += `MOTIVO DE CONSULTA\n${anamnesis.chiefComplaint}\n\n`;
        }
        
        if (anamnesis.currentIllness) {
          anamnesisContent += `ENFERMEDAD ACTUAL\n${anamnesis.currentIllness}\n\n`;
        }
        
        if (anamnesis.personalHistory) {
          anamnesisContent += `ANTECEDENTES PERSONALES\n${anamnesis.personalHistory}\n\n`;
        }
        
        if (anamnesis.familyHistory) {
          anamnesisContent += `ANTECEDENTES FAMILIARES\n${anamnesis.familyHistory}\n\n`;
        }
        
        if (anamnesis.allergies) {
          anamnesisContent += `ALERGIAS\n${anamnesis.allergies}\n\n`;
        }
        
        if (anamnesis.currentMedications) {
          anamnesisContent += `MEDICAMENTOS ACTUALES\n${anamnesis.currentMedications}\n\n`;
        }

        templates.push({
          name: `Anamnesis ${index + 1}`,
          content: anamnesisContent,
        });
      });
    }

    // 3. Examen Físico
    if (medicalRecord.physicalExams && medicalRecord.physicalExams.length > 0) {
      medicalRecord.physicalExams.forEach((exam, index) => {
        let examContent = `Fecha: ${this.formatDate(exam.createdAt)}\n\n`;
        
        if (exam.vitalSigns) {
          examContent += `SIGNOS VITALES\n${this.formatVitalSigns(exam.vitalSigns)}\n\n`;
        }
        
        if (exam.generalAppearance) {
          examContent += `APARIENCIA GENERAL\n${exam.generalAppearance}\n\n`;
        }
        
        if (exam.systemsReview) {
          examContent += `REVISIÓN POR SISTEMAS\n${this.formatSystemsReview(exam.systemsReview)}\n\n`;
        }
        
        if (exam.findings) {
          examContent += `HALLAZGOS\n${exam.findings}\n\n`;
        }

        templates.push({
          name: `Examen Físico ${index + 1}`,
          content: examContent,
        });
      });
    }

    // 4. Diagnósticos
    if (medicalRecord.diagnoses && medicalRecord.diagnoses.length > 0) {
      let diagnosesContent = '';
      
      medicalRecord.diagnoses.forEach((diagnosis, index) => {
        diagnosesContent += `${index + 1}. ${diagnosis.code} - ${diagnosis.description}\n`;
        diagnosesContent += `   Tipo: ${diagnosis.diagnosisType}\n`;
        if (diagnosis.notes) {
          diagnosesContent += `   Notas: ${diagnosis.notes}\n`;
        }
        diagnosesContent += `   Fecha: ${this.formatDate(diagnosis.createdAt)}\n\n`;
      });

      templates.push({
        name: 'Diagnósticos',
        content: diagnosesContent,
      });
    }

    // 5. Evoluciones
    if (medicalRecord.evolutions && medicalRecord.evolutions.length > 0) {
      medicalRecord.evolutions.forEach((evolution, index) => {
        let evolutionContent = `Fecha: ${this.formatDate(evolution.evolutionDate)}\n`;
        if (evolution.creator) {
          evolutionContent += `Profesional: ${evolution.creator.name}\n\n`;
        }
        
        if (evolution.subjective) {
          evolutionContent += `SUBJETIVO (S):\n${evolution.subjective}\n\n`;
        }
        
        if (evolution.objective) {
          evolutionContent += `OBJETIVO (O):\n${evolution.objective}\n\n`;
        }
        
        if (evolution.assessment) {
          evolutionContent += `ANÁLISIS (A):\n${evolution.assessment}\n\n`;
        }
        
        if (evolution.plan) {
          evolutionContent += `PLAN (P):\n${evolution.plan}\n\n`;
        }

        templates.push({
          name: `Evolución ${index + 1}`,
          content: evolutionContent,
        });
      });
    }

    // Si no hay contenido, agregar mensaje
    if (templates.length === 1) {
      templates.push({
        name: 'Información',
        content: 'Esta historia clínica aún no tiene información clínica registrada.',
      });
    }

    // Generar PDF
    const pdfBuffer = await this.medicalRecordsPdfService.generateCompositePDF(
      templates,
      {
        clientName: medicalRecord.client.fullName,
        clientDocument: medicalRecord.client.documentNumber,
        clientEmail: medicalRecord.client.email,
        clientPhone: medicalRecord.client.phone,
        recordNumber: medicalRecord.recordNumber,
        admissionDate: this.formatDate(medicalRecord.admissionDate),
        branchName: medicalRecord.branch?.name,
        companyName: medicalRecord.tenant?.name,
        logoUrl,
        footerLogoUrl,
        watermarkLogoUrl,
        primaryColor,
        footerText: `${medicalRecord.tenant?.name || ''} - Historia Clínica Electrónica`,
      },
    );

    return pdfBuffer;
  }

  /**
   * Envía la Historia Clínica completa por email
   */
  async sendMedicalRecordEmail(
    medicalRecordId: string,
    tenantId: string,
  ): Promise<void> {
    // Obtener la HC
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId, tenantId },
      relations: ['client', 'tenant'],
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    if (!medicalRecord.client.email) {
      throw new BadRequestException('El paciente no tiene email registrado');
    }

    // Generar PDF usando el método que ya formatea correctamente
    const pdfBuffer = await this.generateMedicalRecordPDF(medicalRecordId, tenantId);

    // Subir PDF a S3
    const timestamp = Date.now();
    const fileName = `historia-clinica-${medicalRecord.recordNumber}-${timestamp}.pdf`;
    const folder = `medical-records/${medicalRecordId}`;
    
    const pdfUrl = await this.storageService.uploadBuffer(
      pdfBuffer,
      folder,
      fileName,
      'application/pdf',
    );

    // Enviar email
    await this.mailService.sendMedicalRecordEmail({
      to: medicalRecord.client.email,
      clientName: medicalRecord.client.fullName,
      recordNumber: medicalRecord.recordNumber,
      pdfUrl,
      companyName: medicalRecord.tenant?.name || '',
    });
  }

  private getAdmissionTypeText(type: string): string {
    const types = {
      consulta: 'Consulta',
      urgencia: 'Urgencia',
      hospitalizacion: 'Hospitalización',
      control: 'Control',
    };
    return types[type] || type;
  }

  private getStatusText(status: string): string {
    const statuses = {
      active: 'Activa',
      closed: 'Cerrada',
      archived: 'Archivada',
    };
    return statuses[status] || status;
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
    // Combinar oldValues y newValues en un solo objeto changes
    const changes: any = {};
    if (data.oldValues) {
      changes.oldValues = data.oldValues;
    }
    if (data.newValues) {
      changes.newValues = data.newValues;
    }

    const audit = this.auditRepository.create({
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      medicalRecordId: data.medicalRecordId,
      tenantId: data.tenantId,
      performedBy: data.userId,
      changes: Object.keys(changes).length > 0 ? changes : null,
    });
    
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
      .where('mr."tenant_id" = :tenantId', { tenantId })
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
      .where('mr."tenant_id" = :tenantId', { tenantId })
      .groupBy('branch.id')
      .getRawMany();

    // Total de consentimientos generados desde HC
    const totalConsents = await this.medicalRecordConsentsRepository
      .createQueryBuilder('consent')
      .innerJoin('consent.medicalRecord', 'mr')
      .where('mr.tenant_id = :tenantId', { tenantId })
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
