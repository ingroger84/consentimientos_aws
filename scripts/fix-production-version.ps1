# Script para corregir version en produccion
# Fecha: 2026-01-23

Write-Host "=== CORRECCION DE VERSION EN PRODUCCION ===" -ForegroundColor Cyan
Write-Host ""

# 1. Compilar frontend
Write-Host "1. Compilando frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo la compilacion" -ForegroundColor Red
    exit 1
}
Write-Host "OK Frontend compilado" -ForegroundColor Green
Set-Location ..

# 2. Limpiar servidor
Write-Host ""
Write-Host "2. Limpiando servidor..." -ForegroundColor Yellow
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo rm -rf /var/www/html/*"
Write-Host "OK Servidor limpio" -ForegroundColor Green

# 3. Subir archivos
Write-Host ""
Write-Host "3. Subiendo archivos..." -ForegroundColor Yellow
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "mkdir -p /tmp/dist_new"
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/tmp/dist_new/
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo mv /tmp/dist_new/* /var/www/html/ ; sudo chown -R www-data:www-data /var/www/html ; sudo chmod -R 755 /var/www/html ; rm -rf /tmp/dist_new"
Write-Host "OK Archivos subidos" -ForegroundColor Green

# 4. Actualizar Nginx
Write-Host ""
Write-Host "4. Actualizando Nginx..." -ForegroundColor Yellow
$nginxConfig = @'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    server_name _;

    location = /index.html {
        add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
        add_header Pragma 'no-cache';
        add_header Expires '0';
        add_header Last-Modified $date_gmt;
        if_modified_since off;
        etag off;
        try_files $uri =404;
    }

    location ~* ^/assets/.*\.(js|css)$ {
        add_header Cache-Control 'public, max-age=0, must-revalidate';
        add_header Last-Modified $date_gmt;
        etag on;
        try_files $uri =404;
    }

    location ~* ^/assets/.*\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        add_header Cache-Control 'public, max-age=31536000, immutable';
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

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

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
'@

$nginxConfig | ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo tee /etc/nginx/sites-available/default > /dev/null"
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo nginx -t ; sudo systemctl reload nginx"
Write-Host "OK Nginx actualizado" -ForegroundColor Green

# 5. Verificar
Write-Host ""
Write-Host "5. Verificando..." -ForegroundColor Yellow
$indexFile = ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cat /var/www/html/index.html | grep -o 'index-[^.]*\.js' | head -1"
Write-Host "Archivo principal: $indexFile" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== COMPLETADO ===" -ForegroundColor Green
Write-Host "Los usuarios deben limpiar cache del navegador" -ForegroundColor Yellow
Write-Host ""
