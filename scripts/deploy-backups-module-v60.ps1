# Script de Despliegue - Módulo de Backups + Sistema Automático v60
# Fecha: 2026-03-17
# Incluye:
# - Backend v60 con módulo de backups
# - Frontend v41.1.6 con página de gestión de backups
# - Scripts de backups automáticos
# - Configuración de cron jobs

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE COMPLETO SISTEMA DE BACKUPS V60" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER = "ubuntu@100.28.198.249"
$KEY_PATH = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"
$BACKUP_NAME = "backend-dist-v60-backups-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "[1/8] Verificando archivos locales..." -ForegroundColor Yellow
if (-not (Test-Path "backend/dist")) {
    Write-Host "❌ Error: No existe backend/dist" -ForegroundColor Red
    Write-Host "Ejecuta: cd backend && npm run build" -ForegroundColor Yellow
    exit 1
}
if (-not (Test-Path "frontend/dist")) {
    Write-Host "❌ Error: No existe frontend/dist" -ForegroundColor Red
    Write-Host "Ejecuta: cd frontend && npm run build" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Archivos compilados verificados" -ForegroundColor Green

Write-Host ""
Write-Host "[2/8] Creando backup del backend actual..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER @"
cd $REMOTE_PATH
if [ -d backend/dist ]; then
    echo '📦 Creando backup...'
    cp -r backend/dist ../$BACKUP_NAME
    echo '✅ Backup creado: $BACKUP_NAME'
else
    echo '⚠️  No existe backend/dist, no se crea backup'
fi
"@

Write-Host ""
Write-Host "[3/8] Subiendo backend actualizado..." -ForegroundColor Yellow
Write-Host "Limpiando directorio dist remoto..." -ForegroundColor Gray
ssh -i $KEY_PATH $SERVER "rm -rf $REMOTE_PATH/backend/dist/*"

Write-Host "Subiendo archivos del backend..." -ForegroundColor Gray
scp -i $KEY_PATH -r "backend/dist/*" "${SERVER}:${REMOTE_PATH}/backend/dist/"
Write-Host "✅ Backend subido" -ForegroundColor Green

Write-Host ""
Write-Host "[4/8] Subiendo frontend actualizado..." -ForegroundColor Yellow
Write-Host "Limpiando directorio dist remoto..." -ForegroundColor Gray
ssh -i $KEY_PATH $SERVER "rm -rf $REMOTE_PATH/frontend/dist/*"

Write-Host "Subiendo archivos del frontend..." -ForegroundColor Gray
scp -i $KEY_PATH -r "frontend/dist/*" "${SERVER}:${REMOTE_PATH}/frontend/dist/"
Write-Host "✅ Frontend subido" -ForegroundColor Green

Write-Host ""
Write-Host "[5/8] Subiendo scripts de backups..." -ForegroundColor Yellow
scp -i $KEY_PATH `
    scripts/backup-to-s3.sh `
    scripts/restore-from-s3.sh `
    scripts/send-backup-email.js `
    scripts/setup-automated-backups.sh `
    scripts/test-backup-system.sh `
    "${SERVER}:${REMOTE_PATH}/scripts/"
Write-Host "✅ Scripts subidos" -ForegroundColor Green

Write-Host ""
Write-Host "[6/8] Configurando permisos y dependencias..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER @"
cd $REMOTE_PATH

# Permisos de scripts
chmod +x scripts/backup-to-s3.sh
chmod +x scripts/restore-from-s3.sh
chmod +x scripts/send-backup-email.js
chmod +x scripts/setup-automated-backups.sh
chmod +x scripts/test-backup-system.sh

# Instalar nodemailer si no está
if [ ! -d "node_modules/nodemailer" ]; then
    echo '📦 Instalando nodemailer...'
    npm install nodemailer
fi

echo '✅ Permisos y dependencias configurados'
"@

Write-Host ""
Write-Host "[7/8] Reiniciando servicios..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER @"
cd $REMOTE_PATH
echo '🔄 Reiniciando PM2...'
pm2 restart datagree
sleep 3
pm2 list
echo ''
echo '🌐 Verificando API:'
curl -s http://localhost:3000/health | head -n 5
"@

Write-Host ""
Write-Host "[8/8] Configurando sistema de backups automáticos..." -ForegroundColor Yellow
Write-Host "⚠️  Este paso es opcional. ¿Deseas configurar los backups automáticos ahora? (s/n)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "s" -or $response -eq "S") {
    Write-Host "Configurando backups automáticos..." -ForegroundColor Gray
    ssh -i $KEY_PATH $SERVER @"
cd $REMOTE_PATH
echo 'n' | sudo ./scripts/setup-automated-backups.sh
"@
    Write-Host "✅ Backups automáticos configurados" -ForegroundColor Green
} else {
    Write-Host "⏭️  Configuración de backups automáticos omitida" -ForegroundColor Yellow
    Write-Host "Puedes configurarlos más tarde ejecutando:" -ForegroundColor Gray
    Write-Host "  ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249" -ForegroundColor White
    Write-Host "  cd /home/ubuntu/consentimientos_aws" -ForegroundColor White
    Write-Host "  sudo ./scripts/setup-automated-backups.sh" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Cambios desplegados:" -ForegroundColor Cyan
Write-Host "  • Backend v60 con módulo de backups" -ForegroundColor White
Write-Host "  • Frontend v41.1.6 con gestión de backups" -ForegroundColor White
Write-Host "  • Scripts de backups automáticos" -ForegroundColor White
Write-Host "  • Sistema de notificaciones por email" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Acceso al sistema:" -ForegroundColor Cyan
Write-Host "  • URL: https://archivoenlinea.com" -ForegroundColor White
Write-Host "  • Módulo Backups: https://archivoenlinea.com/backups" -ForegroundColor White
Write-Host "  • Menú: Sistema > Backups (solo Super Admin)" -ForegroundColor White
Write-Host ""
Write-Host "📦 Backup del estado anterior:" -ForegroundColor Cyan
Write-Host "  • Ubicación: /home/ubuntu/$BACKUP_NAME" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Acceder como Super Admin" -ForegroundColor White
Write-Host "  2. Ir a Sistema > Backups" -ForegroundColor White
Write-Host "  3. Verificar que se muestran los backups" -ForegroundColor White
Write-Host "  4. Probar crear un backup manual" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación:" -ForegroundColor Cyan
Write-Host "  • SISTEMA_BACKUPS_AUTOMATICOS.md" -ForegroundColor White
Write-Host "  • MODULO_GESTION_BACKUPS_WEB.md" -ForegroundColor White
Write-Host "  • INSTRUCCIONES_BACKUPS_AUTOMATICOS.md" -ForegroundColor White
Write-Host ""
