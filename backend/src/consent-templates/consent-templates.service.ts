import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentTemplate, TemplateType } from './entities/consent-template.entity';
import { CreateConsentTemplateDto } from './dto/create-consent-template.dto';
import { UpdateConsentTemplateDto } from './dto/update-consent-template.dto';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantsService } from '../tenants/tenants.service';
import { getPlanConfig } from '../tenants/plans.config';

@Injectable()
export class ConsentTemplatesService {
  constructor(
    @InjectRepository(ConsentTemplate)
    private templatesRepository: Repository<ConsentTemplate>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
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
      ...createDto,
      tenantId: tenantId || null,
    });

    return this.templatesRepository.save(template);
  }

  async findAll(tenantSlug?: string): Promise<ConsentTemplate[]> {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    
    return this.templatesRepository.find({
      where: { tenantId: tenantId || null },
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
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findDefaultByType(
    type: TemplateType,
    tenantSlug?: string,
  ): Promise<ConsentTemplate> {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    
    const template = await this.templatesRepository.findOne({
      where: {
        tenantId: tenantId || null,
        type,
        isDefault: true,
        isActive: true,
      },
    });

    if (!template) {
      // Si no hay plantilla default, buscar la primera activa
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

    return template;
  }

  async findOne(id: string, tenantSlug?: string): Promise<ConsentTemplate> {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    
    const template = await this.templatesRepository.findOne({
      where: {
        id,
        tenantId: tenantId || null,
      },
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

    Object.assign(template, updateDto);
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
   */
  private async checkTemplatesLimit(tenantId: string): Promise<void> {
    const tenant = await this.tenantsService.findOne(tenantId);
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

    // Plantillas por categoría
    const byCategory = await this.templatesRepository
      .createQueryBuilder('template')
      .select('template.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('template."tenantId" = :tenantId', { tenantId })
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
