-- Exportar plantillas de consentimientos de HC con todas las columnas
\copy (SELECT id, name, description, content, category, available_variables::text, is_active, is_default, requires_signature, tenant_id, created_by, created_at, updated_at, deleted_at FROM medical_record_consent_templates WHERE deleted_at IS NULL ORDER BY created_at) TO '/tmp/mr_templates_aws_complete.csv' WITH CSV HEADER;
