# Script para reiniciar el frontend con caché limpio
# Uso: .\REINICIAR_FRONTEND_LIMPIO.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REINICIO LIMPIO DEL FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si estamos en la raíz del proyecto
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Error: No se encuentra la carpeta 'frontend'" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Paso 1: Limpiar caché de Vite
Write-Host "🧹 Paso 1: Limpiando caché de Vite..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules/.vite") {
    Remove-Item -Recurse -Force "frontend/node_modules/.vite"
    Write-Host "   ✅ Caché de Vite eliminado" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No hay caché de Vite para limpiar" -ForegroundColor Gray
}

# Paso 2: Limpiar dist si existe
Write-Host ""
Write-Host "🧹 Paso 2: Limpiando carpeta dist..." -ForegroundColor Yellow
if (Test-Path "frontend/dist") {
    Remove-Item -Recurse -Force "frontend/dist"
    Write-Host "   ✅ Carpeta dist eliminada" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No hay carpeta dist para limpiar" -ForegroundColor Gray
}

# Paso 3: Compilar el proyecto
Write-Host ""
Write-Host "🔨 Paso 3: Compilando proyecto..." -ForegroundColor Yellow
Set-Location frontend
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Compilación exitosa" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error en la compilación" -ForegroundColor Red
    Write-Host $buildResult
    Set-Location ..
    exit 1
}
Set-Location ..

# Paso 4: Iniciar servidor de desarrollo
Write-Host ""
Write-Host "🚀 Paso 4: Iniciando servidor de desarrollo..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SERVIDOR INICIADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 URLs disponibles:" -ForegroundColor White
Write-Host "   • Super Admin: http://admin.localhost:5173" -ForegroundColor Cyan
Write-Host "   • Tenants:     http://{slug}.localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Consejos:" -ForegroundColor White
Write-Host "   • Usa Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host "   • Abre el navegador en modo incógnito para ver cambios" -ForegroundColor Gray
Write-Host "   • O limpia caché con Ctrl+Shift+Delete" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location frontend
npm run dev
