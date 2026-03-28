# Script de Despliegue en Producción - v73.3.0
# Fecha: 2026-03-25
# Servidor: AWS datagree (100.28.198.249)
#
# RUTAS OFICIALES DEL PROYECTO:
# - Backend:  /home/ubuntu/consentimientos_aws/backend/dist/
# - Frontend: /home/ubuntu/consentimientos_aws/frontend/dist/
# - Nginx root: /home/ubuntu/consentimientos_aws/frontend/dist/
#
# IMPORTANTE: NO usar /var/www/html/ - esa ruta NO está configurada en nginx

param(
    [Parameter(Mandatory=$false)]
    [switch]$BackendOnly,
    
    [Parameter(Mandatory=$false)]
    [switch]$FrontendOnly,
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "73.3.0"
)

$ErrorActionPreference = "Stop"

# Configuración
$SERVER = "ubuntu@100.28.198.249"
$SSH_KEY = "AWS-ISSABEL.pem"
$BACKEND_PATH = "/home/ubuntu/consentimientos_aws/backend"
$FRONTEND_PATH = "/home/ubuntu/consentimientos_aws/frontend"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE EN PRODUCCIÓN v$Version" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar rutas
function Verify-Paths {
    Write-Host "Verificando rutas en el servidor..." -ForegroundColor Yellow
    
    $nginxRoot = ssh -i $SSH_KEY $SERVER "sudo cat /etc/nginx/sites-enabled/archivoenlinea | grep 'root ' | head -1"
    Write-Host "Nginx root configurado: $nginxRoot" -ForegroundColor Green
    
    if ($nginxRoot -notlike "*$FRONTEND_PATH/dist*") {
        Write-Host "⚠️  ADVERTENCIA: Nginx no apunta a la ruta esperada!" -ForegroundColor Red
        Write-Host "   Esperado: $FRONTEND_PATH/dist" -ForegroundColor Red
        Write-Host "   Actual: $nginxRoot" -ForegroundColor Red
        $continue = Read-Host "¿Continuar de todos modos? (s/n)"
        if ($continue -ne "s") {
            exit 1
        }
    }
}

# Función para desplegar backend
function Deploy-Backend {
    Write-Host ""
    Write-Host "📦 DESPLEGANDO BACKEND..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    # Compilar backend
    Write-Host "1. Compilando backend..." -ForegroundColor Yellow
    Push-Location backend
    npm run build
    Pop-Location
    
    # Crear archivo comprimido
    Write-Host "2. Creando archivo comprimido..." -ForegroundColor Yellow
    $backendFile = "backend-dist-v$Version.tar.gz"
    tar -czf $backendFile -C backend/dist .
    
    # Copiar al servidor
    Write-Host "3. Copiando al servidor..." -ForegroundColor Yellow
    scp -i $SSH_KEY $backendFile ${SERVER}:/home/ubuntu/
    
    # Desplegar en servidor
    Write-Host "4. Desplegando en servidor..." -ForegroundColor Yellow
    ssh -i $SSH_KEY $SERVER @"
cd $BACKEND_PATH
pm2 stop datagree
rm -rf dist
mkdir dist
tar -xzf /home/ubuntu/$backendFile -C dist/
pm2 restart datagree --update-env
"@
    
    # Verificar
    Write-Host "5. Verificando despliegue..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    $backendVersion = ssh -i $SSH_KEY $SERVER "pm2 list | grep datagree"
    Write-Host $backendVersion -ForegroundColor Green
    
    Write-Host "✅ Backend desplegado correctamente" -ForegroundColor Green
}

# Función para desplegar frontend
function Deploy-Frontend {
    Write-Host ""
    Write-Host "🎨 DESPLEGANDO FRONTEND..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    # Compilar frontend
    Write-Host "1. Compilando frontend..." -ForegroundColor Yellow
    Push-Location frontend
    npm run build
    Pop-Location
    
    # Crear archivo comprimido
    Write-Host "2. Creando archivo comprimido..." -ForegroundColor Yellow
    $frontendFile = "frontend-dist-v$Version.tar.gz"
    tar -czf $frontendFile -C frontend/dist .
    
    # Copiar al servidor
    Write-Host "3. Copiando al servidor..." -ForegroundColor Yellow
    scp -i $SSH_KEY $frontendFile ${SERVER}:/home/ubuntu/
    
    # Desplegar en servidor
    Write-Host "4. Desplegando en servidor..." -ForegroundColor Yellow
    ssh -i $SSH_KEY $SERVER @"
cd $FRONTEND_PATH
rm -rf dist
mkdir dist
tar -xzf /home/ubuntu/$frontendFile -C dist/
sudo systemctl reload nginx
"@
    
    # Verificar
    Write-Host "5. Verificando despliegue..." -ForegroundColor Yellow
    $frontendVersion = ssh -i $SSH_KEY $SERVER "cat $FRONTEND_PATH/dist/version.json"
    Write-Host $frontendVersion -ForegroundColor Green
    
    Write-Host "✅ Frontend desplegado correctamente" -ForegroundColor Green
}

# Función para verificar despliegue
function Verify-Deployment {
    Write-Host ""
    Write-Host "🔍 VERIFICANDO DESPLIEGUE..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    if (-not $FrontendOnly) {
        Write-Host "Backend:" -ForegroundColor Yellow
        ssh -i $SSH_KEY $SERVER "pm2 list | grep datagree"
        ssh -i $SSH_KEY $SERVER "cat $BACKEND_PATH/package.json | grep version | head -1"
    }
    
    if (-not $BackendOnly) {
        Write-Host ""
        Write-Host "Frontend:" -ForegroundColor Yellow
        ssh -i $SSH_KEY $SERVER "cat $FRONTEND_PATH/dist/version.json"
        
        Write-Host ""
        Write-Host "Verificando desde internet:" -ForegroundColor Yellow
        ssh -i $SSH_KEY $SERVER "curl -s https://demo-estetica.archivoenlinea.com/version.json"
    }
}

# Ejecución principal
try {
    Verify-Paths
    
    if ($FrontendOnly) {
        Deploy-Frontend
    }
    elseif ($BackendOnly) {
        Deploy-Backend
    }
    else {
        Deploy-Backend
        Deploy-Frontend
    }
    
    Verify-Deployment
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifica en tu navegador:" -ForegroundColor Yellow
    Write-Host "https://demo-estetica.archivoenlinea.com/version.json" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "❌ ERROR EN EL DESPLIEGUE" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
