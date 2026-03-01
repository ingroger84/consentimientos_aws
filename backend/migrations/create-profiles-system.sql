-- ============================================
-- Sistema de Perfiles y Permisos Granulares
-- ============================================

-- 1. Crear tabla de perfiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  is_system BOOLEAN DEFAULT FALSE, -- Perfiles del sistema (no editables)
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB DEFAULT '[]'::jsonb, -- Array de permisos
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  -- Un perfil puede ser global (tenant_id NULL) o específico de un tenant
  CONSTRAINT unique_profile_name_per_tenant UNIQUE (name, tenant_id)
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_profiles_is_system ON profiles(is_system);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_profiles_permissions ON profiles USING GIN (permissions);

-- 3. Agregar columna profile_id a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_profile_id ON users(profile_id);

-- 4. Crear tabla de módulos del sistema (catálogo)
CREATE TABLE IF NOT EXISTS system_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE, -- Código único del módulo
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- dashboard, medical_records, admin, etc.
  icon VARCHAR(50), -- Icono para el frontend
  route VARCHAR(200), -- Ruta en el frontend
  parent_module_id UUID REFERENCES system_modules(id), -- Para submódulos
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_modules_category ON system_modules(category);
CREATE INDEX idx_system_modules_parent ON system_modules(parent_module_id);

-- 5. Crear tabla de acciones disponibles por módulo
CREATE TABLE IF NOT EXISTS module_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES system_modules(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL, -- view, create, edit, delete, export, etc.
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_action_per_module UNIQUE (module_id, code)
);

CREATE INDEX idx_module_actions_module_id ON module_actions(module_id);

-- 6. Crear tabla de auditoría de cambios de permisos
CREATE TABLE IF NOT EXISTS permission_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- created, updated, deleted, assigned, revoked
  changes JSONB, -- Detalle de los cambios
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  performed_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX idx_permission_audit_profile_id ON permission_audit(profile_id);
CREATE INDEX idx_permission_audit_user_id ON permission_audit(user_id);
CREATE INDEX idx_permission_audit_performed_at ON permission_audit(performed_at);

-- ============================================
-- Insertar módulos del sistema
-- ============================================

-- Módulos principales
INSERT INTO system_modules (code, name, description, category, icon, route, display_order) VALUES
-- Dashboard
('dashboard', 'Dashboard', 'Panel principal con estadísticas', 'dashboard', 'LayoutDashboard', '/dashboard', 1),
('dashboard_stats', 'Estadísticas', 'Ver estadísticas generales', 'dashboard', 'BarChart3', '/dashboard', 2),
('dashboard_charts', 'Gráficos', 'Ver gráficos y reportes', 'dashboard', 'PieChart', '/dashboard', 3),

-- Historias Clínicas
('medical_records', 'Historias Clínicas', 'Gestión de historias clínicas', 'medical', 'FileText', '/medical-records', 10),
('medical_records_list', 'Listar HC', 'Ver listado de historias clínicas', 'medical', 'List', '/medical-records', 11),
('medical_records_create', 'Crear HC', 'Crear nuevas historias clínicas', 'medical', 'FilePlus', '/medical-records/create', 12),
('medical_records_view', 'Ver HC', 'Ver detalles de historias clínicas', 'medical', 'Eye', '/medical-records/:id', 13),
('medical_records_edit', 'Editar HC', 'Editar historias clínicas', 'medical', 'Edit', '/medical-records/:id/edit', 14),
('medical_records_delete', 'Eliminar HC', 'Eliminar historias clínicas', 'medical', 'Trash2', null, 15),
('medical_records_export', 'Exportar HC', 'Exportar historias clínicas', 'medical', 'Download', null, 16),
('medical_records_print', 'Imprimir HC', 'Imprimir historias clínicas', 'medical', 'Printer', null, 17),

