-- Verificar usuarios y sus roles
SELECT 
    u.id,
    u.email, 
    u.name, 
    r.name as role_name,
    r.id as role_id
FROM users u 
LEFT JOIN roles r ON u."roleId" = r.id 
WHERE u.email LIKE '%rcaraballo%' OR u.email LIKE '%admin%'
ORDER BY u.email;

-- Verificar permisos de los roles
SELECT 
    r.name as role_name,
    COUNT(rp.id) as permissions_count
FROM roles r
LEFT JOIN role_permissions rp ON rp."roleId" = r.id
GROUP BY r.id, r.name
ORDER BY r.name;

-- Verificar total de permisos en el sistema
SELECT COUNT(*) as total_permissions FROM permissions;

-- Verificar total de roles
SELECT COUNT(*) as total_roles FROM roles;
