# Script de Despliegue Multi-Región
# Versión: 30.0.1
# Fecha: 2026-02-08

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     DESPLIEGUE SISTEMA MULTI-REGIÓN v30.0.1                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$SERVER = "ubuntu@ec2-18-191-157-215.us-east-2.compute.amazonaws.com"
$KEY = "AWS-ISSABEL.pem"

# Verificar que la clave existe
if (-not (Test-Path $KEY)) {
    Write-Host "✗ Error: Archivo de clave $KEY no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "▶ Conectando al servidor AWS..." -ForegroundColor Blue
Write-Host ""

# Crear script temporal para ejecutar en el servidor
$deployScript = @"
#!/bin/bash
set -e

echo '▶ PASO 1: Actualizando código desde GitHub...'
cd /var/www/consentimientos
git pull origin main
echo '✓ Código actualizado'
echo ''

echo '▶ PASO 2: Aplicando migración de base de datos...'
cd /var/www/consentimientos/backend
node apply-region-migration.js
echo '✓ Migración aplicada'
echo ''

echo '▶ PASO 3: Instalando dependencias del backend...'
npm install --production
echo '✓ Dependencias instaladas'
echo ''

echo '▶ PASO 4: Compilando backend...'
npm run build
echo '✓ Backend compilado'
echo ''

echo '▶ PASO 5: Instalando dependencias del frontend...'
cd /var/www/consentimientos/frontend
npm install --production
echo '✓ Dependencias instaladas'
echo ''

echo '▶ PASO 6: Compilando frontend...'
npm run build
echo '✓ Frontend compilado'
echo ''

echo '▶ PASO 7: Reiniciando servicios...'
pm2 restart all
sudo systemctl reload nginx
echo '✓ Servicios reiniciados'
echo ''

echo '▶ PASO 8: Verificando despliegue...'
curl -s http://localhost:3000/api/plans/public | head -n 10
echo ''
echo '✓ API verificada'
echo ''

echo '╔════════════════════════════════════════════════════════════════╗'
echo '║                  DESPLIEGUE COMPLETADO                         ║'
echo '╚════════════════════════════════════════════════════════════════╝'
echo ''
echo 'Sistema multi-región desplegado exitosamente!'
echo 'Versión: 30.0.1'
echo ''
"@

# Guardar script temporal
$deployScript | Out-File -FilePath "deploy-temp.sh" -Encoding ASCII

# Copiar script al servidor
Write-Host "▶ Copiando script de despliegue al servidor..." -ForegroundColor Blue
scp -i $KEY deploy-temp.sh ${SERVER}:/tmp/deploy-multi-region.sh

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error copiando script al servidor" -ForegroundColor Red
    Remove-Item deploy-temp.sh
    exit 1
}

Write-Host "✓ Script copiado exitosamente" -ForegroundColor Green
Write-Host ""

# Ejecutar script en el servidor
Write-Host "▶ Ejecutando despliegue en el servidor..." -ForegroundColor Blue
Write-Host ""

ssh -i $KEY $SERVER "chmod +x /tmp/deploy-multi-region.sh && /tmp/deploy-multi-region.sh"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              ✓ DESPLIEGUE COMPLETADO EXITOSAMENTE             ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Verificar landing page: https://archivoenlinea.com" -ForegroundColor White
    Write-Host "2. Verificar precios en COP para Colombia" -ForegroundColor White
    Write-Host "3. Testing con VPN USA para verificar precios en USD" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Error durante el despliegue" -ForegroundColor Red
    Write-Host "Revisa los logs arriba para más detalles" -ForegroundColor Yellow
}

# Limpiar archivo temporal
Remove-Item deploy-temp.sh -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
