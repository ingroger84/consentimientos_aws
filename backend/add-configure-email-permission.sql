-- Agregar el permiso 'configure_email' a los roles ADMIN_GENERAL y ADMIN_SEDE
-- que aún no lo tienen

UPDATE roles
SET permissions = permissions || ',configure_email'
WHERE type IN ('ADMIN_GENERAL', 'ADMIN_SEDE')
AND NOT (permissions LIKE '%configure_email%');

-- Verificar los cambios
SELECT 
  id,
  name,
  type,
  permissions
FROM roles
WHERE type IN ('ADMIN_GENERAL', 'ADMIN_SEDE')
ORDER BY name;
