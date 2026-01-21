# Script para actualizar la versión del proyecto
# Uso: .\update-version.ps1 -Version "1.2.0" -Date "20260125"

param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [Parameter(Mandatory=$false)]
    [string]$Date = (Get-Date -Format "yyyyMMdd")
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Actualización de Versión" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nueva versión: $Version - $Date" -ForegroundColor Yellow
Write-Host ""

# Validar formato de versión (MAJOR.MINOR.PATCH)
if ($Version -notmatch '^\d+\.\d+\.\d+$') {
    Write-Host "[ERROR] Formato de versión inválido. Use: MAJOR.MINOR.PATCH (ej: 1.2.0)" -ForegroundColor Red
    exit 1
}

# Validar formato de fecha (YYYYMMDD)
if ($Date -notmatch '^\d{8}$') {
    Write-Host "[ERROR] Formato de fecha inválido. Use: YYYYMMDD (ej: 20260125)" -ForegroundColor Red
    exit 1
}

$FullVersion = "$Version - $Date"

# Función para actualizar archivo TypeScript de versión
function Update-VersionFile {
    param(
        [string]$FilePath
    )
    
    $content = @"
/**
 * Configuración de versión de la aplicación
 * Formato: MAJOR.MINOR.PATCH - YYYYMMDD
 */
export const APP_VERSION = {
  version: '$Version',
  date: '$Date',
  fullVersion: '$FullVersion',
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
"@
    
    Set-Content -Path $FilePath -Value $content -Encoding UTF8
    Write-Host "[OK] Actualizado: $FilePath" -ForegroundColor Green
}

# Función para actualizar package.json
function Update-PackageJson {
    param(
        [string]$FilePath
    )
    
    $json = Get-Content -Path $FilePath -Raw | ConvertFrom-Json
    $json.version = $Version
    $json | ConvertTo-Json -Depth 100 | Set-Content -Path $FilePath -Encoding UTF8
    Write-Host "[OK] Actualizado: $FilePath" -ForegroundColor Green
}

# Actualizar archivos del frontend
Write-Host "[1/4] Actualizando frontend..." -ForegroundColor Yellow
Update-VersionFile -FilePath "frontend\src\config\version.ts"
Update-PackageJson -FilePath "frontend\package.json"
Write-Host ""

# Actualizar archivos del backend
Write-Host "[2/4] Actualizando backend..." -ForegroundColor Yellow
Update-VersionFile -FilePath "backend\src\config\version.ts"
Update-PackageJson -FilePath "backend\package.json"
Write-Host ""

# Actualizar VERSION.md
Write-Host "[3/4] Actualizando VERSION.md..." -ForegroundColor Yellow
$versionMdContent = Get-Content -Path "VERSION.md" -Raw
$versionMdContent = $versionMdContent -replace '## Versión Actual\s+\*\*[\d\.]+ - \d+\*\*', "## Versión Actual`n**$FullVersion**"
Set-Content -Path "VERSION.md" -Value $versionMdContent -Encoding UTF8
Write-Host "[OK] Actualizado: VERSION.md" -ForegroundColor Green
Write-Host ""

# Mostrar resumen
Write-Host "[4/4] Resumen de cambios" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Versión actualizada a: $FullVersion" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos modificados:" -ForegroundColor White
Write-Host "  - frontend/src/config/version.ts" -ForegroundColor Gray
Write-Host "  - frontend/package.json" -ForegroundColor Gray
Write-Host "  - backend/src/config/version.ts" -ForegroundColor Gray
Write-Host "  - backend/package.json" -ForegroundColor Gray
Write-Host "  - VERSION.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Revisar los cambios" -ForegroundColor White
Write-Host "  2. Reiniciar el proyecto si está corriendo" -ForegroundColor White
Write-Host "  3. Hacer commit de los cambios" -ForegroundColor White
Write-Host ""
Write-Host "[OK] Actualización completada!" -ForegroundColor Green
Write-Host ""
