-- Exportar historias clínicas de AWS a un archivo CSV
\copy (SELECT id, created_at, updated_at, client_id, branch_id, admission_date, admission_type, record_number, status, is_locked, closed_at, closed_by, created_by, tenant_id FROM medical_records ORDER BY created_at) TO '/tmp/medical_records_aws.csv' WITH CSV HEADER;
