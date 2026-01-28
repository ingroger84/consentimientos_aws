import api from './api';

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  tenantId: string;
}

class BranchesService {
  async getAll(): Promise<Branch[]> {
    const { data } = await api.get<Branch[]>('/branches');
    return data;
  }

  async getById(id: string): Promise<Branch> {
    const { data } = await api.get<Branch>(`/branches/${id}`);
    return data;
  }
}

export const branchesService = new BranchesService();
