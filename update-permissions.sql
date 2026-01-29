-- Actualizar permisos de todos los roles
-- Fecha: 2026-01-28

-- Super Administrador
UPDATE roles 
SET permissions = 'view_dashboard,view_global_stats,view_consents,create_consents,edit_consents,delete_consents,sign_consents,resend_consent_email,view_users,create_users,edit_users,delete_users,change_passwords,view_roles,edit_roles,view_branches,create_branches,edit_branches,delete_branches,view_services,create_services,edit_services,delete_services,view_questions,create_questions,edit_questions,delete_questions,view_clients,create_clients,edit_clients,delete_clients,view_templates,create_templates,edit_templates,delete_templates,view_mr_consent_templates,create_mr_consent_templates,edit_mr_consent_templates,delete_mr_consent_templates,generate_mr_consents,view_mr_consents,delete_mr_consents,view_medical_records,create_medical_records,edit_medical_records,delete_medical_records,close_medical_records,sign_medical_records,export_medical_records,view_settings,edit_settings,manage_tenants'
WHERE type = 'super_admin';

-- Administrador General
UPDATE roles 
SET permissions = 'view_dashboard,view_consents,create_consents,edit_consents,delete_consents,sign_consents,resend_consent_email,view_users,create_users,edit_users,delete_users,change_passwords,view_roles,edit_roles,view_branches,create_branches,edit_branches,delete_branches,view_services,create_services,edit_services,delete_services,view_questions,create_questions,edit_questions,delete_questions,view_clients,create_clients,edit_clients,delete_clients,view_templates,create_templates,edit_templates,delete_templates,view_mr_consent_templates,create_mr_consent_templates,edit_mr_consent_templates,delete_mr_consent_templates,generate_mr_consents,view_mr_consents,delete_mr_consents,view_medical_records,create_medical_records,edit_medical_records,delete_medical_records,close_medical_records,sign_medical_records,export_medical_records,view_settings,edit_settings,configure_email,view_invoices,pay_invoices'
WHERE type = 'ADMIN_GENERAL';

-- Administrador de Sede
UPDATE roles 
SET permissions = 'view_dashboard,view_consents,create_consents,edit_consents,delete_consents,sign_consents,resend_consent_email,view_users,create_users,edit_users,view_branches,view_services,view_questions,view_clients,create_clients,edit_clients,view_medical_records,create_medical_records,edit_medical_records,sign_medical_records,view_settings'
WHERE type = 'ADMIN_SEDE';

-- Operador
UPDATE roles 
SET permissions = 'view_dashboard,view_consents,create_consents,sign_consents,resend_consent_email,view_services,view_branches,view_clients,create_clients,view_medical_records,create_medical_records,sign_medical_records'
WHERE type = 'OPERADOR';

-- Verificar los cambios
SELECT 
    name,
    type,
    LENGTH(permissions) as permissions_length,
    (LENGTH(permissions) - LENGTH(REPLACE(permissions, ',', '')) + 1) as permissions_count
FROM roles
ORDER BY name;

-- Mostrar preview de permisos
SELECT 
    name,
    type,
    LEFT(permissions, 150) as permissions_preview
FROM roles
ORDER BY name;
