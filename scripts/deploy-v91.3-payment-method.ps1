# Script de despliegue v91.3 - Captura de metodo de pago real de Bold
# Fecha: 2026-04-21
# Cambios: Mapear metodo de pago de Bold a codigos DynamiaERP

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE BACKEND v91.3" -ForegroundColor Cyan
Write-Host "Captura de metodo de pago real de Bold" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuracion
$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "AWS-ISSABEL.pem"
$BACKEND_PATH = "/home/ubuntu/consentimientos_aws/backend"
$TARBALL = "backend-v91.3-dist.tar.gz"

Write-Host "Verificando tarball..." -ForegroundColor Yellow
if (-not (Test-Path $TARBALL)) {
    Write-Host "Error: No se encontro $TARBALL" -ForegroundColor Red
    exit 1
}

Write-Host "Tarball encontrado: $TARBALL" -ForegroundColor Green
Write-Host ""

Write-Host "Subiendo tarball al servidor..." -ForegroundColor Yellow
scp -i $KEY $TARBALL "${USER}@${SERVER}:${BACKEND_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir tarball" -ForegroundColor Red
    exit 1
}

Write-Host "Tarball subido exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "Desplegando en el servidor..." -ForegroundColor Yellow
Write-Host ""

$deployScript = @'
set -e

echo 'Navegando al directorio del backend...'
cd /home/ubuntu/consentimientos_aws/backend

echo 'Creando backup del dist actual...'
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
if [ -d dist ]; then
    mv dist dist.backup.v91.2_$TIMESTAMP
    echo "Backup creado: dist.backup.v91.2_$TIMESTAMP"
fi

echo 'Extrayendo nuevo dist...'
tar -xzf backend-v91.3-dist.tar.gz

echo 'Verificando archivos...'
ls -lh dist/

echo 'Reiniciando PM2...'
pm2 restart datagree

echo 'Esperando 5 segundos...'
sleep 5

echo 'Estado de PM2:'
pm2 status

echo 'Ultimos logs:'
pm2 logs datagree --lines 30 --nostream

echo ''
echo 'Despliegue completado exitosamente'
echo ''
echo 'CAMBIOS EN v91.3:'
echo '   - Captura del metodo de pago real de Bold'
echo '   - Mapeo de metodos de pago a codigos DynamiaERP:'
echo '     PSE -> PS'
echo '     Tarjeta -> TC'
echo '     Transferencia -> TR'
echo '     Default -> EF (Efectivo)'
echo '   - Actualizado script resend-aquiub-invoice.js'
echo ''
'@

ssh -i $KEY "${USER}@${SERVER}" $deployScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error durante el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resumen de cambios:" -ForegroundColor Cyan
Write-Host "   Metodo de pago capturado de Bold" -ForegroundColor White
Write-Host "   Mapeo a codigos DynamiaERP implementado" -ForegroundColor White
Write-Host "   PSE -> PS" -ForegroundColor White
Write-Host "   Tarjeta -> TC" -ForegroundColor White
Write-Host "   Transferencia -> TR" -ForegroundColor White
Write-Host "   Default -> EF" -ForegroundColor White
Write-Host ""
