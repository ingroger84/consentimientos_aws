import { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Star, Search, Filter } from 'lucide-react';
import {
  mrConsentTemplateService,
  MRConsentTemplate,
} from '@/services/mr-consent-template.service';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/store/authStore';
import CreateMRTemplateModal from '@/components/mr-consent-templates/CreateMRTemplateModal';
import EditMRTemplateModal from '@/components/mr-consent-templates/EditMRTemplateModal';

export default function MRConsentTemplatesPage() {
  const toast = useToast();
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<MRConsentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MRConsentTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Verificar permisos
  const canEdit = user?.role?.permissions?.includes('edit_mr_consent_templates') || false;
  const canDelete = user?.role?.permissions?.includes('delete_mr_consent_templates') || false;
  const canCreate = user?.role?.permissions?.includes('create_mr_consent_templates') || false;

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await mrConsentTemplateService.getAll();
      setTemplates(data);
    } catch (error: any) {
      toast.error('Error al cargar plantillas HC', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (template: MRConsentTemplate) => {
    if (template.isDefault) {
      toast.error(
        'No se puede eliminar',
        'No puedes eliminar una plantilla predeterminada. Primero marca otra como predeterminada.'
      );
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la plantilla "${template.name}"?`)) {
      return;
    }

    try {
      await mrConsentTemplateService.delete(template.id);
      toast.success('Plantilla HC eliminada exitosamente');
      loadTemplates();
    } catch (error: any) {
      toast.error('Error al eliminar plantilla HC', error.response?.data?.message);
    }
  };

  const handleSetDefault = async (template: MRConsentTemplate) => {
    if (!template.category) {
      toast.error(
        'No se puede marcar como predeterminada',
        'La plantilla debe tener una categoría asignada.'
      );
      return;
    }

    try {
      await mrConsentTemplateService.setAsDefault(template.id);
      toast.success('Plantilla marcada como predeterminada');
      loadTemplates();
    } catch (error: any) {
      toast.error('Error al marcar como predeterminada', error.response?.data?.message);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || template.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && template.isActive) ||
      (statusFilter === 'inactive' && !template.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;

    // Colores predefinidos para categorías conocidas
    const predefinedBadges: Record<string, string> = {
      general: 'bg-blue-100 text-blue-800',
      procedure: 'bg-purple-100 text-purple-800',
      treatment: 'bg-green-100 text-green-800',
      anamnesis: 'bg-orange-100 text-orange-800',
    };

    const predefinedLabels: Record<string, string> = {
      general: 'General',
      procedure: 'Procedimiento',
      treatment: 'Tratamiento',
      anamnesis: 'Anamnesis',
    };

    // Si es una categoría predefinida, usar su estilo
    const badgeClass = predefinedBadges[category] || 'bg-gray-100 text-gray-800';
    const label = predefinedLabels[category] || category;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Plantillas de Consentimiento HC</h1>
              <p className="text-gray-600">
                Gestiona plantillas específicas para historias clínicas
              </p>
            </div>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Plantilla HC
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar plantillas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">Todas las categorías</option>
              <option value="general">General</option>
              <option value="procedure">Procedimiento</option>
              <option value="treatment">Tratamiento</option>
              <option value="anamnesis">Anamnesis</option>
              {/* Mostrar categorías personalizadas */}
              {Array.from(new Set(templates.map(t => t.category).filter(c => c && !['general', 'procedure', 'treatment', 'anamnesis'].includes(c)))).map(customCat => (
                <option key={customCat} value={customCat}>{customCat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500">Cargando plantillas HC...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No se encontraron plantillas HC</p>
          {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' ? (
            <p className="text-sm text-gray-400">
              Intenta ajustar los filtros de búsqueda
            </p>
          ) : (
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear la primera plantilla HC
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                      {template.isDefault && (
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      )}
                      {!template.isActive && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          Inactiva
                        </span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {getCategoryBadge(template.category)}
                      <span>
                        Actualizado: {new Date(template.updatedAt).toLocaleDateString('es-CO')}
                      </span>
                      {template.creator && (
                        <span>Por: {template.creator.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit && !template.isDefault && template.category && (
                      <button
                        onClick={() => handleSetDefault(template)}
                        className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Marcar como predeterminada"
                      >
                        <Star className="w-5 h-5" />
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => setEditingTemplate(template)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(template)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Vista previa:</p>
                  <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap line-clamp-3">
                    {template.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 bg-white rounded-lg border p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{templates.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {templates.filter((t) => t.isActive).length}
            </p>
            <p className="text-sm text-gray-600">Activas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {templates.filter((t) => t.isDefault).length}
            </p>
            <p className="text-sm text-gray-600">Predeterminadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {new Set(templates.map((t) => t.category).filter(Boolean)).size}
            </p>
            <p className="text-sm text-gray-600">Categorías</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateMRTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadTemplates}
        />
      )}

      {editingTemplate && (
        <EditMRTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSuccess={loadTemplates}
        />
      )}
    </div>
  );
}
