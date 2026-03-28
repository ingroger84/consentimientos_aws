# ========================================
# SCRIPT DE DESPLIEGUE AUTOMATICO v74.0
# Bold API Link de Pagos
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " DESPLIEGUE AUTOMATICO v74.0" -ForegroundColor Cyan
Write-Host " Bold API Link de Pagos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuracion
$SSH_KEY = "AWS-ISSABEL.pem"
$SERVER = "ubuntu@100.28.198.249"
$ZIP_FILE = "backend-dist-v74.0-bold-funcionando.zip"

# Verificar llave SSH
if (!(Test-Path $SSH_KEY)) {
    Write-Host "ERROR: No se encontro la llave SSH: $SSH_KEY" -ForegroundColor Red
    exit 1
}

# Verificar ZIP
if (!(Test-Path $ZIP_FILE)) {
    Write-Host "ERROR: No se encontro el archivo: $ZIP_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "OK: Archivos encontrados" -ForegroundColor Green
Write-Host ""

# Paso 1: Copiar ZIP al servidor
Write-Host "Paso 1: Copiando backend al servidor..." -ForegroundColor Yellow
scp -i $SSH_KEY $ZIP_FILE ${SERVER}:/home/ubuntu/
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo copiar el archivo" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Archivo copiado" -ForegroundColor Green
Write-Host ""

# Paso 2: Ejecutar despliegue en servidor
Write-Host "Paso 2: Desplegando en servidor..." -ForegroundColor Yellow

ssh -i $SSH_KEY $SERVER @'
#!/bin/bash
set -e

echo "==================================="
echo " DESPLEGANDO v74.0"
echo "==================================="
echo ""

# Backup
echo "1. Creando backup..."
cd /home/ubuntu/consentimientos_aws/backend
if [ -d dist ]; then
    timestamp=$(date +%Y%m%d_%H%M%S)
    mv dist dist.backup_$timestamp
    echo "   Backup creado: dist.backup_$timestamp"
fi

# Crear directorio
echo "2. Creando directorio dist..."
mkdir -p dist

# Descomprimir
echo "3. Descomprimiendo backend v74.0..."
cd /home/ubuntu
unzip -q -o backend-dist-v74.0-bold-funcionando.zip -d /home/ubuntu/consentimientos_aws/backend/dist/
echo "   Archivos descomprimidos"

# Actualizar .env
echo "4. Actualizando variables de entorno..."
cd /home/ubuntu/consentimientos_aws/backend

# Backup del .env actual
cp .env .env.backup_$(date +%Y%m%d_%H%M%S)

# Actualizar llaves de Bold
sed -i 's/^BOLD_API_KEY=.*/BOLD_API_KEY=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE/' .env
sed -i 's/^BOLD_SECRET_KEY=.*/BOLD_SECRET_KEY=IKi1koNT7pUK1uTRf4vYOQ/' .env
sed -i 's|^BOLD_API_URL=.*|BOLD_API_URL=https://integrations.api.bold.co|' .env

echo "   Variables actualizadas:"
echo "   - BOLD_API_KEY: g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE"
echo "   - BOLD_SECRET_KEY: IKi1koNT7pUK1uTRf4vYOQ"
echo "   - BOLD_API_URL: https://integrations.api.bold.co"

# Reiniciar PM2
echo "5. Reiniciando PM2..."
pm2 restart datagree --update-env

# Esperar
echo "6. Esperando 5 segundos..."
sleep 5

# Verificar
echo "7. Verificando estado..."
pm2 status

echo ""
echo "==================================="
echo " DESPLIEGUE COMPLETADO"
echo "==================================="
echo ""

# Mostrar logs
echo "Ultimos logs:"
pm2 logs datagree --lines 30 --nostream

'@

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " DESPLIEGUE EXITOSO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Aplicacion desplegada en:" -ForegroundColor Cyan
Write-Host "  https://demo-estetica.archivoenlinea.com" -ForegroundColor White
Write-Host ""
Write-Host "Para ver logs en tiempo real:" -ForegroundColor Cyan
Write-Host "  ssh -i $SSH_KEY $SERVER 'pm2 logs datagree'" -ForegroundColor White
Write-Host ""
Write-Host "Para verificar estado:" -ForegroundColor Cyan
Write-Host "  ssh -i $SSH_KEY $SERVER 'pm2 status'" -ForegroundColor White
Write-Host ""
