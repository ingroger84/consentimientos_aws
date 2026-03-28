# Script de Despliegue Backend v73 - Corrección Endpoints Bold
# Fecha: 25 de Marzo 2026
# Descripción: Despliega backend con endpoints Bold corregidos

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE BACKEND v73 - BOLD FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER = "ubuntu@100.28.198.249"
$KEY_PATH = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/var/www/archivoenlinea/backend"
$LOCAL_DIST = "backend/dist"
$BACKUP_NAME = "backend-dist-v73-bold-fix-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"

# Verificar que existe la clave SSH
if (-not (Test-Path $KEY_PATH)) {
    Write-Host "❌ Error: No se encuentra la clave SSH: $KEY_PATH" -ForegroundColor Red
    exit 1
}

# Verificar que existe el directorio dist
if (-not (Test-Path $LOCAL_DIST)) {
    Write-Host "❌ Error: No se encuentra el directorio dist. Ejecuta 'npm run build' primero." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Verificaciones iniciales completadas" -ForegroundColor Green
Write-Host ""

# Paso 1: Crear backup local
Write-Host "📦 Paso 1: Creando backup local..." -ForegroundColor Yellow
try {
    Compress-Archive -Path $LOCAL_DIST -DestinationPath $BACKUP_NAME -Force
    Write-Host "✅ Backup creado: $BACKUP_NAME" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al crear backup: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 2: Crear backup en servidor
Write-Host "📦 Paso 2: Creando backup en servidor..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER "cd $REMOTE_PATH && if [ -d dist ]; then tar -czf backup-dist-v73-`$(date +%Y%m%d-%H%M%S).tar.gz dist; fi"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Advertencia: No se pudo crear backup en servidor" -ForegroundColor Yellow
}
Write-Host ""

# Paso 3: Copiar archivos al servidor
Write-Host "📤 Paso 3: Copiando archivos al servidor..." -ForegroundColor Yellow
Write-Host "   Origen: $LOCAL_DIST" -ForegroundColor Gray
Write-Host "   Destino: ${SERVER}:${REMOTE_PATH}/dist" -ForegroundColor Gray

try {
    # Eliminar dist anterior en servidor
    ssh -i $KEY_PATH $SERVER "rm -rf $REMOTE_PATH/dist"
    
    # Copiar nuevo dist
    scp -i $KEY_PATH -r $LOCAL_DIST "${SERVER}:${REMOTE_PATH}/"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Error al copiar archivos"
    }
    
    Write-Host "✅ Archivos copiados exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al copiar archivos: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Intentando restaurar backup..." -ForegroundColor Yellow
    ssh -i $KEY_PATH $SERVER "cd $REMOTE_PATH && tar -xzf backup-dist-v73-*.tar.gz"
    exit 1
}
Write-Host ""

# Paso 4: Verificar archivos copiados
Write-Host "🔍 Paso 4: Verificando archivos..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER "cd $REMOTE_PATH/dist && ls -lh | head -20"
ssh -i $KEY_PATH $SERVER "cd $REMOTE_PATH/dist && find . -type f | wc -l"
Write-Host ""

# Paso 5: Reiniciar aplicación
Write-Host "🔄 Paso 5: Reiniciando aplicación..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER "cd $REMOTE_PATH && pm2 restart archivoenlinea-backend"
Start-Sleep -Seconds 3
ssh -i $KEY_PATH $SERVER "pm2 info archivoenlinea-backend"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al reiniciar aplicación" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 6: Verificar logs
Write-Host "📋 Paso 6: Verificando logs..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Últimas 30 líneas del log:" -ForegroundColor Gray
Write-Host "----------------------------------------" -ForegroundColor Gray

ssh -i $KEY_PATH $SERVER "pm2 logs archivoenlinea-backend --lines 30 --nostream"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Resumen:" -ForegroundColor Yellow
Write-Host "   • Versión: v73.0.0" -ForegroundColor White
Write-Host "   • Cambios: Endpoints Bold corregidos" -ForegroundColor White
Write-Host "   • Backup local: $BACKUP_NAME" -ForegroundColor White
Write-Host "   • Servidor: $SERVER" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Verificaciones recomendadas:" -ForegroundColor Yellow
Write-Host "   1. Verificar logs: pm2 logs archivoenlinea-backend" -ForegroundColor White
Write-Host "   2. Probar endpoint Bold: POST /payments/bold/test" -ForegroundColor White
Write-Host "   3. Crear intención de pago de prueba" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación:" -ForegroundColor Yellow
Write-Host "   • CORRECCION_ENDPOINTS_BOLD_V73.md" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Red
Write-Host "   Las credenciales de Bold están expuestas y deben ser rotadas." -ForegroundColor Yellow
Write-Host "   Solicita nuevas credenciales a Bold después de verificar que funciona." -ForegroundColor Yellow
Write-Host ""
