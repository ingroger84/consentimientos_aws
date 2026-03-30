# Script de Despliegue v79.1.0 - Correccion Permisos Super Admin
# Fecha: 2026-03-29

$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "DESPLIEGUE v79.1.0 - FIX SUPER ADMIN"
Write-Host "========================================"
Write-Host ""

$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$KEY_FILE = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

Write-Host "[1/5] Verificando conexion SSH..."
ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} "echo 'OK'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo conectar"
    exit 1
}
Write-Host "OK - Conexion exitosa"
Write-Host ""

Write-Host "[2/5] Subiendo archivos actualizados..."
scp -i $KEY_FILE backend/src/roles/entities/role.entity.ts ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/src/roles/entities/
scp -i $KEY_FILE backend/src/auth/strategies/jwt.strategy.ts ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/src/auth/strategies/
scp -i $KEY_FILE backend/src/auth/guards/permissions.guard.ts ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/src/auth/guards/
scp -i $KEY_FILE backend/src/config/version.ts ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/src/config/
Write-Host "OK - Archivos subidos"
Write-Host ""

Write-Host "[3/5] Compilando backend..."
ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} "cd $REMOTE_PATH/backend && npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo la compilacion"
    exit 1
}
Write-Host "OK - Backend compilado"
Write-Host ""

Write-Host "[4/5] Aplicando fix de permisos en BD..."
ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} "cd $REMOTE_PATH/backend && node fix-super-admin-permissions.js"
Write-Host "OK - Permisos actualizados"
Write-Host ""

Write-Host "[5/5] Reiniciando aplicacion..."
ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} "cd $REMOTE_PATH && pm2 restart datagree && sleep 3 && pm2 describe datagree | grep status"
Write-Host "OK - Aplicacion reiniciada"
Write-Host ""

Write-Host "========================================"
Write-Host "DESPLIEGUE COMPLETADO"
Write-Host "========================================"
Write-Host ""
Write-Host "INSTRUCCIONES:"
Write-Host "1. Cerrar TODAS las pestanas del navegador"
Write-Host "2. Limpiar cache: Ctrl+Shift+Del"
Write-Host "3. Abrir incognito: Ctrl+Shift+N"
Write-Host "4. Ir a: https://archivoenlinea.com/login"
Write-Host "5. Iniciar sesion y verificar acceso"
Write-Host ""
