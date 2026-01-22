# Optimizaciones del Sistema - DatAgree

**Fecha:** 2026-01-22  
**Versión:** 1.1.31

---

## 📋 Resumen

Este documento describe todas las optimizaciones implementadas en el sistema DatAgree para mejorar el rendimiento, escalabilidad y experiencia del usuario.

---

## 🗄️ OPTIMIZACIONES DE BASE DE DATOS

### 1. Índices Optimizados

Se han creado **50+ índices** estratégicos para mejorar el rendimiento de las consultas más frecuentes:

#### Índices por Tabla

**users:**
- `idx_users_email_active` - Búsquedas por email (login)
- `idx_users_tenant_active` - Búsquedas por tenant
- `idx_users_tenant_role` - Búsquedas compuestas tenant + rol
- `idx_users_created_desc` - Ordenamiento por fecha

**tenants:**
- `idx_tenants_slug_active` - Acceso por subdominio (crítico)
- `idx_tenants_status` - Filtrado por estado
- `idx_tenants_plan` - Filtrado por plan
- `idx_tenants_trial_expiring` - Tenants próximos a expirar
- `idx_tenants_plan_status` - Búsquedas compuestas

**consents:**
- `idx_consents_tenant_active` - Búsquedas por tenant
- `idx_consents_client_email` - Búsquedas por email de cliente
- `idx_consents_client_id` - Búsquedas por ID de cliente
- `idx_consents_service` - Filtrado por servicio
- `idx_consents_branch` - Filtrado por sede
- `idx_consents_signed_desc` - Ordenamiento por fecha de firma
- `idx_consents_tenant_created` - Dashboard (compuesto)
- `idx_consents_client_name_trgm` - Búsqueda de texto completo

**invoices:**
- `idx_invoices_tenant` - Búsquedas por tenant
- `idx_invoices_status` - Filtrado por estado
- `idx_invoices_number` - Búsqueda por número
- `idx_invoices_overdue` - Facturas vencidas
- `idx_invoices_tenant_status_date` - Dashboard de facturación

**payments:**
- `idx_payments_tenant` - Búsquedas por tenant
- `idx_payments_invoice` - Búsquedas por factura
- `idx_payments_status` - Filtrado por estado
- `idx_payments_external_ref` - Referencia externa
- `idx_payments_tenant_date` - Historial de pagos

**notifications:**
- `idx_notifications_superadmin_unread` - Notificaciones no leídas del Super Admin
- `idx_notifications_user_unread` - Notificaciones por usuario
- `idx_notifications_type` - Filtrado por tipo

**Y más...**

### 2. Extensión pg_trgm

Habilitada para búsquedas de texto más eficientes:
- Búsqueda fuzzy en nombres de clientes
- Búsqueda en nombres de servicios
- Búsqueda en nombres de sedes

### 3. Estadísticas Actualizadas

Se ejecuta `ANALYZE` en todas las tablas para que el optimizador de PostgreSQL tome mejores decisiones.

### 4. Aplicar Optimizaciones

```bash
# En el servidor
cd /home/ubuntu/consentimientos_aws/backend
sudo -u postgres psql consentimientos < optimize-database-indexes.sql
```

### 5. Mantenimiento Recomendado

```sql
-- Ejecutar semanalmente
VACUUM ANALYZE;

-- Ejecutar mensualmente
REINDEX DATABASE consentimientos;
```

---

## 🔧 OPTIMIZACIONES DE BACKEND

### 1. Configuración de Base de Datos Optimizada

**Archivo:** `backend/src/config/database.config.ts`

**Mejoras:**
- Pool de conexiones optimizado (5-20 conexiones según entorno)
- Timeouts configurados adecuadamente
- Keep-alive habilitado
- Cache de consultas en producción (1 minuto)
- Logging solo en desarrollo

**Beneficios:**
- ✅ Mejor uso de recursos
- ✅ Menor latencia en consultas
- ✅ Prevención de conexiones colgadas
- ✅ Cache automático de queries repetitivas

### 2. Interceptor de Caché HTTP

**Archivo:** `backend/src/common/interceptors/cache.interceptor.ts`

