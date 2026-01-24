export enum ClientDocumentType {
  CC = 'CC', // Cédula de Ciudadanía
  TI = 'TI', // Tarjeta de Identidad
  CE = 'CE', // Cédula de Extranjería
  PA = 'PA', // Pasaporte
  RC = 'RC', // Registro Civil
  NIT = 'NIT', // NIT
}

export interface Client {
  id: string;
  fullName: string;
  documentType: ClientDocumentType;
  documentNumber: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  consentsCount: number;
  lastConsentAt?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  fullName: string;
  documentType: ClientDocumentType;
  documentNumber: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

export interface UpdateClientDto {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

export interface SearchClientDto {
  search?: string;
  documentNumber?: string;
  documentType?: ClientDocumentType;
  email?: string;
  phone?: string;
  fullName?: string;
}

export const DOCUMENT_TYPE_LABELS: Record<ClientDocumentType, string> = {
  [ClientDocumentType.CC]: 'Cédula de Ciudadanía',
  [ClientDocumentType.TI]: 'Tarjeta de Identidad',
  [ClientDocumentType.CE]: 'Cédula de Extranjería',
  [ClientDocumentType.PA]: 'Pasaporte',
  [ClientDocumentType.RC]: 'Registro Civil',
  [ClientDocumentType.NIT]: 'NIT',
};
