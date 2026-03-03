#!/bin/bash

# Script de despliegue Backend v52.2.1 - Optimizaciones de Perfiles
# Fecha: 2026-03-02
# Cambios: Sistema de caché de permisos, campo code normalizado, CRUD completo

set -e

echo "========================================="
echo "Despliegue Backend v52.2.1"
echo "Optimizaciones Sistema de Perfiles"
echo "========================================="
echo ""

# Variables
SERVER="ubuntu@100.28.198.249"
KEY="../credentials/AWS-ISSABEL.pem"
REMOTE_DIR="/home/ubuntu/consentimientos_aws/backend"
VERSION="52.2.1"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}[1/6]${NC} Compilando backend..."
cd ../backend
npm run build

echo -e "${BLUE}[2/6]${NC} Creando paquete de despliegue..."
tar -czf backend-dist-v${VERSION}.tar.gz \
  dist/ \
  node_modules/ \
  package.json \
  ecosystem.config.js \
  polyfill.js \
  .env

echo -e "${BLUE}[3/6]${NC} Subiendo paquete al servidor..."
scp -i ${KEY} backend-dist-v${VERSION}.tar.gz ${SERVER}:/home/ubuntu/

echo -e "${BLUE}[4/6]${NC} Desplegando en servidor..."
ssh -i ${KEY} ${SERVER} << 'ENDSSH'
  set -e
  
  echo "Deteniendo PM2..."
  pm2 stop datagree || true
  
  echo "Extrayendo archivos..."
  cd /home/ubuntu/consentimientos_aws/backend
  tar -xzf ~/backend-dist-v52.2.1.tar.gz
  
  echo "Limpiando paquete temporal..."
  rm ~/backend-dist-v52.2.1.tar.gz
  
  echo "Reiniciando PM2..."
  pm2 restart datagree
  pm2 save
  
  echo "Esperando que el servicio inicie..."
  sleep 5
  
  echo "Verificando estado..."
  pm2 status datagree
ENDSSH

echo -e "${BLUE}[5/6]${NC} Verificando despliegue..."
sleep 3
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://archivoenlinea.com/api/health || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
  echo -e "${GREEN}✓${NC} Backend respondiendo correctamente"
else
  echo -e "${YELLOW}⚠${NC} Backend responde con código: $HEALTH_CHECK"
fi

echo -e "${BLUE}[6/6]${NC} Limpiando archivos locales..."
cd ../backend
rm backend-dist-v${VERSION}.tar.gz

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Despliegue completado exitosamente${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Cambios desplegados:"
echo "  ✓ Sistema de caché de permisos en memoria"
echo "  ✓ Campo 'code' normalizado en Roles y Perfiles"
echo "  ✓ Método helper isSuperAdmin()"
echo "  ✓ Invalidación inteligente de caché"
echo "  ✓ CRUD completo de perfiles"
echo ""
echo "Próximos pasos:"
echo "  1. Verificar que los perfiles se muestren correctamente"
echo "  2. Probar crear/editar/eliminar perfiles"
echo "  3. Verificar permisos de Super Admin"
echo ""
