# Iniciar proyecto - Sistema de Consentimientos
# Este script inicia backend y frontend usando los procesos de Kiro

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Iniciando Sistema de Consentimientos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Mensaje de instrucciones
Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abre una terminal en Kiro y ejecuta:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   npm run start:dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Abre otra terminal en Kiro y ejecuta:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Informacion de Acceso:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Super Admin:" -ForegroundColor Cyan
Write-Host "    URL:      http://admin.localhost:5173" -ForegroundColor White
Write-Host "    Email:    superadmin@sistema.com" -ForegroundColor White
Write-Host "    Password: superadmin123" -ForegroundColor White
Write-Host ""
Write-Host "  Tenant (Cliente Demo):" -ForegroundColor Cyan
Write-Host "    URL:      http://cliente-demo.localhost:5173" -ForegroundColor White
Write-Host "    Email:    clientedemo@demo.com" -ForegroundColor White
Write-Host ""
Write-Host "  Backend API:" -ForegroundColor Cyan
Write-Host "    URL:      http://localhost:3000/api" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Abrir navegador
$openBrowser = Read-Host "Deseas abrir el navegador? (s/n)"
if ($openBrowser -eq "s" -or $openBrowser -eq "S") {
    Write-Host "Abriendo navegador..." -ForegroundColor Yellow
    Start-Process "http://admin.localhost:5173"
    Write-Host "[OK] Navegador abierto" -ForegroundColor Green
}

Write-Host ""
Write-Host "Para detener el proyecto:" -ForegroundColor Yellow
Write-Host "  - Presiona Ctrl+C en cada terminal" -ForegroundColor White
Write-Host "  - O ejecuta: .\stop.ps1" -ForegroundColor White
Write-Host ""
