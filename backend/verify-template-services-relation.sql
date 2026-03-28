-- ============================================
-- Script de Verificación: Plantillas CN y Servicios
-- ============================================
-- Fecha: 2026-03-19
-- Descripción: Verifica la relación entre plantillas CN y servicios
-- ============================================

-- 1. Ver todas las plantillas CN y sus servicios asociados
SELECT 
  ct.id,
  ct.name AS plantilla,
  ct.type AS tipo,
  ct."isActive" AS activa,
  ct."isDefault" AS predeterminada_legacy,
  t.name AS cuenta,
  COUNT(DISTINCT cts."serviceId") AS total_servicios,
  STRING_AGG(DISTINCT s.name, ', ') AS servicios
FROM consent_templates ct
LEFT JOIN tenants t ON ct."tenantId" = t.id
LEFT JOIN consent_template_services cts ON ct.id = cts."consentTemplateId"
LEFT JOIN services s ON cts."serviceId" = s.id
GROUP BY ct.id, ct.name, ct.type, ct."isActive", ct."isDefault", t.name
ORDER BY t.name, ct.type, ct.name;

-- 2. Ver plantillas SIN servicios asociados (necesitan configuración)
SELECT 
  ct.id,
  ct.name AS plantilla,
  ct.type AS tipo,
  ct."isActive" AS activa,
  t.name AS cuenta
FROM consent_templates ct
LEFT JOIN tenants t ON ct."tenantId" = t.id
WHERE NOT EXISTS (
  SELECT 1 
  FROM consent_template_services cts 
  WHERE cts."consentTemplateId" = ct.id
)
ORDER BY t.name, ct.type, ct.name;

-- 3. Ver servicios y sus plantillas asociadas
SELECT 
  s.id,
  s.name AS servicio,
  s."isActive" AS activo,
  t.name AS cuenta,
  COUNT(DISTINCT cts."consentTemplateId") AS total_plantillas,
  STRING_AGG(DISTINCT ct.name || ' (' || ct.type || ')', ', ') AS plantillas
FROM services s
LEFT JOIN tenants t ON s."tenantId" = t.id
LEFT JOIN consent_template_services cts ON s.id = cts."serviceId"
LEFT JOIN consent_templates ct ON cts."consentTemplateId" = ct.id
GROUP BY s.id, s.name, s."isActive", t.name
ORDER BY t.name, s.name;

-- 4. Ver servicios SIN plantillas asociadas (necesitan configuración)
SELECT 
  s.id,
  s.name AS servicio,
  s."isActive" AS activo,
  t.name AS cuenta
FROM services s
LEFT JOIN tenants t ON s."tenantId" = t.id
WHERE s."isActive" = true
  AND NOT EXISTS (
    SELECT 1 
    FROM consent_template_services cts 
    WHERE cts."serviceId" = s.id
  )
ORDER BY t.name, s.name;

-- 5. Estadísticas por cuenta
SELECT 
  COALESCE(t.name, 'Super Admin') AS cuenta,
  COUNT(DISTINCT ct.id) AS total_plantillas,
  COUNT(DISTINCT CASE WHEN ct."isActive" = true THEN ct.id END) AS plantillas_activas,
  COUNT(DISTINCT s.id) AS total_servicios,
  COUNT(DISTINCT CASE WHEN s."isActive" = true THEN s.id END) AS servicios_activos,
  COUNT(DISTINCT cts.id) AS total_asociaciones
FROM tenants t
LEFT JOIN consent_templates ct ON t.id = ct."tenantId"
LEFT JOIN services s ON t.id = s."tenantId"
LEFT JOIN consent_template_services cts ON ct.id = cts."consentTemplateId"
GROUP BY t.name
ORDER BY t.name;

-- 6. Ver plantillas por tipo y cuenta
SELECT 
  COALESCE(t.name, 'Super Admin') AS cuenta,
  ct.type AS tipo,
  COUNT(*) AS total,
  COUNT(CASE WHEN ct."isActive" = true THEN 1 END) AS activas,
  COUNT(CASE WHEN EXISTS (
    SELECT 1 FROM consent_template_services cts WHERE cts."consentTemplateId" = ct.id
  ) THEN 1 END) AS con_servicios
FROM consent_templates ct
LEFT JOIN tenants t ON ct."tenantId" = t.id
GROUP BY t.name, ct.type
ORDER BY t.name, ct.type;

-- 7. Ver últimas asociaciones creadas
SELECT 
  cts."createdAt" AS fecha,
  ct.name AS plantilla,
  ct.type AS tipo,
  s.name AS servicio,
  t.name AS cuenta
FROM consent_template_services cts
JOIN consent_templates ct ON cts."consentTemplateId" = ct.id
JOIN services s ON cts."serviceId" = s.id
LEFT JOIN tenants t ON ct."tenantId" = t.id
ORDER BY cts."createdAt" DESC
LIMIT 20;

-- 8. Verificar integridad de datos
SELECT 
  'Plantillas huérfanas' AS verificacion,
  COUNT(*) AS total
FROM consent_templates ct
WHERE ct."tenantId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tenants t WHERE t.id = ct."tenantId"
  )
UNION ALL
SELECT 
  'Servicios huérfanos' AS verificacion,
  COUNT(*) AS total
FROM services s
WHERE s."tenantId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tenants t WHERE t.id = s."tenantId"
  )
UNION ALL
SELECT 
  'Asociaciones con plantilla inexistente' AS verificacion,
  COUNT(*) AS total
FROM consent_template_services cts
WHERE NOT EXISTS (
    SELECT 1 FROM consent_templates ct WHERE ct.id = cts."consentTemplateId"
  )
UNION ALL
SELECT 
  'Asociaciones con servicio inexistente' AS verificacion,
  COUNT(*) AS total
FROM consent_template_services cts
WHERE NOT EXISTS (
    SELECT 1 FROM services s WHERE s.id = cts."serviceId"
  );

-- 9. Recomendaciones de configuración
SELECT 
  'RECOMENDACIÓN' AS tipo,
  'Asociar plantillas a servicios' AS accion,
  COUNT(*) AS items_pendientes
FROM consent_templates ct
WHERE ct."isActive" = true
  AND NOT EXISTS (
    SELECT 1 FROM consent_template_services cts WHERE cts."consentTemplateId" = ct.id
  )
UNION ALL
SELECT 
  'ADVERTENCIA' AS tipo,
  'Servicios sin plantillas' AS accion,
  COUNT(*) AS items_pendientes
FROM services s
WHERE s."isActive" = true
  AND NOT EXISTS (
    SELECT 1 FROM consent_template_services cts WHERE cts."serviceId" = s.id
  );

