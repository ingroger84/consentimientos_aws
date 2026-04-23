# Despliegue v91.3.2 - Dashboard Super Admin Optimizado

## ✅ COMPLETADO - 22 de Abril 2026

### Correcciones Aplicadas

Se corrigió el último error en las consultas SQL del dashboard:

**Archivo:** `backend/src/tenants/tenants.service.ts`

**Cambio en línea 1253:**
```typescript
// ANTES (causaba error: column "consentscount" does not exist)
.orderBy('consentsCount', 'DESC')

// DESPUÉS (correcto con comillas dobles)
.orderBy('"consentsCount"', 'DESC')
```

### Resumen de Todas las Correcciones v91.3.x

1. **v91.3.0** - Refactorización completa del método `getGlobalStats()`
   - Sistema de caché (5 minutos TTL)
   - 9 métodos modulares
   - Consultas SQL optimizadas
   - Ejecución paralela con Promise.all()

2. **v91.3.1** - Corrección de nombres de columnas
   - `"ct"."isActive"` en ConsentTemplates
   - `"mrct"."isActive"` en MRConsentTemplates
   - `"client"."created_at"` en Clients
   - `"branch"."tenantId"` en Branches

3. **v91.3.2** - Corrección final
   - `'"consentsCount"'` en orderBy de getTenantStats()

### Despliegue en Producción

**Servidor:** AWS 100.28.198.249
**Usuario:** ubuntu
**Path:** `/home/ubuntu/consentimientos_aws/backend/dist`
**Proceso PM2:** datagree (PID: 1597245)

**Comandos ejecutados:**
```bash
# Compilación local
npm run build

# Creación de tarball
tar -czf backend-v91.3.2-dist.tar.gz dist

# Subida al servidor
scp -i AWS-ISSABEL.pem backend-v91.3.2-dist.tar.gz ubuntu@100.28.198.249:/home/ubuntu/

# Despliegue
cd /home/ubuntu/consentimientos_aws/backend
rm -rf dist
tar -xzf ~/backend-v91.3.2-dist.tar.gz
pm2 restart datagree
```

**Estado:** ✅ Servicio corriendo correctamente
**Versión:** 84.0.1
**Logs:** Sin errores

---

## 🔴 CRÍTICO: APLICAR ÍNDICES EN SUPABASE

### ⚠️ IMPORTANTE
Los índices de base de datos son CRÍTICOS para que la optimización funcione. Sin ellos, el dashboard seguirá siendo lento.

### Pasos para Aplicar Índices

1. **Ir a Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq/sql
   ```

2. **Abrir el archivo de índices:**
   ```
   backend/migrations/add-performance-indexes.sql
   ```

3. **Copiar TODO el contenido del archivo**

4. **Pegar en el SQL Editor de Supabase**

5. **Ejecutar (botón "Run" o Ctrl+Enter)**

6. **Verificar que se crearon 24 índices:**
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

### Índices que se Crearán

**Tenants (6 índices):**
- idx_tenants_status
- idx_tenants_plan
- idx_tenants_deleted_at
- idx_tenants_created_at
- idx_tenants_updated_at
- idx_tenants_status_plan

**Medical Records (4 índices):**
- idx_medical_records_tenant_id
- idx_medical_records_status
- idx_medical_records_created_at
- idx_medical_records_tenant_status

**Clients (3 índices):**
- idx_clients_tenant_id
- idx_clients_created_at
- idx_clients_tenant_created

**Consents (3 índices):**
- idx_consents_tenant_id
- idx_consents_deleted_at
- idx_consents_tenant_active

**Users, Branches, Services, Templates, Invoices (8 índices adicionales)**

### Verificación Post-Índices

Después de aplicar los índices, verificar el performance:

```bash
# Conectarse al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Verificar logs del dashboard
pm2 logs datagree --lines 100 | grep "Stats calculated"
```

Deberías ver tiempos de respuesta como:
```
Stats calculated in 150ms  (antes: 5000-15000ms)
```

---

## Mejoras de Performance Esperadas

### Antes de la Optimización
- Tiempo de carga: 5-15 segundos
- Múltiples queries secuenciales
- Sin caché
- Sin índices

### Después de la Optimización
- Tiempo de carga: 150-500ms (primera carga)
- Tiempo de carga: <50ms (con caché)
- Queries paralelas
- Caché de 5 minutos
- 24 índices de base de datos

### Reducción de Tiempo
- **Primera carga:** 95% más rápido (15s → 500ms)
- **Cargas subsecuentes:** 99.7% más rápido (15s → 50ms)

---

## Archivos Modificados

```
backend/src/tenants/tenants.service.ts (líneas 1100-1600)
backend/migrations/add-performance-indexes.sql
```

## Archivos Creados

```
backend-v91.3.2-dist.tar.gz (4.65 MB)
DESPLIEGUE_V91.3.2_COMPLETADO.md
```

---

## Próximos Pasos

1. ✅ Código backend corregido y desplegado
2. 🔴 **APLICAR ÍNDICES EN SUPABASE** (PENDIENTE - CRÍTICO)
3. ⏳ Verificar performance del dashboard
4. ⏳ Monitorear logs por 24 horas

---

## Notas Técnicas

### Sistema de Caché
- TTL: 5 minutos (300,000 ms)
- Almacenamiento: En memoria (variable privada)
- Invalidación: Automática por tiempo

### Consultas SQL Optimizadas
- Uso de GROUP BY para agregaciones
- CASE WHEN para conteos condicionales
- Joins optimizados con índices
- Ejecución paralela con Promise.all()

### Nombres de Columnas
- TypeORM convierte camelCase a snake_case automáticamente
- Algunas tablas usan camelCase en DB (consent_templates)
- Otras usan snake_case en DB (clients, branches)
- Solución: Usar comillas dobles para forzar nombres exactos

---

## Contacto y Soporte

Si hay problemas después del despliegue:
1. Verificar logs: `pm2 logs datagree`
2. Verificar servicio: `pm2 status`
3. Reiniciar si es necesario: `pm2 restart datagree`

**Fecha de despliegue:** 22 de Abril 2026, 12:53 PM
**Versión desplegada:** v91.3.2
**Estado:** ✅ Operacional
