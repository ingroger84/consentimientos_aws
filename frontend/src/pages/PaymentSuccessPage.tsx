import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, FileText, Home, AlertCircle, Loader2 } from 'lucide-react';
import { invoicesService } from '@/services/invoices.service';
import api from '@/services/api';

interface Invoice {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  tenant: {
    name: string;
  };
}

export default function PaymentSuccessPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);

  // Obtener parámetros de Bold
  const boldOrderId = searchParams.get('bold-order-id');
  const boldTxStatus = searchParams.get('bold-tx-status');

  useEffect(() => {
    loadInvoiceData();
  }, [invoiceId]);

  useEffect(() => {
    // Countdown para redirección automática
    if (!loading && !error && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    // Redirección automática después del countdown
    if (countdown === 0) {
      navigate('/my-invoices');
    }
  }, [countdown, loading, error, navigate]);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);

      if (!invoiceId) {
        setError('ID de factura no proporcionado');
        return;
      }

      // Cargar datos de la factura usando endpoint público (no requiere autenticación)
      const response = await api.get(`/invoices/public/${invoiceId}/info`);
      setInvoice(response.data);

      // Si el pago fue aprobado y la factura aún está pendiente, procesarlo manualmente
      if (boldTxStatus === 'approved' && response.data.status === 'pending') {
        console.log('Pago aprobado pero factura pendiente, procesando manualmente...');
        
        try {
          // Llamar al endpoint para procesar el pago manualmente
          await api.post(`/payments/process-bold-payment`, {
            invoiceId,
            boldOrderId,
            boldTxStatus,
          });

          // Recargar la factura actualizada usando endpoint público
          const updatedResponse = await api.get(`/invoices/public/${invoiceId}/info`);
          setInvoice(updatedResponse.data);
          
          console.log('Factura actualizada exitosamente');
        } catch (processError: any) {
          console.error('Error al procesar pago manualmente:', processError);
          // No mostrar error al usuario, la factura se actualizará eventualmente
        }
      }
    } catch (err: any) {
      console.error('Error loading invoice:', err);
      setError(err.response?.data?.message || 'Error al cargar la información de la factura');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToInvoices = () => {
    navigate('/my-invoices');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Procesando información...
          </h2>
          <p className="text-gray-600">
            Por favor espera mientras verificamos tu pago
          </p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Error al Procesar
            </h1>
            <p className="text-gray-600">
              {error}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoToInvoices}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FileText className="w-5 h-5" />
              Ver Mis Facturas
            </button>
            <button
              onClick={handleGoToDashboard}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Ir al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determinar el estado del pago
  const isApproved = boldTxStatus === 'approved';
  const isPending = boldTxStatus === 'pending';
  const isRejected = boldTxStatus === 'rejected' || boldTxStatus === 'failed';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isApproved
        ? 'bg-gradient-to-br from-green-50 via-white to-emerald-50'
        : isPending
        ? 'bg-gradient-to-br from-yellow-50 via-white to-orange-50'
        : 'bg-gradient-to-br from-red-50 via-white to-pink-50'
    }`}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Header con ícono animado */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
            isApproved
              ? 'bg-green-100 animate-bounce'
              : isPending
              ? 'bg-yellow-100'
              : 'bg-red-100'
          }`}>
            {isApproved && <CheckCircle className="w-16 h-16 text-green-600" />}
            {isPending && <Clock className="w-16 h-16 text-yellow-600" />}
            {isRejected && <XCircle className="w-16 h-16 text-red-600" />}
          </div>

          <h1 className={`text-4xl font-bold mb-3 ${
            isApproved
              ? 'text-green-600'
              : isPending
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}>
            {isApproved && '¡Pago Exitoso!'}
            {isPending && 'Pago Pendiente'}
            {isRejected && 'Pago Rechazado'}
          </h1>

          <p className="text-xl text-gray-600">
            {isApproved && 'Tu pago ha sido procesado correctamente'}
            {isPending && 'Tu pago está siendo procesado'}
            {isRejected && 'No se pudo procesar tu pago'}
          </p>
        </div>

        {/* Información de la factura */}
        {invoice && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Detalles de la Factura
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Número de Factura</p>
                <p className="text-lg font-bold text-gray-900">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Monto Total</p>
                <p className="text-lg font-bold text-blue-600">
                  {invoicesService.formatCurrency(invoice.total)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Cliente</p>
                <p className="text-base font-medium text-gray-900">{invoice.tenant.name}</p>
              </div>
              {boldOrderId && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">ID de Transacción</p>
                  <p className="text-sm font-mono text-gray-700 break-all">{boldOrderId}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mensaje según el estado */}
        <div className={`rounded-xl p-4 mb-6 ${
          isApproved
            ? 'bg-green-50 border border-green-200'
            : isPending
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              isApproved
                ? 'text-green-600'
                : isPending
                ? 'text-yellow-600'
                : 'text-red-600'
            }`} />
            <div className="flex-1">
              {isApproved && (
                <>
                  <p className="font-medium text-green-900 mb-1">
                    ¡Gracias por tu pago!
                  </p>
                  <p className="text-sm text-green-800">
                    Hemos recibido tu pago correctamente. Tu cuenta ha sido actualizada y recibirás un correo de confirmación en breve.
                  </p>
                </>
              )}
              {isPending && (
                <>
                  <p className="font-medium text-yellow-900 mb-1">
                    Pago en Proceso
                  </p>
                  <p className="text-sm text-yellow-800">
                    Tu pago está siendo verificado. Te notificaremos por correo electrónico una vez que se confirme.
                  </p>
                </>
              )}
              {isRejected && (
                <>
                  <p className="font-medium text-red-900 mb-1">
                    Pago No Procesado
                  </p>
                  <p className="text-sm text-red-800">
                    No se pudo procesar tu pago. Por favor verifica tu información de pago e intenta nuevamente.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contador de redirección */}
        {isApproved && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              Serás redirigido a tus facturas en{' '}
              <span className="font-bold text-blue-600">{countdown}</span> segundos
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(10 - countdown) * 10}%` }}
              />
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={handleGoToInvoices}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium text-lg transform hover:scale-105"
          >
            <FileText className="w-5 h-5" />
            Ver Mis Facturas
          </button>
          <button
            onClick={handleGoToDashboard}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Ir al Dashboard
          </button>
        </div>

        {/* Footer con información adicional */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Si tienes alguna pregunta sobre tu pago, por favor contacta a nuestro equipo de soporte.
          </p>
        </div>
      </div>
    </div>
  );
}
