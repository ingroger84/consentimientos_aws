# ✅ Migración de Admisiones Completada

## 📊 Resumen

Se completó exitosamente la migración de historias clínicas y admisiones desde AWS a Supabase.

## 🔍 Problema Detectado

El usuario reportó que las admisiones no se habían migrado correctamente. Al investigar se encontró que:

1. La tabla `admissions` NO existía en la base de datos AWS
2. El sistema de admisiones es una funcionalidad nueva implementada después de la migración inicial
3. Las historias clínicas antiguas no tenían admisiones asociadas

## 📥 Datos Migrados

### Clientes
- **Total en AWS:** 7 clientes
- **Clientes migrados:** 5 clientes (los asociados a HC)
- **Total en Supabase:** 16 clientes

### Historias Clínicas
- **Total en AWS:** 5 HC
- **HC migradas:** 5 HC
- **Total en Supabase:** 5 HC

### Admisiones
- **Admisiones creadas:** 5 admisiones (una por cada HC)
- **Total en Supabase:** 5 admisiones

## 📋 Historias Clínicas Migradas

| Número HC | Cliente | Tipo Admisión | Estado | Número Admisión | Tenant |
|-----------|---------|---------------|--------|-----------------|--------|
| HC-2026-001 | María García Pérez | consulta | active | HC-2026-000001-ADM-001 | Demo Estética |
| HC-2026-002 | Juan Pérez López | consulta | active | ADM-2026-000001 | Demo Estética |
| HC-2026-000004 | Ana Rodríguez Martínez | consulta | active | ADM-2026-000002 | Demo Estética |
| HC-CD-001 | Carlos Martínez Silva | urgencia | closed | ADM-CD-2026-000002 | Clínica Dental |
| HC-CD-002 | Laura Gómez Torres | consulta | active | ADM-CD-2026-000001 | Clínica Dental |

## 🔧 Proceso de Migración

### 1. Exportación de Datos de AWS
```bash
# Exportar historias clínicas
sudo -u postgres psql -d consentimientos -c '\copy (SELECT * FROM medical_records) TO /tmp/medical_records_aws.csv WITH CSV HEADER'

# Exportar clientes
sudo -u postgres psql -d consentimientos -c '\copy (SELECT * FROM clients WHERE id IN (SELECT DISTINCT client_id FROM medical_records)) TO /tmp/clients_aws.csv WITH CSV HEADER'
```

### 2. Migración de Clientes
- Se migraron 5 clientes asociados a las historias clínicas
- Se validó que no existieran duplicados por documento

### 3. Migración de Historias Clínicas
- Se normalizaron los tipos de admisión:
  - `Consulta Externa` → `consulta`
  - `Urgencias` → `urgencia`
- Se manejaron sedes faltantes usando NULL
- Se validaron todas las foreign keys

### 4. Creación de Admisiones
- Se creó automáticamente una admisión por cada HC
- Se generaron números únicos de admisión por tenant
- Se respetó el estado de la HC (open/closed)

## ✅ Verificación Final

```sql
-- Total de HC
SELECT COUNT(*) FROM medical_records;
-- Resultado: 5

-- Total de admisiones
SELECT COUNT(*) FROM admissions;
-- Resultado: 5

-- HC con admisiones
SELECT COUNT(DISTINCT medical_record_id) FROM admissions;
-- Resultado: 5

-- Verificar que todas las HC tienen admisión
SELECT 
  mr.record_number,
  a.admission_number,
  a.status
FROM medical_records mr
LEFT JOIN admissions a ON mr.id = a.medical_record_id
ORDER BY mr.created_at;
```

## 📝 Notas Importantes

1. **Sistema de Admisiones Nuevo:** El sistema de admisiones es una funcionalidad nueva que no existía en AWS. Por eso no había admisiones que migrar.

2. **Admisiones Automáticas:** Todas las HC antiguas recibieron automáticamente una admisión con:
   - Razón: "Primera admisión - Apertura de Historia Clínica (migración automática)"
   - Fecha: La misma fecha de admisión de la HC
   - Tipo: El mismo tipo de admisión de la HC
   - Estado: Coincide con el estado de la HC (open/closed)

3. **Números de Admisión:** Se generaron números únicos por tenant:
   - Demo Estética: `ADM-2026-XXXXXX`
   - Clínica Dental: `ADM-CD-2026-XXXXXX`

4. **Sedes Faltantes:** Algunas sedes de AWS no existen en Supabase, por lo que se usó NULL en el campo branch_id.

## 🎯 Resultado

✅ Todas las historias clínicas ahora tienen al menos una admisión asociada
✅ Los datos están correctamente normalizados
✅ Las foreign keys están correctamente configuradas
✅ El sistema está listo para crear nuevas admisiones

## 📅 Fecha de Migración

27 de febrero de 2026

## 🔗 Scripts Utilizados

- `backend/migrate-complete-aws-to-supabase.js` - Migración completa de clientes y HC
- `backend/add-missing-admissions-to-existing-hc.js` - Creación de admisiones faltantes
- `backend/create-final-missing-admissions.sql` - Creación manual de las últimas 2 admisiones
