import api from './api';
import { Branch } from '@/types';

export interface CreateBranchDto {
  name: string;
  address: string;
  phone?: string;
  email: string;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export const branchService = {
  async getAll(): Promise<Branch[]> {
    // Para crear consentimientos - retorna sedes del usuario
    const { data } = await api.get<Branch[]>('/branches');
    return data;
  },

  async getAllForAdmin(): Promise<Branch[]> {
    // Para administración de sedes - retorna todas las sedes
    const { data } = await api.get<Branch[]>('/branches/all');
    return data;
  },

  async getOne(id: string): Promise<Branch> {
    const { data } = await api.get<Branch>(`/branches/${id}`);
    return data;
  },

  async create(dto: CreateBranchDto): Promise<Branch> {
    const { data } = await api.post<Branch>('/branches', dto);
    return data;
  },

  async update(id: string, dto: UpdateBranchDto): Promise<Branch> {
    const { data } = await api.patch<Branch>(`/branches/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/branches/${id}`);
  },
};
