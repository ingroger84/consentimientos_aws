# Checklist de Auditoría para Producción

**Fecha:** 2026-01-27  
**Versión:** 15.1.0  
**Estado:** 🔍 EN REVISIÓN

---

## 🚨 CRÍTICO - SEGURIDAD

### ❌ 1. Credenciales Expuestas en `.env`

**PROBLEMA CRÍTICO:** El archivo `backend/.env` contiene credenciales reales y está siendo trackeado.

**Credenciales expuestas:**
```
AWS_ACCESS_KEY_ID=TU_AWS_ACCESS_KEY_S3
AWS_SECRET_ACCESS_KEY=TU_AWS_SECRET_KEY_S3
LIGHTSAIL_ACCESS_KEY_ID=TU_AWS_ACCESS_KEY_LIGHTSAIL
LIGHTSAIL_SECRET_ACCESS_KEY=TU_AWS_SECRET_KEY_LIGHTSAIL
SMTP_PASSWORD=TU_SMTP_PASSWORD
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**ACCIÓN INMEDIATA REQUERIDA:**
1. ✅ Rotar TODAS las credenciales AWS inmediatamente
2. ✅ Cambiar contraseña de aplicación de Gmail
3. ✅ Generar nuevo JWT_SECRET fuerte
4. ✅ Crear `.env.example` sin valores reales
5. ✅ Verificar que `.env` esté en `.gitignore`
6. ✅ Eliminar `.env` del historial de Git si fue commiteado

### ❌ 2. JWT Secret Débil

**PROBLEMA:** JWT_SECRET usa valor por defecto inseguro

**SOLUCIÓN:**
```bash
# Generar JWT secret fuerte (32+ caracteres)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### ❌ 3. Archivo PEM Expuesto

**PROBLEMA:** `AWS-ISSABEL.pem` está en la raíz del proyecto

**ACCIÓN:**
1. ✅ Mover a carpeta `keys/` (ya está en .gitignore)
2. ✅ Verificar que no esté en Git
3. ✅ Actualizar referencias en scripts

---

## ⚠️ ALTO - CONFIGURACIÓN

### ⚠️ 4. NODE_ENV en Desarrollo

**PROBLEMA:** `.env` tiene `NODE_ENV=development`

**SOLUCIÓN:**
```env
NODE_ENV=production
```

### ⚠️ 5. CORS Configuración

**PROBLEMA:** CORS permite localhost en producción

**SOLUCIÓN en `backend/src/main.ts`:**
```typescript
// Remover lógica de localhost en producción
if (nodeEnv === 'development' && origin.includes('localhost')) {
  return callback(null, true);
}
```

### ⚠️ 6. TypeORM Synchronize

**PROBLEMA:** `synchronize: false` está correcto, pero verificar

**VERIFICAR en `backend/src/app.module.ts`:**
```typescript
TypeOrmModule.forRoot({
  synchronize: false, // ✅ DEBE ser false en producción
  logging: false,     // ✅ Desactivar logs SQL en producción
})
```

### ⚠️ 7. Rate Limiting

**PROBLEMA:** Límites muy permisivos

**ACTUAL:**
```env
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

**RECOMENDADO para producción:**
```env
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=30  # Reducir a 30 requests por minuto
```

---

## 📊 MEDIO - OPTIMIZACIÓN

### 📊 8. Compresión y Caché

**VERIFICAR en `backend/src/main.ts`:**
```typescript
// ✅ Ya implementado
app.use(compression());
```

**AGREGAR headers de caché:**
```typescript
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  next();
});
```

### 📊 9. Logs de Producción

**AGREGAR logger profesional:**
```bash
npm install winston
```

**Configurar en `backend/src/main.ts`:**
```typescript
import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### 📊 10. Health Check Endpoint

**AGREGAR en backend:**
```typescript
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
```

---

## 🔧 BAJO - MEJORAS

### 🔧 11. Variables de Entorno Faltantes

