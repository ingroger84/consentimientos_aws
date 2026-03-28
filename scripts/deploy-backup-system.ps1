# Script de Despliegue del Sistema de Backups Automáticos
# Fecha: 2026-03-17
# Descripción: Despliega y configura el sistema completo de backups en el servidor

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE SISTEMA DE BACKUPS AUTOMÁTICOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER = "ubuntu@100.28.198.249"
$KEY_PATH = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"
$LOCAL_SCRIPTS = "scripts"

Write-Host "[1/5] Verificando archivos locales..." -ForegroundColor Yellow
$requiredFiles = @(
    "scripts/backup-to-s3.sh",
    "scripts/restore-from-s3.sh",
    "scripts/send-backup-email.js",
    "scripts/setup-automated-backups.sh"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Error: No existe el archivo $file" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Todos los archivos verificados" -ForegroundColor Green

Write-Host ""
Write-Host "[2/5] Subiendo scripts al servidor..." -ForegroundColor Yellow
scp -i $KEY_PATH `
    scripts/backup-to-s3.sh `
    scripts/restore-from-s3.sh `
    scripts/send-backup-email.js `
    scripts/setup-automated-backups.sh `
    "${SERVER}:${REMOTE_PATH}/scripts/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Scripts subidos exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al subir scripts" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/5] Configurando permisos..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER @"
cd $REMOTE_PATH/scripts
chmod +x backup-to-s3.sh
chmod +x restore-from-s3.sh
chmod +x send-backup-email.js
chmod +x setup-automated-backups.sh
echo '✅ Permisos configurados'
"@

Write-Host ""
Write-Host "[4/5] Ejecutando configuración automática..." -ForegroundColor Yellow
Write-Host "⚠️  Este proceso puede tardar varios minutos..." -ForegroundColor Yellow
Write-Host ""

ssh -i $KEY_PATH $SERVER @"
cd $REMOTE_PATH
echo 'n' | sudo ./scripts/setup-automated-backups.sh
"@

Write-Host ""
Write-Host "[5/5] Verificando instalación..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER @"
echo '📋 Verificando cron jobs:'
crontab -l | grep -A 5 'Backups Automáticos' || echo 'No se encontraron cron jobs'
echo ''
echo '📁 Verificando directorios:'
ls -lh /home/ubuntu/backup_logs/ 2>/dev/null || echo 'Directorio de logs no existe'
echo ''
echo '🔧 Verificando AWS CLI:'
aws --version
echo ''
echo '📦 Verificando S3:'
aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/ 2>/dev/null || echo 'Carpeta no existe aún'
"@

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Sistema de Backups Configurado:" -ForegroundColor Cyan
Write-Host "  • Backup automático: 12:00 PM (mediodía)" -ForegroundColor White
Write-Host "  • Backup automático: 7:00 PM (noche)" -ForegroundColor White
Write-Host "  • Ubicación S3: s3://datagree-uploads/Back_Up_ArchivoEnLinea/" -ForegroundColor White
Write-Host "  • Email notificaciones: rcaraballo@innovasystems.com.co" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Comandos útiles (ejecutar en el servidor):" -ForegroundColor Cyan
Write-Host "  • Backup manual:" -ForegroundColor Gray
Write-Host "    /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh" -ForegroundColor White
Write-Host ""
Write-Host "  • Restaurar backup:" -ForegroundColor Gray
Write-Host "    /home/ubuntu/consentimientos_aws/scripts/restore-from-s3.sh" -ForegroundColor White
Write-Host ""
Write-Host "  • Ver logs:" -ForegroundColor Gray
Write-Host "    tail -f /home/ubuntu/backup_logs/cron_backup.log" -ForegroundColor White
Write-Host ""
Write-Host "  • Listar backups en S3:" -ForegroundColor Gray
Write-Host "    aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/" -ForegroundColor White
Write-Host ""
Write-Host "💡 Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Ejecutar un backup de prueba manualmente" -ForegroundColor White
Write-Host "  2. Verificar que llegue el email de notificación" -ForegroundColor White
Write-Host "  3. Esperar a los horarios programados (12 PM y 7 PM)" -ForegroundColor White
Write-Host ""
