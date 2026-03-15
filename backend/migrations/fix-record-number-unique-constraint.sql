-- ============================================================================
-- CORRECCIÓN: Constraint único de record_number debe ser por tenant
-- Versión: 41.1.4
-- Fecha: 2026-03-15
-- Problema: El constraint único es global, causando errores al crear HC
-- Solución: Cambiar a constraint único compuesto (tenant_id, record_number)
-- ============================================================================

BEGIN;

-- 1. Eliminar el constraint único global actual
ALTER TABLE medical_records 
DROP CONSTRAINT IF EXISTS medical_records_record_number_key;

-- 2. Eliminar constraint antiguo si existe (por si acaso)
ALTER TABLE medical_records 
DROP CONSTRAINT IF EXISTS UQ_1dc1a9b704ff46bcaf4bf512039;

-- 3. Crear nuevo constraint único compuesto (tenant_id, record_number)
-- Esto permite que diferentes tenants tengan el mismo número de HC
ALTER TABLE medical_records 
ADD CONSTRAINT uq_medical_records_tenant_record_number 
UNIQUE (tenant_id, record_number);

-- 4. Verificar que el constraint fue creado correctamente
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'uq_medical_records_tenant_record_number'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        RAISE NOTICE '✅ Constraint único por tenant creado correctamente';
    ELSE
        RAISE WARNING '⚠️ No se pudo crear el constraint';
    END IF;
END $$;

-- 5. Mostrar información del nuevo constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'uq_medical_records_tenant_record_number';

COMMIT;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Constraint global eliminado
-- - Nuevo constraint único por (tenant_id, record_number)
-- - Cada tenant puede tener su propia secuencia de números
-- - HC-2026-000001 puede existir en múltiples tenants
-- ============================================================================
