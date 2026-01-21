import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { invoicesService, Invoice } from '@/services/invoices.service';
import { AlertCircle, X, CreditCard, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/services/api';

const PaymentReminderBanner: React.FC = () => {
  const { user } = useAuthStore();
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatingPaymentLink, setCreatingPaymentLink] = useState(false);

  useEffect(() => {
    loadPendingInvoices();
  }, []);

  const loadPendingInvoices = async () => {
    try {
      const tenantId = user?.tenant?.id;
      if (!tenantId) {
        setLoading(false);
        return;
      }

      const invoices = await invoicesService.getByTenant(tenantId);
      const pending = invoices.filter(
        (inv) => inv.status === 'pending' || inv.status === 'overdue'
      );
      setPendingInvoices(pending);
    } catch (error) {
      console.error('Error loading pending invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (invoiceId: string) => {
    try {
      setCreatingPaymentLink(true);
      const response = await api.post(`/invoices/${invoiceId}/create-payment-link`);
      
      if (response.data.success && response.data.paymentLink) {
        // Abrir link de pago en nueva ventana
        window.open(response.data.paymentLink, '_blank');
      }
    } catch (error: any) {
      console.error('Error creating payment link:', error);
      alert(error.response?.data?.message || 'Error al crear el link de pago');
    } finally {
      setCreatingPaymentLink(false);
    }
  };

  if (loading || !user?.tenant || pendingInvoices.length === 0 || dismissed) {
    return null;
  }

  const overdueInvoices = pendingInvoices.filter((inv) => invoicesService.isOverdue(inv));
  const upcomingInvoices = pendingInvoices.filter((inv) => !invoicesService.isOverdue(inv));

  // Mostrar banner rojo si hay facturas vencidas
  if (overdueInvoices.length > 0) {
    const invoice = overdueInvoices[0];
    const daysOverdue = Math.abs(invoicesService.getDaysUntilDue(invoice.dueDate));

    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-bounce" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900">
                ⚠️ Factura Vencida - Acción Requerida
              </h3>
              <p className="text-red-800 mt-1">
                Tienes {overdueInvoices.length} factura(s) vencida(s). La factura{' '}
                <strong>{invoice.invoiceNumber}</strong> venció hace {daysOverdue} día(s).
                Tu cuenta puede ser suspendida si no realizas el pago pronto.
              </p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handlePayNow(invoice.id)}
                  disabled={creatingPaymentLink}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="w-4 h-4" />
                  {creatingPaymentLink ? 'Generando link...' : 'Pagar Ahora'}
                </button>
                <Link
                  to="/my-invoices"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <CreditCard className="w-4 h-4" />
                  Ver Facturas
                </Link>
              </div>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Mostrar banner amarillo si hay facturas próximas a vencer
  if (upcomingInvoices.length > 0) {
    const invoice = upcomingInvoices[0];
    const daysUntilDue = invoicesService.getDaysUntilDue(invoice.dueDate);

    // Solo mostrar si faltan 5 días o menos
    if (daysUntilDue <= 5) {
      return (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 mb-6 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-yellow-900">
                    💳 Recordatorio de Pago
                  </h3>
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded-full">
                    {daysUntilDue} {daysUntilDue === 1 ? 'día' : 'días'} restantes
                  </span>
                </div>
                <p className="text-yellow-800 mt-1">
                  Tu factura <strong>{invoice.invoiceNumber}</strong> vence el{' '}
                  <strong>{new Date(invoice.dueDate).toLocaleDateString('es-CO', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</strong>.
                  Monto a pagar: <strong className="text-yellow-900">{invoicesService.formatCurrency(invoice.total)}</strong>
                </p>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => handlePayNow(invoice.id)}
                    disabled={creatingPaymentLink}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {creatingPaymentLink ? 'Generando link...' : 'Pagar Ahora'}
                  </button>
                  <Link
                    to="/my-invoices"
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-yellow-700 border-2 border-yellow-500 rounded-lg hover:bg-yellow-50 transition-colors text-sm font-medium"
                  >
                    <CreditCard className="w-4 h-4" />
                    Ver Factura
                  </Link>
                </div>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-yellow-600 hover:text-yellow-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }
  }

  return null;
};

export default PaymentReminderBanner;
