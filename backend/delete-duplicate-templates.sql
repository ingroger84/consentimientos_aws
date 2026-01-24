-- Script para eliminar plantillas duplicadas
-- Mantiene solo la plantilla más reciente de cada tipo

-- PASO 1: Ver las plantillas duplicadas antes de eliminar
SELECT 
    type,
    name,
    "isDefault",
    "isActive",
    "createdAt",
    "updatedAt",
    id
FROM consent_templates
ORDER BY type, "createdAt" DESC;

-- PASO 2: Eliminar plantillas duplicadas (mantener solo la más reciente de cada tipo)
-- IMPORTANTE: Revisa los IDs antes de ejecutar este comando

-- Para Tratamiento de Datos Personales
DELETE FROM consent_templates
WHERE type = 'data_processing'
AND id NOT IN (
    SELECT id 
    FROM consent_templates 
    WHERE type = 'data_processing'
    ORDER BY "createdAt" DESC
    LIMIT 1
);

-- Para Consentimiento de Procedimiento
DELETE FROM consent_templates
WHERE type = 'procedure'
AND id NOT IN (
    SELECT id 
    FROM consent_templates 
    WHERE type = 'procedure'
    ORDER BY "createdAt" DESC
    LIMIT 1
);

-- Para Derechos de Imagen
DELETE FROM consent_templates
WHERE type = 'image_rights'
AND id NOT IN (
    SELECT id 
    FROM consent_templates 
    WHERE type = 'image_rights'
    ORDER BY "createdAt" DESC
    LIMIT 1
);

-- PASO 3: Verificar que solo quede una plantilla de cada tipo
SELECT 
    type,
    COUNT(*) as cantidad,
    MAX("createdAt") as ultima_creacion
FROM consent_templates
GROUP BY type
ORDER BY type;

-- PASO 4: Asegurarse de que cada tipo tenga una plantilla predeterminada
UPDATE consent_templates
SET "isDefault" = true
WHERE id IN (
    SELECT DISTINCT ON (type) id
    FROM consent_templates
    ORDER BY type, "createdAt" DESC
);

-- PASO 5: Verificar el resultado final
SELECT 
    type,
    name,
    "isDefault",
    "isActive",
    "createdAt",
    id
FROM consent_templates
ORDER BY type;
