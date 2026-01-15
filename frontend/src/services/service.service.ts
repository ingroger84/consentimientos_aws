import api from './api';
import { Service } from '@/types';

export interface CreateServiceDto {
  name: string;
  description?: string;
  pdfTemplateUrl?: string;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  pdfTemplateUrl?: string;
  isActive?: boolean;
}

export const serviceService = {
  async getAll(): Promise<Service[]> {
    const { data } = await api.get<Service[]>('/services');
    return data;
  },

  async getOne(id: string): Promise<Service> {
    const { data } = await api.get<Service>(`/services/${id}`);
    return data;
  },

  async create(dto: CreateServiceDto): Promise<Service> {
    const { data } = await api.post<Service>('/services', dto);
    return data;
  },

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const { data } = await api.patch<Service>(`/services/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },
};
