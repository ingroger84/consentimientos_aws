# Script de Despliegue Backend v53.0.0
# Consolidacion del Sistema de Perfiles
# Fecha: 2026-03-02
# Version sin emojis para compatibilidad con PowerShell

$ErrorActionPreference = "Stop"

Write-Host "=========================================="
Write-Host "DESPLIEGUE BACKEND v53.0.0"
Write-Host "Consolidacion del Sistema de Perfiles"
Write-Host "=========================================="
Write-Host ""

# Variables
$VERSION = "53.0.0"
$SERVER_USER = "ubuntu"
$SERVER_HOST = "100.28.198.249"
$SERVER_PATH = "/home/ubuntu/consentimientos_aws/backend"
$KEY_PATH = "..\credentials\AWS-ISSABEL.pem"
$PACKAGE_NAME = "backend-dist-v$VERSION.tar.gz"

Write-Host "[INFO] Configuracion:" -ForegroundColor Yellow
Write-Host "   Version: $VERSION"
Write-Host "   Servidor: $SERVER_USER@$SERVER_HOST"
Write-Host "   Ruta: $SERVER_PATH"
Write-Host ""

# Paso 1: Compilar backend
Write-Host "[PASO 1] Compilando backend..." -ForegroundColor Yellow
Set-Location ..\backend

try {
    npm run build
    Write-Host "[OK] Compilacion exitosa" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error en la compilacion" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 2: Crear paquete
Write-Host "[PASO 2] Creando paquete de despliegue..." -ForegroundColor Yellow

try {
    # Usar tar de Windows 10+ o Git Bash - solo archivos que existen
    tar -czf $PACKAGE_NAME dist/ node_modules/ package.json .env migrate-users-to-profiles.js
    
    Write-Host "[OK] Paquete creado: $PACKAGE_NAME" -ForegroundColor Green
    Get-ChildItem $PACKAGE_NAME | Format-Table Name, Length, LastWriteTime
} catch {
    Write-Host "[ERROR] Error al crear paquete" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 3: Subir al servidor
Write-Host "[PASO 3] Subiendo paquete al servidor..." -ForegroundColor Yellow

try {
    scp -i $KEY_PATH $PACKAGE_NAME "${SERVER_USER}@${SERVER_HOST}:/home/ubuntu/"
    Write-Host "[OK] Paquete subido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error al subir paquete" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 4: Desplegar en servidor
Write-Host "[PASO 4] Desplegando en servidor..." -ForegroundColor Yellow

$deployScript = @"
set -e
echo '[INFO] Navegando al directorio del backend...'
cd /home/ubuntu/consentimientos_aws/backend

echo '[INFO] Deteniendo aplicacion...'
pm2 stop datagree || true

echo '[INFO] Extrayendo paquete...'
tar -xzf ~/backend-dist-v53.0.0.tar.gz

echo '[INFO] Limpiando paquete temporal...'
rm ~/backend-dist-v53.0.0.tar.gz

echo '[OK] Despliegue completado'
"@

try {
    $deployScript | ssh -i $KEY_PATH "${SERVER_USER}@${SERVER_HOST}" "bash -s"
    Write-Host "[OK] Despliegue exitoso" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error en el despliegue" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 5: Ejecutar migracion de usuarios
Write-Host "[PASO 5] Ejecutando migracion de usuarios..." -ForegroundColor Yellow

$migrationScript = @"
set -e
cd /home/ubuntu/consentimientos_aws/backend

echo '[INFO] Ejecutando script de migracion...'
node migrate-users-to-profiles.js

if [ \$? -eq 0 ]; then
    echo '[OK] Migracion completada'
else
    echo '[ERROR] Error en la migracion'
    exit 1
fi
"@

try {
    $migrationScript | ssh -i $KEY_PATH "${SERVER_USER}@${SERVER_HOST}" "bash -s"
    Write-Host "[OK] Migracion de usuarios completada" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error en la migracion de usuarios" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 6: Reiniciar aplicacion
Write-Host "[PASO 6] Reiniciando aplicacion..." -ForegroundColor Yellow

$restartScript = @"
set -e
cd /home/ubuntu/consentimientos_aws/backend

echo '[INFO] Reiniciando PM2...'
pm2 restart datagree

echo '[INFO] Guardando configuracion PM2...'
pm2 save

echo '[OK] Aplicacion reiniciada'
"@

try {
    $restartScript | ssh -i $KEY_PATH "${SERVER_USER}@${SERVER_HOST}" "bash -s"
    Write-Host "[OK] Aplicacion reiniciada exitosamente" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error al reiniciar aplicacion" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 7: Verificar logs
Write-Host "[PASO 7] Verificando logs..." -ForegroundColor Yellow

$logsScript = @"
echo '[INFO] Ultimas 20 lineas de logs:'
pm2 logs datagree --lines 20 --nostream
"@

$logsScript | ssh -i $KEY_PATH "${SERVER_USER}@${SERVER_HOST}" "bash -s"
Write-Host ""

# Paso 8: Limpiar paquete local
Write-Host "[PASO 8] Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item $PACKAGE_NAME -Force
Write-Host "[OK] Archivos temporales eliminados" -ForegroundColor Green
Write-Host ""

# Resumen final
Write-Host "=========================================="
Write-Host "[OK] DESPLIEGUE COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "=========================================="
Write-Host ""
Write-Host "Resumen:"
Write-Host "   [OK] Backend compilado"
Write-Host "   [OK] Paquete creado y subido"
Write-Host "   [OK] Aplicacion desplegada"
Write-Host "   [OK] Migracion de usuarios ejecutada"
Write-Host "   [OK] Aplicacion reiniciada"
Write-Host "   [OK] Logs verificados"
Write-Host ""
Write-Host "Acceso:"
Write-Host "   Backend: https://api.datagree.co"
Write-Host "   Frontend: https://app.datagree.co"
Write-Host ""
Write-Host "Monitoreo:"
Write-Host "   ssh -i $KEY_PATH ${SERVER_USER}@${SERVER_HOST}"
Write-Host "   pm2 logs datagree"
Write-Host "   pm2 status"
Write-Host ""
Write-Host "=========================================="
