import { useState, useEffect } from 'react';
import { FileText, Download, Eye, DollarSign, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import api from '../services/api';
import RegisterPaymentModal from '../components/billing/RegisterPaymentModal';

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  pdfUrl?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function TenantInvoicesPage() {
  const { user } = useAuthStore();
  const { hasPermission } = usePermissions();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices/my-invoices');
      setInvoices(response.data);
    } catch (error: any) {
      console.error('Error loading invoices:', error);
      setMessage('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice.id}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Factura-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setMessage('Error al descargar el PDF');
    }
  };

  const handleViewPDF = async (invoice: Invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice.id}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error: any) {
      setMessage('Error al visualizar el PDF');
    }
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    loadInvoices();
    setMessage('Pago registrado correctamente');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pendiente', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { label: 'Pagada', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { label: 'Vencida', class: 'bg-red-100 text-red-800', icon: AlertCircle },
      cancelled: { label: 'Anulada', class: 'bg-gray-100 text-gray-800', icon: AlertCircle },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user?.tenant) {
    return (
      <div className="card bg-yellow-50 border-yellow-200">
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="w-8 h-8 mr-3 text-blue-600" />
          Mis Facturas
        </h1>
        <p className="text-gray-600 mt-2">
          Consulta y gestiona las facturas de tu cuenta
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start ${
          message.includes('Error') || message.includes('error')
            ? 'bg-red-100 text-red-700 border border-red-400'
            : 'bg-green-100 text-green-700 border border-green-400'
        }`}>
          {message.includes('Error') || message.includes('error') ? (
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          )}
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay facturas
          </h3>
          <p className="text-gray-600">
            Aún no se han generado facturas para tu cuenta
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Factura {invoice.invoiceNumber}
                    </h3>
                    {getStatusBadge(invoice.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Fecha de emisión</p>
                        <p className="text-sm font-medium">{formatDate(invoice.issueDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Fecha de vencimiento</p>
                        <p className="text-sm font-medium">{formatDate(invoice.dueDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Monto total</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(invoice.amount)}</p>
                      </div>
                    </div>
                  </div>

                  {invoice.items && invoice.items.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Detalle de la factura:</h4>
                      <div className="space-y-2">
                        {invoice.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.description} (x{item.quantity})
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex flex-col gap-2">
                  <button
                    onClick={() => handleViewPDF(invoice)}
                    className="btn btn-secondary flex items-center"
                    title="Ver PDF"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(invoice)}
                    className="btn btn-secondary flex items-center"
                    title="Descargar PDF"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </button>

                  {invoice.status === 'pending' && hasPermission('pay_invoices') && (
                    <button
                      onClick={() => handlePayInvoice(invoice)}
                      className="btn btn-primary flex items-center"
                      title="Registrar pago"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPaymentModal && selectedInvoice && (
        <RegisterPaymentModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInvoice(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
