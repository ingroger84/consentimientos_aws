import { X, AlertCircle, Mail, TrendingUp, Phone, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResourceLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: 'users' | 'branches' | 'consents' | 'services';
  currentCount: number;
  maxLimit: number;
  level?: 'warning' | 'critical' | 'blocked';
}

export default function ResourceLimitModal({
  isOpen,
  onClose,
  resourceType,
  currentCount,
  maxLimit,
  level = 'blocked',
}: ResourceLimitModalProps) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const percentage = (currentCount / maxLimit) * 100;

  const resourceNames = {
    users: 'usuarios',
    branches: 'sedes',
    consents: 'consentimientos',
    services: 'servicios',
  };

  const resourceName = resourceNames[resourceType];

  const handleContactSupport = () => {
    window.location.href = `mailto:soporte@sistema.com?subject=Solicitud de aumento de límite - ${resourceName}&body=Hola,%0D%0A%0D%0AEstoy alcanzando el límite de ${resourceName} en mi cuenta.%0D%0A%0D%0AUso actual: ${currentCount} / ${maxLimit} (${percentage.toFixed(1)}%)%0D%0A%0D%0APor favor, ayúdame a aumentar mi límite o actualizar mi plan.%0D%0A%0D%0AGracias.`;
  };

  // Configuración según el nivel
  const config = {
    warning: {
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      barColor: 'bg-yellow-600',
      barBgColor: 'bg-yellow-200',
      title: 'Acercándose al Límite',
      message: `Estás usando ${currentCount} de ${maxLimit} ${resourceName} disponibles (${percentage.toFixed(1)}%).`,
      advice: 'Considera actualizar tu plan pronto para evitar interrupciones.',
    },
    critical: {
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600',
      barColor: 'bg-orange-600',
      barBgColor: 'bg-orange-200',
      title: '⚠️ Límite Casi Alcanzado',
      message: `¡Atención! Estás usando ${currentCount} de ${maxLimit} ${resourceName} (${percentage.toFixed(1)}%).`,
      advice: 'Pronto no podrás crear más recursos. Contacta al administrador urgentemente.',
    },
    blocked: {
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      barColor: 'bg-red-600',
      barBgColor: 'bg-red-200',
      title: '🚫 Límite Alcanzado',
      message: `Has alcanzado el límite máximo de ${resourceName}.`,
      advice: 'No podrás crear más recursos hasta que contactes al administrador.',
    },
  };

  const currentConfig = config[level];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${currentConfig.bgColor} rounded-full flex items-center justify-center`}>
              <AlertCircle className={`w-6 h-6 ${currentConfig.iconColor}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentConfig.title}</h2>
              <p className="text-sm text-gray-500">Plan actual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className={`${currentConfig.bgColor} border ${currentConfig.borderColor} rounded-lg p-4 mb-4`}>
            <p className={`text-sm ${currentConfig.textColor} font-medium mb-2`}>
              {currentConfig.message}
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs ${currentConfig.textColor}`}>Uso actual:</span>
              <span className={`text-sm font-bold ${currentConfig.textColor}`}>
                {currentCount} / {maxLimit}
              </span>
            </div>
            <div className={`w-full ${currentConfig.barBgColor} rounded-full h-2.5`}>
              <div
                className={`${currentConfig.barColor} h-2.5 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className={`text-xs ${currentConfig.textColor} mt-2`}>
              {currentConfig.advice}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-700 font-medium">
              Para continuar usando el sistema:
            </p>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Contactar al administrador
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Solicita un aumento de límite para tu cuenta actual
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Actualizar tu plan
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Obtén más recursos y funcionalidades avanzadas
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Soporte telefónico
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Llámanos para asistencia inmediata
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Entendido
          </button>
          <button
            onClick={handleContactSupport}
            className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contactar Soporte
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              navigate('/pricing');
              onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ver planes disponibles</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
