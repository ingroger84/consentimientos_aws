import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '@/services/service.service';
import { tenantsService } from '@/services/tenants';
import { Plus, Edit, Trash2, X, Briefcase, Building2, ChevronDown, ChevronRight, List } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { usePermissions } from '@/hooks/usePermissions';
import { useResourceLimitNotifications } from '@/hooks/useResourceLimitNotifications';
import { isResourceLimitError, parseResourceLimitError } from '@/utils/resource-limit-handler';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

export default function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set(['super-admin']));
  const [groupByTenant, setGroupByTenant] = useState(true);
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const { user } = useAuthStore();
  const { checkResourceLimit, refreshLimits } = useResourceLimitNotifications();
  const toast = useToast();
  const confirm = useConfirm();
  
  // Verificar permisos
  const canCreate = hasPermission('create_services');
  const canEdit = hasPermission('edit_services');
  const canDelete = hasPermission('delete_services');

  // Verificar si el usuario actual es Super Admin
  const isSuperAdmin = user && !user.tenant;

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: serviceService.getAll,
  });

  // Obtener todos los tenants para el Super Admin
  const { data: allTenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantsService.getAll,
    enabled: !!isSuperAdmin,
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  // Agrupar servicios por tenant (incluyendo tenants sin servicios)
  const groupedServices = useMemo(() => {
    if (!services) return { superAdmin: [], tenants: {} };
    
    const superAdmin: any[] = [];
    const tenants: Record<string, { tenant: any; services: any[] }> = {};

    // Primero, inicializar todos los tenants (incluso los que no tienen servicios)
    if (allTenants) {
      allTenants.forEach((tenant: any) => {
        tenants[tenant.id] = {
          tenant: tenant,
          services: []
        };
      });
    }

    // Luego, asignar los servicios a sus tenants correspondientes
    services.forEach((service: any) => {
      if (!service.tenant) {
        superAdmin.push(service);
      } else {
        const tenantKey = service.tenant.id;
        if (!tenants[tenantKey]) {
          tenants[tenantKey] = {
            tenant: service.tenant,
            services: []
          };
        }
        tenants[tenantKey].services.push(service);
      }
    });

    return { superAdmin, tenants };
  }, [services, allTenants]);

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

  const handleCreateService = async () => {
    const { canCreate: canCreateService, alert } = checkResourceLimit('services');
    
    if (!canCreateService) {
      toast.error(
        'Límite alcanzado',
        `Has alcanzado el límite máximo de servicios (${alert?.current}/${alert?.max}). Actualiza tu plan para continuar.`,
        7000
      );
      return;
    }
    
    if (alert && alert.level === 'critical') {
      const proceed = await confirm({
        type: 'warning',
        title: 'Límite cercano',
        message: `Estás cerca del límite de servicios (${alert.current}/${alert.max} - ${alert.percentage.toFixed(1)}%).\n\nConsidera actualizar tu plan pronto.\n\n¿Deseas continuar?`,
        confirmText: 'Continuar',
        cancelText: 'Cancelar',
      });
      
      if (!proceed) return;
    }
    
    setIsModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsModalOpen(false);
      reset();
      refreshLimits();
      toast.success('¡Servicio creado!', 'El servicio fue creado correctamente');
    },
    onError: (error: any) => {
      console.error('Error al crear servicio:', error);
      
      if (isResourceLimitError(error)) {
        const limitError = parseResourceLimitError(error);
        toast.error('Límite alcanzado', `${limitError.message}\n\nContacta al administrador.`, 7000);
        setIsModalOpen(false);
      } else {
        toast.error('Error al crear', error.response?.data?.message || 'No se pudo crear el servicio');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => serviceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsModalOpen(false);
      setEditingService(null);
      reset();
      toast.success('¡Servicio actualizado!', 'Los cambios se guardaron correctamente');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: serviceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Servicio eliminado', 'El servicio fue eliminado correctamente');
    },
  });

  const handleEdit = (service: any) => {
    setEditingService(service);
    setValue('name', service.name);
    setValue('description', service.description);
    setValue('pdfTemplateUrl', service.pdfTemplateUrl);
    setValue('isActive', service.isActive);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      type: 'danger',
      title: '¿Eliminar servicio?',
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: any) => {
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    reset();
  };

  const renderServiceCard = (service: any) => (
    <div key={service.id} className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 p-3 rounded-lg">
            <Briefcase className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
            <span
              className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                service.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {service.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {service.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {service.description}
        </p>
      )}

      {service.questions && service.questions.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 font-medium">
            {service.questions.length} pregunta(s) configurada(s)
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t">
        {canEdit && (
          <button
            onClick={() => handleEdit(service)}
            className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => handleDelete(service.id)}
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
          <h1 className="text-3xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-600 mt-2">Gestiona los servicios que requieren consentimiento</p>
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
              onClick={handleCreateService}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Servicio
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : isSuperAdmin && groupByTenant ? (
        <div className="space-y-4">
          {/* Super Admin Section */}
          {groupedServices.superAdmin.length > 0 && (
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
                    <Briefcase className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Servicios del Sistema</h3>
                    <p className="text-sm text-gray-500">
                      {groupedServices.superAdmin.length} servicio(s)
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
                    {groupedServices.superAdmin.map(renderServiceCard)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tenants Sections */}
          {Object.entries(groupedServices.tenants).map(([tenantId, { tenant, services: tenantServices }]) => (
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
                      {tenantServices.length} servicio(s) • /{tenant.slug}
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
                  {tenantServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tenantServices.map(renderServiceCard)}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>Este tenant no tiene servicios registrados</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {groupedServices.superAdmin.length === 0 && Object.keys(groupedServices.tenants).length === 0 && (
            <div className="card text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay servicios registrados</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map(renderServiceCard)}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
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
                  placeholder="Nombre del servicio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  {...register('description')}
                  className="input"
                  rows={3}
                  placeholder="Descripción del servicio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Plantilla PDF
                </label>
                <input
                  {...register('pdfTemplateUrl')}
                  className="input"
                  placeholder="https://ejemplo.com/plantilla.pdf"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL del documento PDF base para este servicio
                </p>
              </div>

              {editingService && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Servicio activo
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
                  {editingService ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
