#!/bin/bash
# Script de Configuración de Nginx con SSL
# Versión: 1.0
# Fecha: 2026-01-27

set -e

DOMAIN="archivoenlinea.com"
APP_DIR="/var/www/consentimientos"
EMAIL="admin@archivoenlinea.com"

echo "========================================"
echo "  CONFIGURACIÓN NGINX + SSL"
echo "========================================"
echo ""

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
    echo "✗ Este script debe ejecutarse como root"
    echo "  Usa: sudo bash $0"
    exit 1
fi

# PASO 1: Crear configuración de Nginx
echo "PASO 1: Creando configuración de Nginx..."

cat > /etc/nginx/sites-available/consentimientos << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name archivoenlinea.com *.archivoenlinea.com;
    
    # Permitir Certbot
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# Main server block
server {
    listen 443 ssl http2;
    server_name archivoenlinea.com *.archivoenlinea.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/archivoenlinea.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/archivoenlinea.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # SSL Session
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Logs
    access_log /var/log/nginx/consentimientos_access.log;
    error_log /var/log/nginx/consentimientos_error.log;
    
    # Frontend
    location / {
        root /var/www/consentimientos/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # No cache for HTML
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
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
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # Uploads
    location /uploads {
        proxy_pass http://localhost:3000/uploads;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Cache uploads
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

echo "  ✓ Configuración creada"

# PASO 2: Habilitar sitio
echo ""
echo "PASO 2: Habilitando sitio..."

# Deshabilitar sitio por defecto
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
    echo "  ✓ Sitio por defecto deshabilitado"
fi

# Habilitar nuevo sitio
ln -sf /etc/nginx/sites-available/consentimientos /etc/nginx/sites-enabled/
echo "  ✓ Sitio habilitado"

# PASO 3: Crear directorio para Certbot
echo ""
echo "PASO 3: Preparando directorio para Certbot..."
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot
echo "  ✓ Directorio creado"

# PASO 4: Verificar configuración
echo ""
echo "PASO 4: Verificando configuración de Nginx..."
if nginx -t; then
    echo "  ✓ Configuración válida"
else
    echo "  ✗ Error en la configuración"
    exit 1
fi

# PASO 5: Recargar Nginx (sin SSL aún)
echo ""
echo "PASO 5: Recargando Nginx..."

# Temporalmente comentar las líneas SSL para permitir Certbot
sed -i 's/listen 443 ssl http2;/listen 443;/' /etc/nginx/sites-available/consentimientos
sed -i 's/ssl_certificate/#ssl_certificate/' /etc/nginx/sites-available/consentimientos
sed -i 's/ssl_/#ssl_/' /etc/nginx/sites-available/consentimientos

systemctl reload nginx
echo "  ✓ Nginx recargado (modo HTTP temporal)"

# PASO 6: Obtener certificado SSL
echo ""
echo "PASO 6: Obteniendo certificado SSL con Certbot..."
echo "  ⚠ Asegúrate de que el DNS esté configurado correctamente"
echo ""

# Obtener certificado
certbot certonly --webroot \
    -w /var/www/certbot \
    -d $DOMAIN \
    -d "*.$DOMAIN" \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --preferred-challenges dns

if [ $? -eq 0 ]; then
    echo "  ✓ Certificado obtenido exitosamente"
else
    echo "  ✗ Error al obtener certificado"
    echo "  Intenta manualmente: sudo certbot --nginx -d $DOMAIN -d *.$DOMAIN"
    exit 1
fi

# PASO 7: Restaurar configuración SSL
echo ""
echo "PASO 7: Activando configuración SSL..."

# Restaurar líneas SSL
sed -i 's/listen 443;/listen 443 ssl http2;/' /etc/nginx/sites-available/consentimientos
sed -i 's/#ssl_certificate/ssl_certificate/' /etc/nginx/sites-available/consentimientos
sed -i 's/#ssl_/ssl_/' /etc/nginx/sites-available/consentimientos

# Verificar y recargar
if nginx -t; then
    systemctl reload nginx
    echo "  ✓ SSL activado"
else
    echo "  ✗ Error en configuración SSL"
    exit 1
fi

# PASO 8: Configurar renovación automática
echo ""
echo "PASO 8: Configurando renovación automática..."

# Crear script de renovación
cat > /etc/cron.daily/certbot-renew << 'EOF'
#!/bin/bash
certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

chmod +x /etc/cron.daily/certbot-renew
echo "  ✓ Renovación automática configurada"

# PASO 9: Optimizar Nginx
echo ""
echo "PASO 9: Optimizando configuración de Nginx..."

# Backup de configuración original
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Optimizaciones
cat >> /etc/nginx/nginx.conf << 'EOF'

# Optimizaciones de rendimiento
client_max_body_size 50M;
client_body_buffer_size 128k;
client_header_buffer_size 1k;
large_client_header_buffers 4 16k;

# Gzip
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

# Timeouts
keepalive_timeout 65;
send_timeout 60;
EOF

nginx -t && systemctl reload nginx
echo "  ✓ Optimizaciones aplicadas"

# Resumen
echo ""
echo "========================================"
echo "  CONFIGURACIÓN COMPLETADA"
echo "========================================"
echo ""
echo "Información:"
echo "  • Dominio: $DOMAIN"
echo "  • SSL: Activo"
echo "  • Renovación: Automática"
echo ""
echo "Verificaciones:"
echo "  • HTTP → HTTPS: curl -I http://$DOMAIN"
echo "  • HTTPS: curl -I https://$DOMAIN"
echo "  • SSL: curl -vI https://$DOMAIN 2>&1 | grep SSL"
echo ""
echo "Logs:"
echo "  • Access: tail -f /var/log/nginx/consentimientos_access.log"
echo "  • Error: tail -f /var/log/nginx/consentimientos_error.log"
echo ""
echo "Comandos útiles:"
echo "  • Verificar config: sudo nginx -t"
echo "  • Recargar: sudo systemctl reload nginx"
echo "  • Renovar SSL: sudo certbot renew"
echo ""
