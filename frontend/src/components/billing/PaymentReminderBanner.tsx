import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { invoicesService, Invoice } from '@/services/invoices.service';
import { AlertCircle, X, CreditCard, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import BillingCycleReminderBanner from './BillingCycleReminderBanner';

// Log para verificar que el módulo se carga
console.log('📦 [PaymentReminderBanner] MÓDULO CARGADO');

// Alert visible para debugging
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('🚨 [PaymentReminderBanner] WINDOW LOADED');
  });
}

const PaymentReminderBanner: React.FC = () => {
  // Alert inmediato
  console.log('🚨🚨🚨 [PaymentReminderBanner] COMPONENTE EJECUTÁNDOSE 🚨🚨🚨');
  
  const { user } = useAuthStore();
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatingPaymentLink, setCreatingPaymentLink] = useState(false);

  // Logs de debugging
  console.log('🚀 [PaymentReminderBanner] COMPONENTE RENDERIZADO');
  console.log('🔍 [PaymentReminderBanner] Loading:', loading);
  console.log('🔍 [PaymentReminderBanner] User:', user ? 'Existe' : 'No existe');
  console.log('🔍 [PaymentReminderBanner] Tenant:', user?.tenant ? 'Existe' : 'No existe');
  console.log('🔍 [PaymentReminderBanner] Dismissed:', dismissed);
  console.log('🔍 [PaymentReminderBanner] Pending Invoices:', pendingInvoices.length);

  useEffect(() => {
    console.log('🔍 [PaymentReminderBanner] useEffect ejecutándose...');
    loadPendingInvoices();
  }, []);

  const loadPendingInvoices = async () => {
    try {
      console.log('🔍 [PaymentReminderBanner] Cargando facturas pendientes...');
      const tenantId = user?.tenant?.id;
      if (!tenantId) {
        console.log('❌ [PaymentReminderBanner] No hay tenant ID');
        setLoading(false);
        return;
      }

      console.log('🔍 [PaymentReminderBanner] Tenant ID:', tenantId);
      const invoices = await invoicesService.getByTenant(tenantId);
      console.log('🔍 [PaymentReminderBanner] Facturas obtenidas:', invoices.length);
      
      const pending = invoices.filter(
        (inv) => inv.status === 'pending' || inv.status === 'overdue'
      );
      console.log('🔍 [PaymentReminderBanner] Facturas pendientes:', pending.length);
      setPendingInvoices(pending);
    } catch (error) {
      console.error('❌ [PaymentReminderBanner] Error loading pending invoices:', error);
    } finally {
      console.log('✅ [PaymentReminderBanner] Carga completada');
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

  if (loading || !user?.tenant || dismissed) {
    console.log('❌ [PaymentReminderBanner] No mostrar - Loading:', loading, 'User:', !!user, 'Tenant:', !!user?.tenant, 'Dismissed:', dismissed);
    // No renderizar nada durante el loading para evitar que BillingCycleReminderBanner se renderice sin datos
    if (loading) {
      return null;
    }
    return <BillingCycleReminderBanner />;
  }

  // Mostrar banner rojo SIEMPRE que haya facturas pendientes (desde el día de generación)
  // Ya no importa si está vencida o no, el banner rojo aparece inmediatamente
  if (pendingInvoices.length > 0) {
    console.log('🔴 [PaymentReminderBanner] Mostrando BANNER ROJO - Hay facturas pendientes');
    const invoice = pendingInvoices[0];
    const daysUntilDue = invoicesService.getDaysUntilDue(invoice.dueDate);
    const isOverdue = daysUntilDue < 0;
    const daysOverdue = Math.abs(daysUntilDue);

    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-bounce" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900">
                {isOverdue ? '⚠️ Factura Vencida - Acción Requerida' : '⚠️ Factura Pendiente - Pago Urgente Requerido'}
              </h3>
              <p className="text-red-800 mt-1">
                {isOverdue ? (
                  <>
                    Tienes {pendingInvoices.length} factura(s) vencida(s). La factura{' '}
                    <strong>{invoice.invoiceNumber}</strong> venció hace {daysOverdue} día(s).
                    Tu cuenta será suspendida si no realizas el pago inmediatamente.
                  </>
                ) : (
                  <>
                    Tu factura <strong>{invoice.invoiceNumber}</strong> vence el{' '}
                    <strong>{new Date(invoice.dueDate).toLocaleDateString('es-CO', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</strong> ({daysUntilDue} {daysUntilDue === 1 ? 'día' : 'días'} restantes).
                    Monto a pagar: <strong className="text-red-900">{invoicesService.formatCurrency(invoice.total)}</strong>.
                    Tu servicio está condicionado hasta que realices el pago.
                  </>
                )}
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

  // Si no hay facturas pendientes, mostrar banner de pre-aviso
  console.log('🔵 [PaymentReminderBanner] Mostrando BANNER AZUL - No hay facturas pendientes');
  return <BillingCycleReminderBanner />;
};

export default PaymentReminderBanner;
