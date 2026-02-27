#!/bin/bash

echo "🚀 Migrando plantillas de consentimientos HC desde AWS local a Supabase"
echo ""

# Configuración AWS Local (PostgreSQL en el servidor)
AWS_LOCAL_DB="consentimientos"

# Configuración Supabase
SUPABASE_HOST="db.witvuzaarlqxkiqfiljq.supabase.co"
SUPABASE_PORT="5432"
SUPABASE_USER="postgres"
SUPABASE_PASSWORD="%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD"
SUPABASE_DB="postgres"

echo "📊 Paso 1: Verificando plantillas en AWS local..."
AWS_COUNT=$(sudo -u postgres psql -d $AWS_LOCAL_DB -t -c "SELECT COUNT(*) FROM medical_record_consent_templates;")
echo "   Plantillas en AWS local: $AWS_COUNT"
echo ""

echo "📊 Paso 2: Verificando plantillas en Supabase..."
SUPABASE_COUNT=$(PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -t -c "SELECT COUNT(*) FROM medical_record_consent_templates;")
echo "   Plantillas en Supabase: $SUPABASE_COUNT"
echo ""

echo "📋 Paso 3: Exportando plantillas de AWS local..."
sudo -u postgres psql -d $AWS_LOCAL_DB -c "\COPY (SELECT id, created_at, updated_at, deleted_at, name, description, content, category, is_active, is_default, tenant_id, created_by FROM medical_record_consent_templates ORDER BY created_at) TO '/tmp/aws_mr_templates.csv' WITH CSV HEADER;"
echo "   ✅ Exportado a /tmp/aws_mr_templates.csv"
echo ""

echo "📋 Paso 4: Mostrando muestra de plantillas..."
echo "   Primeras 5 plantillas:"
sudo -u postgres psql -d $AWS_LOCAL_DB -c "SELECT id, name, category, is_active, tenant_id FROM medical_record_consent_templates ORDER BY created_at LIMIT 5;"
echo ""

echo "📋 Paso 5: Exportando IDs de plantillas existentes en Supabase..."
PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -c "\COPY (SELECT id FROM medical_record_consent_templates) TO '/tmp/supabase_mr_template_ids.csv' WITH CSV;"
echo "   ✅ Exportado a /tmp/supabase_mr_template_ids.csv"
echo ""

echo "🔍 Paso 6: Filtrando plantillas faltantes..."
cat > /tmp/filter_mr_templates.py << 'EOF'
import csv

# Leer IDs existentes en Supabase
existing_ids = set()
try:
    with open('/tmp/supabase_mr_template_ids.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            if row:
                existing_ids.add(row[0])
except FileNotFoundError:
    pass

print(f"IDs existentes en Supabase: {len(existing_ids)}")

# Filtrar plantillas de AWS que no están en Supabase
missing_count = 0
with open('/tmp/aws_mr_templates.csv', 'r') as infile:
    with open('/tmp/missing_mr_templates.csv', 'w', newline='') as outfile:
        reader = csv.reader(infile)
        writer = csv.writer(outfile)
        
        # Copiar header
        header = next(reader)
        writer.writerow(header)
        
        # Filtrar filas
        for row in reader:
            if row and row[0] not in existing_ids:
                writer.writerow(row)
                missing_count += 1

print(f"Plantillas faltantes: {missing_count}")
EOF

python3 /tmp/filter_mr_templates.py
echo ""

echo "📥 Paso 7: Importando plantillas faltantes a Supabase..."
PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -c "\COPY medical_record_consent_templates (id, created_at, updated_at, deleted_at, name, description, content, category, is_active, is_default, tenant_id, created_by) FROM '/tmp/missing_mr_templates.csv' WITH CSV HEADER;"
echo "   ✅ Importación completada"
echo ""

echo "📊 Paso 8: Verificando conteo final..."
FINAL_COUNT=$(PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -t -c "SELECT COUNT(*) FROM medical_record_consent_templates;")
echo "   Total final en Supabase: $FINAL_COUNT"
echo ""

echo "📋 Paso 9: Mostrando plantillas migradas..."
PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -c "SELECT id, name, category, is_active, is_default FROM medical_record_consent_templates ORDER BY created_at LIMIT 10;"
echo ""

echo "============================================================"
echo "📊 RESUMEN DE MIGRACIÓN"
echo "============================================================"
echo "Total en AWS local:        $AWS_COUNT"
echo "Total en Supabase (antes): $SUPABASE_COUNT"
echo "Total en Supabase (ahora): $FINAL_COUNT"
echo "Migradas:                  $((FINAL_COUNT - SUPABASE_COUNT))"
echo "============================================================"
echo ""
echo "✅ Migración de plantillas HC completada"
