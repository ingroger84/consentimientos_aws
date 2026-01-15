import api from './api';
import { Question } from '@/types';

export interface CreateQuestionDto {
  questionText: string;
  type: 'YES_NO' | 'TEXT';
  isRequired?: boolean;
  isCritical?: boolean;
  order?: number;
  serviceId: string;
}

export interface UpdateQuestionDto {
  questionText?: string;
  type?: 'YES_NO' | 'TEXT';
  isRequired?: boolean;
  isCritical?: boolean;
  order?: number;
  serviceId?: string;
}

export const questionService = {
  async getAll(serviceId?: string): Promise<Question[]> {
    const params = serviceId ? { serviceId } : {};
    const { data } = await api.get<Question[]>('/questions', { params });
    return data;
  },

  async getOne(id: string): Promise<Question> {
    const { data } = await api.get<Question>(`/questions/${id}`);
    return data;
  },

  async create(dto: CreateQuestionDto): Promise<Question> {
    const { data } = await api.post<Question>('/questions', dto);
    return data;
  },

  async update(id: string, dto: UpdateQuestionDto): Promise<Question> {
    const { data } = await api.patch<Question>(`/questions/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/questions/${id}`);
  },
};
