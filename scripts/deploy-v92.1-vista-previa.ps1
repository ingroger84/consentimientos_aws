# Script de Despliegue v92.1.0 - Vista Previa de Consentimientos
# Fecha: 2026-05-01
# Descripción: Implementación de vista previa antes de firma para CN y HC

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE v92.1.0 - VISTA PREVIA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Configuración
$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$BACKEND_PATH = "/home/ubuntu/consentimientos_aws/backend"
$FRONTEND_PATH = "/home/ubuntu/consentimientos_aws/frontend"
$PM2_PROCESS = "datagree"

Write-Host "📋 Resumen de cambios v92.1.0:" -ForegroundColor Yellow
Write-Host "  ✅ Nuevo componente: ConsentPreview.tsx" -ForegroundColor Green
Write-Host "  ✅ Vista previa para Consentimientos Normales (CN)" -ForegroundColor Green
Write-Host "  ✅ Vista previa para Consentimientos HC" -ForegroundColor Green
Write-Host "  ✅ Flujo mejorado: 4 pasos para CN (antes 3)" -ForegroundColor Green
Write-Host "  ✅ Checkbox de confirmación de lectura" -ForegroundColor Green
Write-Host "  ✅ Resaltado de preguntas críticas" -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "backend/package.json") -or -not (Test-Path "frontend/package.json")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar versiones
Write-Host "🔍 Verificando versiones..." -ForegroundColor Cyan
$backendVersion = (Get-Content "backend/package.json" | ConvertFrom-Json).version
$frontendVersion = (Get-Content "frontend/package.json" | ConvertFrom-Json).version

if ($backendVersion -ne "92.1.0" -or $frontendVersion -ne "92.1.0") {
    Write-Host "❌ Error: Las versiones no coinciden con 92.1.0" -ForegroundColor Red
    Write-Host "   Backend: $backendVersion" -ForegroundColor Yellow
    Write-Host "   Frontend: $frontendVersion" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Versiones correctas: $backendVersion" -ForegroundColor Green
Write-Host ""

# Paso 1: Compilar Backend
Write-Host "📦 Paso 1/5: Compilando Backend..." -ForegroundColor Cyan
Set-Location backend
if (Test-Path "dist") {
    Remove-Item -Recurse -Force dist
}
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend compilado exitosamente" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Paso 2: Compilar Frontend
Write-Host "📦 Paso 2/5: Compilando Frontend..." -ForegroundColor Cyan
Set-Location frontend
if (Test-Path "dist") {
    Remove-Item -Recurse -Force dist
}
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend compilado exitosamente" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Paso 3: Crear archivo tar del backend
Write-Host "📦 Paso 3/5: Empaquetando Backend..." -ForegroundColor Cyan
if (Test-Path "backend-v92.1-dist.tar.gz") {
    Remove-Item backend-v92.1-dist.tar.gz
}
tar -czf backend-v92.1-dist.tar.gz -C backend/dist .
Write-Host "✅ Backend empaquetado: backend-v92.1-dist.tar.gz" -ForegroundColor Green
Write-Host ""

# Paso 4: Subir y desplegar Backend
Write-Host "🚀 Paso 4/5: Desplegando Backend en servidor..." -ForegroundColor Cyan
Write-Host "   Subiendo archivo..." -ForegroundColor Gray
scp -i $KEY backend-v92.1-dist.tar.gz ${SERVER}:/home/ubuntu/

Write-Host "   Extrayendo en servidor..." -ForegroundColor Gray
ssh -i $KEY $SERVER @"
    cd $BACKEND_PATH
    rm -rf dist
    mkdir -p dist
    tar -xzf /home/ubuntu/backend-v92.1-dist.tar.gz -C dist/
    rm /home/ubuntu/backend-v92.1-dist.tar.gz
    echo '✅ Backend extraído'
"@

Write-Host "   Reiniciando servicio PM2..." -ForegroundColor Gray
ssh -i $KEY $SERVER "pm2 restart $PM2_PROCESS"
Write-Host "✅ Backend desplegado y reiniciado" -ForegroundColor Green
Write-Host ""

# Paso 5: Desplegar Frontend
Write-Host "🚀 Paso 5/5: Desplegando Frontend en servidor..." -ForegroundColor Cyan
Write-Host "   Subiendo archivos..." -ForegroundColor Gray
scp -i $KEY -r frontend/dist/* ${SERVER}:${FRONTEND_PATH}/dist/

Write-Host "✅ Frontend desplegado" -ForegroundColor Green
Write-Host ""

# Verificación
Write-Host "🔍 Verificando despliegue..." -ForegroundColor Cyan
ssh -i $KEY $SERVER @"
    echo '📊 Estado del servicio PM2:'
    pm2 list | grep $PM2_PROCESS
    echo ''
    echo '📁 Archivos del frontend:'
    ls -lh $FRONTEND_PATH/dist/ | head -5
    echo ''
    echo '📄 Versión desplegada:'
    cat $FRONTEND_PATH/dist/version.json 2>/dev/null || echo 'version.json no encontrado'
"@

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Verificar que la aplicación carga correctamente" -ForegroundColor White
Write-Host "  2. Probar crear un consentimiento CN (4 pasos)" -ForegroundColor White
Write-Host "  3. Verificar vista previa en paso 3" -ForegroundColor White
Write-Host "  4. Probar generar consentimiento HC" -ForegroundColor White
Write-Host "  5. Verificar vista previa antes de firma" -ForegroundColor White
Write-Host "  6. Confirmar que checkbox de lectura funciona" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "  Admin: https://admin.archivoenlinea.com" -ForegroundColor White
Write-Host "  Versión: 92.1.0 - 2026-05-01" -ForegroundColor White
Write-Host ""
Write-Host "📝 Documentación: IMPLEMENTACION_VISTA_PREVIA_V92.1.md" -ForegroundColor Cyan
Write-Host ""
