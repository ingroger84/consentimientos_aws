# Script de Despliegue - Versión 91 (Sistema Revertido)
# Integración DynamiaERP - Usando número original de factura

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE VERSIÓN 91" -ForegroundColor Cyan
Write-Host "  DynamiaERP - Sistema Revertido" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$KEY_FILE = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws/backend"
$VERSION = "v91"

Write-Host "📋 Configuración:" -ForegroundColor Yellow
Write-Host "   Servidor: $SERVER_IP"
Write-Host "   Usuario: $SERVER_USER"
Write-Host "   Path: $REMOTE_PATH"
Write-Host "   Versión: $VERSION"
Write-Host ""

# Verificar que existe la llave SSH
if (-not (Test-Path $KEY_FILE)) {
    Write-Host "❌ Error: No se encuentra la llave SSH: $KEY_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Llave SSH encontrada" -ForegroundColor Green
Write-Host ""

# Paso 1: Compilar backend
Write-Host "📦 Paso 1: Compilando backend..." -ForegroundColor Cyan
Set-Location backend

if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encuentra package.json" -ForegroundColor Red
    exit 1
}

Write-Host "   Instalando dependencias..." -ForegroundColor Gray
npm install --silent

Write-Host "   Compilando TypeScript..." -ForegroundColor Gray
npm run build

if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: No se generó la carpeta dist" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend compilado exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 2: Crear tarball
Write-Host "📦 Paso 2: Creando tarball..." -ForegroundColor Cyan
Set-Location dist

$tarballName = "backend-$VERSION-dist.tar.gz"
tar -czf $tarballName *

if (-not (Test-Path $tarballName)) {
    Write-Host "❌ Error: No se pudo crear el tarball" -ForegroundColor Red
    exit 1
}

$tarballSize = (Get-Item $tarballName).Length / 1MB
Write-Host "✅ Tarball creado: $tarballName ($([math]::Round($tarballSize, 2)) MB)" -ForegroundColor Green

# Mover tarball a la raíz del proyecto
Move-Item $tarballName ../../ -Force
Set-Location ../../

Write-Host ""

# Paso 3: Subir a AWS
Write-Host "📤 Paso 3: Subiendo archivos a AWS..." -ForegroundColor Cyan
Write-Host "   Esto puede tomar varios minutos..." -ForegroundColor Gray

scp -i $KEY_FILE $tarballName "${SERVER_USER}@${SERVER_IP}:/home/ubuntu/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir archivos" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivos subidos exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 4: Desplegar en servidor
Write-Host "🚀 Paso 4: Desplegando en servidor..." -ForegroundColor Cyan

$deployScript = @"
#!/bin/bash
set -e

echo "📍 Ubicación actual: \$(pwd)"
echo ""

echo "🛑 Deteniendo servicio..."
cd $REMOTE_PATH
pm2 stop datagree || true
echo "✅ Servicio detenido"
echo ""

echo "💾 Creando backup..."
if [ -d "dist" ]; then
    cp -r dist dist_backup_v90_\$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup creado"
else
    echo "⚠️ No existe carpeta dist para hacer backup"
fi
echo ""

echo "📦 Extrayendo nueva versión..."
cd $REMOTE_PATH
rm -rf dist
mkdir -p dist
tar -xzf /home/ubuntu/$tarballName -C dist/
echo "✅ Nueva versión extraída"
echo ""

echo "🔍 Verificando variables de entorno..."
if grep -q "DYNAMIAERP_BASE_URL" .env; then
    echo "✅ Variables de DynamiaERP encontradas"
else
    echo "⚠️ Agregando variables de DynamiaERP al .env"
    echo "" >> .env
    echo "# DynamiaERP - Facturación Electrónica DIAN" >> .env
    echo "DYNAMIAERP_BASE_URL=api.pos.dynamiaerp.co" >> .env
    echo "DYNAMIAERP_TOKEN=be4c7acbeede150ed0cc1b6a02506e55" >> .env
    echo "DYNAMIAERP_LLAVE_TECNICA=b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca" >> .env
    echo "DYNAMIAERP_SUCURSAL=PRINCIPAL" >> .env
fi
echo ""

echo "🔄 Reiniciando servicio..."
pm2 restart datagree
echo "✅ Servicio reiniciado"
echo ""

echo "📊 Estado del servicio:"
pm2 status datagree
echo ""

echo "📝 Últimos logs:"
pm2 logs datagree --lines 20 --nostream
echo ""

echo "✅ Despliegue completado exitosamente"
"@

# Guardar script temporalmente
$deployScript | Out-File -FilePath "deploy_temp.sh" -Encoding UTF8

# Subir y ejecutar script
scp -i $KEY_FILE deploy_temp.sh "${SERVER_USER}@${SERVER_IP}:/home/ubuntu/"
ssh -i $KEY_FILE "${SERVER_USER}@${SERVER_IP}" "chmod +x /home/ubuntu/deploy_temp.sh && /home/ubuntu/deploy_temp.sh"

# Limpiar
Remove-Item deploy_temp.sh

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error durante el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Verificar logs: ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} 'pm2 logs datagree --lines 50'"
Write-Host "   2. Verificar salud: curl https://api.archivoenlinea.com/api/health"
Write-Host "   3. Probar pago completo con un tenant de prueba"
Write-Host ""

Write-Host "📝 Cambios en esta versión:" -ForegroundColor Cyan
Write-Host "   ✅ Sistema de consecutivos REVERTIDO"
Write-Host "   ✅ Ahora usa número original de factura (INV-202604-XXXX)"
Write-Host "   ✅ Sucursal hardcodeada a '001'"
Write-Host "   ✅ Nombre producto: 'LINK DE PAGO'"
Write-Host "   ✅ Observaciones: 'LINK DE PAGO'"
Write-Host ""

Write-Host "🎉 ¡Despliegue exitoso!" -ForegroundColor Green
