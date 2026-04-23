-- Agregar campos para código de sucursal DynamiaERP y consecutivo de facturas
-- Fecha: 2026-04-20

-- Agregar columna para código de sucursal DynamiaERP (001, 002, 003, etc.)
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS dynamiaerp_branch_code VARCHAR(3);

-- Agregar columna para último consecutivo de factura usado
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS dynamiaerp_last_invoice_number INTEGER DEFAULT 0;

-- Agregar comentarios
COMMENT ON COLUMN tenants.dynamiaerp_branch_code IS 'Código de sucursal en DynamiaERP (formato: 001, 002, 003, etc.)';
COMMENT ON COLUMN tenants.dynamiaerp_last_invoice_number IS 'Último número consecutivo de factura enviado a DynamiaERP';

-- Asignar código de sucursal a Aquiub (primer tenant)
UPDATE tenants 
SET dynamiaerp_branch_code = '001'
WHERE slug = 'aquiub';

-- Crear función para asignar automáticamente código de sucursal a nuevos tenants
CREATE OR REPLACE FUNCTION assign_dynamiaerp_branch_code()
RETURNS TRIGGER AS $$
DECLARE
  next_code INTEGER;
  formatted_code VARCHAR(3);
BEGIN
  -- Si no tiene código de sucursal asignado
  IF NEW.dynamiaerp_branch_code IS NULL THEN
    -- Obtener el siguiente código disponible
    SELECT COALESCE(MAX(CAST(dynamiaerp_branch_code AS INTEGER)), 0) + 1
    INTO next_code
    FROM tenants
    WHERE dynamiaerp_branch_code IS NOT NULL;
    
    -- Formatear con ceros a la izquierda (001, 002, 003, etc.)
    formatted_code := LPAD(next_code::TEXT, 3, '0');
    
    -- Asignar el código
    NEW.dynamiaerp_branch_code := formatted_code;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para asignar código automáticamente
DROP TRIGGER IF EXISTS trigger_assign_dynamiaerp_branch_code ON tenants;
CREATE TRIGGER trigger_assign_dynamiaerp_branch_code
  BEFORE INSERT ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION assign_dynamiaerp_branch_code();

-- Verificar tenants existentes
SELECT 
  id,
  name,
  slug,
  dynamiaerp_branch_code,
  dynamiaerp_last_invoice_number
FROM tenants
WHERE deleted_at IS NULL
ORDER BY created_at;
