# Script de despliegue V73 - Correccion de contadores de clientes
$ErrorActionPreference = "Stop"

Write-Host "=== DESPLIEGUE V73: CORRECCION CONTADORES CLIENTES ===" -ForegroundColor Cyan

$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$KEY_FILE = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

Write-Host "1. Subiendo script de correccion al servidor..." -ForegroundColor Yellow
scp -i ../AWS-ISSABEL.pem ../backend/fix-client-consents-count.js "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir script" -ForegroundColor Red
    exit 1
}

Write-Host "Script subido exitosamente" -ForegroundColor Green

Write-Host "2. Ejecutando script de correccion en el servidor..." -ForegroundColor Yellow
ssh -i ../AWS-ISSABEL.pem "${SERVER_USER}@${SERVER_IP}" "cd $REMOTE_PATH/backend && node fix-client-consents-count.js"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al ejecutar script de correccion" -ForegroundColor Red
    exit 1
}

Write-Host "Contadores corregidos exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "=== DESPLIEGUE V73 COMPLETADO ===" -ForegroundColor Green
Write-Host ""
Write-Host "CAMBIOS APLICADOS:" -ForegroundColor Cyan
Write-Host "- Contadores de consentimientos de clientes recalculados" -ForegroundColor Green
Write-Host "- Clientes con consentimientos eliminados ahora muestran 0" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Refrescar la pagina de Clientes en el navegador (Ctrl+F5)" -ForegroundColor White
Write-Host "2. Verificar que Roger Caraballo ahora muestre 0 consentimientos" -ForegroundColor White
