#!/bin/bash

# Script de Despliegue Correcto para admin.archivoenlinea.com
# Versión: 52.2.0
# Fecha: 2 de Marzo de 2026
# 
# IMPORTANTE: Este script despliega en el directorio CORRECTO que usa Nginx
# Directorio: /home/ubuntu/consentimientos_aws/frontend/dist

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
SERVER_IP="100.28.198.249"
SERVER_USER="ubuntu"
SSH_KEY="credentials/AWS-ISSABEL.pem"
VERSION="52.2.0"
DEPLOY_DIR="/home/ubuntu/consentimientos_aws/frontend/dist"
BACKUP_DIR="/home/ubuntu/consentimientos_aws/frontend/dist.backup.$(date +%Y%m%d_%H%M%S)"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Despliegue v${VERSION}${NC}"
echo -e "${GREEN}  admin.archivoenlinea.com${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar que el archivo comprimido existe
if [ ! -f "frontend/dist-v${VERSION}.tar.gz" ]; then
    echo -e "${RED}Error: No se encuentra frontend/dist-v${VERSION}.tar.gz${NC}"
    echo "Por favor, compila el frontend primero:"
    echo "  cd frontend"
    echo "  npm run build"
    echo "  tar -czf dist-v${VERSION}.tar.gz -C dist ."
    exit 1
fi

echo -e "${YELLOW}1. Subiendo archivos al servidor...${NC}"
scp -i ${SSH_KEY} frontend/dist-v${VERSION}.tar.gz ${SERVER_USER}@${SERVER_IP}:/home/ubuntu/
echo -e "${GREEN}✓ Archivos subidos${NC}"
echo ""

echo -e "${YELLOW}2. Creando backup del directorio actual...${NC}"
ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} "
    if [ -d ${DEPLOY_DIR} ]; then
        sudo cp -r ${DEPLOY_DIR} ${BACKUP_DIR}
        echo 'Backup creado en: ${BACKUP_DIR}'
    else
        echo 'No hay directorio previo para hacer backup'
    fi
"
echo -e "${GREEN}✓ Backup creado${NC}"
echo ""

echo -e "${YELLOW}3. Descomprimiendo archivos...${NC}"
ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} "
    mkdir -p /home/ubuntu/dist-temp-${VERSION}
    tar -xzf /home/ubuntu/dist-v${VERSION}.tar.gz -C /home/ubuntu/dist-temp-${VERSION}
    echo 'Archivos descomprimidos'
"
echo -e "${GREEN}✓ Archivos descomprimidos${NC}"
echo ""

echo -e "${YELLOW}4. Desplegando en ${DEPLOY_DIR}...${NC}"
ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} "
    sudo mkdir -p ${DEPLOY_DIR}
    sudo cp -r /home/ubuntu/dist-temp-${VERSION}/* ${DEPLOY_DIR}/
    echo 'Archivos copiados'
"
echo -e "${GREEN}✓ Archivos desplegados${NC}"
echo ""

echo -e "${YELLOW}5. Configurando permisos...${NC}"
ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} "
    sudo chown -R ubuntu:ubuntu ${DEPLOY_DIR}
    echo 'Permisos configurados'
"
echo -e "${GREEN}✓ Permisos configurados${NC}"
echo ""

echo -e "${YELLOW}6. Limpiando caché de Nginx...${NC}"
ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} "
    sudo rm -rf /var/cache/nginx/*
    echo 'Caché limpiado'
"
echo -e "${GREEN}✓ Caché limpiado${NC}"
echo ""

echo -e "${YELLOW}7. Reiniciando Nginx...${NC}"
ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} "
    sudo systemctl reload nginx
    echo 'Nginx reiniciado'
"
echo -e "${GREEN}✓ Nginx reiniciado${NC}"
echo ""

echo -e "${YELLOW}8. Limpiando archivos temporales...${NC}"
ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} "
    rm -rf /home/ubuntu/dist-temp-${VERSION}
    rm /home/ubuntu/dist-v${VERSION}.tar.gz
    echo 'Archivos temporales eliminados'
"
echo -e "${GREEN}✓ Archivos temporales eliminados${NC}"
echo ""

echo -e "${YELLOW}9. Verificando despliegue...${NC}"
DEPLOYED_VERSION=$(ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} "cat ${DEPLOY_DIR}/version.json | grep -o '\"version\": \"[^\"]*\"' | cut -d'\"' -f4")
echo "Versión desplegada en servidor: ${DEPLOYED_VERSION}"

PUBLIC_VERSION=$(ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} "curl -s https://admin.archivoenlinea.com/version.json | grep -o '\"version\": \"[^\"]*\"' | cut -d'\"' -f4")
echo "Versión pública: ${PUBLIC_VERSION}"

if [ "${PUBLIC_VERSION}" == "${VERSION}" ]; then
    echo -e "${GREEN}✓ Verificación exitosa${NC}"
else
    echo -e "${RED}✗ Error: La versión pública (${PUBLIC_VERSION}) no coincide con la esperada (${VERSION})${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Despliegue Completado${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Versión desplegada: ${VERSION}"
echo "Servidor: admin.archivoenlinea.com"
echo "Directorio: ${DEPLOY_DIR}"
echo "Backup: ${BACKUP_DIR}"
echo ""
echo "URLs para verificar:"
echo "  - https://admin.archivoenlinea.com"
echo "  - https://admin.archivoenlinea.com/version.json"
echo "  - https://admin.archivoenlinea.com/actualizar.html"
echo ""
echo -e "${YELLOW}Nota: Los usuarios pueden necesitar limpiar caché del navegador${NC}"
echo "Compartir: https://admin.archivoenlinea.com/actualizar.html"
