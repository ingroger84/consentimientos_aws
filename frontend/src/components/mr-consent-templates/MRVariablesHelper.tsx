import { useState, useEffect } from 'react';
import { Info, Copy, Check } from 'lucide-react';
import { mrConsentTemplateService } from '@/services/mr-consent-template.service';

interface MRVariablesHelperProps {
  onInsertVariable?: (variable: string) => void;
}

interface VariableInfo {
  key: string;
  label: string;
  example: string;
}

interface GroupedVariables {
  [category: string]: VariableInfo[];
}

export default function MRVariablesHelper({ onInsertVariable }: MRVariablesHelperProps) {
  const [variables, setVariables] = useState<GroupedVariables>({});
  const [loading, setLoading] = useState(true);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVariables();
  }, []);

  const loadVariables = async () => {
    try {
      const data = await mrConsentTemplateService.getAvailableVariables();
      setVariables(data);
    } catch (error) {
      console.error('Error al cargar variables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyVariable = (variable: string) => {
    const variableText = `{{${variable}}}`;
    navigator.clipboard.writeText(variableText);
    setCopiedVariable(variable);
    setTimeout(() => setCopiedVariable(null), 2000);

    if (onInsertVariable) {
      onInsertVariable(variableText);
    }
  };

  // Filtrar variables por término de búsqueda
  const filteredVariables: GroupedVariables = {};
  Object.entries(variables).forEach(([category, vars]) => {
    const filtered = vars.filter(
      (v) =>
        v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      filteredVariables[category] = filtered;
    }
  });

  // Mapeo de nombres de categorías
  const categoryNames: Record<string, string> = {
    patient: 'Datos del Paciente',
    medicalRecord: 'Historia Clínica',
    diagnosis: 'Diagnóstico',
    treatment: 'Tratamiento y Procedimientos',
    doctor: 'Profesional de Salud',
    facility: 'Sede y Empresa',
    consent: 'Consentimiento',
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">Cargando variables...</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-blue-900 mb-1">
            Variables Disponibles para Plantillas HC
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Haz clic en una variable para copiarla. Las variables se reemplazan automáticamente
            con los datos de la historia clínica al generar el consentimiento.
          </p>

          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar variable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Variables agrupadas */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(filteredVariables).map(([category, vars]) => {
              const categoryLabel = categoryNames[category] || category;

              return (
                <div key={category}>
                  <h4 className="font-medium text-blue-900 text-sm mb-2">{categoryLabel}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {vars.map((variable) => (
                      <button
                        key={variable.key}
                        onClick={() => handleCopyVariable(variable.key)}
                        className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left group"
                      >
                        <div className="flex-1 min-w-0">
                          <code className="text-xs font-mono text-blue-800 block">
                            {`{{${variable.key}}}`}
                          </code>
                          <span className="text-xs text-gray-700 block font-medium">
                            {variable.label}
                          </span>
                          <span className="text-xs text-gray-500 block truncate italic">
                            Ej: {variable.example}
                          </span>
                        </div>
                        {copiedVariable === variable.key ? (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Copy className="w-4 h-4 text-blue-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {Object.keys(filteredVariables).length === 0 && (
            <p className="text-sm text-blue-600 text-center py-4">
              No se encontraron variables que coincidan con "{searchTerm}"
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-600">
              <strong>Total de variables:</strong>{' '}
              {Object.values(variables).reduce((acc, vars) => acc + vars.length, 0)} disponibles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
