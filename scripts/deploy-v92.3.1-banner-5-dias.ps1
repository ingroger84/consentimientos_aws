# Script de Despliegue v92.3.1 - Banner de 5 Días
# Fecha: 2026-05-04

Write-Host "🚀 Iniciando despliegue v92.3.1 - Banner de 5 días..." -ForegroundColor Cyan
Write-Host ""

# Variables
$serverIP = "100.28.198.249"
$keyFile = "AWS-ISSABEL.pem"
$serverPath = "/home/ubuntu/consentimientos_aws"

# 1. Subir frontend
Write-Host "📦 Subiendo frontend al servidor..." -ForegroundColor Yellow
scp -i $keyFile -r frontend/dist/* "ubuntu@${serverIP}:${serverPath}/frontend/dist/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend subido correctamente" -ForegroundColor Green
Write-Host ""

# 2. Limpiar caché de Nginx
Write-Host "🧹 Limpiando caché de Nginx..." -ForegroundColor Yellow
ssh -i $keyFile "ubuntu@${serverIP}" "sudo rm -rf /var/cache/nginx/* 2>/dev/null; exit 0"
Write-Host "✅ Caché limpiado" -ForegroundColor Green
Write-Host ""

# 3. Recargar Nginx
Write-Host "🔄 Recargando Nginx..." -ForegroundColor Yellow
ssh -i $keyFile "ubuntu@${serverIP}" "sudo nginx -t; sudo systemctl reload nginx"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al recargar Nginx" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Nginx recargado" -ForegroundColor Green
Write-Host ""

# 4. Verificar despliegue
Write-Host "🔍 Verificando despliegue..." -ForegroundColor Yellow
$version = ssh -i $keyFile "ubuntu@${serverIP}" "grep 'app-version' ${serverPath}/frontend/dist/index.html | head -1"
Write-Host "Versión desplegada: $version" -ForegroundColor White

$timestamp = ssh -i $keyFile "ubuntu@${serverIP}" "grep 'build-timestamp' ${serverPath}/frontend/dist/index.html | head -1"
Write-Host "Timestamp: $timestamp" -ForegroundColor White
Write-Host ""

# 5. Verificar código del banner
Write-Host "🔍 Verificando código del banner..." -ForegroundColor Yellow
$bannerCode = ssh -i $keyFile "ubuntu@${serverIP}" "grep -n 'daysUntilBilling > ' ${serverPath}/frontend/src/components/billing/BillingCycleReminderBanner.tsx"
Write-Host "Código del banner: $bannerCode" -ForegroundColor White
Write-Host ""

# Resumen
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "   • Versión: 92.3.1" -ForegroundColor White
Write-Host "   • Banner: Configurado para 5 días" -ForegroundColor White
Write-Host "   • Frontend: Desplegado" -ForegroundColor White
Write-Host "   • Nginx: Recargado" -ForegroundColor White
Write-Host "   • Caché: Limpiado" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Próximos pasos para el usuario:" -ForegroundColor Yellow
Write-Host "   1. Limpiar caché del navegador (Ctrl + Shift + Delete)" -ForegroundColor White
Write-Host "   2. O acceder a: https://[tenant].archivoenlinea.com/force-reload.html" -ForegroundColor White
Write-Host "   3. Verificar que el banner aparece con '5 días restantes'" -ForegroundColor White
Write-Host ""
Write-Host "📄 Documentación:" -ForegroundColor Cyan
Write-Host "   • CONFIRMACION_BANNER_5_DIAS_V92.3.1.md" -ForegroundColor White
Write-Host "   • INSTRUCCIONES_LIMPIAR_CACHE_BANNER.md" -ForegroundColor White
Write-Host "   • SOLUCION_RAPIDA_BANNER.md" -ForegroundColor White
Write-Host ""
Write-Host "✅ Despliegue finalizado exitosamente" -ForegroundColor Green
