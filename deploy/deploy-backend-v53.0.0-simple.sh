#!/bin/bash

# Script de Despliegue Backend v53.0.0 - Simplificado
# Consolidación del Sistema de Perfiles
# Fecha: 2026-03-02

set -e

echo "=========================================="
echo "🚀 DESPLIEGUE BACKEND v53.0.0"
echo "Consolidación del Sistema de Perfiles"
echo "=========================================="
echo ""

# Variables
VERSION="53.0.0"
SERVER_USER="ubuntu"
SERVER_HOST="100.28.198.249"
SERVER_PATH="/home/ubuntu/consentimientos_aws/backend"
KEY_PATH="../credentials/AWS-ISSABEL.pem"
PACKAGE_NAME="backend-dist-v${VERSION}.tar.gz"

echo "📋 Configuración:"
echo "   Versión: ${VERSION}"
echo "   Servidor: ${SERVER_USER}@${SERVER_HOST}"
echo "   Ruta: ${SERVER_PATH}"
echo ""

# Paso 1: Compilar backend
echo "📦 Paso 1: Compilando backend..."
cd ../backend
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Compilación exitosa"
else
    echo "❌ Error en la compilación"
    exit 1
fi
echo ""

# Paso 2: Crear paquete (solo archivos que existen)
echo "📦 Paso 2: Creando paquete de despliegue..."
tar -czf ${PACKAGE_NAME} \
    dist/ \
    node_modules/ \
    package.json \
    .env \
    migrate-users-to-profiles.js

if [ $? -eq 0 ]; then
    echo "✅ Paquete creado: ${PACKAGE_NAME}"
    ls -lh ${PACKAGE_NAME}
else
    echo "❌ Error al crear paquete"
    exit 1
fi
echo ""

# Paso 3: Subir al servidor
echo "📤 Paso 3: Subiendo paquete al servidor..."
scp -i ${KEY_PATH} ${PACKAGE_NAME} ${SERVER_USER}@${SERVER_HOST}:/home/ubuntu/

if [ $? -eq 0 ]; then
    echo "✅ Paquete subido exitosamente"
else
    echo "❌ Error al subir paquete"
    exit 1
fi
echo ""

# Paso 4: Desplegar en servidor
echo "🚀 Paso 4: Desplegando en servidor..."
ssh -i ${KEY_PATH} ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

echo "📍 Navegando al directorio del backend..."
cd /home/ubuntu/consentimientos_aws/backend

echo "⏸️  Deteniendo aplicación..."
pm2 stop datagree || true

echo "📦 Extrayendo paquete..."
tar -xzf ~/backend-dist-v53.0.0.tar.gz

echo "🗑️  Limpiando paquete temporal..."
rm ~/backend-dist-v53.0.0.tar.gz

echo "✅ Despliegue completado"
ENDSSH

if [ $? -eq 0 ]; then
    echo "✅ Despliegue exitoso"
else
    echo "❌ Error en el despliegue"
    exit 1
fi
echo ""

# Paso 5: Ejecutar migración de usuarios
echo "🔄 Paso 5: Ejecutando migración de usuarios..."
ssh -i ${KEY_PATH} ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

cd /home/ubuntu/consentimientos_aws/backend

echo "🔄 Ejecutando script de migración..."
node migrate-users-to-profiles.js

if [ $? -eq 0 ]; then
    echo "✅ Migración completada"
else
    echo "❌ Error en la migración"
    exit 1
fi
ENDSSH

if [ $? -eq 0 ]; then
    echo "✅ Migración de usuarios completada"
else
    echo "❌ Error en la migración de usuarios"
    exit 1
fi
echo ""

# Paso 6: Reiniciar aplicación
echo "🔄 Paso 6: Reiniciando aplicación..."
ssh -i ${KEY_PATH} ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

cd /home/ubuntu/consentimientos_aws/backend

echo "🔄 Reiniciando PM2..."
pm2 restart datagree

echo "💾 Guardando configuración PM2..."
pm2 save

echo "✅ Aplicación reiniciada"
ENDSSH

if [ $? -eq 0 ]; then
    echo "✅ Aplicación reiniciada exitosamente"
else
    echo "❌ Error al reiniciar aplicación"
    exit 1
fi
echo ""

# Paso 7: Verificar logs
echo "📋 Paso 7: Verificando logs..."
ssh -i ${KEY_PATH} ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
echo "📋 Últimas 20 líneas de logs:"
pm2 logs datagree --lines 20 --nostream
ENDSSH
echo ""

# Paso 8: Limpiar paquete local
echo "🗑️  Paso 8: Limpiando archivos temporales..."
rm ${PACKAGE_NAME}
echo "✅ Archivos temporales eliminados"
echo ""

# Resumen final
echo "=========================================="
echo "✅ DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "=========================================="
echo ""
echo "📊 Resumen:"
echo "   ✅ Backend compilado"
echo "   ✅ Paquete creado y subido"
echo "   ✅ Aplicación desplegada"
echo "   ✅ Migración de usuarios ejecutada"
echo "   ✅ Aplicación reiniciada"
echo "   ✅ Logs verificados"
echo ""
echo "🔗 Acceso:"
echo "   Backend: https://api.datagree.co"
echo "   Frontend: https://app.datagree.co"
echo ""
echo "📋 Monitoreo:"
echo "   ssh -i ${KEY_PATH} ${SERVER_USER}@${SERVER_HOST}"
echo "   pm2 logs datagree"
echo "   pm2 status"
echo ""
echo "=========================================="
