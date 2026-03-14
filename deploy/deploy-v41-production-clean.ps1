# ============================================================================
# SCRIPT DE DESPLIEGUE V41.0.0 - LIMPIEZA COMPLETA DE PERFILES
# ============================================================================
# Descripción: Restaura el sistema a v41.0.0 (sin perfiles)
# Fecha: 2026-03-14
# Servidor: AWS DatAgree (100.28.198.249)
# ============================================================================

$ErrorActionPreference = "Stop"

# Configuración
$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"
$VERSION = "41.0.0"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE V41.0.0 - RESTAURACIÓN COMPLETA SIN PERFILES" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Crear backup del código actual en producción
Write-Host "[1/8] Creando backup del código actual en producción..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} @"
cd $REMOTE_PATH
BACKUP_DIR=`"backend-backup-v41-`$(date +%Y%m%d-%H%M%S)`"
echo `"Creando backup en: `$BACKUP_DIR`"
cp -r backend `$BACKUP_DIR
echo `"✅ Backup creado: `$BACKUP_DIR`"
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al crear backup" -ForegroundColor Red
    exit 1
}

# Paso 2: Subir archivos compilados del backend
Write-Host "[2/8] Subiendo backend compilado v41.0.0..." -ForegroundColor Yellow
scp -i $KEY -r backend/dist/* ${USER}@${SERVER}:${REMOTE_PATH}/backend/dist/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir backend" -ForegroundColor Red
    exit 1
}

# Paso 3: Subir package.json actualizado
Write-Host "[3/8] Subiendo package.json..." -ForegroundColor Yellow
scp -i $KEY backend/package.json ${USER}@${SERVER}:${REMOTE_PATH}/backend/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir package.json" -ForegroundColor Red
    exit 1
}

# Paso 4: Subir script de limpieza SQL
Write-Host "[4/8] Subiendo script de limpieza de base de datos..." -ForegroundColor Yellow
scp -i $KEY backend/migrations/cleanup-profiles-production.sql ${USER}@${SERVER}:${REMOTE_PATH}/backend/migrations/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir script SQL" -ForegroundColor Red
    exit 1
}

# Paso 5: Ejecutar limpieza de base de datos
Write-Host "[5/8] Ejecutando limpieza de base de datos..." -ForegroundColor Yellow
Write-Host "⚠️  IMPORTANTE: Esto eliminará TODAS las tablas de perfiles" -ForegroundColor Red
$confirm = Read-Host "¿Desea continuar? (S/N)"

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "❌ Despliegue cancelado por el usuario" -ForegroundColor Red
    exit 1
}

ssh -i $KEY ${USER}@${SERVER} @"
cd $REMOTE_PATH/backend/migrations
echo `"Ejecutando limpieza de base de datos...`"
PGPASSWORD='DataGree2026!Secure' psql -h localhost -U datagree_admin -d consentimientos -f cleanup-profiles-production.sql
echo `"✅ Base de datos limpiada`"
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al limpiar base de datos" -ForegroundColor Red
    Write-Host "⚠️  El backend NO ha sido reiniciado. Puede restaurar el backup si es necesario." -ForegroundColor Yellow
    exit 1
}

# Paso 6: Reiniciar PM2
Write-Host "[6/8] Reiniciando PM2..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} @"
cd $REMOTE_PATH
pm2 restart datagree
sleep 3
pm2 list
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al reiniciar PM2" -ForegroundColor Red
    exit 1
}

# Paso 7: Verificar logs
Write-Host "[7/8] Verificando logs del backend..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "pm2 logs datagree --lines 30 --nostream"

# Paso 8: Verificar versión
Write-Host "[8/8] Verificando versión desplegada..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} @"
cd $REMOTE_PATH/backend
cat package.json | grep version
"@

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "✅ DESPLIEGUE V41.0.0 COMPLETADO" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Verificar que el backend está corriendo: pm2 list" -ForegroundColor White
Write-Host "2. Probar login en: https://admin.archivoenlinea.com" -ForegroundColor White
Write-Host "3. Verificar que NO aparece el menú de perfiles" -ForegroundColor White
Write-Host "4. Probar crear historias clínicas y admisiones" -ForegroundColor White
Write-Host ""
Write-Host "Si hay problemas, restaurar backup:" -ForegroundColor Yellow
Write-Host "ssh -i $KEY ${USER}@${SERVER}" -ForegroundColor White
Write-Host "cd $REMOTE_PATH" -ForegroundColor White
Write-Host "rm -rf backend/dist" -ForegroundColor White
Write-Host "cp -r backend-backup-v41-YYYYMMDD-HHMMSS/dist backend/" -ForegroundColor White
Write-Host "pm2 restart datagree" -ForegroundColor White
Write-Host ""
