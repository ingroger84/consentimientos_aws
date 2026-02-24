# ============================================
# Script de Despliegue con Cache Busting Agresivo v2.0
# ============================================

param(
    [string]$ServerIP = "100.28.198.249",
    [string]$ServerUser = "ubuntu",
    [string]$KeyFile = "AWS-ISSABEL.pem",
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE CON CACHE BUSTING AGRESIVO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar que existe la clave SSH
if (-not (Test-Path $KeyFile)) {
    Write-Host "❌ Error: No se encuentra la clave SSH: $KeyFile" -ForegroundColor Red
    exit 1
}

# ============================================
# PASO 1: COMPILAR BACKEND
# ============================================
if (-not $SkipBackend) {
    Write-Host "📦 PASO 1: Compilando Backend..." -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location backend
    
    # Limpiar dist anterior
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force dist
        Write-Host "✅ Directorio dist limpiado" -ForegroundColor Green
    }
    
    # Compilar
    Write-Host "🔨 Compilando TypeScript..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al compilar el backend" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Write-Host "✅ Backend compilado exitosamente" -ForegroundColor Green
    Write-Host ""
    
    Set-Location ..
}

# ============================================
# PASO 2: COMPILAR FRONTEND CON CACHE BUSTING
# ============================================
if (-not $SkipFrontend) {
    Write-Host "📦 PASO 2: Compilando Frontend con Cache Busting..." -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location frontend
    
    # Limpiar dist anterior
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force dist
        Write-Host "✅ Directorio dist limpiado" -ForegroundColor Green
    }
    
    # Compilar (esto ejecutará update-version.js y post-build.js automáticamente)
    Write-Host "🔨 Compilando React + Vite con versionamiento..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al compilar el frontend" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    # Verificar que version.json existe
    if (-not (Test-Path "dist/version.json")) {
        Write-Host "❌ Error: version.json no fue generado" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    # Leer y mostrar información de versión
    $versionInfo = Get-Content "dist/version.json" | ConvertFrom-Json
    Write-Host ""
    Write-Host "📋 Información de Build:" -ForegroundColor Cyan
    Write-Host "   Versión: $($versionInfo.version)" -ForegroundColor White
    Write-Host "   Fecha: $($versionInfo.buildDate)" -ForegroundColor White
    Write-Host "   Hash: $($versionInfo.buildHash)" -ForegroundColor White
    Write-Host "   Timestamp: $($versionInfo.buildTimestamp)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "✅ Frontend compilado exitosamente" -ForegroundColor Green
    Write-Host ""
    
    Set-Location ..
}

# ============================================
# PASO 3: DESPLEGAR EN SERVIDOR
# ============================================
Write-Host "🚀 PASO 3: Desplegando en servidor..." -ForegroundColor Yellow
Write-Host ""

# Crear timestamp único para este despliegue
$deployTimestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

# Desplegar Backend
if (-not $SkipBackend) {
    Write-Host "📤 Subiendo Backend..." -ForegroundColor Cyan
    
    # Crear tarball del backend
    Set-Location backend
    tar -czf backend-dist.tar.gz dist/
    
    # Subir al servidor
    scp -i "../$KeyFile" backend-dist.tar.gz "${ServerUser}@${ServerIP}:/tmp/backend-dist-${deployTimestamp}.tar.gz"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al subir backend" -ForegroundColor Red
        Remove-Item backend-dist.tar.gz
        Set-Location ..
        exit 1
    }
    
    Remove-Item backend-dist.tar.gz
    Set-Location ..
    
    Write-Host "✅ Backend subido" -ForegroundColor Green
}

# Desplegar Frontend
if (-not $SkipFrontend) {
    Write-Host "📤 Subiendo Frontend..." -ForegroundColor Cyan
    
    # Crear tarball del frontend
    Set-Location frontend
    tar -czf frontend-dist.tar.gz dist/
    
    # Subir al servidor
    scp -i "../$KeyFile" frontend-dist.tar.gz "${ServerUser}@${ServerIP}:/tmp/frontend-dist-${deployTimestamp}.tar.gz"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al subir frontend" -ForegroundColor Red
        Remove-Item frontend-dist.tar.gz
        Set-Location ..
        exit 1
    }
    
    Remove-Item frontend-dist.tar.gz
    Set-Location ..
    
    Write-Host "✅ Frontend subido" -ForegroundColor Green
}

# ============================================
# PASO 4: INSTALAR EN SERVIDOR
# ============================================
Write-Host ""
Write-Host "⚙️ PASO 4: Instalando en servidor..." -ForegroundColor Yellow
Write-Host ""

