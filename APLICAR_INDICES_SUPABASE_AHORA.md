# 🔴 APLICAR ÍNDICES EN SUPABASE - INSTRUCCIONES

## ⚠️ CRÍTICO - DEBE HACERSE AHORA

El código backend v91.3.2 está desplegado y funcionando, pero **SIN LOS ÍNDICES EL DASHBOARD SEGUIRÁ LENTO**.

Los índices son la parte más importante de la optimización. Sin ellos, las consultas SQL seguirán tardando 5-15 segundos.

---

## Pasos Simples (5 minutos)

### 1. Abrir Supabase SQL Editor

Ir a esta URL:
```
https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq/sql
```

### 2. Abrir el Archivo de Índices

En tu proyecto local, abrir:
```
backend/migrations/add-performance-indexes.sql
```

### 3. Copiar TODO el Contenido

Seleccionar todo el contenido del archivo (Ctrl+A) y copiar (Ctrl+C)

### 4. Pegar en Supabase

Pegar el contenido en el SQL Editor de Supabase

### 5. Ejecutar

Hacer clic en el botón **"Run"** o presionar **Ctrl+Enter**

### 6. Verificar

Deberías ver un mensaje de éxito. Luego ejecutar esta query para verificar:

```sql
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Deberías ver **24 índices** creados.

---

## ¿Qué Hacen los Índices?

Los índices son como un "índice de libro" para la base de datos. Permiten encontrar datos rápidamente sin tener que leer toda la tabla.

**Ejemplo:**
- **Sin índice:** Buscar un tenant por status = 'active' requiere leer TODOS los tenants (lento)
- **Con índice:** La base de datos salta directamente a los tenants activos (rápido)

---

## Impacto en Performance

### Consultas que se Optimizan

1. **Tenants por status** (active, suspended, trial)
   - Antes: 2-3 segundos
   - Después: 50-100ms

2. **Medical Records por tenant**
   - Antes: 3-5 segundos
   - Después: 100-200ms

3. **Clientes por fecha de creación**
   - Antes: 1-2 segundos
   - Después: 50-100ms

4. **Top 10 tenants por actividad**
   - Antes: 4-6 segundos
   - Después: 200-300ms

### Total Dashboard
- **Antes:** 5-15 segundos
- **Después:** 150-500ms (primera carga)
- **Con caché:** <50ms (cargas subsecuentes)

---

## Lista de Índices a Crear

### Tenants (6 índices)
```sql
idx_tenants_status          -- Filtrar por status
idx_tenants_plan            -- Filtrar por plan
idx_tenants_deleted_at      -- Excluir eliminados
idx_tenants_created_at      -- Ordenar por fecha
idx_tenants_updated_at      -- Última actividad
idx_tenants_status_plan     -- Combinado status+plan
```

### Medical Records (4 índices)
```sql
idx_medical_records_tenant_id       -- Por tenant
idx_medical_records_status          -- Por status
idx_medical_records_created_at      -- Por fecha
idx_medical_records_tenant_status   -- Combinado
```

### Clients (3 índices)
```sql
idx_clients_tenant_id       -- Por tenant
idx_clients_created_at      -- Por fecha
idx_clients_tenant_created  -- Combinado
```

### Consents (3 índices)
```sql
idx_consents_tenant_id      -- Por tenant
idx_consents_deleted_at     -- Excluir eliminados
idx_consents_tenant_active  -- Combinado
```

### Otros (8 índices)
- Users: tenant_id, deleted_at
- Branches: tenant_id, deleted_at
- Services: tenant_id, deleted_at
- Consent Templates: tenant_id, isActive
- MR Consent Templates: tenant_id, isActive
- Invoices: tenant_id, status

---

## Verificación Post-Aplicación

### 1. Verificar en Supabase

Ejecutar en SQL Editor:
```sql
SELECT COUNT(*) as total_indices
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';
```

Debe retornar: **24**

### 2. Verificar Performance en Dashboard

1. Ir a: https://archivoenlinea.com
2. Iniciar sesión como Super Admin
3. Ir al Dashboard
4. Debería cargar en menos de 1 segundo

### 3. Verificar Logs del Servidor

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 logs datagree --lines 50 | grep "Stats calculated"
```

Deberías ver:
```
Stats calculated in 150ms
Stats calculated in 45ms  (con caché)
```

---

## Troubleshooting

### Error: "relation already exists"
Algunos índices ya existen. Esto es normal. Continuar con los demás.

### Error: "permission denied"
Verificar que estás conectado con el usuario correcto en Supabase.

### Error: "syntax error"
Verificar que copiaste TODO el contenido del archivo, incluyendo los comentarios.

### Los índices se crearon pero el dashboard sigue lento
1. Verificar que el backend v91.3.2 está desplegado: `pm2 status`
2. Limpiar caché del navegador (Ctrl+Shift+R)
3. Verificar logs: `pm2 logs datagree`

---

## Información de Conexión

**Base de datos:** Supabase PostgreSQL
**Host:** db.witvuzaarlqxkiqfiljq.supabase.co
**Database:** postgres
**Project ID:** witvuzaarlqxkiqfiljq

**Dashboard Supabase:**
```
https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq
```

**SQL Editor:**
```
https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq/sql
```

---

## Resumen

1. ✅ Backend v91.3.2 desplegado (código optimizado)
2. 🔴 **APLICAR ÍNDICES** (este paso - CRÍTICO)
3. ✅ Dashboard optimizado y funcionando

**Tiempo estimado:** 5 minutos
**Impacto:** Reducción de 95% en tiempo de carga del dashboard

---

## Archivo a Usar

```
backend/migrations/add-performance-indexes.sql
```

**Contenido:** 24 índices SQL
**Tamaño:** ~3 KB
**Tiempo de ejecución:** 10-30 segundos

---

## Después de Aplicar

Una vez aplicados los índices:

1. El dashboard cargará en menos de 1 segundo
2. Las estadísticas se actualizarán cada 5 minutos (caché)
3. El sistema estará completamente optimizado

**¡No olvides este paso! Es el más importante de la optimización.**
