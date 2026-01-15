import api from './api';

export interface BillingStats {
  monthlyRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  paidInvoices: number;
  cancelledInvoices: number;
  suspendedTenants: number;
  upcomingDue: number;
  projectedRevenue: number;
  revenueHistory: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface BillingHistory {
  id: string;
  tenantId: string;
  action: string;
  description: string;
  metadata?: any;
  createdAt: string;
  tenant?: any;
}

class BillingService {
  async getDashboardStats(): Promise<BillingStats> {
    const response = await api.get('/billing/dashboard');
    return response.data;
  }

  async getHistory(tenantId?: string, limit: number = 50): Promise<BillingHistory[]> {
    const params = new URLSearchParams();
    if (tenantId) params.append('tenantId', tenantId);
    if (limit) params.append('limit', limit.toString());

    const response = await api.get(`/billing/history?${params.toString()}`);
    return response.data;
  }

  async generateMonthlyInvoices(): Promise<{ generated: number; errors: string[] }> {
    const response = await api.post('/billing/generate-invoices');
    return response.data;
  }

  async suspendOverdueTenants(): Promise<{ suspended: number; errors: string[] }> {
    const response = await api.post('/billing/suspend-overdue');
    return response.data;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      invoice_created: 'Factura Creada',
      invoice_cancelled: 'Factura Anulada',
      payment_received: 'Pago Recibido',
      payment_reminder_sent: 'Recordatorio Enviado',
      tenant_suspended: 'Tenant Suspendido',
      tenant_activated: 'Tenant Activado',
    };
    return labels[action] || action;
  }

  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      invoice_created: '📄',
      invoice_cancelled: '❌',
      payment_received: '✅',
      payment_reminder_sent: '📧',
      tenant_suspended: '⏸️',
      tenant_activated: '▶️',
    };
    return icons[action] || '📝';
  }
}

export const billingService = new BillingService();
