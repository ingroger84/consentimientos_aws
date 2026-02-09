# Script de Despliegue: Corrección Página Planes - Precios Multi-Región
# Versión: 30.2.1
# Fecha: 2026-02-08

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE: Corrección Página Planes" -ForegroundColor Cyan
Write-Host "  Versión: 30.2.1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$VERSION = "30.2.1"

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "frontend/package.json")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Paso 1: Verificando cambios en PlansManagementPage.tsx..." -ForegroundColor Yellow
if (-not (Test-Path "frontend/src/pages/PlansManagementPage.tsx")) {
    Write-Host "❌ Error: No se encuentra PlansManagementPage.tsx" -ForegroundColor Red
    exit 1
}

# Verificar que el archivo tiene los cambios
$content = Get-Content "frontend/src/pages/PlansManagementPage.tsx" -Raw
if ($content -notmatch "Precios por Región") {
    Write-Host "❌ Error: PlansManagementPage.tsx no tiene los cambios necesarios" -ForegroundColor Red
    Write-Host "   Asegúrate de que el archivo tenga la sección 'Precios por Región'" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Cambios verificados en PlansManagementPage.tsx" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Paso 2: Compilando frontend..." -ForegroundColor Yellow
Set-Location frontend

# Limpiar dist anterior
if (Test-Path "dist") {
    Remove-Item -Recurse -Force dist
}

# Compilar
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en la compilación del frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Frontend compilado exitosamente" -ForegroundColor Green
Set-Location ..
Write-Host ""

Write-Host "📦 Paso 3: Comprimiendo archivos..." -ForegroundColor Yellow
$tarFile = "frontend-dist-v$VERSION.tar.gz"

# Eliminar tar anterior si existe
if (Test-Path $tarFile) {
    Remove-Item $tarFile
}

# Crear tar.gz
tar -czf $tarFile -C frontend/dist .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al comprimir archivos" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivos comprimidos: $tarFile" -ForegroundColor Green
Write-Host ""

Write-Host "📤 Paso 4: Subiendo archivos al servidor..." -ForegroundColor Yellow
scp -i $KEY $tarFile "${SERVER}:/tmp/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir archivos al servidor" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivos subidos al servidor" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Paso 5: Desplegando en producción..." -ForegroundColor Yellow

$deployScript = @"
cd /tmp
echo '📦 Extrayendo archivos...'
sudo tar -xzf $tarFile -C /var/www/html/
echo '✅ Archivos extraídos'

echo '🔒 Ajustando permisos...'
sudo chown -R www-data:www-data /var/www/html/
echo '✅ Permisos ajustados'

echo '🧹 Limpiando archivos temporales...'
rm $tarFile
echo '✅ Limpieza completada'

echo ''
echo '✅ Despliegue completado exitosamente'
echo ''
echo '📋 Verificación:'
echo '   - Accede a https://admin.archivoenlinea.com/plans'
echo '   - Verifica que se muestran precios en COP y USD'
echo '   - Verifica el mensaje informativo azul'
echo '   - Prueba los links "Editar precios →"'
echo ''
echo '⚠️  IMPORTANTE: Los usuarios deben limpiar caché del navegador'
echo '   - Chrome/Edge: Ctrl+Shift+R o Ctrl+F5'
echo '   - Firefox: Ctrl+Shift+R'
echo '   - Safari: Cmd+Shift+R'
"@

ssh -i $KEY $SERVER $deployScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error durante el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Accede a: https://admin.archivoenlinea.com/plans" -ForegroundColor White
Write-Host "   2. Verifica que se muestran precios por región" -ForegroundColor White
Write-Host "   3. Verifica el mensaje informativo" -ForegroundColor White
Write-Host "   4. Prueba los links de edición" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   Los usuarios deben limpiar caché: Ctrl+Shift+R" -ForegroundColor Yellow
Write-Host ""

# Limpiar archivo local
Remove-Item $tarFile
Write-Host "🧹 Archivo local limpiado" -ForegroundColor Green
Write-Host ""
Write-Host "✨ ¡Listo!" -ForegroundColor Green
