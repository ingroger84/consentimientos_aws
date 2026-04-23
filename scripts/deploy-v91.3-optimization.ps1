# =====================================================
# Script de Despliegue v91.3 - Optimizacion Dashboard
# =====================================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE v91.3 - OPTIMIZACION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuracion
$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "AWS-ISSABEL.pem"
$BACKEND_PATH = "/home/ubuntu/consentimientos_aws/backend"
$VERSION = "v91.3"

# Paso 1: Compilar backend
Write-Host "[1/6] Compilando backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar backend" -ForegroundColor Red
    exit 1
}
Write-Host "OK Backend compilado exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 2: Crear tarball
Write-Host "[2/6] Creando tarball..." -ForegroundColor Yellow
$tarballName = "backend-$VERSION-dist.tar.gz"
tar -czf $tarballName -C . dist
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al crear tarball" -ForegroundColor Red
    exit 1
}
Write-Host "OK Tarball creado: $tarballName" -ForegroundColor Green
Write-Host ""

# Paso 3: Subir tarball
Write-Host "[3/6] Subiendo tarball al servidor..." -ForegroundColor Yellow
scp -i ../$KEY $tarballName ${USER}@${SERVER}:/home/ubuntu/
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir tarball" -ForegroundColor Red
    exit 1
}
Write-Host "OK Tarball subido exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 4: Subir script de migracion
Write-Host "[4/6] Subiendo script de indices..." -ForegroundColor Yellow
scp -i ../$KEY migrations/add-performance-indexes.sql ${USER}@${SERVER}:/home/ubuntu/
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir script de indices" -ForegroundColor Red
    exit 1
}
Write-Host "OK Script de indices subido" -ForegroundColor Green
Write-Host ""

# Paso 5: Aplicar indices en base de datos
Write-Host "[5/6] Aplicando indices en base de datos..." -ForegroundColor Yellow
Write-Host "IMPORTANTE: Esto puede tomar varios minutos" -ForegroundColor Cyan
Write-Host ""

$applyIndexes = Read-Host "Deseas aplicar los indices ahora? (s/n)"
if ($applyIndexes -eq "s") {
    ssh -i ../$KEY ${USER}@${SERVER} "cd /home/ubuntu && sudo -u postgres psql -d consentimientos_db -f add-performance-indexes.sql"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error al aplicar indices" -ForegroundColor Red
        Write-Host "Puedes aplicarlos manualmente mas tarde" -ForegroundColor Yellow
    } else {
        Write-Host "OK Indices aplicados exitosamente" -ForegroundColor Green
    }
} else {
    Write-Host "AVISO: Indices NO aplicados. Recuerda aplicarlos manualmente" -ForegroundColor Yellow
}
Write-Host ""

# Paso 6: Desplegar codigo
Write-Host "[6/6] Desplegando codigo optimizado..." -ForegroundColor Yellow
ssh -i ../$KEY ${USER}@${SERVER} @"
    echo '=== Iniciando despliegue ==='
    cd $BACKEND_PATH
    
    # Crear backup
    BACKUP_DIR="dist_backup_${VERSION}_`$(date +%Y%m%d_%H%M%S)"
    echo "Creando backup: \$BACKUP_DIR"
    cp -r dist \$BACKUP_DIR
    
    # Extraer nuevo codigo
    echo 'Extrayendo nuevo codigo...'
    tar -xzf /home/ubuntu/$tarballName
    
    # Reiniciar servicio
    echo 'Reiniciando servicio PM2...'
    pm2 restart datagree
    
    # Esperar a que inicie
    sleep 3
    
    # Verificar estado
    echo ''
    echo '=== Estado del servicio ==='
    pm2 status datagree
    
    echo ''
    echo '=== Ultimas lineas del log ==='
    pm2 logs datagree --lines 20 --nostream
    
    echo ''
    echo '=== Despliegue completado ==='
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error durante el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  OK DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "1. Verificar servicio: pm2 status datagree" -ForegroundColor White
Write-Host "2. Monitorear logs: pm2 logs datagree" -ForegroundColor White
Write-Host "3. Probar dashboard de Super Admin" -ForegroundColor White
Write-Host "4. Buscar en logs: 'Calculating fresh stats'" -ForegroundColor White
Write-Host ""
Write-Host "Documentacion: OPTIMIZACION_DASHBOARD_V91.3.md" -ForegroundColor Yellow
Write-Host ""

# Volver al directorio raiz
Set-Location ..
