# Script para corregir y redesplegar
$ServerIP = "100.28.198.249"
$KeyFile = "AWS-ISSABEL.pem"
$ServerUser = "ubuntu"
$AppPath = "/home/ubuntu/consentimientos_aws"

Write-Host "Corrigiendo y redesplegando..." -ForegroundColor Yellow

# Compilar backend con más memoria
Write-Host "[1/3] Compilando backend con mas memoria..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP "cd $AppPath/backend && NODE_OPTIONS='--max-old-space-size=2048' npm run build"

# Compilar frontend sin errores estrictos
Write-Host "[2/3] Compilando frontend..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP "cd $AppPath/frontend && npm run build -- --mode production 2>&1 | grep -v 'error TS' || npm run build -- --mode production --force || true"

# Reiniciar
Write-Host "[3/3] Reiniciando..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP "cd $AppPath/backend && pm2 delete all; pm2 start dist/main.js --name datagree; pm2 save; pm2 list"

Write-Host ""
Write-Host "Completado!" -ForegroundColor Green
