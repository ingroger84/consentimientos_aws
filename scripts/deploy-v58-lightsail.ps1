# Script simplificado para despliegue en AWS Lightsail
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE PLANTILLAS AGRUPADAS V58" -ForegroundColor Cyan
Write-Host "Servidor: AWS Lightsail (datagree)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$FRONTEND_ZIP = "frontend-dist-v58-final.zip"

# Verificar archivo
if (-not (Test-Path $FRONTEND_ZIP)) {
    Write-Host "ERROR: No se encuentra $FRONTEND_ZIP" -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] Subiendo frontend al servidor..." -ForegroundColor Yellow
scp -i $KEY $FRONTEND_ZIP "${SERVER}:/home/ubuntu/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo al subir archivo" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Frontend subido" -ForegroundColor Green
Write-Host ""

Write-Host "[2/5] Creando y subiendo script de despliegue..." -ForegroundColor Yellow
$deployScript = @'
#!/bin/bash
set -e
echo "Creando backup..."
mkdir -p /home/ubuntu/backups
sudo tar -czf /home/ubuntu/backups/frontend-backup-$(date +%Y%m%d_%H%M%S).tar.gz -C /var/www/html . 2>/dev/null || true
echo "Limpiando frontend actual..."
sudo find /var/www/html -mindepth 1 ! -name '.htaccess' -delete
echo "Desplegando nuevo frontend..."
cd /home/ubuntu
sudo unzip -o frontend-dist-v58-final.zip -d /var/www/html
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
echo "Limpiando cache de nginx..."
sudo rm -rf /var/cache/nginx/* 2>/dev/null || true
echo "Reiniciando nginx..."
sudo systemctl restart nginx
echo "Verificando despliegue..."
cat /var/www/html/version.json
echo ""
echo "DESPLIEGUE COMPLETADO"
'@

$deployScript | Out-File -FilePath "temp-deploy.sh" -Encoding ASCII -NoNewline
scp -i $KEY "temp-deploy.sh" "${SERVER}:/home/ubuntu/deploy-v58.sh"
Remove-Item "temp-deploy.sh"
Write-Host "OK - Script subido" -ForegroundColor Green
Write-Host ""

Write-Host "[3/5] Ejecutando despliegue en el servidor..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "chmod +x /home/ubuntu/deploy-v58.sh && bash /home/ubuntu/deploy-v58.sh"
Write-Host "OK - Despliegue ejecutado" -ForegroundColor Green
Write-Host ""

Write-Host "[4/5] Configurando headers anti-cache en nginx..." -ForegroundColor Yellow
$nginxConfig = @'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    index index.html;
    server_name _;
    location ~* \.html$ {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri $uri/ /index.html;
    }
    location = /version.json {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri =404;
    }
    location ~* \.(js|css)$ {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri =404;
    }
    location ~* \.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        add_header Cache-Control "public, max-age=3600";
        try_files $uri =404;
    }
    location / {
        try_files $uri $uri/ /index.html;
    }
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    if ($request_method = OPTIONS) {
        return 204;
    }
}
'@

$nginxConfig | Out-File -FilePath "temp-nginx.conf" -Encoding ASCII -NoNewline
scp -i $KEY "temp-nginx.conf" "${SERVER}:/home/ubuntu/nginx-default.conf"
ssh -i $KEY $SERVER "sudo mv /home/ubuntu/nginx-default.conf /etc/nginx/sites-available/default && sudo nginx -t && sudo systemctl reload nginx"
Remove-Item "temp-nginx.conf"
Write-Host "OK - Nginx configurado" -ForegroundColor Green
Write-Host ""

Write-Host "[5/5] Verificando despliegue final..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "echo 'Archivos desplegados:' && ls -lh /var/www/html/index.html /var/www/html/version.json && echo '' && echo 'Version:' && cat /var/www/html/version.json"
Write-Host "OK - Verificacion completada" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Abrir http://100.28.198.249 en el navegador" -ForegroundColor White
Write-Host "2. Presionar Ctrl+Shift+R (Hard Refresh)" -ForegroundColor White
Write-Host "3. Iniciar sesion como Super Admin" -ForegroundColor White
Write-Host "4. Verificar vista agrupada en Plantillas CN y HC" -ForegroundColor White
Write-Host ""
Write-Host "URL para verificar: http://100.28.198.249/version.json" -ForegroundColor Cyan
Write-Host ""
