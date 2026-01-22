# Configuración de Dominio datagree.net

**Fecha:** 2026-01-21  
**Dominio:** datagree.net

---

## 📋 Requisitos Previos

- ✅ Dominio datagree.net registrado
- ✅ Acceso al panel de DNS del dominio
- ✅ Servidor AWS Lightsail configurado
- ✅ IP pública del servidor
- ✅ Nginx instalado en el servidor
- ✅ Certbot instalado para SSL

---

## 🌐 Paso 1: Configuración DNS

### Registros DNS Necesarios:

```dns
# Registro A para dominio principal
Tipo: A
Nombre: @
Valor: [IP_DEL_SERVIDOR]
TTL: 3600

# Registro A wildcard para subdominios
Tipo: A
Nombre: *
Valor: [IP_DEL_SERVIDOR]
TTL: 3600

# Registro CNAME para www
Tipo: CNAME
Nombre: www
Valor: datagree.net
TTL: 3600

# Registro A para API (opcional)
Tipo: A
Nombre: api
Valor: [IP_DEL_SERVIDOR]
TTL: 3600
```

### Ejemplo con AWS Route 53:

1. Ir a Route 53 Console
2. Seleccionar la zona hospedada de datagree.net
3. Crear los siguientes registros:

```
datagree.net.           A       [IP_SERVIDOR]
*.datagree.net.         A       [IP_SERVIDOR]
www.datagree.net.       CNAME   datagree.net
api.datagree.net.       A       [IP_SERVIDOR]
```

### Verificar Propagación DNS:

```bash
# Verificar dominio principal
nslookup datagree.net

# Verificar wildcard
nslookup test.datagree.net

# Verificar www
nslookup www.datagree.net

# Verificar API
nslookup api.datagree.net
```

**Nota:** La propagación DNS puede tardar de 1 a 48 horas.

---

## 🔧 Paso 2: Configuración Nginx

### Conectar al Servidor:

```bash
ssh -i AWS-ISSABEL.pem ubuntu@[IP_SERVIDOR]
```

### Crear Configuración de Nginx:

```bash
sudo nano /etc/nginx/sites-available/datagree.net
```

### Contenido del Archivo:

```nginx
# Landing Page Principal (datagree.net)
server {
    listen 80;
    server_name datagree.net www.datagree.net;

    # Logs
    access_log /var/log/nginx/datagree-access.log;
    error_log /var/log/nginx/datagree-error.log;

    # Frontend (Landing Page)
    location / {
        root /home/ubuntu/consentimientos_aws/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Headers de seguridad
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # API Backend
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
    }

    # Archivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        root /home/ubuntu/consentimientos_aws/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Subdominios de Tenants (*.datagree.net)
server {
    listen 80;
    server_name *.datagree.net;

    # Logs
    access_log /var/log/nginx/tenants-access.log;
    error_log /var/log/nginx/tenants-error.log;

    # Frontend (Aplicación de Tenants)
    location / {
        root /home/ubuntu/consentimientos_aws/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Headers de seguridad
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # API Backend
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
    }

    # Archivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        root /home/ubuntu/consentimientos_aws/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# API Dedicada (api.datagree.net) - Opcional
server {
    listen 80;
    server_name api.datagree.net;

    # Logs
    access_log /var/log/nginx/api-access.log;
    error_log /var/log/nginx/api-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Habilitar el Sitio:

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/datagree.net /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

---

## 🔒 Paso 3: Configuración SSL (Let's Encrypt)

### Instalar Certbot (si no está instalado):

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Obtener Certificado SSL:

```bash
# Certificado para dominio principal y wildcard
sudo certbot --nginx -d datagree.net -d www.datagree.net -d *.datagree.net

# O certificado solo para dominio principal (más fácil)
sudo certbot --nginx -d datagree.net -d www.datagree.net
```

**Nota:** Para certificado wildcard, necesitas validación DNS manual.

### Alternativa: Certificado Wildcard con DNS Challenge:

```bash
# Instalar plugin de DNS (ejemplo con Route 53)
sudo apt install python3-certbot-dns-route53 -y

# Obtener certificado wildcard
sudo certbot certonly \
  --dns-route53 \
  -d datagree.net \
  -d *.datagree.net \
  --email tu-email@ejemplo.com \
  --agree-tos
```

### Renovación Automática:

```bash
# Verificar renovación automática
sudo certbot renew --dry-run

# Agregar cron job (si no existe)
sudo crontab -e

# Agregar línea:
0 0 * * * certbot renew --quiet
```

---

## ⚙️ Paso 4: Configuración de Variables de Entorno

### Frontend:

```bash
cd /home/ubuntu/consentimientos_aws/frontend
nano .env
```

```env
VITE_API_URL=https://datagree.net/api
VITE_BASE_DOMAIN=datagree.net
```

### Backend:

```bash
cd /home/ubuntu/consentimientos_aws/backend
nano .env
```

```env
BASE_DOMAIN=datagree.net
FRONTEND_URL=https://datagree.net

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=noreply@datagree.net
SMTP_FROM_NAME=DataGree

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=consentimientos

