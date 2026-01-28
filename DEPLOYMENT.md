# Guía de Despliegue a Producción

**Proyecto:** Sistema de Consentimientos Digitales  
**Versión:** 15.1.0  
**Fecha:** 2026-01-27

---

## ⚠️ ADVERTENCIA IMPORTANTE

**ANTES DE CONTINUAR**, debes completar TODAS las acciones críticas listadas en:
- `doc/90-auditoria-produccion/ACCIONES_CRITICAS.md`

**NO DESPLEGAR** sin haber rotado las credenciales expuestas.

---

## 📋 PRE-REQUISITOS

### Servidor
- Ubuntu 20.04 LTS o superior
- 2 GB RAM mínimo (4 GB recomendado)
- 20 GB disco
- Node.js 18.x o superior
- PostgreSQL 14 o superior
- Nginx
- PM2

### Accesos
- Acceso SSH al servidor
- Credenciales de base de datos
- Credenciales AWS (S3)
- Credenciales Gmail (SMTP)
- Credenciales Bold (Pagos)

### Dominio
- Dominio configurado (ej: archivoenlinea.com)
- DNS apuntando al servidor
- Wildcard DNS configurado (*.archivoenlinea.com)

---

## 🚀 PASO 1: PREPARAR SERVIDOR

### 1.1 Actualizar Sistema
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 1.2 Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verificar versión
```

### 1.3 Instalar PostgreSQL
```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 1.4 Instalar Nginx
```bash
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 Instalar PM2
```bash
sudo npm install -g pm2
pm2 startup
```

### 1.6 Instalar Git
```bash
sudo apt-get install -y git
```

---

## 🗄️ PASO 2: CONFIGURAR BASE DE DATOS

### 2.1 Crear Usuario y Base de Datos
```bash
sudo -u postgres psql

CREATE USER admin WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE consentimientos OWNER admin;
GRANT ALL PRIVILEGES ON DATABASE consentimientos TO admin;
\q
```

### 2.2 Configurar Acceso Remoto (Opcional)
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
# Descomentar y cambiar:
# listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Agregar:
# host    all             all             0.0.0.0/0               md5

sudo systemctl restart postgresql
```

---

## 📦 PASO 3: CLONAR Y CONFIGURAR PROYECTO

### 3.1 Clonar Repositorio
```bash
cd /var/www
sudo git clone https://github.com/tu-usuario/consentimientos.git
sudo chown -R $USER:$USER consentimientos
cd consentimientos
```

### 3.2 Configurar Variables de Entorno Backend
```bash
cd backend
cp .env.example .env
nano .env
```

**Actualizar con valores reales:**
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=tu_password_seguro
DB_DATABASE=consentimientos
JWT_SECRET=tu_jwt_secret_generado
AWS_ACCESS_KEY_ID=tu_aws_key
AWS_SECRET_ACCESS_KEY=tu_aws_secret
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
CORS_ORIGIN=https://archivoenlinea.com
BASE_DOMAIN=archivoenlinea.com
```

### 3.3 Configurar Variables de Entorno Frontend
```bash
cd ../frontend
cp .env.example .env
nano .env
```

**Actualizar:**
```env
VITE_API_URL=https://archivoenlinea.com
VITE_NODE_ENV=production
```

---

## 🏗️ PASO 4: INSTALAR DEPENDENCIAS Y COMPILAR

### 4.1 Backend
```bash
cd /var/www/consentimientos/backend
npm ci --production
npm run build
```

### 4.2 Frontend
```bash
cd /var/www/consentimientos/frontend
npm ci
npm run build
```

---

## 🔄 PASO 5: EJECUTAR MIGRACIONES

### 5.1 Ejecutar Migraciones de Base de Datos
```bash
cd /var/www/consentimientos/backend
npm run migration:run
```

### 5.2 Ejecutar Migración de Límites HC
```bash
# En Windows (desarrollo):
.\apply-hc-limits-migration.ps1

# En Linux (producción):
psql -h localhost -U admin -d consentimientos -f add-hc-limits-to-plans.sql
```

### 5.3 Verificar Migraciones
```bash
psql -h localhost -U admin -d consentimientos

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'plans' 
AND column_name IN ('medical_records_limit', 'mr_consent_templates_limit', 'consent_templates_limit');

