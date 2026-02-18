import api from './api';

export interface Admission {
  id: string;
  medicalRecordId: string;
  admissionNumber: string;
  admissionDate: string;
  admissionType: string;
  reason: string;
  status: 'active' | 'closed' | 'cancelled';
  isLocked: boolean;
  closedAt?: string;
  closedBy?: string;
  closureNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: any;
  closer?: any;
  anamnesis?: any[];
  physicalExams?: any[];
  diagnoses?: any[];
  evolutions?: any[];
  consents?: any[];
}

export interface CreateAdmissionDto {
  medicalRecordId: string;
  admissionDate?: string;
  admissionType: string;
  reason: string;
}

export interface UpdateAdmissionDto {
  admissionDate?: string;
  admissionType?: string;
  reason?: string;
}

export interface CloseAdmissionDto {
  closureNotes?: string;
}

export const admissionsService = {
  // Crear nueva admisión
  create: async (data: CreateAdmissionDto): Promise<Admission> => {
    const response = await api.post('/admissions', data);
    return response.data;
  },

  // Obtener todas las admisiones de una HC
  getByMedicalRecord: async (medicalRecordId: string): Promise<Admission[]> => {
    const response = await api.get(`/admissions/medical-record/${medicalRecordId}`);
    return response.data;
  },

  // Obtener una admisión específica
  getOne: async (id: string): Promise<Admission> => {
    const response = await api.get(`/admissions/${id}`);
    return response.data;
  },

  // Actualizar admisión
  update: async (id: string, data: UpdateAdmissionDto): Promise<Admission> => {
    const response = await api.put(`/admissions/${id}`, data);
    return response.data;
  },

  // Cerrar admisión
  close: async (id: string, data: CloseAdmissionDto): Promise<Admission> => {
    const response = await api.patch(`/admissions/${id}/close`, data);
    return response.data;
  },

  // Reabrir admisión
  reopen: async (id: string): Promise<Admission> => {
    const response = await api.patch(`/admissions/${id}/reopen`);
    return response.data;
  },

  // Cancelar admisión
  cancel: async (id: string, reason: string): Promise<Admission> => {
    const response = await api.patch(`/admissions/${id}/cancel`, { reason });
    return response.data;
  },

  // Obtener admisión activa de una HC
  getActive: async (medicalRecordId: string): Promise<Admission | null> => {
    try {
      const response = await api.get(`/admissions/medical-record/${medicalRecordId}/active`);
      return response.data.id ? response.data : null;
    } catch (error) {
      return null;
    }
  },
};
