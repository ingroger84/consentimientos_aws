-- Migración: Cumplimiento Normativo HC - Tablas Completas
-- Fecha: 2026-02-06
-- Versión: 24.0.0
-- Descripción: Crea todas las tablas necesarias para cumplimiento 100% normativa colombiana

-- ============================================================================
-- 1. TABLA: medical_orders (Órdenes Médicas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS medical_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_type VARCHAR(50) NOT NULL CHECK (order_type IN ('laboratory', 'imaging', 'procedure', 'other')),
  order_code VARCHAR(50),
  description TEXT NOT NULL,
  indication TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'stat')),
  results TEXT,
  results_document_url TEXT,
  notes TEXT,
  ordered_by UUID NOT NULL REFERENCES users(id),
  ordered_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  completed_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_medical_orders_medical_record ON medical_orders(medical_record_id);
CREATE INDEX idx_medical_orders_tenant ON medical_orders(tenant_id);
CREATE INDEX idx_medical_orders_status ON medical_orders(status);
CREATE INDEX idx_medical_orders_ordered_at ON medical_orders(ordered_at DESC);

COMMENT ON TABLE medical_orders IS 'Órdenes médicas (laboratorio, imágenes, procedimientos)';

-- ============================================================================
-- 2. TABLA: prescriptions (Prescripciones/Fórmulas Médicas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  active_ingredient VARCHAR(255),
  presentation VARCHAR(100),
  dose VARCHAR(100) NOT NULL,
  route VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  indications TEXT NOT NULL,
  special_instructions TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended', 'cancelled')),
  prescribed_by UUID NOT NULL REFERENCES users(id),
  prescribed_at TIMESTAMP DEFAULT NOW(),
  suspended_at TIMESTAMP,
  suspended_by UUID REFERENCES users(id),
  suspension_reason TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_medical_record ON prescriptions(medical_record_id);
CREATE INDEX idx_prescriptions_tenant ON prescriptions(tenant_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_prescribed_at ON prescriptions(prescribed_at DESC);

COMMENT ON TABLE prescriptions IS 'Prescripciones y fórmulas médicas';

-- ============================================================================
-- 3. TABLA: procedures (Procedimientos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  procedure_code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  procedure_type VARCHAR(100),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_at TIMESTAMP,
  performed_at TIMESTAMP,
  findings TEXT,
  complications TEXT,
  post_procedure_recommendations TEXT,
  consent_id UUID,
  scheduled_by UUID NOT NULL REFERENCES users(id),
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_procedures_medical_record ON procedures(medical_record_id);
CREATE INDEX idx_procedures_tenant ON procedures(tenant_id);
CREATE INDEX idx_procedures_status ON procedures(status);
CREATE INDEX idx_procedures_scheduled_at ON procedures(scheduled_at);

COMMENT ON TABLE procedures IS 'Procedimientos programados y realizados';

-- ============================================================================
-- 4. TABLA: treatment_plans (Planes de Tratamiento)
-- ============================================================================
CREATE TABLE IF NOT EXISTS treatment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  evolution_id UUID REFERENCES evolutions(id),
  objective TEXT,
  pharmacological_treatment JSONB,
  non_pharmacological_treatment TEXT,
  patient_education TEXT,
  follow_up_criteria TEXT,
  next_appointment TIMESTAMP,
  recommendations TEXT,
  restrictions TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'modified', 'cancelled')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_treatment_plans_medical_record ON treatment_plans(medical_record_id);
CREATE INDEX idx_treatment_plans_tenant ON treatment_plans(tenant_id);
CREATE INDEX idx_treatment_plans_status ON treatment_plans(status);
CREATE INDEX idx_treatment_plans_created_at ON treatment_plans(created_at DESC);

COMMENT ON TABLE treatment_plans IS 'Planes de tratamiento estructurados';

-- ============================================================================
-- 5. TABLA: epicrisis (Epicrisis - Resumen al Egreso)
-- ============================================================================
CREATE TABLE IF NOT EXISTS epicrisis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  admission_date TIMESTAMP NOT NULL,
  discharge_date TIMESTAMP NOT NULL,
  admission_reason TEXT NOT NULL,
  clinical_summary TEXT NOT NULL,
  admission_diagnosis TEXT NOT NULL,
  discharge_diagnosis TEXT NOT NULL,
  treatment_provided TEXT NOT NULL,
  procedures_performed TEXT,
  discharge_condition TEXT NOT NULL,
  discharge_type VARCHAR(50) NOT NULL CHECK (discharge_type IN ('home', 'transfer', 'death', 'voluntary', 'other')),
  discharge_recommendations TEXT NOT NULL,
  discharge_medications TEXT,
  follow_up_instructions TEXT,
  warning_signs TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_epicrisis_per_medical_record UNIQUE (medical_record_id)
);

CREATE INDEX idx_epicrisis_medical_record ON epicrisis(medical_record_id);
CREATE INDEX idx_epicrisis_tenant ON epicrisis(tenant_id);
CREATE INDEX idx_epicrisis_discharge_date ON epicrisis(discharge_date DESC);

COMMENT ON TABLE epicrisis IS 'Epicrisis - Resumen de atención al egreso';

-- ============================================================================
-- 6. TABLA: medical_record_documents (Documentos de HC)
-- ============================================================================
CREATE TABLE IF NOT EXISTS medical_record_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('lab_result', 'imaging', 'epicrisis', 'consent', 'prescription', 'other')),
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  description TEXT,
  related_entity_type VARCHAR(100),
  related_entity_id UUID,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mr_documents_medical_record ON medical_record_documents(medical_record_id);
CREATE INDEX idx_mr_documents_tenant ON medical_record_documents(tenant_id);
CREATE INDEX idx_mr_documents_type ON medical_record_documents(document_type);
CREATE INDEX idx_mr_documents_uploaded_at ON medical_record_documents(uploaded_at DESC);

COMMENT ON TABLE medical_record_documents IS 'Documentos adjuntos a historias clínicas';

-- ============================================================================
-- 7. ACTUALIZAR TABLA: clients (Agregar foto de paciente)
-- ============================================================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS photo_captured_at TIMESTAMP;

COMMENT ON COLUMN clients.photo_url IS 'URL de la foto del paciente para validación de identidad';
COMMENT ON COLUMN clients.photo_captured_at IS 'Fecha de captura de la foto';

-- ============================================================================
-- 8. TRIGGERS PARA updated_at
-- ============================================================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cada tabla
CREATE TRIGGER update_medical_orders_updated_at
  BEFORE UPDATE ON medical_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procedures_updated_at
  BEFORE UPDATE ON procedures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_plans_updated_at
  BEFORE UPDATE ON treatment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_epicrisis_updated_at
  BEFORE UPDATE ON epicrisis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. PERMISOS (Opcional - si usas RLS)
-- ============================================================================

-- Habilitar RLS si es necesario
-- ALTER TABLE medical_orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE epicrisis ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE medical_record_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 10. VERIFICACIÓN
-- ============================================================================

-- Verificar que todas las tablas fueron creadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'medical_orders',
    'prescriptions',
    'procedures',
    'treatment_plans',
    'epicrisis',
    'medical_record_documents'
  )
ORDER BY table_name;

-- Verificar índices creados
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'medical_orders',
    'prescriptions',
    'procedures',
    'treatment_plans',
    'epicrisis',
    'medical_record_documents'
  )
ORDER BY tablename, indexname;

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================

-- Registrar migración
INSERT INTO migrations (name, executed_at) 
VALUES ('create-medical-records-complete-tables', NOW())
ON CONFLICT DO NOTHING;

COMMIT;
