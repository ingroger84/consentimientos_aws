import { useAuthStore } from '../store/authStore';

/**
 * Hook para verificar permisos del usuario actual
 * Compatible con sistema legacy (role.permissions) y nuevo sistema (profile.permissions)
 * 
 * @example
 * ```tsx
 * const { hasPermission, isSuperAdmin } = usePermissions();
 * 
 * // Sistema legacy (un parámetro)
 * if (hasPermission('create_users')) {
 *   // Mostrar botón crear
 * }
 * 
 * // Nuevo sistema (dos parámetros)
 * if (hasPermission('users', 'create')) {
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
   * Soporta dos modos:
   * 1. Legacy: hasPermission('create_users') - un parámetro
   * 2. Nuevo: hasPermission('users', 'create') - dos parámetros
   * 
   * @param moduleOrPermission Código del módulo o permiso completo
   * @param action Acción requerida (opcional, para nuevo sistema)
   * @returns true si tiene el permiso, false si no
   */
  const hasPermission = (moduleOrPermission: string, action?: string): boolean => {
    if (!user) return false;

    // Super admin tiene todos los permisos
    if (user.role?.type === 'super_admin') return true;

    // Si no hay action, es sistema legacy (role.permissions)
    if (!action) {
      // Verificar en role.permissions (array de strings)
      if (user.role?.permissions) {
        return user.role.permissions.includes(moduleOrPermission);
      }
      return false;
    }

    // Sistema nuevo con profile.permissions (no implementado aún en tipos)
    // Por ahora, retornar false para nuevo sistema
    return false;
  };

  /**
   * Verificar si el usuario es super administrador
   * @returns true si es super admin, false si no
   */
  const isSuperAdmin = (): boolean => {
    if (!user) return false;
    return user.role?.type === 'super_admin';
  };

  /**
   * Verificar si el usuario tiene acceso a un módulo (cualquier acción)
   * @param module Código del módulo
   * @returns true si tiene acceso, false si no
   */
  const hasModuleAccess = (module: string): boolean => {
    if (!user) return false;

    // Super admin tiene acceso a todo
    if (isSuperAdmin()) return true;

    // Verificar si tiene algún permiso relacionado con el módulo
    if (user.role?.permissions) {
      return user.role.permissions.some(p => p.includes(module));
    }

    return false;
  };

  /**
   * Obtener todas las acciones permitidas para un módulo
   * @param module Código del módulo
   * @returns Array de acciones permitidas
   */
  const getModuleActions = (module: string): string[] => {
    if (!user) return [];

    // Super admin tiene todas las acciones
    if (isSuperAdmin()) return ['*'];

    // Filtrar permisos relacionados con el módulo
    if (user.role?.permissions) {
      return user.role.permissions.filter(p => p.includes(module));
    }

    return [];
  };

  /**
   * Obtener todos los módulos a los que el usuario tiene acceso
   * @returns Array de códigos de módulos
   */
  const getAccessibleModules = (): string[] => {
    if (!user) return [];

    // Super admin tiene acceso a todo
    if (isSuperAdmin()) return ['*'];

    // Extraer módulos únicos de los permisos
    if (user.role?.permissions) {
      const modules = new Set<string>();
      user.role.permissions.forEach(permission => {
        // Extraer módulo del permiso (ej: 'create_users' -> 'users')
        const parts = permission.split('_');
        if (parts.length > 1) {
          modules.add(parts[parts.length - 1]);
        }
      });
      return Array.from(modules);
    }

    return [];
  };

  return {
    hasPermission,
    isSuperAdmin,
    hasModuleAccess,
    getModuleActions,
    getAccessibleModules,
  };
}
