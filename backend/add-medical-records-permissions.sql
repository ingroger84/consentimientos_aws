-- Agregar permisos para historias clínicas
-- Ejecutar después de crear las tablas

-- Insertar permisos
INSERT INTO permissions (name, description, category) VALUES
('view_medical_records', 'Ver historias clínicas', 'medical_records'),
('create_medical_records', 'Crear historias clínicas', 'medical_records'),
('edit_medical_records', 'Editar historias clínicas', 'medical_records'),
('delete_medical_records', 'Eliminar historias clínicas', 'medical_records'),
('close_medical_records', 'Cerrar historias clínicas', 'medical_records'),
('sign_medical_records', 'Firmar historias clínicas', 'medical_records'),
('export_medical_records', 'Exportar historias clínicas', 'medical_records')
ON CONFLICT (name) DO NOTHING;

-- Asignar todos los permisos al rol super_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.type = 'super_admin'
AND p.category = 'medical_records'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Asignar permisos básicos al rol admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.type = 'admin'
AND p.category = 'medical_records'
AND p.name IN ('view_medical_records', 'create_medical_records', 'edit_medical_records', 'close_medical_records', 'sign_medical_records')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Verificar permisos creados
SELECT p.name, p.description, p.category
FROM permissions p
WHERE p.category = 'medical_records'
ORDER BY p.name;
