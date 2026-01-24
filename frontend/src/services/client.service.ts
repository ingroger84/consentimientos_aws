import api from './api';
import { Client, CreateClientDto, UpdateClientDto, SearchClientDto } from '../types/client';

export const clientService = {
  /**
   * Obtener todos los clientes
   */
  async getAll(): Promise<Client[]> {
    const response = await api.get('/clients');
    return response.data;
  },

  /**
   * Buscar clientes
   */
  async search(params: SearchClientDto): Promise<Client[]> {
    const response = await api.get('/clients/search', { params });
    return response.data;
  },

  /**
   * Obtener un cliente por ID
   */
  async getById(id: string): Promise<Client> {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo cliente
   */
  async create(data: CreateClientDto): Promise<Client> {
    const response = await api.post('/clients', data);
    return response.data;
  },

  /**
   * Actualizar un cliente
   */
  async update(id: string, data: UpdateClientDto): Promise<Client> {
    const response = await api.patch(`/clients/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un cliente
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },

  /**
   * Obtener estadísticas de clientes
   */
  async getStats(): Promise<{
    totalClients: number;
    clientsWithConsents: number;
    recentClients: number;
  }> {
    const response = await api.get('/clients/stats');
    return response.data;
  },
};
