import api from './api';

export enum TaxApplicationType {
  INCLUDED = 'included',
  ADDITIONAL = 'additional',
}

export interface TaxConfig {
  id: string;
  name: string;
  rate: number;
  applicationType: TaxApplicationType;
  isActive: boolean;
  isDefault: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxConfigDto {
  name: string;
  rate: number;
  applicationType: TaxApplicationType;
  isActive?: boolean;
  isDefault?: boolean;
  description?: string;
}

export interface UpdateTaxConfigDto extends Partial<CreateTaxConfigDto> {}

export interface TaxCalculation {
  tax: number;
  total: number;
}

class TaxConfigService {
  async getAll(): Promise<TaxConfig[]> {
    const response = await api.get('/invoices/tax-configs');
    return response.data;
  }

  async getActive(): Promise<TaxConfig[]> {
    const response = await api.get('/invoices/tax-configs/active');
    return response.data;
  }

  async getDefault(): Promise<TaxConfig | null> {
    const response = await api.get('/invoices/tax-configs/default');
    return response.data;
  }

  async getById(id: string): Promise<TaxConfig> {
    const response = await api.get(`/invoices/tax-configs/${id}`);
    return response.data;
  }

  async create(data: CreateTaxConfigDto): Promise<TaxConfig> {
    const response = await api.post('/invoices/tax-configs', data);
    return response.data;
  }

  async update(id: string, data: UpdateTaxConfigDto): Promise<TaxConfig> {
    const response = await api.patch(`/invoices/tax-configs/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/invoices/tax-configs/${id}`);
  }

  async setDefault(id: string): Promise<TaxConfig> {
    const response = await api.patch(`/invoices/tax-configs/${id}/set-default`);
    return response.data;
  }

  async calculateTax(taxConfigId: string, amount: number): Promise<TaxCalculation> {
    const response = await api.post(`/invoices/tax-configs/${taxConfigId}/calculate`, { amount });
    return response.data;
  }

  getApplicationTypeLabel(type: TaxApplicationType): string {
    const labels: Record<TaxApplicationType, string> = {
      [TaxApplicationType.INCLUDED]: 'Incluido en el precio',
      [TaxApplicationType.ADDITIONAL]: 'Adicional al precio',
    };
    return labels[type];
  }

  formatRate(rate: number): string {
    return `${rate}%`;
  }
}

export const taxConfigService = new TaxConfigService();
