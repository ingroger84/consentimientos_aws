import { useAuthStore } from '@/store/authStore';

/**
 * Hook para verificar permisos del usuario
 * 
 * Uso:
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
 * 
 * if (hasPermission('edit_services')) {
 *   // Mostrar botón de editar
 * }
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.role) return false;
    return user.role.permissions?.includes(permission) || false;
  };

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   */
  const hasAnyPermission = (...permissions: string[]): boolean => {
    if (!user || !user.role) return false;
    return permissions.some(permission => 
      user.role.permissions?.includes(permission)
    );
  };

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  const hasAllPermissions = (...permissions: string[]): boolean => {
    if (!user || !user.role) return false;
    return permissions.every(permission => 
      user.role.permissions?.includes(permission)
    );
  };

  /**
   * Obtiene todos los permisos del usuario
   */
  const getPermissions = (): string[] => {
    if (!user || !user.role) return [];
    return user.role.permissions || [];
  };

  /**
   * Verifica si el usuario es Super Admin
   */
  const isSuperAdmin = (): boolean => {
    if (!user || !user.role) return false;
    return user.role.type === 'super_admin';
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
    isSuperAdmin,
  };
}
