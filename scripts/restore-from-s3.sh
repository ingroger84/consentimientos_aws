#!/bin/bash

# ============================================
# Script de Restauración desde S3
# ============================================
# Descripción: Restaura un backup desde S3
# Autor: Sistema de Backups Automáticos
# Fecha: 2026-03-17
# ============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
S3_BUCKET="datagree-uploads"
S3_BACKUP_PATH="Back_Up_ArchivoEnLinea"
RESTORE_DIR="/tmp/restore"
PROJECT_PATH="/home/ubuntu/consentimientos_aws"
BACKUP_BEFORE_RESTORE="/home/ubuntu/backup_before_restore_$(date +%Y%m%d_%H%M%S)"

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

# Función para listar backups disponibles
list_backups() {
    log "=========================================="
    log "BACKUPS DISPONIBLES EN S3"
    log "=========================================="
    
    aws s3 ls "s3://${S3_BUCKET}/${S3_BACKUP_PATH}/" --region us-east-1 | grep "backup_archivoenlinea_" | nl
    
    echo ""
}

# Función para obtener el último backup
get_latest_backup() {
    aws s3 ls "s3://${S3_BUCKET}/${S3_BACKUP_PATH}/" --region us-east-1 | \
        grep "backup_archivoenlinea_" | \
        sort -r | \
        head -n 1 | \
        awk '{print $4}'
}

# Función para restaurar un backup específico
restore_backup() {
    local backup_file="$1"
    
    log "=========================================="
    log "INICIANDO RESTAURACIÓN"
    log "=========================================="
    log "Backup a restaurar: ${backup_file}"
    
    # Crear directorio temporal
    mkdir -p "${RESTORE_DIR}"
    
    # 1. Crear backup del estado actual antes de restaurar
    log "Creando backup de seguridad del estado actual..."
    if [ -d "${PROJECT_PATH}" ]; then
        cp -r "${PROJECT_PATH}" "${BACKUP_BEFORE_RESTORE}"
        log_success "Backup de seguridad creado en: ${BACKUP_BEFORE_RESTORE}"
    fi
    
    # 2. Descargar backup desde S3
    log "Descargando backup desde S3..."
    aws s3 cp "s3://${S3_BUCKET}/${S3_BACKUP_PATH}/${backup_file}" \
        "${RESTORE_DIR}/${backup_file}" \
        --region us-east-1
    
    if [ $? -eq 0 ]; then
        log_success "Backup descargado exitosamente"
    else
        log_error "Error al descargar el backup desde S3"
        exit 1
    fi
    
    # 3. Detener servicios
    log "Deteniendo servicios..."
    pm2 stop datagree || log_warning "PM2 no pudo detener el servicio"
    
    # 4. Extraer backup
    log "Extrayendo backup..."
    cd "${RESTORE_DIR}"
    tar -xzf "${backup_file}"
    
    if [ $? -eq 0 ]; then
        log_success "Backup extraído exitosamente"
    else
        log_error "Error al extraer el backup"
        exit 1
    fi
    
    # 5. Restaurar archivos
    log "Restaurando archivos..."
    
    # Eliminar proyecto actual (ya tenemos backup)
    rm -rf "${PROJECT_PATH}"
    
    # Mover archivos restaurados
    mv "${RESTORE_DIR}/consentimientos_aws" "${PROJECT_PATH}"
    
    log_success "Archivos restaurados"
    
    # 6. Restaurar node_modules
    log "Instalando dependencias del backend..."
    cd "${PROJECT_PATH}/backend"
    npm install
    
    log "Instalando dependencias del frontend..."
    cd "${PROJECT_PATH}/frontend"
    npm install
    
    # 7. Compilar frontend
    log "Compilando frontend..."
    npm run build
    
    # 8. Reiniciar servicios
    log "Reiniciando servicios..."
    pm2 restart datagree || pm2 start "${PROJECT_PATH}/backend/dist/main.js" --name datagree
    
    # 9. Limpiar archivos temporales
    log "Limpiando archivos temporales..."
    rm -rf "${RESTORE_DIR}"
    
    log_success "=========================================="
    log_success "RESTAURACIÓN COMPLETADA"
    log_success "=========================================="
    log "Backup restaurado: ${backup_file}"
    log "Backup de seguridad guardado en: ${BACKUP_BEFORE_RESTORE}"
    log ""
    log_warning "IMPORTANTE: Verifica que el sistema funcione correctamente"
    log_warning "Si hay problemas, puedes restaurar el estado anterior desde:"
    log_warning "${BACKUP_BEFORE_RESTORE}"
    
    exit 0
}

# Función para restaurar por consecutivo
restore_by_number() {
    local backup_number="$1"
    
    log "Buscando backup con consecutivo #${backup_number}..."
    
    # Listar todos los backups y buscar por número
    local backup_file=$(aws s3 ls "s3://${S3_BUCKET}/${S3_BACKUP_PATH}/" --region us-east-1 | \
        grep "backup_archivoenlinea_" | \
        sort | \
        sed -n "${backup_number}p" | \
        awk '{print $4}')
    
    if [ -z "${backup_file}" ]; then
        log_error "No se encontró backup con consecutivo #${backup_number}"
        exit 1
    fi
    
    log_success "Backup encontrado: ${backup_file}"
    restore_backup "${backup_file}"
}

# Menú principal
show_menu() {
    echo ""
    echo "=========================================="
    echo "SISTEMA DE RESTAURACIÓN DESDE S3"
    echo "=========================================="
    echo ""
    echo "1) Listar todos los backups disponibles"
    echo "2) Restaurar el último backup"
    echo "3) Restaurar backup por consecutivo"
    echo "4) Restaurar backup por nombre de archivo"
    echo "5) Salir"
    echo ""
    read -p "Selecciona una opción: " option
    
    case $option in
        1)
            list_backups
            show_menu
            ;;
        2)
            latest=$(get_latest_backup)
            if [ -z "${latest}" ]; then
                log_error "No se encontraron backups en S3"
                exit 1
            fi
            log "Último backup: ${latest}"
            read -p "¿Deseas restaurar este backup? (s/n): " confirm
            if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
                restore_backup "${latest}"
            else
                log "Restauración cancelada"
                exit 0
            fi
            ;;
        3)
            list_backups
            read -p "Ingresa el número de consecutivo del backup: " backup_num
            restore_by_number "${backup_num}"
            ;;
        4)
            list_backups
            read -p "Ingresa el nombre completo del archivo: " backup_file
            restore_backup "${backup_file}"
            ;;
        5)
            log "Saliendo..."
            exit 0
            ;;
        *)
            log_error "Opción inválida"
            show_menu
            ;;
    esac
}

# Verificar argumentos
if [ $# -eq 0 ]; then
    show_menu
else
    case "$1" in
        --list)
            list_backups
            ;;
        --latest)
            latest=$(get_latest_backup)
            restore_backup "${latest}"
            ;;
        --number)
            if [ -z "$2" ]; then
                log_error "Debes especificar el número de consecutivo"
                exit 1
            fi
            restore_by_number "$2"
            ;;
        --file)
            if [ -z "$2" ]; then
                log_error "Debes especificar el nombre del archivo"
                exit 1
            fi
            restore_backup "$2"
            ;;
        *)
            log_error "Opción inválida"
            echo "Uso: $0 [--list|--latest|--number N|--file FILENAME]"
            exit 1
            ;;
    esac
fi
