# Script para iniciar frontend en modo producción
# Usa el build compilado en lugar del servidor de desarrollo
# Útil cuando el hot reload de Vite no funciona

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FRONTEND EN MODO PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Detener procesos de Node.js
Write-Host "[1/4] Deteniendo procesos de Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✓ Procesos de Node.js detenidos" -ForegroundColor Green
} else {
    Write-Host "✓ No hay procesos de Node.js corriendo" -ForegroundColor Green
}
Start-Sleep -Seconds 2

# Paso 2: Limpiar build anterior
Write-Host ""
Write-Host "[2/4] Limpiando build anterior..." -ForegroundColor Yellow
if (Test-Path "frontend\dist") {
    Remove-Item -Path "frontend\dist" -Recurse -Force
    Write-Host "✓ Build anterior eliminado" -ForegroundColor Green
} else {
    Write-Host "✓ No hay build anterior" -ForegroundColor Green
}

# Paso 3: Compilar para producción
Write-Host ""
Write-Host "[3/4] Compilando para producción..." -ForegroundColor Yellow
Set-Location -Path "frontend"
npm run build
Set-Location -Path ".."
Write-Host "✓ Compilación completada" -ForegroundColor Green

# Paso 4: Iniciar servidor de producción
Write-Host ""
Write-Host "[4/4] Iniciando servidor de producción..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SERVIDOR DE PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Usando código compilado (sin hot reload)" -ForegroundColor Green
Write-Host "✓ Todos los cambios están aplicados" -ForegroundColor Green
Write-Host ""
Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Espera a que el servidor inicie" -ForegroundColor White
Write-Host "2. Ve a: http://admin.localhost:4173" -ForegroundColor White
Write-Host "3. El sistema de impersonation debería funcionar" -ForegroundColor White
Write-Host ""
Write-Host "NOTA: El puerto es 4173 (no 5173)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Iniciando servidor en 3 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Set-Location -Path "frontend"
npm run preview
