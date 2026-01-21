import { TenantPlan } from '@/types/tenant';

/**
 * Mapeo de nombres de planes según la configuración en backend/src/tenants/plans.config.ts
 * Estos nombres deben coincidir exactamente con los definidos en el backend
 */
export const PLAN_NAMES: Record<TenantPlan, string> = {
  [TenantPlan.FREE]: 'Gratuito',
  [TenantPlan.BASIC]: 'Básico',
  [TenantPlan.PROFESSIONAL]: 'Emprendedor',
  [TenantPlan.ENTERPRISE]: 'Plus',
  [TenantPlan.CUSTOM]: 'Empresarial',
};

/**
 * Obtiene el nombre legible de un plan
 * @param plan - ID del plan
 * @returns Nombre del plan en español
 */
export function getPlanName(plan: TenantPlan | string): string {
  return PLAN_NAMES[plan as TenantPlan] || plan;
}

/**
 * Obtiene el color de badge para un plan
 * @param plan - ID del plan
 * @returns Clases de Tailwind para el color del badge
 */
export function getPlanColor(plan: TenantPlan): string {
  switch (plan) {
    case TenantPlan.FREE:
      return 'bg-gray-100 text-gray-800';
    case TenantPlan.BASIC:
      return 'bg-blue-100 text-blue-800';
    case TenantPlan.PROFESSIONAL:
      return 'bg-purple-100 text-purple-800';
    case TenantPlan.ENTERPRISE:
      return 'bg-yellow-100 text-yellow-800';
    case TenantPlan.CUSTOM:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
