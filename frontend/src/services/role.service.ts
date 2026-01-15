import api from './api';
import { Role } from '@/types';

export const roleService = {
  async getAll(): Promise<Role[]> {
    const { data } = await api.get<Role[]>('/roles');
    return data;
  },
};
