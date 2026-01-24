import { X, FileText } from 'lucide-react';
import { ConsentTemplate, TEMPLATE_TYPE_LABELS } from '../../types/template';

interface Props {
  template: ConsentTemplate;
  onClose: () => void;
}

export default function ViewTemplateModal({ template, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {TEMPLATE_TYPE_LABELS[template.type]}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {template.description && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">{template.description}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
              {template.content}
            </pre>
          </div>

          <div className="mt-4 flex gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Estado:</span>{' '}
              {template.isActive ? (
                <span className="text-green-600">Activa</span>
              ) : (
                <span className="text-gray-500">Inactiva</span>
              )}
            </div>
            <div>
              <span className="font-medium">Predeterminada:</span>{' '}
              {template.isDefault ? (
                <span className="text-yellow-600">Sí</span>
              ) : (
                <span className="text-gray-500">No</span>
              )}
            </div>
            <div>
              <span className="font-medium">Actualizada:</span>{' '}
              {new Date(template.updatedAt).toLocaleString('es-CO')}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
