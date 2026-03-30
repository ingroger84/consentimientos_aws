import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CreditCard, Loader2, ExternalLink, ArrowLeft, XCircle } from 'lucide-react';
import { getResourceUrl, getApiBaseUrl } from '@/utils/api-url';
import { useTheme } from '@/contexts/ThemeContext';
import axios from 'axios';

interface Invoice {
  id: string;
  invoiceNumber: string;
  total: number;
  dueDate: string;
  status: string;
  paymentAttemptsCount?: number;
  maxAttempts?: number;
  boldPaymentLinkStatus?: string;
}

export default function PublicSuspendedPage() {
  const navigate = useNavigate();
  const { settings } = useTheme();
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPaymentLink, setGeneratingPaymentLink] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState('');

  useEffect(() => {
    loadPendingInvoices();
  }, []);

  const loadPendingInvoices = async () => {
    try {
      setLoading(true);
      
      // Obtener el slug del tenant desde el subdominio
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      let tenantSlug = null;
      
      // Detectar tenant slug según el entorno
      if (parts.length >= 2 && parts[1] === 'localhost') {
        tenantSlug = parts[0];
      } else if (parts.length >= 3) {
        tenantSlug = parts[0];
      }

      console.log('[PublicSuspended] Hostname:', hostname);
      console.log('[PublicSuspended] Tenant slug:', tenantSlug);

      if (!tenantSlug || tenantSlug === 'admin' || tenantSlug === 'www') {
        throw new Error('No se pudo determinar el tenant');
      }

      // Llamar al endpoint público SIN usar el interceptor de api
      // Usar axios directamente para evitar agregar token de autenticación
      const apiUrl = getApiBaseUrl();
      console.log('[PublicSuspended] API URL:', apiUrl);
      console.log('[PublicSuspended] Llamando a:', `${apiUrl}/api/invoices/public/pending-by-slug`);
      
      const response = await axios.post(`${apiUrl}/api/invoices/public/pending-by-slug`, {
        tenantSlug,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[PublicSuspended] Response:', response.data);

      setPendingInvoices(response.data.invoices || []);
      setTenantName(response.data.tenantName || '');
    } catch (error: any) {
      console.error('[PublicSuspended] Error loading pending invoices:', error);
      console.error('[PublicSuspended] Error response:', error.response);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (invoiceId: string) => {
    try {
      setGeneratingPaymentLink(invoiceId);
      
      // Generar link de pago público (sin autenticación)
      // Usar axios directamente para evitar agregar token de autenticación
      const apiUrl = getApiBaseUrl();
      console.log('[PublicSuspended] Generando link de pago para invoice:', invoiceId);
      
      const response = await axios.post(`${apiUrl}/api/invoices/public/${invoiceId}/create-payment-link`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('[PublicSuspended] Payment link response:', response.data);
      const { paymentLink } = response.data;
      
      if (paymentLink) {
        console.log('[PublicSuspended] Redirigiendo a Bold:', paymentLink);
        // Redirigir al checkout de Bold
        window.location.href = paymentLink;
      } else {
        alert('No se pudo generar el link de pago. Por favor, contacta a soporte.');
      }
    } catch (error: any) {
      console.error('[PublicSuspended] Error generating payment link:', error);
      console.error('[PublicSuspended] Error response:', error.response);
      alert(error.response?.data?.message || 'Error al generar el link de pago');
    } finally {
      setGeneratingPaymentLink(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = now.getTime() - due.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
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
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
            )}
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Cuenta Suspendida
          </h1>

          {/* Mensaje principal */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-r-lg">
            <p className="text-lg text-gray-800 mb-4">
              La cuenta <strong>{tenantName}</strong> ha sido suspendida temporalmente debido a facturas pendientes de pago.
            </p>
            <p className="text-gray-700">
              Para reactivar el acceso al sistema, realiza el pago de las facturas vencidas. 
              Una vez procesado el pago, la cuenta se reactivará automáticamente en pocos segundos.
            </p>
          </div>

          {/* Facturas pendientes */}
          <div className="bg-white rounded-lg border-2 border-red-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-red-600" />
              Facturas Pendientes de Pago
            </h2>

            {loading ? (
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
                              {formatCurrency(invoice.total)}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Fecha de vencimiento:</span>{' '}
                            {new Date(invoice.dueDate).toLocaleDateString('es-CO')}
                            {invoice.status === 'overdue' && (
                              <span className="ml-2 text-red-600 font-medium">
                                (Vencida hace {getDaysOverdue(invoice.dueDate)} días)
                              </span>
                            )}
                          </p>
                          {invoice.paymentAttemptsCount !== undefined && invoice.paymentAttemptsCount > 0 && (
                            <p>
                              <span className="font-medium">Intentos de pago:</span>{' '}
                              <span className="text-orange-600 font-semibold">
                                {invoice.paymentAttemptsCount} de {invoice.maxAttempts || 6}
                              </span>
                              {invoice.paymentAttemptsCount >= (invoice.maxAttempts || 6) && (
                                <span className="ml-2 text-red-600 font-medium">
                                  (Límite alcanzado - Contacta a soporte)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handlePayNow(invoice.id)}
                          disabled={
                            generatingPaymentLink === invoice.id || 
                            (invoice.paymentAttemptsCount || 0) >= (invoice.maxAttempts || 6)
                          }
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {generatingPaymentLink === invoice.id ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Generando...
                            </>
                          ) : (invoice.paymentAttemptsCount || 0) >= (invoice.maxAttempts || 6) ? (
                            <>
                              <XCircle className="w-5 h-5" />
                              Límite Alcanzado
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5" />
                              {(invoice.paymentAttemptsCount || 0) > 0 ? 'Reintentar Pago' : 'Pagar Ahora'}
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

          {/* Botón volver al login */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al Login
            </button>
          </div>

          {/* Nota adicional */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Una vez realizado el pago, podrás iniciar sesión normalmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
