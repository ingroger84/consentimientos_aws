#!/bin/bash

# ============================================
# Script de Prueba del Sistema de Backups
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "PRUEBA DEL SISTEMA DE BACKUPS"
echo "=========================================="
echo ""

# 1. Verificar AWS CLI
echo -n "1. Verificando AWS CLI... "
if command -v aws &> /dev/null; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ AWS CLI no instalado${NC}"
    exit 1
fi

# 2. Verificar credenciales de AWS
echo -n "2. Verificando credenciales de AWS... "
if aws s3 ls s3://datagree-uploads/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ Credenciales inválidas${NC}"
    exit 1
fi

# 3. Verificar carpeta de backups en S3
echo -n "3. Verificando carpeta de backups en S3... "
aws s3api put-object --bucket datagree-uploads --key Back_Up_ArchivoEnLinea/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ No se pudo crear la carpeta${NC}"
    exit 1
fi

# 4. Verificar Node.js y nodemailer
echo -n "4. Verificando Node.js... "
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ Node.js no instalado${NC}"
    exit 1
fi

echo -n "5. Verificando nodemailer... "
cd /home/ubuntu/consentimientos_aws
if npm list nodemailer > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️  Instalando nodemailer...${NC}"
    npm install nodemailer
    echo -e "${GREEN}✅${NC}"
fi

# 6. Verificar scripts
echo -n "6. Verificando scripts de backup... "
if [ -x "/home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ Script no ejecutable${NC}"
    exit 1
fi

echo -n "7. Verificando script de restauración... "
if [ -x "/home/ubuntu/consentimientos_aws/scripts/restore-from-s3.sh" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ Script no ejecutable${NC}"
    exit 1
fi

# 8. Verificar directorios
echo -n "8. Verificando directorios... "
mkdir -p /home/ubuntu/backup_logs
mkdir -p /tmp/backups
echo -e "${GREEN}✅${NC}"

# 9. Verificar cron jobs
echo -n "9. Verificando cron jobs... "
if crontab -l | grep -q "backup-to-s3.sh"; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️  Cron jobs no configurados${NC}"
fi

# 10. Listar backups existentes
echo ""
echo "10. Backups existentes en S3:"
echo "----------------------------------------"
BACKUP_COUNT=$(aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/ | grep -c "backup_archivoenlinea_" || echo "0")
if [ "$BACKUP_COUNT" -gt 0 ]; then
    aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/ | grep "backup_archivoenlinea_" | tail -5
    echo "Total: $BACKUP_COUNT backups"
else
    echo "No hay backups aún"
fi
echo "----------------------------------------"

echo ""
echo -e "${GREEN}=========================================="
echo "✅ SISTEMA VERIFICADO CORRECTAMENTE"
echo "==========================================${NC}"
echo ""
echo "🎯 Próximos pasos:"
echo "  1. Ejecutar backup de prueba:"
echo "     /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh"
echo ""
echo "  2. Verificar email de notificación"
echo ""
echo "  3. Los backups automáticos se ejecutarán a las 12 PM y 7 PM"
echo ""

exit 0
