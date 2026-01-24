-- Eliminar plantillas duplicadas de Tratamiento de Datos Personales
-- Mantener solo una (la primera en la lista)

DELETE FROM consent_templates 
WHERE type = 'data_treatment' 
AND id IN (
    '508cee0b-91ca-4fe8-b951-0752481808c5',
    '1315b323-8f7e-4c22-9d66-bce07fa65fd7',
    'c653cced-b415-4b28-bccc-39314d30595c'
);

-- Verificar el resultado
SELECT 
    type,
    name,
    "isDefault",
    "isActive",
    "createdAt",
    id
FROM consent_templates
ORDER BY type;
