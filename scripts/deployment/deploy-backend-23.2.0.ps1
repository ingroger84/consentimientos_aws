# Script de Despliegue Backend - Versión 23.2.0
# Fecha: 02 de Febrero 2026

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE BACKEND 23.2.0" -ForegroundColor Cyan
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

# Paso 1: Compilar backend
Write-Host "Paso 1: Compilando backend..." -ForegroundColor Yellow
Set-Location backend
$env:NODE_OPTIONS = '--max-old-space-size=2048'
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar backend" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "Backend compilado" -ForegroundColor Green
Write-Host ""

# Paso 2: Crear backup
Write-Host "Paso 2: Creando backup..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupCmd = "cd $REMOTE_PATH/backend; cp -r dist dist_backup_$timestamp"
ssh -i $KEY ${USER}@${SERVER} $backupCmd
Write-Host "Backup creado: dist_backup_$timestamp" -ForegroundColor Green
Write-Host ""

# Paso 3: Subir archivos compilados
Write-Host "Paso 3: Subiendo archivos compilados..." -ForegroundColor Yellow
scp -i $KEY -r backend/dist/* ${USER}@${SERVER}:${REMOTE_PATH}/backend/dist/
Write-Host "Archivos subidos" -ForegroundColor Green
Write-Host ""

# Paso 4: Actualizar VERSION.md
Write-Host "Paso 4: Actualizando VERSION.md..." -ForegroundColor Yellow
scp -i $KEY VERSION.md ${USER}@${SERVER}:${REMOTE_PATH}/
Write-Host "VERSION.md actualizado" -ForegroundColor Green
Write-Host ""

# Paso 5: Actualizar package.json
Write-Host "Paso 5: Actualizando package.json..." -ForegroundColor Yellow
scp -i $KEY backend/package.json ${USER}@${SERVER}:${REMOTE_PATH}/backend/
Write-Host "package.json actualizado" -ForegroundColor Green
Write-Host ""

# Paso 6: Reiniciar PM2
Write-Host "Paso 6: Reiniciando PM2..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "pm2 restart datagree --update-env"
Start-Sleep -Seconds 3
Write-Host "PM2 reiniciado" -ForegroundColor Green
Write-Host ""

# Paso 7: Verificar estado
Write-Host "Paso 7: Verificando estado..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "pm2 list"
Write-Host ""

# Paso 8: Mostrar logs
Write-Host "Paso 8: Mostrando logs recientes..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "pm2 logs datagree --lines 20 --nostream"
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
Write-Host "Verificar en: https://archivoenlinea.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Funcionalidades activadas:" -ForegroundColor Yellow
Write-Host "  - Permisos de gestion de estados de HC" -ForegroundColor White
Write-Host "  - Correccion de estados inconsistentes" -ForegroundColor White
Write-Host "  - Sistema de notificaciones por email" -ForegroundColor White
Write-Host "  - Nombre de remitente actualizado" -ForegroundColor White
Write-Host "  - Correccion de suspension de trials" -ForegroundColor White
Write-Host ""
