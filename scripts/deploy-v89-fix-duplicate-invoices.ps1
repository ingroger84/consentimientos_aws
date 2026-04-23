# Script de Despliegue v89 - Correccion Definitiva Facturas Duplicadas
# Fecha: 2026-04-20
# Descripcion: Despliega la solucion definitiva para prevenir facturas duplicadas

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Despliegue v89.0.0" -ForegroundColor Cyan
Write-Host "  Correccion Definitiva Facturas Duplicadas" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "backend/src/billing/billing.service.ts")) {
    Write-Host "Error: Debe ejecutar este script desde la raiz del proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "Paso 1: Compilando backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar backend" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "Backend compilado exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 2: Subiendo archivo actualizado al servidor..." -ForegroundColor Yellow
scp -i $KEY backend/dist/billing/billing.service.js "${SERVER}:${REMOTE_PATH}/backend/dist/billing/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir archivo" -ForegroundColor Red
    exit 1
}
Write-Host "Archivo subido exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 3: Reiniciando proceso PM2..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "cd $REMOTE_PATH; pm2 restart datagree"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al reiniciar PM2" -ForegroundColor Red
    exit 1
}
Write-Host "Proceso PM2 reiniciado exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "Esperando 5 segundos para que el servidor se estabilice..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host ""

Write-Host "Paso 4: Verificando estado del servidor..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "cd $REMOTE_PATH; pm2 status"
Write-Host ""

Write-Host "Paso 5: Verificando facturas duplicadas..." -ForegroundColor Yellow
Set-Location backend
node check-all-duplicate-invoices.js
Set-Location ..
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Despliegue Completado" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resumen de cambios:" -ForegroundColor Yellow
Write-Host "  - Agregado lock de aplicacion (isGeneratingInvoices)" -ForegroundColor White
Write-Host "  - Agregado lock pesimista en BD (pessimistic_write)" -ForegroundColor White
Write-Host "  - Proteccion contra race conditions" -ForegroundColor White
Write-Host "  - Funciona con multiples instancias del servidor" -ForegroundColor White
Write-Host ""
Write-Host "Monitoreo:" -ForegroundColor Yellow
Write-Host "  - Verificar logs del servidor" -ForegroundColor White
Write-Host "  - Verificar duplicados diariamente" -ForegroundColor White
Write-Host ""
Write-Host "Proxima verificacion:" -ForegroundColor Yellow
Write-Host "  - El cron job se ejecuta diariamente a medianoche" -ForegroundColor White
Write-Host "  - Verificar manana que no se generen duplicados" -ForegroundColor White
Write-Host ""
