# Script de despliegue para v87 - Integración DynamiaERP
# Fecha: 18 de abril de 2026

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE v87 - INTEGRACIÓN DYNAMIAERP" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$KEY_FILE = "AWS-ISSABEL.pem"
$PROJECT_PATH = "/home/ubuntu/consentimientos_aws"
$DB_HOST = "db.witvuzaarlqxkiqfiljq.supabase.co"
$DB_USER = "postgres"
$DB_NAME = "postgres"
$DB_PASSWORD = "%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD"

Write-Host "📋 PASO 1: Compilar backend localmente" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

Set-Location backend

Write-Host "🔨 Compilando backend..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar backend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend compilado exitosamente" -ForegroundColor Green
Write-Host ""

Set-Location ..

Write-Host "📦 PASO 2: Comprimir backend compilado" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipFile = "backend-v87-$timestamp.zip"

Write-Host "📦 Creando archivo: $zipFile" -ForegroundColor Cyan
Compress-Archive -Path backend/dist -DestinationPath $zipFile -Force

Write-Host "✅ Archivo comprimido: $zipFile" -ForegroundColor Green
Write-Host ""

Write-Host "📤 PASO 3: Subir backend al servidor" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

Write-Host "📤 Subiendo $zipFile al servidor..." -ForegroundColor Cyan
scp -i $KEY_FILE $zipFile "${SERVER_USER}@${SERVER_IP}:/home/ubuntu/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir archivo al servidor" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivo subido exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "📤 PASO 4: Subir migración SQL al servidor" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

Write-Host "📤 Subiendo add-dynamiaerp-columns.sql..." -ForegroundColor Cyan
scp -i $KEY_FILE backend/add-dynamiaerp-columns.sql "${SERVER_USER}@${SERVER_IP}:/home/ubuntu/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir migración SQL" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Migración SQL subida exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "🗄️  PASO 5: Aplicar migración SQL" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

Write-Host "🗄️  Aplicando migración a la base de datos..." -ForegroundColor Cyan

$env:PGPASSWORD = $DB_PASSWORD
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f backend/add-dynamiaerp-columns.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al aplicar migración SQL" -ForegroundColor Red
    Write-Host "⚠️  Continuando con el despliegue..." -ForegroundColor Yellow
}
else {
    Write-Host "✅ Migración SQL aplicada exitosamente" -ForegroundColor Green
}

Write-Host ""

Write-Host "🚀 PASO 6: Desplegar en el servidor" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$deployScript = @'
#!/bin/bash
set -e

echo "🔄 Descomprimiendo backend..."
cd /home/ubuntu/consentimientos_aws/backend
rm -rf dist
unzip -q ~/backend-v87-*.zip

echo "📝 Verificando variables de entorno..."
if ! grep -q "DYNAMIAERP_BASE_URL" .env; then
    echo ""
    echo "# DynamiaERP Configuration" >> .env
    echo "DYNAMIAERP_BASE_URL=innovasystems.dynamiaerp.app" >> .env
    echo "DYNAMIAERP_TOKEN=tk60188bfb066427ba846544a563212d9f70e1acb8a4d52fa22b3cacf2018f90e6" >> .env
    echo "DYNAMIAERP_LLAVE_TECNICA=b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca" >> .env
    echo "DYNAMIAERP_SUCURSAL=PRINCIPAL" >> .env
    echo "✅ Variables de entorno agregadas"
else
    echo "✅ Variables de entorno ya existen"
fi

echo "🔄 Reiniciando PM2..."
pm2 restart datagree

echo "⏳ Esperando 5 segundos..."
sleep 5

echo "📊 Estado de PM2:"
pm2 status

echo ""
echo "✅ Despliegue completado"
echo ""
echo "📋 Verificar logs:"
echo "   pm2 logs datagree --lines 50"
echo ""
echo "🔍 Buscar logs de DynamiaERP:"
echo "   pm2 logs datagree | grep -i dynamiaerp"
'@

$deployScript | Out-File -FilePath "deploy-temp.sh" -Encoding UTF8

Write-Host "📤 Subiendo script de despliegue..." -ForegroundColor Cyan
scp -i $KEY_FILE deploy-temp.sh "${SERVER_USER}@${SERVER_IP}:/home/ubuntu/"

Write-Host "🚀 Ejecutando despliegue en el servidor..." -ForegroundColor Cyan
ssh -i $KEY_FILE "${SERVER_USER}@${SERVER_IP}" "bash /home/ubuntu/deploy-temp.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar en el servidor" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Despliegue completado exitosamente" -ForegroundColor Green
Write-Host ""

# Limpiar archivos temporales
Remove-Item deploy-temp.sh -ErrorAction SilentlyContinue
Remove-Item $zipFile -ErrorAction SilentlyContinue

Write-Host "🧪 PASO 7: Verificar integración" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

Write-Host "📊 Verificando estado del servidor..." -ForegroundColor Cyan
ssh -i $KEY_FILE "${SERVER_USER}@${SERVER_IP}" "pm2 status"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ DESPLIEGUE v87 COMPLETADO" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "   1. Verificar logs: ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} 'pm2 logs datagree --lines 50'" -ForegroundColor White
Write-Host "   2. Buscar logs de DynamiaERP: ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} 'pm2 logs datagree | grep -i dynamiaerp'" -ForegroundColor White
Write-Host "   3. Probar con una factura real pagada" -ForegroundColor White
Write-Host "   4. Verificar que se genere el CUFE" -ForegroundColor White
Write-Host ""
Write-Host "🔍 VERIFICAR EN BASE DE DATOS:" -ForegroundColor Cyan
Write-Host "   SELECT ""invoiceNumber"", ""dynamiaerpCufe"", ""dynamiaerpStatus"" FROM invoices WHERE ""dynamiaerpCufe"" IS NOT NULL;" -ForegroundColor White
Write-Host ""
Write-Host "📚 DOCUMENTACIÓN:" -ForegroundColor Cyan
Write-Host "   doc/87-integracion-dynamiaerp/INTEGRACION_DYNAMIAERP_FACTURACION.md" -ForegroundColor White
Write-Host ""
