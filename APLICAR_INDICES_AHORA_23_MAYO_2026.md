# 🚀 APLICACIÓN DE ÍNDICES EN SUPABASE - 23 Mayo 2026

**Fecha:** 23 de Mayo 2026, 8:30 PM  
**Estado:** ⏳ EN PROCESO

---

## 📋 RESUMEN

Voy a aplicar 24 índices en la base de datos Supabase para optimizar el rendimiento del dashboard y las consultas principales del sistema.

---

## 🎯 OBJETIVO

Reducir el tiempo de carga del dashboard de 5-15 segundos a menos de 500ms mediante la creación de índices estratégicos en las tablas principales.

---

## 📊 ÍNDICES A CREAR

### Tenants (4 índices)
1. `idx_tenants_status` - Filtrar por status (active, suspended, trial)
2. `idx_tenants_plan` - Filtrar por plan
3. `idx_tenants_created_at` - Ordenar por fecha de creación
4. `idx_tenants_status_plan` - Índice compuesto status+plan

### Medical Records (4 índices)
5. `idx_medical_records_status` - Filtrar por status
6. `idx_medical_records_tenant_id` - Filtrar por tenant
7. `idx_medical_records_created_at` - Ordenar por fecha
8. `idx_medical_records_tenant_status` - Índice compuesto tenant+status

### Clients (3 índices)
9. `idx_clients_tenant_id` - Filtrar por tenant
10. `idx_clients_created_at` - Ordenar por fecha
11. `idx_clients_tenant_created` - Índice compuesto tenant+fecha

### Consents (3 índices)
12. `idx_consents_tenant_id` - Filtrar por tenant
13. `idx_consents_created_at` - Ordenar por fecha
14. `idx_consents_tenant_created` - Índice compuesto tenant+fecha

### Users (2 índices)
15. `idx_users_tenant_id` - Filtrar por tenant
16. `idx_users_created_at` - Ordenar por fecha

### Branches (1 índice)
17. `idx_branches_tenant_id` - Filtrar por tenant

### Services (1 índice)
18. `idx_services_tenant_id` - Filtrar por tenant

### Consent Templates (1 índice)
19. `idx_consent_templates_active` - Filtrar por activas

### MR Consent Templates (1 índice)
20. `idx_mr_consent_templates_active` - Filtrar por activas

### Invoices (4 índices)
21. `idx_invoices_status` - Filtrar por status
22. `idx_invoices_created_at` - Ordenar por fecha
23. `idx_invoices_due_date` - Ordenar por fecha de vencimiento
24. `idx_invoices_status_created` - Índice compuesto status+fecha

---

## 🔧 PROCESO DE APLICACIÓN

### Paso 1: Conectar a Supabase

```bash
# Configurar password
$env:PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD'

# Conectar a la base de datos
psql -h db.witvuzaarlqxkiqfiljq.supabase.co -U postgres -d postgres
```

### Paso 2: Aplicar Migración

```bash
# Ejecutar el archivo SQL
psql -h db.witvuzaarlqxkiqfiljq.supabase.co -U postgres -d postgres -f backend/migrations/add-performance-indexes.sql
```

### Paso 3: Verificar Índices Creados

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

---

## 📈 IMPACTO ESPERADO

### Consultas Optimizadas

| Consulta | Antes | Después | Mejora |
|----------|-------|---------|--------|
| Tenants por status | 2-3s | 50-100ms | 95% |
| Medical Records por tenant | 3-5s | 100-200ms | 96% |
| Clientes por fecha | 1-2s | 50-100ms | 95% |
| Dashboard completo | 5-15s | 150-500ms | 97% |

### Beneficios

✅ Dashboard carga en menos de 1 segundo  
✅ Consultas de estadísticas 95% más rápidas  
✅ Menor carga en la base de datos  
✅ Mejor experiencia de usuario  
✅ Escalabilidad mejorada  

---

## ⚠️ CONSIDERACIONES

### Tiempo de Ejecución
- Creación de índices: 10-30 segundos
- Análisis de tablas: 5-10 segundos
- **Total estimado:** 15-40 segundos

### Impacto en Producción
- ✅ No requiere downtime
- ✅ No afecta datos existentes
- ✅ Operación segura y reversible
- ⚠️ Puede causar lentitud temporal durante la creación

### Espacio en Disco
- Índices ocupan ~50-100 MB adicionales
- Espacio disponible en Supabase: Suficiente

---

## 🔍 VERIFICACIÓN POST-APLICACIÓN

### 1. Verificar Cantidad de Índices

```sql
SELECT COUNT(*) as total_indices
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';
```

**Resultado esperado:** 24

### 2. Verificar Índices por Tabla

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

### 3. Probar Performance del Dashboard

1. Ir a https://archivoenlinea.com
2. Iniciar sesión como Super Admin
3. Ir al Dashboard
4. Verificar tiempo de carga (debe ser <1 segundo)

---

## 📝 LOG DE EJECUCIÓN

### Inicio
- **Hora:** 8:30 PM
- **Estado:** Preparando conexión a Supabase

### En Proceso
- [ ] Conectar a Supabase
- [ ] Aplicar migración SQL
- [ ] Verificar índices creados
- [ ] Analizar tablas
- [ ] Probar performance

### Completado
- [ ] 24 índices creados exitosamente
- [ ] Tablas analizadas
- [ ] Performance verificada
- [ ] Documentación actualizada

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Aplicar índices (este documento)
2. ⏳ Verificar performance en dashboard
3. ⏳ Monitorear logs por 24 horas
4. ⏳ Documentar resultados

---

**Archivo SQL:** `backend/migrations/add-performance-indexes.sql`  
**Base de Datos:** Supabase PostgreSQL  
**Host:** db.witvuzaarlqxkiqfiljq.supabase.co  
**Estado:** ⏳ Aplicando índices...
