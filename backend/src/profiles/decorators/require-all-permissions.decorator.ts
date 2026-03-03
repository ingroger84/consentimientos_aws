import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para requerir todos los permisos especificados
 * 
 * @param permissions - Array de permisos {module, action}
 * 
 * @example
 * ```typescript
 * @RequireAllPermissions(
 *   { module: 'clients', action: 'view' },
 *   { module: 'invoices', action: 'view' }
 * )
 * @Get('report')
 * async getReport() {
 *   // Requiere ver clientes Y ver facturas
 * }
 * ```
 */
export const RequireAllPermissions = (
  ...permissions: Array<{ module: string; action: string }>
) => SetMetadata('requireAllPermissions', permissions);
