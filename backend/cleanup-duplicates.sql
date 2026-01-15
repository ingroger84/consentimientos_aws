-- Script para verificar y limpiar duplicados en user_branches
-- Ejecutar en PostgreSQL

-- 1. VERIFICAR DUPLICADOS
-- Ver si hay duplicados en la tabla user_branches
SELECT 
  user_id,
  branch_id,
  COUNT(*) as cantidad
FROM user_branches
GROUP BY user_id, branch_id
HAVING COUNT(*) > 1;

-- 2. VER DETALLES DE USUARIOS CON DUPLICADOS
SELECT 
  u.name as usuario,
  u.email,
  b.name as sede,
  COUNT(*) as veces_asignada
FROM users u
JOIN user_branches ub ON u.id = ub.user_id
JOIN branches b ON ub.branch_id = b.id
GROUP BY u.id, u.name, u.email, b.id, b.name
HAVING COUNT(*) > 1
ORDER BY u.name, b.name;

-- 3. ELIMINAR DUPLICADOS (mantener solo uno de cada relación)
-- IMPORTANTE: Hacer backup antes de ejecutar esto
WITH duplicates AS (
  SELECT 
    user_id,
    branch_id,
    ROW_NUMBER() OVER (PARTITION BY user_id, branch_id ORDER BY user_id) as rn
  FROM user_branches
)
DELETE FROM user_branches
WHERE (user_id, branch_id) IN (
  SELECT user_id, branch_id
  FROM duplicates
  WHERE rn > 1
);

-- 4. VERIFICAR QUE NO QUEDEN DUPLICADOS
SELECT 
  user_id,
  branch_id,
  COUNT(*) as cantidad
FROM user_branches
GROUP BY user_id, branch_id
HAVING COUNT(*) > 1;

-- 5. VER ESTADO FINAL DE TODOS LOS USUARIOS
SELECT 
  u.name as usuario,
  u.email,
  r.name as rol,
  COUNT(DISTINCT b.id) as cantidad_sedes,
  STRING_AGG(DISTINCT b.name, ', ' ORDER BY b.name) as sedes
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN user_branches ub ON u.id = ub.user_id
LEFT JOIN branches b ON ub.branch_id = b.id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.name, u.email, r.name
ORDER BY u.name;

-- 6. CREAR CONSTRAINT PARA PREVENIR DUPLICADOS FUTUROS
-- Esto asegura que no se puedan crear duplicados en el futuro
ALTER TABLE user_branches 
ADD CONSTRAINT uk_user_branch UNIQUE (user_id, branch_id);
