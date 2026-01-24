-- Agregar permisos de clientes a los roles existentes

-- SUPER_ADMIN - todos los permisos de clientes
UPDATE roles 
SET permissions = array_append(permissions, 'view_clients')
WHERE type = 'SUPER_ADMIN' AND NOT ('view_clients' = ANY(permissions));

UPDATE roles 
SET permissions = array_append(permissions, 'create_clients')
WHERE type = 'SUPER_ADMIN' AND NOT ('create_clients' = ANY(permissions));

UPDATE roles 
SET permissions = array_append(permissions, 'edit_clients')
WHERE type = 'SUPER_ADMIN' AND NOT ('edit_clients' = ANY(permissions));

UPDATE roles 
SET permissions = array_append(permissions, 'delete_clients')
WHERE type = 'SUPER_ADMIN' AND NOT ('delete_clients' = ANY(permissions));

-- ADMIN_GENERAL - todos los permisos de clientes
UPDATE roles 
SET permissions = array_append(permissions, 'view_clients')
WHERE type = 'ADMIN_GENERAL' AND NOT ('view_clients' = ANY(permissions));

UPDATE roles 
SET permissions = array_append(permissions, 'create_clients')
WHERE type = 'ADMIN_GENERAL' AND NOT ('create_clients' = ANY(permissions));

UPDATE roles 
SET permissions = array_append(permissions, 'edit_clients')
WHERE type = 'ADMIN_GENERAL' AND NOT ('edit_clients' = ANY(permissions));

UPDATE roles 
SET permissions = array_append(permissions, 'delete_clients')
WHERE type = 'ADMIN_GENERAL' AND NOT ('delete_clients' = ANY(permissions));

-- ADMIN_SEDE - ver, crear y editar clientes
UPDATE roles 
SET permissions = array_append(permissions, 'view_clients')
WHERE type = 'ADMIN_SEDE' AND NOT ('view_clients' = ANY(permissions));

UPDATE roles 
SET permissions = array_append(permissions, 'create_clients')
WHERE type = 'ADMIN_SEDE' AND NOT ('create_clients' = ANY(permissions));

UPDATE roles 
SET permissions = array_append(permissions, 'edit_clients')
WHERE type = 'ADMIN_SEDE' AND NOT ('edit_clients' = ANY(permissions));

-- OPERADOR - ver y crear clientes (necesario para crear consentimientos)
UPDATE roles 
SET permissions = array_append(permissions, 'view_clients')
WHERE type = 'OPERADOR' AND NOT ('view_clients' = ANY(permissions));

UPDATE roles 
SET permissions = array_append(permissions, 'create_clients')
WHERE type = 'OPERADOR' AND NOT ('create_clients' = ANY(permissions));

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
WHERE 'view_clients' = ANY(permissions)
ORDER BY type;
