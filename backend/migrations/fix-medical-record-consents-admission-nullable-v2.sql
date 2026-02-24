-- Hacer la columna admission_id nullable en medical_record_consents
-- Esto permite crear consentimientos sin asociarlos a una admisión específica
-- o asociarlos a una admisión cuando se proporciona el admissionId

ALTER TABLE medical_record_consents 
ALTER COLUMN admission_id DROP NOT NULL;

-- Verificar el cambio
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'medical_record_consents' 
AND column_name = 'admission_id';
