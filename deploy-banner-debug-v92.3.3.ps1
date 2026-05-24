# Script para desplegar versión 92.3.3 con debugging del banner

$serverIP = "100.28.198.249"
$keyPath = "AWS-ISSABEL.pem"

Write-Host "Desplegando v92.3.3 con debugging del banner..." -ForegroundColor Cyan
Write-Host ""

# Subir archivos del frontend
Write-Host "Subiendo frontend..." -ForegroundColor Yellow
scp -i $keyPath -r frontend/dist/* ubuntu@${serverIP}:/home/ubuntu/consentimientos_aws/frontend/dist/

# Limpiar caché de Nginx
Write-Host ""
Write-Host "Limpiando cache de Nginx..." -ForegroundColor Yellow
ssh -i $keyPath ubuntu@$serverIP "sudo rm -rf /var/cache/nginx/*"
ssh -i $keyPath ubuntu@$serverIP "sudo nginx -s reload"

Write-Host ""
Write-Host "Despliegue completado" -ForegroundColor Green
Write-Host ""
Write-Host "INSTRUCCIONES:" -ForegroundColor Cyan
Write-Host "1. Accede a: https://termaleses.archivoenlinea.com" -ForegroundColor White
Write-Host "2. Abre la consola del navegador (F12)" -ForegroundColor White
Write-Host "3. Busca logs que empiecen con [BillingCycleReminderBanner]" -ForegroundColor White
Write-Host "4. Comparte los logs para diagnosticar" -ForegroundColor White
Write-Host ""
