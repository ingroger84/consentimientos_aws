#!/bin/bash

# ============================================
# Script de Backup Automático a S3
# ============================================
# Descripción: Crea backup completo del proyecto y lo sube a S3
# Autor: Sistema de Backups Automáticos
# Fecha: 2026-03-17
# ============================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_PATH="/home/ubuntu/consentimientos_aws"
BACKUP_DIR="/tmp/backups"
S3_BUCKET="datagree-uploads"
S3_BACKUP_PATH="Back_Up_ArchivoEnLinea"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_archivoenlinea_${TIMESTAMP}"
BACKUP_FILE="${BACKUP_NAME}.tar.gz"
LOG_FILE="/home/ubuntu/backup_logs/backup_${TIMESTAMP}.log"
COUNTER_FILE="/home/ubuntu/backup_logs/backup_counter.txt"
EMAIL_TO="rcaraballo@innovasystems.com.co"
EMAIL_FROM="info@innovasystems.com.co"

# Crear directorios si no existen
mkdir -p "${BACKUP_DIR}"
mkdir -p "/home/ubuntu/backup_logs"

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}" | tee -a "${LOG_FILE}"
}

# Obtener o inicializar contador
get_backup_counter() {
    if [ -f "${COUNTER_FILE}" ]; then
        cat "${COUNTER_FILE}"
    else
        echo "0"
    fi
}

increment_backup_counter() {
    local current=$(get_backup_counter)
    local next=$((current + 1))
    echo "${next}" > "${COUNTER_FILE}"
    echo "${next}"
}

# Función para enviar email usando Node.js
send_email() {
    local subject="$1"
    local status="$2"
    local backup_counter="$3"
    local backup_file="$4"
    local backup_size="$5"
    local s3_url="$6"
    local total_backups="$7"
    local backup_date="$8"
    local error_msg="${9:-}"
    
    # Crear JSON con información del backup
    local backup_info=$(cat <<EOF
{
  "counter": ${backup_counter},
  "file": "${backup_file}",
  "size": "${backup_size}",
  "s3url": "${s3_url}",
  "totalBackups": ${total_backups},
  "date": "${backup_date}",
  "error": "${error_msg}"
}
EOF
)
    
    # Ejecutar script de Node.js para enviar email
    cd "${PROJECT_PATH}"
    node scripts/send-backup-email.js "${subject}" "${status}" "${backup_info}" 2>&1 | tee -a "${LOG_FILE}"
}

# Inicio del proceso
log "=========================================="
log "INICIANDO PROCESO DE BACKUP"
log "=========================================="

BACKUP_COUNTER=$(increment_backup_counter)
log "Consecutivo de backup: #${BACKUP_COUNTER}"

# 1. Verificar que el proyecto existe
if [ ! -d "${PROJECT_PATH}" ]; then
    log_error "El directorio del proyecto no existe: ${PROJECT_PATH}"
    send_email "❌ Error en Backup #${BACKUP_COUNTER}" "error" "${BACKUP_COUNTER}" "" "" "" "0" "$(date +'%d/%m/%Y %H:%M:%S')" "El directorio del proyecto no existe"
    exit 1
fi

log_success "Directorio del proyecto verificado"

# 2. Crear backup temporal
log "Creando archivo de backup..."
cd "${PROJECT_PATH}/.."

# Excluir node_modules, .git, logs y archivos temporales
tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.env.local' \
    --exclude='tmp' \
    --exclude='temp' \
    consentimientos_aws/ 2>&1 | tee -a "${LOG_FILE}"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
    log_success "Backup creado exitosamente: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
    log_error "Error al crear el backup"
    send_email "❌ Error en Backup #${BACKUP_COUNTER}" "error" "${BACKUP_COUNTER}" "" "" "" "0" "$(date +'%d/%m/%Y %H:%M:%S')" "Error al crear el archivo de backup"
    exit 1
fi

# 3. Subir a S3
log "Subiendo backup a S3..."
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" \
    "s3://${S3_BUCKET}/${S3_BACKUP_PATH}/${BACKUP_FILE}" \
    --region us-east-1 2>&1 | tee -a "${LOG_FILE}"

if [ $? -eq 0 ]; then
    log_success "Backup subido exitosamente a S3"
    S3_URL="s3://${S3_BUCKET}/${S3_BACKUP_PATH}/${BACKUP_FILE}"
else
    log_error "Error al subir el backup a S3"
    send_email "❌ Error en Backup #${BACKUP_COUNTER}" "error" "${BACKUP_COUNTER}" "${BACKUP_FILE}" "${BACKUP_SIZE}" "" "0" "$(date +'%d/%m/%Y %H:%M:%S')" "Error al subir el backup a S3"
    exit 1
fi

# 4. Verificar que el archivo existe en S3
log "Verificando archivo en S3..."
aws s3 ls "s3://${S3_BUCKET}/${S3_BACKUP_PATH}/${BACKUP_FILE}" --region us-east-1 > /dev/null 2>&1

if [ $? -eq 0 ]; then
    log_success "Archivo verificado en S3"
else
    log_error "El archivo no se encuentra en S3"
    send_email "❌ Error en Backup #${BACKUP_COUNTER}" "error" "${BACKUP_COUNTER}" "${BACKUP_FILE}" "${BACKUP_SIZE}" "${S3_URL}" "0" "$(date +'%d/%m/%Y %H:%M:%S')" "El archivo no se encuentra en S3 después de la subida"
    exit 1
fi

# 5. Limpiar archivo temporal local
log "Limpiando archivos temporales..."
rm -f "${BACKUP_DIR}/${BACKUP_FILE}"
log_success "Archivos temporales eliminados"

# 6. Obtener información del backup
BACKUP_INFO=$(aws s3 ls "s3://${S3_BUCKET}/${S3_BACKUP_PATH}/${BACKUP_FILE}" --region us-east-1)
BACKUP_DATE=$(date +'%d/%m/%Y %H:%M:%S')

# 7. Contar backups existentes en S3
TOTAL_BACKUPS=$(aws s3 ls "s3://${S3_BUCKET}/${S3_BACKUP_PATH}/" --region us-east-1 | grep -c "backup_archivoenlinea_")

log_success "=========================================="
log_success "BACKUP COMPLETADO EXITOSAMENTE"
log_success "=========================================="
log "Consecutivo: #${BACKUP_COUNTER}"
log "Archivo: ${BACKUP_FILE}"
log "Tamaño: ${BACKUP_SIZE}"
log "Ubicación: ${S3_URL}"
log "Total de backups en S3: ${TOTAL_BACKUPS}"

# 8. Enviar email de confirmación
send_email "✅ Backup #${BACKUP_COUNTER} Completado - Archivo en Línea" "success" "${BACKUP_COUNTER}" "${BACKUP_FILE}" "${BACKUP_SIZE}" "${S3_URL}" "${TOTAL_BACKUPS}" "${BACKUP_DATE}" ""

log_success "Email de notificación enviado a ${EMAIL_TO}"
log "Proceso de backup finalizado exitosamente"

exit 0
