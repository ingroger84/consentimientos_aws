-- Verificar plantillas y sus tenants
SELECT 
    id, 
    name, 
    type, 
    "tenantId", 
    "isDefault",
    "isActive"
FROM consent_templates 
ORDER BY type;