**AGREGAR a `.env.production`:**
```env
# Monitoring
SENTRY_DSN=
NEW_RELIC_LICENSE_KEY=

# Performance
MAX_FILE_SIZE=10485760  # 10MB
MAX_REQUEST_SIZE=52428800  # 50MB

# Database Pool
DB_POOL_MIN=2
DB_POOL_MAX=10

# Session
SESSION_SECRET=
SESSION_MAX_AGE=604800000  # 7 días
```

### 🔧 12. Dependencias de Seguridad

**EJECUTAR:**
```bash
cd backend && npm audit fix
cd frontend && npm audit fix
```

### 🔧 13. Build Optimizado

**VERIFICAR `frontend/vite.config.ts`:**
```typescript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remover console.log en producción
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
```

---

## 📝 DOCUMENTACIÓN

### 📝 14. README de Producción

**CREAR `DEPLOYMENT.md`:**
- Requisitos del servidor
- Pasos de despliegue
- Variables de entorno requeridas
- Comandos de migración
- Troubleshooting

### 📝 15. Scripts de Despliegue

**CREAR `scripts/deploy-production.sh`:**
```bash
#!/bin/bash
set -e

echo "🚀 Iniciando despliegue a producción..."

# 1. Backup de base de datos
echo "📦 Creando backup..."
pg_dump -h $DB_HOST -U $DB_USERNAME $DB_DATABASE > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Pull latest code
echo "📥 Obteniendo código..."
git pull origin main

# 3. Install dependencies
echo "📦 Instalando dependencias..."
cd backend && npm ci --production
cd ../frontend && npm ci

# 4. Run migrations
echo "🔄 Ejecutando migraciones..."
cd ../backend && npm run migration:run

# 5. Build
echo "🏗️  Compilando..."
npm run build
cd ../frontend && npm run build

# 6. Restart services
echo "🔄 Reiniciando servicios..."
pm2 restart all

echo "✅ Despliegue completado!"
```

---

## 🗄️ BASE DE DATOS

### 🗄️ 16. Índices Faltantes

**EJECUTAR:**
```sql
-- Ya existe: backend/optimize-database-indexes.sql
-- Verificar que se haya ejecutado
```

### 🗄️ 17. Backup Automático

**CONFIGURAR cron job:**
```bash
# Backup diario a las 2 AM
0 2 * * * /usr/bin/pg_dump -h localhost -U admin consentimientos > /backups/db_$(date +\%Y\%m\%d).sql
```

### 🗄️ 18. Conexiones de Pool

**CONFIGURAR en `backend/src/app.module.ts`:**
```typescript
TypeOrmModule.forRoot({
  extra: {
    max: 10,  // Máximo de conexiones
    min: 2,   // Mínimo de conexiones
    idleTimeoutMillis: 30000,
  },
})
```

---

## 🌐 FRONTEND

### 🌐 19. Service Worker

**CONSIDERAR agregar PWA:**
```bash
npm install vite-plugin-pwa
```

### 🌐 20. Error Boundary

**AGREGAR en `frontend/src/App.tsx`:**
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log a servicio de monitoreo
    console.error('Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }
    return this.props.children;
  }
}
```

### 🌐 21. Lazy Loading

**IMPLEMENTAR en rutas:**
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MedicalRecords = lazy(() => import('./pages/MedicalRecords'));
```

---

## 🔐 SEGURIDAD ADICIONAL

### 🔐 22. Headers de Seguridad

**VERIFICAR en `backend/src/main.ts`:**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### 🔐 23. SQL Injection Protection

**VERIFICAR:** TypeORM ya protege, pero revisar queries raw

**BUSCAR en código:**
```bash
grep -r "query(" backend/src/
grep -r "createQueryBuilder" backend/src/
```

### 🔐 24. XSS Protection

**VERIFICAR sanitización de inputs:**
- ✅ class-validator en DTOs
- ✅ Helmet CSP headers
- ⚠️ Revisar renderizado de HTML en PDFs

---

## 📈 MONITOREO

### 📈 25. APM (Application Performance Monitoring)

