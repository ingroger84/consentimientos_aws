import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ResourceLimitsHelper } from '../common/helpers/resource-limits.helper';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async create(createServiceDto: CreateServiceDto, tenantId?: string): Promise<Service> {
    // VALIDAR LÍMITE DE SERVICIOS ANTES DE CREAR
    if (tenantId) {
      await this.checkServiceLimit(tenantId);
    }

    const serviceData: Partial<Service> = { ...createServiceDto };
    
    // Si el usuario que crea tiene tenant, asignar el mismo tenant al servicio
    if (tenantId) {
      serviceData.tenant = { id: tenantId } as any;
    }
    
    const service = this.servicesRepository.create(serviceData);
    // @ts-ignore - TypeORM save() puede retornar Service | Service[], pero aquí siempre retorna Service
    return this.servicesRepository.save(service);
  }

  async findAll(tenantId?: string): Promise<Service[]> {
    const query = this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.questions', 'questions')
      .leftJoinAndSelect('service.tenant', 'tenant')
      .where('service.deleted_at IS NULL');

    // Si se proporciona tenantId, filtrar por tenant
    if (tenantId) {
      query.andWhere('service.tenantId = :tenantId', { tenantId });
    }

    return query.getMany();
  }

  async findOne(id: string, tenantId?: string): Promise<Service> {
    const query = this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.questions', 'questions')
      .leftJoinAndSelect('service.tenant', 'tenant')
      .where('service.id = :id', { id })
      .andWhere('service.deleted_at IS NULL');

    // Si se proporciona tenantId, verificar que el servicio pertenezca a ese tenant
    if (tenantId) {
      query.andWhere('service.tenantId = :tenantId', { tenantId });
    }

    const service = await query.getOne();
    
    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return service;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    tenantId?: string,
  ): Promise<Service> {
    const service = await this.findOne(id, tenantId);
    Object.assign(service, updateServiceDto);
    return this.servicesRepository.save(service);
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.servicesRepository.softDelete(id);
  }

  /**
   * Verificar límite de servicios del tenant antes de crear
   */
  private async checkServiceLimit(tenantId: string): Promise<void> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
      relations: ['services'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const currentCount = tenant.services?.filter(s => !s.deletedAt).length || 0;
    
    // Usar el helper para validar el límite
    ResourceLimitsHelper.validateServiceLimit(tenant, currentCount);
  }
}
