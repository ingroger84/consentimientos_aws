-- ============================================================================
-- MIGRACIÓN: Sistema de Admisiones para Historias Clínicas
-- Fecha: 2026-02-18
-- Versión: 39.0.0
-- Descripción: Implementa sistema de admisiones múltiples para un mismo paciente
-- ============================================================================

-- CONTEXTO:
-- Actualmente, una HC tiene un solo admission_type y admission_date.
-- Con este cambio, una HC puede tener múltiples admisiones (consultas/visitas),
-- y cada admisión agrupa: anamnesis, exámenes, diagnósticos, evoluciones y consentimientos.

BEGIN;

-- ============================================================================
-- 1. CREAR TABLA: admissions
-- ============================================================================
CREATE TABLE IF NOT EXISTS admissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relación con HC
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Datos de la admisión
  admission_number VARCHAR(50) NOT NULL, -- HC-2026-000001-ADM-001
  admission_date TIMESTAMP NOT NULL DEFAULT NOW(),
  admission_type VARCHAR(50) NOT NULL CHECK (admission_type IN (
    'primera_vez',           -- Primera consulta del paciente
    'control',               -- Consulta de control/seguimiento
    'urgencia',              -- Atención de urgencia
    'hospitalizacion',       -- Hospitalización
    'cirugia',               -- Procedimiento quirúrgico
    'procedimiento',         -- Procedimiento ambulatorio
    'telemedicina',          -- Consulta virtual
    'domiciliaria',          -- Atención domiciliaria
    'interconsulta',         -- Interconsulta con especialista
    'otro'                   -- Otro tipo de admisión
  )),
  
  -- Motivo de la admisión
  reason TEXT NOT NULL,
  
  -- Estado de la admisión
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
  is_locked BOOLEAN DEFAULT false,
  
  -- Cierre de admisión
  closed_at TIMESTAMP,
  closed_by UUID REFERENCES users(id),
  closure_notes TEXT,
  
  -- Auditoría
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_admission_number UNIQUE (admission_number)
);

-- Índices
CREATE INDEX idx_admissions_medical_record ON admissions(medical_record_id);
CREATE INDEX idx_admissions_tenant ON admissions(tenant_id);
CREATE INDEX idx_admissions_admission_date ON admissions(admission_date DESC);
CREATE INDEX idx_admissions_status ON admissions(status);
CREATE INDEX idx_admissions_type ON admissions(admission_type);

COMMENT ON TABLE admissions IS 'Admisiones/Consultas de una Historia Clínica';
COMMENT ON COLUMN admissions.admission_type IS 'Tipo de admisión: primera_vez, control, urgencia, hospitalizacion, cirugia, procedimiento, telemedicina, domiciliaria, interconsulta, otro';
COMMENT ON COLUMN admissions.reason IS 'Motivo de la admisión/consulta';

-- ============================================================================
-- 2. AGREGAR COLUMNA admission_id A TABLAS RELACIONADAS
-- ============================================================================

-- 2.1. Anamnesis
ALTER TABLE anamnesis 
  ADD COLUMN IF NOT EXISTS admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_anamnesis_admission ON anamnesis(admission_id);

-- 2.2. Physical Exams
ALTER TABLE physical_exams 
  ADD COLUMN IF NOT EXISTS admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_physical_exams_admission ON physical_exams(admission_id);

-- 2.3. Diagnoses
ALTER TABLE diagnoses 
  ADD COLUMN IF NOT EXISTS admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_diagnoses_admission ON diagnoses(admission_id);

-- 2.4. Evolutions
ALTER TABLE evolutions 
  ADD COLUMN IF NOT EXISTS admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_evolutions_admission ON evolutions(admission_id);

-- 2.5. Medical Record Consents
ALTER TABLE medical_record_consents 
  ADD COLUMN IF NOT EXISTS admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_mr_consents_admission ON medical_record_consents(admission_id);

