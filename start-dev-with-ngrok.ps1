# Script para iniciar desarrollo con ngrok
# Fecha: 20 de Enero de 2026

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Entorno de Desarrollo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si ngrok está instalado
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "❌ ngrok no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instala ngrok con una de estas opciones:" -ForegroundColor Yellow
    Write-Host "  1. Descarga desde: https://ngrok.com/download" -ForegroundColor White
    Write-Host "  2. Con Chocolatey: choco install ngrok" -ForegroundColor White
    Write-Host "  3. Con Scoop: scoop install ngrok" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ ngrok encontrado" -ForegroundColor Green

# Verificar si ngrok ya está corriendo
$ngrokRunning = Get-Process ngrok -ErrorAction SilentlyContinue

if ($ngrokRunning) {
    Write-Host "⚠️  ngrok ya está corriendo" -ForegroundColor Yellow
    Write-Host ""
} else {
    # Iniciar ngrok en segundo plano
    Write-Host "Iniciando ngrok..." -ForegroundColor Cyan
    Start-Process ngrok -ArgumentList "http 3000" -WindowStyle Normal
    
    # Esperar a que ngrok inicie
    Write-Host "Esperando a que ngrok inicie..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

# Obtener URL de ngrok
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4040/api/tunnels" -UseBasicParsing
    $tunnels = ($response.Content | ConvertFrom-Json).tunnels
    
    if ($tunnels.Count -gt 0) {
        $ngrokUrl = $tunnels[0].public_url
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ ngrok está corriendo" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "URL Pública:" -ForegroundColor Cyan
        Write-Host "  $ngrokUrl" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Dashboard de ngrok:" -ForegroundColor Cyan
        Write-Host "  http://localhost:4040" -ForegroundColor White
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Configuración para Bold" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "URL del Webhook:" -ForegroundColor Yellow
        Write-Host "  $ngrokUrl/api/webhooks/bold" -ForegroundColor White
        Write-Host ""
        Write-Host "Copia esta URL y configúrala en:" -ForegroundColor Gray
        Write-Host "  Panel de Bold > Configuración > Webhooks" -ForegroundColor Gray
        Write-Host ""
        Write-Host "También actualiza en backend/.env:" -ForegroundColor Gray
        Write-Host "  BOLD_WEBHOOK_URL=$ngrokUrl/api/webhooks/bold" -ForegroundColor Gray
        Write-Host ""
        
        # Copiar URL al portapapeles
        Set-Clipboard -Value "$ngrokUrl/api/webhooks/bold"
        Write-Host "✓ URL copiada al portapapeles" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "⚠️  No se pudo obtener la URL de ngrok" -ForegroundColor Yellow
        Write-Host "Verifica manualmente en: http://localhost:4040" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "⚠️  No se pudo conectar al API de ngrok" -ForegroundColor Yellow
    Write-Host "Verifica manualmente en: http://localhost:4040" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del backend
Set-Location -Path "backend"

# Iniciar el backend
Write-Host "Ejecutando: npm run start:dev" -ForegroundColor Gray
Write-Host ""

npm run start:dev
