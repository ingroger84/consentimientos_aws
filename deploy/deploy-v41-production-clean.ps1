# Script de Despliegue V41.0.0 - Limpieza Completa de Perfiles
# Servidor: AWS DatAgree (100.28.198.249)

$ErrorActionPreference = "Stop"

# Configuracion
$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "../AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"
$VERSION = "41.0.0"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE V41.0.0 - RESTAURACION COMPLETA SIN PERFILES" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Crear backup del codigo actual en produccion
Write-Host "[1/8] Creando backup del codigo actual en produccion..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "cd $REMOTE_PATH && BACKUP_DIR=backend-backup-v41-`$(date +%Y%m%d-%H%M%S) && echo Creando backup en: `$BACKUP_DIR && cp -r backend `$BACKUP_DIR && echo OK: Backup creado: `$BACKUP_DIR"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al crear backup" -ForegroundColor Red
    exit 1
}

# Paso 2: Subir archivos compilados del backend
Write-Host "[2/8] Subiendo backend compilado v41.0.0..." -ForegroundColor Yellow
scp -i $KEY -r ../backend/dist/* ${USER}@${SERVER}:${REMOTE_PATH}/backend/dist/

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al subir backend" -ForegroundColor Red
    exit 1
}

# Paso 3: Subir package.json actualizado
Write-Host "[3/8] Subiendo package.json..." -ForegroundColor Yellow
scp -i $KEY ../backend/package.json ${USER}@${SERVER}:${REMOTE_PATH}/backend/

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al subir package.json" -ForegroundColor Red
    exit 1
}

# Paso 4: Subir script de limpieza SQL
Write-Host "[4/8] Subiendo script de limpieza de base de datos..." -ForegroundColor Yellow
scp -i $KEY ../backend/migrations/cleanup-profiles-production.sql ${USER}@${SERVER}:${REMOTE_PATH}/backend/migrations/

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al subir script SQL" -ForegroundColor Red
    exit 1
}

# Paso 5: Ejecutar limpieza de base de datos
Write-Host "[5/8] Ejecutando limpieza de base de datos..." -ForegroundColor Yellow
Write-Host "IMPORTANTE: Esto eliminara TODAS las tablas de perfiles" -ForegroundColor Red
$confirm = Read-Host "Desea continuar? (S/N)"

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Despliegue cancelado por el usuario" -ForegroundColor Red
    exit 1
}

ssh -i $KEY ${USER}@${SERVER} "cd $REMOTE_PATH/backend/migrations && echo Ejecutando limpieza de base de datos... && PGPASSWORD='DataGree2026!Secure' psql -h localhost -U datagree_admin -d consentimientos -f cleanup-profiles-production.sql && echo OK: Base de datos limpiada"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al limpiar base de datos" -ForegroundColor Red
    Write-Host "El backend NO ha sido reiniciado. Puede restaurar el backup si es necesario." -ForegroundColor Yellow
    exit 1
}

# Paso 6: Reiniciar PM2
Write-Host "[6/8] Reiniciando PM2..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "cd $REMOTE_PATH && pm2 restart datagree && sleep 3 && pm2 list"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al reiniciar PM2" -ForegroundColor Red
    exit 1
}

# Paso 7: Verificar logs
Write-Host "[7/8] Verificando logs del backend..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "pm2 logs datagree --lines 30 --nostream"

# Paso 8: Verificar version
Write-Host "[8/8] Verificando version desplegada..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "cd $REMOTE_PATH/backend && cat package.json | grep version"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "OK: DESPLIEGUE V41.0.0 COMPLETADO" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "1. Verificar que el backend esta corriendo: pm2 list" -ForegroundColor White
Write-Host "2. Probar login en: https://admin.archivoenlinea.com" -ForegroundColor White
Write-Host "3. Verificar que NO aparece el menu de perfiles" -ForegroundColor White
Write-Host "4. Probar crear historias clinicas y admisiones" -ForegroundColor White
Write-Host ""
