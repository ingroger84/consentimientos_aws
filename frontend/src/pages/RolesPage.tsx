import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Shield, Check, Search, ChevronDown, ChevronRight, CheckSquare, Square, MinusSquare } from 'lucide-react';
import api from '@/services/api';
import { Role } from '@/types';
import { useToast } from '@/hooks/useToast';

interface PermissionCategory {
  name: string;
  permissions: string[];
}

interface PermissionsData {
  permissions: string[];
  descriptions: Record<string, string>;
  categories: Record<string, PermissionCategory>;
}

export default function RolesPage() {
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const toast = useToast();

  // Obtener roles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await api.get<Role[]>('/roles');
      return data;
    },
  });

  // Obtener permisos disponibles del backend
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data } = await api.get<PermissionsData>('/roles/permissions');
      return data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, permissions }: { id: string; permissions: string[] }) => {
      const { data } = await api.patch(`/roles/${id}`, { permissions });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
      setSelectedPermissions([]);
      toast.success('Permisos actualizados', 'Los permisos fueron actualizados exitosamente');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar permisos', error.response?.data?.message || error.message);
    },
  });

  // Filtrar categorías según búsqueda
  const filteredCategories = useMemo(() => {
    if (!permissionsData) return {};
    
    if (!searchTerm) return permissionsData.categories;

    const filtered: Record<string, PermissionCategory> = {};
    const lowerSearch = searchTerm.toLowerCase();

    Object.entries(permissionsData.categories).forEach(([key, category]) => {
      const matchingPermissions = category.permissions.filter(permId => {
        const description = permissionsData.descriptions[permId] || '';
        return description.toLowerCase().includes(lowerSearch) || 
               permId.toLowerCase().includes(lowerSearch);
      });

      if (matchingPermissions.length > 0) {
        filtered[key] = {
          ...category,
          permissions: matchingPermissions,
        };
      }
    });

    return filtered;
  }, [permissionsData, searchTerm]);

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions || []);
    // Expandir todas las categorías al editar
    if (permissionsData) {
      setExpandedCategories(new Set(Object.keys(permissionsData.categories)));
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleToggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  const handleSelectAllInCategory = (categoryPermissions: string[]) => {
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
    
    if (allSelected) {
      // Deseleccionar todos
      setSelectedPermissions(prev => prev.filter(p => !categoryPermissions.includes(p)));
    } else {
      // Seleccionar todos
      setSelectedPermissions(prev => {
        const newPerms = new Set([...prev, ...categoryPermissions]);
        return Array.from(newPerms);
      });
    }
  };

  const getCategorySelectionState = (categoryPermissions: string[]) => {
    const selectedCount = categoryPermissions.filter(p => selectedPermissions.includes(p)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === categoryPermissions.length) return 'all';
    return 'some';
  };

  const handleSave = () => {
    if (editingRole) {
      updateRoleMutation.mutate({
        id: editingRole.id,
        permissions: selectedPermissions,
      });
    }
  };

  const handleCancel = () => {
    setEditingRole(null);
    setSelectedPermissions([]);
    setSearchTerm('');
    setExpandedCategories(new Set());
  };

  const isLoading = rolesLoading || permissionsLoading;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles y Permisos</h1>
          <p className="text-gray-600 mt-2">Configura los permisos de cada rol del sistema</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Cargando roles y permisos...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {roles?.map((role) => (
            <div key={role.id} className="card">
              {/* Header del Rol */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{role.name}</h3>
                    <p className="text-gray-600 text-sm">{role.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {role.permissions?.length || 0} permisos asignados
                    </p>
                  </div>
                </div>
                {editingRole?.id === role.id ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSave} 
                      className="btn btn-primary"
                      disabled={updateRoleMutation.isPending}
                    >
                      {updateRoleMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button 
                      onClick={handleCancel} 
                      className="btn btn-secondary"
                      disabled={updateRoleMutation.isPending}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditRole(role)}
                    className="btn btn-secondary"
                  >
                    Editar Permisos
                  </button>
                )}
              </div>

              {/* Barra de búsqueda (solo en modo edición) */}
              {editingRole?.id === role.id && (
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar permisos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Permisos agrupados por categoría */}
              <div className="border-t pt-4">
                {editingRole?.id === role.id ? (
                  // Vista de edición con categorías expandibles
                  <div className="space-y-3">
                    {Object.entries(filteredCategories).map(([categoryKey, category]) => {
                      const isExpanded = expandedCategories.has(categoryKey);
                      const selectionState = getCategorySelectionState(category.permissions);
                      
                      return (
                        <div key={categoryKey} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Header de categoría */}
                          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={() => handleToggleCategory(categoryKey)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-5 h-5" />
                                ) : (
                                  <ChevronRight className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleSelectAllInCategory(category.permissions)}
                                className="flex items-center gap-2"
                              >
                                {selectionState === 'all' && (
                                  <CheckSquare className="w-5 h-5 text-primary-600" />
                                )}
                                {selectionState === 'some' && (
                                  <MinusSquare className="w-5 h-5 text-primary-600" />
                                )}
                                {selectionState === 'none' && (
                                  <Square className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                              <h4 className="font-semibold text-gray-900">{category.name}</h4>
                              <span className="text-sm text-gray-500">
                                ({category.permissions.filter(p => selectedPermissions.includes(p)).length}/{category.permissions.length})
                              </span>
                            </div>
                            <button
                              onClick={() => handleToggleCategory(categoryKey)}
                              className="text-sm text-primary-600 hover:text-primary-700"
                            >
                              {isExpanded ? 'Contraer' : 'Expandir'}
                            </button>
                          </div>

                          {/* Permisos de la categoría */}
                          {isExpanded && (
                            <div className="p-4 space-y-2">
                              {category.permissions.map((permId) => {
                                const isActive = selectedPermissions.includes(permId);
                                const description = permissionsData?.descriptions[permId] || permId;

                                return (
                                  <div
                                    key={permId}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                                      isActive
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200'
                                    }`}
                                    onClick={() => handleTogglePermission(permId)}
                                  >
                                    <div
                                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                        isActive
                                          ? 'bg-primary-600 border-primary-600'
                                          : 'border-gray-300'
                                      }`}
                                    >
                                      {isActive && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        {description}
                                      </p>
                                      <p className="text-xs text-gray-500 font-mono">
                                        {permId}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Vista de solo lectura compacta
                  <div className="space-y-4">
                    {permissionsData && Object.entries(permissionsData.categories).map(([categoryKey, category]) => {
                      const categoryPerms = category.permissions.filter(p => 
                        role.permissions?.includes(p)
                      );

                      if (categoryPerms.length === 0) return null;

                      return (
                        <div key={categoryKey}>
                          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            {category.name}
                            <span className="text-xs text-gray-500 font-normal">
                              ({categoryPerms.length})
                            </span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {categoryPerms.map((permId) => (
                              <span
                                key={permId}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                              >
                                <Check className="w-3 h-3" />
                                {permissionsData.descriptions[permId]}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
