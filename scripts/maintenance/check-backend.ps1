# Script para verificar si el backend esta corriendo
# Fecha: 2026-01-25

Write-Host "=== VERIFICACION DE BACKEND ===" -ForegroundColor Cyan
Write-Host ""

# Verificar si el puerto 3000 esta en uso
Write-Host "1. Verificando puerto 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "   Puerto 3000 esta en uso" -ForegroundColor Green
    Write-Host "   PID: $($port3000.OwningProcess)" -ForegroundColor Gray
} else {
    Write-Host "   Puerto 3000 NO esta en uso" -ForegroundColor Red
    Write-Host "   El backend NO esta corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUCION:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  npm run start:dev" -ForegroundColor White
    exit 1
}

# Probar endpoint de health
Write-Host ""
Write-Host "2. Probando endpoint /api/health..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -UseBasicParsing -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   Endpoint /api/health responde correctamente" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
        Write-Host "   Respuesta: $($response.Content)" -ForegroundColor Gray
    } else {
        Write-Host "   Endpoint /api/health responde con error" -ForegroundColor Red
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   No se puede conectar con /api/health" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Probar endpoint de settings publicos
Write-Host ""
Write-Host "3. Probando endpoint /api/settings/public..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/settings/public" -Method GET -UseBasicParsing -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   Endpoint /api/settings/public responde correctamente" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Company Name: $($content.companyName)" -ForegroundColor Gray
        Write-Host "   Primary Color: $($content.primaryColor)" -ForegroundColor Gray
    } else {
        Write-Host "   Endpoint /api/settings/public responde con error" -ForegroundColor Red
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   No se puede conectar con /api/settings/public" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Probar endpoint de settings publicos con tenant
Write-Host ""
Write-Host "4. Probando endpoint /api/settings/public con tenant demo-medico..." -ForegroundColor Yellow

try {
    $headers = @{
        "X-Tenant-Slug" = "demo-medico"
    }
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/settings/public" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   Endpoint responde correctamente para tenant demo-medico" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Company Name: $($content.companyName)" -ForegroundColor Gray
        Write-Host "   Primary Color: $($content.primaryColor)" -ForegroundColor Gray
        Write-Host "   Logo URL: $($content.logoUrl)" -ForegroundColor Gray
    } else {
        Write-Host "   Endpoint responde con error para tenant demo-medico" -ForegroundColor Red
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   No se puede conectar con /api/settings/public (tenant)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== VERIFICACION COMPLETADA ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si todos los tests pasaron, el backend esta funcionando correctamente." -ForegroundColor Green
Write-Host "Si algun test fallo, revisa los logs del backend y la documentacion:" -ForegroundColor Yellow
Write-Host "  doc/54-correccion-login-personalizado/README.md" -ForegroundColor White
