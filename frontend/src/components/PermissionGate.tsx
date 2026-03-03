import { usePermissions } from '../hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  module?: string;
  action?: string;
  requireSuperAdmin?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Componente para ocultar elementos basado en permisos
 * 
 * @example
 * ```tsx
 * // Mostrar solo a super admin
 * <PermissionGate requireSuperAdmin>
 *   <button>Configuración Avanzada</button>
 * </PermissionGate>
 * 
 * // Mostrar solo si tiene permiso específico
 * <PermissionGate module="medical-records" action="delete">
 *   <button>Eliminar</button>
 * </PermissionGate>
 * 
 * // Con fallback
 * <PermissionGate 
 *   module="medical-records" 
 *   action="edit"
 *   fallback={<span>Sin permisos</span>}
 * >
 *   <button>Editar</button>
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  children,
  module,
  action,
  requireSuperAdmin = false,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, isSuperAdmin } = usePermissions();

  // Verificar si requiere super admin
  if (requireSuperAdmin && !isSuperAdmin()) {
    return <>{fallback}</>;
  }

  // Verificar permiso específico
  if (module && action && !hasPermission(module, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
