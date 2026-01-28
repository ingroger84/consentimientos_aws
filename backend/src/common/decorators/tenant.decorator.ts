import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { getRepository } from 'typeorm';

/**
 * Decorador para obtener el tenant completo desde el request
 * Convierte automáticamente el tenantSlug a un objeto Tenant
 * 
 * @example
 * @Get('data')
 * getData(@Tenant() tenant: TenantEntity) {
 *   // tenant es el objeto completo del tenant
 *   return this.someService.doSomething(tenant.id);
 * }
 */
export const Tenant = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantSlug = request.tenantSlug;
    
    if (!tenantSlug) {
      throw new BadRequestException('No se pudo identificar el tenant. Asegúrate de acceder desde el subdominio correcto.');
    }
    
    // Importar dinámicamente para evitar dependencias circulares
    const { Tenant: TenantEntity } = await import('../../tenants/entities/tenant.entity');
    const { getRepository } = await import('typeorm');
    
    const tenantRepository = getRepository(TenantEntity);
    const tenant = await tenantRepository.findOne({
      where: { slug: tenantSlug },
    });
    
    if (!tenant) {
      throw new BadRequestException(`Tenant con slug "${tenantSlug}" no encontrado`);
    }
    
    return tenant;
  },
);
