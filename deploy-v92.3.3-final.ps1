# Script para desplegar versión 92.3.3 FINAL con banner azul

$serverIP = "100.28.198.249"
$keyPath = "AWS-ISSABEL.pem"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLEGANDO VERSION 92.3.3 FINAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Subir archivos del frontend
Write-Host "1. Subiendo frontend..." -ForegroundColor Yellow
scp -i $keyPath -r frontend/dist/* ubuntu@${serverIP}:/home/ubuntu/consentimientos_aws/frontend/dist/

# 2. Verificar versión desplegada
Write-Host ""
Write-Host "2. Verificando versión desplegada..." -ForegroundColor Yellow
ssh -i $keyPath ubuntu@$serverIP "cat /home/ubuntu/consentimientos_aws/frontend/dist/version.json"

# 3. Limpiar caché de Nginx
Write-Host ""
Write-Host "3. Limpiando cache de Nginx..." -ForegroundColor Yellow
ssh -i $keyPath ubuntu@$serverIP "sudo rm -rf /var/cache/nginx/*"

# 4. Recargar Nginx
Write-Host ""
Write-Host "4. Recargando Nginx..." -ForegroundColor Yellow
ssh -i $keyPath ubuntu@$serverIP "sudo nginx -s reload"

# 5. Verificar PM2
Write-Host ""
Write-Host "5. Verificando PM2..." -ForegroundColor Yellow
ssh -i $keyPath ubuntu@$serverIP "pm2 list | grep datagree"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "VERSION DESPLEGADA: 92.3.3" -ForegroundColor Cyan
Write-Host ""
Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Accede a: https://termaleses.archivoenlinea.com" -ForegroundColor White
Write-Host "2. Presiona Ctrl + Shift + R para forzar recarga" -ForegroundColor White
Write-Host "3. Abre la consola (F12)" -ForegroundColor White
Write-Host "4. Busca logs: [BillingCycleReminderBanner]" -ForegroundColor White
Write-Host "5. Verifica que la version sea 92.3.3" -ForegroundColor White
Write-Host ""
