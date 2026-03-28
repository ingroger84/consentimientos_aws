# Script de despliegue V74 - Configuracion de Horario de Backups
$ErrorActionPreference = "Stop"

Write-Host "=== DESPLIEGUE V74: CONFIGURACION HORARIO BACKUPS ===" -ForegroundColor Cyan

$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$KEY_FILE = "../AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

Write-Host "1. Compilando backend..." -ForegroundColor Yellow
cd ../backend
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Error compilando backend" -ForegroundColor Red; exit 1 }
Write-Host "Backend compilado" -ForegroundColor Green

Write-Host "2. Compilando frontend..." -ForegroundColor Yellow
cd ../frontend
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Error compilando frontend" -ForegroundColor Red; exit 1 }
Write-Host "Frontend compilado" -ForegroundColor Green

cd ../scripts

Write-Host "3. Subiendo backend dist al servidor..." -ForegroundColor Yellow
scp -i $KEY_FILE -r ../backend/dist "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend-dist-temp"
if ($LASTEXITCODE -ne 0) { Write-Host "Error subiendo backend" -ForegroundColor Red; exit 1 }

Write-Host "4. Subiendo frontend dist al servidor..." -ForegroundColor Yellow
scp -i $KEY_FILE -r ../frontend/dist "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/frontend-dist-temp"
if ($LASTEXITCODE -ne 0) { Write-Host "Error subiendo frontend" -ForegroundColor Red; exit 1 }

Write-Host "5. Subiendo script de actualizacion de horario..." -ForegroundColor Yellow
scp -i $KEY_FILE update-backup-schedule.sh "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/scripts/"
if ($LASTEXITCODE -ne 0) { Write-Host "Error subiendo script" -ForegroundColor Red; exit 1 }

Write-Host "6. Desplegando en el servidor..." -ForegroundColor Yellow
ssh -i $KEY_FILE "${SERVER_USER}@${SERVER_IP}" "cd $REMOTE_PATH && rm -rf backend/dist && mv backend-dist-temp backend/dist && rm -rf frontend/dist && mv frontend-dist-temp frontend/dist && chmod +x scripts/update-backup-schedule.sh && pm2 restart datagree && sleep 3 && pm2 status datagree"

if ($LASTEXITCODE -ne 0) { Write-Host "Error en despliegue" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "=== DESPLIEGUE V74 COMPLETADO ===" -ForegroundColor Green
Write-Host ""
Write-Host "CAMBIOS APLICADOS:" -ForegroundColor Cyan
Write-Host "1. Nuevo boton 'Configurar Horario' en pagina de Backups" -ForegroundColor Green
Write-Host "2. Modal para cambiar horarios de backups automaticos" -ForegroundColor Green
Write-Host "3. Script que actualiza crontab automaticamente" -ForegroundColor Green
Write-Host ""
Write-Host "PRUEBAS:" -ForegroundColor Yellow
Write-Host "1. Login como Super Admin" -ForegroundColor White
Write-Host "2. Ir a Sistema > Backups" -ForegroundColor White
Write-Host "3. Click en 'Configurar Horario'" -ForegroundColor White
Write-Host "4. Cambiar los horarios (ej: 14:00 y 20:00)" -ForegroundColor White
Write-Host "5. Guardar y verificar que el mensaje muestre los nuevos horarios" -ForegroundColor White
