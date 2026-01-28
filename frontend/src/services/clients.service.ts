import api from './api';

export interface Client {
  id: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  eps?: string;
  epsCode?: string;
  occupation?: string;
  maritalStatus?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  tenantId: string;
}

class ClientsService {
  async getAll(): Promise<Client[]> {
    const { data } = await api.get<Client[]>('/clients');
    return data;
  }

  async getById(id: string): Promise<Client> {
    const { data } = await api.get<Client>(`/clients/${id}`);
    return data;
  }

  async search(query: string): Promise<Client[]> {
    const { data } = await api.get<Client[]>(`/clients/search?q=${encodeURIComponent(query)}`);
    return data;
  }
}

export const clientsService = new ClientsService();
