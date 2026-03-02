import { useState, useEffect } from 'react';
import { Permission, ModulesByCategory } from '../../types/profile.types';
import profilesService from '../../services/profiles.service';

interface PermissionSelectorProps {
  selectedPermissions: Permission[];
  onChange: (permissions: Permission[]) => void;
  disabled?: boolean;
}

const CATEGORY_NAMES: Record<string, string> = {
  dashboard: '📊 Dashboard',
  medical: '🏥 Historias Clínicas',
  consents: '📝 Consentimientos',
  clients: '👥 Clientes',
  admin: '⚙️ Administración',
  reports: '📈 Reportes',
  settings: '🔧 Configuración',
  super_admin: '👑 Super Admin',
  other: '📦 Otros',
};

const ACTION_NAMES: Record<string, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
  export: 'Exportar',
  print: 'Imprimir',
  email: 'Enviar Email',
  sign: 'Firmar',
  assign: 'Asignar',
  reset_password: 'Resetear Password',
};

export default function PermissionSelector({
  selectedPermissions,
  onChange,
  disabled = false,
}: PermissionSelectorProps) {
  const [modulesByCategory, setModulesByCategory] = useState<ModulesByCategory>({});
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const modules = await profilesService.getModulesByCategory();
      setModulesByCategory(modules);
      // Expandir todas las categorías por defecto
      setExpandedCategories(new Set(Object.keys(modules)));
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const isModuleSelected = (moduleCode: string): boolean => {
    return selectedPermissions.some((p) => p.module === moduleCode);
  };

  const isActionSelected = (moduleCode: string, action: string): boolean => {
    const permission = selectedPermissions.find((p) => p.module === moduleCode);
    return permission ? permission.actions.includes(action) || permission.actions.includes('*') : false;
  };

  const toggleModule = (moduleCode: string) => {
    if (disabled) return;

    const newPermissions = [...selectedPermissions];
    const index = newPermissions.findIndex((p) => p.module === moduleCode);

    if (index >= 0) {
      // Remover módulo
      newPermissions.splice(index, 1);
    } else {
      // Agregar módulo con todas las acciones
      newPermissions.push({
        module: moduleCode,
        actions: ['view', 'create', 'edit', 'delete'],
      });
    }

    onChange(newPermissions);
  };

  const toggleAction = (moduleCode: string, action: string) => {
    if (disabled) return;

    const newPermissions = [...selectedPermissions];
    const permissionIndex = newPermissions.findIndex((p) => p.module === moduleCode);

    if (permissionIndex >= 0) {
      const permission = newPermissions[permissionIndex];
      const actionIndex = permission.actions.indexOf(action);

      if (actionIndex >= 0) {
        // Remover acción
        permission.actions.splice(actionIndex, 1);
        // Si no quedan acciones, remover el módulo
        if (permission.actions.length === 0) {
          newPermissions.splice(permissionIndex, 1);
        }
      } else {
        // Agregar acción
        permission.actions.push(action);
      }
    } else {
      // Crear nuevo permiso con esta acción
      newPermissions.push({
        module: moduleCode,
        actions: [action],
      });
    }

    onChange(newPermissions);
  };

  const selectAllInCategory = (category: string) => {
    if (disabled) return;

    const modules = modulesByCategory[category] || [];
    const newPermissions = [...selectedPermissions];

    modules.forEach((module) => {
      const index = newPermissions.findIndex((p) => p.module === module.code);
      if (index < 0) {
        newPermissions.push({
          module: module.code,
          actions: ['view', 'create', 'edit', 'delete'],
        });
      }
    });

    onChange(newPermissions);
  };

  const deselectAllInCategory = (category: string) => {
    if (disabled) return;

    const modules = modulesByCategory[category] || [];
    const moduleCodes = modules.map((m) => m.code);
    const newPermissions = selectedPermissions.filter((p) => !moduleCodes.includes(p.module));

    onChange(newPermissions);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(modulesByCategory).map(([category, modules]) => (
        <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="flex items-center space-x-2 text-left flex-1"
            >
              <span className="text-lg">{expandedCategories.has(category) ? '▼' : '▶'}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {CATEGORY_NAMES[category] || category}
              </span>
              <span className="text-sm text-gray-500">({modules.length} módulos)</span>
            </button>
            {!disabled && (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => selectAllInCategory(category)}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Seleccionar todos
                </button>
                <button
                  type="button"
                  onClick={() => deselectAllInCategory(category)}
                  className="text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400"
                >
                  Deseleccionar todos
                </button>
              </div>
            )}
          </div>

          {expandedCategories.has(category) && (
            <div className="p-4 space-y-3">
              {modules.map((module) => (
                <div key={module.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isModuleSelected(module.code)}
                      onChange={() => toggleModule(module.code)}
                      disabled={disabled}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{module.name}</div>
                      {module.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {module.description}
                        </div>
                      )}
                      {isModuleSelected(module.code) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {['view', 'create', 'edit', 'delete', 'export', 'print', 'email', 'sign', 'assign'].map(
                            (action) => (
                              <label
                                key={action}
                                className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                } ${
                                  isActionSelected(module.code, action)
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isActionSelected(module.code, action)}
                                  onChange={() => toggleAction(module.code, action)}
                                  disabled={disabled}
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span>{ACTION_NAMES[action] || action}</span>
                              </label>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
