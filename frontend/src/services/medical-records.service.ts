import api from './api';
import { MedicalRecord, CreateMedicalRecordDto, CreateAnamnesisDto, Anamnesis } from '../types/medical-record';

class MedicalRecordsService {
  async getAll(filters?: any): Promise<MedicalRecord[]> {
    const response = await api.get('/medical-records', { params: filters });
    return response.data;
  }

  async getById(id: string): Promise<MedicalRecord> {
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  }

  async create(data: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const response = await api.post('/medical-records', data);
    return response.data;
  }

  async update(id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const response = await api.put(`/medical-records/${id}`, data);
    return response.data;
  }

  async close(id: string): Promise<MedicalRecord> {
    const response = await api.post(`/medical-records/${id}/close`);
    return response.data;
  }

  // Anamnesis
  async createAnamnesis(medicalRecordId: string, data: CreateAnamnesisDto): Promise<Anamnesis> {
    const response = await api.post(`/medical-records/${medicalRecordId}/anamnesis`, data);
    return response.data;
  }

  async getAnamnesis(medicalRecordId: string): Promise<Anamnesis[]> {
    const response = await api.get(`/medical-records/${medicalRecordId}/anamnesis`);
    return response.data;
  }

  async updateAnamnesis(medicalRecordId: string, anamnesisId: string, data: Partial<CreateAnamnesisDto>): Promise<Anamnesis> {
    const response = await api.put(`/medical-records/${medicalRecordId}/anamnesis/${anamnesisId}`, data);
    return response.data;
  }
}

export const medicalRecordsService = new MedicalRecordsService();
