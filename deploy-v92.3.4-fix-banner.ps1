# Script para desplegar versión 92.3.4 - Corrección del banner azul

$serverIP = "100.28.198.249"
$keyPath = "AWS-ISSABEL.pem"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLEGANDO VERSION 92.3.4" -ForegroundColor Cyan
Write-Host "Corrección: Banner azul no se renderizaba" -ForegroundColor Cyan
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
Write-Host "VERSION DESPLEGADA: 92.3.4" -ForegroundColor Cyan
Write-Host ""
Write-Host "CAMBIOS EN ESTA VERSION:" -ForegroundColor Yellow
Write-Host "- Agregados logs en PaymentReminderBanner" -ForegroundColor White
Write-Host "- Corregido: No renderizar BillingCycleReminderBanner durante loading" -ForegroundColor White
Write-Host "- Ahora el banner azul se renderiza correctamente" -ForegroundColor White
Write-Host ""
Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Accede a: https://termaleses.archivoenlinea.com" -ForegroundColor White
Write-Host "2. Presiona Ctrl + Shift + R para forzar recarga" -ForegroundColor White
Write-Host "3. Abre la consola (F12)" -ForegroundColor White
Write-Host "4. Busca logs: [PaymentReminderBanner] y [BillingCycleReminderBanner]" -ForegroundColor White
Write-Host "5. Verifica que la version sea 92.3.4" -ForegroundColor White
Write-Host "6. Deberías ver el BANNER AZUL en el dashboard" -ForegroundColor White
Write-Host ""
