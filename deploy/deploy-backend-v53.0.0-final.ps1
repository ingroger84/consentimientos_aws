# Script de Despliegue Backend v53.0.0
# Consolidación del Sistema de Perfiles
# Fecha: 2026-03-02

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 DESPLIEGUE BACKEND v53.0.0" -ForegroundColor Green
Write-Host "Consolidación del Sistema de Perfiles" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$VERSION = "53.0.0"
$SERVER_USER = "ubuntu"
$SERVER_HOST = "100.28.198.249"
$SERVER_PATH = "/home/ubuntu/consentimientos_aws/backend"
$KEY_PATH = "..\credentials\AWS-ISSABEL.pem"
$PACKAGE_NAME = "backend-dist-v$VERSION.tar.gz"

Write-Host "📋 Configuración:" -ForegroundColor Yellow
Write-Host "   Versión: $VERSION"
Write-Host "   Servidor: $SERVER_USER@$SERVER_HOST"
Write-Host "   Ruta: $SERVER_PATH"
Write-Host ""

# Paso 1: Compilar backend
Write-Host "📦 Paso 1: Compilando backend..." -ForegroundColor Yellow
Set-Location ..\backend
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilación exitosa" -ForegroundColor Green
} else {
    Write-Host "❌ Error en la compilación" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 2: Crear paquete
Write-Host "📦 Paso 2: Creando paquete de despliegue..." -ForegroundColor Yellow
tar -czf $PACKAGE_NAME dist/ node_modules/ package.json .env migrate-users-to-profiles.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Paquete creado: $PACKAGE_NAME" -ForegroundColor Green
    Get-Item $PACKAGE_NAME | Select-Object Name, Length
} else {
    Write-Host "❌ Error al crear paquete" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 3: Subir al servidor
Write-Host "📤 Paso 3: Subiendo paquete al servidor..." -ForegroundColor Yellow
scp -i $KEY_PATH $PACKAGE_NAME "${SERVER_USER}@${SERVER_HOST}:/home/ubuntu/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Paquete subido exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al subir paquete" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 4: Desplegar en servidor
Write-Host "🚀 Paso 4: Desplegando en servidor..." -ForegroundColor Yellow
$deployScript = @"
set -e
echo '📍 Navegando al directorio del backend...'
cd /home/ubuntu/consentimientos_aws/backend
echo '⏸️  Deteniendo aplicación...'
pm2 stop datagree || true
echo '📦 Extrayendo paquete...'
tar -xzf ~/backend-dist-v53.0.0.tar.gz
echo '🗑️  Limpiando paquete temporal...'
rm ~/backend-dist-v53.0.0.tar.gz
echo '✅ Despliegue completado'
"@

$deployScript | ssh -i $KEY_PATH "${SERVER_USER}@${SERVER_HOST}" bash

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Despliegue exitoso" -ForegroundColor Green
} else {
    Write-Host "❌ Error en el despliegue" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 5: Ejecutar migración de usuarios
Write-Host "🔄 Paso 5: Ejecutando migración de usuarios..." -ForegroundColor Yellow
$migrationScript = @"
set -e
cd /home/ubuntu/consentimientos_aws/backend
echo '🔄 Ejecutando script de migración...'
node migrate-users-to-profiles.js
"@

$migrationScript | ssh -i $KEY_PATH "${SERVER_USER}@${SERVER_HOST}" bash

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migración de usuarios completada" -ForegroundColor Green
} else {
    Write-Host "❌ Error en la migración de usuarios" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 6: Reiniciar aplicación
Write-Host "🔄 Paso 6: Reiniciando aplicación..." -ForegroundColor Yellow
$restartScript = @"
set -e
cd /home/ubuntu/consentimientos_aws/backend
echo '🔄 Reiniciando PM2...'
pm2 restart datagree
echo '💾 Guardando configuración PM2...'
pm2 save
echo '✅ Aplicación reiniciada'
"@

$restartScript | ssh -i $KEY_PATH "${SERVER_USER}@${SERVER_HOST}" bash

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Aplicación reiniciada exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al reiniciar aplicación" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 7: Verificar logs
Write-Host "📋 Paso 7: Verificando logs..." -ForegroundColor Yellow
ssh -i $KEY_PATH "${SERVER_USER}@${SERVER_HOST}" "pm2 logs datagree --lines 20 --nostream"
Write-Host ""

# Paso 8: Limpiar paquete local
Write-Host "🗑️  Paso 8: Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item $PACKAGE_NAME
Write-Host "✅ Archivos temporales eliminados" -ForegroundColor Green
Write-Host ""

# Resumen final
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ DESPLIEGUE COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Resumen:"
Write-Host "   ✅ Backend compilado"
Write-Host "   ✅ Paquete creado y subido"
Write-Host "   ✅ Aplicación desplegada"
Write-Host "   ✅ Migración de usuarios ejecutada"
Write-Host "   ✅ Aplicación reiniciada"
Write-Host "   ✅ Logs verificados"
Write-Host ""
Write-Host "🔗 Acceso:"
Write-Host "   Backend: https://api.datagree.co"
Write-Host "   Frontend: https://app.datagree.co"
Write-Host ""
Write-Host "📋 Monitoreo:"
Write-Host "   ssh -i $KEY_PATH ${SERVER_USER}@${SERVER_HOST}"
Write-Host "   pm2 logs datagree"
Write-Host "   pm2 status"
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
