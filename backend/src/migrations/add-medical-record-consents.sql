-- Migration: Add Medical Record Consents Integration
-- Date: 2026-01-25
-- Description: Crear tabla para vincular historias clínicas con consentimientos

-- Tabla de relación HC-Consentimiento
CREATE TABLE IF NOT EXISTS medical_record_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones
  medical_record_id UUID NOT NULL,
  consent_id UUID NOT NULL,
  evolution_id UUID,
  
  -- Contexto clínico
  created_during_consultation BOOLEAN DEFAULT TRUE,
  required_for_procedure BOOLEAN DEFAULT FALSE,
  procedure_name VARCHAR(255),
  diagnosis_code VARCHAR(10),
  diagnosis_description TEXT,
  
  -- Metadata
  notes TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  
  -- Foreign keys
  CONSTRAINT fk_mr_consent_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_mr_consent_consent FOREIGN KEY (consent_id) REFERENCES consents(id) ON DELETE CASCADE,
  CONSTRAINT fk_mr_consent_evolution FOREIGN KEY (evolution_id) REFERENCES evolutions(id) ON DELETE SET NULL,
  CONSTRAINT fk_mr_consent_creator FOREIGN KEY (created_by) REFERENCES users(id),
  
  -- Constraint único
  CONSTRAINT unique_medical_record_consent UNIQUE(medical_record_id, consent_id)
);

-- Índices para optimización
CREATE INDEX idx_mr_consents_medical_record ON medical_record_consents(medical_record_id);
CREATE INDEX idx_mr_consents_consent ON medical_record_consents(consent_id);
CREATE INDEX idx_mr_consents_evolution ON medical_record_consents(evolution_id);
CREATE INDEX idx_mr_consents_created_at ON medical_record_consents(created_at DESC);

-- Comentarios
COMMENT ON TABLE medical_record_consents IS 'Relación entre historias clínicas y consentimientos informados';
COMMENT ON COLUMN medical_record_consents.created_during_consultation IS 'Indica si el consentimiento fue creado durante la consulta';
COMMENT ON COLUMN medical_record_consents.required_for_procedure IS 'Indica si el consentimiento es requerido para realizar un procedimiento';
COMMENT ON COLUMN medical_record_consents.procedure_name IS 'Nombre del procedimiento para el cual se requiere el consentimiento';
COMMENT ON COLUMN medical_record_consents.diagnosis_code IS 'Código CIE-10 del diagnóstico relacionado';
