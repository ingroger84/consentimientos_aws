import { useState } from 'react';
import { FileText, Eye, CheckCircle, AlertCircle } from 'lucide-react';

interface ConsentPreviewProps {
  title: string;
  clientName: string;
  serviceName?: string;
  branchName?: string;
  templateContent?: string; // Contenido de la plantilla del servicio (para CN)
  templatesWithContent?: Array<{ // Plantillas con contenido (para HC)
    name: string;
    content: string;
  }>;
  questions?: Array<{
    questionText: string;
    answer: string;
    isCritical?: boolean;
  }>;
  templates?: Array<{
    name: string;
    description?: string;
    category?: string;
  }>;
  consentType?: string;
  procedureName?: string;
  notes?: string;
  onContinue: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function ConsentPreview({
  title,
  clientName,
  serviceName,
  branchName,
  templateContent,
  templatesWithContent = [],
  questions = [],
  templates = [],
  consentType,
  procedureName,
  notes,
  onContinue,
  onBack,
  isLoading = false,
}: ConsentPreviewProps) {
  const [hasRead, setHasRead] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const translateConsentType = (type: string | undefined): string => {
    if (!type) return '';
    const translations: Record<string, string> = {
      'general': 'General',
      'procedure': 'Procedimiento',
      'data_treatment': 'Tratamiento de Datos',
      'image_rights': 'Derechos de Imagen',
    };
    return translations[type] || type;
  };

  const hasCriticalAnswers = questions.some(q => q.isCritical && q.answer.toLowerCase() === 'sí');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Eye className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">
            Revisa la información antes de continuar con la firma
          </p>
        </div>
      </div>

      {/* Alert Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">Vista Previa del Consentimiento</p>
          <p>
            Por favor, revisa cuidadosamente toda la información antes de proceder con la firma digital.
            Una vez firmado, el consentimiento será generado y no podrá ser modificado.
          </p>
        </div>
      </div>

      {/* Preview Card */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Header del Preview */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Consentimiento Informado</h3>
              <p className="text-sm text-blue-100">Para: {clientName}</p>
            </div>
          </div>
        </div>

        {/* Content del Preview */}
        <div className="bg-white">
          {/* Información Básica */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Información Básica</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Paciente:</span>
                <p className="font-medium text-gray-900">{clientName}</p>
              </div>
              {serviceName && (
                <div>
                  <span className="text-gray-600">Servicio:</span>
                  <p className="font-medium text-gray-900">{serviceName}</p>
                </div>
              )}
              {branchName && (
                <div>
                  <span className="text-gray-600">Sede:</span>
                  <p className="font-medium text-gray-900">{branchName}</p>
                </div>
              )}
              {consentType && (
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <p className="font-medium text-gray-900">{translateConsentType(consentType)}</p>
                </div>
              )}
              {procedureName && (
                <div className="col-span-2">
                  <span className="text-gray-600">Procedimiento:</span>
                  <p className="font-medium text-gray-900">{procedureName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contenido de la Plantilla del Servicio (para CN) */}
          {templateContent && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Contenido del Consentimiento
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {templateContent}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Este es el contenido completo del consentimiento que se incluirá en el PDF
              </p>
            </div>
          )}

          {/* Plantillas Seleccionadas (para HC) */}
          {templates.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Plantillas Incluidas ({templates.length})
              </h4>
              <div className="space-y-2">
                {templates.map((template, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{template.name}</p>
                      {template.description && (
                        <p className="text-xs text-gray-600">{template.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contenido de las Plantillas HC */}
          {templatesWithContent.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Contenido de las Plantillas
              </h4>
              <div className="space-y-4">
                {templatesWithContent.map((template, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-blue-900">{template.name}</p>
                    </div>
                    <div className="bg-gray-50 p-4 max-h-64 overflow-y-auto">
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                        {template.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Estos son los contenidos completos de las plantillas que se incluirán en el PDF
              </p>
            </div>
          )}

          {/* Preguntas y Respuestas (para CN) */}
          {questions.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Preguntas de Restricciones ({questions.length})
              </h4>
              <div className="space-y-3">
                {questions.slice(0, showFullPreview ? questions.length : 3).map((q, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      q.isCritical && q.answer.toLowerCase() === 'sí'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {q.isCritical && q.answer.toLowerCase() === 'sí' && (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {q.questionText}
                          {q.isCritical && (
                            <span className="ml-2 text-xs text-red-600">(Crítica)</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-semibold">Respuesta:</span> {q.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {questions.length > 3 && !showFullPreview && (
                  <button
                    type="button"
                    onClick={() => setShowFullPreview(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver todas las preguntas ({questions.length - 3} más)
                  </button>
                )}
                {showFullPreview && questions.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowFullPreview(false)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver menos
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Notas Adicionales */}
          {notes && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Notas Adicionales</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
            </div>
          )}

          {/* Advertencias */}
          {hasCriticalAnswers && (
            <div className="px-6 py-4 bg-red-50 border-t border-red-200">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-red-900 mb-1">
                    Atención: Respuestas Críticas Detectadas
                  </p>
                  <p className="text-red-800">
                    El paciente ha respondido afirmativamente a una o más preguntas críticas.
                    Por favor, revisa cuidadosamente antes de continuar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmación de Lectura */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasRead}
            onChange={(e) => setHasRead(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="text-sm">
            <p className="font-medium text-gray-900">
              He revisado toda la información y confirmo que es correcta
            </p>
            <p className="text-gray-600 mt-1">
              Al marcar esta casilla, confirmas que has leído y verificado todos los datos
              antes de proceder con la firma digital.
            </p>
          </div>
        </label>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          Volver a Editar
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!hasRead || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Continuar a Firma
              <CheckCircle className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
