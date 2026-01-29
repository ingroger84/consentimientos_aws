-- Verificar datos de cada tenant

SELECT 
    t.name as tenant_name,
    t.slug,
    t.status,
    t.plan,
    (SELECT COUNT(*) FROM users WHERE "tenantId" = t.id) as total_users,
    (SELECT COUNT(*) FROM consents WHERE "tenantId" = t.id) as total_consents,
    (SELECT COUNT(*) FROM branches WHERE "tenantId" = t.id) as total_branches,
    (SELECT COUNT(*) FROM services WHERE "tenantId" = t.id) as total_services,
    (SELECT COUNT(*) FROM clients WHERE tenant_id = t.id) as total_clients
FROM tenants t
ORDER BY t.name;

-- Verificar usuarios por tenant
SELECT 
    t.name as tenant_name,
    u.email,
    u.name as user_name,
    r.name as role_name
FROM users u
JOIN tenants t ON u."tenantId" = t.id
JOIN roles r ON u."roleId" = r.id
ORDER BY t.name, u.email;

-- Verificar consentimientos por tenant
SELECT 
    t.name as tenant_name,
    COUNT(c.id) as total_consents,
    COUNT(CASE WHEN c.status = 'signed' THEN 1 END) as signed_consents,
    COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_consents
FROM tenants t
LEFT JOIN consents c ON c."tenantId" = t.id
GROUP BY t.id, t.name
ORDER BY t.name;
