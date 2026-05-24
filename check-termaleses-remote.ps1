# Script para verificar facturas del tenant Termales en el servidor remoto

$serverIP = "100.28.198.249"
$keyPath = "AWS-ISSABEL.pem"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO TENANT TERMALES ESPIRITU SANTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Subir el script al servidor
Write-Host "1. Subiendo script de verificación..." -ForegroundColor Yellow
scp -i $keyPath backend/check-termaleses-invoices.js ubuntu@${serverIP}:/home/ubuntu/consentimientos_aws/backend/

# 2. Ejecutar el script en el servidor
Write-Host ""
Write-Host "2. Ejecutando verificación..." -ForegroundColor Yellow
ssh -i $keyPath ubuntu@$serverIP "cd /home/ubuntu/consentimientos_aws/backend && node check-termaleses-invoices.js"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "VERIFICACION COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
