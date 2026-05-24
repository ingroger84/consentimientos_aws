# Script para desplegar la página de forzado de recarga de logins

$serverIP = "100.28.198.249"
$keyPath = "AWS-ISSABEL.pem"

Write-Host "🚀 Desplegando página de forzado de recarga..." -ForegroundColor Cyan
Write-Host ""

# Copiar el archivo HTML al servidor
Write-Host "📤 Copiando force-reload-logins.html al servidor..." -ForegroundColor Yellow
scp -i $keyPath frontend/public/force-reload-logins.html ubuntu@${serverIP}:/home/ubuntu/consentimientos_aws/frontend/dist/

Write-Host ""
Write-Host "✅ Archivo desplegado exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URL de acceso:" -ForegroundColor Cyan
Write-Host "   https://archivoenlinea.com/force-reload-logins.html" -ForegroundColor White
Write-Host ""
Write-Host "💡 Instrucciones para el usuario:" -ForegroundColor Yellow
Write-Host "   1. Acceder a la URL de arriba" -ForegroundColor White
Write-Host "   2. Hacer clic en 'Limpiar Caché y Recargar'" -ForegroundColor White
Write-Host "   3. Acceder a los subdominios" -ForegroundColor White
Write-Host ""
