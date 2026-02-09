# 📋 Guía de Implementación de Optimizaciones

## 🎯 Objetivo
Reducir el uso de recursos del sistema en un 30-50% y agregar backups automatizados.

---

## 📦 PARTE 1: OPTIMIZACIONES DE BASE DE DATOS

### Paso 1: Crear Índices Optimizados

```bash
# Conectar a PostgreSQL
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249
sudo -u postgres psql consentimientos
```

```sql
-- Ejecutar estos índices uno por uno
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_slug 
  ON tenants(slug) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_status 
  ON tenants(status) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email 
  ON users(email) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_tenant_id 
  ON users(tenant_id) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_tenant_id 
  ON clients(tenant_id) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_document 
  ON clients(document_number) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medical_records_tenant_id 
  ON medical_records(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medical_records_created_at 
  ON medical_records(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consents_tenant_id 
  ON consents(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_tenant_id 
  ON invoices(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_status 
  ON invoices(status);

-- Crear tabla para caché de queries
CREATE TABLE IF NOT EXISTS query_result_cache (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255),
  time BIGINT NOT NULL,
  duration INT NOT NULL,
  query TEXT NOT NULL,
  result TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_query_cache_identifier 
  ON query_result_cache(identifier);
```

**Tiempo estimado:** 5-10 minutos  
**Impacto:** Mejora de 40-60% en queries frecuentes

---


### Paso 2: Optimizar Configuración de PostgreSQL

```bash
# Editar configuración de PostgreSQL
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Agregar/modificar estas líneas:

```conf
# Memoria
shared_buffers = 256MB              # 25% de RAM disponible
effective_cache_size = 1GB          # 50-75% de RAM
work_mem = 16MB                     # Para sorts y joins
maintenance_work_mem = 128MB        # Para VACUUM, CREATE INDEX

# Conexiones
max_connections = 100               # Ajustar según necesidad

# Checkpoints
checkpoint_completion_target = 0.9
wal_buffers = 16MB

# Query Planning
random_page_cost = 1.1              # Para SSD
effective_io_concurrency = 200      # Para SSD

# Logging (solo errores en producción)
log_min_duration_statement = 1000   # Log queries > 1 segundo
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

```bash
# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

**Impacto:** Mejora de 20-30% en rendimiento general

---

## 📦 PARTE 2: OPTIMIZACIONES DEL BACKEND

### Paso 3: Actualizar Configuración de TypeORM

Los archivos ya están creados. Ahora actualizar `app.module.ts`:

```typescript
// backend/src/app.module.ts
import { getDatabaseConfig } from './config/database-optimized.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    // ... resto de imports
  ],
})
export class AppModule {}
```


### Paso 4: Implementar Paginación en Endpoints Críticos

Ejemplo para `tenants.service.ts`:

```typescript
// backend/src/tenants/tenants.service.ts
import { PaginationDto, createPaginatedResponse } from '../common/dto/pagination.dto';

async findAll(paginationDto: PaginationDto) {
  const { page, limit, skip } = paginationDto;

  const [tenants, total] = await this.tenantsRepository.findAndCount({
    relations: ['users', 'branches'],
    order: { createdAt: 'DESC' },
    take: limit,
    skip: skip,
  });

  return createPaginatedResponse(tenants, total, page, limit);
}
```

Actualizar controller:

```typescript
// backend/src/tenants/tenants.controller.ts
@Get()
async findAll(@Query() paginationDto: PaginationDto) {
  return this.tenantsService.findAll(paginationDto);
}
```

**Aplicar en:**
- TenantsController
- UsersController
- ClientsController
- MedicalRecordsController
- ConsentsController
- InvoicesController

---

### Paso 5: Optimizar PM2 Configuration

```javascript
// ecosystem.config.production.js
module.exports = {
  apps: [{
    name: 'datagree',
    script: './backend/dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '512M', // Reducido de 1G
    node_args: '--max-old-space-size=512', // Optimizado
    autorestart: true,
    watch: false,
    max_restarts: 5, // Reducido de 10
    min_uptime: '30s', // Aumentado de 10s
    
    // NUEVO: Configuración de logs
    error_file: './logs/backend-err.log',
    out_file: './logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    
    // NUEVO: Rotación de logs
    log_type: 'json',
    
    env: {
      NODE_ENV: 'production',
      // ... resto de variables
    }
  }]
};
```

