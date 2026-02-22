# Script para aplicar permisos de admisiones en AWS
# Version: 38.1.19
# Fecha: 2026-02-19

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  APLICAR PERMISOS DE ADMISIONES - AWS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "../AWS-ISSABEL.pem"
$REMOTE_DIR = "/home/ubuntu/consentimientos_aws/backend"

# 1. Copiar script al servidor
Write-Host "Paso 1: Copiando script al servidor..." -ForegroundColor Yellow
scp -i $KEY ../backend/apply-admissions-permissions.js ${USER}@${SERVER}:${REMOTE_DIR}/

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al copiar el script" -ForegroundColor Red
    exit 1
}

Write-Host "Script copiado exitosamente" -ForegroundColor Green
Write-Host ""

# 2. Ejecutar script en el servidor
Write-Host "Paso 2: Ejecutando script en el servidor..." -ForegroundColor Yellow
Write-Host ""

ssh -i $KEY ${USER}@${SERVER} "cd ${REMOTE_DIR} ; node apply-admissions-permissions.js"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Error al ejecutar el script" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  PERMISOS APLICADOS EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "Los usuarios deben CERRAR SESION y volver a iniciar sesion" -ForegroundColor Yellow
Write-Host "para que los nuevos permisos surtan efecto." -ForegroundColor Yellow
Write-Host ""
