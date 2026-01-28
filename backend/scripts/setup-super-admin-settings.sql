-- Script para configurar los settings del Super Admin
-- El Super Admin tiene tenant_id = NULL

-- Verificar settings existentes del Super Admin
SELECT key, value, tenant_id 
FROM app_settings 
WHERE tenant_id IS NULL
ORDER BY key;

-- Si no existen, crear settings por defecto para Super Admin
-- Eliminar settings existentes del Super Admin (si existen)
DELETE FROM app_settings WHERE tenant_id IS NULL;

-- Insertar settings del Super Admin
INSERT INTO app_settings (key, value, tenant_id, created_at, updated_at) VALUES
-- Información de la empresa
('companyName', 'Sistema de Consentimientos', NULL, NOW(), NOW()),
('companyAddress', 'Dirección del Super Admin', NULL, NOW(), NOW()),
('companyPhone', '+57 300 123 4567', NULL, NOW(), NOW()),
('companyEmail', 'admin@sistema.com', NULL, NOW(), NOW()),
('companyWebsite', 'https://sistema.com', NULL, NOW(), NOW()),

-- Colores principales
('primaryColor', '#3B82F6', NULL, NOW(), NOW()),
('secondaryColor', '#10B981', NULL, NOW(), NOW()),
('accentColor', '#F59E0B', NULL, NOW(), NOW()),

-- Colores adicionales
('textColor', '#1F2937', NULL, NOW(), NOW()),
('linkColor', '#3B82F6', NULL, NOW(), NOW()),
('borderColor', '#D1D5DB', NULL, NOW(), NOW()),

-- Configuración de logo
('logoSize', '60', NULL, NOW(), NOW()),
('logoPosition', 'center', NULL, NOW(), NOW()),
('watermarkOpacity', '0.1', NULL, NOW(), NOW()),

-- Textos personalizables
('footerText', 'Sistema de Consentimientos - Administración', NULL, NOW(), NOW()),
('procedureTitle', 'CONSENTIMIENTO DEL PROCEDIMIENTO', NULL, NOW(), NOW()),
('dataTreatmentTitle', 'CONSENTIMIENTO PARA TRATAMIENTO DE DATOS PERSONALES', NULL, NOW(), NOW()),
('imageRightsTitle', 'CONSENTIMIENTO EXPRESO PARA UTILIZACIÓN DE IMÁGENES PERSONALES', NULL, NOW(), NOW())

ON CONFLICT (key, tenant_id) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Verificar que se crearon correctamente
SELECT key, value, tenant_id 
FROM app_settings 
WHERE tenant_id IS NULL
ORDER BY key;

-- Mostrar resumen
SELECT 
  CASE 
    WHEN tenant_id IS NULL THEN 'Super Admin'
    ELSE 'Tenant'
  END as tipo,
  COUNT(*) as total_settings
FROM app_settings
GROUP BY tenant_id IS NULL;
