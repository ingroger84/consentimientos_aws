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

  async archive(id: string): Promise<MedicalRecord> {
    const response = await api.post(`/medical-records/${id}/archive`);
    return response.data;
  }

  async reopen(id: string): Promise<MedicalRecord> {
    const response = await api.post(`/medical-records/${id}/reopen`);
    return response.data;
  }

  // Anamnesis
  async addAnamnesis(medicalRecordId: string, data: CreateAnamnesisDto): Promise<Anamnesis> {
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

  // Physical Exams
  async addPhysicalExam(medicalRecordId: string, data: any): Promise<any> {
    const response = await api.post(`/medical-records/${medicalRecordId}/physical-exams`, data);
    return response.data;
  }

  async getPhysicalExams(medicalRecordId: string): Promise<any[]> {
    const response = await api.get(`/medical-records/${medicalRecordId}/physical-exams`);
    return response.data;
  }

  // Diagnoses
  async addDiagnosis(medicalRecordId: string, data: any): Promise<any> {
    const response = await api.post(`/medical-records/${medicalRecordId}/diagnoses`, data);
    return response.data;
  }

  async getDiagnoses(medicalRecordId: string): Promise<any[]> {
    const response = await api.get(`/medical-records/${medicalRecordId}/diagnoses`);
    return response.data;
  }

  // Evolutions
  async addEvolution(medicalRecordId: string, data: any): Promise<any> {
    const response = await api.post(`/medical-records/${medicalRecordId}/evolutions`, data);
    return response.data;
  }

  async getEvolutions(medicalRecordId: string): Promise<any[]> {
    const response = await api.get(`/medical-records/${medicalRecordId}/evolutions`);
    return response.data;
  }

  // Consents
  async createConsent(medicalRecordId: string, data: any): Promise<any> {
    const response = await api.post(`/medical-records/${medicalRecordId}/consents`, data);
    return response.data;
  }

  async getConsents(medicalRecordId: string): Promise<any[]> {
    const response = await api.get(`/medical-records/${medicalRecordId}/consents`);
    return response.data;
  }

  async resendConsentEmail(medicalRecordId: string, consentId: string): Promise<void> {
    await api.post(`/medical-records/${medicalRecordId}/consents/${consentId}/resend-email`);
  }

  async deleteConsent(medicalRecordId: string, consentId: string): Promise<void> {
    await api.delete(`/medical-records/${medicalRecordId}/consents/${consentId}`);
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/medical-records/${id}`);
  }

  // Vista previa y envío de email para HC completa
  async getRecordPdfUrl(id: string): Promise<string> {
    // Por ahora retornamos la URL del primer consentimiento
    // En el futuro se podría generar un PDF completo de la HC
    const consents = await this.getConsents(id);
    if (consents.length === 0) {
      throw new Error('No hay consentimientos generados para esta historia clínica');
    }
    // Retornar URL del PDF del primer consentimiento
    return `/api/medical-records/${id}/consents/${consents[0].id}/pdf`;
  }

  async sendRecordEmail(id: string): Promise<void> {
    // Por ahora enviamos el email del primer consentimiento
    // En el futuro se podría enviar un email con la HC completa
    const consents = await this.getConsents(id);
    if (consents.length === 0) {
      throw new Error('No hay consentimientos generados para esta historia clínica');
    }
    await this.resendConsentEmail(id, consents[0].id);
  }
}

export const medicalRecordsService = new MedicalRecordsService();
