import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { MRConsentTemplate } from './entities/mr-consent-template.entity';
import { CreateMRConsentTemplateDto } from './dto/create-mr-consent-template.dto';
import { UpdateMRConsentTemplateDto } from './dto/update-mr-consent-template.dto';
import { TenantsService } from '../tenants/tenants.service';
import { getPlanConfig } from '../tenants/plans.config';

@Injectable()
export class MRConsentTemplatesService {
  constructor(
    @InjectRepository(MRConsentTemplate)
    private templatesRepository: Repository<MRConsentTemplate>,
    @Inject(forwardRef(() => TenantsService))
    private tenantsService: TenantsService,
  ) {}

  /**
   * Crear una nueva plantilla
   */
  async create(
    createDto: CreateMRConsentTemplateDto,
    tenantId: string | null,
    userId: string,
  ): Promise<MRConsentTemplate> {
    // Validar límite de plantillas HC si es un tenant (no Super Admin)
    if (tenantId) {
      await this.checkTemplatesLimit(tenantId);
    }

    const template = this.templatesRepository.create({
      ...createDto,
      tenantId,
      createdBy: userId,
    });

    return await this.templatesRepository.save(template);
  }

  /**
   * Obtener todas las plantillas de un tenant
   * Si tenantId es null, devuelve las plantillas globales (Super Admin)
   */
  async findAll(tenantId: string | null): Promise<MRConsentTemplate[]> {
    return await this.templatesRepository.find({
      where: { tenantId: tenantId || IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener plantillas globales (del Super Admin)
   */
  async findGlobalTemplates(): Promise<MRConsentTemplate[]> {
    return await this.templatesRepository.find({
      where: { tenantId: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una plantilla por ID
   */
  async findOne(id: string, tenantId: string | null): Promise<MRConsentTemplate> {
    const template = await this.templatesRepository.findOne({
      where: { id, tenantId: tenantId || IsNull() },
    });

    if (!template) {
      throw new NotFoundException('Plantilla no encontrada');
    }

    return template;
  }

  /**
   * Actualizar una plantilla
   */
  async update(
    id: string,
    updateDto: UpdateMRConsentTemplateDto,
    tenantId: string | null,
  ): Promise<MRConsentTemplate> {
    const template = await this.findOne(id, tenantId);

    Object.assign(template, updateDto);
    return await this.templatesRepository.save(template);
  }

  /**
   * Eliminar una plantilla (soft delete)
   */
  async remove(id: string, tenantId: string | null): Promise<void> {
    const template = await this.findOne(id, tenantId);
    await this.templatesRepository.softDelete(id);
  }

  /**
   * Obtener plantillas activas de un tenant
   */
  async findActive(tenantId: string | null): Promise<MRConsentTemplate[]> {
    return await this.templatesRepository.find({
      where: {
        tenantId: tenantId || IsNull(),
        isActive: true,
      },
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener plantillas por categoría
   */
  async findByCategory(
    category: string,
    tenantId: string | null,
  ): Promise<MRConsentTemplate[]> {
    return await this.templatesRepository.find({
      where: {
        tenantId: tenantId || IsNull(),
        category: category as any,
        isActive: true,
      },
      order: { name: 'ASC' },
    });
  }

  /**
   * Copiar plantillas globales a un nuevo tenant
   * Se ejecuta automáticamente cuando se crea un tenant
   */
  async copyGlobalTemplatesToTenant(tenantId: string): Promise<number> {
    console.log(`[MRConsentTemplatesService] Copiando plantillas globales al tenant ${tenantId}`);

    // Obtener todas las plantillas globales activas
    const globalTemplates = await this.templatesRepository.find({
      where: {
        tenantId: IsNull(),
        isActive: true,
      },
    });

    if (globalTemplates.length === 0) {
      console.log('[MRConsentTemplatesService] No hay plantillas globales para copiar');
      return 0;
    }

    console.log(`[MRConsentTemplatesService] Encontradas ${globalTemplates.length} plantillas globales`);

    // Copiar cada plantilla al tenant
    const copiedTemplates = [];
    for (const globalTemplate of globalTemplates) {
      const newTemplate = this.templatesRepository.create({
        name: globalTemplate.name,
        description: globalTemplate.description,
        category: globalTemplate.category,
        content: globalTemplate.content,
        availableVariables: globalTemplate.availableVariables,
        isActive: globalTemplate.isActive,
        isDefault: globalTemplate.isDefault,
        requiresSignature: globalTemplate.requiresSignature,
        tenantId: tenantId,
        createdBy: null, // No tiene creador específico, es una copia automática
      });

      copiedTemplates.push(newTemplate);
    }

    // Guardar todas las plantillas copiadas
    await this.templatesRepository.save(copiedTemplates);

    console.log(`[MRConsentTemplatesService] ${copiedTemplates.length} plantillas copiadas exitosamente al tenant ${tenantId}`);

    return copiedTemplates.length;
  }

  /**
   * Verificar si un tenant tiene plantillas
   */
  async tenantHasTemplates(tenantId: string): Promise<boolean> {
    const count = await this.templatesRepository.count({
      where: { tenantId },
    });

    return count > 0;
  }

  /**
   * Obtener estadísticas de plantillas
   */
  async getStats(tenantId: string | null): Promise<any> {
    const templates = await this.findAll(tenantId);

    return {
      total: templates.length,
      active: templates.filter(t => t.isActive).length,
      inactive: templates.filter(t => !t.isActive).length,
      byCategory: {
        general: templates.filter(t => t.category === 'general').length,
        anamnesis: templates.filter(t => t.category === 'anamnesis').length,
        procedure: templates.filter(t => t.category === 'procedure').length,
        treatment: templates.filter(t => t.category === 'treatment').length,
      },
    };
  }

  /**
   * Obtener variables disponibles para plantillas HC
   */
  async getAvailableVariables(): Promise<any> {
    return {
      patient: [
        { key: 'patientName', label: 'Nombre del Paciente', example: 'Juan Pérez' },
        { key: 'patientId', label: 'Identificación del Paciente', example: '1234567890' },
        { key: 'patientAge', label: 'Edad del Paciente', example: '35' },
        { key: 'patientGender', label: 'Género del Paciente', example: 'Masculino' },
        { key: 'patientPhone', label: 'Teléfono del Paciente', example: '+57 300 123 4567' },
        { key: 'patientEmail', label: 'Email del Paciente', example: 'paciente@email.com' },
        { key: 'patientAddress', label: 'Dirección del Paciente', example: 'Calle 123 #45-67' },
      ],
      medicalRecord: [
        { key: 'recordNumber', label: 'Número de Historia Clínica', example: 'HC-2024-001' },
        { key: 'admissionDate', label: 'Fecha de Admisión', example: '2024-01-15' },
        { key: 'chiefComplaint', label: 'Motivo de Consulta', example: 'Dolor abdominal' },
        { key: 'currentIllness', label: 'Enfermedad Actual', example: 'Dolor en cuadrante superior derecho...' },
        { key: 'vitalSigns', label: 'Signos Vitales', example: 'PA: 120/80, FC: 72, FR: 16, T: 36.5°C' },
        { key: 'allergies', label: 'Alergias', example: 'Penicilina, Mariscos' },
        { key: 'currentMedications', label: 'Medicamentos Actuales', example: 'Losartán 50mg, Metformina 850mg' },
      ],
      diagnosis: [
        { key: 'diagnosisCode', label: 'Código CIE-10', example: 'K35.8' },
        { key: 'diagnosisDescription', label: 'Descripción del Diagnóstico', example: 'Apendicitis aguda' },
        { key: 'diagnosisType', label: 'Tipo de Diagnóstico', example: 'Principal' },
      ],
      treatment: [
        { key: 'treatmentPlan', label: 'Plan de Tratamiento', example: 'Cirugía laparoscópica...' },
        { key: 'medications', label: 'Medicamentos Prescritos', example: 'Amoxicilina 500mg cada 8 horas' },
        { key: 'recommendations', label: 'Recomendaciones', example: 'Reposo relativo, dieta blanda...' },
        { key: 'procedureName', label: 'Nombre del Procedimiento', example: 'Apendicectomía laparoscópica' },
        { key: 'procedureDescription', label: 'Descripción del Procedimiento', example: 'Extracción del apéndice...' },
        { key: 'procedureRisks', label: 'Riesgos del Procedimiento', example: 'Sangrado, infección, reacción anestésica' },
      ],
      doctor: [
        { key: 'doctorName', label: 'Nombre del Médico', example: 'Dr. Carlos Rodríguez' },
        { key: 'doctorSpecialty', label: 'Especialidad del Médico', example: 'Cirugía General' },
        { key: 'doctorLicense', label: 'Registro Médico', example: 'RM-12345' },
      ],
      facility: [
        { key: 'branchName', label: 'Nombre de la Sede', example: 'Clínica Central' },
        { key: 'branchAddress', label: 'Dirección de la Sede', example: 'Av. Principal #123' },
        { key: 'branchPhone', label: 'Teléfono de la Sede', example: '+57 1 234 5678' },
        { key: 'companyName', label: 'Nombre de la Empresa', example: 'Clínica Demo' },
      ],
      consent: [
        { key: 'consentDate', label: 'Fecha del Consentimiento', example: '2024-01-15' },
        { key: 'consentTime', label: 'Hora del Consentimiento', example: '14:30' },
      ],
    };
  }

  /**
   * Inicializar plantillas por defecto para un tenant
   */
  async initializeDefaults(tenantId: string | null): Promise<{ message: string; count: number }> {
    // Verificar si ya tiene plantillas
    const existingCount = await this.templatesRepository.count({
      where: { tenantId: tenantId || IsNull() },
    });

    if (existingCount > 0) {
      throw new BadRequestException('Ya existen plantillas para este tenant');
    }

    // Si es un tenant, copiar las plantillas globales
    if (tenantId) {
      const count = await this.copyGlobalTemplatesToTenant(tenantId);
      return {
        message: `${count} plantillas inicializadas desde plantillas globales`,
        count,
      };
    }

    // Si es Super Admin, crear las plantillas globales por defecto
    // (esto ya se hace en la migración, pero se puede usar para reinicializar)
    throw new BadRequestException('Las plantillas globales se crean mediante migración');
  }

  /**
   * Establecer una plantilla como predeterminada
   */
  async setAsDefault(id: string, tenantId: string | null): Promise<MRConsentTemplate> {
    const template = await this.findOne(id, tenantId);

    // Desactivar otras plantillas default de la misma categoría
    if (template.category) {
      await this.templatesRepository.update(
        {
          tenantId: tenantId || IsNull(),
          category: template.category,
          isDefault: true,
        },
        { isDefault: false }
      );
    }

    // Activar esta como default
    template.isDefault = true;
    return await this.templatesRepository.save(template);
  }

  /**
   * Valida que el tenant no haya excedido el límite de plantillas HC de su plan
   */
  private async checkTemplatesLimit(tenantId: string): Promise<void> {
    const tenant = await this.tenantsService.findOne(tenantId);
    const plan = getPlanConfig(tenant.plan);
    
    if (!plan) {
      throw new BadRequestException('Plan no encontrado');
    }

    // Si el límite es -1, es ilimitado
    if (plan.limits.mrConsentTemplates === -1) {
      return;
    }
    
    // Contar plantillas HC del tenant
    const count = await this.templatesRepository.count({
      where: { tenantId }
    });
    
    if (count >= plan.limits.mrConsentTemplates) {
      throw new BadRequestException(
        `Has alcanzado el límite de ${plan.limits.mrConsentTemplates} plantillas de HC de tu plan ${plan.name}. Actualiza tu plan para crear más.`
      );
    }
  }

  /**
   * Obtener estadísticas de plantillas de consentimientos de HC
   */
  async getStatistics(tenantId: string) {
    // Total de plantillas HC
    const total = await this.templatesRepository.count({
      where: { tenantId },
    });

    // Plantillas activas
    const active = await this.templatesRepository.count({
      where: { tenantId, isActive: true },
    });

    // Plantillas por categoría
    const byCategory = await this.templatesRepository
      .createQueryBuilder('template')
      .select('template.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('template.tenantId = :tenantId', { tenantId })
      .groupBy('template.category')
      .getRawMany();

    return {
      total,
      active,
      byCategory: byCategory.map(item => ({
        category: item.category || 'Sin categoría',
        count: parseInt(item.count),
      })),
    };
  }
}
