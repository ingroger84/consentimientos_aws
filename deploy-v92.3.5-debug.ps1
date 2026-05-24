# Script para desplegar versión 92.3.5 - Logs de debugging mejorados

$serverIP = "100.28.198.249"
$keyPath = "AWS-ISSABEL.pem"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLEGANDO VERSION 92.3.5" -ForegroundColor Cyan
Write-Host "Logs de debugging mejorados" -ForegroundColor Cyan
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

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "VERSION DESPLEGADA: 92.3.5" -ForegroundColor Cyan
Write-Host ""
Write-Host "CAMBIOS EN ESTA VERSION:" -ForegroundColor Yellow
Write-Host "- Agregado log al cargar el módulo: 📦 [PaymentReminderBanner] MÓDULO CARGADO" -ForegroundColor White
Write-Host "- Agregado log al cargar el módulo: 📦 [BillingCycleReminderBanner] MÓDULO CARGADO" -ForegroundColor White
Write-Host "- Agregado log al renderizar: 🚀 [PaymentReminderBanner] COMPONENTE RENDERIZADO" -ForegroundColor White
Write-Host "- Agregado log al renderizar: 🚀 [BillingCycleReminderBanner] COMPONENTE RENDERIZADO" -ForegroundColor White
Write-Host "- Agregado log en useEffect: 🔍 [PaymentReminderBanner] useEffect ejecutándose..." -ForegroundColor White
Write-Host ""
Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Accede a: https://termaleses.archivoenlinea.com" -ForegroundColor White
Write-Host "2. Presiona Ctrl + Shift + R para forzar recarga" -ForegroundColor White
Write-Host "3. Abre la consola (F12)" -ForegroundColor White
Write-Host "4. Deberías ver logs con 📦 y 🚀 al inicio" -ForegroundColor White
Write-Host "5. Si NO ves estos logs, hay un problema de carga del módulo" -ForegroundColor White
Write-Host "6. Comparte una captura de la consola completa (sin filtros)" -ForegroundColor White
Write-Host ""
