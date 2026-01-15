import api from './api';
import { User } from '@/types';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  roleId: string;
  branchIds?: string[];
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  roleId?: string;
  branchIds?: string[];
  isActive?: boolean;
}

export const userService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async getOne(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async create(dto: CreateUserDto): Promise<User> {
    const { data } = await api.post<User>('/users', dto);
    return data;
  },

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, dto);
    return data;
  },

  async changePassword(id: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.patch<{ message: string }>(`/users/${id}/change-password`, { newPassword });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async impersonate(userId: string): Promise<{
    magicToken: string;
    tenantSlug: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    message: string;
  }> {
    const { data } = await api.post(`/auth/impersonate/${userId}`);
    return data;
  },
};
