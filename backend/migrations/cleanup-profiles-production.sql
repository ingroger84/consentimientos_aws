-- ============================================================================
-- LIMPIEZA COMPLETA DEL SISTEMA DE PERFILES EN PRODUCCIÓN
-- Versión: 41.0.0
-- Fecha: 2026-03-14
-- Descripción: Elimina TODAS las tablas y columnas relacionadas con perfiles
-- ============================================================================

-- IMPORTANTE: Este script debe ejecutarse en el servidor de producción
-- para eliminar completamente el sistema de perfiles modular

BEGIN;

-- 1. Eliminar columna profile_id de la tabla users (si existe)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'profile_id'
    ) THEN
        ALTER TABLE users DROP COLUMN profile_id;
        RAISE NOTICE 'Columna profile_id eliminada de users';
    ELSE
        RAISE NOTICE 'Columna profile_id no existe en users';
    END IF;
END $$;

-- 2. Eliminar tabla permission_audit (si existe)
DROP TABLE IF EXISTS permission_audit CASCADE;

-- 3. Eliminar tabla module_actions (si existe)
DROP TABLE IF EXISTS module_actions CASCADE;

-- 4. Eliminar tabla system_modules (si existe)
DROP TABLE IF EXISTS system_modules CASCADE;

-- 5. Eliminar tabla profiles (si existe)
DROP TABLE IF EXISTS profiles CASCADE;

-- 6. Verificar que las tablas fueron eliminadas
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_name IN ('profiles', 'system_modules', 'module_actions', 'permission_audit');
    
    IF table_count = 0 THEN
        RAISE NOTICE '✅ Todas las tablas de perfiles fueron eliminadas correctamente';
    ELSE
        RAISE WARNING '⚠️ Algunas tablas de perfiles aún existen';
    END IF;
END $$;

-- 7. Verificar que la columna profile_id fue eliminada
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'profile_id'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        RAISE NOTICE '✅ Columna profile_id eliminada correctamente de users';
    ELSE
        RAISE WARNING '⚠️ Columna profile_id aún existe en users';
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- FIN DEL SCRIPT DE LIMPIEZA
-- ============================================================================
