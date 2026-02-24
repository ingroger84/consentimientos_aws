-- Agregar columna suspended_at a la tabla tenants
-- Esta columna almacena la fecha y hora en que el tenant fue suspendido

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP NULL;

-- Comentario para documentación
COMMENT ON COLUMN tenants.suspended_at IS 'Fecha y hora en que el tenant fue suspendido';

-- Verificar el cambio
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'tenants' 
AND column_name = 'suspended_at';
