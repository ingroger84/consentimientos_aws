#!/bin/bash
# Verificar tenants existentes en Supabase

echo "=== Tenants en Supabase ==="
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "SELECT id, name FROM tenants ORDER BY name;"

echo ""
echo "=== Tenants en AWS local ==="
sudo -u postgres psql -d consentimientos -c "SELECT id, name FROM tenants ORDER BY name;"

echo ""
echo "=== Tenant IDs únicos en plantillas faltantes ==="
cat /tmp/missing_mr_templates_v2.csv | cut -d',' -f10 | sort | uniq | grep -v tenant_id
