-- Aplicar permisos de Vista Previa y Enviar Email en HC
-- Versión: 32.0.1
-- Fecha: 2026-02-09

-- Los permisos se almacenan como texto separado por comas en la tabla roles

-- 1. Agregar permisos a Super Admin
UPDATE roles 
SET permissions = permissions || ',preview_medical_records,send_email_medical_records',
    updated_at = NOW()
WHERE type = 'super_admin' 
AND permissions NOT LIKE '%preview_medical_records%';

-- 2. Agregar permisos a Admin General
UPDATE roles 
SET permissions = permissions || ',preview_medical_records,send_email_medical_records',
    updated_at = NOW()
WHERE type = 'ADMIN_GENERAL' 
AND permissions NOT LIKE '%preview_medical_records%';

-- 3. Agregar permisos a Admin Sede
UPDATE roles 
SET permissions = permissions || ',preview_medical_records,send_email_medical_records',
    updated_at = NOW()
WHERE type = 'ADMIN_SEDE' 
AND permissions NOT LIKE '%preview_medical_records%';

-- 4. Agregar permisos a Operador
UPDATE roles 
SET permissions = permissions || ',preview_medical_records,send_email_medical_records',
    updated_at = NOW()
WHERE type = 'OPERADOR' 
AND permissions NOT LIKE '%preview_medical_records%';

-- 5. Verificar que se aplicaron correctamente
SELECT 
    type,
    name,
    CASE 
        WHEN permissions LIKE '%preview_medical_records%' THEN '✓ Tiene preview_medical_records'
        ELSE '✗ NO tiene preview_medical_records'
    END as preview_status,
    CASE 
        WHEN permissions LIKE '%send_email_medical_records%' THEN '✓ Tiene send_email_medical_records'
        ELSE '✗ NO tiene send_email_medical_records'
    END as email_status
FROM roles
WHERE type IN ('super_admin', 'ADMIN_GENERAL', 'ADMIN_SEDE', 'OPERADOR')
ORDER BY type;