-- 2.6. Medical Orders (si existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medical_orders') THEN
    ALTER TABLE medical_orders 
      ADD COLUMN IF NOT EXISTS admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE;
    
    CREATE INDEX IF NOT EXISTS idx_medical_orders_admission ON medical_orders(admission_id);
  END IF;
END $$;

-- 2.7. Prescriptions (si existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescriptions') THEN
    ALTER TABLE prescriptions 
      ADD COLUMN IF NOT EXISTS admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE;
    
    CREATE INDEX IF NOT EXISTS idx_prescriptions_admission ON prescriptions(admission_id);
  END IF;
END $$;

-- 2.8. Procedures (si existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procedures') THEN
    ALTER TABLE procedures 
      ADD COLUMN IF NOT EXISTS admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE;
    
    CREATE INDEX IF NOT EXISTS idx_procedures_admission ON procedures(admission_id);
  END IF;
END $$;

-- ============================================================================
-- 3. MIGRAR DATOS EXISTENTES
-- ============================================================================

-- Crear una admisión inicial para cada HC existente
-- Esto convierte las HC actuales en HC con una sola admisión

INSERT INTO admissions (
  medical_record_id,
  tenant_id,
  admission_number,
  admission_date,
  admission_type,
  reason,
  status,
  is_locked,
  closed_at,
  closed_by,
  created_by,
  created_at,
  updated_at
)
SELECT 
  mr.id as medical_record_id,
  mr.tenant_id,
  mr.record_number || '-ADM-001' as admission_number,
  mr.admission_date,
  CASE 
    WHEN mr.admission_type = 'consulta' THEN 'primera_vez'
    WHEN mr.admission_type = 'control' THEN 'control'
    WHEN mr.admission_type = 'urgencia' THEN 'urgencia'
    WHEN mr.admission_type = 'hospitalizacion' THEN 'hospitalizacion'
    ELSE 'otro'
  END as admission_type,
  'Admisión inicial migrada automáticamente' as reason,
  mr.status,
  mr.is_locked,
  mr.closed_at,
  mr.closed_by,
  mr.created_by,
  mr.created_at,
  mr.updated_at
FROM medical_records mr
WHERE NOT EXISTS (
  SELECT 1 FROM admissions a WHERE a.medical_record_id = mr.id
);

-- Actualizar registros existentes para vincularlos con la admisión inicial

-- 3.1. Anamnesis
UPDATE anamnesis a
SET admission_id = (
  SELECT adm.id 
  FROM admissions adm 
  WHERE adm.medical_record_id = a.medical_record_id 
  ORDER BY adm.created_at ASC 
  LIMIT 1
)
WHERE admission_id IS NULL;

-- 3.2. Physical Exams
UPDATE physical_exams pe
SET admission_id = (
  SELECT adm.id 
  FROM admissions adm 
  WHERE adm.medical_record_id = pe.medical_record_id 
  ORDER BY adm.created_at ASC 
  LIMIT 1
)
WHERE admission_id IS NULL;

-- 3.3. Diagnoses
UPDATE diagnoses d
SET admission_id = (
  SELECT adm.id 
  FROM admissions adm 
  WHERE adm.medical_record_id = d.medical_record_id 
  ORDER BY adm.created_at ASC 
  LIMIT 1
)
WHERE admission_id IS NULL;

-- 3.4. Evolutions
UPDATE evolutions e
SET admission_id = (
  SELECT adm.id 
  FROM admissions adm 
  WHERE adm.medical_record_id = e.medical_record_id 
  ORDER BY adm.created_at ASC 
  LIMIT 1
)
WHERE admission_id IS NULL;

-- 3.5. Medical Record Consents
UPDATE medical_record_consents mrc
SET admission_id = (
  SELECT adm.id 
  FROM admissions adm 
  WHERE adm.medical_record_id = mrc.medical_record_id 
  ORDER BY adm.created_at ASC 
  LIMIT 1
)
WHERE admission_id IS NULL;

-- 3.6. Medical Orders (si existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medical_orders') THEN
    UPDATE medical_orders mo
    SET admission_id = (
      SELECT adm.id 
      FROM admissions adm 
      WHERE adm.medical_record_id = mo.medical_record_id 
      ORDER BY adm.created_at ASC 
      LIMIT 1
    )
    WHERE admission_id IS NULL;
  END IF;
END $$;

-- 3.7. Prescriptions (si existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescriptions') THEN
    UPDATE prescriptions p
    SET admission_id = (
      SELECT adm.id 
      FROM admissions adm 
      WHERE adm.medical_record_id = p.medical_record_id 
      ORDER BY adm.created_at ASC 
      LIMIT 1
    )
    WHERE admission_id IS NULL;
  END IF;
END $$;

-- 3.8. Procedures (si existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procedures') THEN
    UPDATE procedures pr
    SET admission_id = (
      SELECT adm.id 
      FROM admissions adm 
      WHERE adm.medical_record_id = pr.medical_record_id 
      ORDER BY adm.created_at ASC 
      LIMIT 1
    )
    WHERE admission_id IS NULL;
  END IF;
END $$;

-- ============================================================================
-- 4. HACER admission_id OBLIGATORIO (NOT NULL)
-- ============================================================================

-- Después de migrar los datos, hacer la columna obligatoria
ALTER TABLE anamnesis ALTER COLUMN admission_id SET NOT NULL;
ALTER TABLE physical_exams ALTER COLUMN admission_id SET NOT NULL;
ALTER TABLE diagnoses ALTER COLUMN admission_id SET NOT NULL;
ALTER TABLE evolutions ALTER COLUMN admission_id SET NOT NULL;
ALTER TABLE medical_record_consents ALTER COLUMN admission_id SET NOT NULL;

-- Para tablas opcionales
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medical_orders') THEN
    ALTER TABLE medical_orders ALTER COLUMN admission_id SET NOT NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescriptions') THEN
    ALTER TABLE prescriptions ALTER COLUMN admission_id SET NOT NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procedures') THEN
    ALTER TABLE procedures ALTER COLUMN admission_id SET NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- 5. TRIGGER PARA updated_at
-- ============================================================================

CREATE TRIGGER update_admissions_updated_at
  BEFORE UPDATE ON admissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. FUNCIÓN PARA GENERAR NÚMERO DE ADMISIÓN
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_admission_number(p_medical_record_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  v_record_number VARCHAR(50);
  v_admission_count INTEGER;
  v_admission_number VARCHAR(50);
BEGIN
  -- Obtener el número de HC
  SELECT record_number INTO v_record_number
  FROM medical_records
  WHERE id = p_medical_record_id;
  
  -- Contar admisiones existentes para esta HC
  SELECT COUNT(*) INTO v_admission_count
  FROM admissions
  WHERE medical_record_id = p_medical_record_id;
  
  -- Generar número de admisión
  v_admission_number := v_record_number || '-ADM-' || LPAD((v_admission_count + 1)::TEXT, 3, '0');
  
  RETURN v_admission_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_admission_number IS 'Genera número único de admisión basado en el número de HC';

-- ============================================================================
-- 7. VERIFICACIÓN
-- ============================================================================

-- Verificar que la tabla fue creada
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'admissions') as column_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'admissions';

-- Verificar que las columnas fueron agregadas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'admission_id'
  AND table_name IN (
    'anamnesis',
    'physical_exams',
    'diagnoses',
    'evolutions',
    'medical_record_consents',
    'medical_orders',
    'prescriptions',
    'procedures'
  )
ORDER BY table_name;

-- Verificar migración de datos
SELECT 
  mr.record_number,
  mr.tenant_id,
  COUNT(a.id) as admissions_count
FROM medical_records mr
LEFT JOIN admissions a ON a.medical_record_id = mr.id
GROUP BY mr.id, mr.record_number, mr.tenant_id
ORDER BY mr.created_at DESC
LIMIT 10;

-- ============================================================================
-- 8. REGISTRAR MIGRACIÓN (OPCIONAL)
-- ============================================================================

-- Descomentar si existe tabla migrations con estructura adecuada
-- INSERT INTO migrations (name, executed_at) 
-- VALUES ('add-admissions-system', NOW())
-- ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================

