-- Script para limpiar datos duplicados del sistema multi-tenant

-- 1. Eliminar sedes duplicadas (mantener solo las primeras 2)
DELETE FROM branches 
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, "tenantId" ORDER BY created_at) as rn
    FROM branches
  ) t
  WHERE rn = 1
);

-- 2. Eliminar servicios duplicados (mantener solo los primeros 2)
DELETE FROM services 
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, "tenantId" ORDER BY created_at) as rn
    FROM services
  ) t
  WHERE rn = 1
);

-- 3. Eliminar preguntas duplicadas
DELETE FROM questions 
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY "questionText", "serviceId" ORDER BY created_at) as rn
    FROM questions
  ) t
  WHERE rn = 1
);

-- 4. Verificar resultados
SELECT 'Sedes restantes:' as info, COUNT(*) as count FROM branches WHERE deleted_at IS NULL
UNION ALL
SELECT 'Servicios restantes:', COUNT(*) FROM services WHERE deleted_at IS NULL
UNION ALL
SELECT 'Preguntas restantes:', COUNT(*) FROM questions WHERE deleted_at IS NULL;
