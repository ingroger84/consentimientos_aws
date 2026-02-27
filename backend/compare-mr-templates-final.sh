#!/bin/bash
# Comparación final de plantillas entre AWS y Supabase

echo "=== COMPARACIÓN FINAL ==="
echo ""
echo "AWS Local:"
sudo -u postgres psql -d consentimientos -c "SELECT category, COUNT(*) as total FROM medical_record_consent_templates WHERE deleted_at IS NULL GROUP BY category ORDER BY category;"

echo ""
echo "Supabase:"
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "SELECT category, COUNT(*) as total FROM medical_record_consent_templates WHERE deleted_at IS NULL GROUP BY category ORDER BY category;"

echo ""
echo "=== PLANTILLAS ÚNICAS EN SUPABASE (no en AWS) ==="
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "SELECT id, name, category FROM medical_record_consent_templates WHERE deleted_at IS NULL AND id NOT IN (SELECT id FROM (SELECT unnest(string_to_array('$(sudo -u postgres psql -d consentimientos -t -c "SELECT string_agg(id::text, ',') FROM medical_record_consent_templates WHERE deleted_at IS NULL")' , ',')) as id) as aws_ids) ORDER BY category, name;"
