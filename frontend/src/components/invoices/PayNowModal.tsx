import { useState } from 'react';
import { X, CreditCard, Building2, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { paymentsService } from '@/services/payments.service';

interface PayNowModalProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    total: number;
    dueDate: string;
  };
  tenantId: string;
  tenantName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PayNowModal({
  invoice,
  tenantId,
  tenantName,
  onClose,
  onSuccess,
}: PayNowModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'card' | 'pse'>('pse');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reference.trim()) {
      showMessage('Error: Debe ingresar una referencia de pago');
      return;
    }

    try {
      setLoading(true);

      await paymentsService.create({
        tenantId,
        invoiceId: invoice.id,
        amount: invoice.total,
        paymentMethod,
        paymentReference: reference,
        paymentDate: new Date().toISOString(),
        notes: notes || `Pago realizado por el tenant ${tenantName}`,
      });

      showMessage('Pago registrado exitosamente');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      showMessage(error.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pagar Factura</h2>
            <p className="text-sm text-gray-600 mt-1">
              Factura: {invoice.invoiceNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg flex items-start ${
            message.includes('Error') || message.includes('error')
              ? 'bg-red-100 text-red-700 border border-red-400'
              : 'bg-green-100 text-green-700 border border-green-400'
          }`}>
            {message.includes('Error') ? (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            )}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información de la Factura */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Información de la Factura</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tenant</p>
                <p className="font-medium text-gray-900">{tenantName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Número de Factura</p>
                <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                <p className="font-medium text-gray-900">
                  {new Date(invoice.dueDate).toLocaleDateString('es-CO')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${invoice.total.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de Pago *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('pse')}
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'pse'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Building2 className={`w-8 h-8 ${
                  paymentMethod === 'pse' ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
                  paymentMethod === 'pse' ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  PSE
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <CreditCard className={`w-8 h-8 ${
                  paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
                  paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  Tarjeta
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'transfer'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <DollarSign className={`w-8 h-8 ${
                  paymentMethod === 'transfer' ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
                  paymentMethod === 'transfer' ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  Transferencia
                </span>
              </button>
            </div>
          </div>

          {/* Referencia de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia de Pago *
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej: Número de transacción, aprobación, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingresa el número de referencia o aprobación de tu pago
            </p>
          </div>

          {/* Notas Adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Información adicional sobre el pago..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Información Importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Información Importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>El pago será verificado por nuestro equipo</li>
                  <li>Recibirás una confirmación por correo electrónico</li>
                  <li>La activación puede tardar hasta 24 horas hábiles</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Confirmar Pago
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
