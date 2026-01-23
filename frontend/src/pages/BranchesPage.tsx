import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService } from '@/services/branch.service';
import { tenantsService } from '@/services/tenants';
import { Plus, Edit, Trash2, X, MapPin, Phone, Mail, Building2, ChevronDown, ChevronRight, List } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { usePermissions } from '@/hooks/usePermissions';
import { useResourceLimitNotifications } from '@/hooks/useResourceLimitNotifications';
import { isResourceLimitError, parseResourceLimitError } from '@/utils/resource-limit-handler';
import ResourceLimitModal from '@/components/ResourceLimitModal';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

export default function BranchesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ current: number; max: number } | null>(null);
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set(['super-admin']));
  const [groupByTenant, setGroupByTenant] = useState(true);
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const { user } = useAuthStore();
  const { checkResourceLimit, refreshLimits } = useResourceLimitNotifications();
  const toast = useToast();
  const confirm = useConfirm();
  
  // Verificar permisos
  const canCreate = hasPermission('create_branches');
  const canEdit = hasPermission('edit_branches');
  const canDelete = hasPermission('delete_branches');

  // Verificar si el usuario actual es Super Admin
  const isSuperAdmin = user && !user.tenant;

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches-admin'],
    queryFn: branchService.getAllForAdmin,
  });

  // Obtener todos los tenants para el Super Admin
  const { data: allTenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantsService.getAll,
    enabled: !!isSuperAdmin, // Solo ejecutar si es Super Admin
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  // Agrupar sedes por tenant (incluyendo tenants sin sedes)
  const groupedBranches = useMemo(() => {
    if (!branches) return { superAdmin: [], tenants: {} };
    
    const superAdmin: any[] = [];
    const tenants: Record<string, { tenant: any; branches: any[] }> = {};

    // Primero, inicializar todos los tenants (incluso los que no tienen sedes)
    if (allTenants) {
      allTenants.forEach((tenant: any) => {
        tenants[tenant.id] = {
          tenant: tenant,
          branches: []
        };
      });
    }

    // Luego, asignar las sedes a sus tenants correspondientes
    branches.forEach((branch: any) => {
      if (!branch.tenant) {
        superAdmin.push(branch);
      } else {
        const tenantKey = branch.tenant.id;
        if (!tenants[tenantKey]) {
          tenants[tenantKey] = {
            tenant: branch.tenant,
            branches: []
          };
        }
        tenants[tenantKey].branches.push(branch);
      }
    });

    return { superAdmin, tenants };
  }, [branches, allTenants]);

  const toggleTenant = (tenantId: string) => {
    setExpandedTenants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tenantId)) {
        newSet.delete(tenantId);
      } else {
        newSet.add(tenantId);
      }
      return newSet;
    });
  };

  const handleCreateBranch = async () => {
    // Validar límite de sedes antes de abrir el modal
    const { canCreate: canCreateBranch, alert } = checkResourceLimit('branches');
    
    if (!canCreateBranch) {
      // Mostrar mensaje de error si alcanzó el límite
      toast.error(
        'Límite Alcanzado',
        `Has alcanzado el límite máximo de sedes (${alert?.current}/${alert?.max}). No puedes crear más sedes hasta que contactes al administrador para actualizar tu plan.`
      );
      return;
    }
    
    if (alert && alert.level === 'critical') {
      // Mostrar advertencia si está cerca del límite
      const proceed = await confirm({
        type: 'warning',
        title: 'Advertencia',
        message: `Estás cerca del límite de sedes (${alert.current}/${alert.max} - ${alert.percentage.toFixed(1)}%). Considera actualizar tu plan pronto. ¿Deseas continuar creando la sede?`,
        confirmText: 'Continuar',
        cancelText: 'Cancelar',
      });
      
      if (!proceed) {
        return;
      }
    }
    
    // Abrir modal de crear sede
    setIsModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: branchService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches-admin'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setIsModalOpen(false);
      reset();
      // Refrescar límites después de crear exitosamente
      refreshLimits();
      toast.success('Sede creada', 'La sede fue creada correctamente');
    },
    onError: (error: any) => {
      console.error('Error al crear sede:', error);
      
      // Verificar si es un error de límite de recursos
      if (isResourceLimitError(error)) {
        parseResourceLimitError(error); // Parsear para logging
        const responseData = error.response?.data as any;
        const message = responseData?.message || '';
        const match = message.match(/\((\d+)\/(\d+)\)/);
        
        if (match) {
          setLimitInfo({
            current: parseInt(match[1]),
            max: parseInt(match[2]),
          });
        } else {
          // Valores por defecto si no se puede parsear
          setLimitInfo({
            current: branches?.length || 0,
            max: (user?.tenant as any)?.maxBranches || 0,
          });
        }
        
        setIsModalOpen(false);
        setShowLimitModal(true);
      } else {
        // Mostrar error genérico
        const responseData = error.response?.data as any;
        toast.error('Error al crear sede', responseData?.message || 'Error al crear la sede');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => branchService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches-admin'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setIsModalOpen(false);
      setEditingBranch(null);
      reset();
      toast.success('Sede actualizada', 'La sede fue actualizada correctamente');
    },
    onError: (error: any) => {
      console.error('Error al actualizar sede:', error);
      toast.error('Error al actualizar sede', error.response?.data?.message || 'Error al actualizar la sede');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: branchService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches-admin'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Sede eliminada', 'La sede fue eliminada correctamente');
    },
    onError: (error: any) => {
      console.error('Error al eliminar sede:', error);
      toast.error('Error al eliminar sede', error.response?.data?.message || 'Error al eliminar la sede');
    },
  });

  const handleEdit = (branch: any) => {
    setEditingBranch(branch);
    setValue('name', branch.name);
    setValue('address', branch.address);
    setValue('phone', branch.phone);
    setValue('email', branch.email);
    setValue('isActive', branch.isActive);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      type: 'danger',
      title: '¿Eliminar sede?',
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    
    if (confirmed) {
      deleteMutation.mutate(id);
      toast.success('Sede eliminada', 'La sede fue eliminada correctamente');
    }
  };

  const onSubmit = (data: any) => {
    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    reset();
  };

  const renderBranchCard = (branch: any) => (
    <div key={branch.id} className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{branch.name}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            branch.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {branch.isActive ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2 text-gray-600">
          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{branch.address}</span>
        </div>
        {branch.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{branch.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{branch.email}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        {canEdit && (
          <button
            onClick={() => handleEdit(branch)}
            className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => handleDelete(branch.id)}
            className="btn btn-danger"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        {!canEdit && !canDelete && (
          <div className="flex-1 text-center text-sm text-gray-500 py-2">
            Solo lectura
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sedes</h1>
          <p className="text-gray-600 mt-2">Gestiona las sedes o sucursales</p>
        </div>
        <div className="flex gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => setGroupByTenant(!groupByTenant)}
              className="btn btn-secondary flex items-center gap-2"
              title={groupByTenant ? 'Vista de lista' : 'Agrupar por tenant'}
            >
              {groupByTenant ? <List className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
              {groupByTenant ? 'Vista Lista' : 'Agrupar por Tenant'}
            </button>
          )}
          {canCreate && (
            <button
              onClick={handleCreateBranch}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Sede
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : isSuperAdmin && groupByTenant ? (
        <div className="space-y-4">
          {/* Super Admin Section */}
          {groupedBranches.superAdmin.length > 0 && (
            <div className="card">
              <button
                onClick={() => toggleTenant('super-admin')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedTenants.has('super-admin') ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Sedes del Sistema</h3>
                    <p className="text-sm text-gray-500">
                      {groupedBranches.superAdmin.length} sede(s)
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  Sistema
                </span>
              </button>

              {expandedTenants.has('super-admin') && (
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedBranches.superAdmin.map(renderBranchCard)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tenants Sections */}
          {Object.entries(groupedBranches.tenants).map(([tenantId, { tenant, branches: tenantBranches }]) => (
            <div key={tenantId} className="card">
              <button
                onClick={() => toggleTenant(tenantId)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedTenants.has(tenantId) ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                    <p className="text-sm text-gray-500">
                      {tenantBranches.length} sede(s) • /{tenant.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://${tenant.slug}.${import.meta.env.VITE_BASE_DOMAIN || 'archivoenlinea.com'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Acceder →
                  </a>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tenant.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : tenant.status === 'trial'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status === 'active' ? 'Activo' : tenant.status === 'trial' ? 'Prueba' : 'Suspendido'}
                  </span>
                </div>
              </button>

              {expandedTenants.has(tenantId) && (
                <div className="p-4 pt-0">
                  {tenantBranches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tenantBranches.map(renderBranchCard)}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>Este tenant no tiene sedes registradas</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {groupedBranches.superAdmin.length === 0 && Object.keys(groupedBranches.tenants).length === 0 && (
            <div className="card text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay sedes registradas</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches?.map(renderBranchCard)}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingBranch ? 'Editar Sede' : 'Nueva Sede'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  {...register('name', { required: true })}
                  className="input"
                  placeholder="Nombre de la sede"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  {...register('address', { required: true })}
                  className="input"
                  placeholder="Dirección completa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  {...register('phone')}
                  className="input"
                  placeholder="+57 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', { required: true })}
                  className="input"
                  placeholder="sede@ejemplo.com"
                />
              </div>

              {editingBranch && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Sede activa
                  </label>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  {editingBranch ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Límite Alcanzado */}
      {showLimitModal && limitInfo && (
        <ResourceLimitModal
          isOpen={showLimitModal}
          onClose={() => {
            setShowLimitModal(false);
            setLimitInfo(null);
          }}
          resourceType="branches"
          currentCount={limitInfo.current}
          maxLimit={limitInfo.max}
          level="blocked"
        />
      )}
    </div>
  );
}
