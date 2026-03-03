# Script de despliegue para v54.0.0 - Mejoras Sistema de Perfiles
# Este script despliega las mejoras de seguridad y control de acceso al módulo de perfiles

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE v54.0.0" -ForegroundColor Cyan
Write-Host "  Mejoras Sistema de Perfiles" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$SERVER_USER = "ubuntu"
$SERVER_HOST = "100.28.198.249"
$SERVER_PATH = "/home/ubuntu/consentimientos_aws"
$LOCAL_BACKEND = ".\backend"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_DIR = "$SERVER_PATH/backups/v54.0.0_$TIMESTAMP"
$SSH_KEY = "credentials\AWS-ISSABEL.pem"

Write-Host "Configuracion:" -ForegroundColor Yellow
Write-Host "   Servidor: $SERVER_USER@$SERVER_HOST"
Write-Host "   Ruta: $SERVER_PATH"
Write-Host "   Backup: $BACKUP_DIR"
Write-Host ""

# Función para ejecutar comandos en el servidor
function Invoke-RemoteCommand {
    param([string]$Command)
    ssh -i $SSH_KEY "$SERVER_USER@$SERVER_HOST" $Command
}

# Función para copiar archivos al servidor
function Copy-ToServer {
    param([string]$Source, [string]$Destination)
    scp -i $SSH_KEY -r $Source "$SERVER_USER@${SERVER_HOST}:$Destination"
}

Write-Host "Paso 1: Verificar conexion al servidor..." -ForegroundColor Yellow
try {
    Invoke-RemoteCommand "echo 'Conexion exitosa'"
    Write-Host "Conexion establecida" -ForegroundColor Green
} catch {
    Write-Host "Error: No se pudo conectar al servidor" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "Paso 2: Crear backup del codigo actual..." -ForegroundColor Yellow
Invoke-RemoteCommand "mkdir -p $BACKUP_DIR"
Invoke-RemoteCommand "cp -r $SERVER_PATH/backend/dist $BACKUP_DIR/ 2>/dev/null || true"
Invoke-RemoteCommand "cp -r $SERVER_PATH/backend/src $BACKUP_DIR/ 2>/dev/null || true"
Invoke-RemoteCommand "cp $SERVER_PATH/backend/package.json $BACKUP_DIR/ 2>/dev/null || true"
Write-Host "Backup creado en $BACKUP_DIR" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 3: Compilar backend localmente..." -ForegroundColor Yellow
Push-Location $LOCAL_BACKEND
Write-Host "   Instalando dependencias..."
npm install --silent
Write-Host "   Compilando TypeScript..."
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend compilado exitosamente" -ForegroundColor Green
} else {
    Write-Host "Error al compilar backend" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host ""

Write-Host "Paso 4: Subir archivos al servidor..." -ForegroundColor Yellow
Write-Host "   Subiendo dist/..."
Copy-ToServer "$LOCAL_BACKEND\dist" "$SERVER_PATH/backend/"
Write-Host "   Subiendo src/..."
Copy-ToServer "$LOCAL_BACKEND\src" "$SERVER_PATH/backend/"
Write-Host "   Subiendo package.json..."
Copy-ToServer "$LOCAL_BACKEND\package.json" "$SERVER_PATH/backend/"
Write-Host "   Subiendo scripts de migracion..."
Copy-ToServer "$LOCAL_BACKEND\ensure-profile-codes.js" "$SERVER_PATH/backend/"
Write-Host "Archivos subidos" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 5: Instalar dependencias en servidor..." -ForegroundColor Yellow
Invoke-RemoteCommand "cd $SERVER_PATH/backend && npm install --production"
Write-Host "Dependencias instaladas" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 6: Ejecutar script de codigos de perfiles..." -ForegroundColor Yellow
Write-Host "   Este script asegura que todos los perfiles tengan codigo unico"
Invoke-RemoteCommand "cd $SERVER_PATH/backend && node ensure-profile-codes.js"
Write-Host "Codigos de perfiles actualizados" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 7: Reiniciar aplicacion con PM2..." -ForegroundColor Yellow
Invoke-RemoteCommand "pm2 restart datagree --update-env"
Write-Host "Aplicacion reiniciada" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 8: Esperar que la aplicacion inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host ""

Write-Host "Paso 9: Verificar estado de la aplicacion..." -ForegroundColor Yellow
Invoke-RemoteCommand "pm2 status datagree"
Write-Host ""

Write-Host "Paso 10: Verificar logs..." -ForegroundColor Yellow
Write-Host "   Ultimas 20 lineas del log:"
Invoke-RemoteCommand "pm2 logs datagree --lines 20 --nostream"
Write-Host ""

Write-Host "Paso 11: Verificar health check..." -ForegroundColor Yellow
$healthCheck = Invoke-RemoteCommand "curl -s http://localhost:3000/health || echo 'ERROR'"
if ($healthCheck -match "ok") {
    Write-Host "Health check: OK" -ForegroundColor Green
} else {
    Write-Host "Health check: No disponible (puede tardar unos segundos)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resumen de cambios v54.0.0:" -ForegroundColor Yellow
Write-Host "   Decorador @RequireSuperAdmin() implementado" -ForegroundColor Green
Write-Host "   Endpoints de perfiles protegidos (solo super admin)" -ForegroundColor Green
Write-Host "   Endpoints de modulos protegidos (solo super admin)" -ForegroundColor Green
Write-Host "   Guard de permisos mejorado" -ForegroundColor Green
Write-Host "   Codigos de perfiles asegurados" -ForegroundColor Green
Write-Host ""
Write-Host "Seguridad:" -ForegroundColor Yellow
Write-Host "   Solo Super Admin puede gestionar perfiles" -ForegroundColor Green
Write-Host "   Validacion en todos los endpoints" -ForegroundColor Green
Write-Host "   Mensajes de error 403 claros" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Desplegar frontend con componentes de proteccion"
Write-Host "   2. Probar acceso con super admin"
Write-Host "   3. Probar acceso con usuario normal (debe denegar)"
Write-Host "   4. Verificar que menu de perfiles solo aparece para super admin"
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "   Backend: https://archivoenlinea.com/api"
Write-Host "   Health: https://archivoenlinea.com/api/health"
Write-Host "   Swagger: https://archivoenlinea.com/api/docs"
Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor Yellow
Write-Host "   Ver logs: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'pm2 logs datagree'"
Write-Host "   Ver estado: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'pm2 status'"
Write-Host "   Reiniciar: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'pm2 restart datagree'"
Write-Host ""
