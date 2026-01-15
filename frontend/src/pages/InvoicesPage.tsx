import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { invoicesService, Invoice } from '@/services/invoices.service';
import { paymentsService } from '@/services/payments.service';
import { FileText, Calendar, AlertCircle, Download, Mail, Filter, Eye, CreditCard, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

const InvoicesPage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'bank_transfer',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const tenantId = user?.tenant?.id;
      if (!tenantId) return;

      const filters: any = { tenantId };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const data = await invoicesService.getAll(filters);
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (invoiceId: string) => {
    try {
      await invoicesService.resendEmail(invoiceId);
      toast.success('Email enviado', 'El email fue enviado exitosamente');
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error('Error al enviar email', 'No se pudo enviar el email');
    }
  };

  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      await invoicesService.downloadPdf(invoiceId);
      toast.success('PDF descargado', 'El PDF fue descargado correctamente');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error al descargar PDF', 'No se pudo descargar el PDF');
    }
  };

  const handlePreviewPdf = async (invoiceId: string) => {
    try {
      const url = await invoicesService.getPdfUrl(invoiceId);
      setPdfUrl(url);
      setShowPdfModal(true);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      toast.error('Error al cargar vista previa', 'No se pudo cargar la vista previa del PDF');
    }
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const handleRegisterPayment = (invoice: Invoice) => {
    setPaymentInvoice(invoice);
    setPaymentData({
      amount: invoice.total,
      method: 'bank_transfer',
      reference: '',
      notes: '',
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!paymentInvoice) return;

    try {
      await paymentsService.create({
        tenantId: paymentInvoice.tenantId,
        invoiceId: paymentInvoice.id,
        amount: paymentData.amount,
        paymentMethod: paymentData.method as any,
        paymentReference: paymentData.reference,
        notes: paymentData.notes,
      });

      toast.success('Pago registrado', 'El pago fue registrado exitosamente');
      setShowPaymentModal(false);
      setPaymentInvoice(null);
      loadInvoices();
    } catch (error) {
      console.error('Error registering payment:', error);
      toast.error('Error al registrar pago', 'No se pudo registrar el pago');
    }
  };

  if (!user?.tenant) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Esta página solo está disponible para usuarios de tenants.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-600 mt-2">
            Consulta y gestiona tus facturas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="paid">Pagadas</option>
            <option value="overdue">Vencidas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Lista de Facturas */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-gray-600">Cargando facturas...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay facturas registradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {invoices.map((invoice) => {
            const daysUntilDue = invoicesService.getDaysUntilDue(invoice.dueDate);
            const isOverdue = invoicesService.isOverdue(invoice);

            return (
              <div
                key={invoice.id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 ${
                  invoice.status === 'paid'
                    ? 'border-green-500'
                    : isOverdue
                    ? 'border-red-500'
                    : 'border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-900">
                        {invoice.invoiceNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${invoicesService.getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoicesService.getStatusLabel(invoice.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500">Período</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(invoice.periodStart).toLocaleDateString('es-CO')} -{' '}
                          {new Date(invoice.periodEnd).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fecha de vencimiento</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(invoice.dueDate).toLocaleDateString('es-CO')}
                          </p>
                          {invoice.status === 'pending' && (
                            <span
                              className={`text-xs ${
                                isOverdue ? 'text-red-600' : 'text-yellow-600'
                              }`}
                            >
                              {isOverdue
                                ? `Vencida hace ${Math.abs(daysUntilDue)} días`
                                : `Vence en ${daysUntilDue} días`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Detalle:</p>
                      {invoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            {item.description} (x{item.quantity})
                          </span>
                          <span className="text-gray-900 font-medium">
                            {invoicesService.formatCurrency(item.total)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">
                          {invoicesService.formatCurrency(invoice.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">IVA (19%):</span>
                        <span className="text-gray-900">
                          {invoicesService.formatCurrency(invoice.tax)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-blue-600">
                          {invoicesService.formatCurrency(invoice.total)}
                        </span>
                      </div>
                    </div>

                    {invoice.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{invoice.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handlePreviewPdf(invoice.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      title="Vista previa"
                    >
                      <Eye className="w-4 h-4" />
                      Vista Previa
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(invoice.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Descargar PDF"
                    >
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </button>
                    <button
                      onClick={() => handleResendEmail(invoice.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Reenviar por email"
                    >
                      <Mail className="w-4 h-4" />
                      Reenviar Email
                    </button>
                    {invoice.status === 'pending' && (
                      <button
                        onClick={() => handleRegisterPayment(invoice)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        title="Registrar pago manual"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pago Manual
                      </button>
                    )}
                  </div>
                </div>

                {isOverdue && invoice.status === 'pending' && (
                  <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">
                      Esta factura está vencida. Por favor realiza el pago lo antes posible para
                      evitar la suspensión de tu cuenta.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Vista Previa PDF */}
      {showPdfModal && pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Vista Previa de Factura</h2>
              <button
                onClick={closePdfModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0 rounded"
                title="Vista previa de factura"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro de Pago Manual */}
      {showPaymentModal && paymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Registrar Pago Manual</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Factura</p>
                <p className="text-lg font-bold text-gray-900">{paymentInvoice.invoiceNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bank_transfer">Transferencia Bancaria</option>
                  <option value="cash">Efectivo</option>
                  <option value="check">Cheque</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referencia
                </label>
                <input
                  type="text"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                  placeholder="Número de transacción, recibo, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitPayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
