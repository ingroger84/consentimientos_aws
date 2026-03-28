-- ============================================================================
-- CORRECCIÓN DEFINITIVA: Constraint único de record_number por tenant
-- Versión: 41.1.5
-- Fecha: 2026-03-15
-- Problema: TypeORM recrea el constraint global por el decorador unique: true
-- Solución: Eliminar TODOS los constraints antiguos y crear el correcto
-- ============================================================================

BEGIN;

-- 1. Eliminar TODOS los constraints únicos relacionados con record_number
DO $
DECLARE
    constraint_record RECORD;
BEGIN
    -- Buscar todos los constraints únicos que involucren record_number
    FOR constraint_record IN 
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'medical_records'::regclass
          AND contype = 'u'
          AND pg_get_constraintdef(oid) LIKE '%record_number%'
    LOOP
        EXECUTE format('ALTER TABLE medical_records DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
        RAISE NOTICE 'Eliminado constraint: %', constraint_record.conname;
    END LOOP;
END $;

-- 2. Eliminar constraints específicos por nombre (por si acaso)
ALTER TABLE medical_records DROP CONSTRAINT IF EXISTS medical_records_record_number_key;
ALTER TABLE medical_records DROP CONSTRAINT IF EXISTS UQ_1dc1a9b704ff46bcaf4bf512039;
ALTER TABLE medical_records DROP CONSTRAINT IF EXISTS uq_medical_records_tenant_record_number;

-- 3. Crear el nuevo constraint único compuesto (tenant_id, record_number)
ALTER TABLE medical_records 
ADD CONSTRAINT uq_medical_records_tenant_record_number 
UNIQUE (tenant_id, record_number);

-- 4. Verificar que el constraint fue creado correctamente
DO $
DECLARE
    constraint_exists BOOLEAN;
    constraint_def TEXT;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'uq_medical_records_tenant_record_number'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        SELECT pg_get_constraintdef(oid) INTO constraint_def
        FROM pg_constraint
        WHERE conname = 'uq_medical_records_tenant_record_number';
        
        RAISE NOTICE '✅ Constraint único por tenant creado correctamente';
        RAISE NOTICE 'Definición: %', constraint_def;
    ELSE
        RAISE EXCEPTION '❌ No se pudo crear el constraint';
    END IF;
END $;

-- 5. Mostrar todos los constraints únicos actuales en medical_records
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
-- - Todos los constraints antiguos eliminados
-- - Solo existe: uq_medical_records_tenant_record_number UNIQUE (tenant_id, record_number)
-- - Cada tenant puede tener su propia secuencia de números
-- - HC-2026-000001 puede existir en múltiples tenants
-- ============================================================================

-- ============================================================================
-- DESPUÉS DE EJECUTAR ESTE SCRIPT:
-- 1. Reiniciar PM2: pm2 restart ecosystem.config.js
-- 2. Verificar logs: pm2 logs --lines 50
-- 3. Probar crear HC en demo-medico.archivoenlinea.com
-- ============================================================================
