# ============================================================================
# Script de correccion definitiva del constraint de record_number
# Version: 41.1.5
# Fecha: 2026-03-15
# ============================================================================

$ErrorActionPreference = "Stop"

$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "CORRECCION DEFINITIVA: Constraint record_number por tenant" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Compilar backend localmente
Write-Host "1. Compilando backend localmente..." -ForegroundColor Yellow
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar backend" -ForegroundColor Red
    exit 1
}
Write-Host "Backend compilado correctamente" -ForegroundColor Green
Set-Location ..

# 2. Crear backup del backend actual en produccion
Write-Host ""
Write-Host "2. Creando backup en produccion..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupName = "backend-backup-v41-fix-constraint-$timestamp"

$backupScript = @"
cd $REMOTE_PATH
if [ -d backend/dist ]; then
    cp -r backend/dist $backupName
    echo 'Backup creado: $backupName'
else
    echo 'No hay dist para respaldar'
fi
"@

ssh -i $KEY $SERVER $backupScript

# 3. Subir archivos actualizados
Write-Host ""
Write-Host "3. Subiendo archivos actualizados..." -ForegroundColor Yellow

# Subir dist compilado
Write-Host "   - Subiendo backend/dist..." -ForegroundColor Gray
scp -i $KEY -r backend/dist/* "${SERVER}:${REMOTE_PATH}/backend/dist/"

# Subir entidad corregida
Write-Host "   - Subiendo entidad corregida..." -ForegroundColor Gray
scp -i $KEY backend/src/medical-records/entities/medical-record.entity.ts "${SERVER}:${REMOTE_PATH}/backend/src/medical-records/entities/"

# Subir script de migracion
Write-Host "   - Subiendo script de migracion..." -ForegroundColor Gray
scp -i $KEY backend/migrations/fix-record-number-constraint-final.sql "${SERVER}:${REMOTE_PATH}/backend/migrations/"

# Subir script de verificacion
Write-Host "   - Subiendo script de verificacion..." -ForegroundColor Gray
scp -i $KEY backend/verify-constraints-production.js "${SERVER}:${REMOTE_PATH}/backend/"

Write-Host "Archivos subidos correctamente" -ForegroundColor Green

# 4. Ejecutar migracion en produccion
Write-Host ""
Write-Host "4. Ejecutando migracion en base de datos..." -ForegroundColor Yellow

$migrationScript = @"
cd $REMOTE_PATH/backend
export PGPASSWORD='DataGree2026!Secure'
psql -h localhost -U datagree_admin -d consentimientos -f migrations/fix-record-number-constraint-final.sql
"@

ssh -i $KEY $SERVER $migrationScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al ejecutar migracion" -ForegroundColor Red
    exit 1
}
Write-Host "Migracion ejecutada correctamente" -ForegroundColor Green

# 5. Verificar constraints
Write-Host ""
Write-Host "5. Verificando constraints..." -ForegroundColor Yellow

$verifyScript = @"
cd $REMOTE_PATH/backend
node verify-constraints-production.js
"@

ssh -i $KEY $SERVER $verifyScript

# 6. Reiniciar PM2
Write-Host ""
Write-Host "6. Reiniciando PM2..." -ForegroundColor Yellow

$restartScript = @"
cd $REMOTE_PATH
pm2 restart ecosystem.config.js
sleep 3
pm2 status
"@

ssh -i $KEY $SERVER $restartScript

Write-Host "PM2 reiniciado correctamente" -ForegroundColor Green

# 7. Verificar logs
Write-Host ""
Write-Host "7. Verificando logs..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "pm2 logs --lines 30 --nostream"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "CORRECCION COMPLETADA" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Probar crear HC en demo-medico.archivoenlinea.com" -ForegroundColor White
Write-Host "2. Verificar que no aparezca el error de duplicate key" -ForegroundColor White
Write-Host "3. Probar crear HC con el mismo numero en diferentes tenants" -ForegroundColor White
Write-Host ""
Write-Host "Si el error persiste:" -ForegroundColor Yellow
Write-Host "- Ejecutar verificacion: ssh -i $KEY $SERVER 'cd $REMOTE_PATH/backend && node verify-constraints-production.js'" -ForegroundColor White
Write-Host "- Revisar logs: ssh -i $KEY $SERVER 'pm2 logs --lines 50'" -ForegroundColor White
Write-Host ""
