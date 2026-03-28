# Deployment Script V75 - Monthly Resource Limits
# Implementa limites mensuales para CN y HC que se reinician cada mes

$ErrorActionPreference = "Stop"

Write-Host "=== DESPLIEGUE V75: LIMITES MENSUALES ===" -ForegroundColor Cyan
Write-Host ""

# Variables
$SERVER = "ubuntu@100.28.198.249"
$KEY = "../AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"
$PM2_NAME = "datagree"

Write-Host "1. Compilando backend..." -ForegroundColor Yellow
Set-Location ../backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar backend" -ForegroundColor Red
    exit 1
}
Write-Host "Backend compilado exitosamente" -ForegroundColor Green

Write-Host "`n2. Creando archivo de despliegue..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipFile = "backend-dist-v75-monthly-limits-$timestamp.zip"
Compress-Archive -Path dist/* -DestinationPath $zipFile -Force
Write-Host "Archivo creado: $zipFile" -ForegroundColor Green

Write-Host "`n3. Subiendo a servidor..." -ForegroundColor Yellow
scp -i $KEY $zipFile "${SERVER}:${REMOTE_PATH}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir archivo" -ForegroundColor Red
    exit 1
}
Write-Host "Archivo subido exitosamente" -ForegroundColor Green

Write-Host "`n4. Desplegando en servidor..." -ForegroundColor Yellow
ssh -i $KEY $SERVER @"
cd $REMOTE_PATH
echo 'Descomprimiendo archivos...'
unzip -o $zipFile -d dist_temp
rm -rf dist_backup
mv dist dist_backup
mv dist_temp dist
rm $zipFile
echo 'Reiniciando servidor...'
pm2 restart $PM2_NAME
pm2 logs $PM2_NAME --lines 20
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== DESPLIEGUE COMPLETADO ===" -ForegroundColor Green
Write-Host ""
Write-Host "CAMBIOS IMPLEMENTADOS:" -ForegroundColor Cyan
Write-Host "- Limites de CN y HC ahora son MENSUALES" -ForegroundColor White
Write-Host "- Se reinician automaticamente el dia 1 de cada mes" -ForegroundColor White
Write-Host "- Mensajes de error incluyen fecha de reinicio" -ForegroundColor White
Write-Host ""
Write-Host "VERIFICACION:" -ForegroundColor Cyan
Write-Host "1. Intenta crear un CN/HC cuando estes cerca del limite" -ForegroundColor White
Write-Host "2. El mensaje de error debe decir 'limite mensual' y fecha de reinicio" -ForegroundColor White
Write-Host "3. El 1 de abril, los contadores se reiniciaran automaticamente" -ForegroundColor White

Set-Location ../scripts
