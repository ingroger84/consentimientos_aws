# ============================================================================
# Script de Despliegue - Sistema de Admisiones v39.0.0
# Fecha: 2026-02-18
# Descripción: Despliega el sistema de admisiones múltiples para HC
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE SISTEMA DE ADMISIONES" -ForegroundColor Cyan
Write-Host "  Versión 39.0.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"
$DB_NAME = "consentimientos_db"
$DB_USER = "postgres"

# ============================================================================
# PASO 1: COMPILAR FRONTEND
# ============================================================================
Write-Host "[1/6] Compilando frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar frontend" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✓ Frontend compilado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 2: COMPILAR BACKEND
# ============================================================================
Write-Host "[2/6] Compilando backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar backend" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✓ Backend compilado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 3: APLICAR MIGRACIÓN SQL
# ============================================================================
Write-Host "[3/6] Aplicando migración SQL..." -ForegroundColor Yellow
Write-Host "Subiendo archivo de migración al servidor..." -ForegroundColor Gray

scp -i $KEY backend/migrations/add-admissions-system.sql ${SERVER}:${REMOTE_PATH}/backend/migrations/

Write-Host "Ejecutando migración en base de datos..." -ForegroundColor Gray
ssh -i $KEY $SERVER @"
cd $REMOTE_PATH
PGPASSWORD=\`cat backend/.env | grep DB_PASSWORD | cut -d '=' -f2\` psql -h localhost -U $DB_USER -d $DB_NAME -f backend/migrations/add-admissions-system.sql
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al aplicar migración SQL" -ForegroundColor Red
    Write-Host "Revise los logs del servidor para más detalles" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Migración SQL aplicada" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 4: DESPLEGAR BACKEND
# ============================================================================
Write-Host "[4/6] Desplegando backend..." -ForegroundColor Yellow

# Eliminar dist antiguo
Write-Host "Eliminando archivos antiguos..." -ForegroundColor Gray
ssh -i $KEY $SERVER "rm -rf $REMOTE_PATH/backend/dist"

# Subir nuevo dist
Write-Host "Subiendo archivos nuevos..." -ForegroundColor Gray
scp -i $KEY -r backend/dist ${SERVER}:${REMOTE_PATH}/backend/

# Subir nuevas entidades y servicios
Write-Host "Subiendo código fuente actualizado..." -ForegroundColor Gray
scp -i $KEY -r backend/src/medical-records ${SERVER}:${REMOTE_PATH}/backend/src/

# Reiniciar PM2
Write-Host "Reiniciando servicio backend..." -ForegroundColor Gray
ssh -i $KEY $SERVER "cd $REMOTE_PATH/backend && pm2 restart datagree"

Write-Host "✓ Backend desplegado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 5: DESPLEGAR FRONTEND
# ============================================================================
Write-Host "[5/6] Desplegando frontend..." -ForegroundColor Yellow

# Eliminar dist antiguo
Write-Host "Eliminando archivos antiguos..." -ForegroundColor Gray
ssh -i $KEY $SERVER "rm -rf $REMOTE_PATH/frontend/dist/*"

# Subir nuevo dist
Write-Host "Subiendo archivos nuevos..." -ForegroundColor Gray
scp -i $KEY -r frontend/dist/* ${SERVER}:${REMOTE_PATH}/frontend/dist/

# Reiniciar nginx
Write-Host "Reiniciando nginx..." -ForegroundColor Gray
ssh -i $KEY $SERVER "sudo systemctl restart nginx"

Write-Host "✓ Frontend desplegado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 6: VERIFICACIÓN
# ============================================================================
Write-Host "[6/6] Verificando despliegue..." -ForegroundColor Yellow

# Verificar backend
Write-Host "Verificando backend..." -ForegroundColor Gray
$backendVersion = ssh -i $KEY $SERVER "curl -s http://localhost:3000/api/version | grep -o '\"version\":\"[^\"]*' | cut -d'\"' -f4"
Write-Host "  Versión backend: $backendVersion" -ForegroundColor Gray

# Verificar frontend
Write-Host "Verificando frontend..." -ForegroundColor Gray
$frontendVersion = ssh -i $KEY $SERVER "cat $REMOTE_PATH/frontend/dist/version.json | grep -o '\"version\":\"[^\"]*' | cut -d'\"' -f4"
Write-Host "  Versión frontend: $frontendVersion" -ForegroundColor Gray

# Verificar tabla admissions
Write-Host "Verificando tabla admissions..." -ForegroundColor Gray
$admissionsCount = ssh -i $KEY $SERVER @"
PGPASSWORD=\`cat $REMOTE_PATH/backend/.env | grep DB_PASSWORD | cut -d '=' -f2\` psql -h localhost -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM admissions;"
"@
Write-Host "  Admisiones en BD: $admissionsCount" -ForegroundColor Gray

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Versión desplegada: 39.0.0" -ForegroundColor Cyan
Write-Host "Sistema de Admisiones: ACTIVO" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "  - Frontend: https://archivoenlinea.com" -ForegroundColor Gray
Write-Host "  - Admin: https://admin.archivoenlinea.com" -ForegroundColor Gray
Write-Host "  - API: https://archivoenlinea.com/api" -ForegroundColor Gray
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Verificar que la página de crear HC muestra el modal de admisiones" -ForegroundColor Gray
Write-Host "  2. Crear una nueva admisión para un paciente existente" -ForegroundColor Gray
Write-Host "  3. Verificar que los registros se vinculan correctamente a la admisión" -ForegroundColor Gray
Write-Host ""
