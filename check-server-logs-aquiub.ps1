# Script para revisar logs del servidor y buscar errores de creación de plantillas
Write-Host "Conectando al servidor para revisar logs..." -ForegroundColor Cyan
Write-Host ""

# Conectar y buscar errores recientes relacionados con plantillas
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree --lines 500 --nostream | grep -i 'template\|error' | tail -100"
