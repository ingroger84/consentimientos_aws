-- Crear tablas de historias clínicas
-- Versión limpia sin DROP statements

-- Tabla principal: medical_records
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL,
  branch_id UUID,
  record_number VARCHAR(50) UNIQUE NOT NULL,
  admission_date TIMESTAMP NOT NULL,
  admission_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  is_locked BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  closed_by UUID,
  CONSTRAINT fk_medical_record_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_medical_record_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_medical_record_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_medical_record_creator FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_medical_record_closer FOREIGN KEY (closed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_medical_records_tenant ON medical_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_client ON medical_records(client_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_number ON medical_records(record_number);
CREATE INDEX IF NOT EXISTS idx_medical_records_admission_date ON medical_records(admission_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status);

-- Tabla: anamnesis
CREATE TABLE IF NOT EXISTS anamnesis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  chief_complaint TEXT,
  current_illness TEXT,
  personal_history TEXT,
  family_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_anamnesis_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_anamnesis_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_anamnesis_medical_record ON anamnesis(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_tenant ON anamnesis(tenant_id);

-- Tabla: physical_exams
CREATE TABLE IF NOT EXISTS physical_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  vital_signs JSONB,
  general_appearance TEXT,
  systems_review JSONB,
  findings TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_physical_exam_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_physical_exam_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_physical_exams_medical_record ON physical_exams(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_physical_exams_tenant ON physical_exams(tenant_id);

-- Tabla: diagnoses
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  diagnosis_type VARCHAR(20) NOT NULL,
  code VARCHAR(20),
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_diagnosis_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_diagnosis_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_medical_record ON diagnoses(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_tenant ON diagnoses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_type ON diagnoses(diagnosis_type);

-- Tabla: evolutions
CREATE TABLE IF NOT EXISTS evolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  evolution_date TIMESTAMP NOT NULL,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_evolution_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_evolution_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_evolution_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_evolutions_medical_record ON evolutions(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_evolutions_tenant ON evolutions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evolutions_date ON evolutions(evolution_date DESC);

-- Tabla: medical_record_audit
CREATE TABLE IF NOT EXISTS medical_record_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB,
  performed_by UUID NOT NULL,
  performed_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_audit_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_user FOREIGN KEY (performed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_medical_record ON medical_record_audit(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON medical_record_audit(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON medical_record_audit(performed_at DESC);

-- Agregar columnas a clients si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='blood_type') THEN
        ALTER TABLE clients ADD COLUMN blood_type VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='occupation') THEN
        ALTER TABLE clients ADD COLUMN occupation VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='marital_status') THEN
        ALTER TABLE clients ADD COLUMN marital_status VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='emergency_contact_name') THEN
        ALTER TABLE clients ADD COLUMN emergency_contact_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='emergency_contact_phone') THEN
        ALTER TABLE clients ADD COLUMN emergency_contact_phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='emergency_contact_relationship') THEN
        ALTER TABLE clients ADD COLUMN emergency_contact_relationship VARCHAR(50);
    END IF;
END $$;

-- Verificar tablas creadas
SELECT 'Tablas de historias clínicas creadas:' as mensaje;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%medical%' OR table_name LIKE '%anamn%' OR table_name LIKE '%diagn%' OR table_name LIKE '%evol%')
ORDER BY table_name;
