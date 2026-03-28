# ============================================================================
# Fix NGINX CORS - V41.1.6
# Fecha: 2026-03-15
# Propósito: Configurar NGINX para pasar headers CORS del backend al cliente
# ============================================================================

$ErrorActionPreference = "Stop"

$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "FIX NGINX CORS - Configuracion" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Backup de la configuración actual
Write-Host "1. Creando backup de configuracion NGINX..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
ssh -i $KEY $SERVER "sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup-$timestamp"
Write-Host "Backup creado: default.backup-$timestamp" -ForegroundColor Green

# 2. Subir nueva configuración
Write-Host ""
Write-Host "2. Subiendo nueva configuracion NGINX..." -ForegroundColor Yellow
scp -i $KEY config/nginx/nginx-cors-fix.conf "${SERVER}:/tmp/nginx-default"
Write-Host "Configuracion subida" -ForegroundColor Green

# 3. Mover configuración a su lugar
Write-Host ""
Write-Host "3. Aplicando configuracion..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "sudo mv /tmp/nginx-default /etc/nginx/sites-available/default"
Write-Host "Configuracion aplicada" -ForegroundColor Green

# 4. Verificar sintaxis de NGINX
Write-Host ""
Write-Host "4. Verificando sintaxis de NGINX..." -ForegroundColor Yellow
$nginxTest = ssh -i $KEY $SERVER "sudo nginx -t 2>&1"
Write-Host $nginxTest
if ($nginxTest -match "syntax is ok" -and $nginxTest -match "test is successful") {
    Write-Host "Sintaxis correcta" -ForegroundColor Green
} else {
    Write-Host "ERROR: Sintaxis incorrecta. Restaurando backup..." -ForegroundColor Red
    ssh -i $KEY $SERVER "sudo cp /etc/nginx/sites-available/default.backup-$timestamp /etc/nginx/sites-available/default"
    Write-Host "Backup restaurado" -ForegroundColor Yellow
    exit 1
}

# 5. Recargar NGINX
Write-Host ""
Write-Host "5. Recargando NGINX..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "sudo systemctl reload nginx"
Write-Host "NGINX recargado" -ForegroundColor Green

# 6. Verificar estado de NGINX
Write-Host ""
Write-Host "6. Verificando estado de NGINX..." -ForegroundColor Yellow
$nginxStatus = ssh -i $KEY $SERVER "sudo systemctl status nginx | grep Active"
Write-Host $nginxStatus
if ($nginxStatus -match "active \(running\)") {
    Write-Host "NGINX funcionando correctamente" -ForegroundColor Green
} else {
    Write-Host "ADVERTENCIA: NGINX no esta corriendo correctamente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "FIX NGINX CORS COMPLETADO" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PRUEBA AHORA:" -ForegroundColor Yellow
Write-Host "1. Ir a: https://demo-medico.archivoenlinea.com" -ForegroundColor White
Write-Host "2. Abrir DevTools (F12) -> Network" -ForegroundColor White
Write-Host "3. Intentar crear una historia clinica" -ForegroundColor White
Write-Host "4. Verificar que NO aparezca error de CORS" -ForegroundColor White
Write-Host "5. Verificar que la peticion tenga headers:" -ForegroundColor White
Write-Host "   - Access-Control-Allow-Origin: https://demo-medico.archivoenlinea.com" -ForegroundColor Gray
Write-Host "   - Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS" -ForegroundColor Gray
Write-Host ""
