-- Verificar permisos del rol Administrador General
SELECT 
  r.id,
  r.name,
  r.permissions,
  t.name as tenant_name,
  t.slug as tenant_slug
FROM roles r
LEFT JOIN tenants t ON r.tenant_id = t.id
WHERE r.name LIKE '%Administrador%'
ORDER BY t.slug, r.name
LIMIT 5;
