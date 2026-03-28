# Script de Despliegue: Backend v60 - Fix Plantillas Personalizadas
# Fecha: 17 de marzo de 2026
# Descripción: Despliega backend v60 con corrección de uso de plantillas personalizadas

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE BACKEND V60" -ForegroundColor Cyan
Write-Host "Fix: Plantillas Personalizadas en PDFs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$SERVER_PATH = "/home/ubuntu/consentimientos_aws/backend"
$LOCAL_DIST = "backend/dist"
$BACKUP_NAME = "dist-backup-v59-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Verificar que existe el directorio dist local
if (-not (Test-Path $LOCAL_DIST)) {
    Write-Host "❌ Error: No existe el directorio $LOCAL_DIST" -ForegroundColor Red
    Write-Host "   Ejecuta 'npm run build' en el directorio backend primero" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Directorio dist local encontrado" -ForegroundColor Green
Write-Host ""

# Paso 1: Compilar backend
Write-Host "=== PASO 1: Compilando Backend ===" -ForegroundColor Yellow
Write-Host ""

Push-Location backend
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar el backend" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "✓ Backend compilado exitosamente" -ForegroundColor Green
Pop-Location
Write-Host ""

# Paso 2: Crear archivo comprimido
Write-Host "=== PASO 2: Creando Archivo Comprimido ===" -ForegroundColor Yellow
Write-Host ""

$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$ZIP_NAME = "backend-dist-v60-templates-fix-$TIMESTAMP.zip"

if (Test-Path $ZIP_NAME) {
    Remove-Item $ZIP_NAME -Force
}

# Verificar que existe el directorio dist
if (-not (Test-Path "backend/dist")) {
    Write-Host "❌ Error: No existe el directorio backend/dist" -ForegroundColor Red
    exit 1
}

Compress-Archive -Path "backend/dist/*" -DestinationPath $ZIP_NAME

Write-Host "✓ Archivo creado: $ZIP_NAME" -ForegroundColor Green
Write-Host ""

# Paso 3: Subir al servidor
Write-Host "=== PASO 3: Subiendo al Servidor ===" -ForegroundColor Yellow
Write-Host ""

Write-Host "Subiendo $ZIP_NAME al servidor..." -ForegroundColor Cyan
scp -i "AWS-ISSABEL.pem" $ZIP_NAME "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir el archivo" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Archivo subido exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 4: Desplegar en el servidor
Write-Host "=== PASO 4: Desplegando en el Servidor ===" -ForegroundColor Yellow
Write-Host ""

$DEPLOY_SCRIPT = @"
#!/bin/bash
set -e

echo "=== Desplegando Backend v60 ==="
echo ""

cd $SERVER_PATH

# Detener PM2
echo "Deteniendo PM2..."
pm2 stop datagree || true

# Hacer backup del dist actual
echo "Creando backup..."
if [ -d "dist" ]; then
    mv dist $BACKUP_NAME
    echo "✓ Backup creado: $BACKUP_NAME"
fi

# Descomprimir nuevo dist
echo "Descomprimiendo nuevo código..."
unzip -q $ZIP_NAME -d dist

# Verificar que se descomprimió correctamente
if [ ! -f "dist/main.js" ]; then
    echo "❌ Error: No se encontró dist/main.js"
    echo "Restaurando backup..."
    rm -rf dist
    mv $BACKUP_NAME dist
    exit 1
fi

echo "✓ Código descomprimido correctamente"

# Reiniciar PM2
echo "Reiniciando PM2..."
pm2 start dist/main.js --name datagree

# Esperar 5 segundos
sleep 5

# Verificar estado
echo ""
echo "=== Estado de PM2 ==="
pm2 status

echo ""
echo "=== Logs Recientes ==="
pm2 logs datagree --lines 30 --nostream

echo ""
echo "✓ Despliegue completado"
echo ""
echo "Verificar en: https://archivoenlinea.com/api/health"
"@

# Guardar script temporalmente
$TEMP_SCRIPT = "deploy-temp-$TIMESTAMP.sh"
$DEPLOY_SCRIPT | Out-File -FilePath $TEMP_SCRIPT -Encoding ASCII

# Subir script
scp -i "AWS-ISSABEL.pem" $TEMP_SCRIPT "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/deploy.sh"

# Ejecutar script
ssh -i "AWS-ISSABEL.pem" "${SERVER_USER}@${SERVER_IP}" "chmod +x ${SERVER_PATH}/deploy.sh && ${SERVER_PATH}/deploy.sh"

# Limpiar script temporal
Remove-Item $TEMP_SCRIPT -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Paso 5: Verificación
Write-Host "=== VERIFICACIÓN ===" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Verificar API Health:" -ForegroundColor Cyan
Write-Host "   https://archivoenlinea.com/api/health" -ForegroundColor White
Write-Host ""

Write-Host "2. Verificar logs en tiempo real:" -ForegroundColor Cyan
Write-Host "   ssh -i AWS-ISSABEL.pem ubuntu@$SERVER_IP" -ForegroundColor White
Write-Host "   pm2 logs datagree" -ForegroundColor White
Write-Host ""

Write-Host "3. Probar con hotelglampinglapolka:" -ForegroundColor Cyan
Write-Host "   - Crear un nuevo consentimiento" -ForegroundColor White
Write-Host "   - Firmarlo" -ForegroundColor White
Write-Host "   - Descargar PDF" -ForegroundColor White
Write-Host "   - Verificar que contiene: 'Consentimiento Informado para Cabalgatas y/o Buggys'" -ForegroundColor White
Write-Host ""

Write-Host "4. Verificar logs de plantillas:" -ForegroundColor Cyan
Write-Host "   pm2 logs datagree | grep 'PDF Service'" -ForegroundColor White
Write-Host ""

Write-Host "Debe mostrar:" -ForegroundColor Yellow
Write-Host "   [PDF Service] Obteniendo plantillas para tenant: hotelglampinglapolka" -ForegroundColor Gray
Write-Host "   [PDF Service] Plantilla procedure encontrada: [nombre]" -ForegroundColor Gray
Write-Host "   [PDF Service] Usando plantilla: [nombre]" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Archivo ZIP guardado: $ZIP_NAME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
