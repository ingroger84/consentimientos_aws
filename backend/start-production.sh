#!/bin/bash
# Script para iniciar la aplicación en producción con todas las variables de entorno
# Versión: 26.0.3

cd /home/ubuntu/consentimientos_aws

# Cargar variables de entorno desde .env
export $(cat backend/.env | grep -v '^#' | xargs)

# Iniciar con PM2
pm2 delete datagree 2>/dev/null || true
pm2 start backend/dist/main.js \
  --name datagree \
  --cwd /home/ubuntu/consentimientos_aws \
  --max-memory-restart 1G \
  --error ./logs/backend-err.log \
  --output ./logs/backend-out.log

pm2 save

echo "✅ Aplicación iniciada correctamente - Versión 26.0.3"
pm2 status
pm2 logs datagree --lines 20 --nostream
