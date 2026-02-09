#!/bin/bash

# ============================================
# Script de Restauración desde S3
# ============================================
# Restaura un backup de PostgreSQL desde S3
# Uso: ./restore-from-s3.sh [backup_file]

set -e

# Configuración
BACKUP_DIR="/tmp/backups"
DB_NAME="${DB_DATABASE:-consentimientos}"
DB_USER="${DB_USERNAME:-datagree_admin}"
S3_BUCKET="${BACKUP_S3_BUCKET:-datagree-backups}"
S3_PREFIX="database-backups"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar argumento
if [ -z "$1" ]; then
    echo -e "${YELLOW}📋 Backups disponibles en S3:${NC}"
    aws s3 ls s3://$S3_BUCKET/$S3_PREFIX/ | grep ".sql.gz"
    echo ""
    echo -e "${RED}Uso: $0 <nombre_archivo_backup>${NC}"
    echo -e "Ejemplo: $0 consentimientos_20260209_120000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1
LOCAL_FILE="$BACKUP_DIR/$BACKUP_FILE"

echo -e "${YELLOW}⚠️  ADVERTENCIA: Esta operación sobrescribirá la base de datos actual${NC}"
echo -e "${YELLOW}Base de datos: $DB_NAME${NC}"
echo -e "${YELLOW}Backup: $BACKUP_FILE${NC}"
read -p "¿Desea continuar? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}❌ Operación cancelada${NC}"
    exit 0
fi

# Crear directorio temporal
mkdir -p $BACKUP_DIR

# Descargar desde S3
echo -e "${GREEN}☁️  Descargando backup desde S3...${NC}"
aws s3 cp s3://$S3_BUCKET/$S3_PREFIX/$BACKUP_FILE $LOCAL_FILE

if [ ! -f "$LOCAL_FILE" ]; then
    echo -e "${RED}❌ Error: No se pudo descargar el archivo${NC}"
    exit 1
fi

# Descomprimir y restaurar
echo -e "${GREEN}📦 Restaurando base de datos...${NC}"
gunzip -c $LOCAL_FILE | PGPASSWORD=$DB_PASSWORD psql \
  -h localhost \
  -U $DB_USER \
  -d $DB_NAME

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos restaurada exitosamente${NC}"
else
    echo -e "${RED}❌ Error al restaurar la base de datos${NC}"
    exit 1
fi

# Limpiar archivo local
rm -f $LOCAL_FILE
echo -e "${GREEN}🧹 Archivo temporal eliminado${NC}"

echo -e "${GREEN}✅ Restauración completada${NC}"
