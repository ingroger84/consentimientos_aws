# Optimización Dashboard Super Admin - v91.3

## Problema Identificado

El dashboard del Super Admin cargaba muy lento (varios segundos) debido a consultas ineficientes en el método `getGlobalStats()`.

### Problemas Específicos:

1. **Carga masiva de relaciones**: `find({ relations: ['users', 'branches', 'services', 'consents'] })` cargaba TODOS los tenants con TODAS sus relaciones en memoria
2. **Múltiples consultas count() sin índices**: Cada count() era una consulta separada
3. **Loop de 6 meses con consultas individuales**: 6 consultas separadas para datos de crecimiento
4. **Filtrado en memoria**: Procesamiento de arrays grandes en JavaScript en lugar de SQL
5. **Sin caché**: Cada carga del dashboard ejecutaba todas las consultas desde cero
6. **Sin índices en base de datos**: Las consultas no podían usar índices para acelerar búsquedas

## Soluciones Implementadas

### 1. Índices de Base de Datos

Creado script de migración: `backend/migrations/add-performance-indexes.sql`

**Índices agregados:**
- `tenants`: status, plan, created_at, status+plan (compuesto)
- `medical_records`: status, tenant_id, created_at, tenant_id+status (compuesto)
- `clients`: tenant_id, created_at, tenant_id+created_at (compuesto)
- `consents`: tenant_id, created_at, tenant_id+created_at (compuesto)
- `users`: tenant_id, created_at
- `branches`: tenant_id
- `services`: tenant_id
- `consent_templates`: is_active
- `mr_consent_templates`: is_active
- `invoices`: status, created_at, due_date, status+created_at (compuesto)

**Beneficios:**
- Búsquedas por status/plan: O(log n) en lugar de O(n)
- Filtros con WHERE: Uso de índices en lugar de full table scan
- GROUP BY optimizado: Índices compuestos aceleran agregaciones
- Consultas de rango de fechas: Índices en created_at

### 2. Refactorización de Consultas SQL

**Antes:**
```typescript
const tenants = await this.tenantsRepository.find({
  relations: ['users', 'branches', 'services', 'consents'],
});
// Cargaba TODO en memoria (potencialmente miles de registros)
```

**Después:**
```typescript
const tenantStatsRaw = await this.tenantsRepository
  .createQueryBuilder('tenant')
  .select('tenant.status', 'status')
  .addSelect('tenant.plan', 'plan')
  .addSelect('COUNT(*)', 'count')
  .where('tenant.deleted_at IS NULL')
  .groupBy('tenant.status')
  .addGroupBy('tenant.plan')
  .getRawMany();
// Solo trae conteos agregados
```

**Optimizaciones:**
- Consultas agregadas con GROUP BY en lugar de cargar todo
- Uso de CASE WHEN para múltiples conteos en una sola query
- Joins solo cuando necesario, sin cargar relaciones completas
- Filtros en SQL (WHERE) en lugar de en JavaScript

### 3. Consultas Paralelas

**Antes:**
```typescript
// Consultas secuenciales (una después de otra)
const totalMedicalRecords = await medicalRecordsRepo.count();
const activeMedicalRecords = await medicalRecordsRepo.count({ where: { status: 'OPEN' } });
const closedMedicalRecords = await medicalRecordsRepo.count({ where: { status: 'CLOSED' } });
```

**Después:**
```typescript
// Consultas paralelas con Promise.all
const [
  tenantStats,
  medicalRecordsStats,
  clientsStats,
  consentTemplatesStats,
  mrConsentTemplatesStats,
  topTenantsByMedicalRecords,
  topTenantsByClients,
  growthData,
] = await Promise.all([
  this.getTenantStats(),
  this.getMedicalRecordsStats(),
  this.getClientsStats(),
  // ...
]);
```

**Beneficios:**
- Todas las consultas se ejecutan simultáneamente
- Tiempo total = tiempo de la consulta más lenta (no suma de todas)
- Mejor uso de conexiones de base de datos

### 4. Optimización de Datos de Crecimiento

**Antes:**
```typescript
for (let i = 5; i >= 0; i--) {
  // 6 iteraciones con 4 consultas cada una = 24 consultas
  const medicalRecordsInMonth = await medicalRecordsRepo
    .createQueryBuilder('mr')
    .where('mr.created_at >= :monthStart', { monthStart })
    .andWhere('mr.created_at <= :monthEnd', { monthEnd })
    .getCount();
}
```

**Después:**
```typescript
// Una sola consulta con TO_CHAR para agrupar por mes
const query = this.dataSource
  .createQueryBuilder()
  .select(`TO_CHAR(${dateColumn}, 'YYYY-MM')`, 'month')
  .addSelect('COUNT(*)', 'count')
  .from(tableName, tableName)
  .where(`${dateColumn} >= :startDate`, { startDate })
  .groupBy('month');
```

**Beneficios:**
- 24 consultas → 4 consultas (una por tabla)
- Procesamiento en base de datos en lugar de loops en JavaScript
- Uso de funciones de fecha de PostgreSQL

### 5. Sistema de Caché

**Implementación:**
```typescript
private globalStatsCache: {
  data: any;
  timestamp: number;
} | null = null;
private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
```

**Lógica:**
- Primera carga: Ejecuta todas las consultas y guarda en caché
- Cargas subsecuentes (< 5 min): Retorna datos del caché
- Después de 5 min: Recalcula y actualiza caché

