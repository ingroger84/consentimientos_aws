#!/bin/bash

# ============================================
# Script para Actualizar Cron de Backups
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
echo -e "${BLUE}ACTUALIZANDO CRON DE BACKUPS${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Mostrar cron actual
echo -e "${YELLOW}1. Cron actual:${NC}"
crontab -l | grep -v "^#" | grep backup || echo "No hay cron jobs de backup"
echo ""

# 2. Crear nuevo cron
echo -e "${YELLOW}2. Creando nuevo cron...${NC}"

# Guardar cron actual (sin las líneas de backup)
crontab -l | grep -v "backup" > /tmp/crontab_temp.txt 2>/dev/null || true

# Agregar nuevos cron jobs
cat >> /tmp/crontab_temp.txt << 'EOF'

# ============================================
# Backups Automáticos - Archivo en Línea
# ============================================
# Backup completo del proyecto (código + configuración)
# Se ejecuta 2 veces al día: 12:00 PM y 7:00 PM (hora Colombia)
# Los backups se suben a S3: s3://datagree-uploads/Back_Up_ArchivoEnLinea/
# ============================================

# Backup diario a las 12:00 PM (mediodía) - Hora Colombia (UTC-5)
# En UTC: 17:00 (12:00 PM + 5 horas)
0 17 * * * /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh >> /home/ubuntu/backup_logs/cron_backup.log 2>&1

# Backup diario a las 7:00 PM (noche) - Hora Colombia (UTC-5)
# En UTC: 00:00 del día siguiente (7:00 PM + 5 horas)
0 0 * * * /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh >> /home/ubuntu/backup_logs/cron_backup.log 2>&1

EOF

# 3. Instalar nuevo cron
crontab /tmp/crontab_temp.txt

echo -e "${GREEN}✅ Cron actualizado correctamente${NC}"
echo ""

# 4. Mostrar nuevo cron
echo -e "${YELLOW}3. Nuevo cron instalado:${NC}"
crontab -l | grep -A 2 "Backups Automáticos"
echo ""

# 5. Crear directorio de logs si no existe
mkdir -p /home/ubuntu/backup_logs
touch /home/ubuntu/backup_logs/cron_backup.log
chmod 644 /home/ubuntu/backup_logs/cron_backup.log

echo -e "${GREEN}✅ Directorio de logs creado${NC}"
echo ""

# 6. Verificar que el script existe y tiene permisos
if [ -f "/home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh" ]; then
    chmod +x /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh
    echo -e "${GREEN}✅ Script de backup verificado y con permisos de ejecución${NC}"
    ls -lh /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh
else
    echo -e "${RED}❌ ERROR: Script de backup no encontrado${NC}"
    exit 1
fi
echo ""

# 7. Información de horarios
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}INFORMACIÓN DE HORARIOS${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Hora del servidor (UTC):${NC} $(date -u)"
echo -e "${GREEN}Hora de Colombia (UTC-5):${NC} $(TZ=America/Bogota date)"
echo ""
echo -e "${YELLOW}Los backups se ejecutarán:${NC}"
echo -e "  • 12:00 PM (mediodía) - Hora Colombia"
echo -e "  • 7:00 PM (noche) - Hora Colombia"
echo ""
echo -e "${YELLOW}Próximas ejecuciones:${NC}"
echo -e "  • Hoy a las 7:00 PM (si aún no ha pasado)"
echo -e "  • Mañana a las 12:00 PM"
echo ""

# 8. Limpiar
rm -f /tmp/crontab_temp.txt

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}ACTUALIZACIÓN COMPLETADA${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Para verificar que funciona:${NC}"
echo -e "  1. Espera a las 12:00 PM o 7:00 PM"
echo -e "  2. Revisa el log: tail -f /home/ubuntu/backup_logs/cron_backup.log"
echo -e "  3. Verifica S3: aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/"
echo ""
echo -e "${YELLOW}Para ejecutar un backup manual ahora:${NC}"
echo -e "  /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh"
echo ""
