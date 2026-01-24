-- Agregar permisos de clientes a los roles existentes
-- Los permisos están almacenados como texto separado por comas

-- ADMIN_GENERAL - todos los permisos de clientes
UPDATE roles 
SET permissions = permissions || ',view_clients,create_clients,edit_clients,delete_clients'
WHERE type = 'ADMIN_GENERAL' AND permissions NOT LIKE '%view_clients%';

-- ADMIN_SEDE - ver, crear y editar clientes
UPDATE roles 
SET permissions = permissions || ',view_clients,create_clients,edit_clients'
WHERE type = 'ADMIN_SEDE' AND permissions NOT LIKE '%view_clients%';

-- OPERADOR - ver y crear clientes (necesario para crear consentimientos)
UPDATE roles 
SET permissions = permissions || ',view_clients,create_clients'
WHERE type = 'OPERADOR' AND permissions NOT LIKE '%view_clients%';

-- Registrar la migración
INSERT INTO migrations (timestamp, name)
SELECT 1737690000000, 'AddClientPermissions1737690000000'
WHERE NOT EXISTS (
  SELECT 1 FROM migrations 
  WHERE timestamp = 1737690000000
);

-- Verificar permisos agregados
SELECT type, permissions 
FROM roles 
WHERE permissions LIKE '%view_clients%'
ORDER BY type;
