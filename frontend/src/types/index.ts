export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: Role;
  branches: Branch[];
  tenant?: {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
}

export interface Role {
  id: string;
  name: string;
  type: 'super_admin' | 'ADMIN_GENERAL' | 'ADMIN_SEDE' | 'OPERADOR';
  description?: string;
  permissions?: string[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  pdfTemplateUrl?: string;
  isActive: boolean;
  questions?: Question[];
  tenant?: {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
}

export interface Question {
  id: string;
  questionText: string;
  type: 'YES_NO' | 'TEXT';
  isRequired: boolean;
  isCritical: boolean;
  order: number;
  service?: Service;
}

export interface Answer {
  id: string;
  value: string;
  question: Question;
}

export interface Consent {
  id: string;
  clientName: string;
  clientId: string;
  clientEmail: string;
  clientPhone?: string;
  signatureData?: string;
  signedAt?: string;
  pdfUrl?: string;
  pdfDataTreatmentUrl?: string;
  pdfImageRightsUrl?: string;
  status: 'DRAFT' | 'SIGNED' | 'SENT' | 'FAILED';
  emailSentAt?: string;
  service: Service;
  branch: Branch;
  answers: Answer[];
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
