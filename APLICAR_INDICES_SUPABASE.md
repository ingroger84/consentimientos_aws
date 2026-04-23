# Aplicar Índices en Supabase - v91.3

## ✅ Estado del Despliegue

- ✅ Código desplegado en servidor (PID: 1594448)
- ✅ Servicio PM2 online y funcionando
- ⏳ **PENDIENTE: Aplicar índices en base de datos**

## 🎯 Próximo Paso: Aplicar Índices

Los índices son CRÍTICOS para la optimización. Sin ellos, el dashboard seguirá lento.

### Opción 1: Supabase Dashboard (RECOMENDADO)

1. **Ir al SQL Editor de Supabase:**
   https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq/sql

2. **Copiar y pegar el siguiente SQL:**

```sql
-- =====================================================
-- MIGRACIÓN: Índices de Performance para Dashboard
-- Versión: v91.3
-- Fecha: 2026-04-22
-- =====================================================

-- Índices para tabla tenants
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_status_plan ON tenants(status, plan) WHERE deleted_at IS NULL;

-- Índices para tabla medical_records
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_id ON medical_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at);
CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_status ON medical_records(tenant_id, status);

-- Índices para tabla clients
CREATE INDEX IF NOT EXISTS idx_clients_tenant_id ON clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_tenant_created ON clients(tenant_id, created_at);

-- Índices para tabla consents
CREATE INDEX IF NOT EXISTS idx_consents_tenant_id ON consents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consents_created_at ON consents(created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consents_tenant_created ON consents(tenant_id, created_at) WHERE deleted_at IS NULL;

-- Índices para tabla users
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at) WHERE deleted_at IS NULL;

-- Índices para tabla branches
CREATE INDEX IF NOT EXISTS idx_branches_tenant_id ON branches(tenant_id) WHERE deleted_at IS NULL;

-- Índices para tabla services
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id) WHERE deleted_at IS NULL;

-- Índices para tabla consent_templates
CREATE INDEX IF NOT EXISTS idx_consent_templates_active ON consent_templates(is_active);

-- Índices para tabla mr_consent_templates
CREATE INDEX IF NOT EXISTS idx_mr_consent_templates_active ON mr_consent_templates(is_active);

-- Índices para tabla invoices
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status_created ON invoices(status, created_at);

-- Analizar tablas
ANALYZE tenants;
ANALYZE medical_records;
ANALYZE clients;
ANALYZE consents;
ANALYZE users;
ANALYZE branches;
ANALYZE services;
ANALYZE consent_templates;
ANALYZE mr_consent_templates;
ANALYZE invoices;
```

3. **Ejecutar el script** (botón "Run" o Ctrl+Enter)

4. **Verificar que se crearon los índices:**

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Deberías ver aproximadamente **24 índices**.

### Opción 2: Desde tu Máquina Local

```powershell
# Configurar password
$env:PGPASSWORD="%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD"

# Ejecutar script
psql -h db.witvuzaarlqxkiqfiljq.supabase.co -p 5432 -U postgres -d postgres -f backend/migrations/add-performance-indexes.sql
```

### Opción 3: Desde el Servidor AWS

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ejecutar script
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql -h db.witvuzaarlqxkiqfiljq.supabase.co -p 5432 -U postgres -d postgres -f /home/ubuntu/add-performance-indexes.sql
```

## ⏱️ Tiempo Estimado

- Creación de índices: 2-5 minutos (dependiendo del tamaño de las tablas)
- ANALYZE: 30 segundos - 1 minuto

**Total: 3-6 minutos**

## ✅ Verificación Post-Aplicación

### 1. Verificar Índices Creados

En Supabase SQL Editor:

```sql
SELECT COUNT(*) as total_indices
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';
```

Resultado esperado: **24 índices**

### 2. Ver Detalle de Índices

```sql
SELECT 
    tablename,
    COUNT(*) as num_indices
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
GROUP BY tablename
ORDER BY tablename;
```

Resultado esperado:
```
tablename              | num_indices
-----------------------+-------------
branches               | 1
clients                | 3
consent_templates      | 1
consents               | 3
invoices               | 4
medical_records        | 4
mr_consent_templates   | 1
services               | 1
tenants                | 4
users                  | 2
```

### 3. Probar Dashboard

1. Abrir: https://consentimientos.datagree.co
2. Login como Super Admin
3. Ir al Dashboard
4. **Observar tiempo de carga** (debería ser < 2 segundos)

### 4. Ver Logs del Servidor

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 logs datagree | grep -i "stats"
```

Buscar mensajes:
- ✅ "Calculating fresh stats..."
- ✅ "Stats calculated in XXXms" (debería ser < 2000ms)
- ✅ "Returning cached stats (age: XXs)"

## 📊 Resultados Esperados

### Sin Índices (Estado Actual):
- ⏱️ Tiempo de carga: 5-15 segundos
- 🐌 Queries lentas
- 😞 Mala experiencia de usuario

### Con Índices (Después de Aplicar):
- ⏱️ Primera carga: 500ms - 2 segundos ⚡
- ⏱️ Cargas subsecuentes: < 10ms (caché) 🚀
- 😊 Excelente experiencia de usuario

## 🔍 Monitoreo

### Ver Uso de Índices

Después de usar el dashboard varias veces, verifica que los índices se estén usando:

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC
LIMIT 20;
```

Los índices con `scans > 0` están siendo utilizados.

### Ver Queries Lentas

Si tienes `pg_stat_statements` habilitado:

```sql
SELECT 
    query,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%tenants%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## 🆘 Troubleshooting

### Problema: "relation does not exist"

Alguna tabla no existe. Verifica que todas las tablas estén creadas:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Problema: "permission denied"

El usuario no tiene permisos. En Supabase, el usuario `postgres` debería tener todos los permisos.

### Problema: Índices no mejoran performance

1. Verifica que los índices se crearon: `SELECT COUNT(*) FROM pg_indexes WHERE indexname LIKE 'idx_%';`
2. Verifica que se estén usando: `SELECT * FROM pg_stat_user_indexes WHERE indexname LIKE 'idx_%';`
3. Ejecuta ANALYZE manualmente: `ANALYZE tenants; ANALYZE medical_records;`

## 📝 Checklist

- [ ] Abrir Supabase SQL Editor
- [ ] Copiar y pegar script de índices
- [ ] Ejecutar script (esperar 3-6 minutos)
- [ ] Verificar que se crearon 24 índices
- [ ] Probar dashboard de Super Admin
- [ ] Verificar tiempo de carga (< 2 segundos)
- [ ] Ver logs del servidor
- [ ] Confirmar mensajes "Stats calculated in XXXms"
- [ ] Recargar dashboard (debería ser instantáneo desde caché)

## 🎉 Siguiente Paso

Una vez aplicados los índices:

1. Probar el dashboard
2. Verificar mejora de performance
3. Documentar resultados reales
4. Monitorear por 24 horas

---

**IMPORTANTE:** Los índices son ESENCIALES para la optimización. Sin ellos, el código optimizado no tendrá el impacto esperado.

**Tiempo total estimado:** 10 minutos (aplicar índices + verificar)
