-- Agregar columna max_mr_consents a la tabla tenants
-- Esta columna define el límite mensual de consentimientos de HC que puede crear un tenant

-- Agregar columna con valor por defecto
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS max_mr_consents INTEGER NOT NULL DEFAULT 50;

-- Comentario explicativo
COMMENT ON COLUMN tenants.max_mr_consents IS 'Límite mensual de consentimientos de HC (se reinicia el 1 de cada mes)';

-- Actualizar tenants existentes según su plan
-- Plan Basic: 50 consentimientos de HC/mes
UPDATE tenants 
SET max_mr_consents = 50 
WHERE plan = 'basic' AND max_mr_consents = 50;

-- Plan Professional: 200 consentimientos de HC/mes
UPDATE tenants 
SET max_mr_consents = 200 
WHERE plan = 'professional' AND max_mr_consents = 50;

-- Plan Enterprise: 500 consentimientos de HC/mes
UPDATE tenants 
SET max_mr_consents = 500 
WHERE plan = 'enterprise' AND max_mr_consents = 50;

-- Plan Free: 10 consentimientos de HC/mes
UPDATE tenants 
SET max_mr_consents = 10 
WHERE plan = 'free' AND max_mr_consents = 50;

-- Verificar resultados
SELECT 
  name,
  plan,
  max_mr_consents,
  max_consents,
  max_medical_records
FROM tenants
WHERE deleted_at IS NULL
ORDER BY plan, name;
