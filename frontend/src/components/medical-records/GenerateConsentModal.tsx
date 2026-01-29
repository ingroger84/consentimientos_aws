import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, FileText, AlertCircle, ExternalLink, PenTool, Camera } from 'lucide-react';
import { medicalRecordsService } from '@/services/medical-records.service';
import { useToast } from '@/hooks/useToast';
import SignaturePad from '@/components/SignaturePad';
import CameraCapture from '@/components/CameraCapture';

interface GenerateConsentModalProps {
  medicalRecordId: string;
  clientId: string;
  clientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ConsentFormData {
  consentType: 'general' | 'procedure' | 'data_treatment' | 'image_rights';
  procedureName?: string;
  diagnosisCode?: string;
  diagnosisDescription?: string;
  requiredForProcedure?: boolean;
  notes?: string;
}

export default function GenerateConsentModal({
  medicalRecordId,
  clientName,
  onClose,
  onSuccess,
}: GenerateConsentModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [signatureData, setSignatureData] = useState<string>('');
  const [clientPhoto, setClientPhoto] = useState<string>('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ConsentFormData>({
    defaultValues: {
      consentType: 'general',
    },
  });

  const consentType = watch('consentType');

  // Función para traducir categorías
  const translateCategory = (category: string | undefined): string => {
    if (!category) return '';
    
    const translations: Record<string, string> = {
      'general': 'General',
      'procedure': 'Procedimiento',
      'treatment': 'Tratamiento',
      'anamnesis': 'Anamnesis',
      'data-treatment': 'Tratamiento de Datos',
      'image-rights': 'Derechos de Imagen',
    };
    
    return translations[category.toLowerCase()] || category;
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      // Usar plantillas HC en lugar de plantillas tradicionales
      const { mrConsentTemplateService } = await import('@/services/mr-consent-template.service');
      const data = await mrConsentTemplateService.getAll();
      setTemplates(data.filter(t => t.isActive));
    } catch (error: any) {
      console.error('Error al cargar plantillas HC:', error);
      
      // Si es un error 403, podría ser un problema de permisos
      if (error.response?.status === 403) {
        toast.error(
          'Error de permisos',
          'No tienes permiso para ver plantillas HC. Haz clic en el botón de actualizar (🔄) en el sidebar para refrescar tus permisos.',
        );
      } else {
        toast.error('Error al cargar plantillas HC');
      }
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId);
      } else {
        return [...prev, templateId];
      }
    });
  };

  const onSubmit = async (data: ConsentFormData) => {
    if (selectedTemplates.length === 0) {
      toast.error('Selecciona al menos una plantilla');
      return;
    }

    if (!signatureData) {
      toast.error('La firma del paciente es obligatoria');
      return;
    }

    try {
      setLoading(true);
      const result = await medicalRecordsService.createConsent(medicalRecordId, {
        ...data,
        templateIds: selectedTemplates,
        signatureData,
        clientPhoto: clientPhoto || undefined,
      });
      
      // Mostrar mensaje de éxito sin abrir el PDF automáticamente
      if (result.pdfUrl) {
        toast.success(
          'Consentimiento generado exitosamente',
          `PDF generado con ${result.consent.templateCount} plantilla(s). Puedes verlo en la pestaña de Consentimientos.`,
        );
      } else {
        toast.success('Consentimiento generado exitosamente');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        'Error al generar consentimiento',
        error.response?.data?.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureSave = (dataUrl: string) => {
    setSignatureData(dataUrl);
    setShowSignaturePad(false);
    toast.success('Firma capturada correctamente');
  };

  const handlePhotoCapture = (dataUrl: string) => {
    setClientPhoto(dataUrl);
    setShowCamera(false);
    toast.success('Foto capturada correctamente');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Generar Consentimiento</h2>
              <p className="text-sm text-gray-600">Para: {clientName}</p>
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
              <p className="font-medium mb-1">Plantillas Específicas para HC</p>
              <p>
                Los datos del paciente y de la historia clínica se llenarán
                automáticamente usando las 38 variables disponibles para HC.
              </p>
              <p className="mt-2 font-medium">
                Puedes seleccionar múltiples plantillas para generar un PDF compuesto.
              </p>
            </div>
          </div>

          {/* Tipo de Consentimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Consentimiento *
            </label>
            <select
              {...register('consentType', { required: 'El tipo de consentimiento es requerido' })}
              className="input"
            >
              <option value="general">General</option>
              <option value="procedure">Procedimiento</option>
              <option value="data_treatment">Tratamiento de Datos</option>
              <option value="image_rights">Derechos de Imagen</option>
            </select>
            {errors.consentType && (
              <p className="text-sm text-red-600 mt-1">
                {errors.consentType.message as string}
              </p>
            )}
          </div>

          {/* Plantillas de Consentimiento HC */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Plantillas de Consentimiento HC *
              </label>
              <a
                href="/mr-consent-templates"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Gestionar plantillas HC
              </a>
            </div>
            
            {loadingTemplates ? (
              <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-center">
                <span className="text-gray-500">Cargando plantillas...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  No hay plantillas HC disponibles.{' '}
                  <a
                    href="/mr-consent-templates"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-amber-900"
                  >
                    Crear plantillas HC ahora
                  </a>
                </p>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg divide-y max-h-60 overflow-y-auto">
                {templates.map((template) => (
                  <label
                    key={template.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.id)}
                      onChange={() => handleTemplateToggle(template.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {template.name}
                        </p>
                        {template.category && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {translateCategory(template.category)}
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            {selectedTemplates.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                {selectedTemplates.length} plantilla(s) seleccionada(s)
              </p>
            )}
            
            {selectedTemplates.length === 0 && !loadingTemplates && templates.length > 0 && (
              <p className="text-xs text-red-600 mt-2">
                Selecciona al menos una plantilla
              </p>
            )}
          </div>

          {/* Campos específicos para procedimiento */}
          {consentType === 'procedure' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Procedimiento *
                </label>
                <input
                  type="text"
                  {...register('procedureName', {
                    required:
                      consentType === 'procedure'
                        ? 'El nombre del procedimiento es requerido'
                        : false,
                  })}
                  className="input"
                  placeholder="Ej: Apendicectomía, Biopsia, Infiltración..."
                />
                {errors.procedureName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.procedureName.message as string}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código CIE-10
                  </label>
                  <input
                    type="text"
                    {...register('diagnosisCode')}
                    className="input"
                    placeholder="Ej: K35.8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    &nbsp;
                  </label>
                  <div className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      {...register('requiredForProcedure')}
                      id="required"
                      className="rounded"
                    />
                    <label htmlFor="required" className="text-sm text-gray-700">
                      Requerido para el procedimiento
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Diagnóstico
                </label>
                <textarea
                  {...register('diagnosisDescription')}
                  className="input"
                  rows={3}
                  placeholder="Descripción detallada del diagnóstico relacionado..."
                />
              </div>
            </>
          )}

          {/* Notas adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              {...register('notes')}
              className="input"
              rows={3}
              placeholder="Información adicional relevante para el consentimiento..."
            />
          </div>

          {/* Firma Digital - OBLIGATORIA */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Firma del Paciente *
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  La firma es obligatoria para generar el consentimiento
                </p>
              </div>
              {signatureData && (
                <button
                  type="button"
                  onClick={() => {
                    setSignatureData('');
                    setShowSignaturePad(true);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Cambiar firma
                </button>
              )}
            </div>

            {!signatureData && !showSignaturePad && (
              <button
                type="button"
                onClick={() => setShowSignaturePad(true)}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center gap-2"
              >
                <PenTool className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Capturar Firma del Paciente
                </span>
                <span className="text-xs text-gray-500">
                  Click para abrir el pad de firma
                </span>
              </button>
            )}

            {signatureData && !showSignaturePad && (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <img
                      src={signatureData}
                      alt="Firma del paciente"
                      className="h-20 w-auto border border-gray-300 bg-white rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700">
                      ✓ Firma capturada correctamente
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      La firma se incluirá en el PDF del consentimiento
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showSignaturePad && (
              <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <SignaturePad onSave={handleSignatureSave} />
              </div>
            )}
          </div>

          {/* Foto del Cliente - OPCIONAL */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Foto del Paciente (Opcional)
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  La foto se incluirá en el PDF junto a la firma
                </p>
              </div>
              {clientPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setClientPhoto('');
                    setShowCamera(true);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Cambiar foto
                </button>
              )}
            </div>

            {!clientPhoto && !showCamera && (
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center gap-2"
              >
                <Camera className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Capturar Foto del Paciente
                </span>
                <span className="text-xs text-gray-500">
                  Click para abrir la cámara
                </span>
              </button>
            )}

            {clientPhoto && !showCamera && (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <img
                      src={clientPhoto}
                      alt="Foto del paciente"
                      className="h-24 w-24 object-cover border border-gray-300 bg-white rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700">
                      ✓ Foto capturada correctamente
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      La foto se incluirá en el PDF del consentimiento
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showCamera && (
              <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <CameraCapture
                  onCapture={handlePhotoCapture}
                  onCancel={() => setShowCamera(false)}
                />
              </div>
            )}
          </div>

          {/* Información sobre el proceso */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-2">
              Próximos pasos:
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Se generará un PDF con todas las plantillas seleccionadas</li>
              <li>El PDF incluirá los datos del paciente y la firma digital</li>
              <li>
                El consentimiento quedará vinculado a esta historia clínica
              </li>
              <li>El PDF estará disponible para descarga inmediata</li>
            </ol>
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
              {loading ? 'Generando...' : 'Generar Consentimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
