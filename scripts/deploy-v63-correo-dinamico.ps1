# Script de Despliegue V63 - Correo de Soporte Dinámico
# Fecha: 2026-03-20

$ErrorActionPreference = "Stop"

# Configuración
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$SSH_KEY = "AWS-ISSABEL.pem"
$PROJECT_PATH = "/home/ubuntu/consentimientos_aws"
$BACKEND_ZIP = "backend-dist-v63-correo-dinamico.zip"
$FRONTEND_ZIP = "frontend-dist-v63-correo-dinamico.zip"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE V63 - CORREO DINÁMICO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para mostrar pasos
function Write-Step($message) {
    Write-Host "► $message" -ForegroundColor Yellow
}

function Write-Success($message) {
    Write-Host "✓ $message" -ForegroundColor Green
}

function Write-Error($message) {
    Write-Host "✗ $message" -ForegroundColor Red
}

# Paso 1: Verificar archivos locales
Write-Step "Verificando archivos locales..."
if (-not (Test-Path $BACKEND_ZIP)) {
    Write-Error "No se encontró $BACKEND_ZIP"
    exit 1
}
if (-not (Test-Path $FRONTEND_ZIP)) {
    Write-Error "No se encontró $FRONTEND_ZIP"
    exit 1
}
Write-Success "Archivos encontrados"

# Paso 2: Subir archivos al servidor
Write-Step "Subiendo archivos al servidor..."
Write-Host "  - Subiendo backend..." -ForegroundColor Gray
scp -i $SSH_KEY $BACKEND_ZIP "${SERVER_USER}@${SERVER_IP}:/home/ubuntu/"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al subir backend"
    exit 1
}

Write-Host "  - Subiendo frontend..." -ForegroundColor Gray
scp -i $SSH_KEY $FRONTEND_ZIP "${SERVER_USER}@${SERVER_IP}:/home/ubuntu/"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al subir frontend"
    exit 1
}
Write-Success "Archivos subidos correctamente"

# Paso 3: Conectar al servidor y desplegar
Write-Step "Desplegando en el servidor..."

$deployScript = @"
#!/bin/bash
set -e

echo '► Creando backups...'
cd $PROJECT_PATH

# Backup backend
if [ -d backend/dist ]; then
    BACKUP_DIR="backend/dist.backup.\$(date +%Y%m%d_%H%M%S)"
    cp -r backend/dist "\$BACKUP_DIR"
    echo "  ✓ Backup backend: \$BACKUP_DIR"
fi

# Backup frontend
if [ -d frontend/dist ]; then
    BACKUP_DIR="frontend/dist.backup.\$(date +%Y%m%d_%H%M%S)"
    cp -r frontend/dist "\$BACKUP_DIR"
    echo "  ✓ Backup frontend: \$BACKUP_DIR"
fi

echo '► Desplegando backend...'
unzip -o /home/ubuntu/$BACKEND_ZIP -d backend/dist/
echo '  ✓ Backend desplegado'

echo '► Desplegando frontend...'
unzip -o /home/ubuntu/$FRONTEND_ZIP -d frontend/dist/
echo '  ✓ Frontend desplegado'

echo '► Reiniciando PM2...'
pm2 restart all
sleep 3

echo '► Verificando estado...'
pm2 status

echo ''
echo '========================================='
echo '  ✓ DESPLIEGUE COMPLETADO'
echo '========================================='
echo ''
echo 'Logs del backend:'
pm2 logs datagree --lines 10 --nostream
"@

# Ejecutar script en el servidor
$deployScript | ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "bash -s"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Error durante el despliegue"
    exit 1
}

Write-Success "Despliegue completado exitosamente"

# Paso 4: Verificación final
Write-Step "Verificación final..."
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE V63 COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ir a Configuración Avanzada" -ForegroundColor White
Write-Host "2. Buscar el campo 'Email de Soporte'" -ForegroundColor White
Write-Host "3. Ingresar el correo deseado" -ForegroundColor White
Write-Host "4. Guardar cambios" -ForegroundColor White
Write-Host "5. Generar una factura para verificar" -ForegroundColor White
Write-Host ""
Write-Host "URL: https://hotelarchivoenlínea.com" -ForegroundColor Cyan
Write-Host ""
