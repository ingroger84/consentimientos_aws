-- Verificar aislamiento de configuración entre Super Admin y Tenants

-- 1. Settings del Super Admin (tenantId = NULL)
SELECT 
  'SUPER ADMIN' as owner,
  key,
  value,
  "tenantId"
FROM app_settings
WHERE "tenantId" IS NULL
ORDER BY key;

-- 2. Settings de cada Tenant
SELECT 
  COALESCE(t.name, 'TENANT ' || s."tenantId") as owner,
  s.key,
  s.value,
  s."tenantId"
FROM app_settings s
LEFT JOIN tenants t ON t.id = s."tenantId"
WHERE s."tenantId" IS NOT NULL
ORDER BY s."tenantId", s.key;

-- 3. Verificar duplicados en Super Admin
SELECT 
  key,
  COUNT(*) as count
FROM app_settings
WHERE "tenantId" IS NULL
GROUP BY key
HAVING COUNT(*) > 1;

-- 4. Verificar duplicados en cada Tenant
SELECT 
  "tenantId",
  key,
  COUNT(*) as count
FROM app_settings
WHERE "tenantId" IS NOT NULL
GROUP BY "tenantId", key
HAVING COUNT(*) > 1;

-- 5. Resumen por tenant
SELECT 
  CASE 
    WHEN "tenantId" IS NULL THEN 'SUPER ADMIN'
    ELSE COALESCE(t.name, 'TENANT ' || s."tenantId")
  END as owner,
  COUNT(*) as total_settings
FROM app_settings s
LEFT JOIN tenants t ON t.id = s."tenantId"
GROUP BY "tenantId", t.name
ORDER BY "tenantId" NULLS FIRST;
