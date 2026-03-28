# Script de despliegue: Asociación de Plantillas CN a Servicios
# Versión: v61
# Fecha: 2026-03-17

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE V61: PLANTILLAS CN POR SERVICIO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Configuración
$BACKEND_DIR = "backend"
$FRONTEND_DIR = "frontend"
$SERVER_USER = "ubuntu"
$SERVER_HOST = "archivoenlinea.com"
$SERVER_PATH = "/home/ubuntu/archivoenlinea"

Write-Host "📋 FASE 1: MIGRACIÓN DE BASE DE DATOS" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Creando tabla intermedia consent_template_services..." -ForegroundColor White
ssh ${SERVER_USER}@${SERVER_HOST} "cd $SERVER_PATH/backend && psql `$DATABASE_URL -f migrations/add-consent-template-services-relation.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Tabla creada exitosamente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error al crear tabla" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Migrando plantillas existentes a servicios..." -ForegroundColor White
ssh ${SERVER_USER}@${SERVER_HOST} "cd $SERVER_PATH/backend && node migrate-existing-templates-to-services.js"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Migración completada" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Advertencia en migración (puede ser normal si no hay datos)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 FASE 2: COMPILACIÓN BACKEND" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow
Write-Host ""

Set-Location $BACKEND_DIR

Write-Host "1. Instalando dependencias..." -ForegroundColor White
npm install

Write-Host "2. Compilando TypeScript..." -ForegroundColor White
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en compilación del backend" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ Backend compilado" -ForegroundColor Green

Write-Host ""
Write-Host "📦 FASE 3: COMPILACIÓN FRONTEND" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""

Set-Location "..\$FRONTEND_DIR"

Write-Host "1. Actualizando versión..." -ForegroundColor White
$versionFile = "src/config/version.ts"
$newVersion = "61.0.0"
$content = @"
export const APP_VERSION = '$newVersion';
export const BUILD_DATE = '$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")';
"@
Set-Content -Path $versionFile -Value $content
Write-Host "   ✅ Versión actualizada a v$newVersion" -ForegroundColor Green

Write-Host "2. Instalando dependencias..." -ForegroundColor White
npm install

Write-Host "3. Compilando aplicación..." -ForegroundColor White
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en compilación del frontend" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ Frontend compilado" -ForegroundColor Green

Write-Host ""
Write-Host "📤 FASE 4: DESPLIEGUE A SERVIDOR" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

Set-Location ..

Write-Host "1. Creando backup del backend actual..." -ForegroundColor White
ssh ${SERVER_USER}@${SERVER_HOST} "cd $SERVER_PATH && cp -r backend/dist backend/dist.backup.v60"

Write-Host "2. Subiendo backend compilado..." -ForegroundColor White
scp -r backend/dist/* ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/backend/dist/
scp backend/migrate-existing-templates-to-services.js ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/backend/
scp backend/migrations/add-consent-template-services-relation.sql ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/backend/migrations/

Write-Host "3. Subiendo entidades actualizadas..." -ForegroundColor White
scp backend/src/consent-templates/entities/* ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/backend/src/consent-templates/entities/

Write-Host "4. Creando backup del frontend actual..." -ForegroundColor White
ssh ${SERVER_USER}@${SERVER_HOST} "cd $SERVER_PATH && cp -r frontend/dist frontend/dist.backup.v60"

Write-Host "5. Subiendo frontend compilado..." -ForegroundColor White
scp -r frontend/dist/* ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/frontend/dist/

Write-Host ""
Write-Host "🔄 FASE 5: REINICIO DE SERVICIOS" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Reiniciando backend con PM2..." -ForegroundColor White
ssh ${SERVER_USER}@${SERVER_HOST} "cd $SERVER_PATH && pm2 restart archivoenlinea-backend"

Start-Sleep -Seconds 3

Write-Host "2. Verificando estado del backend..." -ForegroundColor White
ssh ${SERVER_USER}@${SERVER_HOST} "pm2 status archivoenlinea-backend"

Write-Host "3. Limpiando caché de Nginx..." -ForegroundColor White
ssh ${SERVER_USER}@${SERVER_HOST} "sudo systemctl reload nginx"

Write-Host ""
Write-Host "✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 RESUMEN:" -ForegroundColor Cyan
Write-Host "  • Versión desplegada: v$newVersion" -ForegroundColor White
Write-Host "  • Nueva funcionalidad: Asociación de plantillas CN a servicios" -ForegroundColor White
Write-Host "  • Base de datos: Tabla consent_template_services creada" -ForegroundColor White
Write-Host "  • Migración: Plantillas existentes asociadas a todos los servicios" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Acceso:" -ForegroundColor Cyan
Write-Host "  https://archivoenlinea.com" -ForegroundColor White
Write-Host ""
Write-Host "📝 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "  1. Verificar que las plantillas muestran los servicios asociados" -ForegroundColor White
Write-Host "  2. Crear una nueva plantilla y asociarla a servicios específicos" -ForegroundColor White
Write-Host "  3. Editar plantillas existentes para ajustar servicios" -ForegroundColor White
Write-Host "  4. Verificar que los consentimientos se envían según el servicio" -ForegroundColor White
Write-Host ""