**Características:**
- Cache en memoria para requests GET
- TTL configurable (default: 1 minuto)
- Limpieza automática de cache expirado
- Método para limpiar cache manualmente

**Uso:**
```typescript
@UseInterceptors(HttpCacheInterceptor)
@Get('plans')
async getPlans() {
  return this.plansService.findAll();
}
```

### 3. Decorador @Cacheable

**Archivo:** `backend/src/common/decorators/cacheable.decorator.ts`

**Uso:**
```typescript
@Get('plans')
@Cacheable(300) // Cache por 5 minutos
async getPlans() {
  return this.plansService.findAll();
}
```

### 4. Middleware de Compresión

**Archivo:** `backend/src/common/middleware/compression.middleware.ts`

**Características:**
- Compresión gzip de respuestas HTTP
- Reduce tamaño de respuestas en ~70-80%
- Umbral mínimo de 1KB
- Nivel de compresión optimizado (6)

**Beneficios:**
- ✅ Menor uso de ancho de banda
- ✅ Respuestas más rápidas
- ✅ Mejor experiencia en conexiones lentas

### 5. Recomendaciones de Implementación

#### En app.module.ts:

```typescript
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { CompressionMiddleware } from './common/middleware/compression.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    // ... otros módulos
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CompressionMiddleware).forRoutes('*');
  }
}
```

#### En controladores específicos:

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { HttpCacheInterceptor } from './common/interceptors/cache.interceptor';
import { Cacheable } from './common/decorators/cacheable.decorator';

@Controller('tenants')
export class TenantsController {
  @Get('plans')
  @Cacheable(300) // Cache por 5 minutos
  async getPlans() {
    return this.tenantsService.getPlans();
  }

  @Get('settings/public')
  @UseInterceptors(HttpCacheInterceptor)
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }
}
```

---

## ⚛️ OPTIMIZACIONES DE FRONTEND

### 1. Configuración de Vite Optimizada

**Archivo:** `frontend/vite.config.ts`

**Mejoras:**
- Code splitting inteligente por vendor
- Minificación agresiva con Terser
- Eliminación de console.log en producción
- CSS code splitting
- Target ES2020 para mejor optimización
- Nombres de archivo con hash para cache busting

**Beneficios:**
- ✅ Bundles más pequeños
- ✅ Mejor caching del navegador
- ✅ Carga inicial más rápida
- ✅ Actualizaciones incrementales

### 2. Hook useLazyImage

**Archivo:** `frontend/src/hooks/useLazyImage.ts`

**Características:**
- Lazy loading de imágenes
- Carga solo cuando la imagen es visible
- Soporte para placeholder
- Basado en Intersection Observer

**Uso:**
```typescript
function MyComponent() {
  const { imgRef, imageSrc, isLoaded } = useLazyImage(
    '/path/to/image.jpg',
    '/placeholder.jpg'
  );
  
  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt="Description"
      className={isLoaded ? 'loaded' : 'loading'}
    />
  );
}
```

**Beneficios:**
- ✅ Carga inicial más rápida
- ✅ Menor uso de ancho de banda
- ✅ Mejor performance en páginas largas

### 3. Hook useDebounce

**Archivo:** `frontend/src/hooks/useDebounce.ts`

**Características:**
- Debouncing de valores
- Configurable (default: 500ms)
- Ideal para búsquedas en tiempo real

**Uso:**
```typescript
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchAPI(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar..."
    />
  );
}
```

**Beneficios:**
- ✅ Menos requests al backend
- ✅ Mejor experiencia de usuario
- ✅ Menor carga en el servidor

### 4. Lazy Loading de Componentes

Ya implementado en `App.tsx`:

```typescript
// Lazy loading de páginas
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ConsentsPage = lazy(() => import('./pages/ConsentsPage'));
// ... más páginas
```

**Beneficios:**
- ✅ Bundle inicial más pequeño
- ✅ Carga bajo demanda
- ✅ Mejor First Contentful Paint

---

## 📊 MÉTRICAS ESPERADAS

### Antes de Optimizaciones

- **Bundle size:** ~1.2 MB
- **First Contentful Paint:** ~2.5s
- **Time to Interactive:** ~4s
- **Queries DB:** ~200ms promedio
- **API Response:** ~500ms promedio

### Después de Optimizaciones

- **Bundle size:** ~800 KB (-33%)
- **First Contentful Paint:** ~1.5s (-40%)
- **Time to Interactive:** ~2.5s (-37%)
- **Queries DB:** ~50ms promedio (-75%)
- **API Response:** ~200ms promedio (-60%)

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Base de Datos (Inmediato)

1. ✅ Crear script de índices
2. ⏳ Ejecutar script en producción
3. ⏳ Verificar índices creados
4. ⏳ Monitorear performance

### Fase 2: Backend (Esta Semana)

1. ✅ Crear configuración de DB optimizada
2. ✅ Crear interceptor de caché
3. ✅ Crear middleware de compresión
4. ⏳ Integrar en app.module.ts
5. ⏳ Aplicar decoradores @Cacheable
6. ⏳ Desplegar en producción

### Fase 3: Frontend (Esta Semana)

1. ✅ Optimizar vite.config.ts
2. ✅ Crear hooks de optimización
3. ⏳ Aplicar lazy loading de imágenes
4. ⏳ Aplicar debouncing en búsquedas
5. ⏳ Recompilar y desplegar

### Fase 4: Monitoreo (Continuo)

1. ⏳ Configurar métricas de performance
2. ⏳ Monitorear tiempos de respuesta
3. ⏳ Analizar logs de queries lentas
4. ⏳ Ajustar según necesidad

---

## 🔍 MONITOREO Y MANTENIMIENTO

### Queries Lentas en PostgreSQL

```sql
-- Ver queries más lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