$remoteScript = @"
#!/bin/bash
set -e

echo "🔧 Instalando archivos en servidor..."

# Desplegar Backend
if [ -f /tmp/backend-dist-${deployTimestamp}.tar.gz ]; then
    echo "📦 Instalando Backend..."
    cd /home/ubuntu/consentimientos_aws/backend
    rm -rf dist
    tar -xzf /tmp/backend-dist-${deployTimestamp}.tar.gz
    rm /tmp/backend-dist-${deployTimestamp}.tar.gz
    echo "✅ Backend instalado"
fi

# Desplegar Frontend
if [ -f /tmp/frontend-dist-${deployTimestamp}.tar.gz ]; then
    echo "📦 Instalando Frontend..."
    
    # Backup del frontend anterior (por si acaso)
    if [ -d /var/www/consentimientos/frontend ]; then
        sudo mv /var/www/consentimientos/frontend /var/www/consentimientos/frontend.backup.${deployTimestamp}
    fi
    
    # Crear directorio y extraer
    sudo mkdir -p /var/www/consentimientos/frontend
    cd /tmp
    tar -xzf frontend-dist-${deployTimestamp}.tar.gz
    sudo mv dist/* /var/www/consentimientos/frontend/
    rm -rf dist
    rm frontend-dist-${deployTimestamp}.tar.gz
    
    # Establecer permisos
    sudo chown -R www-data:www-data /var/www/consentimientos/frontend
    sudo chmod -R 755 /var/www/consentimientos/frontend
    
    echo "✅ Frontend instalado"
fi

# Reiniciar PM2
echo "🔄 Reiniciando PM2..."
cd /home/ubuntu/consentimientos_aws
pm2 restart ecosystem.config.production.js --update-env
pm2 save

# Limpiar caché de Nginx de forma agresiva
echo "🧹 Limpiando caché de Nginx..."
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx

# Verificar versión desplegada
echo ""
echo "📋 Verificando versión desplegada..."
if [ -f /var/www/consentimientos/frontend/version.json ]; then
    cat /var/www/consentimientos/frontend/version.json
else
    echo "⚠️ version.json no encontrado"
fi

echo ""
echo "✅ Despliegue completado"
"@

# Guardar script temporal
$remoteScript | Out-File -FilePath "deploy-temp.sh" -Encoding UTF8

# Subir y ejecutar script
scp -i $KeyFile deploy-temp.sh "${ServerUser}@${ServerIP}:/tmp/deploy-script-${deployTimestamp}.sh"
ssh -i $KeyFile "${ServerUser}@${ServerIP}" "chmod +x /tmp/deploy-script-${deployTimestamp}.sh && /tmp/deploy-script-${deployTimestamp}.sh && rm /tmp/deploy-script-${deployTimestamp}.sh"

Remove-Item deploy-temp.sh

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error durante la instalación en el servidor" -ForegroundColor Red
    exit 1
}

# ============================================
# PASO 5: VERIFICACIÓN
# ============================================
Write-Host ""
Write-Host "🔍 PASO 5: Verificando despliegue..." -ForegroundColor Yellow
Write-Host ""

# Esperar un momento para que PM2 se estabilice
Start-Sleep -Seconds 3

# Verificar estado de PM2
Write-Host "📊 Estado de PM2:" -ForegroundColor Cyan
ssh -i $KeyFile "${ServerUser}@${ServerIP}" "pm2 list"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ✅ DESPLIEGUE COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Accede a: https://archivoenlinea.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️ IMPORTANTE: Limpieza de Caché del Navegador" -ForegroundColor Yellow
Write-Host ""
Write-Host "Si no ves la nueva versión:" -ForegroundColor White
Write-Host "1. Presiona Ctrl+Shift+Delete (Windows) o Cmd+Shift+Delete (Mac)" -ForegroundColor White
Write-Host "2. Selecciona 'Imágenes y archivos en caché'" -ForegroundColor White
Write-Host "3. Selecciona 'Todo el tiempo'" -ForegroundColor White
Write-Host "4. Haz clic en 'Borrar datos'" -ForegroundColor White
Write-Host "5. Cierra TODAS las pestañas de archivoenlinea.com" -ForegroundColor White
Write-Host "6. Abre una ventana de incógnito" -ForegroundColor White
Write-Host "7. Accede a https://archivoenlinea.com" -ForegroundColor White
Write-Host ""
Write-Host "O accede a: https://archivoenlinea.com/FORZAR_ACTUALIZACION_V37.html" -ForegroundColor Cyan
Write-Host ""
