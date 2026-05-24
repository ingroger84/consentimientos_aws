# Script para revisar logs del servidor en tiempo real
# Diagnóstico: Problema creación de plantillas en cuenta aquiub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNÓSTICO: Problema Creación Plantillas - Aquiub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Conectando al servidor AWS..." -ForegroundColor Yellow
Write-Host "IP: 100.28.198.249" -ForegroundColor Gray
Write-Host "Usuario: ubuntu" -ForegroundColor Gray
Write-Host ""

Write-Host "INSTRUCCIONES:" -ForegroundColor Green
Write-Host "1. Este script se conectará al servidor" -ForegroundColor White
Write-Host "2. Mostrará los logs en tiempo real" -ForegroundColor White
Write-Host "3. Intenta crear una plantilla en la cuenta aquiub" -ForegroundColor White
Write-Host "4. Observa los errores que aparecen en los logs" -ForegroundColor White
Write-Host "5. Presiona Ctrl+C para salir" -ForegroundColor White
Write-Host ""

Write-Host "Ejecutando comando SSH..." -ForegroundColor Yellow
Write-Host ""

# Comando SSH para ver logs en tiempo real
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree --lines 100"
