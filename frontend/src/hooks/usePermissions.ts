import { useAuthStore } from '../store/authStore';

/**
 * Hook para verificar permisos del usuario actual
 * 
 * @example
 * ```tsx
 * const { hasPermission, isSuperAdmin } = usePermissions();
 * 
 * if (hasPermission('medical-records', 'create')) {
 *   // Mostrar botón crear
 * }
 * 
 * if (isSuperAdmin()) {
 *   // Mostrar opciones de super admin
 * }
 * ```
 */
export function usePermissions() {
  const { user } = useAuthStore();

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param module Código del módulo (ej: 'medical-records')
   * @param action Acción requerida (ej: 'create', 'edit', 'delete')
   * @returns true si tiene el permiso, false si no
   */
  const hasPermission = (module: string, action: string): boolean => {
    if (!user?.profile) return false;

    // Super admin tiene todos los permisos
    if (user.profile.code === 'super_admin') return true;
    if (user.role?.code === 'super_admin') return true;

    // Verificar permiso global
    const globalPermission = user.profile.permissions.find(
      (p) => p.module === '*' && p.actions.includes('*')
    );
    if (globalPermission) return true;

    // Verificar permiso específico del módulo
    const permission = user.profile.permissions.find((p) => p.module === module);
    if (!permission) return false;

    // Verificar si tiene todas las acciones del módulo
    if (permission.actions.includes('*')) return true;

    // Verificar acción específica
    return permission.actions.includes(action);
  };

  /**
   * Verificar si el usuario es super administrador
   * @returns true si es super admin, false si no
   */
  const isSuperAdmin = (): boolean => {
    if (!user) return false;
    return user.profile?.code === 'super_admin' || user.role?.code === 'super_admin';
  };

  /**
   * Verificar si el usuario tiene acceso a un módulo (cualquier acción)
   * @param module Código del módulo
   * @returns true si tiene acceso, false si no
   */
  const hasModuleAccess = (module: string): boolean => {
    if (!user?.profile) return false;

    // Super admin tiene acceso a todo
    if (isSuperAdmin()) return true;

    // Verificar si tiene algún permiso en el módulo
    const permission = user.profile.permissions.find((p) => p.module === module);
    return !!permission && permission.actions.length > 0;
  };

  /**
   * Obtener todas las acciones permitidas para un módulo
   * @param module Código del módulo
   * @returns Array de acciones permitidas
   */
  const getModuleActions = (module: string): string[] => {
    if (!user?.profile) return [];

    // Super admin tiene todas las acciones
    if (isSuperAdmin()) return ['*'];

    const permission = user.profile.permissions.find((p) => p.module === module);
    return permission?.actions || [];
  };

  /**
   * Obtener todos los módulos a los que el usuario tiene acceso
   * @returns Array de códigos de módulos
   */
  const getAccessibleModules = (): string[] => {
    if (!user?.profile) return [];

    // Super admin tiene acceso a todo
    if (isSuperAdmin()) return ['*'];

    return user.profile.permissions.map((p) => p.module);
  };

  return {
    hasPermission,
    isSuperAdmin,
    hasModuleAccess,
    getModuleActions,
    getAccessibleModules,
  };
}
