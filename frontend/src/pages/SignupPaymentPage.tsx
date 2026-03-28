import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, CheckCircle, AlertCircle, Loader, ArrowRight, Clock } from 'lucide-react';

export default function SignupPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Datos del tenant y factura desde URL params
  const tenantName = searchParams.get('tenantName') || '';
  const tenantSlug = searchParams.get('tenantSlug') || '';
  const invoiceId = searchParams.get('invoiceId') || '';
  const invoiceNumber = searchParams.get('invoiceNumber') || '';
  const total = parseFloat(searchParams.get('total') || '0');
  const dueDate = searchParams.get('dueDate') || '';
  const paymentLink = searchParams.get('paymentLink') || '';

  useEffect(() => {
    // Validar que tengamos todos los datos necesarios
    if (!tenantSlug || !invoiceId || !paymentLink) {
      setError('Datos de pago incompletos. Por favor contacta a soporte.');
    }
  }, [tenantSlug, invoiceId, paymentLink]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePayNow = () => {
    setLoading(true);
    // Redirigir a Bold
    window.location.href = paymentLink;
  };

  const handlePayLater = () => {
    // Redirigir al login del tenant
    window.location.href = `https://${tenantSlug}.archivoenlinea.com/login`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary w-full"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¡Cuenta Creada Exitosamente!</h1>
          <p className="text-primary-100">
            Bienvenido a Archivo en Línea, {tenantName}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Tu cuenta ha sido creada</p>
                <p className="text-sm text-green-700 mt-1">
                  Hemos enviado un correo de bienvenida con los detalles de acceso.
                </p>
              </div>
            </div>
          </div>

          {/* Access Info */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Tu URL de acceso:</p>
            <p className="text-lg font-semibold text-primary-600">
              {tenantSlug}.archivoenlinea.com
            </p>
          </div>

          {/* Invoice Info */}
          <div className="border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Completa tu Pago</h2>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Factura:</span>
                <span className="font-semibold text-gray-900">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monto:</span>
                <span className="font-semibold text-gray-900">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vence:</span>
                <span className="font-semibold text-gray-900">{formatDate(dueDate)}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Pago requerido para activar tu cuenta</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Tu cuenta está en período de prueba. Para acceder a todas las funcionalidades, 
                    completa el pago de tu primera factura.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-3">
              <button
                onClick={handlePayNow}
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center gap-2 text-lg py-3"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Redirigiendo a Bold...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pagar Ahora con Bold
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                onClick={handlePayLater}
                className="btn btn-secondary w-full"
              >
                Pagar Después
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Métodos de pago disponibles:</strong> Tarjetas de crédito, débito, PSE y más a través de Bold.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Si prefieres pagar después, puedes acceder a tu cuenta y realizar el pago desde el panel de facturas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
