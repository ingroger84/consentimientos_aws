import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, In } from 'typeorm';
import { ConsentTemplate, TemplateType } from './entities/consent-template.entity';
import { CreateConsentTemplateDto } from './dto/create-consent-template.dto';
import { UpdateConsentTemplateDto } from './dto/update-consent-template.dto';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantsService } from '../tenants/tenants.service';
import { getPlanConfig } from '../tenants/plans.config';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class ConsentTemplatesService {
  constructor(
    @InjectRepository(ConsentTemplate)
    private templatesRepository: Repository<ConsentTemplate>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @Inject(forwardRef(() => TenantsService))
    private tenantsService: TenantsService,
  ) {}

  /**
   * Convierte un slug de tenant a UUID
   */
  private async getTenantIdFromSlug(tenantSlug?: string): Promise<string | null> {
    if (!tenantSlug) {
      return null;
    }

    const tenant = await this.tenantsRepository.findOne({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant con slug "${tenantSlug}" no encontrado`);
    }

    return tenant.id;
  }

  async create(
    createDto: CreateConsentTemplateDto,
    tenantSlug?: string,
  ): Promise<ConsentTemplate> {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);

    // Validar límite de plantillas CN si es un tenant
    if (tenantId) {
      await this.checkTemplatesLimit(tenantId);
    }

    // Validar que los servicios existan y pertenezcan al tenant
    const services = await this.validateServices(createDto.serviceIds, tenantId);

    // Si se marca como default, desactivar otros defaults del mismo tipo
    if (createDto.isDefault) {
      await this.templatesRepository.update(
        {
          tenantId: tenantId || null,
          type: createDto.type,
          isDefault: true,
        },
        { isDefault: false },
      );
    }

    const template = this.templatesRepository.create({
      name: createDto.name,
      type: createDto.type,
      content: createDto.content,
      description: createDto.description,
      isActive: createDto.isActive,
      isDefault: createDto.isDefault,
      tenantId: tenantId || null,
      services,
    });

    return this.templatesRepository.save(template);
  }

  async findAll(tenantSlug?: string): Promise<ConsentTemplate[]> {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    
    return this.templatesRepository.find({
      where: { tenantId: tenantId || null },
      relations: ['services'],
      order: { type: 'ASC', createdAt: 'DESC' },
    });
  }

  async findByType(
    type: TemplateType,
    tenantSlug?: string,
  ): Promise<ConsentTemplate[]> {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    
    return this.templatesRepository.find({
      where: {
        tenantId: tenantId || null,
        type,
        isActive: true,
      },
      relations: ['services'],
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
     * Buscar plantilla por tipo y servicio
     * Prioriza plantillas asociadas al servicio específico
     */
    async findByTypeAndService(
      type: TemplateType,
      serviceId: string,
      tenantSlug?: string,
    ): Promise<ConsentTemplate> {
      const tenantId = await this.getTenantIdFromSlug(tenantSlug);

      // Buscar plantilla activa asociada al servicio específico
      const queryBuilder = this.templatesRepository
        .createQueryBuilder('template')
        .leftJoinAndSelect('template.services', 'service')
        .where('template.type = :type', { type })
        .andWhere('template.isActive = :isActive', { isActive: true })
        .andWhere('service.id = :serviceId', { serviceId })
        .orderBy('template.createdAt', 'DESC');

      // Agregar condición de tenant correctamente
      if (tenantId) {
        queryBuilder.andWhere('template.tenantId = :tenantId', { tenantId });
      } else {
        queryBuilder.andWhere('template.tenantId IS NULL');
      }

      const templateWithService = await queryBuilder.getOne();

      if (templateWithService) {
        console.log(`[ConsentTemplates] ✅ Plantilla encontrada para servicio ${serviceId} y tipo ${type}:`, templateWithService.name);
        console.log(`[ConsentTemplates] Contenido de la plantilla (primeros 100 chars):`, templateWithService.content.substring(0, 100));
        return templateWithService;
      }

      // Si no hay plantilla asociada al servicio, buscar la primera activa del tipo
      console.log(`[ConsentTemplates] ⚠️ No se encontró plantilla para servicio ${serviceId}, buscando plantilla activa del tipo ${type}`);
      const firstActive = await this.templatesRepository.findOne({
        where: {
          tenantId: tenantId || null,
          type,
          isActive: true,
        },
        order: { createdAt: 'ASC' },
      });

      if (!firstActive) {
        throw new NotFoundException(
          `No se encontró plantilla activa para el tipo ${type}`,
        );
      }

      console.log(`[ConsentTemplates] ℹ️ Usando plantilla activa por defecto:`, firstActive.name);
      return firstActive;
    }

    /**
     * @deprecated Usar findByTypeAndService en su lugar
     * Buscar plantilla predeterminada por tipo (método legacy)
     */
    async findDefaultByType(
      type: TemplateType,
      tenantSlug?: string,
    ): Promise<ConsentTemplate> {
      const tenantId = await this.getTenantIdFromSlug(tenantSlug);

      // Buscar la primera plantilla activa del tipo
      const firstActive = await this.templatesRepository.findOne({
        where: {
          tenantId: tenantId || null,
          type,
          isActive: true,
        },
        order: { createdAt: 'ASC' },
      });

      if (!firstActive) {
        throw new NotFoundException(
          `No se encontró plantilla activa para el tipo ${type}`,
        );
      }

      return firstActive;
    }


  async findOne(id: string, tenantSlug?: string): Promise<ConsentTemplate> {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    
    const template = await this.templatesRepository.findOne({
      where: {
        id,
        tenantId: tenantId || null,
      },
      relations: ['services'],
    });

    if (!template) {
      throw new NotFoundException('Plantilla no encontrada');
    }

    return template;
  }

  async update(
    id: string,
    updateDto: UpdateConsentTemplateDto,
    tenantSlug?: string,
  ): Promise<ConsentTemplate> {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    const template = await this.findOne(id, tenantSlug);

    // Si se actualizan los servicios, validarlos
    if (updateDto.serviceIds) {
      const services = await this.validateServices(updateDto.serviceIds, tenantId);
      template.services = services;
    }

    // Si se marca como default, desactivar otros defaults del mismo tipo
    if (updateDto.isDefault && !template.isDefault) {
      await this.templatesRepository.update(
        {
          tenantId: tenantId || null,
          type: template.type,
          isDefault: true,
        },
        { isDefault: false },
      );
    }

    // Actualizar campos básicos
    if (updateDto.name !== undefined) template.name = updateDto.name;
    if (updateDto.type !== undefined) template.type = updateDto.type;
    if (updateDto.content !== undefined) template.content = updateDto.content;
    if (updateDto.description !== undefined) template.description = updateDto.description;
    if (updateDto.isActive !== undefined) template.isActive = updateDto.isActive;
    if (updateDto.isDefault !== undefined) template.isDefault = updateDto.isDefault;

    return this.templatesRepository.save(template);
  }

  async remove(id: string, tenantSlug?: string): Promise<void> {
    const template = await this.findOne(id, tenantSlug);

    if (template.isDefault) {
      throw new BadRequestException(
        'No se puede eliminar la plantilla por defecto. Primero marca otra como predeterminada.',
      );
    }

    await this.templatesRepository.remove(template);
  }

  async setAsDefault(id: string, tenantSlug?: string): Promise<ConsentTemplate> {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    const template = await this.findOne(id, tenantSlug);

    // Desactivar otros defaults del mismo tipo
    await this.templatesRepository.update(
      {
        tenantId: tenantId || null,
        type: template.type,
        isDefault: true,
      },
      { isDefault: false },
    );

    template.isDefault = true;
    return this.templatesRepository.save(template);
  }

  /**
   * Reemplaza variables en el contenido de la plantilla
   */
  replaceVariables(content: string, variables: Record<string, string>): string {
    let result = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    }

    return result;
  }

  /**
   * Obtiene las variables disponibles para las plantillas
   */
  getAvailableVariables(): Record<string, string> {
    return {
      clientName: 'Nombre completo del cliente',
      clientId: 'Número de identificación del cliente',
      clientEmail: 'Email del cliente',
      clientPhone: 'Teléfono del cliente',
      serviceName: 'Nombre del servicio',
      branchName: 'Nombre de la sede',
      branchAddress: 'Dirección de la sede',
      branchPhone: 'Teléfono de la sede',
      branchEmail: 'Email de la sede',
      companyName: 'Nombre de la empresa',
      signDate: 'Fecha de firma',
      signTime: 'Hora de firma',
      currentDate: 'Fecha actual',
      currentYear: 'Año actual',
    };
  }

  /**
   * Inicializa las plantillas predeterminadas para un tenant
   */
  async initializeDefaults(tenantSlug?: string): Promise<{ message: string; count: number }> {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    
    // Verificar si ya existen plantillas para este tenant
    const existingTemplates = await this.templatesRepository.find({
      where: { tenantId: tenantId || null },
    });

    // Si ya existen plantillas, retornar mensaje informativo
    if (existingTemplates.length > 0) {
      return {
        message: `Ya tienes ${existingTemplates.length} plantilla(s) creada(s). Puedes editarlas o crear nuevas según tus necesidades.`,
        count: existingTemplates.length,
      };
    }

    // Definir las plantillas predeterminadas
    const defaultTemplates = [
      {
        name: 'Consentimiento de Procedimiento (Predeterminado)',
        type: 'procedure' as TemplateType,
        content: `DECLARACIÓN DE CONSENTIMIENTO

Declaro que he sido informado(a) sobre el procedimiento/servicio mencionado, sus beneficios, riesgos y alternativas. Autorizo voluntariamente la realización del procedimiento/servicio descrito en este documento.

He tenido la oportunidad de hacer preguntas y todas mis dudas han sido resueltas satisfactoriamente. Comprendo que puedo retirar este consentimiento en cualquier momento antes del procedimiento.

Servicio: {{serviceName}}
Sede: {{branchName}}
Fecha: {{signDate}}

Firma del paciente: _______________________
Nombre: {{clientName}}
Identificación: {{clientId}}`,
        description: 'Plantilla predeterminada para consentimientos de procedimientos médicos y servicios',
        isActive: true,
        isDefault: true,
      },
      {
        name: 'Tratamiento de Datos Personales (Predeterminado)',
        type: 'data_treatment' as TemplateType,
        content: `AUTORIZACIÓN PARA TRATAMIENTO DE DATOS PERSONALES

De acuerdo con la Ley Estatutaria 1581 de 2012 de Protección de Datos y sus normas reglamentarias, doy mi consentimiento, como Titular de los datos, para que éstos sean incorporados en una base de datos responsabilidad de {{branchName}}, para que sean tratados con arreglo a los siguientes criterios:

1. FINALIDAD DEL TRATAMIENTO
La finalidad del tratamiento será la prestación de servicios médicos/profesionales, gestión administrativa, facturación, y comunicaciones relacionadas con los servicios contratados.

2. DERECHOS DEL TITULAR
Como titular de los datos personales, tengo derecho a:
- Conocer, actualizar y rectificar mis datos personales
- Solicitar prueba de la autorización otorgada
- Ser informado sobre el uso que se ha dado a mis datos
- Presentar quejas ante la Superintendencia de Industria y Comercio
- Revocar la autorización y/o solicitar la supresión de datos
- Acceder de forma gratuita a mis datos personales

3. EJERCICIO DE DERECHOS
Para ejercitar los derechos de acceso, corrección, supresión, revocación o reclamo, puedo dirigirme a:
- Correo electrónico: {{branchEmail}}
- Dirección: {{branchAddress}}
- Teléfono: {{branchPhone}}

TITULAR DE LOS DATOS
Nombre: {{clientName}}
Identificación: {{clientId}}
Email: {{clientEmail}}
Teléfono: {{clientPhone}}
Fecha: {{currentDate}}`,
        description: 'Plantilla predeterminada para autorización de tratamiento de datos personales según Ley 1581 de 2012',
        isActive: true,
        isDefault: true,
      },
      {
        name: 'Autorización de Derechos de Imagen (Predeterminado)',
        type: 'image_rights' as TemplateType,
        content: `AUTORIZACIÓN DE USO DE IMAGEN Y DATOS PERSONALES

Autorizo expresamente el uso de mi imagen, voz y/o cualquier otro dato de carácter personal que pueda ser captado en fotografías, videos o grabaciones realizadas durante el procedimiento/servicio.

1. ALCANCE DE LA AUTORIZACIÓN
Esta autorización incluye:
- Fotografías del procedimiento con fines médicos y de registro
- Uso de imágenes para documentación clínica
- Almacenamiento seguro en la historia clínica
- Uso interno para fines de seguimiento y control de calidad

2. PROTECCIÓN DE LA PRIVACIDAD
La institución se compromete a:
- Proteger mi identidad y datos personales
- No publicar imágenes sin autorización expresa adicional
- Usar las imágenes únicamente para los fines autorizados
- Mantener la confidencialidad de la información

3. REVOCACIÓN
Puedo revocar esta autorización en cualquier momento mediante comunicación escrita dirigida a {{branchName}}.

4. DATOS DEL TITULAR
Nombre completo: {{clientName}}
Identificación: {{clientId}}
Servicio: {{serviceName}}
Sede: {{branchName}}
Fecha: {{currentDate}}

Declaro que he leído y comprendido esta autorización y la otorgo de manera libre y voluntaria.`,
        description: 'Plantilla predeterminada para autorización de uso de imagen y datos personales',
        isActive: true,
        isDefault: true,
      },
    ];

    // Crear las plantillas
    const createdTemplates = [];
    for (const templateData of defaultTemplates) {
      const template = this.templatesRepository.create({
        ...templateData,
        tenantId: tenantId || null,
      });
      const saved = await this.templatesRepository.save(template);
      createdTemplates.push(saved);
    }

    return {
      message: `Se crearon ${createdTemplates.length} plantillas predeterminadas exitosamente`,
      count: createdTemplates.length,
    };
  }

  /**
   * Valida que el tenant no haya excedido el límite de plantillas CN de su plan
   * OPTIMIZADO: Solo carga los campos necesarios del tenant sin relaciones
   */
  private async checkTemplatesLimit(tenantId: string): Promise<void> {
    // Consulta optimizada - solo obtener el plan sin cargar relaciones pesadas
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
      select: ['id', 'plan', 'maxConsentTemplates']
    });
    
    if (!tenant) {
      throw new BadRequestException('Tenant no encontrado');
    }
    
    const plan = getPlanConfig(tenant.plan);
    
    if (!plan) {
      throw new BadRequestException('Plan no encontrado');
    }

    // Si el límite es -1, es ilimitado
    if (plan.limits.consentTemplates === -1) {
      return;
    }
    
    // Contar plantillas CN del tenant
    const count = await this.templatesRepository.count({
      where: { tenantId }
    });
    
    if (count >= plan.limits.consentTemplates) {
      throw new BadRequestException(
        `Has alcanzado el límite de ${plan.limits.consentTemplates} plantillas de consentimientos de tu plan ${plan.name}. Actualiza tu plan para crear más.`
      );
    }
  }

  /**
   * Valida que los servicios existan y pertenezcan al tenant
   */
  private async validateServices(serviceIds: string[], tenantId: string | null): Promise<Service[]> {
    if (!serviceIds || serviceIds.length === 0) {
      throw new BadRequestException('Debe asociar al menos un servicio a la plantilla');
    }

    const services = await this.servicesRepository.find({
      where: {
        id: In(serviceIds),
        ...(tenantId && { tenant: { id: tenantId } }),
      },
    });

    if (services.length !== serviceIds.length) {
      throw new BadRequestException('Uno o más servicios no existen o no pertenecen a tu cuenta');
    }

    return services;
  }

  /**
   * Obtiene plantillas por servicio
   */
  async findByService(serviceId: string, tenantSlug?: string): Promise<ConsentTemplate[]> {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);

    return this.templatesRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.services', 'service')
      .where('template.tenantId = :tenantId', { tenantId: tenantId || null })
      .andWhere('template.isActive = :isActive', { isActive: true })
      .andWhere('service.id = :serviceId', { serviceId })
      .orderBy('template.isDefault', 'DESC')
      .addOrderBy('template.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Método para Super Admin: obtener todas las plantillas CN agrupadas por tenant
   */
  async getAllGroupedByTenant() {
    // Usar QueryBuilder para asegurar que solo se obtienen plantillas con tenant
    const allTemplates = await this.templatesRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.tenant', 'tenant')
      .where('template.tenantId IS NOT NULL') // Filtro SQL directo
      .andWhere('tenant.id IS NOT NULL') // Asegurar que el tenant existe
      .orderBy('template.createdAt', 'DESC')
      .getMany();

    // Agrupar por tenant
    const groupedMap = new Map<string, any>();

    allTemplates.forEach(template => {
      const tenantId = template.tenantId;
      
      // Saltar si no tiene tenant (doble verificación)
      if (!tenantId || !template.tenant) {
        return;
      }

      const tenantName = template.tenant.name;
      const tenantSlug = template.tenant.slug;

      if (!groupedMap.has(tenantId)) {
        groupedMap.set(tenantId, {
          tenantId,
          tenantName,
          tenantSlug,
          totalTemplates: 0,
          activeTemplates: 0,
          inactiveTemplates: 0,
          procedureTemplates: 0,
          dataTreatmentTemplates: 0,
          imageRightsTemplates: 0,
          templates: [],
        });
      }

      const group = groupedMap.get(tenantId);
      group.totalTemplates++;

      if (template.isActive) {
        group.activeTemplates++;
      } else {
        group.inactiveTemplates++;
      }

      // Contar por tipo
      switch (template.type) {
        case 'procedure':
          group.procedureTemplates++;
          break;
        case 'data_treatment':
          group.dataTreatmentTemplates++;
          break;
        case 'image_rights':
          group.imageRightsTemplates++;
          break;
      }

      group.templates.push({
        id: template.id,
        name: template.name,
        type: template.type,
        content: template.content,
        description: template.description,
        isActive: template.isActive,
        isDefault: template.isDefault,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        tenantName,
        tenantSlug,
      });
    });

    // Convertir Map a Array y ordenar por total de plantillas
    const grouped = Array.from(groupedMap.values())
      .sort((a, b) => b.totalTemplates - a.totalTemplates);

    return grouped;
  }

  /**
   * Obtener estadísticas de plantillas de consentimientos convencionales
   */
  async getStatistics(tenantId: string) {
    // Validar que tenantId sea un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      throw new BadRequestException('El tenantId debe ser un UUID válido');
    }

    // Total de plantillas CN
    const total = await this.templatesRepository.count({
      where: { tenantId },
    });

    // Plantillas activas
    const active = await this.templatesRepository.count({
      where: { tenantId, isActive: true },
    });

    // Plantillas por tipo
    const byType = await this.templatesRepository
      .createQueryBuilder('template')
      .select('template.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('template."tenantId" = :tenantId', { tenantId })
      .groupBy('template.type')
      .getRawMany();

    return {
      total,
      active,
      byType: byType.map(item => ({
        type: item.type || 'Sin tipo',
        count: parseInt(item.count),
      })),
    };
  }
}
