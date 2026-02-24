# Script de Despliegue Frontend - Versión 23.2.0
# Fecha: 01 de Febrero 2026

$ErrorActionPreference = "Stop"

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  DESPLIEGUE FRONTEND 23.2.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "keys/AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

# Verificar clave SSH
if (-not (Test-Path $KEY)) {
    Write-Host "Error: No se encuentra la clave SSH" -ForegroundColor Red
    exit 1
}

# Paso 1: Compilar frontend
Write-Host "Paso 1: Compilando frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..
Write-Host "Frontend compilado" -ForegroundColor Green
Write-Host ""

# Paso 2: Crear backup
Write-Host "Paso 2: Creando backup..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupCmd = "cd $REMOTE_PATH; cp -r frontend/dist frontend/dist_backup_$timestamp"
ssh -i $KEY ${USER}@${SERVER} $backupCmd
Write-Host "Backup creado: dist_backup_$timestamp" -ForegroundColor Green
Write-Host ""

# Paso 3: Subir archivos
Write-Host "Paso 3: Subiendo archivos..." -ForegroundColor Yellow
scp -i $KEY -r frontend/dist/* ${USER}@${SERVER}:${REMOTE_PATH}/frontend/dist/
Write-Host "Archivos subidos" -ForegroundColor Green
Write-Host ""

# Paso 4: Configurar permisos
Write-Host "Paso 4: Configurando permisos..." -ForegroundColor Yellow
$permCmd = "cd $REMOTE_PATH/frontend/dist; chmod -R 755 ."
ssh -i $KEY ${USER}@${SERVER} $permCmd
Write-Host "Permisos configurados" -ForegroundColor Green
Write-Host ""

# Paso 5: Limpiar caché nginx
Write-Host "Paso 5: Limpiando cache nginx..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "sudo rm -rf /var/cache/nginx/*"
Write-Host "Cache limpiado" -ForegroundColor Green
Write-Host ""

# Paso 6: Recargar nginx
Write-Host "Paso 6: Recargando nginx..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "sudo systemctl reload nginx"
Write-Host "Nginx recargado" -ForegroundColor Green
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Version desplegada: 23.2.0" -ForegroundColor White
Write-Host "Fecha: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor White
Write-Host "Servidor: $SERVER" -ForegroundColor White
Write-Host "Backup: dist_backup_$timestamp" -ForegroundColor White
Write-Host ""
Write-Host "URL: https://archivoenlinea.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Limpia cache del navegador (Ctrl + Shift + R)" -ForegroundColor Yellow
Write-Host ""
