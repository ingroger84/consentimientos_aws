# Script para solucionar el problema de memoria en el servidor
# Fecha: 22 Mayo 2026

Write-Host "========================================" -ForegroundColor Red
Write-Host "SOLUCIÓN CRÍTICA: Out of Memory" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "Problema identificado:" -ForegroundColor Yellow
Write-Host "El servidor Node.js se está quedando sin memoria" -ForegroundColor White
Write-Host ""

Write-Host "Solución:" -ForegroundColor Green
Write-Host "Aumentar el límite de memoria a 4GB" -ForegroundColor White
Write-Host ""

Write-Host "Conectando al servidor..." -ForegroundColor Cyan
Write-Host ""

# Comando para ejecutar en el servidor
$commands = @"
cd /home/ubuntu/consentimientos_aws/backend && \
echo '--- Deteniendo proceso actual ---' && \
pm2 stop datagree && \
echo '--- Iniciando con 4GB de memoria ---' && \
pm2 delete datagree && \
pm2 start dist/main.js --name datagree --node-args='--max-old-space-size=4096' && \
pm2 save && \
echo '--- Verificando estado ---' && \
pm2 status && \
echo '--- Proceso reiniciado exitosamente ---'
"@

Write-Host "Ejecutando comandos en el servidor..." -ForegroundColor Yellow
Write-Host ""

ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 $commands

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SOLUCIÓN APLICADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Intenta crear una plantilla nuevamente" -ForegroundColor White
Write-Host "2. Si funciona, el problema está resuelto" -ForegroundColor White
Write-Host "3. Si persiste, avísame para investigar más" -ForegroundColor White
Write-Host ""

Write-Host "Para ver los logs en tiempo real:" -ForegroundColor Yellow
Write-Host "ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249" -ForegroundColor Gray
Write-Host "pm2 logs datagree" -ForegroundColor Gray
Write-Host ""
