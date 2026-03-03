#!/bin/bash

# Script de despliegue del backend v52.2.0 con sistema de perfiles
# Fecha: 2026-03-02
# Servidor: admin.archivoenlinea.com (100.28.198.249)

set -e

echo "=========================================="
echo "DESPLIEGUE BACKEND v52.2.0"
echo "Sistema de Perfiles y Permisos"
echo "=========================================="
echo ""

# Variables
SERVER_USER="ubuntu"
SERVER_IP="100.28.198.249"
SERVER_PATH="/home/ubuntu/consentimientos_aws/backend"
LOCAL_DIST="backend/dist"
PM2_PROCESS="datagree"

echo "1. Verificando compilación local..."
if [ ! -d "$LOCAL_DIST" ]; then
    echo "❌ Error: No existe el directorio dist/"
    echo "Ejecuta: cd backend && npm run build"
    exit 1
fi

echo "✓ Directorio dist/ encontrado"
echo ""

echo "2. Creando archivo comprimido..."
cd backend
tar -czf backend-dist-v52.2.0.tar.gz dist/ package.json package-lock.json
cd ..

echo "✓ Archivo backend-dist-v52.2.0.tar.gz creado"
echo ""

echo "3. Subiendo archivos al servidor..."
scp -i credentials/AWS-ISSABEL.pem backend/backend-dist-v52.2.0.tar.gz ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

echo "✓ Archivos subidos"
echo ""

echo "4. Desplegando en el servidor..."
ssh -i credentials/AWS-ISSABEL.pem ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /home/ubuntu/consentimientos_aws/backend

echo "Extrayendo archivos..."
tar -xzf backend-dist-v52.2.0.tar.gz

echo "Instalando dependencias de producción..."
npm ci --only=production

echo "Reiniciando proceso PM2..."
pm2 restart datagree

echo "Esperando 5 segundos..."
sleep 5

echo "Verificando estado del proceso..."
pm2 status datagree

echo "Mostrando últimas líneas del log..."
pm2 logs datagree --lines 20 --nostream

ENDSSH

echo ""
echo "✓ Despliegue completado"
echo ""

echo "5. Limpiando archivos temporales..."
rm backend/backend-dist-v52.2.0.tar.gz

echo "✓ Limpieza completada"
echo ""

echo "=========================================="
echo "DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "=========================================="
echo ""
echo "Verificaciones recomendadas:"
echo "1. Acceder a: https://archivoenlinea.com/api/profiles"
echo "2. Verificar logs: ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249 'pm2 logs datagree'"
echo "3. Probar endpoint desde el frontend"
echo ""