### Tamaño de Tablas

```sql
-- Ver tamaño de tablas
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Índices No Utilizados

```sql
-- Ver índices que no se usan
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE 'pg_toast%';
```

### Performance del Frontend

```javascript
// En el navegador (DevTools Console)
performance.getEntriesByType('navigation')[0];
performance.getEntriesByType('resource');
```

---

## 📝 MEJORES PRÁCTICAS ADICIONALES

### Backend

1. **Paginación:** Siempre paginar resultados grandes
2. **Eager Loading:** Usar `relations` en TypeORM para evitar N+1
3. **DTOs:** Validar y transformar datos de entrada
4. **Error Handling:** Manejar errores consistentemente
5. **Logging:** Usar niveles apropiados (error, warn, info, debug)

### Frontend

1. **Memoization:** Usar `useMemo` y `useCallback` apropiadamente
2. **Virtual Scrolling:** Para listas muy largas
3. **Image Optimization:** Usar formatos modernos (WebP, AVIF)
4. **Code Splitting:** Por ruta y por componente
5. **Service Workers:** Para caching offline (futuro)

### Base de Datos

1. **Vacuum Regular:** Ejecutar semanalmente
2. **Reindex:** Ejecutar mensualmente
3. **Backups:** Diarios con retención de 30 días
4. **Monitoring:** Configurar alertas para queries lentas
5. **Connection Pooling:** Usar PgBouncer en producción (futuro)

---

## 🎯 PRÓXIMOS PASOS

### Corto Plazo (Esta Semana)

- [ ] Ejecutar script de índices en producción
- [ ] Integrar middleware de compresión
- [ ] Aplicar decoradores de caché
- [ ] Recompilar frontend optimizado
- [ ] Medir métricas de performance

### Mediano Plazo (Este Mes)

- [ ] Implementar Redis para caché distribuido
- [ ] Configurar CDN para assets estáticos
- [ ] Implementar rate limiting por IP
- [ ] Agregar monitoring con Prometheus
- [ ] Configurar alertas de performance

### Largo Plazo (Este Trimestre)

- [ ] Implementar Service Workers
- [ ] Agregar Progressive Web App (PWA)
- [ ] Implementar Server-Side Rendering (SSR)
- [ ] Configurar PgBouncer
- [ ] Implementar sharding de base de datos

---

## 📞 SOPORTE

Para preguntas sobre las optimizaciones:
- **Email:** rcaraballo@innovasystems.com.co
- **Documentación:** Este archivo

---

**Desarrollado con ❤️ por Innova Systems**  
**© 2026 DatAgree - Todos los derechos reservados**
