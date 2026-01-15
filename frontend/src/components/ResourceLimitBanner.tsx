import { AlertTriangle, AlertCircle, X, TrendingUp, Mail } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ResourceLimitBannerProps {
  resourceType: 'users' | 'branches' | 'consents' | 'services';
  currentCount: number;
  maxLimit: number;
  onDismiss?: () => void;
}

export default function ResourceLimitBanner({
  resourceType,
  currentCount,
  maxLimit,
  onDismiss,
}: ResourceLimitBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  const percentage = (currentCount / maxLimit) * 100;

  // No mostrar si está por debajo del 70%
  if (percentage < 70 || isDismissed) {
    return null;
  }

  const resourceNames = {
    users: 'usuarios',
    branches: 'sedes',
    consents: 'consentimientos',
    services: 'servicios',
  };

  const resourceName = resourceNames[resourceType];

  // Determinar el nivel de alerta
  const isWarning = percentage >= 70 && percentage < 90;
  const isCritical = percentage >= 90 && percentage < 100;
  const isBlocked = percentage >= 100;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleContactSupport = () => {
    window.location.href = `mailto:soporte@sistema.com?subject=Solicitud de aumento de límite - ${resourceName}&body=Hola,%0D%0A%0D%0AEstoy alcanzando el límite de ${resourceName} en mi cuenta.%0D%0A%0D%0AUso actual: ${currentCount} / ${maxLimit} (${percentage.toFixed(1)}%)%0D%0A%0D%0APor favor, ayúdame a aumentar mi límite o actualizar mi plan.%0D%0A%0D%0AGracias.`;
  };

  // Banner de Advertencia (70-89%)
  if (isWarning) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Te estás acercando al límite de {resourceName}
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Estás usando <strong>{currentCount} de {maxLimit}</strong> {resourceName} disponibles ({percentage.toFixed(1)}%).
                  </p>
                  <p className="mt-1">
                    Considera actualizar tu plan para evitar interrupciones en tu servicio.
                  </p>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={handleContactSupport}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <Mail className="w-3 h-3 mr-1.5" />
                    Contactar Soporte
                  </button>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <TrendingUp className="w-3 h-3 mr-1.5" />
                    Ver Planes
                  </button>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={handleDismiss}
                  className="inline-flex text-yellow-400 hover:text-yellow-600 focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Banner Crítico (90-99%)
  if (isCritical) {
    return (
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4 animate-pulse">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-orange-800">
                  ⚠️ ¡Límite casi alcanzado! - {resourceName}
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>
                    <strong>¡Atención!</strong> Estás usando <strong>{currentCount} de {maxLimit}</strong> {resourceName} ({percentage.toFixed(1)}%).
                  </p>
                  <p className="mt-1 font-medium">
                    Pronto no podrás crear más {resourceName}. Contacta al administrador urgentemente.
                  </p>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-orange-200 rounded-full h-2.5">
                    <div
                      className="bg-orange-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={handleContactSupport}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contactar Ahora
                  </button>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="inline-flex items-center px-4 py-2 border border-orange-600 text-sm font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Actualizar Plan
                  </button>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={handleDismiss}
                  className="inline-flex text-orange-400 hover:text-orange-600 focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Banner Bloqueado (100%)
  if (isBlocked) {
    return (
      <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-base font-bold text-red-800">
                  🚫 Límite alcanzado - {resourceName}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p className="font-medium">
                    Has alcanzado el límite máximo de <strong>{maxLimit}</strong> {resourceName}.
                  </p>
                  <p className="mt-1">
                    No podrás crear más {resourceName} hasta que contactes al administrador para aumentar tu límite o actualizar tu plan.
                  </p>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-red-200 rounded-full h-3">
                    <div
                      className="bg-red-600 h-3 rounded-full"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleContactSupport}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contactar Administrador
                  </button>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ver Planes Disponibles
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
