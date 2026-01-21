import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { billingService, BillingStats, BillingHistory } from '@/services/billing.service';
import { invoicesService, Invoice } from '@/services/invoices.service';
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
  X,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import CreateInvoiceModal from '@/components/invoices/CreateInvoiceModal';
import api from '@/services/api';

const BillingDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [history, setHistory] = useState<BillingHistory[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [creatingPaymentLink, setCreatingPaymentLink] = useState<string | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    tenantSearch: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelInvoice, setCancelInvoice] = useState<Invoice | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, filters]);

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
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast.error('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Filtro por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(inv => inv.status === filters.status);
    }

    // Filtro por búsqueda de número de factura
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por búsqueda de tenant
    if (filters.tenantSearch) {
      const tenantSearchLower = filters.tenantSearch.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.tenant?.name.toLowerCase().includes(tenantSearchLower)
      );
    }

    // Filtro por rango de fechas
    if (filters.startDate) {
      filtered = filtered.filter(inv => 
        new Date(inv.createdAt) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(inv => 
        new Date(inv.createdAt) <= new Date(filters.endDate)
      );
    }

    // Filtro por rango de montos
    if (filters.minAmount) {
      filtered = filtered.filter(inv => inv.total >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(inv => inv.total <= parseFloat(filters.maxAmount));
    }

    setFilteredInvoices(filtered);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      tenantSearch: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  const handlePayNow = async (invoiceId: string) => {
    try {
      setCreatingPaymentLink(invoiceId);
      const response = await api.post(`/invoices/${invoiceId}/create-payment-link`);
      
      if (response.data.success && response.data.paymentLink) {
        window.open(response.data.paymentLink, '_blank');
        toast.success('Link creado', 'El link de pago se abrió en una nueva ventana');
      }
    } catch (error: any) {
      console.error('Error creating payment link:', error);
      toast.error('Error', error.response?.data?.message || 'Error al crear el link de pago');
    } finally {
      setCreatingPaymentLink(null);
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
            onClick={() => navigate('/billing/create-invoice')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Factura Manual
          </button>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Facturas Recientes</h2>
            <button
              onClick={() => navigate('/billing/invoices')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas →
            </button>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="space-y-4">
            {/* Primera fila: Búsqueda y botones */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por número de factura..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por tenant/cuenta..."
                  value={filters.tenantSearch}
                  onChange={(e) => setFilters({ ...filters, tenantSearch: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filtros
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filtros avanzados (colapsable) */}
            {showFilters && (
              <div className="pt-4 border-t space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="pending">Pendientes</option>
                      <option value="paid">Pagadas</option>
                      <option value="overdue">Vencidas</option>
                      <option value="voided">Anuladas</option>
                    </select>
                  </div>

                  {/* Fecha inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desde
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Fecha fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Monto mínimo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto Mínimo
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minAmount}
                      onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Monto máximo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto Máximo
                    </label>
                    <input
                      type="number"
                      placeholder="999999"
                      value={filters.maxAmount}
                      onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Botón limpiar filtros */}
                  <div className="flex items-end md:col-span-2">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Limpiar Filtros
                    </button>
                  </div>
                </div>

                {/* Resumen de filtros activos */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Mostrando:</span>
                  <span>{filteredInvoices.length} de {invoices.length} facturas</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="divide-y max-h-[800px] overflow-y-auto">
          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {invoices.length === 0 ? 'No hay facturas registradas' : 'No se encontraron facturas'}
              </h3>
              <p className="text-gray-500">
                {invoices.length === 0 
                  ? 'Las facturas aparecerán aquí cuando se generen' 
                  : 'Intenta ajustar los filtros de búsqueda'}
              </p>
              {invoices.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          ) : (
            filteredInvoices.map((invoice) => {
              const isOverdue = invoicesService.isOverdue(invoice);
              const daysUntilDue = invoicesService.getDaysUntilDue(invoice.dueDate);
              
              return (
                <div
                  key={invoice.id}
                  className={`p-6 hover:bg-gray-50 transition-all border-l-4 ${
                    invoice.status === 'paid'
                      ? 'border-green-500 bg-green-50/30'
                      : invoice.status === 'voided'
                      ? 'border-gray-400 bg-gray-50/50'
                      : isOverdue
                      ? 'border-red-500 bg-red-50/30'
                      : 'border-yellow-500 bg-yellow-50/30'
                  }`}
                >
                  <div className="flex items-start gap-6">
                    {/* Icono de estado */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      invoice.status === 'paid'
                        ? 'bg-green-100'
                        : invoice.status === 'voided'
                        ? 'bg-gray-100'
                        : isOverdue
                        ? 'bg-red-100'
                        : 'bg-yellow-100'
                    }`}>
                      {invoice.status === 'paid' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : invoice.status === 'voided' ? (
                        <XCircle className="w-6 h-6 text-gray-600" />
                      ) : isOverdue ? (
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-yellow-600" />
                      )}
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">
                            {invoice.invoiceNumber}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${invoicesService.getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoicesService.getStatusLabel(invoice.status)}
                          </span>
                          {invoice.status === 'pending' && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isOverdue 
                                ? 'bg-red-100 text-red-700' 
                                : daysUntilDue <= 3
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {isOverdue 
                                ? `Vencida hace ${Math.abs(daysUntilDue)} días` 
                                : `Vence en ${daysUntilDue} días`}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {invoicesService.formatCurrency(invoice.total)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(invoice.createdAt).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Información del tenant */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-medium text-gray-700">
                            {invoice.tenant?.name}
                          </span>
                        </div>
                      </div>

                      {/* Detalles en grid */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Período</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(invoice.periodStart).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })} - {new Date(invoice.periodEnd).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Vencimiento</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(invoice.dueDate).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Items</p>
                          <p className="text-sm font-medium text-gray-900">
                            {invoice.items?.length || 0} {invoice.items?.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex flex-wrap gap-2">
                        {invoice.status === 'pending' && (
                          <button
                            onClick={() => handlePayNow(invoice.id)}
                            disabled={creatingPaymentLink === invoice.id}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {creatingPaymentLink === invoice.id ? 'Generando...' : 'Pagar Ahora'}
                          </button>
                        )}
                        <button
                          onClick={() => handlePreviewPdf(invoice.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Vista Previa
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(invoice.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Descargar
                        </button>
                        <button
                          onClick={() => handleResendEmail(invoice.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        >
                          <Mail className="w-4 h-4" />
                          Reenviar
                        </button>
                        {invoice.status === 'pending' && (
                          <button
                            onClick={() => handleCancelInvoice(invoice)}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            Anular
                          </button>
                        )}
                      </div>
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

      {/* Modal de Crear Factura Manual */}
      {showCreateInvoiceModal && selectedTenant && (
        <CreateInvoiceModal
          tenantId={selectedTenant.id}
          tenantName={selectedTenant.name}
          onClose={() => {
            setShowCreateInvoiceModal(false);
            setSelectedTenant(null);
          }}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default BillingDashboardPage;
