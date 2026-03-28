import { useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, Phone, ArrowLeft, CreditCard, Clock, Receipt, Loader2, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { getResourceUrl } from '@/utils/api-url';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { invoicesService, Invoice } from '@/services/invoices.service';

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
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [generatingPaymentLink, setGeneratingPaymentLink] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si es cuenta gratuita
    if (user?.tenant) {
      checkAccountType();
      loadPendingInvoices();
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

  const loadPendingInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const invoices = await invoicesService.getByTenant(user?.tenant?.id || '');
      // Filtrar solo facturas pendientes o vencidas
      const pending = invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue');
      setPendingInvoices(pending);
    } catch (error) {
      console.error('Error loading pending invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handlePayNow = async (invoiceId: string) => {
    try {
      setGeneratingPaymentLink(invoiceId);
      
      // Generar link de pago de Bold
      const response = await api.post(`/invoices/${invoiceId}/create-payment-link`);
      const { paymentLink } = response.data;
      
      if (paymentLink) {
        // Redirigir al checkout de Bold
        window.location.href = paymentLink;
      } else {
        alert('No se pudo generar el link de pago. Por favor, contacta a soporte.');
      }
    } catch (error: any) {
      console.error('Error generating payment link:', error);
      alert(error.response?.data?.message || 'Error al generar el link de pago');
    } finally {
      setGeneratingPaymentLink(null);
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
                  Para reactivar tu cuenta, por favor realiza el pago de las facturas vencidas. Una vez procesado el pago, tu cuenta se reactivará automáticamente.
                </p>
              </>
            )}
          </div>

          {/* Facturas pendientes (solo para cuentas suspendidas) */}
          {!isFreeAccount && (
            <div className="bg-white rounded-lg border-2 border-red-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Receipt className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Facturas Pendientes de Pago
                </h2>
              </div>

              {loadingInvoices ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  <span className="ml-3 text-gray-600">Cargando facturas...</span>
                </div>
              ) : pendingInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No se encontraron facturas pendientes. Si crees que esto es un error, contacta a soporte.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-5 border border-red-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-gray-900">
                              {invoice.invoiceNumber}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'overdue' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-700">
                            <p>
                              <span className="font-medium">Monto:</span>{' '}
                              <span className="text-xl font-bold text-red-600">
                                {invoicesService.formatCurrency(invoice.total)}
                              </span>
                            </p>
                            <p>
                              <span className="font-medium">Fecha de vencimiento:</span>{' '}
                              {new Date(invoice.dueDate).toLocaleDateString('es-CO')}
                              {invoice.status === 'overdue' && (
                                <span className="ml-2 text-red-600 font-medium">
                                  (Vencida hace {Math.abs(invoicesService.getDaysUntilDue(invoice.dueDate))} días)
                                </span>
                              )}
                            </p>
                            <p>
                              <span className="font-medium">Período:</span>{' '}
                              {new Date(invoice.periodStart).toLocaleDateString('es-CO')} -{' '}
                              {new Date(invoice.periodEnd).toLocaleDateString('es-CO')}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handlePayNow(invoice.id)}
                            disabled={generatingPaymentLink === invoice.id}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            {generatingPaymentLink === invoice.id ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generando...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-5 h-5" />
                                Pagar Ahora
                                <ExternalLink className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Reactivación Automática</p>
                        <p>
                          Una vez que completes el pago, tu cuenta se reactivará automáticamente en pocos segundos. 
                          No necesitas contactar a soporte.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
          {!isFreeAccount && pendingInvoices.length === 0 && !loadingInvoices && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pasos para reactivar tu cuenta:
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Revisa las facturas pendientes en tu correo electrónico</li>
                <li>Realiza el pago correspondiente</li>
                <li>Tu cuenta se reactivará automáticamente después del pago</li>
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
                Una vez realizado el pago, tu cuenta será reactivada automáticamente en pocos segundos.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
