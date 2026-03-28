# Script para desplegar la herramienta de prueba de Bold en producción
# Fecha: 22 de Marzo 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE HERRAMIENTA TEST BOLD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"
$NGINX_PATH = "/home/ubuntu/consentimientos_aws/frontend/dist"

Write-Host "1. Copiando herramienta HTML al servidor..." -ForegroundColor Yellow
scp -i $KEY test-bold-connection.html ${SERVER}:${REMOTE_PATH}/

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al copiar archivo" -ForegroundColor Red
    exit 1
}

Write-Host "   ✓ Archivo copiado exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "2. Moviendo archivo a directorio web público..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "cp ${REMOTE_PATH}/test-bold-connection.html ${NGINX_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al mover archivo" -ForegroundColor Red
    exit 1
}

Write-Host "3. Configurando permisos..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "chmod 644 ${NGINX_PATH}/test-bold-connection.html"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al configurar permisos" -ForegroundColor Red
    exit 1
}

Write-Host "   ✓ Archivo desplegado en Nginx" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "La herramienta está disponible en:" -ForegroundColor Cyan
Write-Host "https://archivoenlinea.com/test-bold-connection.html" -ForegroundColor White
Write-Host ""
Write-Host "O también en:" -ForegroundColor Cyan
Write-Host "http://100.28.198.249/test-bold-connection.html" -ForegroundColor White
Write-Host ""
