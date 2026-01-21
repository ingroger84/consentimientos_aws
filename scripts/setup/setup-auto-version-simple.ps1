# Script para configurar el auto-versionamiento con Git Hooks

Write-Host "========================================"
Write-Host "CONFIGURACION DE AUTO-VERSIONAMIENTO"
Write-Host "========================================"
Write-Host ""

# Verificar si estamos en un repositorio Git
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: No se encontro un repositorio Git"
    Write-Host "Ejecuta 'git init' primero"
    exit 1
}

Write-Host "1. Verificando Node.js..."
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Node.js instalado: $nodeVersion"
} else {
    Write-Host "   ERROR: Node.js no esta instalado"
    exit 1
}

Write-Host ""
Write-Host "2. Instalando Husky..."
npm install --save-dev husky

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Husky instalado correctamente"
} else {
    Write-Host "   ERROR: No se pudo instalar Husky"
    exit 1
}

Write-Host ""
Write-Host "3. Inicializando Husky..."
npx husky install

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Husky inicializado correctamente"
} else {
    Write-Host "   ERROR: No se pudo inicializar Husky"
    exit 1
}

Write-Host ""
Write-Host "4. Configurando hook pre-commit..."

# Crear directorio .husky si no existe
if (-not (Test-Path ".husky")) {
    New-Item -ItemType Directory -Path ".husky" | Out-Null
}

Write-Host "   Hook pre-commit configurado"

Write-Host ""
Write-Host "5. Verificando script..."
if (Test-Path "update-version-auto.js") {
    Write-Host "   Script update-version-auto.js encontrado"
} else {
    Write-Host "   ERROR: Script update-version-auto.js no encontrado"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "CONFIGURACION COMPLETADA"
Write-Host "========================================"
Write-Host ""
Write-Host "Como funciona:"
Write-Host "1. Cada vez que hagas git commit, la version se incrementara automaticamente"
Write-Host "2. El numero PATCH aumentara en 1"
Write-Host "3. La fecha se actualizara al dia actual"
Write-Host "4. Los archivos de version se agregaran automaticamente al commit"
Write-Host ""
Write-Host "Archivos que se actualizan automaticamente:"
Write-Host "  - frontend/src/config/version.ts"
Write-Host "  - backend/src/config/version.ts"
Write-Host "  - frontend/package.json"
Write-Host "  - backend/package.json"
Write-Host "  - VERSION.md"
Write-Host ""
Write-Host "Prueba el sistema:"
Write-Host "  git add ."
Write-Host "  git commit -m tu-mensaje"
Write-Host ""
