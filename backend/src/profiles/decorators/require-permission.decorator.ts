import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'required_permission';

/**
 * Decorator para requerir un permiso específico
 * 
 * @param module - Código del módulo (ej: 'medical_records')
 * @param action - Acción requerida (ej: 'create', 'edit', 'delete')
 * 
 * @example
 * ```typescript
 * @RequirePermission('medical_records', 'create')
 * @Post()
 * async create(@Body() dto: CreateMedicalRecordDto) {
 *   // ...
 * }
 * ```
 */
export const RequirePermission = (module: string, action: string) =>
  SetMetadata(PERMISSION_KEY, { module, action });
