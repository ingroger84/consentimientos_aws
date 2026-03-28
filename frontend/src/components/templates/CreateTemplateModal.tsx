import { useState, useEffect } from 'react';
import { X, Info, Tag } from 'lucide-react';
import { templateService } from '../../services/template.service';
import { serviceService } from '../../services/service.service';
import { CreateTemplateDto, TemplateType, TEMPLATE_TYPE_LABELS, Service } from '../../types/template';
import VariablesHelper from './VariablesHelper';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTemplateModal({ onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<CreateTemplateDto>({
    name: '',
    type: TemplateType.PROCEDURE,
    content: '',
    description: '',
    isActive: true,
    serviceIds: [],
  });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState('');
  const [showVariables, setShowVariables] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const data = await serviceService.getAll();
      setServices(data.filter(s => s.isActive));
    } catch (err) {
      console.error('Error al cargar servicios:', err);
      setError('Error al cargar la lista de servicios');
    } finally {
      setLoadingServices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.content.trim()) {
      setError('El nombre y el contenido son obligatorios');
      return;
    }

    if (formData.serviceIds.length === 0) {
      setError('Debe seleccionar al menos un servicio');
      return;
    }

    try {
      setLoading(true);
      await templateService.create(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear plantilla');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newContent = before + `{{${variable}}}` + after;
    
    setFormData({ ...formData, content: newContent });
    
    // Restaurar el foco y posición del cursor
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variable.length + 4;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Nueva Plantilla</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Plantilla *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TemplateType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {Object.entries(TEMPLATE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Plantilla *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Consentimiento Quirúrgico Estándar"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción breve de la plantilla"
              />
            </div>

            {/* Servicios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servicios Asociados *
              </label>
              {loadingServices ? (
                <div className="text-sm text-gray-500 py-2">Cargando servicios...</div>
              ) : services.length === 0 ? (
                <div className="text-sm text-amber-600 py-2 bg-amber-50 px-3 rounded-lg border border-amber-200">
                  No hay servicios disponibles. Crea servicios primero para poder asociarlos a plantillas.
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {services.map(service => (
                    <label
                      key={service.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.serviceIds.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{service.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Selecciona los servicios a los que aplica esta plantilla. Los clientes recibirán esta plantilla solo cuando contraten estos servicios.
              </p>
              {formData.serviceIds.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {formData.serviceIds.length} servicio{formData.serviceIds.length !== 1 ? 's' : ''} seleccionado{formData.serviceIds.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Contenido */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Contenido de la Plantilla *
                </label>
                <button
                  type="button"
                  onClick={() => setShowVariables(!showVariables)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Info className="w-4 h-4" />
                  {showVariables ? 'Ocultar' : 'Ver'} Variables
                </button>
              </div>
              
              {showVariables && (
                <VariablesHelper onInsert={insertVariable} />
              )}

              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={15}
                placeholder="Escribe el contenido de la plantilla aquí. Usa {{nombreVariable}} para insertar variables dinámicas."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Usa variables como {`{{clientName}}`} para insertar datos dinámicos
              </p>
            </div>

            {/* Opciones */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Plantilla activa</span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Plantilla'}
          </button>
        </div>
      </div>
    </div>
  );
}
