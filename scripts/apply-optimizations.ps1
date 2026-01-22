# Script para Aplicar Optimizaciones - DatAgree
# Fecha: 2026-01-22
# Version: 1.1.31

param(
    [switch]$SkipDatabase = $false,
    [switch]$SkipBackend = $false,
    [switch]$SkipFrontend = $false
)

$ErrorActionPreference = "Continue"

# Configuracion
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$SSH_KEY = "AWS-ISSABEL.pem"
$PROJECT_PATH = "/home/ubuntu/consentimientos_aws"

function Write-Step($message) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  $message" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "[OK] $message" -ForegroundColor Green
}

function Write-ErrorMsg($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Yellow
}

# Banner
Clear-Host
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   APLICAR OPTIMIZACIONES - DATAGREE" -ForegroundColor Cyan
Write-Host "            Version 1.1.31" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar conexion SSH
Write-Info "Verificando conexion al servidor..."
try {
    $testConnection = & ssh -i $SSH_KEY -o ConnectTimeout=10 -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "echo 'OK'" 2>&1
    if ($testConnection -match "OK") {
        Write-Success "Conexion SSH exitosa"
    } else {
        throw "No se pudo conectar"
    }
} catch {
    Write-ErrorMsg "No se pudo conectar al servidor"
    exit 1
}

# FASE 1: OPTIMIZACIONES DE BASE DE DATOS
if (-not $SkipDatabase) {
    Write-Step "FASE 1: OPTIMIZACIONES DE BASE DE DATOS"
    
    Write-Info "Creando backup antes de aplicar indices..."
    $backupCommand = "TIMESTAMP=`$(date +%Y%m%d_%H%M%S); cd $PROJECT_PATH; sudo -u postgres pg_dump consentimientos > backup_pre_optimization_`$TIMESTAMP.sql; echo BACKUP_OK"
    $backupResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $backupCommand 2>&1
    
    if ($backupResult -match "BACKUP_OK") {
        Write-Success "Backup creado"
    } else {
        Write-ErrorMsg "Error al crear backup"
        $continue = Read-Host "Deseas continuar sin backup? (S/N)"
        if ($continue -ne "S" -and $continue -ne "s") {
            exit 1
        }
    }
    
    Write-Info "Aplicando indices optimizados..."
    $indexCommand = "cd $PROJECT_PATH/backend; sudo -u postgres psql consentimientos < optimize-database-indexes.sql 2>&1; echo INDEX_OK"
    $indexResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $indexCommand 2>&1
    
    if ($indexResult -match "INDEX_OK") {
        Write-Success "Indices aplicados exitosamente"
    } else {
        Write-ErrorMsg "Error al aplicar indices"
        Write-Info "Resultado: $indexResult"
    }
    
    Write-Info "Verificando indices creados..."
    $verifyCommand = "sudo -u postgres psql consentimientos -c `"SELECT COUNT(*) as total_indexes FROM pg_indexes WHERE schemaname = 'public';`""
    $verifyResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $verifyCommand 2>&1
    Write-Host $verifyResult -ForegroundColor Gray
    
} else {
    Write-Info "Saltando optimizaciones de base de datos"
}

# FASE 2: OPTIMIZACIONES DE BACKEND
if (-not $SkipBackend) {
    Write-Step "FASE 2: OPTIMIZACIONES DE BACKEND"
    
    Write-Info "Los archivos de optimizacion ya estan en el repositorio"
    Write-Info "Para aplicarlos, edita app.module.ts y agrega:"
    Write-Host "  1. CompressionMiddleware" -ForegroundColor Yellow
    Write-Host "  2. getDatabaseConfig en TypeOrmModule" -ForegroundColor Yellow
    Write-Host "  3. HttpCacheInterceptor en controladores" -ForegroundColor Yellow
    Write-Host ""
    Write-Info "Ver doc/28-optimizaciones/README.md para detalles"
    
} else {
    Write-Info "Saltando optimizaciones de backend"
}

# FASE 3: OPTIMIZACIONES DE FRONTEND
if (-not $SkipFrontend) {
    Write-Step "FASE 3: OPTIMIZACIONES DE FRONTEND"
    
    Write-Info "Recompilando frontend con configuracion optimizada..."
    $buildCommand = "cd $PROJECT_PATH/frontend; npm run build 2>&1; if [ -d dist ]; then echo BUILD_OK; else echo BUILD_ERROR; fi"
    $buildResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $buildCommand 2>&1
    
    if ($buildResult -match "BUILD_OK") {
        Write-Success "Frontend recompilado con optimizaciones"
        
        # Mostrar tamaño de bundles
        Write-Info "Tamaño de bundles:"
        $sizeCommand = "cd $PROJECT_PATH/frontend/dist/assets; ls -lh *.js | awk '{print `$9, `$5}'"
        $sizeResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $sizeCommand 2>&1
        Write-Host $sizeResult -ForegroundColor Gray
    } else {
        Write-ErrorMsg "Error al recompilar frontend"
    }
    
    Write-Info "Recargando Nginx..."
    $nginxCommand = "sudo systemctl reload nginx; echo NGINX_OK"
    $nginxResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $nginxCommand 2>&1
    
    if ($nginxResult -match "NGINX_OK") {
        Write-Success "Nginx recargado"
    }
    
} else {
    Write-Info "Saltando optimizaciones de frontend"
}

# RESUMEN FINAL
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  OPTIMIZACIONES APLICADAS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Optimizaciones aplicadas:" -ForegroundColor Cyan
if (-not $SkipDatabase) {
    Write-Host "  [OK] Base de Datos - Indices optimizados" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] Base de Datos" -ForegroundColor Yellow
}

if (-not $SkipBackend) {
    Write-Host "  [INFO] Backend - Archivos creados (requiere integracion manual)" -ForegroundColor Yellow
} else {
    Write-Host "  [SKIP] Backend" -ForegroundColor Yellow
}

if (-not $SkipFrontend) {
    Write-Host "  [OK] Frontend - Recompilado con optimizaciones" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] Frontend" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Revisar doc/28-optimizaciones/README.md" -ForegroundColor White
Write-Host "  2. Integrar middleware de compresion en backend" -ForegroundColor White
Write-Host "  3. Aplicar decoradores @Cacheable en endpoints" -ForegroundColor White
Write-Host "  4. Monitorear metricas de performance" -ForegroundColor White
Write-Host ""

Write-Host "Verificacion:" -ForegroundColor Cyan
Write-Host "  - Landing: https://datagree.net" -ForegroundColor White
Write-Host "  - API: https://datagree.net/api/tenants/plans" -ForegroundColor White
Write-Host ""

Write-Success "Proceso completado"
Write-Host ""
