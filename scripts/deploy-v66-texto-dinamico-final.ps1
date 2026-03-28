# Script de despliegue V66 - Corrección final texto dinámico CN
# Fecha: 2026-03-20
# Descripción: Corrige el problema de sobreposición de texto en PDFs de CN
#              moviendo la verificación de espacio DENTRO del loop de líneas

$ErrorActionPreference = "Stop"

Write-Host "=== DESPLIEGUE V66 - TEXTO DINAMICO CN FINAL ===" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$KEY_FILE = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"
$LOCAL_ZIP = "backend-dist-v66-texto-dinamico-final.zip"

Write-Host "Verificando archivo local..." -ForegroundColor Yellow
if (-not (Test-Path $LOCAL_ZIP)) {
    Write-Host "ERROR: No se encuentra el archivo $LOCAL_ZIP" -ForegroundColor Red
    exit 1
}

Write-Host "Archivo encontrado: $LOCAL_ZIP" -ForegroundColor Green
$fileSize = (Get-Item $LOCAL_ZIP).Length / 1MB
Write-Host "Tamaño: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
Write-Host ""

# Subir archivo
Write-Host "Subiendo archivo al servidor..." -ForegroundColor Yellow
scp -i $KEY_FILE $LOCAL_ZIP "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo al subir el archivo" -ForegroundColor Red
    exit 1
}

Write-Host "Archivo subido exitosamente" -ForegroundColor Green
Write-Host ""

# Ejecutar despliegue en servidor
Write-Host "Ejecutando despliegue en servidor..." -ForegroundColor Yellow
Write-Host ""

$deployScript = @"
cd $REMOTE_PATH

echo '=== Backup del dist actual ==='
if [ -d dist ]; then
    timestamp=\$(date +%Y%m%d_%H%M%S)
    mv dist dist_backup_\$timestamp
    echo 'Backup creado: dist_backup_'\$timestamp
fi

echo ''
echo '=== Descomprimiendo nueva versión ==='
unzip -q -o $LOCAL_ZIP -d dist
echo 'Archivos descomprimidos'

echo ''
echo '=== Verificando archivos ==='
ls -lh dist/ | head -10

echo ''
echo '=== Reiniciando PM2 ==='
pm2 restart consentimientos-backend
pm2 save

echo ''
echo '=== Estado de PM2 ==='
pm2 status

echo ''
echo '=== Últimas líneas del log ==='
pm2 logs consentimientos-backend --lines 20 --nostream

echo ''
echo '=== DESPLIEGUE COMPLETADO ==='
"@

ssh -i $KEY_FILE "${SERVER_USER}@${SERVER_IP}" $deployScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo al ejecutar el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== DESPLIEGUE V66 COMPLETADO EXITOSAMENTE ===" -ForegroundColor Green
Write-Host ""
Write-Host "CAMBIOS IMPLEMENTADOS:" -ForegroundColor Cyan
Write-Host "- Verificación de espacio ANTES de cada línea en addDataTreatmentSection" -ForegroundColor White
Write-Host "- Verificación de espacio ANTES de cada línea en addImageRightsSection" -ForegroundColor White
Write-Host "- Verificación de espacio antes de información del cliente" -ForegroundColor White
Write-Host "- Uso de currentPage para mantener referencia correcta a la página actual" -ForegroundColor White
Write-Host ""
Write-Host "PRUEBAS RECOMENDADAS:" -ForegroundColor Cyan
Write-Host "1. Generar un CN con preguntas largas (como 'zxczxc', 'asuastr')" -ForegroundColor White
Write-Host "2. Verificar que el texto NO se sobreponga" -ForegroundColor White
Write-Host "3. Verificar que las páginas se creen automáticamente cuando sea necesario" -ForegroundColor White
Write-Host "4. Verificar que la firma y foto permanezcan en página 1 si hay espacio" -ForegroundColor White
Write-Host ""
