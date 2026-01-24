import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentTemplate, TemplateType } from './entities/consent-template.entity';
import { CreateConsentTemplateDto } from './dto/create-consent-template.dto';
import { UpdateConsentTemplateDto } from './dto/update-consent-template.dto';

@Injectable()
export class ConsentTemplatesService {
  constructor(
    @InjectRepository(ConsentTemplate)
    private templatesRepository: Repository<ConsentTemplate>,
  ) {}

  async create(
    createDto: CreateConsentTemplateDto,
    tenantId?: string,
  ): Promise<ConsentTemplate> {
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

  async findAll(tenantId?: string): Promise<ConsentTemplate[]> {
    return this.templatesRepository.find({
      where: { tenantId: tenantId || null },
      order: { type: 'ASC', createdAt: 'DESC' },
    });
  }

  async findByType(
    type: TemplateType,
    tenantId?: string,
  ): Promise<ConsentTemplate[]> {
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
    tenantId?: string,
  ): Promise<ConsentTemplate> {
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

  async findOne(id: string, tenantId?: string): Promise<ConsentTemplate> {
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
    tenantId?: string,
  ): Promise<ConsentTemplate> {
    const template = await this.findOne(id, tenantId);

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

  async remove(id: string, tenantId?: string): Promise<void> {
    const template = await this.findOne(id, tenantId);

    if (template.isDefault) {
      throw new BadRequestException(
        'No se puede eliminar la plantilla por defecto. Primero marca otra como predeterminada.',
      );
    }

    await this.templatesRepository.remove(template);
  }

  async setAsDefault(id: string, tenantId?: string): Promise<ConsentTemplate> {
    const template = await this.findOne(id, tenantId);

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
}
