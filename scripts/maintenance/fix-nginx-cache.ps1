# Script para corregir la configuración de caché de Nginx
# Fuerza la revalidación de archivos JavaScript y CSS

$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "AWS-ISSABEL.pem"

Write-Host "=== Corrigiendo Configuración de Caché de Nginx ===" -ForegroundColor Cyan

# Crear nueva configuración de Nginx con headers de cache más agresivos
$nginxConfig = @'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    server_name _;

    # Deshabilitar cache completamente para index.html
    location = /index.html {
        add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
        add_header Pragma 'no-cache';
        add_header Expires '0';
        add_header Last-Modified $date_gmt;
        if_modified_since off;
        etag off;
        try_files $uri =404;
    }

    # Cache corto con revalidación para archivos JS y CSS
    # Esto permite que el navegador use cache pero valide con el servidor
    location ~* ^/assets/.*\.(js|css)$ {
        add_header Cache-Control 'public, max-age=0, must-revalidate';
        add_header Last-Modified $date_gmt;
        etag on;
        try_files $uri =404;
    }

    # Cache largo para imágenes y fuentes (no cambian frecuentemente)
    location ~* ^/assets/.*\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        add_header Cache-Control 'public, max-age=31536000, immutable';
        try_files $uri =404;
    }

    # SPA fallback - todas las rutas van a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
'@

# Guardar configuración temporalmente
$nginxConfig | Out-File -FilePath "temp-nginx-config" -Encoding UTF8 -NoNewline

Write-Host "`n1. Copiando nueva configuración de Nginx..." -ForegroundColor Yellow
scp -i $KEY temp-nginx-config "${USER}@${SERVER}:/tmp/nginx-default"

Write-Host "`n2. Aplicando configuración..." -ForegroundColor Yellow
ssh -i $KEY "${USER}@${SERVER}" @"
    sudo mv /tmp/nginx-default /etc/nginx/sites-available/default
    sudo nginx -t
    if [ \$? -eq 0 ]; then
        sudo systemctl reload nginx
        echo 'Nginx recargado exitosamente'
    else
        echo 'Error en la configuración de Nginx'
        exit 1
    fi
"@

Write-Host "`n3. Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item "temp-nginx-config" -Force

Write-Host "`n=== Configuración Aplicada ===" -ForegroundColor Green
Write-Host @"

IMPORTANTE: Instrucciones para el usuario
==========================================

El problema era que Nginx estaba cacheando los archivos JavaScript por 1 año.
Ahora la configuración fuerza la revalidación en cada carga.

Para ver los cambios, el usuario debe:

1. Abrir el navegador en modo incógnito (Ctrl+Shift+N en Chrome)
   O
2. Limpiar la caché del navegador:
   - Chrome: Ctrl+Shift+Delete > Seleccionar "Imágenes y archivos en caché" > Borrar
   - Firefox: Ctrl+Shift+Delete > Seleccionar "Caché" > Limpiar ahora
   - Edge: Ctrl+Shift+Delete > Seleccionar "Imágenes y archivos en caché" > Borrar

3. Hacer un "Hard Refresh" en la página:
   - Windows: Ctrl+F5 o Ctrl+Shift+R
   - Mac: Cmd+Shift+R

Después de esto, debería ver la versión correcta: 7.0.2 - 2026-01-23

"@ -ForegroundColor Cyan

Write-Host "`nPresiona Enter para continuar..." -ForegroundColor Yellow
Read-Host
