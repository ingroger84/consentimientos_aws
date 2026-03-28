-- Buscar TODOS los constraints e índices relacionados con medical_records

-- 1. Todos los constraints
SELECT 
    'CONSTRAINT' as type,
    conname AS name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'medical_records'::regclass
ORDER BY conname;

-- 2. Todos los índices
SELECT 
    'INDEX' as type,
    indexname AS name,
    indexdef AS definition
FROM pg_indexes
WHERE tablename = 'medical_records'
ORDER BY indexname;

-- 3. Buscar específicamente el constraint problemático
SELECT 
    'PROBLEMATIC' as type,
    conname AS name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname = 'UQ_1dc1a9b704ff46bcaf4bf512039';

-- 4. Buscar índices con ese nombre
SELECT 
    'INDEX_PROBLEMATIC' as type,
    indexname AS name,
    indexdef AS definition
FROM pg_indexes
WHERE indexname = 'UQ_1dc1a9b704ff46bcaf4bf512039';
