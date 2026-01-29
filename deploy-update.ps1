# Script para actualizar servidor DatAgree existente
$ErrorActionPreference = "Stop"

$ServerIP = "100.28.198.249"
$KeyFile = "AWS-ISSABEL.pem"
$ServerUser = "ubuntu"
$AppPath = "/home/ubuntu/consentimientos_aws"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ACTUALIZANDO SERVIDOR DATAGREE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Backup
Write-Host "[1/7] Creando backup..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP "cd $AppPath && sudo -u postgres pg_dump consentimientos > backup_`$(date +%Y%m%d_%H%M%S).sql 2>/dev/null || echo 'Backup omitido'"

# Paso 2: Detener app
Write-Host "[2/7] Deteniendo aplicacion..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP "pm2 stop all"

# Paso 3: Actualizar codigo
Write-Host "[3/7] Actualizando codigo..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP "cd $AppPath && git fetch && git reset --hard origin/main && git pull"

# Paso 4: Backend
Write-Host "[4/7] Actualizando backend..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP "cd $AppPath/backend && npm install && npm run build"

# Paso 5: Migraciones
Write-Host "[5/7] Ejecutando migraciones..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP "cd $AppPath/backend && npm run migration:run || echo 'Migraciones OK'"

# Paso 6: Frontend
Write-Host "[6/7] Actualizando frontend..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP "cd $AppPath/frontend && npm install && npm run build"

# Paso 7: Reiniciar
Write-Host "[7/7] Reiniciando aplicacion..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP "cd $AppPath/backend && pm2 delete all; pm2 start dist/main.js --name datagree; pm2 save"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " ACTUALIZACION COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Servidor: http://$ServerIP" -ForegroundColor White
Write-Host ""

# Verificar
Start-Sleep -Seconds 3
ssh -i $KeyFile $ServerUser@$ServerIP "pm2 status"
