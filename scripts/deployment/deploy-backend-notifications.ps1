# Script de Despliegue - Backend con Notificaciones v23.1.0
# Fecha: 31 de Enero 2026

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE BACKEND - NOTIFICACIONES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "keys/AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

# Verificar que existe el directorio dist
if (-not (Test-Path "backend/dist")) {
    Write-Host "[ERROR] No existe el directorio backend/dist" -ForegroundColor Red
    Write-Host "   Ejecuta: cd backend && npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Directorio dist encontrado" -ForegroundColor Green

# Crear backup
Write-Host ""
Write-Host "[BACKUP] Creando backup del backend actual..." -ForegroundColor Yellow
ssh -i $KEY "$USER@$SERVER" 'cd /home/ubuntu/consentimientos_aws && if [ -d backend/dist ]; then timestamp=$(date +%Y%m%d_%H%M%S) && cp -r backend/dist backend/dist_backup_$timestamp && echo "Backup creado: backend/dist_backup_$timestamp"; fi'

# Subir archivos
Write-Host ""
Write-Host "[UPLOAD] Subiendo archivos al servidor..." -ForegroundColor Yellow
scp -i $KEY -r backend/dist/* "$USER@$SERVER`:$REMOTE_PATH/backend/dist/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error al subir archivos" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Archivos subidos exitosamente" -ForegroundColor Green

# Verificar permisos
Write-Host ""
Write-Host "[PERMISOS] Configurando permisos..." -ForegroundColor Yellow
ssh -i $KEY "$USER@$SERVER" 'cd /home/ubuntu/consentimientos_aws/backend/dist && chmod -R 755 . && chown -R ubuntu:ubuntu . && echo "Permisos configurados"'

# Reiniciar PM2
Write-Host ""
Write-Host "[PM2] Reiniciando aplicacion..." -ForegroundColor Yellow
ssh -i $KEY "$USER@$SERVER" 'cd /home/ubuntu/consentimientos_aws && pm2 restart datagree --update-env'

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error al reiniciar PM2" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] PM2 reiniciado exitosamente" -ForegroundColor Green

# Verificar estado
Write-Host ""
Write-Host "[STATUS] Verificando estado de PM2..." -ForegroundColor Yellow
ssh -i $KEY "$USER@$SERVER" "pm2 status | grep -E 'datagree|online'"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: https://archivoenlinea.com/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cambios principales:" -ForegroundColor Yellow
Write-Host "   - Notificaciones de trial expirado al tenant" -ForegroundColor White
Write-Host "   - Notificaciones al Super Admin" -ForegroundColor White
Write-Host "   - Plantillas sin caracteres especiales" -ForegroundColor White
Write-Host "   - Sistema de correos verificado" -ForegroundColor White
Write-Host ""
Write-Host "[IMPORTANTE] Verificar logs de PM2" -ForegroundColor Yellow
Write-Host "   ssh ubuntu@100.28.198.249 'pm2 logs datagree --lines 50'" -ForegroundColor Yellow
Write-Host ""
