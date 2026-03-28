# Database - Gestión de Base de Datos

Esta carpeta contiene todos los archivos relacionados con la base de datos PostgreSQL (Supabase).

## Estructura

### 📋 migrations/
Migraciones SQL para cambios en el esquema
- `create-medical-records-clean.sql` - Creación de tablas de historias clínicas
- `copy-mr-templates-to-tenants.sql` - Migración de plantillas

**Uso:**
```bash
psql -h db.witvuzaarlqxkiqfiljq.supabase.co -U postgres -d postgres -f database/migrations/nombre-migracion.sql
```

### 🌱 seeds/
Seeds de datos iniciales
- `seed-production-data.sql` - Datos de producción
- `seed-simple.sql` - Datos básicos para desarrollo
- `load-consent-templates.sql` - Plantillas de consentimientos

**Uso:**
```bash
psql -h db.witvuzaarlqxkiqfiljq.supabase.co -U postgres -d postgres -f database/seeds/nombre-seed.sql
```

### 🔍 queries/
Queries SQL de diagnóstico y mantenimiento
- `check-admin-permissions.sql` - Verificar permisos de admin
- `check-permissions.sql` - Verificar permisos generales
- `check-tenant-data.sql` - Verificar datos de tenants
- `check-user-role.sql` - Verificar roles de usuarios
- `update-permissions.sql` - Actualizar permisos

**Uso:**
```bash
psql -h db.witvuzaarlqxkiqfiljq.supabase.co -U postgres -d postgres -f database/queries/nombre-query.sql
```

### 🛠️ scripts/
Scripts de Node.js para operaciones de base de datos
- Ubicados en `/backend/*.js` (scripts de optimización, diagnóstico, etc.)
- Ver `/backend/optimize-database-final.js` para optimizaciones

## Conexión a Base de Datos

**Host:** db.witvuzaarlqxkiqfiljq.supabase.co  
**Puerto:** 5432  
**Base de datos:** postgres  
**Usuario:** postgres  
**SSL:** Requerido

## Optimizaciones Recientes

**v77.0.0 (2026-03-28):**
- 34 índices nuevos creados
- Mejora de 40-70% en rendimiento
- Ver: `/doc/OPTIMIZACION_BASE_DATOS_V77.0.md`

## Mantenimiento

### Diario (Automático):
- ANALYZE para actualizar estadísticas

### Semanal:
- Revisar índices no utilizados
- Monitorear tamaño de tablas

### Mensual:
- VACUUM FULL en horario de bajo tráfico
- Revisar plan de particionamiento

## Comandos Útiles

```sql
-- Ver índices creados
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Analizar rendimiento de query
EXPLAIN ANALYZE 
SELECT * FROM invoices 
WHERE "tenantId" = 'xxx' AND status = 'pending';

-- Limpiar sesiones expiradas
DELETE FROM user_sessions 
WHERE "expiresAt" < NOW() AND "isActive" = false;

-- Ver tamaño de tablas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Notas de Seguridad

- NUNCA commitear archivos con credenciales
- Usar variables de entorno para conexiones
- Backups automáticos cada 6 horas a AWS S3
- Retención de backups: 30 días

**Última actualización:** 2026-03-28 (v77.1.0)
