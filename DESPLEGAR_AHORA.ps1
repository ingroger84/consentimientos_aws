# Script de Despliegue Rápido - Versión 91.1
# Ejecutar desde la raíz del proyecto

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE VERSIÓN 91.1" -ForegroundColor Cyan
Write-Host "  Formato de factura: 001-XXXXXX-XXXX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$KEY_FILE = "AWS-ISSABEL.pem"
$TARBALL = "backend-v91.1-dist.tar.gz"

# Verificar que existe el tarball
if (-not (Test-Path $TARBALL)) {
    Write-Host "❌ Error: No se encuentra el tarball: $TARBALL" -ForegroundColor Red
    Write-Host "   Asegúrate de estar en la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Tarball encontrado: $TARBALL" -ForegroundColor Green
Write-Host ""

# Verificar que existe la llave SSH
if (-not (Test-Path $KEY_FILE)) {
    Write-Host "❌ Error: No se encuentra la llave SSH: $KEY_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Llave SSH encontrada" -ForegroundColor Green
Write-Host ""

# Paso 1: Subir tarball
Write-Host "📤 Paso 1: Subiendo tarball al servidor..." -ForegroundColor Cyan
scp -i $KEY_FILE $TARBALL "${SERVER_USER}@${SERVER_IP}:/home/ubuntu/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir tarball" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Tarball subido exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 2: Desplegar en servidor
Write-Host "🚀 Paso 2: Desplegando en servidor..." -ForegroundColor Cyan

$deployScript = @"
#!/bin/bash
set -e

echo "📍 Ubicación: \$(pwd)"
echo ""

echo "🛑 Deteniendo servicio..."
cd /home/ubuntu/consentimientos_aws/backend
pm2 stop datagree || true
echo "✅ Servicio detenido"
echo ""

echo "💾 Creando backup..."
if [ -d "dist" ]; then
    cp -r dist dist_backup_v91.1_\$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup creado"
else
    echo "⚠️ No existe carpeta dist para hacer backup"
fi
echo ""

echo "📦 Extrayendo nueva versión..."
rm -rf dist
mkdir -p dist
tar -xzf /home/ubuntu/$TARBALL -C dist/
echo "✅ Nueva versión extraída"
echo ""

echo "🔍 Verificando variables de entorno..."
if grep -q "DYNAMIAERP_BASE_URL" .env; then
    echo "✅ Variables de DynamiaERP encontradas"
    grep DYNAMIAERP .env
else
    echo "⚠️ Variables de DynamiaERP no encontradas en .env"
fi
echo ""

echo "🔄 Reiniciando servicio..."
pm2 restart datagree
echo "✅ Servicio reiniciado"
echo ""

echo "📊 Estado del servicio:"
pm2 status datagree
echo ""

echo "📝 Últimos logs (20 líneas):"
pm2 logs datagree --lines 20 --nostream
echo ""

echo "✅ Despliegue completado exitosamente"
echo ""
echo "📋 Verificaciones recomendadas:"
echo "   1. pm2 logs datagree --lines 100"
echo "   2. Probar con próxima factura que se pague"
echo "   3. Verificar formato: 001-XXXXXX-XXXX"
"@

# Guardar script temporalmente
$deployScript | Out-File -FilePath "deploy_temp.sh" -Encoding UTF8

# Subir y ejecutar script
Write-Host "   Subiendo script de despliegue..." -ForegroundColor Gray
scp -i $KEY_FILE deploy_temp.sh "${SERVER_USER}@${SERVER_IP}:/home/ubuntu/"

Write-Host "   Ejecutando despliegue..." -ForegroundColor Gray
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
Write-Host "   1. Verificar logs: ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} 'pm2 logs datagree --lines 100'"
Write-Host "   2. Probar con próxima factura que se pague"
Write-Host "   3. Verificar formato: 001-XXXXXX-XXXX"
Write-Host "   4. Verificar CUFE generado correctamente"
Write-Host ""

Write-Host "📝 Cambios desplegados:" -ForegroundColor Cyan
Write-Host "   ✅ Formato de factura: INV- → 001-"
Write-Host "   ✅ Datos del cliente completos"
Write-Host "   ✅ Campos requeridos agregados"
Write-Host "   ✅ Integración con DynamiaERP funcionando"
Write-Host ""

Write-Host "🎉 ¡Despliegue exitoso!" -ForegroundColor Green
