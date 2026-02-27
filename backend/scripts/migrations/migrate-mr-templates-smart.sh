#!/bin/bash

echo "🚀 Migración inteligente de plantillas HC desde AWS a Supabase"
echo ""

# Configuración
AWS_LOCAL_DB="consentimientos"
SUPABASE_HOST="db.witvuzaarlqxkiqfiljq.supabase.co"
SUPABASE_PORT="5432"
SUPABASE_USER="postgres"
SUPABASE_PASSWORD="%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD"
SUPABASE_DB="postgres"

echo "📊 Paso 1: Verificando tenants en ambas bases de datos..."
echo ""
echo "   Tenants en AWS local:"
sudo -u postgres psql -d $AWS_LOCAL_DB -c "SELECT id, name FROM tenants ORDER BY created_at;"
echo ""
echo "   Tenants en Supabase:"
PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -c "SELECT id, name FROM tenants ORDER BY created_at;"
echo ""

echo "📊 Paso 2: Contando plantillas..."
AWS_COUNT=$(sudo -u postgres psql -d $AWS_LOCAL_DB -t -c "SELECT COUNT(*) FROM medical_record_consent_templates;")
SUPABASE_COUNT=$(PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -t -c "SELECT COUNT(*) FROM medical_record_consent_templates;")
echo "   AWS local: $AWS_COUNT plantillas"
echo "   Supabase: $SUPABASE_COUNT plantillas"
echo ""

echo "📋 Paso 3: Analizando plantillas por tenant_id..."
echo "   Plantillas en AWS local por tenant:"
sudo -u postgres psql -d $AWS_LOCAL_DB -c "SELECT tenant_id, COUNT(*) as count FROM medical_record_consent_templates GROUP BY tenant_id ORDER BY count DESC;"
echo ""

echo "📋 Paso 4: Exportando solo plantillas con tenant_id NULL (plantillas globales)..."
sudo -u postgres psql -d $AWS_LOCAL_DB -c "\COPY (SELECT id, created_at, updated_at, deleted_at, name, description, content, category, is_active, is_default, tenant_id, created_by FROM medical_record_consent_templates WHERE tenant_id IS NULL ORDER BY created_at) TO '/tmp/aws_mr_templates_global.csv' WITH CSV HEADER;"
echo "   ✅ Exportado a /tmp/aws_mr_templates_global.csv"
echo ""

GLOBAL_COUNT=$(sudo -u postgres psql -d $AWS_LOCAL_DB -t -c "SELECT COUNT(*) FROM medical_record_consent_templates WHERE tenant_id IS NULL;")
echo "   Total plantillas globales: $GLOBAL_COUNT"
echo ""

echo "📋 Paso 5: Exportando IDs existentes en Supabase..."
PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -c "\COPY (SELECT id FROM medical_record_consent_templates) TO '/tmp/supabase_mr_ids.csv' WITH CSV;"
echo ""

echo "🔍 Paso 6: Filtrando plantillas faltantes..."
cat > /tmp/filter_global_templates.py << 'EOF'
import csv

# Leer IDs existentes
existing = set()
try:
    with open('/tmp/supabase_mr_ids.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            if row:
                existing.add(row[0])
except FileNotFoundError:
    pass

print(f"IDs existentes en Supabase: {len(existing)}")

# Filtrar faltantes
missing = 0
with open('/tmp/aws_mr_templates_global.csv', 'r') as infile:
    with open('/tmp/missing_global_templates.csv', 'w', newline='') as outfile:
        reader = csv.reader(infile)
        writer = csv.writer(outfile)
        
        header = next(reader)
        writer.writerow(header)
        
        for row in reader:
            if row and row[0] not in existing:
                writer.writerow(row)
                missing += 1
                print(f"  Faltante: {row[4]} (ID: {row[0]})")

print(f"\nTotal plantillas faltantes: {missing}")
EOF

python3 /tmp/filter_global_templates.py
echo ""

echo "📥 Paso 7: Importando plantillas globales faltantes..."
PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -c "\COPY medical_record_consent_templates (id, created_at, updated_at, deleted_at, name, description, content, category, is_active, is_default, tenant_id, created_by) FROM '/tmp/missing_global_templates.csv' WITH CSV HEADER;"
echo ""

echo "📊 Paso 8: Verificando resultado final..."
FINAL_COUNT=$(PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -t -c "SELECT COUNT(*) FROM medical_record_consent_templates;")
echo "   Total final en Supabase: $FINAL_COUNT"
echo ""

echo "📋 Paso 9: Mostrando todas las plantillas en Supabase..."
PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -c "SELECT id, name, category, is_active, is_default, CASE WHEN tenant_id IS NULL THEN 'Global' ELSE 'Tenant' END as scope FROM medical_record_consent_templates ORDER BY is_default DESC, name;"
echo ""

echo "============================================================"
echo "📊 RESUMEN FINAL"
echo "============================================================"
echo "AWS local (total):         $AWS_COUNT"
echo "AWS local (globales):      $GLOBAL_COUNT"
echo "Supabase (antes):          $SUPABASE_COUNT"
echo "Supabase (ahora):          $FINAL_COUNT"
echo "Migradas:                  $((FINAL_COUNT - SUPABASE_COUNT))"
echo "============================================================"
echo ""
echo "✅ Migración completada"
