import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para requerir al menos uno de los permisos especificados
 * 
 * @param permissions - Array de permisos {module, action}
 * 
 * @example
 * ```typescript
 * @RequireAnyPermission(
 *   { module: 'clients', action: 'create' },
 *   { module: 'admin', action: 'manage' }
 * )
 * @Post('create')
 * async create(@Body() dto: CreateDto) {
 *   // Requiere crear clientes O gestionar admin
 * }
 * ```
 */
export const RequireAnyPermission = (
  ...permissions: Array<{ module: string; action: string }>
) => SetMetadata('requireAnyPermission', permissions);
