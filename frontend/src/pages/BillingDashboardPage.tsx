import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { billingService, BillingStats, BillingHistory } from '@/services/billing.service';
import { invoicesService, Invoice } from '@/services/invoices.service';
import { paymentsService } from '@/services/payments.service';
import {
  DollarSign,
  FileText,
  AlertCircle,
  PauseCircle,
  TrendingUp,
  Calendar,
  RefreshCw,
  Download,
  Mail,
  Eye,
  CheckCircle,
  XCircle,
  CreditCard,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

const BillingDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [history, setHistory] = useState<BillingHistory[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelInvoice, setCancelInvoice] = useState<Invoice | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, historyData, invoicesData] = await Promise.all([
        billingService.getDashboardStats(),
        billingService.getHistory(undefined, 20),
        invoicesService.getAll({}),
      ]);
      setStats(statsData);
      setHistory(historyData);
      setInvoices(invoicesData.slice(0, 10)); // Solo las 10 más recientes
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoices = async () => {
    const confirmed = await confirm({
      type: 'info',
      title: '¿Generar facturas?',
      message: '¿Generar facturas mensuales para todos los tenants?',
      confirmText: 'Generar',
      cancelText: 'Cancelar',
    });
    
    if (!confirmed) return;

    try {
      setProcessing(true);
      const result = await billingService.generateMonthlyInvoices();
      toast.success(
        'Facturas generadas',
        `Se generaron ${result.generated} facturas${result.errors.length > 0 ? `. Errores: ${result.errors.length}` : ''}`
      );
      await loadData();
    } catch (error) {
      console.error('Error generating invoices:', error);
      toast.error('Error al generar facturas', 'No se pudieron generar las facturas');
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspendOverdue = async () => {
    const confirmed = await confirm({
      type: 'danger',
      title: '¿Suspender tenants morosos?',
      message: '¿Suspender tenants con facturas vencidas?',
      confirmText: 'Suspender',
      cancelText: 'Cancelar',
    });
    
    if (!confirmed) return;

    try {
      setProcessing(true);
      const result = await billingService.suspendOverdueTenants();
      toast.success(
        'Tenants suspendidos',
        `Se suspendieron ${result.suspended} tenants${result.errors.length > 0 ? `. Errores: ${result.errors.length}` : ''}`
      );
      await loadData();
    } catch (error) {
      console.error('Error suspending tenants:', error);
      toast.error('Error al suspender tenants', 'No se pudieron suspender los tenants');
    } finally {
      setProcessing(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      toast.success('Operación exitosa', message);
    } else {
      toast.error('Error', message);
    }
  };

  const handleResendEmail = async (invoiceId: string) => {
    try {
      await invoicesService.resendEmail(invoiceId);
      showToast('Email enviado exitosamente', 'success');
    } catch (error) {
      console.error('Error resending email:', error);
      showToast('Error al enviar el email', 'error');
    }
  };

  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      await invoicesService.downloadPdf(invoiceId);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showToast('Error al descargar el PDF', 'error');
    }
  };

  const handlePreviewPdf = async (invoiceId: string) => {
    try {
      const url = await invoicesService.getPdfUrl(invoiceId);
      setPdfUrl(url);
      setShowPdfModal(true);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      showToast('Error al cargar la vista previa', 'error');
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

      showToast('Pago registrado exitosamente', 'success');
      setShowPaymentModal(false);
      setPaymentInvoice(null);
      loadData();
    } catch (error) {
      console.error('Error registering payment:', error);
      showToast('Error al registrar el pago', 'error');
    }
  };

  const handleCancelInvoice = (invoice: Invoice) => {
    setCancelInvoice(invoice);
    setCancellationReason('');
    setShowCancelModal(true);
  };

  const handleSubmitCancellation = async () => {
    if (!cancelInvoice) return;

    if (!cancellationReason.trim()) {
      showToast('Debe especificar un motivo de anulación', 'error');
      return;
    }

    try {
      await invoicesService.cancel(cancelInvoice.id, cancellationReason);
      showToast('Factura anulada exitosamente', 'success');
      setShowCancelModal(false);
      setCancelInvoice(null);
      setCancellationReason('');
      loadData();
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      showToast('Error al anular la factura', 'error');
    }
  };

  const getActionConfig = (action: string) => {
    const configs: Record<string, { icon: React.ReactNode; bgColor: string; badgeColor: string; label: string }> = {
      invoice_created: {
        icon: <FileText className="w-5 h-5 text-blue-600" />,
        bgColor: 'bg-blue-100',
        badgeColor: 'bg-blue-100 text-blue-700',
        label: 'Creada',
      },
      invoice_cancelled: {
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        bgColor: 'bg-red-100',
        badgeColor: 'bg-red-100 text-red-700',
        label: 'Anulada',
      },
      payment_received: {
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        bgColor: 'bg-green-100',
        badgeColor: 'bg-green-100 text-green-700',
        label: 'Pagado',
      },
      payment_reminder_sent: {
        icon: <Mail className="w-5 h-5 text-orange-600" />,
        bgColor: 'bg-orange-100',
        badgeColor: 'bg-orange-100 text-orange-700',
        label: 'Recordatorio',
      },
      tenant_suspended: {
        icon: <PauseCircle className="w-5 h-5 text-gray-600" />,
        bgColor: 'bg-gray-100',
        badgeColor: 'bg-gray-100 text-gray-700',
        label: 'Suspendido',
      },
      tenant_activated: {
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        bgColor: 'bg-green-100',
        badgeColor: 'bg-green-100 text-green-700',
        label: 'Activado',
      },
    };

    return configs[action] || {
      icon: <FileText className="w-5 h-5 text-gray-600" />,
      bgColor: 'bg-gray-100',
      badgeColor: 'bg-gray-100 text-gray-700',
      label: 'Acción',
    };
  };

  if (user?.role.type !== 'super_admin') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Esta página solo está disponible para Super Administradores.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-600">Cargando dashboard de facturación...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Facturación</h1>
          <p className="text-gray-600 mt-2">
            Gestión financiera y facturación del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateInvoices}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            Generar Facturas
          </button>
          <button
            onClick={handleSuspendOverdue}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <PauseCircle className="w-4 h-4" />
            Suspender Morosos
          </button>
          <button
            onClick={loadData}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos del Mes</p>
                <p className="text-2xl font-bold text-green-600">
                  {billingService.formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Facturas Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingInvoices}</p>
              </div>
              <FileText className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Facturas Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Facturas Pagadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Facturas Anuladas</p>
                <p className="text-2xl font-bold text-gray-600">{stats.cancelledInvoices}</p>
              </div>
              <XCircle className="w-10 h-10 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tenants Suspendidos</p>
                <p className="text-2xl font-bold text-gray-600">{stats.suspendedTenants}</p>
              </div>
              <PauseCircle className="w-10 h-10 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Próximos Vencimientos (7 días)</p>
                <p className="text-2xl font-bold text-orange-600">{stats.upcomingDue}</p>
              </div>
              <Calendar className="w-10 h-10 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Proyectados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {billingService.formatCurrency(stats.projectedRevenue)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      {stats && stats.revenueHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Historial de Ingresos (Últimos 6 meses)
          </h2>
          <div className="space-y-3">
            {stats.revenueHistory.map((item, index) => {
              const maxRevenue = Math.max(...stats.revenueHistory.map((h) => h.revenue));
              const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">{item.month}</span>
                    <span className="text-gray-900 font-bold">
                      {billingService.formatCurrency(item.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Billing History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Historial de Actividad</h2>
            <p className="text-sm text-gray-500 mt-1">Últimas {history.length} actividades registradas</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No hay actividad registrada</p>
              <p className="text-sm text-gray-500 mt-1">Las actividades aparecerán aquí cuando se realicen acciones</p>
            </div>
          ) : (
            history.map((item) => {
              const actionConfig = getActionConfig(item.action);
              return (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Icon with background */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${actionConfig.bgColor}`}>
                      {actionConfig.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">
                              {billingService.getActionLabel(item.action)}
                            </p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionConfig.badgeColor}`}>
                              {actionConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          
                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            {item.tenant && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Tenant:</span>
                                <span className="text-gray-700">{item.tenant.name}</span>
                              </div>
                            )}
                            {item.metadata?.invoiceNumber && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Factura:</span>
                                <span className="text-gray-700">{item.metadata.invoiceNumber}</span>
                              </div>
                            )}
                            {item.metadata?.amount && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Monto:</span>
                                <span className="text-gray-700 font-semibold">
                                  {billingService.formatCurrency(item.metadata.amount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Timestamp */}
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Facturas Recientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Facturas Recientes</h2>
        </div>
        <div className="divide-y">
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No hay facturas registradas
            </div>
          ) : (
            invoices.map((invoice) => {
              const isOverdue = invoicesService.isOverdue(invoice);
              return (
                <div
                  key={invoice.id}
                  className={`p-4 hover:bg-gray-50 border-l-4 ${
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
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-gray-900">{invoice.invoiceNumber}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${invoicesService.getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoicesService.getStatusLabel(invoice.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Tenant</p>
                          <p className="font-medium text-gray-900">{invoice.tenant?.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Vencimiento</p>
                          <p className="font-medium text-gray-900">
                            {new Date(invoice.dueDate).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-bold text-blue-600">
                            {invoicesService.formatCurrency(invoice.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handlePreviewPdf(invoice.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        title="Vista previa"
                      >
                        <Eye className="w-3 h-3" />
                        Vista Previa
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(invoice.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-3 h-3" />
                        Descargar
                      </button>
                      <button
                        onClick={() => handleResendEmail(invoice.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="Reenviar por email"
                      >
                        <Mail className="w-3 h-3" />
                        Reenviar
                      </button>
                      {invoice.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRegisterPayment(invoice)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                            title="Registrar pago manual"
                          >
                            <CreditCard className="w-3 h-3" />
                            Pago Manual
                          </button>
                          <button
                            onClick={() => handleCancelInvoice(invoice)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            title="Anular factura"
                          >
                            <XCircle className="w-3 h-3" />
                            Anular
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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

      {/* Modal de Anulación de Factura */}
      {showCancelModal && cancelInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Anular Factura</h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Advertencia:</strong> Esta acción no se puede deshacer. La factura será marcada como anulada.
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Factura:</strong> {cancelInvoice.invoiceNumber}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Tenant:</strong> {cancelInvoice.tenant?.name}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Monto:</strong> {invoicesService.formatCurrency(cancelInvoice.total)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de Anulación <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={4}
                  placeholder="Especifique el motivo de la anulación..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitCancellation}
                disabled={!cancellationReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anular Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingDashboardPage;
