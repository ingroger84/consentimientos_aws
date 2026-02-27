#!/bin/bash

echo "🚀 Iniciando migración de admisiones AWS → Supabase"
echo ""

# Configuración AWS
AWS_HOST="18.206.200.237"
AWS_PORT="5432"
AWS_USER="postgres"
AWS_PASSWORD="Innova2024*"
AWS_DB="consentimientos"

# Configuración Supabase
SUPABASE_HOST="db.witvuzaarlqxkiqfiljq.supabase.co"
SUPABASE_PORT="5432"
SUPABASE_USER="postgres"
SUPABASE_PASSWORD="%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD"
SUPABASE_DB="postgres"

echo "📊 Paso 1: Contando admisiones en AWS..."
AWS_COUNT=$(PGPASSWORD="$AWS_PASSWORD" psql -h $AWS_HOST -p $AWS_PORT -U $AWS_USER -d $AWS_DB -t -c "SELECT COUNT(*) FROM admissions;")
echo "   Total en AWS: $AWS_COUNT"
echo ""

echo "📊 Paso 2: Contando admisiones en Supabase..."
SUPABASE_COUNT=$(PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -t -c "SELECT COUNT(*) FROM admissions;")
echo "   Total en Supabase: $SUPABASE_COUNT"
echo ""

echo "📋 Paso 3: Exportando admisiones de AWS..."
PGPASSWORD="$AWS_PASSWORD" psql -h $AWS_HOST -p $AWS_PORT -U $AWS_USER -d $AWS_DB -c "\COPY (SELECT id, created_at, updated_at, deleted_at, medical_record_id, admission_date, admission_type, reason, status, discharge_date, discharge_summary, closure_notes, created_by, closed_by FROM admissions ORDER BY created_at) TO '/tmp/aws_admissions.csv' WITH CSV HEADER;"
echo "   ✅ Exportado a /tmp/aws_admissions.csv"
echo ""

echo "📋 Paso 4: Exportando IDs de admisiones existentes en Supabase..."
PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -c "\COPY (SELECT id FROM admissions) TO '/tmp/supabase_admission_ids.csv' WITH CSV;"
echo "   ✅ Exportado a /tmp/supabase_admission_ids.csv"
echo ""

echo "🔍 Paso 5: Filtrando admisiones faltantes..."
# Crear script Python para filtrar
cat > /tmp/filter_admissions.py << 'EOF'
import csv

# Leer IDs existentes en Supabase
existing_ids = set()
try:
    with open('/tmp/supabase_admission_ids.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            if row:
                existing_ids.add(row[0])
except FileNotFoundError:
    pass

print(f"IDs existentes en Supabase: {len(existing_ids)}")

# Filtrar admisiones de AWS que no están en Supabase
missing_count = 0
with open('/tmp/aws_admissions.csv', 'r') as infile:
    with open('/tmp/missing_admissions.csv', 'w', newline='') as outfile:
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

print(f"Admisiones faltantes: {missing_count}")
EOF

python3 /tmp/filter_admissions.py
echo ""

echo "📥 Paso 6: Importando admisiones faltantes a Supabase..."
PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -c "\COPY admissions (id, created_at, updated_at, deleted_at, medical_record_id, admission_date, admission_type, reason, status, discharge_date, discharge_summary, closure_notes, created_by, closed_by) FROM '/tmp/missing_admissions.csv' WITH CSV HEADER;"
echo "   ✅ Importación completada"
echo ""

echo "📊 Paso 7: Verificando conteo final..."
FINAL_COUNT=$(PGPASSWORD="$SUPABASE_PASSWORD" psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -t -c "SELECT COUNT(*) FROM admissions;")
echo "   Total final en Supabase: $FINAL_COUNT"
echo ""

echo "============================================================"
echo "📊 RESUMEN DE MIGRACIÓN"
echo "============================================================"
echo "Total en AWS:              $AWS_COUNT"
echo "Total en Supabase (antes): $SUPABASE_COUNT"
echo "Total en Supabase (ahora): $FINAL_COUNT"
echo "Migradas:                  $((FINAL_COUNT - SUPABASE_COUNT))"
echo "============================================================"
echo ""
echo "✅ Migración completada"
