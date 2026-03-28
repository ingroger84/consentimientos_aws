#!/bin/bash

# ============================================
# Script para Actualizar Horario de Backups
# ============================================
# Uso: ./update-backup-schedule.sh "MINUTE1" "HOUR1" "MINUTE2" "HOUR2"
# Ejemplo: ./update-backup-schedule.sh "0" "12" "0" "19"
# ============================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Parámetros
MINUTE1="$1"
HOUR1="$2"
MINUTE2="$3"
HOUR2="$4"

# Validar parámetros
if [ -z "$MINUTE1" ] || [ -z "$HOUR1" ] || [ -z "$MINUTE2" ] || [ -z "$HOUR2" ]; then
    echo -e "${RED}Error: Se requieren 4 parámetros (MINUTE1 HOUR1 MINUTE2 HOUR2)${NC}"
    echo "Uso: $0 MINUTE1 HOUR1 MINUTE2 HOUR2"
    echo "Ejemplo: $0 0 12 0 19"
    exit 1
fi

# Validar rangos
if [ "$MINUTE1" -lt 0 ] || [ "$MINUTE1" -gt 59 ] || [ "$MINUTE2" -lt 0 ] || [ "$MINUTE2" -gt 59 ]; then
    echo -e "${RED}Error: Los minutos deben estar entre 0 y 59${NC}"
    exit 1
fi

if [ "$HOUR1" -lt 0 ] || [ "$HOUR1" -gt 23 ] || [ "$HOUR2" -lt 0 ] || [ "$HOUR2" -gt 23 ]; then
    echo -e "${RED}Error: Las horas deben estar entre 0 y 23${NC}"
    exit 1
fi

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}ACTUALIZANDO HORARIO DE BACKUPS${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "Nuevo horario:"
echo -e "  Backup 1: ${GREEN}${HOUR1}:${MINUTE1}${NC}"
echo -e "  Backup 2: ${GREEN}${HOUR2}:${MINUTE2}${NC}"
echo ""

# Ruta del script de backup
BACKUP_SCRIPT="/home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh"

# Eliminar cron jobs existentes de backup
echo -e "${YELLOW}Eliminando cron jobs existentes...${NC}"
crontab -l 2>/dev/null | grep -v "backup-to-s3.sh" | crontab - || true

# Agregar nuevos cron jobs
echo -e "${YELLOW}Agregando nuevos cron jobs...${NC}"
(crontab -l 2>/dev/null; echo "${MINUTE1} ${HOUR1} * * * ${BACKUP_SCRIPT} >> /home/ubuntu/backup_logs/cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "${MINUTE2} ${HOUR2} * * * ${BACKUP_SCRIPT} >> /home/ubuntu/backup_logs/cron.log 2>&1") | crontab -

echo -e "${GREEN}✅ Crontab actualizado exitosamente${NC}"
echo ""
echo -e "${YELLOW}Cron jobs actuales:${NC}"
crontab -l | grep "backup-to-s3.sh"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}HORARIO ACTUALIZADO CORRECTAMENTE${NC}"
echo -e "${GREEN}========================================${NC}"

exit 0