**Beneficios:**
- Carga instantánea para usuarios subsecuentes
- Reduce carga en base de datos
- TTL de 5 minutos mantiene datos razonablemente actualizados

### 6. Modularización del Código

Métodos privados creados:
- `getTenantStats()`: Estadísticas de tenants
- `getMedicalRecordsStats()`: Estadísticas de historias clínicas
- `getClientsStats()`: Estadísticas de clientes
- `getConsentTemplatesStats()`: Estadísticas de plantillas de consentimiento
- `getMRConsentTemplatesStats()`: Estadísticas de plantillas HC
- `getTopTenantsByMedicalRecords()`: Top 10 tenants por HC
- `getTopTenantsByClients()`: Top 10 tenants por clientes
- `getGrowthData()`: Datos de crecimiento de 6 meses
- `getMonthlyGrowth()`: Helper para crecimiento mensual
- `getEmptyStats()`: Estadísticas vacías para manejo de errores

**Beneficios:**
- Código más legible y mantenible
- Fácil de testear individualmente
- Reutilizable
- Mejor manejo de errores

## Mejoras de Performance Esperadas

### Antes de la Optimización:
- Tiempo de carga: 5-15 segundos (dependiendo de cantidad de datos)
- Consultas ejecutadas: 30-50 queries
- Memoria usada: Alta (carga todos los tenants con relaciones)
- Carga en DB: Alta (múltiples full table scans)

### Después de la Optimización:
- Primera carga: 500ms - 2 segundos (con índices)
- Cargas subsecuentes: < 10ms (desde caché)
- Consultas ejecutadas: 8 queries paralelas
- Memoria usada: Baja (solo datos agregados)
- Carga en DB: Baja (uso de índices, consultas optimizadas)

**Mejora estimada: 10-30x más rápido**

## Archivos Modificados

1. `backend/src/tenants/tenants.service.ts`
   - Agregado sistema de caché
   - Refactorizado método `getGlobalStats()`
   - Agregados 9 métodos privados helper

2. `backend/migrations/add-performance-indexes.sql`
   - Script de migración con 20+ índices

## Instrucciones de Despliegue

### 1. Aplicar Índices en Base de Datos

```bash
# Conectar a la base de datos de producción
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ejecutar script de índices
cd /home/ubuntu/consentimientos_aws/backend
psql -U postgres -d consentimientos_db -f migrations/add-performance-indexes.sql
```

### 2. Desplegar Código Optimizado

```bash
# Compilar backend
npm run build

# Crear tarball
tar -czf backend-v91.3-dist.tar.gz dist/

# Subir a servidor
scp -i AWS-ISSABEL.pem backend-v91.3-dist.tar.gz ubuntu@100.28.198.249:/home/ubuntu/

# En el servidor
cd /home/ubuntu/consentimientos_aws/backend
tar -xzf ~/backend-v91.3-dist.tar.gz
pm2 restart datagree
```

### 3. Verificar Funcionamiento

```bash
# Ver logs
pm2 logs datagree

# Buscar mensajes:
# "Calculating fresh stats..."
# "Stats calculated in XXXms"
# "Returning cached stats (age: XXs)"
```

## Monitoreo Post-Despliegue

### Verificar Performance:

1. Abrir dashboard de Super Admin
2. Observar tiempo de carga (debería ser < 2 segundos primera vez)
3. Recargar página (debería ser instantáneo desde caché)
4. Esperar 5 minutos y recargar (debería recalcular)

### Verificar Logs:

```bash
pm2 logs datagree --lines 100 | grep -i "stats"
```

Deberías ver:
```
Calculating fresh stats...
Stats calculated in 850ms
Returning cached stats (age: 45s)
Returning cached stats (age: 120s)
```

### Verificar Índices:

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

## Notas Importantes

1. **Caché en memoria**: El caché se pierde al reiniciar PM2. Esto es intencional para evitar datos obsoletos.

2. **TTL de 5 minutos**: Ajustable modificando `CACHE_TTL` en el código si se necesita más/menos frecuencia de actualización.

3. **Índices parciales**: Algunos índices usan `WHERE deleted_at IS NULL` para ser más eficientes (solo indexan registros activos).

4. **Compatibilidad**: Los índices son seguros de aplicar en producción (IF NOT EXISTS evita errores si ya existen).

5. **Rollback**: Si hay problemas, los índices se pueden eliminar sin afectar funcionalidad:
```sql
DROP INDEX IF EXISTS idx_tenants_status;
-- etc.
```

## Próximas Optimizaciones Posibles

1. **Redis para caché distribuido**: Si se escala a múltiples instancias
2. **Paginación en top tenants**: Limitar a 10 es suficiente, pero podría ser configurable
3. **Materialización de vistas**: Para estadísticas que cambian poco
4. **Índices adicionales**: Basados en queries lentas identificadas en logs
5. **Query caching en PostgreSQL**: Configurar shared_buffers y work_mem

## Conclusión

Esta optimización reduce dramáticamente el tiempo de carga del dashboard del Super Admin mediante:
- Índices de base de datos para búsquedas rápidas
- Consultas SQL optimizadas y agregadas
- Ejecución paralela de queries
- Sistema de caché en memoria
- Código modular y mantenible

El resultado es una experiencia de usuario mucho mejor con tiempos de carga de < 2 segundos en lugar de 5-15 segundos.
