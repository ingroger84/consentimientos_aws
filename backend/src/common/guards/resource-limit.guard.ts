import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { RESOURCE_TYPE_KEY } from '../decorators/resource-limit.decorator';

export type ResourceType = 'users' | 'branches' | 'consents';

@Injectable()
export class ResourceLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceType = this.reflector.get<ResourceType>(
      RESOURCE_TYPE_KEY,
      context.getHandler(),
    );

    if (!resourceType) {
      // Si no se especifica tipo de recurso, permitir la operación
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super Admin no tiene límites
    if (!user.tenantId) {
      return true;
    }

    // Obtener tenant con relaciones
    const tenant = await this.tenantsRepository.findOne({
      where: { id: user.tenantId },
      relations: ['users', 'branches', 'consents'],
    });

    if (!tenant) {
      throw new ForbiddenException('Tenant no encontrado');
    }

    // Verificar límites según el tipo de recurso
    const currentCount = this.getCurrentCount(tenant, resourceType);
    const maxLimit = this.getMaxLimit(tenant, resourceType);

    if (currentCount >= maxLimit) {
      throw new ForbiddenException(
        this.getErrorMessage(resourceType, currentCount, maxLimit),
      );
    }

    return true;
  }

  private getCurrentCount(tenant: Tenant, resourceType: ResourceType): number {
    switch (resourceType) {
      case 'users':
        return tenant.users?.length || 0;
      case 'branches':
        return tenant.branches?.length || 0;
      case 'consents':
        return tenant.consents?.length || 0;
      default:
        return 0;
    }
  }

  private getMaxLimit(tenant: Tenant, resourceType: ResourceType): number {
    switch (resourceType) {
      case 'users':
        return tenant.maxUsers;
      case 'branches':
        return tenant.maxBranches;
      case 'consents':
        return tenant.maxConsents;
      default:
        return 0;
    }
  }

  private getErrorMessage(
    resourceType: ResourceType,
    current: number,
    max: number,
  ): string {
    const resourceNames = {
      users: 'usuarios',
      branches: 'sedes',
      consents: 'consentimientos',
    };

    const resourceName = resourceNames[resourceType];

    return (
      `Has alcanzado el límite máximo de ${resourceName} permitidos (${current}/${max}). ` +
      `Por favor, contacta al administrador para aumentar tu límite o considera actualizar tu plan.`
    );
  }
}
