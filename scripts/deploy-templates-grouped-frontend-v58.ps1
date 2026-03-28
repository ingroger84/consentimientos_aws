# Script de despliegue del frontend con plantillas agrupadas por tenant v58
# Fecha: 2026-03-17

Write-Host "=== DESPLIEGUE FRONTEND PLANTILLAS AGRUPADAS V58 ===" -ForegroundColor Cyan
Write-Host ""

# Variables
$SERVER = "ubuntu@archivoenlinea.com"
$KEY = "AWS-ISSABEL.pem"
$FRONTEND_DIR = "/var/www/html"

Write-Host "1. Creando archivo comprimido del frontend..." -ForegroundColor Yellow
Compress-Archive -Path frontend/dist/* -DestinationPath frontend-dist-v58-templates-grouped.zip -Force

Write-Host "2. Subiendo archivos al servidor..." -ForegroundColor Yellow
scp -i $KEY frontend-dist-v58-templates-grouped.zip ${SERVER}:/home/ubuntu/

Write-Host "3. Desplegando en servidor..." -ForegroundColor Yellow
ssh -i $KEY $SERVER @"
    # Backup del frontend actual
    sudo cp -r $FRONTEND_DIR ${FRONTEND_DIR}.backup.v58
    
    # Limpiar directorio actual
    sudo rm -rf ${FRONTEND_DIR}/*
    
    # Descomprimir nuevo frontend
    sudo unzip -o /home/ubuntu/frontend-dist-v58-templates-grouped.zip -d $FRONTEND_DIR
    
    # Ajustar permisos
    sudo chown -R www-data:www-data $FRONTEND_DIR
    sudo chmod -R 755 $FRONTEND_DIR
    
    echo "Despliegue completado"
"@

Write-Host ""
Write-Host "=== DESPLIEGUE COMPLETADO ===" -ForegroundColor Green
Write-Host ""
Write-Host "Cambios implementados:" -ForegroundColor Cyan
Write-Host "  ✓ Vista agrupada por tenant para Super Admin en Plantillas CN" -ForegroundColor White
Write-Host "  ✓ Vista agrupada por tenant para Super Admin en Plantillas HC" -ForegroundColor White
Write-Host "  ✓ Estadísticas por tenant (total, activas, inactivas, por tipo)" -ForegroundColor White
Write-Host "  ✓ Expandir/colapsar secciones de cada tenant" -ForegroundColor White
Write-Host ""
Write-Host "Prueba en:" -ForegroundColor Cyan
Write-Host "  https://archivoenlinea.com" -ForegroundColor White
Write-Host "  Usuario Super Admin para ver la vista agrupada" -ForegroundColor White
