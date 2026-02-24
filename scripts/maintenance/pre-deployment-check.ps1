# Script de Verificación Pre-Despliegue
# Verifica que todo esté listo antes de desplegar
# Versión: 1.0

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN PRE-DESPLIEGUE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allChecks = @()

# Check 1: AWS CLI instalado
Write-Host "1. Verificando AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "   ✓ AWS CLI instalado: $awsVersion" -ForegroundColor Green
    $allChecks += $true
}
catch {
    Write-Host "   ✗ AWS CLI no instalado" -ForegroundColor Red
    Write-Host "     Instala con: winget install Amazon.AWSCLI" -ForegroundColor Yellow
    $allChecks += $false
}

# Check 2: Credenciales AWS configuradas
Write-Host "2. Verificando credenciales AWS..." -ForegroundColor Yellow
$env:AWS_ACCESS_KEY_ID = "TU_AWS_ACCESS_KEY_LIGHTSAIL"
$env:AWS_SECRET_ACCESS_KEY = "TU_AWS_SECRET_KEY_LIGHTSAIL"
$env:AWS_DEFAULT_REGION = "us-east-1"

try {
    $identity = aws sts get-caller-identity --output json 2>&1 | ConvertFrom-Json
    Write-Host "   ✓ Credenciales válidas" -ForegroundColor Green
    Write-Host "     Account: $($identity.Account)" -ForegroundColor Gray
    $allChecks += $true
}
catch {
    Write-Host "   ✗ Credenciales inválidas" -ForegroundColor Red
    $allChecks += $false
}

# Check 3: Git instalado
Write-Host "3. Verificando Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "   ✓ Git instalado: $gitVersion" -ForegroundColor Green
    $allChecks += $true
}
catch {
    Write-Host "   ✗ Git no instalado" -ForegroundColor Red
    $allChecks += $false
}

# Check 4: Repositorio Git
Write-Host "4. Verificando repositorio Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    $remote = git remote get-url origin 2>&1
    Write-Host "   ✓ Repositorio Git encontrado" -ForegroundColor Green
    Write-Host "     Remote: $remote" -ForegroundColor Gray
    $allChecks += $true
}
else {
    Write-Host "   ✗ No es un repositorio Git" -ForegroundColor Red
    $allChecks += $false
}

# Check 5: Scripts de despliegue
Write-Host "5. Verificando scripts de despliegue..." -ForegroundColor Yellow
$scripts = @(
    "scripts/deploy-master.ps1",
    "scripts/setup-production-server.ps1",
    "scripts/deploy-production-complete.ps1",
    "scripts/configure-nginx-ssl.sh"
)

$scriptsOk = $true
foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "   ✓ $script" -ForegroundColor Green
    }
    else {
        Write-Host "   ✗ $script no encontrado" -ForegroundColor Red
        $scriptsOk = $false
    }
}
$allChecks += $scriptsOk

# Check 6: Archivos de configuración
Write-Host "6. Verificando archivos de configuración..." -ForegroundColor Yellow
$configs = @(
    "backend/.env",
    "frontend/.env",
    "ecosystem.config.js"
)

$configsOk = $true
foreach ($config in $configs) {
    if (Test-Path $config) {
        Write-Host "   ✓ $config" -ForegroundColor Green
    }
    else {
        Write-Host "   ⚠ $config no encontrado (se creará automáticamente)" -ForegroundColor Yellow
    }
}
$allChecks += $true

# Check 7: Dependencias Node.js
Write-Host "7. Verificando dependencias..." -ForegroundColor Yellow
if ((Test-Path "backend/node_modules") -and (Test-Path "frontend/node_modules")) {
    Write-Host "   ✓ Dependencias instaladas localmente" -ForegroundColor Green
    $allChecks += $true
}
else {
    Write-Host "   ⚠ Dependencias no instaladas (se instalarán en el servidor)" -ForegroundColor Yellow
    $allChecks += $true
}

# Check 8: Versión de la aplicación
Write-Host "8. Verificando versión..." -ForegroundColor Yellow
if (Test-Path "VERSION.md") {
    $version = Get-Content "VERSION.md" -First 1
    Write-Host "   ✓ Versión: $version" -ForegroundColor Green
    $allChecks += $true
}
else {
    Write-Host "   ⚠ VERSION.md no encontrado" -ForegroundColor Yellow
    $allChecks += $true
}

# Check 9: Documentación
Write-Host "9. Verificando documentación..." -ForegroundColor Yellow
if (Test-Path "DEPLOYMENT.md") {
    Write-Host "   ✓ DEPLOYMENT.md encontrado" -ForegroundColor Green
    $allChecks += $true
}
else {
    Write-Host "   ⚠ DEPLOYMENT.md no encontrado" -ForegroundColor Yellow
    $allChecks += $true
}

# Check 10: Conexión a Lightsail
Write-Host "10. Verificando conexión a Lightsail..." -ForegroundColor Yellow
try {
    $instances = aws lightsail get-instances --region us-east-1 --output json 2>&1 | ConvertFrom-Json
    Write-Host "   ✓ Conexión exitosa a Lightsail" -ForegroundColor Green
    Write-Host "     Instancias disponibles: $($instances.instances.Count)" -ForegroundColor Gray
    $allChecks += $true
}
catch {
    Write-Host "   ✗ Error al conectar con Lightsail" -ForegroundColor Red
    $allChecks += $false
}

# Resumen
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = ($allChecks | Where-Object { $_ -eq $true }).Count
$total = $allChecks.Count
$percentage = [math]::Round(($passed / $total) * 100, 0)

Write-Host "Checks completados: $passed/$total ($percentage%)" -ForegroundColor White
Write-Host ""

if ($passed -eq $total) {
    Write-Host "✓ LISTO PARA DESPLEGAR" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ejecuta:" -ForegroundColor Yellow
    Write-Host "  .\scripts\deploy-master.ps1 -All" -ForegroundColor White
    Write-Host ""
}
elseif ($passed -ge ($total * 0.8)) {
    Write-Host "⚠ CASI LISTO" -ForegroundColor Yellow
    Write-Host "  Revisa las advertencias y procede con precaución" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host "✗ NO LISTO PARA DESPLEGAR" -ForegroundColor Red
    Write-Host "  Corrige los errores antes de continuar" -ForegroundColor White
    Write-Host ""
}

# Checklist interactiva
Write-Host "Checklist manual:" -ForegroundColor Yellow
Write-Host "  [ ] DNS configurado (archivoenlinea.com → IP servidor)" -ForegroundColor White
Write-Host "  [ ] Wildcard DNS configurado (*.archivoenlinea.com → IP servidor)" -ForegroundColor White
Write-Host "  [ ] Credenciales de producción preparadas" -ForegroundColor White
Write-Host "  [ ] Backup de datos existentes (si aplica)" -ForegroundColor White
Write-Host "  [ ] Equipo notificado del despliegue" -ForegroundColor White
Write-Host ""

Write-Host "Documentación:" -ForegroundColor Yellow
Write-Host "  • Guía completa: doc/DESPLIEGUE_AUTOMATIZADO.md" -ForegroundColor White
Write-Host "  • Troubleshooting: DEPLOYMENT.md" -ForegroundColor White
Write-Host ""
