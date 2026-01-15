# Detener proyecto - Sistema de Consentimientos

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Deteniendo Sistema de Consentimientos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Funcion para detener procesos en un puerto
function Stop-ProcessOnPort {
    param([int]$Port, [string]$Name)
    
    Write-Host "Verificando puerto $Port ($Name)..." -ForegroundColor Yellow
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
        
        if ($connections) {
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  Deteniendo: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Red
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Milliseconds 500
                }
            }
            Write-Host "  [OK] Puerto $Port liberado" -ForegroundColor Green
        } else {
            Write-Host "  [INFO] Puerto $Port ya esta libre" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [!] Error al verificar puerto $Port : $_" -ForegroundColor Yellow
    }
}

# Detener Backend
Stop-ProcessOnPort -Port 3000 -Name "Backend"
Write-Host ""

# Detener Frontend
Stop-ProcessOnPort -Port 5173 -Name "Frontend"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " [OK] Proyecto Detenido" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
