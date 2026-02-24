# Script para desplegar en servidor existente DatAgree
# IP: 100.28.198.249
# Fecha: 2026-01-27

$ErrorActionPreference = "Stop"

$ServerIP = "100.28.198.249"
$KeyFile = "AWS-ISSABEL.pem"
$ServerUser = "ubuntu"
$AppPath = "/var/www/consentimientos"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " DESPLIEGUE A SERVIDOR EXISTENTE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servidor: $ServerIP" -ForegroundColor White
Write-Host "Usuario: $ServerUser" -ForegroundColor White
Write-Host ""

# Verificar que existe la clave
if (-not (Test-Path $KeyFile)) {
    Write-Host "ERROR: No se encuentra $KeyFile" -ForegroundColor Red
    Write-Host "Buscando clave en directorio actual..." -ForegroundColor Yellow
    
    # Buscar cualquier archivo .pem
    $pemFiles = Get-ChildItem -Filter "*.pem" -ErrorAction SilentlyContinue
    if ($pemFiles.Count -gt 0) {
        $KeyFile = $pemFiles[0].Name
        Write-Host "Usando clave: $KeyFile" -ForegroundColor Green
    } else {
        Write-Host "No se encontro ninguna clave .pem" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Usando clave SSH: $KeyFile" -ForegroundColor Green
Write-Host ""

# Paso 1: Crear backup de la base de datos
Write-Host "[1/8] Creando backup de base de datos..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $ServerUser@$ServerIP @"
timestamp=`$(date +%Y%m%d_%H%M%S)
sudo -u postgres pg_dump -h localhost -U admin consentimientos > /home/ubuntu/backup_`$timestamp.sql
echo "Backup creado: backup_`$timestamp.sql"
"@

# Paso 2: Detener aplicacion
Write-Host "[2/8] Deteniendo aplicacion..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP "pm2 stop all || true"

# Paso 3: Actualizar codigo desde GitHub
Write-Host "[3/8] Actualizando codigo desde GitHub..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP @"
cd $AppPath
git fetch origin
git reset --hard origin/main
git pull origin main
echo "Codigo actualizado a la ultima version"
"@

# Paso 4: Instalar dependencias backend
Write-Host "[4/8] Instalando dependencias backend..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP @"
cd $AppPath/backend
npm install --production
echo "Dependencias backend instaladas"
"@

# Paso 5: Compilar backend
Write-Host "[5/8] Compilando backend..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP @"
cd $AppPath/backend
npm run build
echo "Backend compilado"
"@

# Paso 6: Ejecutar migraciones
Write-Host "[6/8] Ejecutando migraciones..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP @"
cd $AppPath/backend
npm run migration:run || echo "Migraciones ya aplicadas o no necesarias"
"@

# Paso 7: Compilar frontend
Write-Host "[7/8] Compilando frontend..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP @"
cd $AppPath/frontend
npm install
npm run build
echo "Frontend compilado"
"@

# Paso 8: Reiniciar aplicacion
Write-Host "[8/8] Reiniciando aplicacion..." -ForegroundColor Yellow
ssh -i $KeyFile $ServerUser@$ServerIP @"
cd $AppPath/backend
pm2 delete all || true
pm2 start dist/main.js --name datagree-backend
pm2 save
pm2 list
"@

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servidor: http://$ServerIP" -ForegroundColor White
Write-Host "API: http://$ServerIP/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Verificando estado..." -ForegroundColor Yellow

# Verificar estado
Start-Sleep -Seconds 5
ssh -i $KeyFile $ServerUser@$ServerIP "pm2 status"

Write-Host ""
Write-Host "Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host ""
