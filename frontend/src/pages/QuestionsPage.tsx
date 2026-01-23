import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService } from '@/services/question.service';
import { serviceService } from '@/services/service.service';
import { tenantsService } from '@/services/tenants';
import { Plus, Edit, Trash2, X, HelpCircle, AlertTriangle, ChevronDown, ChevronRight, List, Grid, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

export default function QuestionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grouped' | 'list' | 'tenant'>('grouped');
  const [viewModeInitialized, setViewModeInitialized] = useState(false);
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const { user } = useAuthStore();
  const toast = useToast();
  const confirm = useConfirm();
  
  // Verificar permisos
  const canCreate = hasPermission('create_questions');
  const canEdit = hasPermission('edit_questions');
  const canDelete = hasPermission('delete_questions');

  // Verificar si el usuario actual es Super Admin
  const isSuperAdmin = user && !user.tenant;

  // Establecer vista predeterminada cuando el usuario se carga
  useEffect(() => {
    if (user && !viewModeInitialized) {
      setViewMode(isSuperAdmin ? 'tenant' : 'grouped');
      setViewModeInitialized(true);
    }
  }, [user, isSuperAdmin, viewModeInitialized]);

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: serviceService.getAll,
  });

  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions', selectedServiceId],
    queryFn: () => questionService.getAll(selectedServiceId || undefined),
  });

  // Obtener todos los tenants para el Super Admin
  const { data: allTenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantsService.getAll,
    enabled: !!isSuperAdmin,
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  const createMutation = useMutation({
    mutationFn: questionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsModalOpen(false);
      reset();
      toast.success('Pregunta creada', 'La pregunta fue creada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al crear pregunta', error.response?.data?.message || 'Error al crear la pregunta');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => questionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsModalOpen(false);
      setEditingQuestion(null);
      reset();
      toast.success('Pregunta actualizada', 'La pregunta fue actualizada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar pregunta', error.response?.data?.message || 'Error al actualizar la pregunta');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: questionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Pregunta eliminada', 'La pregunta fue eliminada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar pregunta', error.response?.data?.message || 'Error al eliminar la pregunta');
    },
  });

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setValue('questionText', question.questionText);
    setValue('type', question.type);
    setValue('isRequired', question.isRequired);
    setValue('isCritical', question.isCritical);
    setValue('order', question.order);
    setValue('serviceId', question.service.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      type: 'danger',
      title: '¿Eliminar pregunta?',
      message: '¿Estás seguro de eliminar esta pregunta? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: any) => {
    if (editingQuestion) {
      updateMutation.mutate({ id: editingQuestion.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
    reset();
  };

  const filteredQuestions = selectedServiceId
    ? questions?.filter((q) => q.service?.id === selectedServiceId)
    : questions;

  // Agrupar preguntas por servicio
  const groupedQuestions = useMemo(() => {
    if (!questions || !services) return {};
    
    const groups: Record<string, { service: any; questions: any[] }> = {};
    
    questions.forEach((question) => {
      const serviceId = question.service?.id;
      if (!serviceId) return;
      
      if (!groups[serviceId]) {
        const service = services.find((s) => s.id === serviceId);
        groups[serviceId] = {
          service: service || { id: serviceId, name: 'Servicio Desconocido' },
          questions: [],
        };
      }
      
      groups[serviceId].questions.push(question);
    });
    
    // Ordenar preguntas dentro de cada grupo
    Object.values(groups).forEach((group) => {
      group.questions.sort((a, b) => a.order - b.order);
    });
    
    return groups;
  }, [questions, services]);

  // Agrupar preguntas por tenant (para Super Admin)
  const groupedByTenant = useMemo(() => {
    if (!questions) return { superAdmin: [], tenants: {} };
    
    const superAdmin: any[] = [];
    const tenants: Record<string, { tenant: any; services: Record<string, { service: any; questions: any[] }> }> = {};

    // Inicializar todos los tenants (incluso los que no tienen preguntas)
    if (allTenants) {
      allTenants.forEach((tenant: any) => {
        tenants[tenant.id] = {
          tenant: tenant,
          services: {}
        };
      });
    }

    // Agrupar preguntas por tenant y servicio
    // Las preguntas ya vienen con service.tenant del backend
    questions.forEach((question) => {
      const service = question.service;
      if (!service) return;

      // El tenant viene directamente del servicio de la pregunta
      const tenant = service.tenant;
      
      if (!tenant) {
        // Preguntas sin tenant (del Super Admin)
        superAdmin.push({ ...question, serviceName: service.name });
      } else {
        const tenantKey = tenant.id;
        // Si el tenant no existe en la lista (caso raro), crearlo
        if (!tenants[tenantKey]) {
          tenants[tenantKey] = {
            tenant: tenant,
            services: {}
          };
        }
        
        if (!tenants[tenantKey].services[service.id]) {
          tenants[tenantKey].services[service.id] = {
            service: service,
            questions: []
          };
        }
        
        tenants[tenantKey].services[service.id].questions.push(question);
      }
    });

    // Ordenar preguntas dentro de cada servicio
    Object.values(tenants).forEach((tenantData) => {
      Object.values(tenantData.services).forEach((serviceData) => {
        serviceData.questions.sort((a, b) => a.order - b.order);
      });
    });

    return { superAdmin, tenants };
  }, [questions, allTenants]);

  const toggleService = (serviceId: string) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedServices(newExpanded);
  };

  const toggleTenant = (tenantId: string) => {
    const newExpanded = new Set(expandedTenants);
    if (newExpanded.has(tenantId)) {
      newExpanded.delete(tenantId);
    } else {
      newExpanded.add(tenantId);
    }
    setExpandedTenants(newExpanded);
  };

  const toggleAllServices = () => {
    if (expandedServices.size === Object.keys(groupedQuestions).length) {
      setExpandedServices(new Set());
    } else {
      setExpandedServices(new Set(Object.keys(groupedQuestions)));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Preguntas</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las preguntas de restricciones para cada servicio
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                viewMode === 'grouped'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista Agrupada por Servicio"
            >
              <Grid className="w-4 h-4" />
              Servicio
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setViewMode('tenant')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  viewMode === 'tenant'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Vista Agrupada por Tenant"
              >
                <Building2 className="w-4 h-4" />
                Tenant
              </button>
            )}
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista de Lista"
            >
              <List className="w-4 h-4" />
              Lista
            </button>
          </div>
          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Pregunta
            </button>
          )}
        </div>
      </div>

      {/* Filtro por servicio - Solo en vista de lista */}
      {viewMode === 'list' && (
        <div className="card mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Servicio
          </label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="input max-w-md"
          >
            <option value="">Todos los servicios</option>
            {services?.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : viewMode === 'grouped' ? (
        /* Vista Agrupada por Servicio */
        <div className="space-y-4">
          {/* Botón para expandir/colapsar todos */}
          {Object.keys(groupedQuestions).length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={toggleAllServices}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {expandedServices.size === Object.keys(groupedQuestions).length
                  ? 'Colapsar Todos'
                  : 'Expandir Todos'}
              </button>
            </div>
          )}

          {Object.entries(groupedQuestions).map(([serviceId, group]) => {
            const isExpanded = expandedServices.has(serviceId);
            const questionCount = group.questions.length;
            const criticalCount = group.questions.filter((q) => q.isCritical).length;
            const requiredCount = group.questions.filter((q) => q.isRequired).length;

            return (
              <div key={serviceId} className="card overflow-hidden">
                {/* Header del Servicio */}
                <button
                  onClick={() => toggleService(serviceId)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {isExpanded ? (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    )}
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900">
                        {group.service.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-gray-600">
                          {questionCount} {questionCount === 1 ? 'pregunta' : 'preguntas'}
                        </span>
                        {requiredCount > 0 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                            {requiredCount} obligatoria{requiredCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {criticalCount > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {criticalCount} crítica{criticalCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Lista de Preguntas */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {group.questions.map((question, index) => (
                      <div
                        key={question.id}
                        className={`p-6 hover:bg-gray-50 transition-colors ${
                          index !== group.questions.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-semibold text-sm flex-shrink-0">
                                {question.order}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-base font-medium text-gray-900 mb-2">
                                  {question.questionText}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                    {question.type === 'YES_NO' ? 'Sí/No' : 'Texto Libre'}
                                  </span>
                                  {question.isRequired && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                                      Obligatoria
                                    </span>
                                  )}
                                  {question.isCritical && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      Crítica
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {canEdit && (
                              <button
                                onClick={() => handleEdit(question)}
                                className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(question.id)}
                                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                            {!canEdit && !canDelete && (
                              <div className="text-sm text-gray-500 px-3 py-2">
                                Solo lectura
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {Object.keys(groupedQuestions).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay preguntas configuradas</p>
              <p className="text-sm mt-2">Crea tu primera pregunta para comenzar</p>
            </div>
          )}
        </div>
      ) : viewMode === 'tenant' && isSuperAdmin ? (
        /* Vista Agrupada por Tenant */
        <div className="space-y-4">
          {/* Tenants Sections */}
          {Object.entries(groupedByTenant.tenants).map(([tenantId, { tenant, services: tenantServices }]) => {
            const totalQuestions = Object.values(tenantServices).reduce((sum, s) => sum + s.questions.length, 0);
            const totalServices = Object.keys(tenantServices).length;
            
            return (
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
                        {totalQuestions} pregunta(s) en {totalServices} servicio(s) • /{tenant.slug}
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
                  <div className="p-4 pt-0 space-y-4">
                    {totalServices > 0 ? (
                      Object.entries(tenantServices).map(([serviceId, { service, questions: serviceQuestions }]) => (
                        <div key={serviceId} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="w-5 h-5 text-primary-600" />
                              <span className="font-medium text-gray-900">{service.name}</span>
                              <span className="text-sm text-gray-500">({serviceQuestions.length} preguntas)</span>
                            </div>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {serviceQuestions.map((question) => (
                              <div key={question.id} className="p-4 hover:bg-gray-50 flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 font-semibold text-xs flex-shrink-0">
                                    {question.order}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-900">{question.questionText}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                        {question.type === 'YES_NO' ? 'Sí/No' : 'Texto'}
                                      </span>
                                      {question.isRequired && (
                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">Obligatoria</span>
                                      )}
                                      {question.isCritical && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">Crítica</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  {canEdit && (
                                    <button onClick={() => handleEdit(question)} className="text-blue-600 hover:text-blue-700 p-1">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button onClick={() => handleDelete(question.id)} className="text-red-600 hover:text-red-700 p-1">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>Este tenant no tiene preguntas registradas</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {Object.keys(groupedByTenant.tenants).length === 0 && (
            <div className="card text-center py-12">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay preguntas registradas</p>
            </div>
          )}
        </div>
      ) : (
        /* Vista de Lista */
        <div className="space-y-4">
          {filteredQuestions?.map((question) => (
            <div key={question.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {question.questionText}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {question.type === 'YES_NO' ? 'Sí/No' : 'Texto Libre'}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          Servicio: {question.service?.name || 'N/A'}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Orden: {question.order}
                        </span>
                        {question.isRequired && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            Obligatoria
                          </span>
                        )}
                        {question.isCritical && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Crítica
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {canEdit && (
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  {!canEdit && !canDelete && (
                    <div className="text-sm text-gray-500 px-3 py-2">
                      Solo lectura
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredQuestions?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay preguntas configuradas</p>
              {selectedServiceId && <p className="text-sm mt-2">para este servicio</p>}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicio *
                </label>
                <select
                  {...register('serviceId', { required: true })}
                  className="input"
                >
                  <option value="">Seleccionar servicio</option>
                  {services?.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pregunta *
                </label>
                <textarea
                  {...register('questionText', { required: true })}
                  className="input"
                  rows={3}
                  placeholder="¿Tiene alergias a medicamentos?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Respuesta *
                </label>
                <select {...register('type', { required: true })} className="input">
                  <option value="YES_NO">Sí / No</option>
                  <option value="TEXT">Texto Libre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden
                </label>
                <input
                  type="number"
                  {...register('order')}
                  className="input"
                  placeholder="0"
                  defaultValue={0}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Orden en que aparecerá la pregunta (menor número = primero)
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('isRequired')}
                    className="w-4 h-4"
                    defaultChecked
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Pregunta obligatoria
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    {...register('isCritical')}
                    className="w-4 h-4 mt-0.5"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Pregunta crítica
                    </label>
                    <p className="text-xs text-gray-500">
                      Si es crítica, el sistema advertirá al operador si la respuesta es
                      afirmativa
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  {editingQuestion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
