-- Migración: Permitir tenant_id NULL en medical_record_audit
-- Fecha: 2026-02-22
-- Razón: El Super Admin no tiene tenantId, pero necesita poder eliminar HC y crear registros de auditoría

-- Hacer tenant_id nullable en medical_record_audit
ALTER TABLE medical_record_audit 
ALTER COLUMN tenant_id DROP NOT NULL;

-- Verificar el cambio
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'medical_record_audit' 
AND column_name = 'tenant_id';
