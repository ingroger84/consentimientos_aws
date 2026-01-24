import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { templateService } from '../../services/template.service';

interface Props {
  onInsert: (variable: string) => void;
}

export default function VariablesHelper({ onInsert }: Props) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  useEffect(() => {
    loadVariables();
  }, []);

  const loadVariables = async () => {
    try {
      const vars = await templateService.getAvailableVariables();
      setVariables(vars);
    } catch (error) {
      console.error('Error al cargar variables:', error);
    }
  };

  const handleCopy = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="text-sm font-semibold text-blue-900 mb-2">
        Variables Disponibles
      </h4>
      <p className="text-xs text-blue-700 mb-3">
        Haz clic en una variable para insertarla en el cursor, o copia el código
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.entries(variables).map(([key, description]) => (
          <div
            key={key}
            className="flex items-center justify-between p-2 bg-white rounded border border-blue-200 hover:border-blue-400 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <button
                type="button"
                onClick={() => onInsert(key)}
                className="text-left w-full"
              >
                <code className="text-xs font-mono text-blue-600 block">
                  {`{{${key}}}`}
                </code>
                <span className="text-xs text-gray-600 block truncate">
                  {description}
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(key)}
              className="ml-2 p-1 text-gray-400 hover:text-blue-600 flex-shrink-0"
              title="Copiar"
            >
              {copiedVar === key ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
