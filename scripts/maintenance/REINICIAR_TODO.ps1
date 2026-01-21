# Script para Reiniciar Todo el Sistema Limpiamente

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REINICIO COMPLETO DEL SISTEMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Detener todos los procesos
Write-Host "1. Deteniendo procesos..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2
Write-Host "   ✓ Procesos detenidos" -ForegroundColor Green
Write-Host ""

# Paso 2: Limpiar caché del frontend
Write-Host "2. Limpiando caché del frontend..." -ForegroundColor Yellow
Set-Location frontend
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue
Write-Host "   ✓ Caché limpiado" -ForegroundColor Green
Write-Host ""

# Paso 3: Iniciar backend
Write-Host "3. Iniciando backend..." -ForegroundColor Yellow
Set-Location ..\backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev" -WindowStyle Normal
Start-Sleep -Seconds 8
Write-Host "   ✓ Backend iniciado" -ForegroundColor Green
Write-Host ""

# Paso 4: Iniciar frontend
Write-Host "4. Iniciando frontend..." -ForegroundColor Yellow
Set-Location ..\frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev -- --force" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "   ✓ Frontend iniciado" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SISTEMA INICIADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "AHORA DEBES LIMPIAR EL CACHÉ DEL NAVEGADOR:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Presiona Ctrl + Shift + Delete" -ForegroundColor White
Write-Host "2. Selecciona 'Imágenes y archivos en caché'" -ForegroundColor White
Write-Host "3. Haz clic en 'Borrar datos'" -ForegroundColor White
Write-Host "4. Cierra TODAS las pestañas de localhost" -ForegroundColor White
Write-Host "5. Cierra el navegador completamente" -ForegroundColor White
Write-Host "6. Abre el navegador de nuevo" -ForegroundColor White
Write-Host "7. Ve a: http://admin.localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "O simplemente presiona Ctrl + Shift + R en la página" -ForegroundColor Yellow
Write-Host ""

Set-Location ..
