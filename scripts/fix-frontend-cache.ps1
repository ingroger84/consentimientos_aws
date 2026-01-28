# Script para limpiar caché del frontend y reiniciar

Write-Host "🧹 Limpiando caché del frontend..." -ForegroundColor Cyan

# Ir al directorio del frontend
Set-Location -Path "frontend"

# Limpiar caché de Vite
Write-Host "Limpiando caché de Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
    Write-Host "✓ Caché de Vite eliminada" -ForegroundColor Green
}

# Limpiar dist
Write-Host "Limpiando directorio dist..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "✓ Directorio dist eliminado" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Caché limpiada exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "Instrucciones:" -ForegroundColor Cyan
Write-Host "1. Abre Chrome DevTools (F12)" -ForegroundColor White
Write-Host "2. Ve a la pestana Application" -ForegroundColor White
Write-Host "3. En el menu izquierdo, haz clic en Clear storage" -ForegroundColor White
Write-Host "4. Haz clic en Clear site data" -ForegroundColor White
Write-Host "5. Recarga la pagina con Ctrl+Shift+R (hard reload)" -ForegroundColor White
Write-Host ""
Write-Host "O simplemente:" -ForegroundColor Cyan
Write-Host "- Presiona Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "- Selecciona Cached images and files" -ForegroundColor White
Write-Host "- Haz clic en Clear data" -ForegroundColor White

Set-Location -Path ".."
