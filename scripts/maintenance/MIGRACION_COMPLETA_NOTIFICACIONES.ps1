# Script para migrar TODAS las notificaciones del proyecto

Write-Host "🚀 Iniciando migración completa del sistema de notificaciones..." -ForegroundColor Green
Write-Host ""

# Detener el frontend si está corriendo
Write-Host "⏸️  Deteniendo frontend..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Limpiar caché
Write-Host "🧹 Limpiando caché..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules/.vite") {
    Remove-Item -Recurse -Force "frontend/node_modules/.vite"
}
if (Test-Path "frontend/dist") {
    Remove-Item -Recurse -Force "frontend/dist"
}

# Compilar frontend
Write-Host "📦 Compilando frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend compilado exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al compilar frontend" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "✅ Migración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Iniciar frontend: cd frontend && npm run dev"
Write-Host "2. Limpiar caché del navegador: Ctrl+Shift+Delete"
Write-Host "3. Refrescar con Ctrl+Shift+R"
Write-Host "4. Probar en: http://admin.localhost:5173/plans"
Write-Host ""
