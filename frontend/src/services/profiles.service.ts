import api from './api';
import {
  Profile,
  SystemModule,
  ModuleAction,
  PermissionAudit,
  CreateProfileDto,
  UpdateProfileDto,
  AssignProfileDto,
  CheckPermissionDto,
  ModulesByCategory,
} from '../types/profile.types';

class ProfilesService {
  // Perfiles
  async getProfiles(tenantId?: string): Promise<Profile[]> {
    const params = tenantId ? { tenantId } : {};
    const response = await api.get('/profiles', { params });
    return response.data;
  }

  async getProfile(id: string): Promise<Profile> {
    const response = await api.get(`/profiles/${id}`);
    return response.data;
  }

  async createProfile(data: CreateProfileDto): Promise<Profile> {
    const response = await api.post('/profiles', data);
    return response.data;
  }

  async updateProfile(id: string, data: UpdateProfileDto): Promise<Profile> {
    const response = await api.patch(`/profiles/${id}`, data);
    return response.data;
  }

  async deleteProfile(id: string): Promise<void> {
    await api.delete(`/profiles/${id}`);
  }

  async assignProfile(data: AssignProfileDto): Promise<any> {
    const response = await api.post('/profiles/assign', data);
    return response.data;
  }

  async revokeProfile(userId: string): Promise<any> {
    const response = await api.delete(`/profiles/revoke/${userId}`);
    return response.data;
  }

  async getProfileAudit(id: string): Promise<PermissionAudit[]> {
    const response = await api.get(`/profiles/${id}/audit`);
    return response.data;
  }

  async checkPermission(data: CheckPermissionDto): Promise<{ hasPermission: boolean }> {
    const response = await api.post('/profiles/check-permission', data);
    return response.data;
  }

  async getUserPermissions(userId: string): Promise<{
    permissions: Array<{ module: string; actions: string[] }>;
    profile: { id: string; name: string; description: string };
  }> {
    const response = await api.get(`/profiles/user/${userId}/permissions`);
    return response.data;
  }

  // Módulos
  async getModules(): Promise<SystemModule[]> {
    const response = await api.get('/modules');
    return response.data;
  }

  async getModulesByCategory(): Promise<ModulesByCategory> {
    const response = await api.get('/modules/by-category');
    return response.data;
  }

  async getModuleActions(moduleId: string): Promise<ModuleAction[]> {
    const response = await api.get(`/modules/${moduleId}/actions`);
    return response.data;
  }
}

export default new ProfilesService();