-- Consentimientos
('consents', 'Consentimientos', 'Gestión de consentimientos', 'consents', 'FileCheck', '/consents', 20),
('consents_list', 'Listar Consentimientos', 'Ver listado de consentimientos', 'consents', 'List', '/consents', 21),
('consents_create', 'Crear Consentimiento', 'Crear nuevos consentimientos', 'consents', 'FilePlus', '/consents/create', 22),
('consents_view', 'Ver Consentimiento', 'Ver detalles de consentimientos', 'consents', 'Eye', '/consents/:id', 23),
('consents_edit', 'Editar Consentimiento', 'Editar consentimientos', 'consents', 'Edit', '/consents/:id/edit', 24),
('consents_delete', 'Eliminar Consentimiento', 'Eliminar consentimientos', 'consents', 'Trash2', null, 25),
('consents_sign', 'Firmar Consentimiento', 'Firmar consentimientos', 'consents', 'PenTool', null, 26),

-- Clientes/Pacientes
('clients', 'Clientes', 'Gestión de clientes/pacientes', 'clients', 'Users', '/clients', 30),
('clients_list', 'Listar Clientes', 'Ver listado de clientes', 'clients', 'List', '/clients', 31),
('clients_create', 'Crear Cliente', 'Crear nuevos clientes', 'clients', 'UserPlus', '/clients/create', 32),
('clients_view', 'Ver Cliente', 'Ver detalles de clientes', 'clients', 'Eye', '/clients/:id', 33),
('clients_edit', 'Editar Cliente', 'Editar clientes', 'clients', 'Edit', '/clients/:id/edit', 34),
('clients_delete', 'Eliminar Cliente', 'Eliminar clientes', 'clients', 'Trash2', null, 35),
('clients_export', 'Exportar Clientes', 'Exportar listado de clientes', 'clients', 'Download', null, 36),

-- Usuarios
('users', 'Usuarios', 'Gestión de usuarios del sistema', 'admin', 'Users', '/users', 40),
('users_list', 'Listar Usuarios', 'Ver listado de usuarios', 'admin', 'List', '/users', 41),
('users_create', 'Crear Usuario', 'Crear nuevos usuarios', 'admin', 'UserPlus', '/users/create', 42),
('users_view', 'Ver Usuario', 'Ver detalles de usuarios', 'admin', 'Eye', '/users/:id', 43),
('users_edit', 'Editar Usuario', 'Editar usuarios', 'admin', 'Edit', '/users/:id/edit', 44),
('users_delete', 'Eliminar Usuario', 'Eliminar usuarios', 'admin', 'Trash2', null, 45),
('users_reset_password', 'Resetear Contraseña', 'Resetear contraseña de usuarios', 'admin', 'Key', null, 46),

-- Perfiles
('profiles', 'Perfiles', 'Gestión de perfiles y permisos', 'admin', 'Shield', '/profiles', 50),
('profiles_list', 'Listar Perfiles', 'Ver listado de perfiles', 'admin', 'List', '/profiles', 51),
('profiles_create', 'Crear Perfil', 'Crear nuevos perfiles', 'admin', 'ShieldPlus', '/profiles/create', 52),
('profiles_view', 'Ver Perfil', 'Ver detalles de perfiles', 'admin', 'Eye', '/profiles/:id', 53),
('profiles_edit', 'Editar Perfil', 'Editar perfiles', 'admin', 'Edit', '/profiles/:id/edit', 54),
('profiles_delete', 'Eliminar Perfil', 'Eliminar perfiles', 'admin', 'Trash2', null, 55),
('profiles_assign', 'Asignar Perfil', 'Asignar perfiles a usuarios', 'admin', 'UserCheck', null, 56),

-- Sedes
('branches', 'Sedes', 'Gestión de sedes', 'admin', 'Building2', '/branches', 60),
('branches_list', 'Listar Sedes', 'Ver listado de sedes', 'admin', 'List', '/branches', 61),
('branches_create', 'Crear Sede', 'Crear nuevas sedes', 'admin', 'Plus', '/branches/create', 62),
('branches_edit', 'Editar Sede', 'Editar sedes', 'admin', 'Edit', '/branches/:id/edit', 63),
('branches_delete', 'Eliminar Sede', 'Eliminar sedes', 'admin', 'Trash2', null, 64),

-- Plantillas
('templates', 'Plantillas', 'Gestión de plantillas', 'admin', 'FileText', '/templates', 70),
('templates_list', 'Listar Plantillas', 'Ver listado de plantillas', 'admin', 'List', '/templates', 71),
('templates_create', 'Crear Plantilla', 'Crear nuevas plantillas', 'admin', 'FilePlus', '/templates/create', 72),
('templates_edit', 'Editar Plantilla', 'Editar plantillas', 'admin', 'Edit', '/templates/:id/edit', 73),
('templates_delete', 'Eliminar Plantilla', 'Eliminar plantillas', 'admin', 'Trash2', null, 74),

