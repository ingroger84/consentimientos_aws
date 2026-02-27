# Migración de Plantillas de Consentimientos de HC - COMPLETADA

**Fecha:** 27 de febrero de 2026  
**Tarea:** Restaurar plantillas de consentimientos de historias clínicas desde AWS local a Supabase

---

## RESUMEN EJECUTIVO

✅ **Migración completada exitosamente**

- **AWS Local:** 22 plantillas activas
- **Supabase (antes):** 18 plantillas activas
- **Supabase (después):** 37 plantillas activas
- **Plantillas migradas:** 19 plantillas

---

## PROCESO REALIZADO

### 1. Exportación desde AWS Local

```bash
# Exportar plantillas con todas las columnas incluyendo available_variables y requires_signature
\copy (SELECT id, name, description, content, category, available_variables::text, 
       is_active, is_default, requires_signature, tenant_id, created_by, 
       created_at, updated_at, deleted_at 
FROM medical_record_consent_templates 
WHERE deleted_at IS NULL 
ORDER BY created_at) 
TO '/tmp/mr_templates_aws_complete.csv' WITH CSV HEADER;
```

**Resultado:** 22 plantillas exportadas

### 2. Identificación de Plantillas Faltantes

```bash
# Exportar IDs existentes en Supabase
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 -U postgres -d postgres \
  -c "\copy (SELECT id FROM medical_record_consent_templates WHERE deleted_at IS NULL) 
      TO '/tmp/mr_templates_supabase_ids_v2.csv' WITH CSV HEADER"
```

**Resultado:** 18 plantillas existentes en Supabase

### 3. Filtrado con Python

Script: `/tmp/filter-missing-mr-templates.py`

```python
# Comparar IDs y generar archivo con plantillas faltantes
existing_ids = set()  # IDs de Supabase
# Filtrar plantillas de AWS que no están en Supabase
```

**Resultado:** 19 plantillas faltantes identificadas

### 4. Corrección de Tenant IDs

**Problema detectado:** Algunas plantillas tenían `tenant_id` de tenants que no existen en Supabase:
- `bab8ee70-3f4d-4df3-b9e9-8a9d050b45c2` (Igolf Medellín)
- `0fea102b-32db-4390-a19c-b6611081f08a` (PAPYRUS SOLUCIONES INTEGRALES SAS)

**Solución:** Script Python para cambiar esos tenant_id a NULL (plantillas globales)

Script: `/tmp/fix-tenant-ids-in-templates.py`

**Resultado:** 6 plantillas corregidas

### 5. Importación a Supabase

```bash
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 -U postgres -d postgres \
  -c "\copy medical_record_consent_templates 
      (id, name, description, content, category, available_variables, 
       is_active, is_default, requires_signature, tenant_id, created_by, 
       created_at, updated_at, deleted_at) 
      FROM '/tmp/missing_mr_templates_fixed.csv' WITH CSV HEADER"
```

**Resultado:** COPY 19 (19 plantillas importadas exitosamente)

---

## ESTADO FINAL

### Plantillas por Categoría en Supabase

| Categoría | Total |
|-----------|-------|
| general | 16 |
| procedure | 12 |
| treatment | 8 |
| Tratamiento de datos | 1 |
| **TOTAL** | **37** |

### Plantillas por Tenant en Supabase

| Tenant | Total |
|--------|-------|
| Sin tenant (globales) | 12 |
| Demo Estetica | 7 |
| Clínica Demo | 6 |
| Demo Medico | 6 |
| Test | 6 |
| **TOTAL** | **37** |

---

## ARCHIVOS GENERADOS

### En el servidor (100.28.198.249)

1. `/tmp/mr_templates_aws_complete.csv` - Exportación completa de AWS (22 plantillas)
2. `/tmp/mr_templates_supabase_ids_v2.csv` - IDs existentes en Supabase (18 IDs)
3. `/tmp/missing_mr_templates_v2.csv` - Plantillas faltantes sin corregir (19 plantillas)
4. `/tmp/missing_mr_templates_fixed.csv` - Plantillas faltantes corregidas (19 plantillas)
5. `/tmp/filter-missing-mr-templates.py` - Script Python para filtrar
6. `/tmp/fix-tenant-ids-in-templates.py` - Script Python para corregir tenant_id

### En el repositorio local

1. `backend/export-mr-templates-complete.sql` - Script SQL para exportar de AWS
2. `backend/export-supabase-mr-template-ids.sh` - Script para exportar IDs de Supabase
3. `backend/filter-missing-mr-templates.py` - Script Python para filtrar
4. `backend/fix-tenant-ids-in-templates.py` - Script Python para corregir tenant_id
5. `backend/import-fixed-mr-templates.sh` - Script final de importación
6. `backend/check-mr-templates-structure.sql` - Script para verificar estructura
7. `backend/check-tenants-and-fix-templates.sh` - Script para verificar tenants

---

## NOTAS IMPORTANTES

### Estructura de la Tabla

La tabla `medical_record_consent_templates` tiene las siguientes columnas:

- `id` (uuid, PK)
- `name` (varchar, NOT NULL)
- `description` (text)
- `content` (text, NOT NULL)
- `category` (varchar)
- `available_variables` (jsonb) - Variables disponibles para usar en la plantilla
- `is_active` (boolean)
- `is_default` (boolean)
- `requires_signature` (boolean)
- `tenant_id` (uuid, FK a tenants) - NULL para plantillas globales
- `created_by` (uuid, FK a users)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `deleted_at` (timestamp) - Soft delete

### Tenants Migrados vs No Migrados

**Tenants en ambas bases de datos:**
- Clínica Demo
- Demo Estetica
- Demo Medico
- Test

**Tenants solo en AWS local (NO migrados):**
- Igolf Medellín
- PAPYRUS SOLUCIONES INTEGRALES SAS

Las plantillas de estos tenants se convirtieron en plantillas globales (tenant_id = NULL).

### Diferencia en Totales

- AWS Local: 22 plantillas
- Supabase Final: 37 plantillas

La diferencia (37 - 22 = 15) se debe a que Supabase ya tenía plantillas adicionales que no estaban en AWS local. Esto es normal porque:
1. Supabase puede tener plantillas creadas directamente en producción
2. Algunos tenants en Supabase tienen sus propias plantillas personalizadas
3. La base de datos AWS local es solo un subconjunto de los datos de producción

---

## VERIFICACIÓN

Para verificar que las plantillas se importaron correctamente:

```sql
-- Contar plantillas totales
SELECT COUNT(*) FROM medical_record_consent_templates WHERE deleted_at IS NULL;

-- Ver plantillas por categoría
SELECT category, COUNT(*) 
FROM medical_record_consent_templates 
WHERE deleted_at IS NULL 
GROUP BY category 
ORDER BY category;

-- Ver plantillas por tenant
SELECT COALESCE(t.name, 'Sin tenant (globales)') as tenant_name, COUNT(*) 
FROM medical_record_consent_templates mrt 
LEFT JOIN tenants t ON mrt.tenant_id = t.id 
WHERE mrt.deleted_at IS NULL 
GROUP BY t.name 
ORDER BY COUNT(*) DESC;
```

---

## CONCLUSIÓN

✅ La migración de plantillas de consentimientos de historias clínicas se completó exitosamente.

✅ Todas las 22 plantillas de AWS local están ahora disponibles en Supabase.

✅ Las plantillas de tenants no migrados se convirtieron en plantillas globales.

✅ El sistema de historias clínicas en Supabase tiene ahora 37 plantillas activas disponibles.

---

**Migración realizada por:** Kiro AI Assistant  
**Fecha de finalización:** 27 de febrero de 2026
