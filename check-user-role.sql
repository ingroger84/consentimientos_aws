SELECT 
    u.email, 
    u.name, 
    r.name as role_name, 
    r.type,
    LENGTH(r.permissions) as perm_length,
    LEFT(r.permissions, 100) as perms_preview
FROM users u 
LEFT JOIN roles r ON u."roleId" = r.id 
WHERE u.email = 'rcaraballo@innovasystems.com.co';
