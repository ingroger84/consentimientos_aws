-- Agregar campos para precios personalizados por tenant
-- Fecha: 2026-03-27
-- Versión: 76.1.0

-- Agregar columnas para precios personalizados
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS custom_price_monthly DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS custom_price_annual DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS use_custom_price BOOLEAN DEFAULT FALSE;

-- Comentarios
COMMENT ON COLUMN tenants.custom_price_monthly IS 'Precio mensual personalizado para este tenant (sobrescribe el precio del plan)';
COMMENT ON COLUMN tenants.custom_price_annual IS 'Precio anual personalizado para este tenant (sobrescribe el precio del plan)';
COMMENT ON COLUMN tenants.use_custom_price IS 'Si es true, usar precios personalizados en lugar de los precios del plan';
