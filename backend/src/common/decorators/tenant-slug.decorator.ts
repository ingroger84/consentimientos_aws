import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para obtener el slug del tenant desde el request
 * 
 * El slug es extraído del subdominio por el TenantMiddleware
 * 
 * @example
 * @Get('data')
 * getData(@TenantSlug() tenantSlug: string | null) {
 *   // tenantSlug será 'cliente1' si el host es cliente1.tudominio.com
 *   // o null si es tudominio.com (Super Admin)
 * }
 */
export const TenantSlug = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantSlug || null;
  },
);
