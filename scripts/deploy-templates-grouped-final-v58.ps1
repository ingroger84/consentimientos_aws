# Script de despliegue FINAL para plantillas agrupadas v58
# Este script asegura que los cambios se vean en todos los dispositivos

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE FINAL - PLANTILLAS AGRUPADAS V58" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$FRONTEND_ZIP = "frontend-dist-v58-final.zip"
$REMOTE_PATH = "/var/www/html"
$BACKUP_PATH = "/home/ubuntu/backups"

# Verificar que existe el archivo
if (-not (Test-Path $FRONTEND_ZIP)) {
    Write-Host "ERROR: No se encuentra $FRONTEND_ZIP" -ForegroundColor Red
    exit 1
}

Write-Host "[1/7] Subiendo frontend al servidor..." -ForegroundColor Yellow
scp -i $KEY $FRONTEND_ZIP "${SERVER}:/home/ubuntu/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo al subir archivo" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Frontend subido" -ForegroundColor Green

Write-Host ""
Write-Host "[2/7] Creando backup del frontend actual..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "mkdir -p $BACKUP_PATH && sudo tar -czf $BACKUP_PATH/frontend-backup-`$(date +%Y%m%d_%H%M%S).tar.gz -C $REMOTE_PATH . && echo 'Backup creado'"
Write-Host "OK - Backup creado" -ForegroundColor Green

Write-Host ""
Write-Host "[3/7] Limpiando frontend actual..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "sudo find $REMOTE_PATH -mindepth 1 ! -name '.htaccess' -delete && echo 'Frontend limpiado'"
Write-Host "OK - Frontend limpiado" -ForegroundColor Green

Write-Host ""
Write-Host "[4/7] Desplegando nuevo frontend..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "cd /home/ubuntu && sudo unzip -o $FRONTEND_ZIP -d $REMOTE_PATH && sudo chown -R www-data:www-data $REMOTE_PATH && sudo chmod -R 755 $REMOTE_PATH && echo 'Frontend desplegado'"
Write-Host "OK - Frontend desplegado" -ForegroundColor Green

Write-Host ""
Write-Host "[5/7] Configurando headers anti-cache en nginx..." -ForegroundColor Yellow
ssh -i $KEY $SERVER @"
    sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINX_EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root $REMOTE_PATH;
    index index.html;
    
    server_name _;
    
    # Headers anti-cache AGRESIVOS para archivos HTML
    location ~* \\.html\$ {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        add_header X-Content-Type-Options "nosniff";
        try_files \\\$uri \\\$uri/ /index.html;
    }
    
    # Headers anti-cache para version.json
    location = /version.json {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files \\\$uri =404;
    }
    
    # Headers anti-cache para archivos JS y CSS (con hash en nombre)
    location ~* \\.(js|css)\$ {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files \\\$uri =404;
    }
    
    # Cache corto para assets con hash
    location ~* \\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        add_header Cache-Control "public, max-age=3600";
        try_files \\\$uri =404;
    }
    
    # SPA fallback
    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }
    
    # CORS headers
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    
    if (\\\$request_method = OPTIONS) {
        return 204;
    }
}
NGINX_EOF

    # Verificar configuración
    sudo nginx -t
    
    # Recargar nginx
    sudo systemctl reload nginx
    
    echo "Nginx configurado con headers anti-cache"
"@
Write-Host "OK - Nginx configurado" -ForegroundColor Green

Write-Host ""
Write-Host "[6/7] Limpiando cache del servidor..." -ForegroundColor Yellow
ssh -i $KEY $SERVER @"
    if [ -d /var/cache/nginx ]; then
        sudo rm -rf /var/cache/nginx/*
        echo "Cache de nginx limpiado"
    fi
    sudo systemctl restart nginx
    echo "Nginx reiniciado"
"@
Write-Host "OK - Cache del servidor limpiado" -ForegroundColor Green

Write-Host ""
Write-Host "[7/7] Verificando despliegue..." -ForegroundColor Yellow
ssh -i $KEY $SERVER @"
    echo "Verificando archivos desplegados:"
    ls -lh $REMOTE_PATH/index.html
    ls -lh $REMOTE_PATH/version.json
    echo ""
    echo "Contenido de version.json:"
    cat $REMOTE_PATH/version.json
    echo ""
    echo "Verificando archivos de plantillas:"
    ls -lh $REMOTE_PATH/assets/*ConsentTemplatesPage*.js 2>/dev/null | head -1 || echo "No encontrado"
    ls -lh $REMOTE_PATH/assets/*MRConsentTemplatesPage*.js 2>/dev/null | head -1 || echo "No encontrado"
"@
Write-Host "OK - Verificacion completada" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "INSTRUCCIONES PARA VERIFICAR EN EL NAVEGADOR:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abrir DevTools (F12)" -ForegroundColor White
Write-Host "2. Ir a la pestana Network" -ForegroundColor White
Write-Host "3. Marcar Disable cache" -ForegroundColor White
Write-Host "4. Hacer HARD REFRESH:" -ForegroundColor White
Write-Host "   - Windows/Linux: Ctrl + Shift + R" -ForegroundColor Cyan
Write-Host "   - Mac: Cmd + Shift + R" -ForegroundColor Cyan
Write-Host "5. Verificar que version.json muestra: 41.1.6" -ForegroundColor White
Write-Host "6. Verificar que los archivos JS tienen codigo 200 (no 304)" -ForegroundColor White
Write-Host ""
Write-Host "Si aun no ves los cambios:" -ForegroundColor Yellow
Write-Host "- Borrar datos del sitio en el navegador" -ForegroundColor White
Write-Host "- Probar en modo incognito" -ForegroundColor White
Write-Host "- Verificar que estas usando el usuario Super Admin correcto" -ForegroundColor White
Write-Host ""
Write-Host "URL para verificar: http://18.191.132.175/version.json" -ForegroundColor Cyan
Write-Host ""
