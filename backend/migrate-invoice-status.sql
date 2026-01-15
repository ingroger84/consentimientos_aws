-- Migración para cambiar el estado de facturas de 'cancelled' a 'voided'

-- Paso 1: Agregar el nuevo valor al enum
ALTER TYPE invoices_status_enum ADD VALUE IF NOT EXISTS 'voided';

-- Paso 2: Actualizar las facturas existentes
UPDATE invoices 
SET status = 'voided' 
WHERE status = 'cancelled';

-- Paso 3: Verificar el cambio
SELECT status, COUNT(*) as count 
FROM invoices 
GROUP BY status;
