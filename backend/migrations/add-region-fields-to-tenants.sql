-- Migración: Agregar campos de región a tenants
-- Fecha: 2026-02-07
-- Descripción: Agrega campos para soporte multi-región (Colombia, USA, etc.)

-- Agregar columnas de región
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS region VARCHAR(2) DEFAULT 'CO',
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'COP',
ADD COLUMN IF NOT EXISTS plan_price_original DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_locked BOOLEAN DEFAULT false;

-- Actualizar tenants existentes con valores por defecto
UPDATE tenants 
SET 
  region = 'CO',
  currency = 'COP',
  plan_price_original = plan_price,
  price_locked = true
WHERE region IS NULL;

-- Crear índice para búsquedas por región
CREATE INDEX IF NOT EXISTS idx_tenants_region ON tenants(region);
CREATE INDEX IF NOT EXISTS idx_tenants_currency ON tenants(currency);

-- Comentarios en las columnas
COMMENT ON COLUMN tenants.region IS 'Código de país del tenant (CO, US, DEFAULT)';
COMMENT ON COLUMN tenants.currency IS 'Moneda del tenant (COP, USD)';
COMMENT ON COLUMN tenants.plan_price_original IS 'Precio original al momento de suscripción';
COMMENT ON COLUMN tenants.price_locked IS 'Si true, el precio no cambia con actualizaciones de plan';
