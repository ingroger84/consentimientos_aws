# Script de Despliegue Simple: Corrección DynamiaERP v90
$ErrorActionPreference = "Stop"

$SERVER = "ubuntu@100.28.198.249"
$REMOTE_PATH = "/home/ubuntu/archivo-en-linea"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE v90: Corrección DynamiaERP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar compilación
Write-Host "📦 Paso 1: Verificando compilación..." -ForegroundColor Yellow
if (-not (Test-Path "backend/dist")) {
    Write-Host "❌ No se encontró backend/dist. Ejecuta: npm run build" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend compilado" -ForegroundColor Green
Write-Host ""

# Paso 2: Subir dist
Write-Host "📤 Paso 2: Subiendo dist al servidor..." -ForegroundColor Yellow
scp -r backend/dist "${SERVER}:${REMOTE_PATH}/backend/"
Write-Host "✅ Dist subido" -ForegroundColor Green
Write-Host ""

# Paso 3: Subir scripts
Write-Host "📤 Paso 3: Subiendo scripts..." -ForegroundColor Yellow
scp backend/resend-invoice-to-dynamiaerp.js "${SERVER}:${REMOTE_PATH}/backend/"
scp backend/test-dynamiaerp-correct-endpoint.js "${SERVER}:${REMOTE_PATH}/backend/"
scp backend/diagnose-dynamiaerp-invoice.js "${SERVER}:${REMOTE_PATH}/backend/"
Write-Host "✅ Scripts subidos" -ForegroundColor Green
Write-Host ""

# Paso 4: Actualizar .env
Write-Host "⚙️  Paso 4: Actualizando .env..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH/backend && cp .env .env.backup-v90 && sed -i 's|DYNAMIAERP_BASE_URL=.*|DYNAMIAERP_BASE_URL=api.pos.dynamiaerp.co|g' .env && grep 'DYNAMIAERP_' .env"
Write-Host "✅ .env actualizado" -ForegroundColor Green
Write-Host ""

# Paso 5: Reiniciar backend
Write-Host "🔄 Paso 5: Reiniciando backend..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && pm2 restart backend && sleep 3 && pm2 logs backend --lines 20 --nostream"
Write-Host "✅ Backend reiniciado" -ForegroundColor Green
Write-Host ""

# Paso 6: Probar conexión
Write-Host "🧪 Paso 6: Probando conexión..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && node backend/test-dynamiaerp-correct-endpoint.js"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Para reenviar la factura de Aquiub:" -ForegroundColor Yellow
Write-Host "   ssh $SERVER" -ForegroundColor Gray
Write-Host "   cd $REMOTE_PATH" -ForegroundColor Gray
Write-Host "   node backend/resend-invoice-to-dynamiaerp.js INV-202604-3740" -ForegroundColor Gray
Write-Host ""
