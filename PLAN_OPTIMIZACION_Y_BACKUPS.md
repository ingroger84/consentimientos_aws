# 🚀 Plan de Optimización y Backups Automatizados

**Fecha:** 2026-02-09  
**Versión:** 31.0.0  
**Objetivo:** Reducir uso de recursos y implementar backups automatizados a S3

---

## 📊 ANÁLISIS ACTUAL DEL SISTEMA

### Uso de Recursos Detectado:
```
Backend (PM2):
- Memoria: 128.9 MB (normal)
- CPU: 0% (idle)
- Reinicios: 20 (por actualizaciones)
- Max Memory Restart: 1GB

Build Process:
- Requiere NODE_OPTIONS='--max-old-space-size=2048'
- Indica alto consumo de memoria durante compilación
```

### Problemas Identificados:
1. ❌ Sin caché de consultas a base de datos
2. ❌ Sin paginación en endpoints que retornan listas grandes
3. ❌ Sin índices optimizados en PostgreSQL
4. ❌ Sin compresión de respuestas HTTP (ya tiene compression pero puede mejorarse)
5. ❌ Sin sistema de backups automatizado
6. ❌ Logs sin rotación automática
7. ❌ Build process consume mucha memoria
8. ❌ Sin lazy loading en relaciones TypeORM
9. ❌ Sin pool de conexiones optimizado
10. ❌ Sin monitoreo de performance

---

## 🎯 OPTIMIZACIONES A IMPLEMENTAR


### 1. Optimización de Base de Datos (PostgreSQL)

#### A. Índices Optimizados
```sql
-- backend/migrations/add-performance-indexes.sql
-- Índices para mejorar consultas frecuentes

-- Tenants
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_tenant_id ON clients(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_document ON clients(document_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- Medical Records
CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_id ON medical_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_client_id ON medical_records(client_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at DESC);

-- Consents
CREATE INDEX IF NOT EXISTS idx_consents_tenant_id ON consents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consents_client_id ON consents(client_id);
CREATE INDEX IF NOT EXISTS idx_consents_status ON consents(status);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
```


#### B. Pool de Conexiones Optimizado
```typescript
// backend/src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // NUNCA true en producción
  logging: process.env.NODE_ENV === 'development',
  
  // OPTIMIZACIÓN: Pool de conexiones
  extra: {
    max: 20, // Máximo de conexiones
    min: 5,  // Mínimo de conexiones
    idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
    connectionTimeoutMillis: 5000, // Timeout de conexión
    statement_timeout: 10000, // Timeout de queries (10s)
  },
  
  // OPTIMIZACIÓN: Caché de queries
  cache: {
    type: 'database',
    tableName: 'query_result_cache',
    duration: 60000, // 1 minuto
  },
});
```

