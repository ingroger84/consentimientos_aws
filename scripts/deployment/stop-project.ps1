# Script para detener el proyecto completo
# Sistema de Consentimientos Multi-Tenant

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sistema de Consentimientos" -ForegroundColor Cyan
Write-Host "  Deteniendo proyecto..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Funcion para matar procesos en un puerto especifico
function Stop-ProcessOnPort {
    param([int]$Port, [string]$Name)
    
    Write-Host "Buscando procesos en puerto $Port ($Name)..." -ForegroundColor Yellow
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  Deteniendo: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Red
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                }
            }
            Write-Host "  [OK] Puerto $Port liberado" -ForegroundColor Green
        } else {
            Write-Host "  [INFO] No hay procesos corriendo en puerto $Port" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [!] No se pudo verificar el puerto $Port" -ForegroundColor Yellow
    }
}

# Detener Backend (Puerto 3000)
Write-Host ""
Stop-ProcessOnPort -Port 3000 -Name "Backend"

# Detener Frontend (Puerto 5173)
Write-Host ""
Stop-ProcessOnPort -Port 5173 -Name "Frontend"

# Buscar y cerrar procesos de Node.js relacionados
Write-Host ""
Write-Host "Buscando procesos de Node.js..." -ForegroundColor Yellow

$npmProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($npmProcesses) {
    Write-Host "  Deteniendo procesos de Node.js..." -ForegroundColor Red
    $npmProcesses | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "    - Proceso detenido: PID $($_.Id)" -ForegroundColor Gray
    }
    Write-Host "  [OK] Procesos de Node.js detenidos" -ForegroundColor Green
} else {
    Write-Host "  [INFO] No hay procesos de Node.js corriendo" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  [OK] Proyecto Detenido" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
