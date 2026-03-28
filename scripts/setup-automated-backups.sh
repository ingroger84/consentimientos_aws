#!/bin/bash

# ============================================
# Script de Configuración de Backups Automáticos
# ============================================
# Descripción: Configura cron jobs para backups automáticos
# Autor: Sistema de Backups Automáticos
# Fecha: 2026-03-17
# ============================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log "=========================================="
log "CONFIGURACIÓN DE BACKUPS AUTOMÁTICOS"
log "=========================================="

# 1. Verificar que estamos en el servidor correcto
if [ ! -d "/home/ubuntu/consentimientos_aws" ]; then
    log_error "Este script debe ejecutarse en el servidor de producción"
    exit 1
fi

# 2. Crear directorios necesarios
log "Creando directorios necesarios..."
mkdir -p /home/ubuntu/backup_logs
mkdir -p /tmp/backups
log_success "Directorios creados"

# 3. Dar permisos de ejecución a los scripts
log "Configurando permisos de scripts..."
chmod +x /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh
chmod +x /home/ubuntu/consentimientos_aws/scripts/restore-from-s3.sh
chmod +x /home/ubuntu/consentimientos_aws/scripts/send-backup-email.js
log_success "Permisos configurados"

# 4. Verificar que AWS CLI está instalado
log "Verificando AWS CLI..."
if ! command -v aws &> /dev/null; then
    log_warning "AWS CLI no está instalado. Instalando..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
    log_success "AWS CLI instalado"
else
    log_success "AWS CLI ya está instalado"
fi

# 5. Configurar credenciales de AWS
log "Configurando credenciales de AWS..."

# Leer credenciales del .env
ENV_FILE="/home/ubuntu/consentimientos_aws/backend/.env"
AWS_ACCESS_KEY=$(grep "^AWS_ACCESS_KEY_ID=" "$ENV_FILE" | cut -d '=' -f2)
AWS_SECRET_KEY=$(grep "^AWS_SECRET_ACCESS_KEY=" "$ENV_FILE" | cut -d '=' -f2)
AWS_REGION=$(grep "^AWS_REGION=" "$ENV_FILE" | cut -d '=' -f2)

# Configurar AWS CLI
mkdir -p ~/.aws
cat > ~/.aws/credentials << EOF
[default]
aws_access_key_id = ${AWS_ACCESS_KEY}
aws_secret_access_key = ${AWS_SECRET_KEY}
EOF

cat > ~/.aws/config << EOF
[default]
region = ${AWS_REGION}
output = json
EOF

log_success "Credenciales de AWS configuradas"

# 6. Verificar conectividad con S3
log "Verificando conectividad con S3..."
if aws s3 ls s3://datagree-uploads/ > /dev/null 2>&1; then
    log_success "Conectividad con S3 verificada"
else
    log_error "No se pudo conectar con S3. Verifica las credenciales."
    exit 1
fi

# 7. Crear bucket path si no existe
log "Verificando carpeta de backups en S3..."
aws s3api put-object --bucket datagree-uploads --key Back_Up_ArchivoEnLinea/ || true
log_success "Carpeta de backups verificada en S3"

# 8. Instalar nodemailer si no está instalado
log "Verificando dependencias de Node.js..."
cd /home/ubuntu/consentimientos_aws
if [ ! -d "node_modules/nodemailer" ]; then
    log "Instalando nodemailer..."
    npm install nodemailer
    log_success "nodemailer instalado"
else
    log_success "nodemailer ya está instalado"
fi

# 9. Configurar cron jobs
log "Configurando cron jobs..."

# Crear archivo temporal con los cron jobs
CRON_FILE="/tmp/backup_cron_$$"

# Obtener crontab actual (si existe)
crontab -l > "$CRON_FILE" 2>/dev/null || true

# Eliminar entradas antiguas de backups (si existen)
sed -i '/backup-to-s3.sh/d' "$CRON_FILE"

# Agregar nuevos cron jobs
cat >> "$CRON_FILE" << 'EOF'

# ============================================
# Backups Automáticos - Archivo en Línea
# ============================================
# Backup diario a las 12:00 PM (mediodía)
0 12 * * * /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh >> /home/ubuntu/backup_logs/cron_backup.log 2>&1

# Backup diario a las 7:00 PM (noche)
0 19 * * * /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh >> /home/ubuntu/backup_logs/cron_backup.log 2>&1
EOF

# Instalar nuevo crontab
crontab "$CRON_FILE"
rm "$CRON_FILE"

log_success "Cron jobs configurados"

# 10. Mostrar crontab actual
log ""
log "Cron jobs instalados:"
echo "----------------------------------------"
crontab -l | grep -A 5 "Backups Automáticos"
echo "----------------------------------------"

# 11. Ejecutar backup de prueba
log ""
log "¿Deseas ejecutar un backup de prueba ahora? (s/n)"
read -r response

if [ "$response" = "s" ] || [ "$response" = "S" ]; then
    log "Ejecutando backup de prueba..."
    /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh
else
    log "Backup de prueba omitido"
fi

log ""
log_success "=========================================="
log_success "CONFIGURACIÓN COMPLETADA"
log_success "=========================================="
log ""
log "📋 Resumen de la configuración:"
log "  • Backups programados: 12:00 PM y 7:00 PM diarios"
log "  • Ubicación S3: s3://datagree-uploads/Back_Up_ArchivoEnLinea/"
log "  • Logs: /home/ubuntu/backup_logs/"
log "  • Email notificaciones: rcaraballo@innovasystems.com.co"
log ""
log "🔧 Comandos útiles:"
log "  • Ver cron jobs: crontab -l"
log "  • Ver logs: tail -f /home/ubuntu/backup_logs/cron_backup.log"
log "  • Backup manual: /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh"
log "  • Restaurar backup: /home/ubuntu/consentimientos_aws/scripts/restore-from-s3.sh"
log "  • Listar backups: aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/"
log ""
log "✅ El sistema de backups automáticos está listo"
log ""

exit 0
