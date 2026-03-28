# Script de Despliegue V72 - Fix Text Overlap in CN PDFs (FINAL)
# Fecha: 2026-03-21

$ErrorActionPreference = "Stop"

Write-Host "=== DESPLIEGUE V72 - FIX TEXT OVERLAP FINAL ===" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"
$BACKUP_DIR = "backups/v72-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "1. Compilando backend..." -ForegroundColor Yellow
Set-Location ../backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en compilacion del backend" -ForegroundColor Red
    exit 1
}
Set-Location ../scripts
Write-Host "Backend compilado OK" -ForegroundColor Green

Write-Host ""
Write-Host "2. Compilando frontend..." -ForegroundColor Yellow
Set-Location ../frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en compilacion del frontend" -ForegroundColor Red
    exit 1
}
Set-Location ../scripts
Write-Host "Frontend compilado OK" -ForegroundColor Green

Write-Host ""
Write-Host "3. Creando backup en servidor..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "mkdir -p $REMOTE_PATH/$BACKUP_DIR/backend/dist && mkdir -p $REMOTE_PATH/$BACKUP_DIR/frontend/dist"
ssh -i $KEY $SERVER "cp -r $REMOTE_PATH/backend/dist/consents $REMOTE_PATH/$BACKUP_DIR/backend/dist/"
ssh -i $KEY $SERVER "cp -r $REMOTE_PATH/frontend/dist $REMOTE_PATH/$BACKUP_DIR/frontend/"
Write-Host "Backup creado OK" -ForegroundColor Green

Write-Host ""
Write-Host "4. Subiendo archivos al servidor..." -ForegroundColor Yellow
scp -i ../AWS-ISSABEL.pem ../backend/dist/consents/pdf.service.js "$SERVER`:$REMOTE_PATH/backend/dist/consents/"
scp -i ../AWS-ISSABEL.pem -r ../frontend/dist/* "$SERVER`:$REMOTE_PATH/frontend/dist/"
Write-Host "Archivos subidos OK" -ForegroundColor Green

Write-Host ""
Write-Host "5. Reiniciando servidor..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "cd $REMOTE_PATH && pm2 restart datagree"
Start-Sleep -Seconds 3
Write-Host "Servidor reiniciado OK" -ForegroundColor Green

Write-Host ""
Write-Host "6. Verificando estado..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "pm2 status datagree"

Write-Host ""
Write-Host "=== DESPLIEGUE V72 COMPLETADO ===" -ForegroundColor Green
Write-Host ""
Write-Host "CAMBIOS:" -ForegroundColor Cyan
Write-Host "- Respuestas usan wrapText para dividir texto largo" -ForegroundColor White
Write-Host "- Verificacion de espacio ANTES de dibujar cada linea" -ForegroundColor White
Write-Host "- Variable currentPage para referencia correcta" -ForegroundColor White
Write-Host ""
Write-Host "PRUEBA:" -ForegroundColor Yellow
Write-Host "Genera un nuevo CN con preguntas y respuestas largas" -ForegroundColor White
Write-Host ""
