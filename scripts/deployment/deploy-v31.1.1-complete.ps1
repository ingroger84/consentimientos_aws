# Script de Despliegue Completo v31.1.1
# Fecha: 2026-02-09
# Cambios: Botones Vista Previa y Email en HC Super Admin + Fix endpoints precios multi-región

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE COMPLETO v31.1.1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

# Verificar que existan los archivos compilados
if (-not (Test-Path "frontend/dist")) {
    Write-Host "ERROR: No existe frontend/dist. Ejecuta 'npm run build' en frontend" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "backend/dist")) {
    Write-Host "ERROR: No existe backend/dist. Ejecuta 'npm run build' en backend" -ForegroundColor Red
    exit 1
}

Write-Host "1. Creando archivo comprimido del frontend..." -ForegroundColor Yellow
if (Test-Path "frontend-dist-v31.1.1.tar.gz") {
    Remove-Item "frontend-dist-v31.1.1.tar.gz" -Force
}
tar -czf frontend-dist-v31.1.1.tar.gz -C frontend dist

Write-Host "2. Creando archivo comprimido del backend..." -ForegroundColor Yellow
if (Test-Path "backend-dist-v31.1.1.tar.gz") {
    Remove-Item "backend-dist-v31.1.1.tar.gz" -Force
}
tar -czf backend-dist-v31.1.1.tar.gz -C backend dist

Write-Host "3. Subiendo archivos al servidor..." -ForegroundColor Yellow
scp -i $KEY frontend-dist-v31.1.1.tar.gz ${SERVER}:~/
scp -i $KEY backend-dist-v31.1.1.tar.gz ${SERVER}:~/

Write-Host "4. Desplegando en el servidor..." -ForegroundColor Yellow
ssh -i $KEY $SERVER @"
    set -e
    
    echo '=== Desplegando Frontend v31.1.1 ==='
    cd $REMOTE_PATH/frontend
    rm -rf dist
    tar -xzf ~/frontend-dist-v31.1.1.tar.gz
    sudo chown -R ubuntu:ubuntu dist
    sudo chmod -R 755 dist
    
    echo '=== Desplegando Backend v31.1.1 ==='
    cd $REMOTE_PATH/backend
    rm -rf dist
    tar -xzf ~/backend-dist-v31.1.1.tar.gz
    sudo chown -R ubuntu:ubuntu dist
    sudo chmod -R 755 dist
    
    echo '=== Reiniciando PM2 ==='
    pm2 restart datagree
    pm2 save
    
    echo '=== Recargando Nginx ==='
    sudo systemctl reload nginx
    
    echo '=== Limpiando archivos temporales ==='
    rm ~/frontend-dist-v31.1.1.tar.gz
    rm ~/backend-dist-v31.1.1.tar.gz
    
    echo '=== Verificando estado ==='
    pm2 status
    
    echo ''
    echo '✅ Despliegue completado exitosamente!'
    echo ''
    echo 'Versión: 31.1.1'
    echo 'Fecha: 2026-02-09'
    echo ''
    echo 'Cambios aplicados:'
    echo '- ✅ Botones Vista Previa y Enviar Email en HC (Super Admin)'
    echo '- ✅ Fix endpoints precios multi-región (orden correcto)'
    echo '- ✅ Modal de vista previa PDF integrado'
    echo ''
"@

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Versión desplegada: 31.1.1" -ForegroundColor Cyan
Write-Host "Servidor: archivoenlinea.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cambios aplicados:" -ForegroundColor Yellow
Write-Host "  ✅ Botones Vista Previa y Enviar Email en HC (Super Admin)" -ForegroundColor Green
Write-Host "  ✅ Fix endpoints precios multi-región" -ForegroundColor Green
Write-Host "  ✅ Modal de vista previa PDF integrado" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Verificar en admin.archivoenlinea.com/medical-records" -ForegroundColor White
Write-Host "  2. Verificar endpoints de precios en /plans/regions/available" -ForegroundColor White
Write-Host "  3. Limpiar caché del navegador (Ctrl+Shift+R)" -ForegroundColor White
Write-Host ""

# Limpiar archivos locales
Remove-Item "frontend-dist-v31.1.1.tar.gz" -Force
Remove-Item "backend-dist-v31.1.1.tar.gz" -Force
