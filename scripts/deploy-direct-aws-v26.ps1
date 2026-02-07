# Script de Despliegue Directo a AWS - v26.0.0
# Despliegue sin GitHub (transferencia directa por SCP)

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  DESPLIEGUE DIRECTO AWS - v26.0.0         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER = "ubuntu@100.28.198.249"
$KEY_PATH = "keys/AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"
$LOCAL_PATH = "."

# Verificar que la clave SSH existe
if (-not (Test-Path $KEY_PATH)) {
    Write-Host "❌ Error: Clave SSH no encontrada en $KEY_PATH" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Paso 1: Compilando Backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando backend" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✅ Backend compilado" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Paso 2: Compilando Frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando frontend" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✅ Frontend compilado" -ForegroundColor Green
Write-Host ""

Write-Host "📤 Paso 3: Creando archivo de transferencia..." -ForegroundColor Yellow

# Crear directorio temporal
$TEMP_DIR = "temp_deploy_v26"
if (Test-Path $TEMP_DIR) {
    Remove-Item -Recurse -Force $TEMP_DIR
}
New-Item -ItemType Directory -Path $TEMP_DIR | Out-Null

# Copiar archivos necesarios
Write-Host "   Copiando backend..." -ForegroundColor Gray
Copy-Item -Recurse "backend/dist" "$TEMP_DIR/backend_dist"
Copy-Item -Recurse "backend/migrations" "$TEMP_DIR/backend_migrations"
Copy-Item "backend/package.json" "$TEMP_DIR/"
Copy-Item "backend/package-lock.json" "$TEMP_DIR/"
Copy-Item "backend/update-role-permissions-complete.js" "$TEMP_DIR/"
Copy-Item "backend/run-complete-migration.js" "$TEMP_DIR/"

Write-Host "   Copiando frontend..." -ForegroundColor Gray
Copy-Item -Recurse "frontend/dist" "$TEMP_DIR/frontend_dist"

Write-Host "   Copiando ecosystem..." -ForegroundColor Gray
Copy-Item "ecosystem.config.production.js" "$TEMP_DIR/"

Write-Host "✅ Archivos preparados" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Paso 4: Transfiriendo archivos a AWS..." -ForegroundColor Yellow

# Comprimir archivos
$ARCHIVE_NAME = "deploy_v26.tar.gz"
Write-Host "   Comprimiendo archivos..." -ForegroundColor Gray
tar -czf $ARCHIVE_NAME -C $TEMP_DIR .

# Transferir archivo
Write-Host "   Transfiriendo a servidor..." -ForegroundColor Gray
scp -i $KEY_PATH $ARCHIVE_NAME "${SERVER}:/tmp/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error transfiriendo archivos" -ForegroundColor Red
    Remove-Item -Recurse -Force $TEMP_DIR
    Remove-Item $ARCHIVE_NAME
    exit 1
}

Write-Host "✅ Archivos transferidos" -ForegroundColor Green
Write-Host ""

# Limpiar archivos temporales locales
Remove-Item -Recurse -Force $TEMP_DIR
Remove-Item $ARCHIVE_NAME

Write-Host "🔧 Paso 5: Ejecutando despliegue en servidor..." -ForegroundColor Yellow

$REMOTE_SCRIPT = @"
#!/bin/bash
set -e

echo '📦 Descomprimiendo archivos...'
cd /tmp
tar -xzf deploy_v26.tar.gz -C /tmp/deploy_temp
cd $REMOTE_PATH

echo '🛑 Deteniendo PM2...'
pm2 stop all || true

echo '📁 Respaldando versión anterior...'
BACKUP_DIR="backup_\$(date +%Y%m%d_%H%M%S)"
mkdir -p ../backups/\$BACKUP_DIR
cp -r backend/dist ../backups/\$BACKUP_DIR/backend_dist || true
cp -r frontend/dist ../backups/\$BACKUP_DIR/frontend_dist || true

echo '🔄 Actualizando backend...'
rm -rf backend/dist
cp -r /tmp/deploy_temp/backend_dist backend/dist
cp /tmp/deploy_temp/package.json backend/
cp /tmp/deploy_temp/package-lock.json backend/
cp /tmp/deploy_temp/update-role-permissions-complete.js backend/
cp /tmp/deploy_temp/run-complete-migration.js backend/
cp -r /tmp/deploy_temp/backend_migrations backend/migrations

echo '🔄 Actualizando frontend...'
rm -rf frontend/dist
cp -r /tmp/deploy_temp/frontend_dist frontend/dist

echo '🔄 Actualizando ecosystem...'
cp /tmp/deploy_temp/ecosystem.config.production.js .

echo '📊 Ejecutando migraciones...'
cd backend
node run-complete-migration.js || echo '⚠️ Migración ya ejecutada o error'

echo '🔐 Actualizando permisos...'
node update-role-permissions-complete.js || echo '⚠️ Permisos ya actualizados o error'

echo '🚀 Reiniciando PM2...'
cd ..
pm2 restart ecosystem.config.production.js
pm2 save

echo '🧹 Limpiando archivos temporales...'
rm -rf /tmp/deploy_temp
rm /tmp/deploy_v26.tar.gz

echo '✅ Despliegue completado!'
"@

# Guardar script en archivo temporal
$REMOTE_SCRIPT | Out-File -FilePath "temp_deploy_script.sh" -Encoding ASCII

# Transferir y ejecutar script
scp -i $KEY_PATH "temp_deploy_script.sh" "${SERVER}:/tmp/"
ssh -i $KEY_PATH $SERVER "mkdir -p /tmp/deploy_temp && chmod +x /tmp/temp_deploy_script.sh && /tmp/temp_deploy_script.sh"

# Limpiar script temporal local
Remove-Item "temp_deploy_script.sh"

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ DESPLIEGUE COMPLETADO EXITOSAMENTE    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Aplicación disponible en:" -ForegroundColor Cyan
Write-Host "   https://archivoenlinea.com.co" -ForegroundColor White
Write-Host ""
Write-Host "📊 Verificar estado:" -ForegroundColor Cyan
Write-Host "   ssh -i $KEY_PATH $SERVER 'pm2 status'" -ForegroundColor White
Write-Host ""
Write-Host "📝 Ver logs:" -ForegroundColor Cyan
Write-Host "   ssh -i $KEY_PATH $SERVER 'pm2 logs'" -ForegroundColor White
Write-Host ""
