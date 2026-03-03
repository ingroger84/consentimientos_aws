#!/bin/bash

# Script de Despliegue Backend v53.0.0
# Consolidación del Sistema de Perfiles
# Fecha: 2026-03-02

set -e  # Salir si hay algún error

echo "=========================================="
echo "🚀 DESPLIEGUE BACKEND v53.0.0"
echo "Consolidación del Sistema de Perfiles"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
VERSION="53.0.0"
SERVER_USER="ubuntu"
SERVER_HOST="100.28.198.249"
SERVER_PATH="/home/ubuntu/consentimientos_aws/backend"
KEY_PATH="../credentials/AWS-ISSABEL.pem"
PACKAGE_NAME="backend-dist-v${VERSION}.tar.gz"

echo "${YELLOW}📋 Configuración:${NC}"
echo "   Versión: ${VERSION}"
echo "   Servidor: ${SERVER_USER}@${SERVER_HOST}"
echo "   Ruta: ${SERVER_PATH}"
echo ""

# Paso 1: Compilar backend
echo "${YELLOW}📦 Paso 1: Compilando backend...${NC}"
cd ../backend
npm run build

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Compilación exitosa${NC}"
else
    echo "${RED}❌ Error en la compilación${NC}"
    exit 1
fi
echo ""

# Paso 2: Crear paquete
echo "${YELLOW}📦 Paso 2: Creando paquete de despliegue...${NC}"
tar -czf ${PACKAGE_NAME} \
    dist/ \
    node_modules/ \
    package.json \
    ecosystem.config.js \
    polyfill.js \
    .env \
    migrate-users-to-profiles.js

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Paquete creado: ${PACKAGE_NAME}${NC}"
    ls -lh ${PACKAGE_NAME}
else
    echo "${RED}❌ Error al crear paquete${NC}"
    exit 1
fi
echo ""

# Paso 3: Subir al servidor
echo "${YELLOW}📤 Paso 3: Subiendo paquete al servidor...${NC}"
scp -i ${KEY_PATH} ${PACKAGE_NAME} ${SERVER_USER}@${SERVER_HOST}:/home/ubuntu/

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Paquete subido exitosamente${NC}"
else
    echo "${RED}❌ Error al subir paquete${NC}"
    exit 1
fi
echo ""

# Paso 4: Desplegar en servidor
echo "${YELLOW}🚀 Paso 4: Desplegando en servidor...${NC}"
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
    echo "${GREEN}✅ Despliegue exitoso${NC}"
else
    echo "${RED}❌ Error en el despliegue${NC}"
    exit 1
fi
echo ""

# Paso 5: Ejecutar migración de usuarios
echo "${YELLOW}🔄 Paso 5: Ejecutando migración de usuarios...${NC}"
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
    echo "${GREEN}✅ Migración de usuarios completada${NC}"
else
    echo "${RED}❌ Error en la migración de usuarios${NC}"
    exit 1
fi
echo ""

# Paso 6: Reiniciar aplicación
echo "${YELLOW}🔄 Paso 6: Reiniciando aplicación...${NC}"
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
    echo "${GREEN}✅ Aplicación reiniciada exitosamente${NC}"
else
    echo "${RED}❌ Error al reiniciar aplicación${NC}"
    exit 1
fi
echo ""

# Paso 7: Verificar logs
echo "${YELLOW}📋 Paso 7: Verificando logs...${NC}"
ssh -i ${KEY_PATH} ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
echo "📋 Últimas 20 líneas de logs:"
pm2 logs datagree --lines 20 --nostream
ENDSSH
echo ""

# Paso 8: Limpiar paquete local
echo "${YELLOW}🗑️  Paso 8: Limpiando archivos temporales...${NC}"
rm ${PACKAGE_NAME}
echo "${GREEN}✅ Archivos temporales eliminados${NC}"
echo ""

# Resumen final
echo "=========================================="
echo "${GREEN}✅ DESPLIEGUE COMPLETADO EXITOSAMENTE${NC}"
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
