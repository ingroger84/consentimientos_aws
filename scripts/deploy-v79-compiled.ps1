# Script de Despliegue v79.1.0 - Subir codigo compilado
# Fecha: 2026-03-29

$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "DESPLIEGUE v79.1.0 - CODIGO COMPILADO"
Write-Host "========================================"
Write-Host ""

$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$KEY_FILE = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

Write-Host "[1/6] Verificando conexion SSH..."
ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} "echo 'OK'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo conectar"
    exit 1
}
Write-Host "OK"
Write-Host ""

Write-Host "[2/6] Creando backup del dist actual..."
ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} "cd $REMOTE_PATH/backend && cp -r dist dist.backup.v76 2>/dev/null || true"
Write-Host "OK"
Write-Host ""

Write-Host "[3/6] Subiendo codigo compilado..."
scp -i $KEY_FILE -r backend/dist ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo la subida de archivos"
    exit 1
}
Write-Host "OK"
Write-Host ""

Write-Host "[4/6] Subiendo script de correccion..."
scp -i $KEY_FILE backend/fix-super-admin-permissions-v2.js ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/
Write-Host "OK"
Write-Host ""

Write-Host "[5/6] Ejecutando correccion de permisos..."
ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} "cd $REMOTE_PATH/backend && node fix-super-admin-permissions-v2.js"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo la correccion"
    exit 1
}
Write-Host "OK"
Write-Host ""

Write-Host "[6/6] Reiniciando aplicacion..."
ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} "cd $REMOTE_PATH && pm2 restart datagree && sleep 5"
Write-Host "OK"
Write-Host ""

Write-Host "Verificando estado..."
ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} "pm2 describe datagree | grep -E 'status|version|uptime'"
Write-Host ""

Write-Host "========================================"
Write-Host "DESPLIEGUE COMPLETADO"
Write-Host "========================================"
Write-Host ""
Write-Host "INSTRUCCIONES PARA EL USUARIO:"
Write-Host "1. Cerrar TODAS las pestanas del navegador"
Write-Host "2. Limpiar cache: Ctrl+Shift+Del"
Write-Host "3. Abrir incognito: Ctrl+Shift+N"
Write-Host "4. Ir a: https://archivoenlinea.com/login"
Write-Host "5. Iniciar sesion con: rcaraballo@innovasystems.com.co"
Write-Host "6. Verificar acceso a Gestion de Tenants (10 tenants)"
Write-Host ""
