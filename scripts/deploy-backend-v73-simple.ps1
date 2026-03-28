# Script de Despliegue Backend v73 - Corrección Endpoints Bold
# Fecha: 25 de Marzo 2026

$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "  DESPLIEGUE BACKEND v73 - BOLD FIX"
Write-Host "========================================"
Write-Host ""

# Configuración
$SERVER = "ubuntu@100.28.198.249"
$KEY_PATH = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws/backend"
$LOCAL_DIST = "backend/dist"
$BACKUP_NAME = "backend-dist-v73-bold-fix-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"

# Verificar que existe la clave SSH
if (-not (Test-Path $KEY_PATH)) {
    Write-Host "ERROR: No se encuentra la clave SSH: $KEY_PATH" -ForegroundColor Red
    exit 1
}

# Verificar que existe el directorio dist
if (-not (Test-Path $LOCAL_DIST)) {
    Write-Host "ERROR: No se encuentra el directorio dist." -ForegroundColor Red
    exit 1
}

Write-Host "OK: Verificaciones iniciales completadas" -ForegroundColor Green
Write-Host ""

# Paso 1: Crear backup local
Write-Host "Paso 1: Creando backup local..." -ForegroundColor Yellow
try {
    Compress-Archive -Path $LOCAL_DIST -DestinationPath $BACKUP_NAME -Force
    Write-Host "OK: Backup creado: $BACKUP_NAME" -ForegroundColor Green
} catch {
    Write-Host "ERROR al crear backup: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 2: Crear backup en servidor
Write-Host "Paso 2: Creando backup en servidor..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER "cd $REMOTE_PATH && if [ -d dist ]; then tar -czf backup-dist-v73-`$(date +%Y%m%d-%H%M%S).tar.gz dist; fi"
Write-Host ""

# Paso 3: Copiar archivos al servidor
Write-Host "Paso 3: Copiando archivos al servidor..." -ForegroundColor Yellow
Write-Host "   Origen: $LOCAL_DIST"
Write-Host "   Destino: ${SERVER}:${REMOTE_PATH}/dist"

try {
    # Eliminar dist anterior en servidor
    ssh -i $KEY_PATH $SERVER "rm -rf $REMOTE_PATH/dist"
    
    # Copiar nuevo dist
    scp -i $KEY_PATH -r $LOCAL_DIST "${SERVER}:${REMOTE_PATH}/"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Error al copiar archivos"
    }
    
    Write-Host "OK: Archivos copiados exitosamente" -ForegroundColor Green
} catch {
    Write-Host "ERROR al copiar archivos: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 4: Verificar archivos copiados
Write-Host "Paso 4: Verificando archivos..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER "cd $REMOTE_PATH/dist && ls -lh | head -20"
Write-Host ""
Write-Host "Total de archivos:"
ssh -i $KEY_PATH $SERVER "cd $REMOTE_PATH/dist && find . -type f | wc -l"
Write-Host ""

# Paso 5: Reiniciar aplicación
Write-Host "Paso 5: Reiniciando aplicación..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER "cd $REMOTE_PATH && pm2 restart datagree"
Start-Sleep -Seconds 3
ssh -i $KEY_PATH $SERVER "pm2 info datagree"
Write-Host ""

# Paso 6: Verificar logs
Write-Host "Paso 6: Verificando logs..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Ultimas 30 lineas del log:"
Write-Host "----------------------------------------"

ssh -i $KEY_PATH $SERVER "pm2 logs datagree --lines 30 --nostream"

Write-Host ""
Write-Host "========================================"
Write-Host "  DESPLIEGUE COMPLETADO"
Write-Host "========================================"
Write-Host ""
Write-Host "Resumen:" -ForegroundColor Yellow
Write-Host "   Version: v73.0.0"
Write-Host "   Cambios: Endpoints Bold corregidos"
Write-Host "   Backup local: $BACKUP_NAME"
Write-Host "   Servidor: $SERVER"
Write-Host ""
Write-Host "Verificaciones recomendadas:" -ForegroundColor Yellow
Write-Host "   1. Verificar logs: pm2 logs datagree"
Write-Host "   2. Probar endpoint Bold: POST /payments/bold/test"
Write-Host "   3. Crear intencion de pago de prueba"
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "   Las credenciales de Bold estan expuestas y deben ser rotadas."
Write-Host ""