# JWT
JWT_SECRET=tu_secret_key_super_seguro

# AWS S3
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=datagree-uploads
```

---

## 🚀 Paso 5: Compilar y Desplegar

### Compilar Frontend:

```bash
cd /home/ubuntu/consentimientos_aws/frontend
npm install
npm run build
```

### Reiniciar Backend:

```bash
cd /home/ubuntu/consentimientos_aws/backend
npm install
pm2 restart datagree-backend
```

### Verificar Estado:

```bash
# Ver logs del backend
pm2 logs datagree-backend

# Ver estado de Nginx
sudo systemctl status nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/datagree-access.log
sudo tail -f /var/log/nginx/datagree-error.log
```

---

## ✅ Paso 6: Verificación

### Verificar Dominio Principal:

```bash
# Abrir en navegador:
https://datagree.net

# Verificar que:
- ✅ La landing page se carga
- ✅ El certificado SSL es válido
- ✅ No hay errores en consola
- ✅ Los planes se cargan correctamente
```

### Verificar Subdominios:

```bash
# Crear una cuenta de prueba desde la landing
# Luego acceder a:
https://[slug-creado].datagree.net/login

# Verificar que:
- ✅ El subdominio funciona
- ✅ El certificado SSL es válido
- ✅ El login funciona
- ✅ El dashboard se carga
```

### Verificar API:

```bash
# Probar endpoint público:
curl https://datagree.net/api/tenants/plans

# Debe retornar JSON con los planes
```

### Verificar Correos:

```bash
# Crear una cuenta de prueba
# Verificar que:
- ✅ El correo de bienvenida llega
- ✅ El contenido es correcto
- ✅ Los enlaces funcionan
```

---

## 🐛 Solución de Problemas

### Error: "502 Bad Gateway"

**Causa:** Backend no está corriendo

**Solución:**
```bash
pm2 restart datagree-backend
pm2 logs datagree-backend
```

### Error: "SSL Certificate Error"

**Causa:** Certificado no instalado o expirado

**Solución:**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Error: "DNS not resolving"

**Causa:** DNS no propagado o mal configurado

**Solución:**
```bash
# Verificar DNS
nslookup datagree.net

# Esperar propagación (hasta 48h)
# Verificar configuración en Route 53
```

### Error: "CORS Error"

**Causa:** CORS mal configurado en backend

**Solución:**
```bash
# Verificar backend/.env
FRONTEND_URL=https://datagree.net

# Reiniciar backend
pm2 restart datagree-backend
```

### Error: "Email not sending"

**Causa:** SMTP mal configurado

**Solución:**
```bash
# Verificar backend/.env
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# Si usas Gmail, habilitar "App Passwords"
# https://myaccount.google.com/apppasswords
```

---

## 📊 Monitoreo

### Logs de Nginx:

```bash
# Access logs
sudo tail -f /var/log/nginx/datagree-access.log

# Error logs
sudo tail -f /var/log/nginx/datagree-error.log
```

### Logs de Backend:

```bash
# Ver logs en tiempo real
pm2 logs datagree-backend

# Ver logs históricos
pm2 logs datagree-backend --lines 100
```

### Métricas de PM2:

```bash
# Ver estado y métricas
pm2 monit

# Ver lista de procesos
pm2 list
```

---

## 🔄 Mantenimiento

### Actualizar Código:

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@[IP_SERVIDOR]

# Ir al directorio del proyecto
cd /home/ubuntu/consentimientos_aws

# Pull cambios
git pull

# Actualizar frontend
cd frontend
npm install
npm run build

# Actualizar backend
cd ../backend
npm install
pm2 restart datagree-backend
```

### Backup de Base de Datos:

```bash
# Crear backup
pg_dump -U postgres consentimientos > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U postgres consentimientos < backup_20260121.sql
```

### Renovar SSL:

```bash
# Renovar certificados
sudo certbot renew

# Recargar Nginx
sudo systemctl reload nginx
```

---

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisar logs de Nginx y Backend
2. Verificar variables de entorno
3. Verificar DNS con `nslookup`
4. Verificar SSL con `openssl s_client -connect datagree.net:443`
5. Consultar documentación en `doc/27-landing-page-saas/`

---

## ✅ Checklist Final

Antes de dar por terminado:

- [ ] DNS configurado y propagado
- [ ] Nginx configurado y funcionando
- [ ] SSL instalado y válido
- [ ] Variables de entorno actualizadas
- [ ] Frontend compilado y desplegado
- [ ] Backend reiniciado
- [ ] Landing page accesible
- [ ] Subdominios funcionando
- [ ] Registro de cuenta funciona
- [ ] Correos se envían correctamente
- [ ] Login funciona
- [ ] Dashboard se carga

---

**Última actualización:** 2026-01-21  
**Dominio:** datagree.net  
**Estado:** 📝 Pendiente de configuración

**Desarrollado con ❤️ por Innova Systems**
