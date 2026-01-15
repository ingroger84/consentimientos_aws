import React, { useState, useEffect } from 'react';
import { paymentsService, CreatePaymentDto } from '@/services/payments.service';
import { invoicesService, Invoice } from '@/services/invoices.service';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface RegisterPaymentModalProps {
  tenantId: string;
  tenantName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterPaymentModal: React.FC<RegisterPaymentModalProps> = ({
  tenantId,
  tenantName,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePaymentDto>({
    tenantId,
    amount: 0,
    paymentMethod: 'transfer',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await invoicesService.getByTenant(tenantId);
      const pending = data.filter((inv) => inv.status === 'pending' || inv.status === 'overdue');
      setInvoices(pending);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (invoice) {
      setFormData({
        ...formData,
        invoiceId,
        amount: invoice.total,
      });
    } else {
      setFormData({
        ...formData,
        invoiceId: undefined,
        amount: 0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      toast.error('Monto inválido', 'El monto debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      await paymentsService.create(formData);
      toast.success('Pago registrado', 'El pago fue registrado exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error registering payment:', error);
      toast.error('Error al registrar pago', error.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Registrar Pago - {tenantName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Factura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Factura (Opcional)
            </label>
            <select
              value={formData.invoiceId || ''}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sin factura asociada</option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoiceNumber} - {invoicesService.formatCurrency(invoice.total)} -{' '}
                  {invoicesService.getStatusLabel(invoice.status)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selecciona una factura pendiente o deja en blanco para un pago sin factura
            </p>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto (COP) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
              step="1"
            />
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentMethod: e.target.value as any,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="transfer">Transferencia</option>
              <option value="card">Tarjeta</option>
              <option value="pse">PSE</option>
              <option value="cash">Efectivo</option>
              <option value="other">Otro</option>
            </select>
          </div>

          {/* Fecha de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Pago *
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia de Pago (Opcional)
            </label>
            <input
              type="text"
              value={formData.paymentReference || ''}
              onChange={(e) =>
                setFormData({ ...formData, paymentReference: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Número de transacción, comprobante, etc."
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Información adicional sobre el pago..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPaymentModal;
