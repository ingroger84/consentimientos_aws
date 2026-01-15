# Script para iniciar el proyecto completo en Kiro
# Sistema de Consentimientos Multi-Tenant

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sistema de Consentimientos" -ForegroundColor Cyan
Write-Host "  Iniciando proyecto completo..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que las carpetas existan
$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

if (-not (Test-Path $backendPath)) {
    Write-Host "[ERROR] No se encontro la carpeta 'backend'" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "[ERROR] No se encontro la carpeta 'frontend'" -ForegroundColor Red
    exit 1
}

# Verificar si node_modules existe en backend
$backendNodeModules = Join-Path $backendPath "node_modules"
if (-not (Test-Path $backendNodeModules)) {
    Write-Host "Instalando dependencias del backend..." -ForegroundColor Yellow
    Set-Location $backendPath
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Error al instalar dependencias del backend" -ForegroundColor Red
        Set-Location $PSScriptRoot
        exit 1
    }
    Set-Location $PSScriptRoot
    Write-Host "[OK] Dependencias del backend instaladas" -ForegroundColor Green
    Write-Host ""
}

# Verificar si node_modules existe en frontend
$frontendNodeModules = Join-Path $frontendPath "node_modules"
if (-not (Test-Path $frontendNodeModules)) {
    Write-Host "Instalando dependencias del frontend..." -ForegroundColor Yellow
    Set-Location $frontendPath
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Error al instalar dependencias del frontend" -ForegroundColor Red
        Set-Location $PSScriptRoot
        exit 1
    }
    Set-Location $PSScriptRoot
    Write-Host "[OK] Dependencias del frontend instaladas" -ForegroundColor Green
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Backend (Puerto 3000)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Iniciar backend como proceso en background
Set-Location $backendPath
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev" -WindowStyle Normal
Set-Location $PSScriptRoot

Write-Host "[OK] Backend iniciado" -ForegroundColor Green
Write-Host "     - Puerto: 3000" -ForegroundColor Gray
Write-Host "     - Ver logs en la terminal de Kiro" -ForegroundColor Gray
Write-Host ""

# Esperar un momento para que el backend inicie
Write-Host "Esperando 5 segundos para que el backend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Frontend (Puerto 5173)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Iniciar frontend como proceso en background
Set-Location $frontendPath
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Set-Location $PSScriptRoot

Write-Host "[OK] Frontend iniciado" -ForegroundColor Green
Write-Host "     - Puerto: 5173" -ForegroundColor Gray
Write-Host "     - Ver logs en la terminal de Kiro" -ForegroundColor Gray
Write-Host ""

# Esperar un momento para que el frontend inicie
Write-Host "Esperando 8 segundos para que el frontend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Resumen
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  [OK] Proyecto Iniciado Exitosamente" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Informacion de Acceso:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Super Admin:" -ForegroundColor Cyan
Write-Host "     URL:        http://admin.localhost:5173" -ForegroundColor White
Write-Host "     Email:      superadmin@sistema.com" -ForegroundColor White
Write-Host "     Password:   superadmin123" -ForegroundColor White
Write-Host ""
Write-Host "  Tenant (Cliente Demo):" -ForegroundColor Cyan
Write-Host "     URL:        http://cliente-demo.localhost:5173" -ForegroundColor White
Write-Host "     Email:      clientedemo@demo.com" -ForegroundColor White
Write-Host "     Password:   (la que configuraste)" -ForegroundColor White
Write-Host ""
Write-Host "  Backend API:" -ForegroundColor Cyan
Write-Host "     URL:        http://localhost:3000/api" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Consejos:" -ForegroundColor Yellow
Write-Host "  - Los procesos estan corriendo en background" -ForegroundColor White
Write-Host "  - Para ver los logs, usa el panel de terminales de Kiro" -ForegroundColor White
Write-Host "  - Para detener el proyecto, ejecuta: .\stop-project.ps1" -ForegroundColor White
Write-Host ""

# Abrir navegador
Write-Host "Abriendo navegador..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
$browserUrl = "http://admin.localhost:5173"
Start-Process $browserUrl

Write-Host ""
Write-Host "[OK] Listo! El proyecto esta corriendo." -ForegroundColor Green
Write-Host ""
