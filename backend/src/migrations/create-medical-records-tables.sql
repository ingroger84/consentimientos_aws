-- Migration: Create Medical Records Tables
-- Date: 2026-01-24
-- Description: Crear tablas para el módulo de historias clínicas

-- Tabla principal: medical_records
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL,
  branch_id UUID,
  
  -- Datos básicos
  record_number VARCHAR(50) UNIQUE NOT NULL,
  admission_date TIMESTAMP NOT NULL,
  admission_type VARCHAR(50) NOT NULL,
  
  -- Estado
  status VARCHAR(20) DEFAULT 'active',
  is_locked BOOLEAN DEFAULT false,
  
  -- Auditoría
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  closed_by UUID,
  
  -- Foreign keys
  CONSTRAINT fk_medical_record_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_medical_record_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_medical_record_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_medical_record_creator FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_medical_record_closer FOREIGN KEY (closed_by) REFERENCES users(id)
);

-- Índices para optimización
CREATE INDEX idx_medical_records_tenant ON medical_records(tenant_id);
CREATE INDEX idx_medical_records_client ON medical_records(client_id);
CREATE INDEX idx_medical_records_number ON medical_records(record_number);
CREATE INDEX idx_medical_records_admission_date ON medical_records(admission_date DESC);
CREATE INDEX idx_medical_records_status ON medical_records(status);

-- Tabla: anamnesis
CREATE TABLE IF NOT EXISTS anamnesis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  
  -- Motivo de consulta
  chief_complaint TEXT NOT NULL,
  current_illness TEXT,
  
  -- Antecedentes (JSONB para flexibilidad)
  personal_history JSONB DEFAULT '{}',
  family_history JSONB DEFAULT '{}',
  habits JSONB DEFAULT '{}',
  gynecological_history JSONB,
  systems_review JSONB DEFAULT '{}',
  
  -- Auditoría
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_anamnesis_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_anamnesis_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_anamnesis_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_anamnesis_medical_record ON anamnesis(medical_record_id);
CREATE INDEX idx_anamnesis_tenant ON anamnesis(tenant_id);


-- Tabla: physical_exams
CREATE TABLE IF NOT EXISTS physical_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  
  -- Signos vitales
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  temperature DECIMAL(4,1),
  oxygen_saturation INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(5,2),
  
  -- Examen físico por sistemas (JSONB para flexibilidad)
  general_appearance TEXT,
  physical_exam_data JSONB DEFAULT '{}',
  other_findings TEXT,
  
  -- Auditoría
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_physical_exam_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_physical_exam_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_physical_exam_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_physical_exams_medical_record ON physical_exams(medical_record_id);
CREATE INDEX idx_physical_exams_tenant ON physical_exams(tenant_id);
CREATE INDEX idx_physical_exams_date ON physical_exams(created_at DESC);

-- Tabla: diagnoses
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  
  -- Diagnóstico
  cie10_code VARCHAR(10) NOT NULL,
  cie10_description TEXT NOT NULL,
  diagnosis_type VARCHAR(20) NOT NULL DEFAULT 'principal',
  
  -- Clasificación
  is_confirmed BOOLEAN DEFAULT false,
  is_presumptive BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_diagnosis_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_diagnosis_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_diagnosis_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_diagnoses_medical_record ON diagnoses(medical_record_id);
CREATE INDEX idx_diagnoses_tenant ON diagnoses(tenant_id);
CREATE INDEX idx_diagnoses_cie10 ON diagnoses(cie10_code);

-- Tabla: evolutions
CREATE TABLE IF NOT EXISTS evolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  
  -- Contenido SOAP
  evolution_date TIMESTAMP NOT NULL,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  
  -- Tipo de nota
  note_type VARCHAR(50) DEFAULT 'evolution',
  
  -- Firma digital
  signed_by UUID,
  signed_at TIMESTAMP,
  signature_hash TEXT,
  
  -- Auditoría
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_evolution_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_evolution_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_evolution_creator FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_evolution_signer FOREIGN KEY (signed_by) REFERENCES users(id)
);

CREATE INDEX idx_evolutions_medical_record ON evolutions(medical_record_id);
CREATE INDEX idx_evolutions_tenant ON evolutions(tenant_id);
CREATE INDEX idx_evolutions_date ON evolutions(evolution_date DESC);

-- Tabla: medical_record_audit
CREATE TABLE IF NOT EXISTS medical_record_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID,
  tenant_id UUID NOT NULL,
  
  -- Acción
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  
  -- Cambios
  old_values JSONB,
  new_values JSONB,
  
  -- Usuario
  user_id UUID NOT NULL,
  user_name VARCHAR(255),
  user_role VARCHAR(100),
  
  -- Contexto
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_audit_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_medical_record ON medical_record_audit(medical_record_id);
CREATE INDEX idx_audit_tenant ON medical_record_audit(tenant_id);
CREATE INDEX idx_audit_user ON medical_record_audit(user_id);
CREATE INDEX idx_audit_date ON medical_record_audit(created_at DESC);
CREATE INDEX idx_audit_action ON medical_record_audit(action);

-- Agregar campos médicos a la tabla clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS blood_type VARCHAR(10);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS eps VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS eps_code VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS occupation VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50);

-- Agregar campos profesionales a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_license VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS sub_specialty VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- Comentarios para documentación
COMMENT ON TABLE medical_records IS 'Historia clínica principal por paciente';
COMMENT ON TABLE anamnesis IS 'Anamnesis y antecedentes del paciente';
COMMENT ON TABLE physical_exams IS 'Exámenes físicos y signos vitales';
COMMENT ON TABLE diagnoses IS 'Diagnósticos médicos con código CIE-10';
COMMENT ON TABLE evolutions IS 'Evoluciones médicas en formato SOAP';
COMMENT ON TABLE medical_record_audit IS 'Auditoría completa de accesos y cambios';
