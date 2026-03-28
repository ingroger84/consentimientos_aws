# Script de Despliegue V63 - Correo de Soporte Dinámico
# Fecha: 2026-03-20

$ErrorActionPreference = "Stop"

# Configuración
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$SSH_KEY = "AWS-ISSABEL.pem"
$BACKEND_ZIP = "backend-dist-v63-correo-dinamico.zip"
$FRONTEND_ZIP = "frontend-dist-v63-correo-dinamico.zip"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE V63 - CORREO DINAMICO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar archivos
Write-Host "1. Verificando archivos..." -ForegroundColor Yellow
if (-not (Test-Path $BACKEND_ZIP)) {
    Write-Host "ERROR: No se encontro $BACKEND_ZIP" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $FRONTEND_ZIP)) {
    Write-Host "ERROR: No se encontro $FRONTEND_ZIP" -ForegroundColor Red
    exit 1
}
Write-Host "   OK: Archivos encontrados" -ForegroundColor Green
Write-Host ""

# Paso 2: Subir backend
Write-Host "2. Subiendo backend al servidor..." -ForegroundColor Yellow
scp -i $SSH_KEY $BACKEND_ZIP "${SERVER_USER}@${SERVER_IP}:/home/ubuntu/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo al subir backend" -ForegroundColor Red
    exit 1
}
Write-Host "   OK: Backend subido" -ForegroundColor Green
Write-Host ""

# Paso 3: Subir frontend
Write-Host "3. Subiendo frontend al servidor..." -ForegroundColor Yellow
scp -i $SSH_KEY $FRONTEND_ZIP "${SERVER_USER}@${SERVER_IP}:/home/ubuntu/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo al subir frontend" -ForegroundColor Red
    exit 1
}
Write-Host "   OK: Frontend subido" -ForegroundColor Green
Write-Host ""

# Paso 4: Crear backup y desplegar backend
Write-Host "4. Desplegando backend..." -ForegroundColor Yellow
ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cd /home/ubuntu/consentimientos_aws && cp -r backend/dist backend/dist.backup.`$(date +%Y%m%d_%H%M%S) && unzip -o /home/ubuntu/$BACKEND_ZIP -d backend/dist/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo al desplegar backend" -ForegroundColor Red
    exit 1
}
Write-Host "   OK: Backend desplegado" -ForegroundColor Green
Write-Host ""

# Paso 5: Crear backup y desplegar frontend
Write-Host "5. Desplegando frontend..." -ForegroundColor Yellow
ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cd /home/ubuntu/consentimientos_aws && cp -r frontend/dist frontend/dist.backup.`$(date +%Y%m%d_%H%M%S) && unzip -o /home/ubuntu/$FRONTEND_ZIP -d frontend/dist/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo al desplegar frontend" -ForegroundColor Red
    exit 1
}
Write-Host "   OK: Frontend desplegado" -ForegroundColor Green
Write-Host ""

# Paso 6: Reiniciar PM2
Write-Host "6. Reiniciando PM2..." -ForegroundColor Yellow
ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "pm2 restart all"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo al reiniciar PM2" -ForegroundColor Red
    exit 1
}
Write-Host "   OK: PM2 reiniciado" -ForegroundColor Green
Write-Host ""

# Paso 7: Verificar estado
Write-Host "7. Verificando estado..." -ForegroundColor Yellow
ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "pm2 status"
Write-Host ""

# Resumen final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ir a Configuracion Avanzada" -ForegroundColor White
Write-Host "2. Buscar el campo 'Email de Soporte'" -ForegroundColor White
Write-Host "3. Ingresar el correo deseado" -ForegroundColor White
Write-Host "4. Guardar cambios" -ForegroundColor White
Write-Host "5. Generar una factura para verificar" -ForegroundColor White
Write-Host ""
Write-Host "URL: https://hotelarchivoenlínea.com" -ForegroundColor Cyan
Write-Host "o http://100.28.198.249" -ForegroundColor Cyan
Write-Host ""
