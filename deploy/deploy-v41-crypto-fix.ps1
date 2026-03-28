# ============================================================================
# Despliegue V41.1.6 - Fix crypto + constraint record_number
# Fecha: 2026-03-15
# ============================================================================

$ErrorActionPreference = "Stop"

$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE V41.1.6 - Solucion Definitiva" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Subir dist compilado
Write-Host "1. Subiendo backend compilado..." -ForegroundColor Yellow
scp -i $KEY -r backend/dist/* "${SERVER}:${REMOTE_PATH}/backend/dist/"
Write-Host "Backend subido correctamente" -ForegroundColor Green

# 2. Reiniciar PM2
Write-Host ""
Write-Host "2. Reiniciando PM2..." -ForegroundColor Yellow
$restartScript = "cd $REMOTE_PATH && pm2 restart ecosystem.config.js && sleep 5 && pm2 status"
ssh -i $KEY $SERVER $restartScript
Write-Host "PM2 reiniciado" -ForegroundColor Green

# 3. Esperar a que el backend inicie
Write-Host ""
Write-Host "3. Esperando a que el backend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4. Verificar que el backend responda
Write-Host ""
Write-Host "4. Verificando que el backend responda..." -ForegroundColor Yellow
$healthCheck = ssh -i $KEY $SERVER "curl -s http://localhost:3000/api/health 2>&1"
if ($healthCheck -match "ok" -or $healthCheck -match "healthy") {
    Write-Host "Backend respondiendo correctamente" -ForegroundColor Green
} else {
    Write-Host "Verificando logs..." -ForegroundColor Yellow
    ssh -i $KEY $SERVER "pm2 logs --lines 20 --nostream"
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PRUEBA AHORA:" -ForegroundColor Yellow
Write-Host "1. Ir a: https://demo-medico.archivoenlinea.com" -ForegroundColor White
Write-Host "2. Intentar crear una historia clinica" -ForegroundColor White
Write-Host "3. Verificar que NO aparezca error de CORS ni duplicate key" -ForegroundColor White
Write-Host ""
