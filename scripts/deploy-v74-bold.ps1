# Script de Despliegue v74.0 - Bold API Link de Pagos
# Fecha: 26 de Marzo 2026

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Despliegue v74.0 - Bold API Link de Pagos                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$SERVER = "ubuntu@100.28.198.249"
$BACKEND_ZIP = "backend-dist-v74.0-bold-funcionando.zip"
$REMOTE_PATH = "/home/ubuntu"
$APP_PATH = "/home/ubuntu/consentimientos_aws"

# Paso 1: Verificar que el zip existe
Write-Host "📦 Paso 1: Verificando archivo zip..." -ForegroundColor Yellow
if (!(Test-Path $BACKEND_ZIP)) {
    Write-Host "❌ Error: No se encontró $BACKEND_ZIP" -ForegroundColor Red
    Write-Host "   Ejecuta primero: cd backend && npm run build" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Archivo zip encontrado" -ForegroundColor Green
Write-Host ""

# Paso 2: Copiar zip al servidor
Write-Host "📤 Paso 2: Copiando backend al servidor..." -ForegroundColor Yellow
scp $BACKEND_ZIP ${SERVER}:${REMOTE_PATH}/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al copiar archivo al servidor" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend copiado exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 3: Desplegar en servidor
Write-Host "🚀 Paso 3: Desplegando en servidor..." -ForegroundColor Yellow

$DEPLOY_SCRIPT = @"
#!/bin/bash
set -e

echo "📦 Creando backup de versión anterior..."
if [ -d ${APP_PATH}/backend/dist ]; then
    mv ${APP_PATH}/backend/dist ${APP_PATH}/backend/dist.v73.backup
    echo "✅ Backup creado: dist.v73.backup"
fi

echo "📂 Creando directorio dist..."
mkdir -p ${APP_PATH}/backend/dist

echo "📦 Descomprimiendo backend v74.0..."
unzip -o ${REMOTE_PATH}/${BACKEND_ZIP} -d ${APP_PATH}/backend/dist/

echo "🔧 Actualizando variables de entorno..."
# Actualizar llaves de Bold en .env
sed -i 's/^BOLD_API_KEY=.*/BOLD_API_KEY=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE/' ${APP_PATH}/backend/.env
sed -i 's/^BOLD_SECRET_KEY=.*/BOLD_SECRET_KEY=IKi1koNT7pUK1uTRf4vYOQ/' ${APP_PATH}/backend/.env
sed -i 's|^BOLD_API_URL=.*|BOLD_API_URL=https://integrations.api.bold.co|' ${APP_PATH}/backend/.env

echo "✅ Variables de entorno actualizadas"

echo "🔄 Reiniciando PM2..."
pm2 restart datagree --update-env

echo "⏳ Esperando 5 segundos..."
sleep 5

echo "📋 Verificando logs..."
pm2 logs datagree --lines 30 --nostream

echo ""
echo "✅ Despliegue completado exitosamente"
echo ""
echo "📊 Estado de PM2:"
pm2 status

echo ""
echo "🎉 Backend v74.0 desplegado correctamente"
echo "   URL: https://demo-estetica.archivoenlinea.com"
echo "   API: https://demo-estetica.archivoenlinea.com/api"
"@

# Ejecutar script de despliegue en servidor
$DEPLOY_SCRIPT | ssh $SERVER 'bash -s'

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error durante el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Despliegue Completado Exitosamente                     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Verificar logs: ssh $SERVER 'pm2 logs datagree --lines 50'" -ForegroundColor White
Write-Host "   2. Probar en: https://demo-estetica.archivoenlinea.com" -ForegroundColor White
Write-Host "   3. Crear factura de prueba y probar pago con Bold" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Llaves configuradas:" -ForegroundColor Cyan
Write-Host "   BOLD_API_KEY: g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE" -ForegroundColor White
Write-Host "   BOLD_API_URL: https://integrations.api.bold.co" -ForegroundColor White
Write-Host "   Ambiente: Sandbox (is_sandbox: true)" -ForegroundColor White
Write-Host ""
