# Script para corregir el root de Nginx y redesplegar frontend
# Fecha: 2026-01-23

Write-Host "=== CORRECCION DE NGINX ROOT Y REDESPLIEGUE FRONTEND ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar versión local
Write-Host "1. Verificando versión local..." -ForegroundColor Yellow
$versionLocal = Get-Content "VERSION.md" | Select-String "## Versión Actual: (.+)" | ForEach-Object { $_.Matches.Groups[1].Value }
Write-Host "   Versión local: $versionLocal" -ForegroundColor Green

# 2. Compilar frontend
Write-Host ""
Write-Host "2. Compilando frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERROR: Falló la compilación del frontend" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Frontend compilado correctamente" -ForegroundColor Green
Set-Location ..

# 3. Crear backup del servidor
Write-Host ""
Write-Host "3. Creando backup en servidor..." -ForegroundColor Yellow
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo mkdir -p /var/www/html_backup_`$(date +%Y%m%d_%H%M%S) ; sudo cp -r /var/www/html/* /var/www/html_backup_`$(date +%Y%m%d_%H%M%S)/ 2>/dev/null"
Write-Host "   OK Backup creado" -ForegroundColor Green

# 4. Limpiar directorio antiguo
Write-Host ""
Write-Host "4. Limpiando archivos antiguos en servidor..." -ForegroundColor Yellow
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo rm -rf /var/www/html/*"
Write-Host "   OK Archivos antiguos eliminados" -ForegroundColor Green

# 5. Subir nuevos archivos
Write-Host ""
Write-Host "5. Subiendo archivos nuevos..." -ForegroundColor Yellow
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "mkdir -p /tmp/dist_new"
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/tmp/dist_new/
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo mv /tmp/dist_new/* /var/www/html/ ; sudo chown -R www-data:www-data /var/www/html ; sudo chmod -R 755 /var/www/html ; rm -rf /tmp/dist_new"
Write-Host "   OK Archivos subidos correctamente" -ForegroundColor Green

# 6. Actualizar configuración de Nginx
Write-Host ""
Write-Host "6. Actualizando configuración de Nginx..." -ForegroundColor Yellow
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

    # Cache corto con revalidacion para archivos JS y CSS
    location ~* ^/assets/.*\.(js|css)$ {
        add_header Cache-Control 'public, max-age=0, must-revalidate';
        add_header Last-Modified $date_gmt;
        etag on;
        try_files $uri =404;
    }

    # Cache largo para imagenes y fuentes
    location ~* ^/assets/.*\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        add_header Cache-Control 'public, max-age=31536000, immutable';
        try_files $uri =404;
    }

    # SPA fallback
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

$nginxConfig | ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo tee /etc/nginx/sites-available/default > /dev/null"
Write-Host "   OK Configuracion de Nginx actualizada" -ForegroundColor Green

# 7. Verificar y recargar Nginx
Write-Host ""
Write-Host "7. Verificando y recargando Nginx..." -ForegroundColor Yellow
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo nginx -t ; sudo systemctl reload nginx"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Nginx recargado correctamente" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Fallo la recarga de Nginx" -ForegroundColor Red
    exit 1
}

# 8. Verificar versión desplegada
Write-Host ""
Write-Host "8. Verificando versión desplegada..." -ForegroundColor Yellow
$versionServidor = ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cat /var/www/html/index.html | grep -o 'index-[^.]*\.js' | head -1"
Write-Host "   Archivo principal: $versionServidor" -ForegroundColor Cyan

$versionEnArchivo = ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cat /var/www/html/assets/$versionServidor 2>/dev/null | grep -ao '7\.0\.[0-9]' | head -1"
Write-Host "   Versión en archivo: $versionEnArchivo" -ForegroundColor Cyan

# 9. Resumen
Write-Host ""
Write-Host "=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "OK Frontend compilado con version: $versionLocal" -ForegroundColor Green
Write-Host "OK Archivos desplegados en: /var/www/html/" -ForegroundColor Green
Write-Host "OK Nginx configurado correctamente" -ForegroundColor Green
Write-Host "OK Archivo principal: $versionServidor" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: Los usuarios deben limpiar cache del navegador:" -ForegroundColor Yellow
Write-Host "  - Modo incognito: Ctrl Shift N" -ForegroundColor White
Write-Host "  - Hard refresh: Ctrl F5" -ForegroundColor White
Write-Host "  - Limpiar cache: Ctrl Shift Supr" -ForegroundColor White
Write-Host ""
