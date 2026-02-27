#!/bin/bash
# Script para importar plantillas de consentimientos de HC a Supabase

PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "\copy medical_record_consent_templates (id, name, description, content, category, available_variables, is_active, is_default, requires_signature, tenant_id, created_by, created_at, updated_at, deleted_at) FROM '/tmp/missing_mr_templates.csv' WITH CSV HEADER"

echo ""
echo "Verificando conteo final..."
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "SELECT COUNT(*) as total_plantillas FROM medical_record_consent_templates WHERE deleted_at IS NULL;"
