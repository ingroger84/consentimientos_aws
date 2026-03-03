import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: string;
  action?: string;
  requireSuperAdmin?: boolean;
  redirectTo?: string;
}

/**
 * Componente para proteger rutas basado en permisos
 * 
 * @example
 * ```tsx
 * // Ruta solo para super admin
 * <ProtectedRoute requireSuperAdmin>
 *   <ProfilesPage />
 * </ProtectedRoute>
 * 
 * // Ruta con permiso específico
 * <ProtectedRoute module="medical-records" action="create">
 *   <CreateMedicalRecordPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  module,
  action,
  requireSuperAdmin = false,
  redirectTo = '/unauthorized',
}: ProtectedRouteProps) {
  const { hasPermission, isSuperAdmin } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si requiere super admin
    if (requireSuperAdmin && !isSuperAdmin()) {
      console.warn('Acceso denegado: Se requiere ser super administrador');
      navigate(redirectTo, { replace: true });
      return;
    }

    // Verificar permiso específico
    if (module && action && !hasPermission(module, action)) {
      console.warn(`Acceso denegado: Se requiere permiso ${module}:${action}`);
      navigate(redirectTo, { replace: true });
      return;
    }
  }, [requireSuperAdmin, module, action, hasPermission, isSuperAdmin, navigate, redirectTo]);

  // No renderizar si no tiene permisos
  if (requireSuperAdmin && !isSuperAdmin()) {
    return null;
  }

  if (module && action && !hasPermission(module, action)) {
    return null;
  }

  return <>{children}</>;
}
