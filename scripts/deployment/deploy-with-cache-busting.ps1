# Script de Despliegue con Cache Busting Automatico
# Version: 2.0
# Fecha: 2026-02-09

param(
    [string]$Server = "100.28.198.249",
    [string]$User = "ubuntu",
    [string]$KeyFile = "AWS-ISSABEL.pem",
    [switch]$SkipBackup,
    [switch]$SkipTests
)

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE CON CACHE BUSTING AUTOMATICO" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Funcion para mostrar mensajes
function Write-Step {
    param([string]$Message)
    Write-Host "> $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# 1. Verificar archivos necesarios
Write-Step "Verificando archivos necesarios..."
if (-not (Test-Path $KeyFile)) {
    Write-Error "No se encontro el archivo de clave: $KeyFile"
    exit 1
}
Write-Success "Archivos verificados"

# 2. Leer version actual
Write-Step "Leyendo version actual..."
$packageJson = Get-Content "frontend/package.json" | ConvertFrom-Json
$version = $packageJson.version
Write-Success "Version: $version"

# 3. Compilar Backend
Write-Step "Compilando backend..."
Push-Location backend
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Error al compilar backend" }
    Write-Success "Backend compilado"
} finally {
    Pop-Location
}

# 4. Compilar Frontend (con actualizacion automatica de version.json)
Write-Step "Compilando frontend..."
Push-Location frontend
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Error al compilar frontend" }
    Write-Success "Frontend compilado"
} finally {
    Pop-Location
}

# 5. Verificar que version.json se genero correctamente
Write-Step "Verificando version.json..."
$versionJsonPath = "frontend/dist/version.json"
if (Test-Path $versionJsonPath) {
    $versionJson = Get-Content $versionJsonPath | ConvertFrom-Json
    Write-Host "  Version: $($versionJson.version)" -ForegroundColor Cyan
    Write-Host "  Build Hash: $($versionJson.buildHash)" -ForegroundColor Cyan
    Write-Host "  Fecha: $($versionJson.buildDate)" -ForegroundColor Cyan
    Write-Success "version.json generado correctamente"
} else {
    Write-Error "No se genero version.json"
    exit 1
}

# 6. Crear backup en el servidor (opcional)
if (-not $SkipBackup) {
    Write-Step "Creando backup en el servidor..."
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    ssh -i $KeyFile "$User@$Server" @"
        mkdir -p ~/backups
        tar -czf ~/backups/frontend_backup_$timestamp.tar.gz -C /var/www/consentimientos/frontend . 2>/dev/null || true
        tar -czf ~/backups/backend_backup_$timestamp.tar.gz -C /home/ubuntu/consentimientos_aws/backend/dist . 2>/dev/null || true
        echo 'Backups creados'
"@
    Write-Success "Backup creado"
}

# 7. Desplegar Backend
Write-Step "Desplegando backend..."
scp -i $KeyFile -r backend/dist/* "$User@${Server}:/home/ubuntu/consentimientos_aws/backend/dist/"
scp -i $KeyFile backend/package.json "$User@${Server}:/home/ubuntu/consentimientos_aws/backend/"
Write-Success "Backend desplegado"

# 8. Desplegar Frontend (eliminar archivos antiguos primero)
Write-Step "Desplegando frontend..."
Write-Host "  Eliminando archivos antiguos..." -ForegroundColor Gray
ssh -i $KeyFile "$User@$Server" "rm -rf /var/www/consentimientos/frontend/assets/*"
ssh -i $KeyFile "$User@$Server" "rm -f /var/www/consentimientos/frontend/index.html"
ssh -i $KeyFile "$User@$Server" "rm -f /var/www/consentimientos/frontend/version.json"

Write-Host "  Copiando archivos nuevos..." -ForegroundColor Gray
scp -i $KeyFile -r frontend/dist/* "$User@${Server}:/var/www/consentimientos/frontend/"
Write-Success "Frontend desplegado"

# 9. Actualizar configuracion de Nginx (si existe)
Write-Step "Verificando configuracion de Nginx..."
if (Test-Path "nginx-cache-control.conf") {
    Write-Host "  Copiando configuracion optimizada de Nginx..." -ForegroundColor Gray
    scp -i $KeyFile nginx-cache-control.conf "$User@${Server}:/tmp/nginx-cache-control.conf"
    ssh -i $KeyFile "$User@$Server" @"
        if [ -f /tmp/nginx-cache-control.conf ]; then
            echo 'Configuracion de Nginx disponible en /tmp/nginx-cache-control.conf'
            echo 'Para aplicarla, ejecuta:'
            echo '  sudo cp /tmp/nginx-cache-control.conf /etc/nginx/sites-available/consentimientos'
            echo '  sudo nginx -t && sudo systemctl reload nginx'
        fi
"@
    Write-Success "Configuracion de Nginx copiada"
}

# 10. Reiniciar PM2
Write-Step "Reiniciando PM2..."
ssh -i $KeyFile "$User@$Server" "cd /home/ubuntu/consentimientos_aws && pm2 restart datagree --update-env"
Write-Success "PM2 reiniciado"

# 11. Recargar Nginx
Write-Step "Recargando Nginx..."
ssh -i $KeyFile "$User@$Server" "sudo systemctl reload nginx"
Write-Success "Nginx recargado"

# 12. Verificar despliegue
Write-Step "Verificando despliegue..."
Start-Sleep -Seconds 3

$pmStatus = ssh -i $KeyFile "$User@$Server" "pm2 list | grep datagree"
Write-Host "  PM2 Status:" -ForegroundColor Cyan
Write-Host "  $pmStatus" -ForegroundColor Gray

$versionCheck = ssh -i $KeyFile "$User@$Server" "cat /var/www/consentimientos/frontend/version.json"
Write-Host "  Version en servidor:" -ForegroundColor Cyan
Write-Host "  $versionCheck" -ForegroundColor Gray

Write-Success "Despliegue completado"

# 13. Resumen final
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "         DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Version desplegada: $version" -ForegroundColor Cyan
Write-Host "Servidor: $Server" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs de acceso:" -ForegroundColor Yellow
Write-Host "  - Aplicacion: https://archivoenlinea.com" -ForegroundColor White
Write-Host "  - Super Admin: https://admin.archivoenlinea.com" -ForegroundColor White
Write-Host "  - Version JSON: https://archivoenlinea.com/version.json" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "  Los usuarios veran una notificacion automatica para actualizar." -ForegroundColor White
Write-Host "  El sistema detectara la nueva version en ~5 minutos." -ForegroundColor White
Write-Host ""
