# Script de verificación del sistema
# Verifica el estado de backend, frontend y base de datos

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICACIÓN DEL SISTEMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar procesos de Node.js
Write-Host "[1/5] Verificando procesos de Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "✓ Procesos de Node.js encontrados: $($nodeProcesses.Count)" -ForegroundColor Green
    foreach ($process in $nodeProcesses) {
        Write-Host "  - PID: $($process.Id) | CPU: $($process.CPU) | Memoria: $([math]::Round($process.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ No hay procesos de Node.js corriendo" -ForegroundColor Red
}
Write-Host ""

# Verificar puerto 3000 (Backend)
Write-Host "[2/5] Verificando Backend (puerto 3000)..." -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($backend) {
    Write-Host "✓ Backend corriendo en puerto 3000" -ForegroundColor Green
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "✓ Backend responde correctamente" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Backend en puerto 3000 pero no responde" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Backend NO está corriendo en puerto 3000" -ForegroundColor Red
}
Write-Host ""

# Verificar puerto 5173 (Frontend Dev)
Write-Host "[3/5] Verificando Frontend Dev (puerto 5173)..." -ForegroundColor Yellow
$frontendDev = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if ($frontendDev) {
    Write-Host "✓ Frontend Dev corriendo en puerto 5173" -ForegroundColor Green
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "✓ Frontend Dev responde correctamente" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Frontend Dev en puerto 5173 pero no responde" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Frontend Dev NO está corriendo en puerto 5173" -ForegroundColor Red
}
Write-Host ""

# Verificar puerto 4173 (Frontend Prod)
Write-Host "[4/5] Verificando Frontend Prod (puerto 4173)..." -ForegroundColor Yellow
$frontendProd = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
if ($frontendProd) {
    Write-Host "✓ Frontend Prod corriendo en puerto 4173" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend Prod NO está corriendo en puerto 4173" -ForegroundColor Gray
}
Write-Host ""

# Verificar archivos de caché
Write-Host "[5/5] Verificando archivos de caché..." -ForegroundColor Yellow
$viteCache = Test-Path "frontend\.vite"
$distFolder = Test-Path "frontend\dist"

if ($viteCache) {
    $viteCacheSize = (Get-ChildItem -Path "frontend\.vite" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host "⚠ Caché de Vite existe: $([math]::Round($viteCacheSize/1MB, 2)) MB" -ForegroundColor Yellow
} else {
    Write-Host "✓ No hay caché de Vite" -ForegroundColor Green
}

if ($distFolder) {
    $distSize = (Get-ChildItem -Path "frontend\dist" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host "✓ Carpeta dist existe: $([math]::Round($distSize/1MB, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "✗ No hay carpeta dist" -ForegroundColor Gray
}
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($backend -and $frontendDev) {
    Write-Host "✓ Sistema operativo" -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs de acceso:" -ForegroundColor White
    Write-Host "  Super Admin: http://admin.localhost:5173" -ForegroundColor Cyan
    Write-Host "  Tenants: http://[slug].localhost:5173" -ForegroundColor Cyan
} elseif ($backend -and $frontendProd) {
    Write-Host "✓ Sistema operativo (modo producción)" -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs de acceso:" -ForegroundColor White
    Write-Host "  Super Admin: http://admin.localhost:4173" -ForegroundColor Cyan
    Write-Host "  Tenants: http://[slug].localhost:4173" -ForegroundColor Cyan
} else {
    Write-Host "✗ Sistema NO operativo" -ForegroundColor Red
    Write-Host ""
    Write-Host "Acciones recomendadas:" -ForegroundColor Yellow
    if (-not $backend) {
        Write-Host "  1. Iniciar backend: cd backend && npm run start:dev" -ForegroundColor White
    }
    if (-not $frontendDev -and -not $frontendProd) {
        Write-Host "  2. Iniciar frontend: cd frontend && npm run dev" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Para limpiar caché y reiniciar:" -ForegroundColor Yellow
Write-Host "  .\restart-frontend-clean.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Para usar build de producción:" -ForegroundColor Yellow
Write-Host "  .\start-frontend-production.ps1" -ForegroundColor White
Write-Host ""
