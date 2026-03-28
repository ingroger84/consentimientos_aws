# Script de Despliegue v74.0 - Bold API Link de Pagos
# Fecha: 26 de Marzo 2026

Write-Host "Despliegue v74.0 - Bold API Link de Pagos" -ForegroundColor Cyan
Write-Host ""

$SERVER = "ubuntu@100.28.198.249"
$BACKEND_ZIP = "backend-dist-v74.0-bold-funcionando.zip"

# Paso 1: Verificar zip
Write-Host "Paso 1: Verificando archivo zip..." -ForegroundColor Yellow
if (!(Test-Path $BACKEND_ZIP)) {
    Write-Host "Error: No se encontro $BACKEND_ZIP" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Archivo zip encontrado" -ForegroundColor Green
Write-Host ""

# Paso 2: Copiar al servidor
Write-Host "Paso 2: Copiando backend al servidor..." -ForegroundColor Yellow
scp $BACKEND_ZIP ${SERVER}:/home/ubuntu/
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al copiar archivo" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Backend copiado" -ForegroundColor Green
Write-Host ""

# Paso 3: Desplegar
Write-Host "Paso 3: Desplegando en servidor..." -ForegroundColor Yellow

ssh $SERVER @'
#!/bin/bash
set -e

echo "Creando backup..."
if [ -d /home/ubuntu/consentimientos_aws/backend/dist ]; then
    mv /home/ubuntu/consentimientos_aws/backend/dist /home/ubuntu/consentimientos_aws/backend/dist.v73.backup
fi

echo "Creando directorio dist..."
mkdir -p /home/ubuntu/consentimientos_aws/backend/dist

echo "Descomprimiendo backend v74.0..."
unzip -o /home/ubuntu/backend-dist-v74.0-bold-funcionando.zip -d /home/ubuntu/consentimientos_aws/backend/dist/

echo "Actualizando variables de entorno..."
sed -i 's/^BOLD_API_KEY=.*/BOLD_API_KEY=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE/' /home/ubuntu/consentimientos_aws/backend/.env
sed -i 's/^BOLD_SECRET_KEY=.*/BOLD_SECRET_KEY=IKi1koNT7pUK1uTRf4vYOQ/' /home/ubuntu/consentimientos_aws/backend/.env
sed -i 's|^BOLD_API_URL=.*|BOLD_API_URL=https://integrations.api.bold.co|' /home/ubuntu/consentimientos_aws/backend/.env

echo "Reiniciando PM2..."
pm2 restart datagree --update-env

echo "Esperando 5 segundos..."
sleep 5

echo "Verificando logs..."
pm2 logs datagree --lines 30 --nostream

echo ""
echo "Despliegue completado"
pm2 status
'@

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error durante el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Despliegue Completado Exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Verificar logs: ssh $SERVER 'pm2 logs datagree --lines 50'" -ForegroundColor White
Write-Host "   2. Probar en: https://demo-estetica.archivoenlinea.com" -ForegroundColor White
Write-Host "   3. Crear factura de prueba y probar pago con Bold" -ForegroundColor White
Write-Host ""
