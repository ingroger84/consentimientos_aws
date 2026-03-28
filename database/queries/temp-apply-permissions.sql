-- Aplicar permisos de Vista Previa y Enviar Email en HC
-- Versión: 32.0.1

-- 1. Crear permisos
INSERT INTO permissions (name, description, category, created_at, updated_at)
SELECT 'preview_medical_records', 'Vista previa de historias clínicas', 'medical_records', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'preview_medical_records');

INSERT INTO permissions (name, description, category, created_at, updated_at)
SELECT 'send_email_medical_records', 'Enviar historias clínicas por email', 'medical_records', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'send_email_medical_records');

-- 2. Asignar a Super Admin
DO $$
DECLARE
    preview_id UUID;
    email_id UUID;
    super_admin_id UUID;
BEGIN
    SELECT id INTO preview_id FROM permissions WHERE name = 'preview_medical_records';
    SELECT id INTO email_id FROM permissions WHERE name = 'send_email_medical_records';
    SELECT id INTO super_admin_id FROM roles WHERE type = 'super_admin' LIMIT 1;
    
    IF preview_id IS NOT NULL AND super_admin_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT super_admin_id, preview_id, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = super_admin_id AND permission_id = preview_id);
    END IF;
    
    IF email_id IS NOT NULL AND super_admin_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT super_admin_id, email_id, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = super_admin_id AND permission_id = email_id);
    END IF;
END $$;

-- 3. Asignar a Admin General
DO $$
DECLARE
    preview_id UUID;
    email_id UUID;
    admin_id UUID;
BEGIN
    SELECT id INTO preview_id FROM permissions WHERE name = 'preview_medical_records';
    SELECT id INTO email_id FROM permissions WHERE name = 'send_email_medical_records';
    SELECT id INTO admin_id FROM roles WHERE type = 'admin_general' LIMIT 1;
    
    IF preview_id IS NOT NULL AND admin_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT admin_id, preview_id, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = admin_id AND permission_id = preview_id);
    END IF;
    
    IF email_id IS NOT NULL AND admin_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT admin_id, email_id, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = admin_id AND permission_id = email_id);
    END IF;
END $$;

-- 4. Asignar a Operador
DO $$
DECLARE
    preview_id UUID;
    email_id UUID;
    operador_id UUID;
BEGIN
    SELECT id INTO preview_id FROM permissions WHERE name = 'preview_medical_records';
    SELECT id INTO email_id FROM permissions WHERE name = 'send_email_medical_records';
    SELECT id INTO operador_id FROM roles WHERE type = 'operador' LIMIT 1;
    
    IF preview_id IS NOT NULL AND operador_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT operador_id, preview_id, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = operador_id AND permission_id = preview_id);
    END IF;
    
    IF email_id IS NOT NULL AND operador_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT operador_id, email_id, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = operador_id AND permission_id = email_id);
    END IF;
END $$;

-- 5. Verificar
SELECT 
    'Permisos aplicados correctamente' as status,
    COUNT(*) as total_permisos
FROM permissions 
WHERE name IN ('preview_medical_records', 'send_email_medical_records');

SELECT 
    r.type as role_type,
    r.name as role_name,
    p.name as permission_name,
    p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.name IN ('preview_medical_records', 'send_email_medical_records')
ORDER BY r.type, p.name;
