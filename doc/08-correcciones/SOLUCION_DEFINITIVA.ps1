# Script de Solución Definitiva para el Error de Módulo
# Este script limpia completamente el caché y reinicia los servidores

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SOLUCIÓN DEFINITIVA - ERROR MÓDULO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Detener todos los procesos de Node.js
Write-Host "1. Deteniendo procesos de Node.js..." -ForegroundColor Yellow
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
Write-Host "   ✓ Caché del frontend limpiado" -ForegroundColor Green
Write-Host ""

# Paso 3: Compilar frontend para verificar errores
Write-Host "3. Compilando frontend..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Frontend compilado exitosamente" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error al compilar frontend" -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}
Write-Host ""

# Paso 4: Iniciar backend
Write-Host "4. Iniciando backend..." -ForegroundColor Yellow
Set-Location ..\backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "   ✓ Backend iniciado en puerto 3000" -ForegroundColor Green
Write-Host ""

# Paso 5: Iniciar frontend
Write-Host "5. Iniciando frontend..." -ForegroundColor Yellow
Set-Location ..\frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev -- --force" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "   ✓ Frontend iniciado en puerto 5173" -ForegroundColor Green
Write-Host ""

# Instrucciones finales
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SERVIDORES INICIADOS CORRECTAMENTE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE: Ahora debes limpiar el caché del navegador:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Cierra TODAS las pestañas de localhost" -ForegroundColor White
Write-Host "2. Presiona Ctrl + Shift + Delete" -ForegroundColor White
Write-Host "3. Selecciona 'Imágenes y archivos en caché'" -ForegroundColor White
Write-Host "4. Haz clic en 'Borrar datos'" -ForegroundColor White
Write-Host "5. Cierra el navegador completamente" -ForegroundColor White
Write-Host "6. Abre el navegador de nuevo" -ForegroundColor White
Write-Host "7. Navega a: http://admin.localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "O simplemente presiona Ctrl + Shift + R en la página" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona cualquier tecla para abrir el navegador..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Abrir navegador
Start-Process "http://admin.localhost:5173"

Set-Location ..
