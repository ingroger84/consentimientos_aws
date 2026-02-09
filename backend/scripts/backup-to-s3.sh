#!/bin/bash

# ============================================
# Script de Backup Automatizado a S3
# ============================================
# Realiza backup de PostgreSQL y lo sube a S3
# Uso: ./backup-to-s3.sh

set -e

# Configuración
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/backups"
DB_NAME="${DB_DATABASE:-consentimientos}"
DB_USER="${DB_USERNAME:-datagree_admin}"
S3_BUCKET="${BACKUP_S3_BUCKET:-datagree-backups}"
S3_PREFIX="database-backups"
RETENTION_DAYS=30

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Iniciando backup de base de datos...${NC}"

# Crear directorio temporal
mkdir -p $BACKUP_DIR

# Nombre del archivo de backup
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Realizar backup con pg_dump y comprimir
echo -e "${YELLOW}📦 Creando dump de PostgreSQL...${NC}"
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h localhost \
  -U $DB_USER \
  -d $DB_NAME \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  | gzip > $BACKUP_FILE

# Verificar que el archivo se creó
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: No se pudo crear el archivo de backup${NC}"
    exit 1
fi

BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
echo -e "${GREEN}✅ Backup creado: $BACKUP_FILE ($BACKUP_SIZE)${NC}"

# Subir a S3
echo -e "${YELLOW}☁️  Subiendo a S3...${NC}"
aws s3 cp $BACKUP_FILE \
  s3://$S3_BUCKET/$S3_PREFIX/ \
  --storage-class STANDARD_IA \
  --metadata "timestamp=$TIMESTAMP,database=$DB_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup subido exitosamente a S3${NC}"
    echo -e "   📍 s3://$S3_BUCKET/$S3_PREFIX/$(basename $BACKUP_FILE)"
else
    echo -e "${RED}❌ Error al subir a S3${NC}"
    exit 1
fi

# Limpiar archivo local
rm -f $BACKUP_FILE
echo -e "${GREEN}🧹 Archivo local eliminado${NC}"

# Limpiar backups antiguos en S3 (más de RETENTION_DAYS días)
echo -e "${YELLOW}🗑️  Limpiando backups antiguos (>${RETENTION_DAYS} días)...${NC}"
CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)

aws s3 ls s3://$S3_BUCKET/$S3_PREFIX/ | while read -r line; do
    FILE_DATE=$(echo $line | awk '{print $4}' | grep -oP '\d{8}' | head -1)
    FILE_NAME=$(echo $line | awk '{print $4}')
    
    if [ ! -z "$FILE_DATE" ] && [ "$FILE_DATE" -lt "$CUTOFF_DATE" ]; then
        echo -e "   Eliminando: $FILE_NAME"
        aws s3 rm s3://$S3_BUCKET/$S3_PREFIX/$FILE_NAME
    fi
done

echo -e "${GREEN}✅ Backup completado exitosamente${NC}"
echo -e "${GREEN}📊 Resumen:${NC}"
echo -e "   Base de datos: $DB_NAME"
echo -e "   Timestamp: $TIMESTAMP"
echo -e "   Tamaño: $BACKUP_SIZE"
echo -e "   Ubicación: s3://$S3_BUCKET/$S3_PREFIX/"
