# Script para revisar logs del servidor en busca de errores de plantillas
# Fecha: 22 Mayo 2026

Write-Host "🔍 Conectando al servidor para revisar logs..." -ForegroundColor Cyan
Write-Host ""

# Comando para ver logs recientes relacionados con templates
$command = @"
pm2 logs datagree --lines 500 --nostream | grep -i 'template\|error\|aquiub' | tail -100
"@

Write-Host "Ejecutando comando en servidor..." -ForegroundColor Yellow
Write-Host $command
Write-Host ""

ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 $command
