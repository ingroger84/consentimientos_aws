import api from './api';

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  description?: string;
  country: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentTypeDto {
  code: string;
  name: string;
  description?: string;
  country?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateDocumentTypeDto extends Partial<CreateDocumentTypeDto> {}

class DocumentTypesService {
  async getAll(filters?: {
    country?: string;
    isActive?: boolean;
  }): Promise<DocumentType[]> {
    const params = new URLSearchParams();
    if (filters?.country) params.append('country', filters.country);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

    const response = await api.get(`/document-types?${params.toString()}`);
    return response.data;
  }

  async getById(id: string): Promise<DocumentType> {
    const response = await api.get(`/document-types/${id}`);
    return response.data;
  }

  async getByCode(code: string): Promise<DocumentType> {
    const response = await api.get(`/document-types/code/${code}`);
    return response.data;
  }

  async create(data: CreateDocumentTypeDto): Promise<DocumentType> {
    const response = await api.post('/document-types', data);
    return response.data;
  }

  async update(id: string, data: UpdateDocumentTypeDto): Promise<DocumentType> {
    const response = await api.patch(`/document-types/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/document-types/${id}`);
  }

  async restore(id: string): Promise<DocumentType> {
    const response = await api.post(`/document-types/${id}/restore`);
    return response.data;
  }
}

export const documentTypesService = new DocumentTypesService();
