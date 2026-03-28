# ============================================================================
# Script de despliegue final v41.1.5 con todas las correcciones
# Fecha: 2026-03-15
# ============================================================================

$ErrorActionPreference = "Stop"

$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE FINAL V41.1.5 - Correccion Completa" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Compilar backend localmente
Write-Host "1. Compilando backend localmente..." -ForegroundColor Yellow
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar backend" -ForegroundColor Red
    exit 1
}
Write-Host "Backend compilado correctamente" -ForegroundColor Green
Set-Location ..

# 2. Crear backup en produccion
Write-Host ""
Write-Host "2. Creando backup en produccion..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupName = "backend-backup-v41-final-$timestamp"

$backupScript = "cd $REMOTE_PATH && if [ -d backend/dist ]; then cp -r backend/dist $backupName && echo 'Backup creado: $backupName'; else echo 'No hay dist para respaldar'; fi"
ssh -i $KEY $SERVER $backupScript

# 3. Subir archivos
Write-Host ""
Write-Host "3. Subiendo archivos..." -ForegroundColor Yellow

Write-Host "   - Subiendo backend/dist..." -ForegroundColor Gray
scp -i $KEY -r backend/dist/* "${SERVER}:${REMOTE_PATH}/backend/dist/"

Write-Host "   - Subiendo ecosystem.config.js..." -ForegroundColor Gray
scp -i $KEY ecosystem.config.js "${SERVER}:${REMOTE_PATH}/"

Write-Host "   - Subiendo .env..." -ForegroundColor Gray
scp -i $KEY backend/.env "${SERVER}:${REMOTE_PATH}/backend/"

Write-Host "Archivos subidos correctamente" -ForegroundColor Green

# 4. Reiniciar PM2
Write-Host ""
Write-Host "4. Reiniciando PM2..." -ForegroundColor Yellow

$restartScript = "cd $REMOTE_PATH && pm2 delete all && pm2 start ecosystem.config.js && sleep 5 && pm2 status"
ssh -i $KEY $SERVER $restartScript

Write-Host "PM2 reiniciado" -ForegroundColor Green

# 5. Verificar logs
Write-Host ""
Write-Host "5. Verificando logs..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
ssh -i $KEY $SERVER "pm2 logs --lines 30 --nostream"

# 6. Verificar que el backend responda
Write-Host ""
Write-Host "6. Verificando que el backend responda..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "curl -I http://localhost:3000/api/health 2>&1 | head -5"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Probar crear HC en demo-medico.archivoenlinea.com" -ForegroundColor White
Write-Host "2. Verificar que no aparezca error de CORS" -ForegroundColor White
Write-Host "3. Verificar que no aparezca error de duplicate key" -ForegroundColor White
Write-Host ""
