#!/bin/bash
# Script de despliegue para ejecutar DIRECTAMENTE en el servidor
# Uso: bash deploy-templates-v58-server.sh

set -e

echo "========================================"
echo "DESPLIEGUE PLANTILLAS AGRUPADAS V58"
echo "========================================"
echo ""

# Configuración
FRONTEND_ZIP="frontend-dist-v58-final.zip"
REMOTE_PATH="/var/www/html"
BACKUP_PATH="/home/ubuntu/backups"

# Verificar que el archivo ZIP existe
if [ ! -f "/home/ubuntu/$FRONTEND_ZIP" ]; then
    echo "ERROR: No se encuentra $FRONTEND_ZIP en /home/ubuntu/"
    echo "Por favor, sube el archivo primero con:"
    echo "scp -i AWS-ISSABEL.pem frontend-dist-v58-final.zip ubuntu@18.191.132.175:/home/ubuntu/"
    exit 1
fi

echo "[1/6] Creando backup del frontend actual..."
mkdir -p $BACKUP_PATH
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
sudo tar -czf $BACKUP_PATH/frontend-backup-$TIMESTAMP.tar.gz -C $REMOTE_PATH .
echo "OK - Backup creado: frontend-backup-$TIMESTAMP.tar.gz"
echo ""

echo "[2/6] Limpiando frontend actual..."
sudo find $REMOTE_PATH -mindepth 1 ! -name '.htaccess' -delete
echo "OK - Frontend limpiado"
echo ""

echo "[3/6] Desplegando nuevo frontend..."
cd /home/ubuntu
sudo unzip -o $FRONTEND_ZIP -d $REMOTE_PATH
sudo chown -R www-data:www-data $REMOTE_PATH
sudo chmod -R 755 $REMOTE_PATH
echo "OK - Frontend desplegado"
echo ""

echo "[4/6] Configurando nginx con headers anti-cache..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINX_EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html;
    
    server_name _;
    
    # Headers anti-cache AGRESIVOS para archivos HTML
    location ~* \.html$ {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        add_header X-Content-Type-Options "nosniff";
        try_files $uri $uri/ /index.html;
    }
    
    # Headers anti-cache para version.json
    location = /version.json {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri =404;
    }
    
    # Headers anti-cache para archivos JS y CSS
    location ~* \.(js|css)$ {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri =404;
    }
    
    # Cache corto para assets con hash
    location ~* \.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        add_header Cache-Control "public, max-age=3600";
        try_files $uri =404;
    }
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # CORS headers
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    
    if ($request_method = OPTIONS) {
        return 204;
    }
}
NGINX_EOF

sudo nginx -t
echo "OK - Nginx configurado"
echo ""

echo "[5/6] Limpiando cache y reiniciando nginx..."
if [ -d /var/cache/nginx ]; then
    sudo rm -rf /var/cache/nginx/*
    echo "Cache de nginx limpiado"
fi
sudo systemctl restart nginx
echo "OK - Nginx reiniciado"
echo ""

echo "[6/6] Verificando despliegue..."
echo "Archivos desplegados:"
ls -lh $REMOTE_PATH/index.html
ls -lh $REMOTE_PATH/version.json
echo ""
echo "Contenido de version.json:"
cat $REMOTE_PATH/version.json
echo ""
echo "Archivos de plantillas:"
ls -lh $REMOTE_PATH/assets/*ConsentTemplatesPage*.js 2>/dev/null | head -1 || echo "ConsentTemplatesPage: No encontrado"
ls -lh $REMOTE_PATH/assets/*MRConsentTemplatesPage*.js 2>/dev/null | head -1 || echo "MRConsentTemplatesPage: No encontrado"
echo ""

echo "========================================"
echo "DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "========================================"
echo ""
echo "PROXIMOS PASOS:"
echo "1. Abrir http://18.191.132.175 en el navegador"
echo "2. Presionar Ctrl+Shift+R (Hard Refresh)"
echo "3. Iniciar sesion como Super Admin"
echo "4. Verificar vista agrupada en Plantillas CN y HC"
echo ""
echo "URL para verificar version: http://18.191.132.175/version.json"
echo ""
