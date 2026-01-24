import { useState, useEffect } from 'react';
import { Plus, FileText, Edit, Trash2, Star, Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { templateService } from '../services/template.service';
import { ConsentTemplate, TEMPLATE_TYPE_LABELS, TemplateType } from '../types/template';
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import CreateTemplateModal from '../components/templates/CreateTemplateModal';
import EditTemplateModal from '../components/templates/EditTemplateModal';
import ViewTemplateModal from '../components/templates/ViewTemplateModal';

export default function ConsentTemplatesPage() {
  const { hasPermission } = usePermissions();
  const toast = useToast();
  const confirm = useConfirm();
  const [templates, setTemplates] = useState<ConsentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConsentTemplate | null>(null);
  const [filterType, setFilterType] = useState<TemplateType | 'all'>('all');
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getAll();
      setTemplates(data);
    } catch (error: any) {
      console.error('Error al cargar plantillas:', error);
      toast.error('Error al cargar plantillas', error.response?.data?.message || 'No se pudieron cargar las plantillas');
    } finally {
      setLoading(false);
    }
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

  const handleSetAsDefault = async (template: ConsentTemplate) => {
    const confirmed = await confirm({
      title: '¿Marcar como predeterminada?',
      message: `¿Deseas marcar "${template.name}" como plantilla predeterminada?`,
      type: 'warning'
    });
    
    if (!confirmed) return;

    try {
      await templateService.setAsDefault(template.id);
      await loadTemplates();
      toast.success('Plantilla predeterminada', 'La plantilla fue marcada como predeterminada exitosamente');
    } catch (error: any) {
      toast.error('Error al actualizar', error.response?.data?.message || 'No se pudo establecer la plantilla como predeterminada');
    }
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

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.type]) {
      acc[template.type] = [];
    }
    acc[template.type].push(template);
    return acc;
  }, {} as Record<TemplateType, ConsentTemplate[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plantillas de Consentimiento</h1>
        <p className="text-gray-600 mt-1">
          Gestiona las plantillas de texto para los consentimientos
        </p>
      </div>

      {/* Filter */}
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

      {/* Templates List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Cargando plantillas...
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay plantillas registradas
          </h3>
          <p className="text-gray-600 mb-6">
            Crea plantillas personalizadas o inicializa las plantillas predeterminadas con contenido legal estándar
          </p>
          <div className="flex gap-4 justify-center">
            {hasPermission('create_templates') && (
              <>
                <button
                  onClick={handleInitializeDefaults}
                  disabled={initializing}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-5 h-5 ${initializing ? 'animate-spin' : ''}`} />
                  {initializing ? 'Creando...' : 'Crear Plantillas Predeterminadas'}
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Plantilla Personalizada
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
            <div key={type} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  {TEMPLATE_TYPE_LABELS[type as TemplateType]}
                </h2>
              </div>
              <div className="divide-y">
                {typeTemplates.map((template) => (
                  <div key={template.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {template.name}
                              </h3>
                              {template.isDefault && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                  <Star className="w-3 h-3" />
                                  Predeterminada
                                </span>
                              )}
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
                            <p className="text-xs text-gray-500 mt-2">
                              Actualizada: {new Date(template.updatedAt).toLocaleDateString('es-CO')}
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
                        {!template.isDefault && hasPermission('edit_templates') && (
                          <button
                            onClick={() => handleSetAsDefault(template)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                            title="Marcar como predeterminada"
                          >
                            <Star className="w-5 h-5" />
                          </button>
                        )}
                        {hasPermission('edit_templates') && (
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {hasPermission('delete_templates') && !template.isDefault && (
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
                ))}
              </div>
            </div>
          ))}
        </div>
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
