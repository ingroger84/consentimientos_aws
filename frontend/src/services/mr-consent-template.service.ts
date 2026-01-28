import api from './api';

export interface MRConsentTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string; // Cambiado a string para permitir categorías personalizadas
  content: string;
  availableVariables?: string[];
  isActive: boolean;
  isDefault: boolean;
  requiresSignature: boolean;
  tenantId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateMRConsentTemplateDto {
  name: string;
  description?: string;
  category?: string; // Cambiado a string para permitir categorías personalizadas
  content: string;
  availableVariables?: string[];
  isActive?: boolean;
  isDefault?: boolean;
  requiresSignature?: boolean;
}

export interface UpdateMRConsentTemplateDto {
  name?: string;
  description?: string;
  category?: string; // Cambiado a string para permitir categorías personalizadas
  content?: string;
  availableVariables?: string[];
  isActive?: boolean;
  isDefault?: boolean;
  requiresSignature?: boolean;
}

class MRConsentTemplateService {
  private baseUrl = '/medical-record-consent-templates';

  async getAll(): Promise<MRConsentTemplate[]> {
    const response = await api.get(this.baseUrl);
    return response.data;
  }

  async getByCategory(category: string): Promise<MRConsentTemplate[]> {
    const response = await api.get(`${this.baseUrl}/by-category/${category}`);
    return response.data;
  }

  async getById(id: string): Promise<MRConsentTemplate> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getAvailableVariables(): Promise<Record<string, string>> {
    const response = await api.get(`${this.baseUrl}/variables`);
    return response.data;
  }

  async create(data: CreateMRConsentTemplateDto): Promise<MRConsentTemplate> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: UpdateMRConsentTemplateDto): Promise<MRConsentTemplate> {
    const response = await api.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async setAsDefault(id: string): Promise<MRConsentTemplate> {
    const response = await api.post(`${this.baseUrl}/${id}/set-default`);
    return response.data;
  }

  async initializeDefaults(): Promise<{ message: string; count: number }> {
    const response = await api.post(`${this.baseUrl}/initialize-defaults`);
    return response.data;
  }
}

export const mrConsentTemplateService = new MRConsentTemplateService();
