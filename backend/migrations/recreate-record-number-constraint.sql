-- Recrear constraint único de record_number por tenant
-- Fecha: 2026-03-15
-- Propósito: El constraint fue eliminado accidentalmente

-- Verificar si existe
DO $$
BEGIN
    -- Eliminar constraint antiguo si existe
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_medical_records_tenant_record_number'
    ) THEN
        ALTER TABLE medical_records DROP CONSTRAINT uq_medical_records_tenant_record_number;
        RAISE NOTICE 'Constraint antiguo eliminado';
    END IF;
END $$;

-- Crear constraint único por tenant
ALTER TABLE medical_records 
ADD CONSTRAINT uq_medical_records_tenant_record_number 
UNIQUE (tenant_id, record_number);

-- Verificar
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'medical_records'::regclass
  AND conname = 'uq_medical_records_tenant_record_number';
