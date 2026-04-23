# Script de Despliegue v85.0.0 - Banner de Pre-Aviso de Fecha de Corte
# Fecha: 2026-04-01
# Descripción: Implementa banner que avisa 5 días antes de la fecha de corte

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE v85.0.0" -ForegroundColor Cyan
Write-Host "  Banner Pre-Aviso Fecha de Corte" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$KEY_FILE = "AWS-ISSABEL.pem"
$PROJECT_PATH = "/home/ubuntu/consentimientos_aws"

Write-Host "📋 CAMBIOS EN ESTA VERSION:" -ForegroundColor Yellow
Write-Host "  ✅ Nuevo banner de pre-aviso de fecha de corte" -ForegroundColor Green
Write-Host "  ✅ Se muestra 5 días antes del billing_day" -ForegroundColor Green
Write-Host "  ✅ Informa monto a pagar y fecha de vencimiento" -ForegroundColor Green
Write-Host "  ✅ Ayuda al cliente a prepararse para el pago" -ForegroundColor Green
Write-Host ""

# Verificar que el archivo de clave existe
if (-not (Test-Path $KEY_FILE)) {
    Write-Host "❌ Error: No se encuentra el archivo de clave $KEY_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Paso 1: Compilando frontend..." -ForegroundColor Cyan
Set-Location frontend

# Limpiar caché y node_modules
Write-Host "  🧹 Limpiando caché..." -ForegroundColor Gray
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
}
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Compilar
Write-Host "  🔨 Compilando..." -ForegroundColor Gray
$env:NODE_OPTIONS = "--max-old-space-size=2048"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en la compilación del frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "  ✅ Frontend compilado exitosamente" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "📤 Paso 2: Subiendo archivos al servidor..." -ForegroundColor Cyan

# Crear archivo temporal con timestamp para cache busting
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
Write-Host "  📝 Timestamp para cache busting: $timestamp" -ForegroundColor Gray

# Subir frontend
Write-Host "  📁 Subiendo frontend..." -ForegroundColor Gray
scp -i $KEY_FILE -r frontend/dist/* "${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/frontend/dist/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir frontend" -ForegroundColor Red
    exit 1
}

# Subir nuevo componente
Write-Host "  📁 Subiendo nuevo componente BillingCycleReminderBanner..." -ForegroundColor Gray
scp -i $KEY_FILE frontend/src/components/billing/BillingCycleReminderBanner.tsx "${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/frontend/src/components/billing/"

# Subir componente actualizado
Write-Host "  📁 Subiendo componente actualizado PaymentReminderBanner..." -ForegroundColor Gray
scp -i $KEY_FILE frontend/src/components/billing/PaymentReminderBanner.tsx "${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/frontend/src/components/billing/"

Write-Host "  ✅ Archivos subidos exitosamente" -ForegroundColor Green

Write-Host ""
Write-Host "🔄 Paso 3: Reiniciando servicios..." -ForegroundColor Cyan

ssh -i $KEY_FILE "${SERVER_USER}@${SERVER_IP}" @"
    cd $PROJECT_PATH
    
    # Limpiar caché de Nginx
    echo '  🧹 Limpiando caché de Nginx...'
    sudo rm -rf /var/cache/nginx/*
    
    # Recargar Nginx
    echo '  🔄 Recargando Nginx...'
    sudo nginx -t && sudo systemctl reload nginx
    
    echo '  ✅ Servicios reiniciados'
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al reiniciar servicios" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ DESPLIEGUE COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host ""
Write-Host "📊 RESUMEN:" -ForegroundColor Yellow
Write-Host "  Versión: v85.0.0" -ForegroundColor White
Write-Host "  Fecha: 2026-04-01" -ForegroundColor White
Write-Host "  Servidor: $SERVER_IP" -ForegroundColor White
Write-Host ""
Write-Host "🎯 FUNCIONALIDAD IMPLEMENTADA:" -ForegroundColor Yellow
Write-Host "  ✅ Banner de pre-aviso de fecha de corte" -ForegroundColor Green
Write-Host "  ✅ Se muestra 5 días antes del billing_day" -ForegroundColor Green
Write-Host "  ✅ Informa:" -ForegroundColor Green
Write-Host "     - Fecha de generación de factura" -ForegroundColor Gray
Write-Host "     - Monto a pagar" -ForegroundColor Gray
Write-Host "     - Fecha de vencimiento" -ForegroundColor Gray
Write-Host "     - Mensaje de preparación" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 EJEMPLO DE BANNER:" -ForegroundColor Yellow
Write-Host "  ┌─────────────────────────────────────────────────────────┐" -ForegroundColor Blue
Write-Host "  │ 📅 Próxima Fecha de Corte - 3 días restantes           │" -ForegroundColor Blue
Write-Host "  │                                                         │" -ForegroundColor Blue
Write-Host "  │ Tu factura se generará el 1 de abril de 2026 por un    │" -ForegroundColor Blue
Write-Host "  │ monto de `$89,900. Tendrás hasta el 16 de abril para    │" -ForegroundColor Blue
Write-Host "  │ realizar el pago.                                       │" -ForegroundColor Blue
Write-Host "  │                                                         │" -ForegroundColor Blue
Write-Host "  │ ℹ️ Prepárate para el pago: Asegúrate de tener fondos   │" -ForegroundColor Blue
Write-Host "  │   disponibles para evitar la suspensión de tu cuenta.  │" -ForegroundColor Blue
Write-Host "  └─────────────────────────────────────────────────────────┘" -ForegroundColor Blue
Write-Host ""
Write-Host "🔍 VERIFICACIÓN:" -ForegroundColor Yellow
Write-Host "  1. Accede a cualquier tenant con plan de pago" -ForegroundColor White
Write-Host "  2. Verifica que el banner aparezca 5 días antes del billing_day" -ForegroundColor White
Write-Host "  3. Confirma que muestra la información correcta" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Yellow
Write-Host "  Admin: https://admin.archivoenlinea.com" -ForegroundColor White
Write-Host "  Tenant: https://[tenant].archivoenlinea.com" -ForegroundColor White
Write-Host ""
Write-Host "✨ ¡Despliegue completado! El banner de pre-aviso está activo." -ForegroundColor Green