\q
```

---

## 🚀 PASO 6: CONFIGURAR PM2

### 6.1 Iniciar Aplicación
```bash
cd /var/www/consentimientos
pm2 start ecosystem.config.js --env production
```

### 6.2 Guardar Configuración
```bash
pm2 save
pm2 startup
# Ejecutar el comando que PM2 muestra
```

### 6.3 Verificar Estado
```bash
pm2 status
pm2 logs
```

---

## 🌐 PASO 7: CONFIGURAR NGINX

### 7.1 Crear Configuración
```bash
sudo nano /etc/nginx/sites-available/consentimientos
```

**Contenido:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name archivoenlinea.com *.archivoenlinea.com;
    return 301 https://$host$request_uri;
}

# Main server block
server {
    listen 443 ssl http2;
    server_name archivoenlinea.com *.archivoenlinea.com;
    
    # SSL Configuration (actualizar después de obtener certificados)
    ssl_certificate /etc/letsencrypt/live/archivoenlinea.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/archivoenlinea.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Frontend
    location / {
        root /var/www/consentimientos/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Uploads
    location /uploads {
        proxy_pass http://localhost:3000/uploads;
        proxy_set_header Host $host;
        
        # Cache uploads
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7.2 Habilitar Sitio
```bash
sudo ln -s /etc/nginx/sites-available/consentimientos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 PASO 8: CONFIGURAR SSL/TLS

### 8.1 Instalar Certbot
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### 8.2 Obtener Certificado
```bash
sudo certbot --nginx -d archivoenlinea.com -d *.archivoenlinea.com
```

### 8.3 Configurar Renovación Automática
```bash
sudo certbot renew --dry-run
```

---

## 🔍 PASO 9: VERIFICAR DESPLIEGUE

### 9.1 Health Check
```bash
curl https://archivoenlinea.com/api/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-27T...",
  "uptime": 123.45
}
```

### 9.2 Verificar Frontend
```bash
curl -I https://archivoenlinea.com
```

**Debe retornar:** `HTTP/2 200`

### 9.3 Verificar Logs
```bash
pm2 logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 📊 PASO 10: CONFIGURAR MONITOREO

### 10.1 Configurar PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 10.2 Configurar Backups Automáticos
```bash
sudo crontab -e
```

**Agregar:**
```cron
# Backup diario a las 2 AM
0 2 * * * /usr/bin/pg_dump -h localhost -U admin consentimientos > /backups/db_$(date +\%Y\%m\%d).sql

# Limpiar backups antiguos (mantener últimos 7 días)
0 3 * * * find /backups -name "db_*.sql" -mtime +7 -delete
```

### 10.3 Crear Carpeta de Backups
```bash
sudo mkdir -p /backups
sudo chown $USER:$USER /backups
```

---

## 🧪 PASO 11: PRUEBAS POST-DESPLIEGUE

### 11.1 Smoke Tests
```bash
# Health check
curl https://archivoenlinea.com/api/health

# Login Super Admin
curl -X POST https://archivoenlinea.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@sistema.com","password":"tu_password"}'

# Obtener planes públicos
curl https://archivoenlinea.com/api/plans/public
```

### 11.2 Verificar Funcionalidades Críticas
- [ ] Login Super Admin
- [ ] Login Tenant
- [ ] Crear consentimiento
- [ ] Generar PDF
- [ ] Subir archivo a S3
- [ ] Enviar email
- [ ] Crear historia clínica
- [ ] Gestión de planes

---

## 🔄 PASO 12: CONFIGURAR CI/CD (Opcional)

### 12.1 Crear Script de Despliegue
```bash
chmod +x scripts/deploy-production.sh
```

### 12.2 Configurar GitHub Actions (Opcional)
Crear `.github/workflows/deploy.yml`

---

## 📝 PASO 13: DOCUMENTACIÓN

### 13.1 Actualizar README
- URL de producción
- Credenciales de acceso (seguras)
- Procedimientos de operación

### 13.2 Crear Runbook
- Procedimientos de emergencia
- Contactos de soporte
- Comandos útiles

---

## 🚨 TROUBLESHOOTING

### Problema: Backend no inicia
```bash
pm2 logs
# Verificar errores en logs
# Verificar variables de entorno
# Verificar conexión a base de datos
```

### Problema: Frontend no carga
```bash
sudo nginx -t
sudo systemctl status nginx
# Verificar permisos de archivos
# Verificar build de frontend
```

### Problema: Base de datos no conecta
```bash
sudo systemctl status postgresql
psql -h localhost -U admin -d consentimientos
# Verificar credenciales en .env
# Verificar pg_hba.conf
```

### Problema: SSL no funciona
```bash
sudo certbot certificates
sudo nginx -t
# Verificar configuración de Nginx
# Renovar certificados si es necesario
```

---

## 📞 SOPORTE

**En caso de problemas:**
1. Revisar logs: `pm2 logs`
2. Verificar estado: `pm2 status`
3. Consultar documentación: `doc/90-auditoria-produccion/`
4. Contactar equipo de desarrollo

---

## ✅ CHECKLIST FINAL

- [ ] Servidor configurado
- [ ] Base de datos creada y migrada
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Aplicación compilada
- [ ] PM2 configurado y corriendo
- [ ] Nginx configurado
- [ ] SSL/TLS configurado
- [ ] Health check respondiendo
- [ ] Backups configurados
- [ ] Monitoreo activo
- [ ] Pruebas post-despliegue completadas
- [ ] Documentación actualizada

---

**Documento creado:** 2026-01-27  
**Última actualización:** 2026-01-27  
**Versión:** 1.0
