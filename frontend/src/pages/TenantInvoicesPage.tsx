import { useState, useEffect } from 'react';
import { FileText, Download, Eye, DollarSign, Calendar, AlertCircle, Filter, X, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { invoicesService } from '@/services/invoices.service';
import api from '@/services/api';

interface Invoice {
  id: string;
  invoiceNumber: string;
  taxConfigId?: string;
  taxExempt?: boolean;
  taxExemptReason?: string;
  issueDate?: string;
  dueDate: string;
  amount: number;
  tax?: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'voided';
  items: InvoiceItem[];
  notes?: string;
  periodStart?: string;
  periodEnd?: string;
  taxConfig?: any;
}

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function TenantInvoicesPage() {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [creatingPaymentLink, setCreatingPaymentLink] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoicesService.getAll(
        statusFilter !== 'all' ? { status: statusFilter } : undefined
      );
      setInvoices(response);
    } catch (error: any) {
      console.error('Error loading invoices:', error);
      setMessage('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await invoicesService.downloadPdf(invoice.id);
      setMessage('PDF descargado correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Error al descargar el PDF');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handlePreviewPdf = async (invoice: Invoice) => {
    try {
      const url = await invoicesService.getPdfUrl(invoice.id);
      setPdfUrl(url);
      setShowPdfModal(true);
    } catch (error: any) {
      setMessage('Error al cargar vista previa del PDF');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      setCreatingPaymentLink(invoiceId);
      const response = await api.post(`/invoices/${invoiceId}/create-payment-link`);
      
      if (response.data.success && response.data.paymentLink) {
        window.open(response.data.paymentLink, '_blank');
        setMessage('Link de pago creado. Se abrió en una nueva ventana.');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error: any) {
      console.error('Error creating payment link:', error);
      setMessage(error.response?.data?.message || 'Error al crear el link de pago');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setCreatingPaymentLink(null);
    }
  };

  const handlePaymentSuccess = () => {
    loadInvoices();
    setMessage('Pago registrado correctamente');
    setTimeout(() => setMessage(''), 3000);
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (invoice: Invoice): boolean => {
    return invoice.status === 'pending' && getDaysUntilDue(invoice.dueDate) < 0;
  };

  if (!user?.tenant) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">
              Funcionalidad no disponible
            </h3>
            <p className="text-yellow-800">
              Esta funcionalidad solo está disponible para usuarios de cuentas tenant.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Facturas</h1>
          <p className="text-gray-600 mt-2">
            Consulta y gestiona las facturas de tu cuenta
          </p>
        </div>
      </div>

      {/* Mensaje de éxito/error */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start ${
          message.includes('Error') || message.includes('error')
            ? 'bg-red-100 text-red-700 border border-red-400'
            : 'bg-green-100 text-green-700 border border-green-400'
        }`}>
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

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
            <option value="voided">Anuladas</option>
          </select>
        </div>
      </div>

      {/* Lista de Facturas */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay facturas
          </h3>
          <p className="text-gray-600">
            Aún no se han generado facturas para tu cuenta
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {invoices.map((invoice) => {
            const daysUntilDue = getDaysUntilDue(invoice.dueDate);
            const overdueStatus = isOverdue(invoice);

            return (
              <div
                key={invoice.id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 ${
                  invoice.status === 'paid'
                    ? 'border-green-500'
                    : overdueStatus
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
                      {invoice.periodStart && invoice.periodEnd && (
                        <div>
                          <p className="text-sm text-gray-500">Período</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(invoice.periodStart).toLocaleDateString('es-CO')} -{' '}
                            {new Date(invoice.periodEnd).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                      )}
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
                                overdueStatus ? 'text-red-600' : 'text-yellow-600'
                              }`}
                            >
                              {overdueStatus
                                ? `Vencida hace ${Math.abs(daysUntilDue)} días`
                                : `Vence en ${daysUntilDue} días`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    {invoice.items && invoice.items.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Detalle:</p>
                        {invoice.items.map((item, index) => (
                          <div key={item.id || index} className="flex justify-between text-sm mb-1">
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
                        {invoice.taxExempt ? (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Impuesto:</span>
                            <span className="text-green-600 font-medium">EXENTA</span>
                          </div>
                        ) : invoice.taxConfig && invoice.taxConfig.isActive ? (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {invoice.taxConfig.name} ({invoice.taxConfig.rate}%):
                            </span>
                            <span className="text-gray-900">
                              {invoicesService.formatCurrency(invoice.tax || 0)}
                            </span>
                          </div>
                        ) : (invoice.tax || 0) > 0 ? (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Impuesto:</span>
                            <span className="text-gray-400 text-xs">(Desactivado)</span>
                          </div>
                        ) : (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Impuesto:</span>
                            <span className="text-gray-900">
                              {invoicesService.formatCurrency(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-blue-600">
                            {invoicesService.formatCurrency(invoice.total)}
                          </span>
                        </div>
                      </div>
                    )}

                    {invoice.taxExempt && invoice.taxExemptReason && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs font-medium text-green-800 mb-1">
                          Factura Exenta de Impuestos
                        </p>
                        <p className="text-sm text-green-700">{invoice.taxExemptReason}</p>
                      </div>
                    )}

                    {invoice.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{invoice.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {invoice.status === 'pending' && (
                      <button
                        onClick={() => handlePayInvoice(invoice.id)}
                        disabled={creatingPaymentLink === invoice.id}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transform hover:scale-105"
                        title="Pagar ahora con Bold"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {creatingPaymentLink === invoice.id ? 'Generando...' : 'Pagar Ahora'}
                      </button>
                    )}
                    <button
                      onClick={() => handlePreviewPdf(invoice)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      title="Vista previa"
                    >
                      <Eye className="w-4 h-4" />
                      Vista Previa
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(invoice)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      title="Descargar PDF"
                    >
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </button>
                  </div>
                </div>

                {overdueStatus && invoice.status === 'pending' && (
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
    </div>
  );
}
