# Script de Verificación: Banner de 5 Días
# Versión: 92.3.1
# Fecha: 2026-05-04

Write-Host "🔍 Verificando configuración del banner de 5 días..." -ForegroundColor Cyan
Write-Host ""

# Variables
$serverIP = "100.28.198.249"
$keyFile = "AWS-ISSABEL.pem"
$frontendPath = "/home/ubuntu/consentimientos_aws/frontend"

Write-Host "📡 Conectando al servidor $serverIP..." -ForegroundColor Yellow
Write-Host ""

# Verificar código fuente
Write-Host "1️⃣ Verificando código fuente..." -ForegroundColor Green
$sourceCheck = ssh -i $keyFile ubuntu@$serverIP "grep -n 'daysUntilBilling > ' $frontendPath/src/components/billing/BillingCycleReminderBanner.tsx"
Write-Host "   Resultado: $sourceCheck" -ForegroundColor White

if ($sourceCheck -match "daysUntilBilling > 5") {
    Write-Host "   ✅ Código fuente correcto: Banner configurado para 5 días" -ForegroundColor Green
} else {
    Write-Host "   ❌ ERROR: Código fuente incorrecto" -ForegroundColor Red
}
Write-Host ""

# Verificar versión desplegada
Write-Host "2️⃣ Verificando versión desplegada..." -ForegroundColor Green
$versionCheck = ssh -i $keyFile ubuntu@$serverIP "grep 'app-version' $frontendPath/dist/index.html | head -1"
Write-Host "   Resultado: $versionCheck" -ForegroundColor White

if ($versionCheck -match "92\.[23]\.") {
    Write-Host "   ✅ Versión desplegada correcta" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Versión antigua detectada" -ForegroundColor Yellow
}
Write-Host ""

# Verificar fecha de build
Write-Host "3️⃣ Verificando fecha de build..." -ForegroundColor Green
$buildDate = ssh -i $keyFile ubuntu@$serverIP "ls -lh $frontendPath/dist/index.html | awk '{print \`$6, \`$7, \`$8}'"
Write-Host "   Fecha de build: $buildDate" -ForegroundColor White

$today = Get-Date -Format "MMM d"
if ($buildDate -match "May\s+[1-4]") {
    Write-Host "   ✅ Build reciente (Mayo 2026)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Build antiguo - considerar recompilar" -ForegroundColor Yellow
}
Write-Host ""

# Verificar timestamp
Write-Host "4️⃣ Verificando timestamp del build..." -ForegroundColor Green
$timestamp = ssh -i $keyFile ubuntu@$serverIP "grep 'build-timestamp' $frontendPath/dist/index.html | head -1"
Write-Host "   Resultado: $timestamp" -ForegroundColor White

if ($timestamp -match "content=`"(\d+)`"") {
    $ts = [long]$matches[1]
    $buildDateTime = [DateTimeOffset]::FromUnixTimeMilliseconds($ts).DateTime
    Write-Host "   Fecha/Hora: $buildDateTime" -ForegroundColor White
    Write-Host "   ✅ Timestamp encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ No se pudo extraer timestamp" -ForegroundColor Yellow
}
Write-Host ""

# Verificar que force-reload.html existe
Write-Host "5️⃣ Verificando force-reload.html..." -ForegroundColor Green
$forceReload = ssh -i $keyFile ubuntu@$serverIP "test -f $frontendPath/dist/force-reload.html && echo 'EXISTS' || echo 'NOT_FOUND'"
if ($forceReload -match "EXISTS") {
    Write-Host "   ✅ force-reload.html disponible" -ForegroundColor Green
} else {
    Write-Host "   ❌ force-reload.html NO encontrado" -ForegroundColor Red
}
Write-Host ""

# Resumen
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($sourceCheck -match "daysUntilBilling > 5" -and $versionCheck -match "92\.[23]\." -and $forceReload -match "EXISTS") {
    Write-Host "✅ SISTEMA CORRECTO" -ForegroundColor Green
    Write-Host ""
    Write-Host "El banner está configurado para 5 días." -ForegroundColor White
    Write-Host "Si el usuario no lo ve, debe limpiar el caché del navegador." -ForegroundColor White
    Write-Host ""
    Write-Host "Instrucciones para el usuario:" -ForegroundColor Yellow
    Write-Host "1. Acceder a: https://[tenant].archivoenlinea.com/force-reload.html" -ForegroundColor White
    Write-Host "2. O limpiar caché manualmente (Ctrl + Shift + Delete)" -ForegroundColor White
    Write-Host "3. O probar en modo incógnito (Ctrl + Shift + N)" -ForegroundColor White
} else {
    Write-Host "⚠️ POSIBLES PROBLEMAS DETECTADOS" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Revisar los resultados anteriores para más detalles." -ForegroundColor White
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Documentos de referencia
Write-Host "📄 Documentos de Referencia:" -ForegroundColor Cyan
Write-Host "   • CONFIRMACION_BANNER_5_DIAS_V92.3.1.md" -ForegroundColor White
Write-Host "   • INSTRUCCIONES_LIMPIAR_CACHE_BANNER.md" -ForegroundColor White
Write-Host "   • RESUMEN_BANNER_5_DIAS.md" -ForegroundColor White
Write-Host "   • ANALISIS_BANNERS_NOTIFICACIONES_V92.3.md" -ForegroundColor White
Write-Host ""

Write-Host "✅ Verificación completada" -ForegroundColor Green
