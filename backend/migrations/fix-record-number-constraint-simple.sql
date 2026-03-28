-- ============================================================================
-- CORRECCION DEFINITIVA: Constraint unico de record_number por tenant
-- Version: 41.1.5
-- Fecha: 2026-03-15
-- ============================================================================

BEGIN;

-- 1. Eliminar constraint global si existe
ALTER TABLE medical_records DROP CONSTRAINT IF EXISTS medical_records_record_number_key;

-- 2. Eliminar constraint antiguo de TypeORM si existe
ALTER TABLE medical_records DROP CONSTRAINT IF EXISTS UQ_1dc1a9b704ff46bcaf4bf512039;

-- 3. Eliminar constraint anterior si existe
ALTER TABLE medical_records DROP CONSTRAINT IF EXISTS uq_medical_records_tenant_record_number;

-- 4. Crear nuevo constraint unico compuesto (tenant_id, record_number)
ALTER TABLE medical_records 
ADD CONSTRAINT uq_medical_records_tenant_record_number 
UNIQUE (tenant_id, record_number);

-- 5. Verificar constraints actuales
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'medical_records'::regclass
  AND contype = 'u'
ORDER BY conname;

COMMIT;

-- ============================================================================
-- RESULTADO ESPERADO:
-- Solo debe existir: uq_medical_records_tenant_record_number UNIQUE (tenant_id, record_number)
-- ============================================================================
