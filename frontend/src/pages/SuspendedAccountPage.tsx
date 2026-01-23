import { useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, Phone, ArrowLeft, CreditCard, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { getResourceUrl } from '@/utils/api-url';
import { useEffect, useState } from 'react';
import api from '@/services/api';

interface PlanInfo {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
}

export default function SuspendedAccountPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { settings } = useTheme();
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [isFreeAccount, setIsFreeAccount] = useState(false);

  useEffect(() => {
    // Verificar si es cuenta gratuita
    if (user?.tenant) {
      checkAccountType();
    }
    // Cargar planes disponibles
    loadPlans();
  }, [user]);

  const checkAccountType = async () => {
    try {
      const response = await api.get(`/tenants/${user?.tenant?.id}`);
      setIsFreeAccount(response.data.plan === 'free');
    } catch (error) {
      console.error('Error checking account type:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await api.get('/tenants/plans');
      // Filtrar solo planes de pago
      const paidPlans = response.data.filter((p: PlanInfo) => p.id !== 'free');
      setPlans(paidPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleContactSales = () => {
    window.location.href = 'mailto:ventas@archivoenlinea.com?subject=Solicitud de Plan - Cuenta Suspendida';
  };

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
          <div className={`${isFreeAccount ? 'bg-yellow-50 border-yellow-500' : 'bg-red-50 border-red-500'} border-l-4 p-6 mb-6 rounded-r-lg`}>
            {isFreeAccount ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Período de Prueba Finalizado
                  </h2>
                </div>
                <p className="text-lg text-gray-800 mb-4">
                  Tu período de prueba gratuito de 7 días ha finalizado.
                </p>
                <p className="text-gray-700">
                  Para continuar usando Archivo en Línea y acceder a todas las funcionalidades, selecciona uno de nuestros planes de pago.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg text-gray-800 mb-4">
                  Tu cuenta ha sido suspendida temporalmente debido a facturas pendientes de pago.
                </p>
                <p className="text-gray-700">
                  Para reactivar tu cuenta, por favor realiza el pago de las facturas vencidas o contacta al administrador del sistema.
                </p>
              </>
            )}
          </div>

          {/* Planes disponibles (solo para cuentas gratuitas) */}
          {isFreeAccount && plans.length > 0 && (
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Selecciona un Plan para Continuar
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-primary-500 transition">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                    <div className="text-2xl font-bold text-primary-600 mb-3">
                      {formatPrice(plan.priceMonthly)}<span className="text-sm text-gray-600">/mes</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleContactSales}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                Contactar para Contratar un Plan
              </button>
            </div>
          )}

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
          {!isFreeAccount && (
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
          )}

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
              href={isFreeAccount ? "mailto:ventas@archivoenlinea.com" : "mailto:soporte@archivoenlinea.com"}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              {isFreeAccount ? 'Contactar Ventas' : 'Contactar Soporte'}
            </a>
          </div>

          {/* Nota adicional */}
          <div className="mt-6 text-center text-sm text-gray-500">
            {isFreeAccount ? (
              <p>
                Contáctanos para seleccionar el plan que mejor se adapte a tus necesidades.
              </p>
            ) : (
              <p>
                Una vez realizado el pago, tu cuenta será reactivada automáticamente.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
