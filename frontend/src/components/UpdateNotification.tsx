/**
 * Componente de Notificación de Actualización
 * Muestra un banner cuando hay una nueva versión disponible
 */

import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { versionService } from '../services/version.service';

export function UpdateNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    // Verificar si hay caché antiguo al cargar
    if (versionService.hasOldCache()) {
      setShowNotification(true);
    }

    // Iniciar verificación automática
    versionService.startAutoCheck();

    // Escuchar notificaciones de actualización
    const unsubscribe = versionService.onUpdateAvailable((hasUpdate) => {
      if (hasUpdate) {
        setShowNotification(true);
      }
    });

    return () => {
      versionService.stopAutoCheck();
      unsubscribe();
    };
  }, []);

  const handleReload = async () => {
    setIsReloading(true);
    await versionService.reloadApp();
  };

  const handleDismiss = () => {
    setShowNotification(false);
    // Volver a mostrar en 10 minutos
    setTimeout(() => {
      setShowNotification(true);
    }, 10 * 60 * 1000);
  };

  if (!showNotification) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                <RefreshCw className={`w-5 h-5 ${isReloading ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  🎉 Nueva versión disponible
                </p>
                <p className="text-xs text-blue-100 mt-0.5">
                  Actualiza para obtener las últimas mejoras y correcciones
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReload}
                disabled={isReloading}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isReloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Actualizar Ahora
                  </>
                )}
              </button>

              <button
                onClick={handleDismiss}
                disabled={isReloading}
                className="p-2 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
