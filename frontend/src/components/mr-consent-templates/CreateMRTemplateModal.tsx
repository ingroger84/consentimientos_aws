import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, FileText, AlertCircle } from 'lucide-react';
import { mrConsentTemplateService, CreateMRConsentTemplateDto } from '@/services/mr-consent-template.service';
import { useToast } from '@/hooks/useToast';
import MRVariablesHelper from './MRVariablesHelper';

interface CreateMRTemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMRTemplateModal({
  onClose,
  onSuccess,
}: CreateMRTemplateModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMRConsentTemplateDto>({
    defaultValues: {
      isActive: true,
      isDefault: false,
      requiresSignature: true,
    },
  });

  const content = watch('content');

  const handleInsertVariable = (variable: string) => {
    const currentContent = content || '';
    setValue('content', currentContent + variable);
  };

  const toggleVariables = () => {
    setShowVariables(!showVariables);
    // Scroll suave hacia las variables cuando se muestran
    if (!showVariables) {
      setTimeout(() => {
        const variablesSection = document.getElementById('variables-helper-create');
        if (variablesSection) {
          variablesSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  const onSubmit = async (data: CreateMRConsentTemplateDto) => {
    try {
      setLoading(true);
      await mrConsentTemplateService.create(data);
      toast.success('Plantilla HC creada exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        'Error al crear plantilla HC',
        error.response?.data?.message || 'Ocurrió un error inesperado'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Nueva Plantilla HC</h2>
              <p className="text-sm text-gray-600">
                Crear plantilla de consentimiento para historias clínicas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Plantillas para Historias Clínicas</p>
              <p>
                Estas plantillas son específicas para historias clínicas y tienen acceso
                a 38 variables con datos del paciente, diagnóstico, procedimientos y más.
              </p>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Plantilla *
            </label>
            <input
              type="text"
              {...register('name', { required: 'El nombre es requerido' })}
              className="input"
              placeholder="Ej: Consentimiento para Cirugía"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              {...register('description')}
              className="input"
              rows={2}
              placeholder="Descripción breve de la plantilla..."
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <input
              type="text"
              {...register('category')}
              list="category-suggestions"
              className="input"
              placeholder="Escribe o selecciona una categoría..."
            />
            <datalist id="category-suggestions">
              <option value="general">General</option>
              <option value="procedure">Procedimiento</option>
              <option value="treatment">Tratamiento</option>
              <option value="anamnesis">Anamnesis</option>
            </datalist>
            <p className="text-xs text-gray-500 mt-1">
              Selecciona una categoría sugerida o escribe una personalizada
            </p>
          </div>

          {/* Contenido */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Contenido de la Plantilla *
              </label>
              <button
                type="button"
                onClick={toggleVariables}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showVariables ? 'Ocultar' : 'Ver'} Variables
              </button>
            </div>
            <textarea
              {...register('content', { required: 'El contenido es requerido' })}
              className="input font-mono text-sm"
              rows={12}
              placeholder="Escribe el contenido de la plantilla aquí. Usa {{nombreVariable}} para insertar variables..."
            />
            {errors.content && (
              <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Usa dobles llaves para insertar variables: {`{{patientName}}`}, {`{{diagnosisDescription}}`}, etc.
            </p>
          </div>

          {/* Variables Helper */}
          {showVariables && (
            <div id="variables-helper-create">
              <MRVariablesHelper onInsertVariable={handleInsertVariable} />
            </div>
          )}

          {/* Opciones */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isActive')}
                id="isActive"
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Plantilla activa
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isDefault')}
                id="isDefault"
                className="rounded"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Plantilla predeterminada
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('requiresSignature')}
                id="requiresSignature"
                className="rounded"
              />
              <label htmlFor="requiresSignature" className="text-sm text-gray-700">
                Requiere firma
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Plantilla HC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
