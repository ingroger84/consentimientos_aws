# Script de despliegue para plantillas agrupadas por tenant v58
# Fecha: 2026-03-16

Write-Host "=== DESPLIEGUE PLANTILLAS AGRUPADAS POR TENANT V58 ===" -ForegroundColor Cyan
Write-Host ""

# Variables
$SERVER = "ubuntu@archivoenlinea.com"
$KEY = "AWS-ISSABEL.pem"
$BACKEND_DIR = "/home/ubuntu/consentimientos-backend"

Write-Host "1. Compilando backend localmente..." -ForegroundColor Yellow
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en compilación" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "2. Creando archivo comprimido..." -ForegroundColor Yellow
Compress-Archive -Path backend/dist/* -DestinationPath backend-dist-v58-templates-grouped.zip -Force

Write-Host "3. Subiendo archivos al servidor..." -ForegroundColor Yellow
scp -i $KEY backend-dist-v58-templates-grouped.zip ${SERVER}:/home/ubuntu/

Write-Host "4. Desplegando en servidor..." -ForegroundColor Yellow
ssh -i $KEY $SERVER @"
    cd $BACKEND_DIR
    
    # Backup del dist actual
    if [ -d dist ]; then
        mv dist dist.backup.v58
    fi
    
    # Descomprimir nuevo dist
    unzip -o /home/ubuntu/backend-dist-v58-templates-grouped.zip -d dist
    
    # Reiniciar servicio
    pm2 restart datagree-backend
    
    echo "Despliegue completado"
"@

Write-Host ""
Write-Host "=== DESPLIEGUE COMPLETADO ===" -ForegroundColor Green
Write-Host ""
Write-Host "Endpoints disponibles:" -ForegroundColor Cyan
Write-Host "  GET /api/consent-templates/all/grouped (Super Admin)" -ForegroundColor White
Write-Host "  GET /api/medical-record-consent-templates/all/grouped (Super Admin)" -ForegroundColor White
Write-Host ""
Write-Host "Permisos requeridos:" -ForegroundColor Cyan
Write-Host "  - VIEW_GLOBAL_STATS (CN templates)" -ForegroundColor White
Write-Host "  - view_global_stats (HC templates)" -ForegroundColor White
