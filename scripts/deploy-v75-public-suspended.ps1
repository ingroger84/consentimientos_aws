# Script de despliegue V75.0 - Sistema de pago publico para cuentas suspendidas
# Fecha: 2026-03-27
# Descripcion: Implementa flujo de pago sin autenticacion para tenants suspendidos

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE V75.0 - PAGO PUBLICO SUSPENDIDOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuracion
$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$BACKEND_PATH = "/home/ubuntu/consentimientos_aws/backend"
$FRONTEND_PATH = "/home/ubuntu/consentimientos_aws/frontend"

Write-Host "Archivos a desplegar:" -ForegroundColor Yellow
Write-Host "  Backend:" -ForegroundColor White
Write-Host "    - auth/auth.service.js" -ForegroundColor Gray
Write-Host "    - invoices/invoices.controller.js" -ForegroundColor Gray
Write-Host "    - invoices/invoices.service.js" -ForegroundColor Gray
Write-Host "    - tenants/tenants.service.js" -ForegroundColor Gray
Write-Host "  Frontend:" -ForegroundColor White
Write-Host "    - Completo con nueva pagina publica" -ForegroundColor Gray
Write-Host ""

# Confirmar
$confirm = Read-Host "Continuar con el despliegue? (s/n)"
if ($confirm -ne "s") {
    Write-Host "Despliegue cancelado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Iniciando despliegue..." -ForegroundColor Green
Write-Host ""

# 1. Desplegar Backend
Write-Host "[1/4] Desplegando archivos del backend..." -ForegroundColor Cyan

$backendFiles = @(
    "backend/dist/auth/auth.service.js",
    "backend/dist/invoices/invoices.controller.js",
    "backend/dist/invoices/invoices.service.js",
    "backend/dist/tenants/tenants.service.js"
)

foreach ($file in $backendFiles) {
    $remotePath = $file -replace "backend/dist/", "$BACKEND_PATH/dist/"
    $remoteDir = Split-Path -Parent $remotePath
    
    Write-Host "  Copiando: $file" -ForegroundColor Gray
    
    # Crear directorio si no existe
    ssh -i $KEY $SERVER "mkdir -p $remoteDir" 2>$null
    
    # Copiar archivo
    scp -i $KEY $file "${SERVER}:${remotePath}"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error al copiar $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Backend desplegado correctamente" -ForegroundColor Green
Write-Host ""

# 2. Desplegar Frontend completo
Write-Host "[2/4] Desplegando frontend completo..." -ForegroundColor Cyan

# Crear backup del frontend actual
Write-Host "  Creando backup del frontend actual..." -ForegroundColor Gray
ssh -i $KEY $SERVER "cd $FRONTEND_PATH && [ -d dist ] && cp -r dist dist.backup.`$(date +%Y%m%d_%H%M%S) || true"

# Limpiar dist anterior
Write-Host "  Limpiando dist anterior..." -ForegroundColor Gray
ssh -i $KEY $SERVER "rm -rf $FRONTEND_PATH/dist/*"

# Copiar nuevo dist
Write-Host "  Copiando archivos..." -ForegroundColor Gray
scp -i $KEY -r frontend/dist/* "${SERVER}:${FRONTEND_PATH}/dist/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al copiar frontend" -ForegroundColor Red
    exit 1
}

Write-Host "Frontend desplegado correctamente" -ForegroundColor Green
Write-Host ""

# 3. Reiniciar PM2
Write-Host "[3/4] Reiniciando PM2..." -ForegroundColor Cyan
ssh -i $KEY $SERVER "pm2 restart datagree"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al reiniciar PM2" -ForegroundColor Red
    exit 1
}

Write-Host "PM2 reiniciado correctamente" -ForegroundColor Green
Write-Host ""

# 4. Verificar estado
Write-Host "[4/4] Verificando estado del servidor..." -ForegroundColor Cyan
ssh -i $KEY $SERVER "pm2 status datagree"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DESPLIEGUE V75.0 COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "INSTRUCCIONES DE PRUEBA:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Acceder a: https://demo-medico.archivoenlinea.com/login" -ForegroundColor White
Write-Host "2. Intentar login con: proyectos@innovasystems.com.co" -ForegroundColor White
Write-Host "3. Debe redirigir automaticamente a: /public-suspended" -ForegroundColor White
Write-Host "4. Verificar que muestra:" -ForegroundColor White
Write-Host "   - Mensaje de cuenta suspendida" -ForegroundColor Gray
Write-Host "   - Lista de facturas pendientes" -ForegroundColor Gray
Write-Host "   - Boton Pagar Ahora para cada factura" -ForegroundColor Gray
Write-Host "5. Hacer clic en Pagar Ahora" -ForegroundColor White
Write-Host "6. Debe redirigir a Bold checkout" -ForegroundColor White
Write-Host "7. Completar pago de prueba" -ForegroundColor White
Write-Host "8. Webhook debe reactivar cuenta automaticamente" -ForegroundColor White
Write-Host "9. Intentar login nuevamente - debe funcionar" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "  Login: https://demo-medico.archivoenlinea.com/login" -ForegroundColor Gray
Write-Host "  Suspendido: https://demo-medico.archivoenlinea.com/public-suspended" -ForegroundColor Gray
Write-Host ""