-- Reportes
('reports', 'Reportes', 'Generación de reportes', 'reports', 'FileBarChart', '/reports', 80),
('reports_medical_records', 'Reporte HC', 'Reporte de historias clínicas', 'reports', 'FileText', '/reports/medical-records', 81),
('reports_consents', 'Reporte Consentimientos', 'Reporte de consentimientos', 'reports', 'FileCheck', '/reports/consents', 82),
('reports_clients', 'Reporte Clientes', 'Reporte de clientes', 'reports', 'Users', '/reports/clients', 83),
('reports_export', 'Exportar Reportes', 'Exportar reportes a Excel/PDF', 'reports', 'Download', null, 84),

-- Configuración
('settings', 'Configuración', 'Configuración del sistema', 'settings', 'Settings', '/settings', 90),
('settings_general', 'Configuración General', 'Configuración general del tenant', 'settings', 'Settings', '/settings/general', 91),
('settings_email', 'Configuración Email', 'Configuración de correo electrónico', 'settings', 'Mail', '/settings/email', 92),
('settings_billing', 'Configuración Facturación', 'Configuración de facturación', 'settings', 'CreditCard', '/settings/billing', 93),
('settings_security', 'Configuración Seguridad', 'Configuración de seguridad', 'settings', 'Lock', '/settings/security', 94),

-- Super Admin
('super_admin', 'Super Admin', 'Funciones de super administrador', 'super_admin', 'Crown', '/super-admin', 100),
('super_admin_tenants', 'Gestión Tenants', 'Gestión de tenants', 'super_admin', 'Building', '/super-admin/tenants', 101),
('super_admin_users', 'Gestión Usuarios Global', 'Gestión global de usuarios', 'super_admin', 'Users', '/super-admin/users', 102),
('super_admin_system', 'Configuración Sistema', 'Configuración del sistema', 'super_admin', 'Settings', '/super-admin/system', 103),
('super_admin_logs', 'Logs del Sistema', 'Ver logs del sistema', 'super_admin', 'FileText', '/super-admin/logs', 104);

-- ============================================
-- Insertar acciones por módulo
-- ============================================

-- Función helper para insertar acciones comunes
DO $$
DECLARE
  module_record RECORD;
BEGIN
  -- Para cada módulo que termina en _list, agregar acciones comunes
  FOR module_record IN 
    SELECT id, code FROM system_modules 
    WHERE code LIKE '%_list' OR code IN ('medical_records', 'consents', 'clients', 'users', 'profiles', 'branches', 'templates')
  LOOP
    -- Acción: Ver
    INSERT INTO module_actions (module_id, code, name, description)
    VALUES (module_record.id, 'view', 'Ver', 'Permiso para ver este módulo')
    ON CONFLICT (module_id, code) DO NOTHING;
    
    -- Si es un módulo principal, agregar más acciones
    IF module_record.code IN ('medical_records', 'consents', 'clients', 'users', 'profiles', 'branches', 'templates') THEN
      INSERT INTO module_actions (module_id, code, name, description) VALUES
        (module_record.id, 'create', 'Crear', 'Permiso para crear nuevos registros'),
        (module_record.id, 'edit', 'Editar', 'Permiso para editar registros'),
        (module_record.id, 'delete', 'Eliminar', 'Permiso para eliminar registros'),
        (module_record.id, 'export', 'Exportar', 'Permiso para exportar datos')
      ON CONFLICT (module_id, code) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Acciones específicas para historias clínicas
INSERT INTO module_actions (module_id, code, name, description)
SELECT id, 'print', 'Imprimir', 'Permiso para imprimir historias clínicas'
FROM system_modules WHERE code = 'medical_records'
ON CONFLICT (module_id, code) DO NOTHING;

INSERT INTO module_actions (module_id, code, name, description)
SELECT id, 'email', 'Enviar Email', 'Permiso para enviar HC por email'
FROM system_modules WHERE code = 'medical_records'
ON CONFLICT (module_id, code) DO NOTHING;

