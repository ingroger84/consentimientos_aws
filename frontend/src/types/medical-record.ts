export interface MedicalRecord {
  id: string;
  tenantId: string;
  clientId: string;
  branchId?: string;
  recordNumber: string;
  admissionDate: string;
  admissionType: 'consulta' | 'urgencia' | 'hospitalizacion' | 'control';
  status: 'active' | 'closed' | 'archived';
  isLocked: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  closedBy?: string;
  
  // Relaciones
  client?: {
    id: string;
    name?: string; // Alias para fullName
    fullName?: string; // Campo real en backend
    documentType: string;
    documentNumber: string;
    email?: string;
    phone?: string;
    bloodType?: string;
    eps?: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    name: string;
  };
  anamnesis?: Anamnesis[];
  physicalExams?: PhysicalExam[];
  diagnoses?: Diagnosis[];
  evolutions?: Evolution[];
  consents?: MedicalRecordConsent[];
}

export interface MedicalRecordConsent {
  id: string;
  medicalRecordId: string;
  consentId: string;
  evolutionId?: string;
  createdDuringConsultation: boolean;
  requiredForProcedure: boolean;
  procedureName?: string;
  diagnosisCode?: string;
  diagnosisDescription?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  consent?: {
    id: string;
    consentNumber: string;
    status: string;
    pdfUrl?: string;
  };
  creator?: {
    id: string;
    name: string;
  };
}

export interface Anamnesis {
  id: string;
  medicalRecordId: string;
  tenantId: string;
  chiefComplaint: string;
  currentIllness?: string;
  personalHistory?: Record<string, any>;
  familyHistory?: Record<string, any>;
  habits?: Record<string, any>;
  gynecologicalHistory?: Record<string, any>;
  systemsReview?: Record<string, any>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
  };
}

export interface PhysicalExam {
  id: string;
  medicalRecordId: string;
  tenantId: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  generalAppearance?: string;
  physicalExamData?: Record<string, any>;
  otherFindings?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
  };
}

export interface Diagnosis {
  id: string;
  medicalRecordId: string;
  tenantId: string;
  cie10Code: string;
  cie10Description: string;
  diagnosisType: 'principal' | 'relacionado' | 'complicacion';
  isConfirmed: boolean;
  isPresumptive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
  };
}

export interface Evolution {
  id: string;
  medicalRecordId: string;
  tenantId: string;
  evolutionDate: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  noteType: 'evolution' | 'interconsulta' | 'epicrisis';
  signedBy?: string;
  signedAt?: string;
  signatureHash?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
  };
  signer?: {
    id: string;
    name: string;
  };
}

export interface CreateMedicalRecordDto {
  clientId: string;
  branchId?: string;
  admissionDate: string;
  admissionType: 'consulta' | 'urgencia' | 'hospitalizacion' | 'control';
}

export interface CreateAnamnesisDto {
  chiefComplaint: string;
  currentIllness?: string;
  personalHistory?: Record<string, any>;
  familyHistory?: Record<string, any>;
  habits?: Record<string, any>;
  gynecologicalHistory?: Record<string, any>;
  systemsReview?: Record<string, any>;
}

export interface CreatePhysicalExamDto {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  generalAppearance?: string;
  physicalExamData?: Record<string, any>;
  otherFindings?: string;
}
