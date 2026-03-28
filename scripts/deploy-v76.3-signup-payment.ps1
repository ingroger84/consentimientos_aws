# Script de despliegue v76.3.0 - Pago en Registro de Tenants
# Fecha: 2026-03-28
# Descripción: Genera factura y link de pago al crear cuenta tenant (planes con precio > 0)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE V76.3.0 - PAGO EN REGISTRO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$SSH_KEY = "AWS-ISSABEL.pem"
$PROJECT_PATH = "/home/ubuntu/consentimientos_aws"
$BACKEND_DIST = "backend/dist"
$FRONTEND_DIST = "frontend/dist"

Write-Host "1. Verificando archivos compilados..." -ForegroundColor Yellow
if (-not (Test-Path $BACKEND_DIST)) {
    Write-Host "❌ Backend no compilado. Ejecuta: npm run build en backend/" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $FRONTEND_DIST)) {
    Write-Host "❌ Frontend no compilado. Ejecuta: npm run build en frontend/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Archivos compilados encontrados" -ForegroundColor Green

Write-Host ""
Write-Host "2. Copiando backend al servidor..." -ForegroundColor Yellow
scp -i $SSH_KEY -r $BACKEND_DIST "${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/backend/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error copiando backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend copiado" -ForegroundColor Green

Write-Host ""
Write-Host "3. Copiando package.json del backend..." -ForegroundColor Yellow
scp -i $SSH_KEY backend/package.json "${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/backend/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error copiando package.json" -ForegroundColor Red
    exit 1
}
Write-Host "✅ package.json copiado" -ForegroundColor Green

Write-Host ""
Write-Host "4. Reiniciando backend con PM2..." -ForegroundColor Yellow
ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cd ${PROJECT_PATH}/backend && pm2 restart datagree"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error reiniciando backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend reiniciado" -ForegroundColor Green

Write-Host ""
Write-Host "5. Copiando frontend al servidor..." -ForegroundColor Yellow
ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "rm -rf ${PROJECT_PATH}/frontend/dist/*"
scp -i $SSH_KEY -r "${FRONTEND_DIST}/*" "${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/frontend/dist/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error copiando frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend copiado" -ForegroundColor Green

Write-Host ""
Write-Host "6. Recargando Nginx..." -ForegroundColor Yellow
ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "sudo nginx -t && sudo systemctl reload nginx"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error recargando Nginx" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Nginx recargado" -ForegroundColor Green

Write-Host ""
Write-Host "7. Verificando estado del backend..." -ForegroundColor Yellow
ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "pm2 status datagree"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DESPLIEGUE V76.3.0 COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "CAMBIOS IMPLEMENTADOS:" -ForegroundColor Cyan
Write-Host "- Generación automática de primera factura al crear tenant" -ForegroundColor White
Write-Host "- Link de pago Bold generado automáticamente" -ForegroundColor White
Write-Host "- Página intermedia de pago después del registro" -ForegroundColor White
Write-Host "- Solo aplica para planes con precio > 0" -ForegroundColor White
Write-Host "- Plan gratuito mantiene flujo normal sin pago" -ForegroundColor White
Write-Host ""
Write-Host "PRUEBAS RECOMENDADAS:" -ForegroundColor Cyan
Write-Host "1. Crear cuenta con plan gratuito (debe ir directo al login)" -ForegroundColor White
Write-Host "2. Crear cuenta con plan básico (debe mostrar página de pago)" -ForegroundColor White
Write-Host "3. Verificar que el link de Bold funcione correctamente" -ForegroundColor White
Write-Host "4. Verificar redirección después del pago" -ForegroundColor White
Write-Host ""
