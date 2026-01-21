-- Agregar columnas para facturas exentas de impuestos
-- Ejecutar este script si las columnas no existen

-- Agregar columna taxExempt (por defecto false)
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS "taxExempt" boolean NOT NULL DEFAULT false;

-- Agregar columna taxExemptReason (opcional)
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS "taxExemptReason" text;

-- Verificar las columnas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'invoices' 
  AND column_name IN ('taxExempt', 'taxExemptReason')
ORDER BY column_name;
