# Script para diagnosticar logins personalizados en el servidor remoto

$serverIP = "100.28.198.249"
$keyPath = "AWS-ISSABEL.pem"

Write-Host "🔍 Diagnosticando logins personalizados en servidor remoto..." -ForegroundColor Cyan
Write-Host ""

# Copiar el script de diagnóstico al servidor
Write-Host "📤 Copiando script de diagnóstico al servidor..." -ForegroundColor Yellow
scp -i $keyPath backend/diagnose-login-personalization.js ubuntu@${serverIP}:/home/ubuntu/consentimientos_aws/backend/

# Ejecutar el diagnóstico en el servidor
Write-Host ""
Write-Host "🚀 Ejecutando diagnóstico en el servidor..." -ForegroundColor Yellow
Write-Host ""
ssh -i $keyPath ubuntu@$serverIP "cd /home/ubuntu/consentimientos_aws/backend && node diagnose-login-personalization.js"

Write-Host ""
Write-Host "✅ Diagnóstico completado" -ForegroundColor Green
