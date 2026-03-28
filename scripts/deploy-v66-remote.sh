#!/bin/bash
cd /home/ubuntu/consentimientos_aws

echo '=== Backup del dist actual ==='
if [ -d dist ]; then
    timestamp=$(date +%Y%m%d_%H%M%S)
    mv dist dist_backup_$timestamp
    echo "Backup creado: dist_backup_$timestamp"
fi

echo ''
echo '=== Descomprimiendo nueva versión ==='
unzip -q -o backend-dist-v66-texto-dinamico-final.zip -d dist
echo 'Archivos descomprimidos'

echo ''
echo '=== Verificando archivos ==='
ls -lh dist/ | head -10

echo ''
echo '=== Reiniciando PM2 ==='
pm2 restart consentimientos-backend
pm2 save

echo ''
echo '=== Estado de PM2 ==='
pm2 status

echo ''
echo '=== Últimas líneas del log ==='
pm2 logs consentimientos-backend --lines 20 --nostream

echo ''
echo '=== DESPLIEGUE COMPLETADO ==='
