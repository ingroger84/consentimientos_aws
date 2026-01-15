-- Actualizar permisos del Administrador General
UPDATE roles 
SET permissions = 'view_dashboard,view_consents,create_consents,edit_consents,delete_consents,view_users,create_users,edit_users,delete_users,change_passwords,view_roles,edit_roles,view_branches,create_branches,edit_branches,delete_branches,view_services,create_services,edit_services,delete_services,view_questions,create_questions,edit_questions,delete_questions,view_settings,edit_settings'
WHERE type = 'ADMIN_GENERAL';

-- Actualizar permisos del Administrador de Sede
UPDATE roles 
SET permissions = 'view_dashboard,view_consents,create_consents,edit_consents,delete_consents,view_users,view_branches,view_services,view_questions'
WHERE type = 'ADMIN_SEDE';

-- Actualizar permisos del Operador
UPDATE roles 
SET permissions = 'view_dashboard,view_consents,create_consents'
WHERE type = 'OPERADOR';

-- Verificar los cambios
SELECT name, type, permissions FROM roles ORDER BY type;