-- Acciones específicas para consentimientos
INSERT INTO module_actions (module_id, code, name, description)
SELECT id, 'sign', 'Firmar', 'Permiso para firmar consentimientos'
FROM system_modules WHERE code = 'consents'
ON CONFLICT (module_id, code) DO NOTHING;

-- ============================================
-- Crear perfiles predeterminados del sistema
-- ============================================

-- Perfil: Super Administrador (acceso total)
INSERT INTO profiles (name, description, is_system, permissions)
VALUES (
  'Super Administrador',
  'Acceso completo a todas las funciones del sistema',
  TRUE,
  '[
    {"module": "*", "actions": ["*"]}
  ]'::jsonb
);

-- Perfil: Administrador General
INSERT INTO profiles (name, description, is_system, permissions)
VALUES (
  'Administrador General',
  'Administrador con acceso a la mayoría de funciones excepto super admin',
  TRUE,
  '[
    {"module": "dashboard", "actions": ["view"]},
    {"module": "medical_records", "actions": ["view", "create", "edit", "delete", "export", "print", "email"]},
    {"module": "consents", "actions": ["view", "create", "edit", "delete", "sign"]},
    {"module": "clients", "actions": ["view", "create", "edit", "delete", "export"]},
    {"module": "users", "actions": ["view", "create", "edit", "delete", "reset_password"]},
    {"module": "profiles", "actions": ["view", "create", "edit", "assign"]},
    {"module": "branches", "actions": ["view", "create", "edit", "delete"]},
    {"module": "templates", "actions": ["view", "create", "edit", "delete"]},
    {"module": "reports", "actions": ["view", "export"]},
    {"module": "settings", "actions": ["view", "edit"]}
  ]'::jsonb
);

-- Perfil: Administrador de Sede
INSERT INTO profiles (name, description, is_system, permissions)
VALUES (
  'Administrador de Sede',
  'Administrador con acceso limitado a su sede',
  TRUE,
  '[
    {"module": "dashboard", "actions": ["view"]},
    {"module": "medical_records", "actions": ["view", "create", "edit", "export", "print"]},
    {"module": "consents", "actions": ["view", "create", "edit", "sign"]},
    {"module": "clients", "actions": ["view", "create", "edit", "export"]},
    {"module": "users", "actions": ["view"]},
    {"module": "reports", "actions": ["view", "export"]},
    {"module": "settings", "actions": ["view"]}
  ]'::jsonb
);

-- Perfil: Operador
INSERT INTO profiles (name, description, is_system, permissions)
VALUES (
  'Operador',
  'Usuario operativo con permisos básicos',
  TRUE,
  '[
    {"module": "dashboard", "actions": ["view"]},
    {"module": "medical_records", "actions": ["view", "create", "edit", "print"]},
    {"module": "consents", "actions": ["view", "create", "sign"]},
    {"module": "clients", "actions": ["view", "create", "edit"]},
    {"module": "reports", "actions": ["view"]}
  ]'::jsonb
);

-- Perfil: Solo Lectura
INSERT INTO profiles (name, description, is_system, permissions)
VALUES (
  'Solo Lectura',
  'Usuario con permisos de solo lectura',
  TRUE,
  '[
    {"module": "dashboard", "actions": ["view"]},
    {"module": "medical_records", "actions": ["view"]},
    {"module": "consents", "actions": ["view"]},
    {"module": "clients", "actions": ["view"]},
    {"module": "reports", "actions": ["view"]}
  ]'::jsonb
);

-- ============================================
-- Comentarios y documentación
-- ============================================

COMMENT ON TABLE profiles IS 'Perfiles de usuario con permisos personalizables';
COMMENT ON TABLE system_modules IS 'Catálogo de módulos del sistema';
COMMENT ON TABLE module_actions IS 'Acciones disponibles por módulo';
COMMENT ON TABLE permission_audit IS 'Auditoría de cambios en permisos';

COMMENT ON COLUMN profiles.permissions IS 'Array JSON de permisos: [{"module": "code", "actions": ["view", "create"]}]';
COMMENT ON COLUMN profiles.is_system IS 'TRUE para perfiles predeterminados del sistema (no editables)';
COMMENT ON COLUMN profiles.tenant_id IS 'NULL para perfiles globales, UUID para perfiles específicos de tenant';
