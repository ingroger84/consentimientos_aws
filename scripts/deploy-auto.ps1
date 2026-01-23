# Script de Despliegue Automatico - DatAgree
# Fecha: 2026-01-21
# Version: 1.1.28

param(
    [switch]$SkipBackup = $false,
    [switch]$SkipTests = $false
)

$ErrorActionPreference = "Continue"

# Configuracion
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$SSH_KEY = "AWS-ISSABEL.pem"
$PROJECT_PATH = "/home/ubuntu/archivoenlinea_aws"

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
Write-Host "   DESPLIEGUE AUTOMATICO - ARCHIVO EN LINEA" -ForegroundColor Cyan
Write-Host "            Version 1.1.28" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe la clave SSH
if (-not (Test-Path $SSH_KEY)) {
    Write-ErrorMsg "No se encuentra la clave SSH: $SSH_KEY"
    Write-Info "Asegurate de que el archivo AWS-ISSABEL.pem este en la raiz del proyecto"
    exit 1
}

Write-Success "Clave SSH encontrada: $SSH_KEY"

# Verificar conectividad al servidor
Write-Step "VERIFICANDO CONECTIVIDAD"
Write-Info "Probando conexion SSH al servidor..."

try {
    $testConnection = & ssh -i $SSH_KEY -o ConnectTimeout=10 -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "echo 'OK'" 2>&1
    if ($testConnection -match "OK") {
        Write-Success "Conexion SSH exitosa"
    } else {
        throw "No se pudo conectar"
    }
} catch {
    Write-ErrorMsg "No se pudo conectar al servidor"
    Write-Info "Verifica que el servidor este encendido y accesible"
    exit 1
}

# Paso 1: Backup de Base de Datos
if (-not $SkipBackup) {
    Write-Step "PASO 1: BACKUP DE BASE DE DATOS"
    Write-Info "Creando backup de la base de datos..."
    
    $backupCommand = "TIMESTAMP=`$(date +%Y%m%d_%H%M%S); cd $PROJECT_PATH; sudo -u postgres pg_dump consentimientos > backup_`$TIMESTAMP.sql 2>&1; if [ -f backup_`$TIMESTAMP.sql ]; then echo BACKUP_OK:`$TIMESTAMP; else echo BACKUP_ERROR; fi"
    
    $backupResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $backupCommand 2>&1
    
    if ($backupResult -match "BACKUP_OK:(.+)") {
        $backupFile = $matches[1]
        Write-Success "Backup creado: backup_$backupFile.sql"
    } else {
        Write-ErrorMsg "Error al crear backup"
        Write-Info "Resultado: $backupResult"
        $continue = Read-Host "Deseas continuar sin backup? (S/N)"
        if ($continue -ne "S" -and $continue -ne "s") {
            exit 1
        }
    }
} else {
    Write-Info "Saltando backup (parametro -SkipBackup)"
}

# Paso 2: Actualizar codigo desde GitHub
Write-Step "PASO 2: ACTUALIZAR CODIGO DESDE GITHUB"
Write-Info "Haciendo git pull..."

$gitCommand = "cd $PROJECT_PATH; git fetch origin; git reset --hard origin/main; git pull origin main; echo GIT_OK"

$gitResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $gitCommand 2>&1

if ($gitResult -match "GIT_OK") {
    Write-Success "Codigo actualizado desde GitHub"
} else {
    Write-ErrorMsg "Error al actualizar codigo"
    Write-Info "Resultado: $gitResult"
    exit 1
}

# Paso 3: Crear tabla de notificaciones
Write-Step "PASO 3: CREAR TABLA DE NOTIFICACIONES"
Write-Info "Ejecutando migracion de base de datos..."

$sqlCommand = @"
sudo -u postgres psql consentimientos << 'EOSQL'
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    read BOOLEAN DEFAULT FALSE,
    "userId" UUID,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications("createdAt" DESC);

SELECT 'TABLE_OK' as status;
EOSQL
"@

$sqlResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $sqlCommand 2>&1

if ($sqlResult -match "TABLE_OK") {
    Write-Success "Tabla de notificaciones creada/verificada"
} else {
    Write-ErrorMsg "Error al crear tabla de notificaciones"
    Write-Info "Resultado: $sqlResult"
    exit 1
}

# Paso 4: Instalar dependencias del backend
Write-Step "PASO 4: INSTALAR DEPENDENCIAS DEL BACKEND"
Write-Info "Ejecutando npm install en backend..."

$backendCommand = "cd $PROJECT_PATH/backend; npm install 2>&1; if [ `$? -eq 0 ]; then echo BACKEND_DEPS_OK; else echo BACKEND_DEPS_ERROR; fi"

$backendResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $backendCommand 2>&1

if ($backendResult -match "BACKEND_DEPS_OK") {
    Write-Success "Dependencias del backend instaladas"
} else {
    Write-ErrorMsg "Error al instalar dependencias del backend"
    Write-Info "Resultado: $backendResult"
    exit 1
}

# Paso 5: Verificar/Actualizar variable de entorno
Write-Step "PASO 5: VERIFICAR VARIABLES DE ENTORNO"
Write-Info "Verificando SUPER_ADMIN_EMAIL en .env..."

$envCommand = "cd $PROJECT_PATH/backend; if grep -q 'SUPER_ADMIN_EMAIL' .env; then echo ENV_EXISTS; else echo 'SUPER_ADMIN_EMAIL=rcaraballo@innovasystems.com.co' >> .env; echo ENV_ADDED; fi"

$envResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $envCommand 2>&1

if ($envResult -match "ENV_EXISTS") {
    Write-Success "Variable SUPER_ADMIN_EMAIL ya existe"
} elseif ($envResult -match "ENV_ADDED") {
    Write-Success "Variable SUPER_ADMIN_EMAIL agregada"
} else {
    Write-Info "No se pudo verificar la variable de entorno"
}

# Paso 6: Reiniciar backend con PM2
Write-Step "PASO 6: REINICIAR BACKEND CON PM2"
Write-Info "Reiniciando proceso datagree-backend..."

$pm2Command = "pm2 restart archivoenlinea-backend; sleep 3; if pm2 list | grep -q 'archivoenlinea-backend.*online'; then echo PM2_OK; else echo PM2_ERROR; fi"

$pm2Result = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $pm2Command 2>&1

if ($pm2Result -match "PM2_OK") {
    Write-Success "Backend reiniciado exitosamente"
} else {
    Write-ErrorMsg "Error al reiniciar backend"
    Write-Info "Resultado: $pm2Result"
    exit 1
}

# Paso 7: Instalar dependencias del frontend
Write-Step "PASO 7: INSTALAR DEPENDENCIAS DEL FRONTEND"
Write-Info "Ejecutando npm install en frontend..."

$frontendDepsCommand = "cd $PROJECT_PATH/frontend; npm install 2>&1; if [ `$? -eq 0 ]; then echo FRONTEND_DEPS_OK; else echo FRONTEND_DEPS_ERROR; fi"

$frontendDepsResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $frontendDepsCommand 2>&1

if ($frontendDepsResult -match "FRONTEND_DEPS_OK") {
    Write-Success "Dependencias del frontend instaladas"
} else {
    Write-ErrorMsg "Error al instalar dependencias del frontend"
    Write-Info "Resultado: $frontendDepsResult"
    exit 1
}

# Paso 8: Compilar frontend
Write-Step "PASO 8: COMPILAR FRONTEND"
Write-Info "Ejecutando npm run build..."

$frontendBuildCommand = "cd $PROJECT_PATH/frontend; npm run build 2>&1; if [ -d dist ]; then echo FRONTEND_BUILD_OK; else echo FRONTEND_BUILD_ERROR; fi"

$frontendBuildResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $frontendBuildCommand 2>&1

if ($frontendBuildResult -match "FRONTEND_BUILD_OK") {
    Write-Success "Frontend compilado exitosamente"
} else {
    Write-ErrorMsg "Error al compilar frontend"
    Write-Info "Resultado: $frontendBuildResult"
    exit 1
}

# Paso 9: Verificar estado final
Write-Step "PASO 9: VERIFICACION FINAL"
Write-Info "Verificando estado del sistema..."

$verifyCommand = "pm2 list | grep archivoenlinea-backend; echo ''; curl -s http://localhost:3000/api/tenants/plans | head -c 100; echo ''; echo VERIFY_OK"

$verifyResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $verifyCommand 2>&1

Write-Host ""
Write-Host "Estado del sistema:" -ForegroundColor Cyan
Write-Host $verifyResult -ForegroundColor Gray

# Tests opcionales
if (-not $SkipTests) {
    Write-Step "PASO 10: PRUEBAS BASICAS"
    Write-Info "Ejecutando pruebas basicas..."
    
    # Test 1: API responde
    Write-Info "Test 1: Verificando que la API responde..."
    try {
        $apiTest = Invoke-WebRequest -Uri "https://archivoenlinea.com/api/tenants/plans" -UseBasicParsing -TimeoutSec 10
        if ($apiTest.StatusCode -eq 200) {
            Write-Success "API responde correctamente (200 OK)"
        }
    } catch {
        Write-ErrorMsg "API no responde: $_"
    }
    
    # Test 2: Landing page carga
    Write-Info "Test 2: Verificando que la landing page carga..."
    try {
        $landingTest = Invoke-WebRequest -Uri "https://archivoenlinea.com" -UseBasicParsing -TimeoutSec 10
        if ($landingTest.StatusCode -eq 200) {
            Write-Success "Landing page carga correctamente (200 OK)"
        }
    } catch {
        Write-ErrorMsg "Landing page no carga: $_"
    }
} else {
    Write-Info "Saltando pruebas (parametro -SkipTests)"
}

# Resumen final
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DESPLIEGUE COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "URLs de verificacion:" -ForegroundColor Cyan
Write-Host "  - Landing Page: https://archivoenlinea.com" -ForegroundColor Yellow
Write-Host "  - Admin Panel:  https://admin.archivoenlinea.com" -ForegroundColor Yellow
Write-Host "  - API:          https://archivoenlinea.com/api" -ForegroundColor Yellow
Write-Host ""

Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Abre https://archivoenlinea.com en tu navegador" -ForegroundColor White
Write-Host "  2. Verifica que la landing page carga correctamente" -ForegroundColor White
Write-Host "  3. Prueba el registro de una cuenta de prueba" -ForegroundColor White
Write-Host "  4. Verifica que lleguen los correos" -ForegroundColor White
Write-Host "  5. Revisa las notificaciones en el dashboard del Super Admin" -ForegroundColor White
Write-Host ""

Write-Host "Logs del backend:" -ForegroundColor Cyan
Write-Host "  ssh -i $SSH_KEY ${SERVER_USER}@${SERVER_IP} 'pm2 logs archivoenlinea-backend'" -ForegroundColor Gray
Write-Host ""

Write-Success "Despliegue finalizado"
Write-Host ""
