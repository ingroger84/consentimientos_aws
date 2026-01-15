import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { invoicesService, Invoice } from '@/services/invoices.service';
import { AlertCircle, X, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentReminderBanner: React.FC = () => {
  const { user } = useAuthStore();
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

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
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
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
                <Link
                  to="/invoices"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <CreditCard className="w-4 h-4" />
                  Ver Facturas y Pagar
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

    // Solo mostrar si faltan 7 días o menos
    if (daysUntilDue <= 7) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900">
                  Recordatorio de Pago
                </h3>
                <p className="text-yellow-800 mt-1">
                  Tu factura <strong>{invoice.invoiceNumber}</strong> vence en {daysUntilDue}{' '}
                  día(s). Monto a pagar: <strong>{invoicesService.formatCurrency(invoice.total)}</strong>
                </p>
                <div className="flex gap-3 mt-3">
                  <Link
                    to="/invoices"
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
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
