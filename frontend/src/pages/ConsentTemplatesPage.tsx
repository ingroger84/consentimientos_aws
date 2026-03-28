import { useState, useEffect } from 'react';
import { Plus, FileText, Edit, Trash2, Eye, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { templateService } from '../services/template.service';
import { ConsentTemplate, TEMPLATE_TYPE_LABELS, TemplateType } from '../types/template';
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import { useAuthStore } from '../store/authStore';
import CreateTemplateModal from '../components/templates/CreateTemplateModal';
import EditTemplateModal from '../components/templates/EditTemplateModal';
import ViewTemplateModal from '../components/templates/ViewTemplateModal';

export default function ConsentTemplatesPage() {
  const { hasPermission } = usePermissions();
  const { user } = useAuthStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [templates, setTemplates] = useState<ConsentTemplate[]>([]);
  const [groupedTemplates, setGroupedTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConsentTemplate | null>(null);
  const [filterType, setFilterType] = useState<TemplateType | 'all'>('all');
  const [initializing, setInitializing] = useState(false);
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set());

  // Verificar si el usuario es Super Admin
  const isSuperAdmin = user && !user.tenant;

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      if (isSuperAdmin) {
        // Super Admin: cargar plantillas agrupadas por tenant
        const grouped = await templateService.getAllGroupedByTenant();
        setGroupedTemplates(grouped);
      } else {
        // Tenant: cargar solo sus plantillas
        const data = await templateService.getAll();
        setTemplates(data);
      }
    } catch (error: any) {
      console.error('Error al cargar plantillas:', error);
      toast.error('Error al cargar plantillas', error.response?.data?.message || 'No se pudieron cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateTemplate = () => {
    setShowCreateModal(false);
    loadTemplates();
  };

  const handleEditTemplate = (template: ConsentTemplate) => {
    setSelectedTemplate(template);
    setShowEditModal(true);
  };

  const handleUpdateTemplate = () => {
    setShowEditModal(false);
    setSelectedTemplate(null);
    loadTemplates();
  };

  const handleViewTemplate = (template: ConsentTemplate) => {
    setSelectedTemplate(template);
    setShowViewModal(true);
  };

  const handleDeleteTemplate = async (template: ConsentTemplate) => {
    const confirmed = await confirm({
      title: '¿Eliminar plantilla?',
      message: `¿Estás seguro de eliminar la plantilla "${template.name}"? Esta acción no se puede deshacer.`,
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      await templateService.delete(template.id);
      await loadTemplates();
      toast.success('Plantilla eliminada', 'La plantilla fue eliminada exitosamente');
    } catch (error: any) {
      toast.error('Error al eliminar', error.response?.data?.message || 'No se pudo eliminar la plantilla');
    }
  };

  const handleInitializeDefaults = async () => {
    const confirmed = await confirm({
      title: '¿Crear plantillas predeterminadas?',
      message: 'Se crearán 3 plantillas con contenido legal estándar colombiano que podrás editar según tus necesidades.',
      type: 'info'
    });
    
    if (!confirmed) return;

    try {
      setInitializing(true);
      const result = await templateService.initializeDefaults();
      await loadTemplates();
      toast.success(
        '¡Plantillas creadas!', 
        `Se crearon ${result.count} plantillas predeterminadas exitosamente. Ahora puedes editarlas según tus necesidades.`,
        5000
      );
    } catch (error: any) {
      toast.error(
        'Error al crear plantillas', 
        error.response?.data?.message || 'No se pudieron crear las plantillas predeterminadas'
      );
    } finally {
      setInitializing(false);
    }
  };

  const filteredTemplates = filterType === 'all' 
    ? templates 
    : templates.filter(t => t.type === filterType);

  const groupedByType = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.type]) {
      acc[template.type] = [];
    }
    acc[template.type].push(template);
    return acc;
  }, {} as Record<TemplateType, ConsentTemplate[]>);

  const renderTemplateCard = (template: any) => (
    <div key={template.id} className="p-6 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-medium text-gray-900">
                  {template.name}
                </h3>

                {template.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    <CheckCircle className="w-3 h-3" />
                    Activa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                    <XCircle className="w-3 h-3" />
                    Inactiva
                  </span>
                )}
              </div>
              {template.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {template.description}
                </p>
              )}
              {template.services && template.services.length > 0 && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs text-gray-500">Servicios:</span>
                  {template.services.map((service: any) => (
                    <span
                      key={service.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {service.name}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Tipo: {TEMPLATE_TYPE_LABELS[template.type as TemplateType]} • 
                Actualizada: {new Date(template.createdAt).toLocaleDateString('es-CO')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => handleViewTemplate(template)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Ver plantilla"
          >
            <Eye className="w-5 h-5" />
          </button>

          {(isSuperAdmin || hasPermission('edit_templates')) && (
            <button
              onClick={() => handleEditTemplate(template)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
              title="Editar"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
          {(isSuperAdmin || hasPermission('delete_templates')) && (
            <button
              onClick={() => handleDeleteTemplate(template)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              title="Eliminar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantillas de Consentimiento</h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin 
              ? 'Gestiona las plantillas de texto para los consentimientos de todas las cuentas'
              : 'Gestiona las plantillas de texto para los consentimientos'
            }
          </p>
        </div>
        
        {(isSuperAdmin || hasPermission('create_templates')) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Plantilla
          </button>
        )}
      </div>

      {/* Filter (solo para tenants) */}
      {!isSuperAdmin && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {Object.entries(TEMPLATE_TYPE_LABELS).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setFilterType(type as TemplateType)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Templates List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Cargando plantillas...
        </div>
      ) : isSuperAdmin ? (
        /* Vista agrupada por tenant para Super Admin */
        <div className="space-y-4">
          {groupedTemplates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay plantillas registradas
              </h3>
            </div>
          ) : (
            groupedTemplates.map((group) => {
              const isExpanded = expandedTenants.has(group.tenantId || 'no-tenant');
              
              return (
                <div key={group.tenantId || 'no-tenant'} className="bg-white rounded-lg shadow overflow-hidden">
                  <button
                    onClick={() => toggleTenant(group.tenantId || 'no-tenant')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{group.tenantName}</h3>
                        <p className="text-sm text-gray-500">
                          {group.totalTemplates} plantilla{group.totalTemplates !== 1 ? 's' : ''} • 
                          {' '}{group.activeTemplates} activa{group.activeTemplates !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-purple-600">
                        {group.procedureTemplates} Procedimiento
                      </span>
                      <span className="text-green-600">
                        {group.dataTreatmentTemplates} Datos
                      </span>
                      <span className="text-orange-600">
                        {group.imageRightsTemplates} Imagen
                      </span>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t divide-y">
                      {group.templates.map((template: any) => renderTemplateCard(template))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Vista normal para tenants */
        filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay plantillas registradas
            </h3>
            <p className="text-gray-600 mb-6">
              Crea plantillas personalizadas o inicializa las plantillas predeterminadas con contenido legal estándar
            </p>
            {hasPermission('create_templates') && (
              <button
                onClick={handleInitializeDefaults}
                disabled={initializing}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
              >
                <RefreshCw className={`w-5 h-5 ${initializing ? 'animate-spin' : ''}`} />
                {initializing ? 'Creando...' : 'Crear Plantillas Predeterminadas'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByType).map(([type, typeTemplates]) => (
              <div key={type} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {TEMPLATE_TYPE_LABELS[type as TemplateType]}
                  </h2>
                </div>
                <div className="divide-y">
                  {typeTemplates.map((template) => renderTemplateCard(template))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateTemplate}
        />
      )}

      {showEditModal && selectedTemplate && (
        <EditTemplateModal
          template={selectedTemplate}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTemplate(null);
          }}
          onSuccess={handleUpdateTemplate}
        />
      )}

      {showViewModal && selectedTemplate && (
        <ViewTemplateModal
          template={selectedTemplate}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
}
