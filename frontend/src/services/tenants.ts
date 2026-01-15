import api from './api';
import { Tenant, TenantStats, GlobalStats, CreateTenantDto, UpdateTenantDto } from '../types/tenant';

export const tenantsService = {
  // Obtener todos los tenants
  getAll: async (): Promise<Tenant[]> => {
    const response = await api.get('/tenants');
    return response.data;
  },

  // Obtener un tenant por ID
  getById: async (id: string): Promise<Tenant> => {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },

  // Crear un nuevo tenant
  create: async (data: CreateTenantDto): Promise<Tenant> => {
    const response = await api.post('/tenants', data);
    return response.data;
  },

  // Actualizar un tenant
  update: async (id: string, data: UpdateTenantDto): Promise<Tenant> => {
    const response = await api.patch(`/tenants/${id}`, data);
    return response.data;
  },

  // Suspender un tenant
  suspend: async (id: string): Promise<Tenant> => {
    const response = await api.patch(`/tenants/${id}/suspend`);
    return response.data;
  },

  // Activar un tenant
  activate: async (id: string): Promise<Tenant> => {
    const response = await api.patch(`/tenants/${id}/activate`);
    return response.data;
  },

  // Eliminar un tenant
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tenants/${id}`);
  },

  // Obtener estadísticas de un tenant
  getStats: async (id: string): Promise<TenantStats> => {
    const response = await api.get(`/tenants/${id}/stats`);
    return response.data;
  },

  // Obtener estadísticas globales
  getGlobalStats: async (): Promise<GlobalStats> => {
    const response = await api.get('/tenants/stats/global');
    return response.data;
  },

  // Reenviar correo de bienvenida
  resendWelcomeEmail: async (id: string): Promise<{ message: string }> => {
    const response = await api.post(`/tenants/${id}/resend-welcome-email`);
    return response.data;
  },
};
