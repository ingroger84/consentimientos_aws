import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para permitir que una ruta sea accesible desde cualquier tenant
 * o sin validación de tenant.
 * 
 * Útil para rutas públicas o rutas que no dependen del tenant.
 * 
 * @example
 * @Get('public-data')
 * @AllowAnyTenant()
 * getPublicData() {
 *   return { data: 'público' };
 * }
 */
export const AllowAnyTenant = () => SetMetadata('allowAnyTenant', true);
