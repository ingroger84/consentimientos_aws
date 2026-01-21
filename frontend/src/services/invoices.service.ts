import api from './api';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  taxConfigId?: string;
  taxExempt: boolean;
  taxExemptReason?: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'voided';
  dueDate: string;
  paidAt?: string;
  periodStart: string;
  periodEnd: string;
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  tenant?: any;
  payments?: any[];
  taxConfig?: any;
}

export interface CreateInvoiceDto {
  tenantId: string;
  taxConfigId?: string;
  taxExempt?: boolean;
  taxExemptReason?: string;
  amount: number;
  tax?: number;
  total: number;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  items: InvoiceItem[];
  notes?: string;
}

class InvoicesService {
  async getAll(filters?: {
    tenantId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Invoice[]> {
    const params = new URLSearchParams();
    if (filters?.tenantId) params.append('tenantId', filters.tenantId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/invoices?${params.toString()}`);
    return response.data;
  }

  async getById(id: string): Promise<Invoice> {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  }

  async getByTenant(tenantId: string): Promise<Invoice[]> {
    const response = await api.get(`/invoices/tenant/${tenantId}`);
    return response.data;
  }

  async create(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await api.post('/invoices', data);
    return response.data;
  }

  async markAsPaid(id: string): Promise<Invoice> {
    const response = await api.patch(`/invoices/${id}/mark-paid`);
    return response.data;
  }

  async cancel(id: string, reason?: string): Promise<Invoice> {
    const response = await api.patch(`/invoices/${id}/cancel`, { reason });
    return response.data;
  }

  async resendEmail(id: string): Promise<void> {
    await api.post(`/invoices/${id}/resend-email`);
  }

  async downloadPdf(id: string): Promise<void> {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    
    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `factura-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async previewPdf(id: string): Promise<void> {
    const response = await api.get(`/invoices/${id}/preview`, {
      responseType: 'blob',
    });
    
    // Abrir el PDF en una nueva pestaña
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    window.open(url, '_blank');
    
    // Limpiar el URL después de un tiempo
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  async getPdfUrl(id: string): Promise<string> {
    const response = await api.get(`/invoices/${id}/preview`, {
      responseType: 'blob',
    });
    
    // Crear URL del blob para usar en iframe
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    return url;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      paid: 'Pagada',
      overdue: 'Vencida',
      voided: 'Anulada',
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      voided: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isOverdue(invoice: Invoice): boolean {
    return invoice.status === 'pending' && this.getDaysUntilDue(invoice.dueDate) < 0;
  }
}

export const invoicesService = new InvoicesService();
