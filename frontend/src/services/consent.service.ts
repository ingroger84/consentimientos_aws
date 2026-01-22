import api from './api';
import { Consent } from '@/types';

export interface CreateConsentDto {
  clientName: string;
  clientId: string;
  clientEmail: string;
  clientPhone?: string;
  clientPhoto?: string;
  serviceId: string;
  branchId: string;
  answers: Array<{
    questionId: string;
    value: string;
  }>;
}

export interface SignConsentDto {
  signatureData: string;
}

export const consentService = {
  async getAll(search?: string): Promise<Consent[]> {
    const params = search ? { search } : {};
    const { data } = await api.get<Consent[]>('/consents', { params });
    return data;
  },

  async getOne(id: string): Promise<Consent> {
    const { data } = await api.get<Consent>(`/consents/${id}`);
    return data;
  },

  async getById(id: string): Promise<Consent> {
    return this.getOne(id);
  },

  async create(dto: CreateConsentDto): Promise<Consent> {
    const { data } = await api.post<Consent>('/consents', dto);
    return data;
  },

  async sign(id: string, dto: SignConsentDto): Promise<Consent> {
    const { data } = await api.patch<Consent>(`/consents/${id}/sign`, dto);
    return data;
  },

  async resendEmail(id: string): Promise<void> {
    await api.post(`/consents/${id}/resend-email`);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/consents/${id}`);
  },
};
