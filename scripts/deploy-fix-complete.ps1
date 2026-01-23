# Script de Despliegue Completo - Corrección de Período de Prueba y Versión
# Versión 7.0.3 - 2026-01-23

$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "AWS-ISSABEL.pem"

Write-Host "=== DESPLIEGUE COMPLETO v7.0.3 ===" -ForegroundColor Cyan
Write-Host "Corrección: Período de prueba 7 días + Versión visible" -ForegroundColor Yellow

# 1. Incrementar versión
Write-Host "`n[1/8] Incrementando versión a 7.0.3..." -ForegroundColor Green
node scripts/utils/smart-version.js

# 2. Compilar Backend
Write-Host "`n[2/8] Compilando Backend..." -ForegroundColor Green
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar backend" -ForegroundColor Red
    exit 1
}
Set-Location ..

# 3. Compilar Frontend
Write-Host "`n[3/8] Compilando Frontend..." -ForegroundColor Green
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar frontend" -ForegroundColor Red
    exit 1
}
Set-Location ..

# 4. Detener backend en servidor
Write-Host "`n[4/8] Deteniendo backend en servidor..." -ForegroundColor Green
ssh -i $KEY "${USER}@${SERVER}" "pm2 stop datagree-backend"

# 5. Copiar backend
Write-Host "`n[5/8] Copiando backend al servidor..." -ForegroundColor Green
scp -i $KEY -r backend/dist "${USER}@${SERVER}:/home/ubuntu/backend/"
scp -i $KEY backend/package.json "${USER}@${SERVER}:/home/ubuntu/backend/"

# 6. Copiar frontend
Write-Host "`n[6/8] Copiando frontend al servidor..." -ForegroundColor Green
ssh -i $KEY "${USER}@${SERVER}" "sudo rm -rf /var/www/html/dist/*"
scp -i $KEY -r frontend/dist/* "${USER}@${SERVER}:/tmp/frontend-dist/"
ssh -i $KEY "${USER}@${SERVER}" "sudo mv /tmp/frontend-dist/* /var/www/html/dist/ && sudo chown -R www-data:www-data /var/www/html/dist"

# 7. Reiniciar servicios
Write-Host "`n[7/8] Reiniciando servicios..." -ForegroundColor Green
ssh -i $KEY "${USER}@${SERVER}" @"
    cd /home/ubuntu/backend
    pm2 restart datagree-backend
    sudo systemctl reload nginx
"@

# 8. Verificar
Write-Host "`n[8/8] Verificando despliegue..." -ForegroundColor Green
Start-Sleep -Seconds 3

$backendVersion = ssh -i $KEY "${USER}@${SERVER}" "pm2 describe datagree-backend | grep version"
Write-Host "Backend: $backendVersion" -ForegroundColor Cyan

Write-Host "`n=== DESPLIEGUE COMPLETADO ===" -ForegroundColor Green
Write-Host @"

IMPORTANTE: Instrucciones para ver los cambios
===============================================

1. Abre el navegador en MODO INCÓGNITO:
   - Chrome/Edge: Ctrl + Shift + N
   - Firefox: Ctrl + Shift + P

2. Ve a: https://archivoenlinea.com

3. Deberías ver:
   ✓ Versión 7.0.3 - 2026-01-23 en el footer
   ✓ Tenants con plan gratuito: 7 días de prueba
   ✓ Fechas de vencimiento corregidas

Si aún no ves los cambios:
- Limpia caché: Ctrl + Shift + Delete
- Hard refresh: Ctrl + F5

"@ -ForegroundColor Yellow

Write-Host "`nPresiona Enter para continuar..." -ForegroundColor Cyan
Read-Host
