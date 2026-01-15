# Script para limpiar y reiniciar el frontend

Write-Host "🧹 Limpiando caché del frontend..." -ForegroundColor Yellow

# Detener procesos de Node.js
Write-Host "Deteniendo procesos de Node.js..." -ForegroundColor Cyan
taskkill /F /IM node.exe 2>$null

# Limpiar caché de npm
Write-Host "Limpiando caché de npm..." -ForegroundColor Cyan
Set-Location frontend
npm cache clean --force

# Eliminar node_modules y reinstalar (opcional, comentado por defecto)
# Write-Host "Eliminando node_modules..." -ForegroundColor Cyan
# Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
# Write-Host "Reinstalando dependencias..." -ForegroundColor Cyan
# npm install

# Limpiar dist
Write-Host "Limpiando carpeta dist..." -ForegroundColor Cyan
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Limpieza completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Instrucciones:" -ForegroundColor Cyan
Write-Host "1. Abre tu navegador" -ForegroundColor White
Write-Host "2. Presiona Ctrl + Shift + Delete" -ForegroundColor White
Write-Host "3. Limpia el caché del navegador" -ForegroundColor White
Write-Host "4. Cierra todas las pestañas del proyecto" -ForegroundColor White
Write-Host "5. Ejecuta: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "O simplemente presiona Ctrl + F5 en el navegador para forzar recarga" -ForegroundColor Yellow

Set-Location ..
