#!/bin/bash

# ============================================
# Script para Corregir Sistema de Backups
# ============================================
# Fecha: 2026-03-19
# ============================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}DIAGNÓSTICO Y CORRECCIÓN DE BACKUPS${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Verificar backups en S3
echo -e "${YELLOW}1. Verificando backups en S3...${NC}"
echo ""
echo -e "${BLUE}Backups de código completo:${NC}"
aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/ --recursive | tail -10
echo ""

echo -e "${BLUE}Backups de base de datos:${NC}"
aws s3 ls s3://datagree-uploads/database-backups/ --recursive | tail -10
echo ""

# 2. Verificar cron jobs
echo -e "${YELLOW}2. Cron jobs configurados:${NC}"
crontab -l | grep -i backup
echo ""

# 3. Verificar scripts
echo -e "${YELLOW}3. Scripts de backup disponibles:${NC}"
echo -e "${BLUE}Script en /opt/datagree/scripts/:${NC}"
ls -lh /opt/datagree/scripts/backup-to-s3.sh 2>/dev/null || echo "No existe"
echo ""

echo -e "${BLUE}Script en /home/ubuntu/consentimientos_aws/scripts/:${NC}"
ls -lh /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh 2>/dev/null || echo "No existe"
echo ""

# 4. Verificar logs
echo -e "${YELLOW}4. Últimos logs de backup:${NC}"
echo -e "${BLUE}Log de cron:${NC}"
tail -5 /var/log/datagree-backup.log 2>/dev/null || echo "No hay logs"
echo ""

echo -e "${BLUE}Logs en syslog:${NC}"
grep -i "backup" /var/log/syslog | tail -5
echo ""

# 5. Verificar permisos de base de datos
echo -e "${YELLOW}5. Verificando permisos de base de datos...${NC}"
psql -U datagree_admin -d consentimientos -c "\dt" | head -10
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}DIAGNÓSTICO COMPLETADO${NC}"
echo -e "${GREEN}========================================${NC}"
