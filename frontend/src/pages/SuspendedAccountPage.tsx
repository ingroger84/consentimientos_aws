import { useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { getResourceUrl } from '@/utils/api-url';

export default function SuspendedAccountPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { settings } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Logo */}
          <div className="text-center mb-8">
            {settings.logoUrl ? (
              <div className="flex justify-center mb-6">
                <img
                  src={getResourceUrl(settings.logoUrl)}
                  alt={settings.companyName}
                  className="h-16 object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          {/* Icono de alerta */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Cuenta Suspendida
          </h1>

          {/* Mensaje principal */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-r-lg">
            <p className="text-lg text-gray-800 mb-4">
              Tu cuenta ha sido suspendida temporalmente debido a facturas pendientes de pago.
            </p>
            <p className="text-gray-700">
              Para reactivar tu cuenta, por favor realiza el pago de las facturas vencidas o contacta al administrador del sistema.
            </p>
          </div>

          {/* Información de contacto */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Necesitas ayuda?
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-gray-500" />
                <span>Contacta al administrador del sistema</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-gray-500" />
                <span>Verifica tus facturas pendientes</span>
              </div>
            </div>
          </div>

          {/* Pasos para reactivar */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pasos para reactivar tu cuenta:
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Revisa las facturas pendientes en tu correo electrónico</li>
              <li>Realiza el pago correspondiente</li>
              <li>Notifica al administrador sobre el pago realizado</li>
              <li>Tu cuenta será reactivada en las próximas horas</li>
            </ol>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Cerrar Sesión
            </button>
            <a
              href="mailto:admin@example.com"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Contactar Soporte
            </a>
          </div>

          {/* Nota adicional */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Una vez realizado el pago, tu cuenta será reactivada automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
