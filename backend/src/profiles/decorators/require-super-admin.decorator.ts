import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN_KEY = 'require_super_admin';

/**
 * Decorator para requerir que el usuario sea Super Administrador
 * 
 * Este decorator se usa para proteger endpoints que solo deben ser
 * accesibles por super administradores.
 * 
 * @example
 * ```typescript
 * @RequireSuperAdmin()
 * @Post()
 * async create(@Body() dto: CreateProfileDto) {
 *   // Solo super admins pueden ejecutar esto
 * }
 * ```
 */
export const RequireSuperAdmin = () => SetMetadata(SUPER_ADMIN_KEY, true);
