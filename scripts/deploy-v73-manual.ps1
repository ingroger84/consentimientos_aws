# Script de despliegue V73 - Manual (sin zip)
$ErrorActionPreference = "Stop"

Write-Host "=== DESPLIEGUE V73: SEDES SUPER ADMIN ===" -ForegroundColor Cyan

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

Write-Host "5. Desplegando en el servidor..." -ForegroundColor Yellow
ssh -i $KEY_FILE "${SERVER_USER}@${SERVER_IP}" "cd $REMOTE_PATH && rm -rf backend/dist && mv backend-dist-temp backend/dist && rm -rf frontend/dist && mv frontend-dist-temp frontend/dist && pm2 restart datagree && sleep 3 && pm2 status datagree"

if ($LASTEXITCODE -ne 0) { Write-Host "Error en despliegue" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "=== DESPLIEGUE V73 COMPLETADO ===" -ForegroundColor Green
Write-Host ""
Write-Host "CAMBIOS APLICADOS:" -ForegroundColor Cyan
Write-Host "1. Super Admin ahora puede ver y asignar sedes de tenants" -ForegroundColor Green
Write-Host ""
Write-Host "PRUEBAS:" -ForegroundColor Yellow
Write-Host "1. Login como Super Admin" -ForegroundColor White
Write-Host "2. Ir a Usuarios Sistema" -ForegroundColor White
Write-Host "3. Editar un usuario de Demo Estetica" -ForegroundColor White
Write-Host "4. Verificar que ahora se muestren las sedes del tenant" -ForegroundColor White
Write-Host "5. Asignar/desasignar sedes y guardar" -ForegroundColor White
