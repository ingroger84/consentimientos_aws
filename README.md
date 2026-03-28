# Sistema de Consentimientos Digitales

**Versión:** 77.1.0  
**Última actualización:** 2026-03-28

Sistema multi-tenant para gestión de consentimientos informados y historias clínicas digitales con integración de pagos Bold.

## 🚀 Características Principales

- ✅ Multi-tenant con aislamiento completo de datos
- ✅ Gestión de consentimientos informados digitales
- ✅ Historias clínicas electrónicas (cumplimiento normativo colombiano)
- ✅ Sistema de facturación y pagos con Bold
- ✅ Planes de suscripción flexibles
- ✅ Backups automáticos a AWS S3
- ✅ Plantillas personalizables por tenant
- ✅ Firma digital de documentos
- ✅ Generación de PDFs automática
- ✅ Sistema de notificaciones y recordatorios

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+ (Supabase)
- AWS S3 (almacenamiento)
- Bold API (pagos)
- PM2 (producción)

## 🛠️ Instalación

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm install
npm run build
```

## 📁 Estructura del Proyecto

```
├── backend/              # API NestJS
│   ├── src/
│   │   ├── auth/        # Autenticación y sesiones
│   │   ├── tenants/     # Multi-tenancy
│   │   ├── invoices/    # Facturación
│   │   ├── payments/    # Pagos Bold
│   │   ├── medical-records/  # Historias clínicas
│   │   ├── consents/    # Consentimientos
│   │   └── ...
│   └── migrations/      # Migraciones de BD
│
├── frontend/            # React + TypeScript
│   ├── src/
│   │   ├── pages/       # Páginas
│   │   ├── components/  # Componentes
│   │   ├── services/    # API clients
│   │   └── stores/      # Estado global (Zustand)
│   └── dist/            # Build de producción
│
├── doc/                 # Documentación actual
│   ├── 76-pagos-registro/
│   ├── 75-tipos-documento/
│   ├── 74-integracion-bold/
│   └── ...
│
├── database/            # Base de datos
│   ├── migrations/      # Migraciones SQL
│   ├── seeds/           # Seeds de datos
│   └── queries/         # Queries de diagnóstico
│
├── scripts/             # Scripts de despliegue
│
├── tests/               # Tests y diagnósticos
│   ├── api/             # Tests de API
│   ├── diagnostics/     # Scripts de diagnóstico
│   └── integration/     # Tests de integración
│
├── nginx/               # Configuraciones nginx
│
├── config/              # Configuraciones
│   ├── ecosystem/       # PM2 configs
│   └── nginx/           # Nginx configs
│
└── archive/             # Archivos históricos
    ├── builds/          # Builds antiguos
    ├── old-docs/        # Documentación histórica
    ├── old-scripts/     # Scripts antiguos
    ├── logs/            # Logs históricos
    └── temp-files/      # Archivos temporales
```

## 🔧 Configuración

### Variables de Entorno Críticas

```env
# Base de datos
DB_HOST=db.witvuzaarlqxkiqfiljq.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_DATABASE=postgres
DB_SSL=true

# Bold Pagos
BOLD_API_KEY=tu_api_key
BOLD_SECRET_KEY=tu_secret_key
BOLD_MERCHANT_ID=tu_merchant_id
BOLD_API_URL=https://integrations.api.bold.co

# AWS S3
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_S3_BUCKET=tu_bucket
AWS_REGION=us-east-1

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
```

## 🚀 Despliegue

### Servidor AWS (100.28.198.249)

```bash
# Desplegar backend
scp -i AWS-ISSABEL.pem -r backend/dist ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/

# Desplegar frontend
scp -i AWS-ISSABEL.pem -r frontend/dist ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/

# Reiniciar servicio
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cd /home/ubuntu/consentimientos_aws && pm2 restart datagree"
```

## 📊 Optimizaciones Recientes (v77.0.0)

- ✅ 34 índices nuevos en base de datos
- ✅ Mejora de 40-70% en queries principales
- ✅ Optimización de búsquedas por tenant
- ✅ Índices compuestos para queries frecuentes

Ver detalles en: `doc/OPTIMIZACION_BASE_DATOS_V77.0.md`

## 🔐 Seguridad

- Autenticación JWT con sesiones
- Aislamiento de datos por tenant
- Rate limiting
- Validación de inputs
- Sanitización de datos
- CORS configurado
- Helmet para headers de seguridad

## 📈 Rendimiento

### Métricas Actuales:
- Query facturas por tenant: ~50ms
- Login de usuario: ~80ms
- Dashboard Super Admin: ~300ms
- Generación de PDF: ~500ms

### Capacidad:
- 1000+ tenants simultáneos
- 10,000+ consentimientos/día
- 5,000+ historias clínicas activas

## 🐛 Troubleshooting

### Problema: Pago no se procesa automáticamente
**Solución:** Los webhooks de Bold pueden tardar. El sistema tiene cron jobs que verifican pagos cada 2 y 10 minutos.

### Problema: Sesiones expiradas
**Solución:** Limpiar sesiones manualmente:
```sql
DELETE FROM user_sessions WHERE "expiresAt" < NOW();
```

### Problema: Caché del navegador
**Solución:** El sistema usa cache busting automático con timestamps en archivos.

## 📚 Documentación

- `doc/74-integracion-bold/` - Integración con Bold
- `doc/76-pagos-registro/` - Pago en registro de tenants
- `doc/OPTIMIZACION_BASE_DATOS_V77.0.md` - Optimizaciones de BD
- `doc/ANALISIS_MEJORAS_SISTEMA_V77.0.md` - Mejoras futuras

## 🤝 Soporte

- Email: info@innovasystems.com.co
- Super Admin: rcaraballo@innovasystems.com.co

## 📝 Changelog

### v77.1.0 (2026-03-28)
- Optimización de base de datos (34 índices)
- Análisis de mejoras del sistema
- Documentación organizada

### v76.3.1 (2026-03-28)
- Fix: Confirmación de pago para usuarios no autenticados
- Endpoint público para info de facturas

### v76.3.0 (2026-03-28)
- Pago automático en registro de tenants
- Generación de factura al crear cuenta
- Página de pago antes de ingresar al sistema

### v76.2.0 (2026-03-27)
- Solución permanente para webhooks Bold
- Monitoreo automático de pagos (cron jobs)
- Logging de webhooks

## 📄 Licencia

Propietario: Innova Systems  
Uso privado - Todos los derechos reservados
