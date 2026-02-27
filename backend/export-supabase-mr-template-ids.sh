#!/bin/bash
# Exportar IDs de plantillas existentes en Supabase

PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "\copy (SELECT id FROM medical_record_consent_templates WHERE deleted_at IS NULL) TO '/tmp/mr_templates_supabase_ids_v2.csv' WITH CSV HEADER"

echo "IDs exportados a /tmp/mr_templates_supabase_ids_v2.csv"