**OPCIONES:**
- New Relic
- Datadog
- Sentry
- AWS CloudWatch

### 📈 26. Logs Centralizados

**CONFIGURAR:**
- CloudWatch Logs
- ELK Stack
- Papertrail

### 📈 27. Alertas

**CONFIGURAR alertas para:**
- CPU > 80%
- Memoria > 80%
- Disco > 90%
- Errores 500 > 10/min
- Tiempo de respuesta > 2s

---

## 🧪 TESTING

### 🧪 28. Tests Unitarios

**EJECUTAR:**
```bash
cd backend && npm test
cd frontend && npm test
```

### 🧪 29. Tests E2E

**CONSIDERAR:**
- Cypress
- Playwright
- Selenium

### 🧪 30. Load Testing

**EJECUTAR con k6 o Artillery:**
```bash
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:3000/api/health
```

---

## 📦 DESPLIEGUE

### 📦 31. PM2 Configuration

**CREAR `ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [{
    name: 'consentimientos-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
```

### 📦 32. Nginx Configuration

**CREAR `nginx.conf`:**
```nginx
server {
    listen 80;
    server_name *.archivoenlinea.com;
    
    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name *.archivoenlinea.com;
    
    ssl_certificate /etc/letsencrypt/live/archivoenlinea.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/archivoenlinea.com/privkey.pem;
    
    # Frontend
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 📦 33. SSL/TLS

**CONFIGURAR Let's Encrypt:**
```bash
sudo certbot --nginx -d archivoenlinea.com -d *.archivoenlinea.com
```

---

## ✅ CHECKLIST FINAL

Antes de desplegar a producción, verificar:

### Seguridad
- [ ] Todas las credenciales rotadas
- [ ] `.env` no está en Git
- [ ] JWT_SECRET fuerte generado
- [ ] Archivos PEM en carpeta segura
- [ ] CORS configurado correctamente
- [ ] Rate limiting ajustado
- [ ] Helmet configurado
- [ ] HTTPS habilitado

### Configuración
- [ ] NODE_ENV=production
- [ ] TypeORM synchronize=false
- [ ] Logs de producción configurados
- [ ] Health check endpoint
- [ ] Variables de entorno completas

### Base de Datos
- [ ] Migraciones ejecutadas
- [ ] Índices optimizados
- [ ] Backup automático configurado
- [ ] Pool de conexiones configurado

### Performance
- [ ] Compresión habilitada
- [ ] Caché configurado
- [ ] Build optimizado
- [ ] Lazy loading implementado
- [ ] CDN para assets estáticos

### Monitoreo
- [ ] APM configurado
- [ ] Logs centralizados
- [ ] Alertas configuradas
- [ ] Health checks activos

### Testing
- [ ] Tests unitarios pasando
- [ ] Tests E2E ejecutados
- [ ] Load testing realizado
- [ ] Smoke tests en staging

### Documentación
- [ ] README actualizado
- [ ] DEPLOYMENT.md creado
- [ ] Variables de entorno documentadas
- [ ] Runbook de operaciones

---

## 🚀 PRÓXIMOS PASOS

1. **INMEDIATO (Hoy):**
   - Rotar credenciales AWS
   - Cambiar JWT_SECRET
   - Crear `.env.example`
   - Verificar `.gitignore`

2. **CORTO PLAZO (Esta semana):**
   - Configurar logs de producción
   - Implementar health checks
   - Optimizar rate limiting
   - Ejecutar auditoría de seguridad

3. **MEDIANO PLAZO (Este mes):**
   - Configurar monitoreo APM
   - Implementar CI/CD
   - Configurar backups automáticos
   - Load testing completo

4. **LARGO PLAZO (Próximos 3 meses):**
   - Implementar PWA
   - Agregar tests E2E
   - Configurar CDN
   - Disaster recovery plan

---

**Documento creado:** 2026-01-27  
**Última actualización:** 2026-01-27  
**Estado:** 🔍 PENDIENTE DE REVISIÓN Y APROBACIÓN
