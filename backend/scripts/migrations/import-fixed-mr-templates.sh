#!/bin/bash
# Importar plantillas corregidas a Supabase

echo "Importando plantillas corregidas..."
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "\copy medical_record_consent_templates (id, name, description, content, category, available_variables, is_active, is_default, requires_signature, tenant_id, created_by, created_at, updated_at, deleted_at) FROM '/tmp/missing_mr_templates_fixed.csv' WITH CSV HEADER"

echo ""
echo "=== VERIFICACIÓN FINAL ==="
echo ""
echo "Total plantillas en Supabase:"
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "SELECT COUNT(*) as total_plantillas FROM medical_record_consent_templates WHERE deleted_at IS NULL;"

echo ""
echo "Plantillas por categoría:"
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "SELECT category, COUNT(*) as total FROM medical_record_consent_templates WHERE deleted_at IS NULL GROUP BY category ORDER BY category;"

echo ""
echo "Plantillas por tenant:"
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "SELECT COALESCE(t.name, 'Sin tenant (globales)') as tenant_name, COUNT(*) as total FROM medical_record_consent_templates mrt LEFT JOIN tenants t ON mrt.tenant_id = t.id WHERE mrt.deleted_at IS NULL GROUP BY t.name ORDER BY total DESC;"
