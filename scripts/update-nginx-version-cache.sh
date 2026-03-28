#!/bin/bash

# Script para agregar no-cache a version.json en Nginx

CONFIG_FILE="/etc/nginx/sites-available/archivoenlinea"
BACKUP_FILE="/etc/nginx/sites-available/archivoenlinea.backup.$(date +%Y%m%d_%H%M%S)"

# Crear backup
sudo cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "✅ Backup creado: $BACKUP_FILE"

# Agregar configuración de version.json después de la línea de index.html
sudo sed -i '/location = \/index.html {/,/}/a\
\
    location = /version.json {\
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";\
        add_header Pragma "no-cache";\
        add_header Expires "0";\
    }' "$CONFIG_FILE"

echo "✅ Configuración actualizada"

# Verificar configuración
sudo nginx -t

if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "✅ Nginx recargado exitosamente"
else
    echo "❌ Error en configuración de Nginx"
    sudo cp "$BACKUP_FILE" "$CONFIG_FILE"
    echo "⚠️ Configuración restaurada desde backup"
    exit 1
fi
