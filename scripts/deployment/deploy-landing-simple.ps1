# Script de Despliegue - Landing Page v23.0.0
# Fecha: 31 de Enero 2026

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE LANDING PAGE v23.0.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "keys/AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

# Verificar que existe el directorio dist
if (-not (Test-Path "frontend/dist")) {
    Write-Host "[ERROR] No existe el directorio frontend/dist" -ForegroundColor Red
    Write-Host "   Ejecuta: cd frontend && npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Directorio dist encontrado" -ForegroundColor Green

# Crear backup
Write-Host ""
Write-Host "[BACKUP] Creando backup del frontend actual..." -ForegroundColor Yellow
ssh -i $KEY "$USER@$SERVER" 'cd /home/ubuntu/consentimientos_aws && if [ -d frontend/dist ]; then timestamp=$(date +%Y%m%d_%H%M%S) && cp -r frontend/dist frontend/dist_backup_$timestamp && echo "Backup creado: frontend/dist_backup_$timestamp"; fi'

# Subir archivos
Write-Host ""
Write-Host "[UPLOAD] Subiendo archivos al servidor..." -ForegroundColor Yellow
scp -i $KEY -r frontend/dist/* "$USER@$SERVER`:$REMOTE_PATH/frontend/dist/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error al subir archivos" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Archivos subidos exitosamente" -ForegroundColor Green

# Verificar permisos
Write-Host ""
Write-Host "[PERMISOS] Configurando permisos..." -ForegroundColor Yellow
ssh -i $KEY "$USER@$SERVER" 'cd /home/ubuntu/consentimientos_aws/frontend/dist && chmod -R 755 . && chown -R ubuntu:ubuntu . && echo "Permisos configurados"'

# Limpiar cache
Write-Host ""
Write-Host "[CACHE] Limpiando cache de nginx..." -ForegroundColor Yellow
ssh -i $KEY "$USER@$SERVER" 'sudo rm -rf /var/cache/nginx/* && echo "Cache limpiado"'

# Recargar nginx
Write-Host ""
Write-Host "[NGINX] Recargando nginx..." -ForegroundColor Yellow
ssh -i $KEY "$USER@$SERVER" "sudo systemctl reload nginx"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error al recargar nginx" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Nginx recargado exitosamente" -ForegroundColor Green

# Verificar estado
Write-Host ""
Write-Host "[STATUS] Verificando estado de nginx..." -ForegroundColor Yellow
ssh -i $KEY "$USER@$SERVER" "sudo systemctl status nginx --no-pager | head -n 5"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Landing Page: https://archivoenlinea.com" -ForegroundColor Cyan
Write-Host "Estado: https://archivoenlinea.com/status" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cambios principales:" -ForegroundColor Yellow
Write-Host "   - Landing page con enfoque generico" -ForegroundColor White
Write-Host "   - Modulo de HC como plus para sector salud" -ForegroundColor White
Write-Host "   - 6 casos de uso (multiples industrias)" -ForegroundColor White
Write-Host "   - CTA actualizado" -ForegroundColor White
Write-Host ""
Write-Host "[IMPORTANTE] Verificar landing page en navegador" -ForegroundColor Yellow
Write-Host "   Presiona Ctrl+Shift+R para forzar recarga sin cache" -ForegroundColor Yellow
Write-Host ""
