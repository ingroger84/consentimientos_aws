import api from './api';

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'transfer' | 'card' | 'pse' | 'cash' | 'other';
  paymentReference?: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
  tenant?: any;
  invoice?: any;
}

export interface CreatePaymentDto {
  tenantId: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: 'transfer' | 'card' | 'pse' | 'cash' | 'other';
  paymentReference?: string;
  paymentDate?: string;
  notes?: string;
}

class PaymentsService {
  async getAll(filters?: {
    tenantId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (filters?.tenantId) params.append('tenantId', filters.tenantId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/payments?${params.toString()}`);
    return response.data;
  }

  async getById(id: string): Promise<Payment> {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }

  async getByTenant(tenantId: string): Promise<Payment[]> {
    const response = await api.get(`/payments/tenant/${tenantId}`);
    return response.data;
  }

  async create(data: CreatePaymentDto): Promise<Payment> {
    const response = await api.post('/payments', data);
    return response.data;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      transfer: 'Transferencia',
      card: 'Tarjeta',
      pse: 'PSE',
      cash: 'Efectivo',
      other: 'Otro',
    };
    return labels[method] || method;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      completed: 'Completado',
      failed: 'Fallido',
      refunded: 'Reembolsado',
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}

export const paymentsService = new PaymentsService();
