#!/usr/bin/env pwsh
# Script para configurar el auto-versionamiento con Git Hooks

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN DE AUTO-VERSIONAMIENTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si estamos en un repositorio Git
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: No se encontró un repositorio Git" -ForegroundColor Red
    Write-Host "Ejecuta 'git init' primero" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Node.js no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Instalando Husky..." -ForegroundColor Yellow
npm install --save-dev husky

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Husky instalado correctamente" -ForegroundColor Green
} else {
    Write-Host "   ERROR: No se pudo instalar Husky" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Inicializando Husky..." -ForegroundColor Yellow
npx husky install

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Husky inicializado correctamente" -ForegroundColor Green
} else {
    Write-Host "   ERROR: No se pudo inicializar Husky" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "4. Configurando hook pre-commit..." -ForegroundColor Yellow

# Crear directorio .husky si no existe
if (-not (Test-Path ".husky")) {
    New-Item -ItemType Directory -Path ".husky" | Out-Null
}

# Crear archivo pre-commit
$preCommitContent = @'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Auto-incrementar version antes de cada commit
echo "Actualizando version del sistema..."
node update-version-auto.js

# Agregar archivos de version al commit
git add frontend/src/config/version.ts
git add backend/src/config/version.ts
git add frontend/package.json
git add backend/package.json
git add VERSION.md

echo "Version actualizada automaticamente"
'@

Set-Content -Path ".husky/pre-commit" -Value $preCommitContent -NoNewline

# Hacer el archivo ejecutable (en sistemas Unix)
if ($IsLinux -or $IsMacOS) {
    chmod +x .husky/pre-commit
}

Write-Host "   Hook pre-commit configurado" -ForegroundColor Green

Write-Host ""
Write-Host "5. Haciendo el script ejecutable..." -ForegroundColor Yellow
if (Test-Path "update-version-auto.js") {
    Write-Host "   Script update-version-auto.js encontrado" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Script update-version-auto.js no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACION COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Como funciona:" -ForegroundColor Yellow
Write-Host "1. Cada vez que hagas 'git commit', la version se incrementara automaticamente" -ForegroundColor White
Write-Host "2. El numero PATCH aumentara en 1 (ej: 1.1.1 -> 1.1.2)" -ForegroundColor White
Write-Host "3. La fecha se actualizara al dia actual" -ForegroundColor White
Write-Host "4. Los archivos de version se agregaran automaticamente al commit" -ForegroundColor White
Write-Host ""
Write-Host "Archivos que se actualizan automaticamente:" -ForegroundColor Yellow
Write-Host "  - frontend/src/config/version.ts" -ForegroundColor White
Write-Host "  - backend/src/config/version.ts" -ForegroundColor White
Write-Host "  - frontend/package.json" -ForegroundColor White
Write-Host "  - backend/package.json" -ForegroundColor White
Write-Host "  - VERSION.md" -ForegroundColor White
Write-Host ""
Write-Host "Prueba el sistema:" -ForegroundColor Cyan
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m mensaje" -ForegroundColor White
Write-Host ""
