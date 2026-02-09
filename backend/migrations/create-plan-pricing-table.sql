-- Migración: Crear tabla de precios de planes por región
-- Fecha: 2026-02-08
-- Descripción: Tabla para gestionar precios de planes por región (Colombia, USA, Internacional)

CREATE TABLE IF NOT EXISTS plan_pricing (
  id SERIAL PRIMARY KEY,
  plan_id VARCHAR(50) NOT NULL,
  region VARCHAR(10) NOT NULL,
  region_name VARCHAR(50) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  currency_symbol VARCHAR(5) NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_annual DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  tax_name VARCHAR(50) NOT NULL DEFAULT 'Tax',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(plan_id, region)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_plan_pricing_plan_id ON plan_pricing(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_pricing_region ON plan_pricing(region);
CREATE INDEX IF NOT EXISTS idx_plan_pricing_active ON plan_pricing(is_active);

-- Insertar precios para Colombia (COP)
INSERT INTO plan_pricing (plan_id, region, region_name, currency, currency_symbol, price_monthly, price_annual, tax_rate, tax_name) VALUES
('free', 'CO', 'Colombia', 'COP', '$', 0, 0, 0.19, 'IVA'),
('basic', 'CO', 'Colombia', 'COP', '$', 89900, 895404, 0.19, 'IVA'),
('professional', 'CO', 'Colombia', 'COP', '$', 119900, 1194202, 0.19, 'IVA'),
('enterprise', 'CO', 'Colombia', 'COP', '$', 149900, 1493004, 0.19, 'IVA'),
('custom', 'CO', 'Colombia', 'COP', '$', 189900, 1891404, 0.19, 'IVA')
ON CONFLICT (plan_id, region) DO NOTHING;

-- Insertar precios para Estados Unidos (USD)
INSERT INTO plan_pricing (plan_id, region, region_name, currency, currency_symbol, price_monthly, price_annual, tax_rate, tax_name) VALUES
('free', 'US', 'United States', 'USD', '$', 0, 0, 0.08, 'Sales Tax'),
('basic', 'US', 'United States', 'USD', '$', 79, 790, 0.08, 'Sales Tax'),
('professional', 'US', 'United States', 'USD', '$', 119, 1190, 0.08, 'Sales Tax'),
('enterprise', 'US', 'United States', 'USD', '$', 169, 1690, 0.08, 'Sales Tax'),
('custom', 'US', 'United States', 'USD', '$', 249, 2490, 0.08, 'Sales Tax')
ON CONFLICT (plan_id, region) DO NOTHING;

-- Insertar precios para Internacional (USD - Default)
INSERT INTO plan_pricing (plan_id, region, region_name, currency, currency_symbol, price_monthly, price_annual, tax_rate, tax_name) VALUES
('free', 'DEFAULT', 'International', 'USD', '$', 0, 0, 0, 'Tax'),
('basic', 'DEFAULT', 'International', 'USD', '$', 79, 790, 0, 'Tax'),
('professional', 'DEFAULT', 'International', 'USD', '$', 119, 1190, 0, 'Tax'),
('enterprise', 'DEFAULT', 'International', 'USD', '$', 169, 1690, 0, 'Tax'),
('custom', 'DEFAULT', 'International', 'USD', '$', 249, 2490, 0, 'Tax')
ON CONFLICT (plan_id, region) DO NOTHING;

-- Comentarios
COMMENT ON TABLE plan_pricing IS 'Precios de planes por región geográfica';
COMMENT ON COLUMN plan_pricing.plan_id IS 'ID del plan (free, basic, professional, enterprise, custom)';
COMMENT ON COLUMN plan_pricing.region IS 'Código de región (CO, US, DEFAULT)';
COMMENT ON COLUMN plan_pricing.region_name IS 'Nombre de la región';
COMMENT ON COLUMN plan_pricing.currency IS 'Código de moneda (COP, USD)';
COMMENT ON COLUMN plan_pricing.price_monthly IS 'Precio mensual en la moneda local';
COMMENT ON COLUMN plan_pricing.price_annual IS 'Precio anual en la moneda local';
COMMENT ON COLUMN plan_pricing.tax_rate IS 'Tasa de impuesto (0.19 = 19%)';
COMMENT ON COLUMN plan_pricing.tax_name IS 'Nombre del impuesto (IVA, Sales Tax, etc)';
