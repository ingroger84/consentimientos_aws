-- Verificar plantillas de consentimiento convencionales
\echo '=== PLANTILLAS DE CONSENTIMIENTO CONVENCIONALES ==='

-- Contar plantillas globales
SELECT 
  'Plantillas globales' as tipo,
  COUNT(*) as total
FROM consent_templates
WHERE "tenantId" IS NULL
  AND deleted_at IS NULL;

-- Contar plantillas por tenant
SELECT 
  t.name as tenant,
  COUNT(ct.id) as plantillas
FROM tenants t
LEFT JOIN consent_templates ct ON ct."tenantId" = t.id AND ct.deleted_at IS NULL
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.name
ORDER BY t.name;

-- Detalle de plantillas
SELECT 
  CASE WHEN "tenantId" IS NULL THEN 'GLOBAL' ELSE t.name END as tenant,
  ct.name as plantilla,
  ct.category,
  ct."isActive" as activa
FROM consent_templates ct
LEFT JOIN tenants t ON t.id = ct."tenantId"
WHERE ct.deleted_at IS NULL
ORDER BY tenant, ct.name;
