# Script de Despliegue Frontend - Corrección Estados Tenants
# Fecha: 03 de Febrero 2026

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE FRONTEND - ESTADOS TENANTS" -ForegroundColor Cyan
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
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "Frontend compilado exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 2: Crear backup en servidor
Write-Host "Paso 2: Creando backup en servidor..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupCmd = "cd $REMOTE_PATH/frontend; cp -r dist dist_backup_$timestamp"
ssh -i $KEY ${USER}@${SERVER} $backupCmd
Write-Host "Backup creado: dist_backup_$timestamp" -ForegroundColor Green
Write-Host ""

# Paso 3: Subir archivos compilados
Write-Host "Paso 3: Subiendo archivos al servidor..." -ForegroundColor Yellow
Write-Host "Esto puede tomar unos minutos..." -ForegroundColor Gray

# Contar archivos a subir
$fileCount = (Get-ChildItem -Path "frontend/dist" -Recurse -File).Count
Write-Host "Archivos a subir: $fileCount" -ForegroundColor Gray

scp -i $KEY -r frontend/dist/* ${USER}@${SERVER}:${REMOTE_PATH}/frontend/dist/

if ($LASTEXITCODE -eq 0) {
    Write-Host "Archivos subidos exitosamente" -ForegroundColor Green
} else {
    Write-Host "Error al subir archivos" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 4: Limpiar caché de nginx
Write-Host "Paso 4: Limpiando caché de nginx..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "sudo rm -rf /var/cache/nginx/*"
Write-Host "Caché limpiado" -ForegroundColor Green
Write-Host ""

# Paso 5: Recargar nginx
Write-Host "Paso 5: Recargando nginx..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "sudo systemctl reload nginx"
Write-Host "Nginx recargado" -ForegroundColor Green
Write-Host ""

# Paso 6: Verificar estado de nginx
Write-Host "Paso 6: Verificando estado de nginx..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "sudo systemctl status nginx --no-pager | head -n 10"
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Cambios desplegados:" -ForegroundColor White
Write-Host "  - Corrección de estados de tenants" -ForegroundColor White
Write-Host "  - 4 estados ahora visibles (ACTIVE, TRIAL, SUSPENDED, EXPIRED)" -ForegroundColor White
Write-Host "  - Colores distintivos para cada estado" -ForegroundColor White
Write-Host "  - Filtro completo por estado" -ForegroundColor White
Write-Host ""
Write-Host "Fecha: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor White
Write-Host "Servidor: $SERVER" -ForegroundColor White
Write-Host "Backup: dist_backup_$timestamp" -ForegroundColor White
Write-Host ""
Write-Host "Verificar en: https://archivoenlinea.com/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Limpiar caché del navegador (Ctrl+Shift+R)" -ForegroundColor Yellow
Write-Host ""
