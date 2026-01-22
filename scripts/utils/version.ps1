# Script de gestión de versiones
# Uso: .\scripts\utils\version.ps1 [show|bump|major|minor|patch]

param(
    [Parameter(Position=0)]
    [ValidateSet('show', 'bump', 'major', 'minor', 'patch', '')]
    [string]$Action = 'show'
)

$ErrorActionPreference = "Stop"

function Show-Version {
    Write-Host ""
    node scripts/utils/show-version.js
}

function Bump-Version {
    param([string]$Type = 'patch')
    
    Write-Host ""
    Write-Host "🚀 Incrementando versión ($Type)..." -ForegroundColor Cyan
    Write-Host ""
    
    node scripts/utils/bump-version.js $Type
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Versión actualizada correctamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "💡 Recuerda hacer commit de los cambios:" -ForegroundColor Yellow
        Write-Host "   git add ." -ForegroundColor Gray
        Write-Host "   git commit -m ""chore: bump version to X.X.X""" -ForegroundColor Gray
        Write-Host ""
    }
}

# Ejecutar acción
switch ($Action) {
    'show' {
        Show-Version
    }
    'bump' {
        Bump-Version 'patch'
    }
    'major' {
        Bump-Version 'major'
    }
    'minor' {
        Bump-Version 'minor'
    }
    'patch' {
        Bump-Version 'patch'
    }
    default {
        Show-Version
    }
}
