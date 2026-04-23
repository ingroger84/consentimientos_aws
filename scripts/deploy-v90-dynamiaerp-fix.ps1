# Script de Despliegue: Corrección Integración DynamiaERP
# Versión: v90
# Fecha: 20 de Abril de 2026

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE v90: Corrección DynamiaERP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER = "ubuntu@100.28.198.249"
$REMOTE_PATH = "/home/ubuntu/archivo-en-linea"
$LOCAL_BACKEND = "backend"

# Paso 1: Compilar Backend
Write-Host "📦 Paso 1: Compilando backend..." -ForegroundColor Yellow
Write-Host ""

Set-Location $LOCAL_BACKEND
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar backend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend compilado exitosamente" -ForegroundColor Green
Write-Host ""

Set-Location ..

# Paso 2: Verificar archivos compilados
Write-Host "🔍 Paso 2: Verificando archivos compilados..." -ForegroundColor Yellow
Write-Host ""

$distPath = Join-Path $LOCAL_BACKEND "dist"
if (-not (Test-Path $distPath)) {
    Write-Host "❌ No se encontró la carpeta dist" -ForegroundColor Red
    exit 1
}

$dynamiaerpService = Join-Path $distPath "dynamiaerp/dynamiaerp.service.js"
if (-not (Test-Path $dynamiaerpService)) {
    Write-Host "❌ No se encontró dynamiaerp.service.js compilado" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivos compilados verificados" -ForegroundColor Green
Write-Host ""

# Paso 3: Subir dist al servidor
Write-Host "📤 Paso 3: Subiendo dist al servidor..." -ForegroundColor Yellow
Write-Host ""

scp -r "$LOCAL_BACKEND/dist" "${SERVER}:${REMOTE_PATH}/backend/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir dist" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dist subido exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 4: Subir scripts actualizados
Write-Host "📤 Paso 4: Subiendo scripts actualizados..." -ForegroundColor Yellow
Write-Host ""

scp "$LOCAL_BACKEND/resend-invoice-to-dynamiaerp.js" "${SERVER}:${REMOTE_PATH}/backend/"
scp "$LOCAL_BACKEND/test-dynamiaerp-correct-endpoint.js" "${SERVER}:${REMOTE_PATH}/backend/"
scp "$LOCAL_BACKEND/diagnose-dynamiaerp-invoice.js" "${SERVER}:${REMOTE_PATH}/backend/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir scripts" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Scripts subidos exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 5: Actualizar .env en servidor
Write-Host "⚙️  Paso 5: Actualizando .env en servidor..." -ForegroundColor Yellow
Write-Host ""

$envCommands = @"
cd $REMOTE_PATH/backend
# Backup del .env actual
cp .env .env.backup-v90

# Actualizar variables de DynamiaERP
sed -i 's|DYNAMIAERP_BASE_URL=.*|DYNAMIAERP_BASE_URL=api.pos.dynamiaerp.co|g' .env

# Verificar que las otras variables existan
grep -q 'DYNAMIAERP_TOKEN=' .env || echo 'DYNAMIAERP_TOKEN=tk60188bfb066427ba846544a563212d9f70e1acb8a4d52fa22b3cacf2018f90e6' >> .env
grep -q 'DYNAMIAERP_LLAVE_TECNICA=' .env || echo 'DYNAMIAERP_LLAVE_TECNICA=b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca' >> .env
grep -q 'DYNAMIAERP_SUCURSAL=' .env || echo 'DYNAMIAERP_SUCURSAL=PRINCIPAL' >> .env

# Mostrar configuración actualizada
echo ""
echo "Configuración DynamiaERP actualizada:"
grep 'DYNAMIAERP_' .env
"@

ssh $SERVER $envCommands

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al actualizar .env" -ForegroundColor Red
    exit 1
}

Write-Host "✅ .env actualizado exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 6: Reiniciar Backend
Write-Host "🔄 Paso 6: Reiniciando backend..." -ForegroundColor Yellow
Write-Host ""

$restartCommands = @"
cd $REMOTE_PATH
pm2 restart backend
sleep 3
pm2 logs backend --lines 20 --nostream
"@

ssh $SERVER $restartCommands

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al reiniciar backend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend reiniciado exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 7: Probar conexión con DynamiaERP
Write-Host "🧪 Paso 7: Probando conexión con DynamiaERP..." -ForegroundColor Yellow
Write-Host ""

$testCommands = @"
cd $REMOTE_PATH
node backend/test-dynamiaerp-correct-endpoint.js
"@

ssh $SERVER $testCommands

Write-Host ""

# Paso 8: Instrucciones finales
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Reenviar factura de Aquiub:" -ForegroundColor White
Write-Host "   ssh $SERVER" -ForegroundColor Gray
Write-Host "   cd $REMOTE_PATH" -ForegroundColor Gray
Write-Host "   node backend/resend-invoice-to-dynamiaerp.js INV-202604-3740" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Verificar CUFE generado:" -ForegroundColor White
Write-Host "   node backend/diagnose-dynamiaerp-invoice.js" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Monitorear logs:" -ForegroundColor White
Write-Host "   pm2 logs backend --lines 100" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Verificar próximas facturas:" -ForegroundColor White
Write-Host "   - Esperar a que un cliente pague una factura" -ForegroundColor Gray
Write-Host "   - Verificar que se genera CUFE automáticamente" -ForegroundColor Gray
Write-Host "   - Revisar logs de PM2" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Preguntar si desea reenviar la factura ahora
$reenviar = Read-Host "¿Deseas reenviar la factura INV-202604-3740 ahora? (s/n)"

if ($reenviar -eq "s" -or $reenviar -eq "S") {
    Write-Host ""
    Write-Host "📤 Reenviando factura INV-202604-3740..." -ForegroundColor Yellow
    Write-Host ""
    
    $resendCommands = @"
cd $REMOTE_PATH
node backend/resend-invoice-to-dynamiaerp.js INV-202604-3740
"@
    
    ssh $SERVER $resendCommands
    
    Write-Host ""
    Write-Host "✅ Proceso completado" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⏭️  Puedes reenviar la factura manualmente más tarde" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "🎉 ¡Despliegue v90 completado exitosamente!" -ForegroundColor Green
Write-Host ""
