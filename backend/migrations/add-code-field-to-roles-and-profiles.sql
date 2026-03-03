-- Migración: Agregar campo 'code' a roles y profiles
-- Fecha: 2026-03-02
-- Descripción: Normalización de nombres para identificación programática

-- ============================================
-- 1. AGREGAR CAMPO CODE A ROLES
-- ============================================

-- Agregar columna code a roles
ALTER TABLE roles ADD COLUMN IF NOT EXISTS code VARCHAR(50);

-- Poblar códigos para roles existentes
UPDATE roles SET code = 'super_admin' WHERE name = 'Super Administrador' OR name = 'super_admin';
UPDATE roles SET code = 'admin_general' WHERE name = 'Administrador General' OR name = 'ADMIN_GENERAL';
UPDATE roles SET code = 'admin_sede' WHERE name = 'Administrador de Sede' OR name = 'ADMIN_SEDE';
UPDATE roles SET code = 'operador' WHERE name = 'Operador' OR name = 'OPERADOR';

-- Hacer el campo code único y no nulo
ALTER TABLE roles ALTER COLUMN code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_code ON roles(code);

-- ============================================
-- 2. AGREGAR CAMPO CODE A PROFILES
-- ============================================

-- Agregar columna code a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS code VARCHAR(50);

-- Poblar códigos para perfiles existentes
UPDATE profiles SET code = 'super_admin' WHERE name = 'Super Administrador';
UPDATE profiles SET code = 'admin_general' WHERE name = 'Administrador General';
UPDATE profiles SET code = 'admin_sede' WHERE name = 'Administrador de Sede';
UPDATE profiles SET code = 'operador' WHERE name = 'Operador';
UPDATE profiles SET code = 'solo_lectura' WHERE name = 'Solo Lectura';

-- Para perfiles personalizados, generar código desde el nombre
UPDATE profiles 
SET code = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '_', 'g'))
WHERE code IS NULL;

-- Hacer el campo code único y no nulo
ALTER TABLE profiles ALTER COLUMN code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_code ON profiles(code);

-- ============================================
-- 3. CREAR ÍNDICES ADICIONALES
-- ============================================

-- Índices para User
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users("tenantId");
CREATE INDEX IF NOT EXISTS idx_users_profile_id ON users(profile_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users("isActive");
CREATE INDEX IF NOT EXISTS idx_users_tenant_active ON users("tenantId", "isActive");

-- Índices para Profile
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_system ON profiles(is_system);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_active ON profiles(tenant_id, is_active);

-- Índices para Role
CREATE INDEX IF NOT EXISTS idx_roles_type ON roles(type);

-- ============================================
-- 4. VERIFICACIÓN
-- ============================================

-- Verificar que todos los roles tengan código
DO $$
DECLARE
    roles_sin_codigo INTEGER;
BEGIN
    SELECT COUNT(*) INTO roles_sin_codigo FROM roles WHERE code IS NULL;
    IF roles_sin_codigo > 0 THEN
        RAISE EXCEPTION 'Hay % roles sin código asignado', roles_sin_codigo;
    END IF;
    RAISE NOTICE 'Todos los roles tienen código asignado';
END $$;

-- Verificar que todos los perfiles tengan código
DO $$
DECLARE
    profiles_sin_codigo INTEGER;
BEGIN
    SELECT COUNT(*) INTO profiles_sin_codigo FROM profiles WHERE code IS NULL;
    IF profiles_sin_codigo > 0 THEN
        RAISE EXCEPTION 'Hay % perfiles sin código asignado', profiles_sin_codigo;
    END IF;
    RAISE NOTICE 'Todos los perfiles tienen código asignado';
END $$;

-- Mostrar resumen
SELECT 
    'Roles' as tabla,
    COUNT(*) as total,
    COUNT(DISTINCT code) as codigos_unicos
FROM roles
UNION ALL
SELECT 
    'Profiles' as tabla,
    COUNT(*) as total,
    COUNT(DISTINCT code) as codigos_unicos
FROM profiles;

-- ============================================
-- ROLLBACK (si es necesario)
-- ============================================

-- Para hacer rollback, ejecutar:
-- DROP INDEX IF EXISTS idx_roles_code;
-- DROP INDEX IF EXISTS idx_profiles_code;
-- ALTER TABLE roles DROP COLUMN IF EXISTS code;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS code;
