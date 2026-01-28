import api from './api';
import { ConsentTemplate, CreateTemplateDto, UpdateTemplateDto, TemplateType } from '../types/template';

class TemplateService {
  async getAll(): Promise<ConsentTemplate[]> {
    const { data } = await api.get<ConsentTemplate[]>('/consent-templates');
    return data;
  }

  async getById(id: string): Promise<ConsentTemplate> {
    const { data } = await api.get<ConsentTemplate>(`/consent-templates/${id}`);
    return data;
  }

  async getByType(type: TemplateType): Promise<ConsentTemplate[]> {
    const { data } = await api.get<ConsentTemplate[]>(`/consent-templates/by-type/${type}`);
    return data;
  }

  async getDefaultByType(type: TemplateType): Promise<ConsentTemplate> {
    const { data } = await api.get<ConsentTemplate>(`/consent-templates/default/${type}`);
    return data;
  }

  async getAvailableVariables(): Promise<Record<string, string>> {
    const { data } = await api.get<Record<string, string>>('/consent-templates/variables');
    return data;
  }

  async create(template: CreateTemplateDto): Promise<ConsentTemplate> {
    const { data } = await api.post<ConsentTemplate>('/consent-templates', template);
    return data;
  }

  async update(id: string, template: UpdateTemplateDto): Promise<ConsentTemplate> {
    const { data } = await api.patch<ConsentTemplate>(`/consent-templates/${id}`, template);
    return data;
  }

  async setAsDefault(id: string): Promise<ConsentTemplate> {
    const { data } = await api.patch<ConsentTemplate>(`/consent-templates/${id}/set-default`, {});
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/consent-templates/${id}`);
  }

  async initializeDefaults(): Promise<{ message: string; count: number }> {
    const { data } = await api.post<{ message: string; count: number }>('/consent-templates/initialize-defaults', {});
    return data;
  }
}

export const templateService = new TemplateService();
