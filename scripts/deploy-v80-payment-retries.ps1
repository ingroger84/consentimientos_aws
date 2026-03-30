# =====================================================
# Script de Despliegue v80.0.0
# Sistema de Reintentos de Pago Bold
# Fecha: 2026-03-29
# =====================================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE v80.0.0" -ForegroundColor Cyan
Write-Host "  Sistema de Reintentos de Pago Bold" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$SSH_KEY = "AWS-ISSABEL.pem"
$PROJECT_PATH = "/home/ubuntu/consentimientos_aws"
$PM2_PROCESS = "datagree"

Write-Host "📋 Configuración:" -ForegroundColor Yellow
Write-Host "   Servidor: $SERVER_IP" -ForegroundColor Gray
Write-Host "   Usuario: $SERVER_USER" -ForegroundColor Gray
Write-Host "   Proyecto: $PROJECT_PATH" -ForegroundColor Gray
Write-Host ""

# Función para ejecutar comandos SSH
function Invoke-SSHCommand {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "🔄 $Description..." -ForegroundColor Yellow
    ssh -i $SSH_KEY "$SERVER_USER@$SERVER_IP" $Command
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: $Description falló" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ $Description completado" -ForegroundColor Green
    Write-Host ""
}

# 1. Backup de la base de datos
Write-Host "📦 PASO 1: Backup de la base de datos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Invoke-SSHCommand -Command "cd $PROJECT_PATH && node backend/backup-database.js" -Description "Backup de base de datos"

# 2. Pull de cambios desde GitHub
Write-Host "📥 PASO 2: Actualizar código desde GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Invoke-SSHCommand -Command "cd $PROJECT_PATH && git pull origin main" -Description "Pull de cambios"

# 3. Instalar dependencias del backend
Write-Host "📦 PASO 3: Instalar dependencias del backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Invoke-SSHCommand -Command "cd $PROJECT_PATH/backend && npm install" -Description "Instalación de dependencias backend"

# 4. Aplicar migración de base de datos
Write-Host "🗄️  PASO 4: Aplicar migración de base de datos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Invoke-SSHCommand -Command "cd $PROJECT_PATH && node backend/apply-payment-attempts-migration.js" -Description "Aplicar migración"

# 5. Compilar backend
Write-Host "🔨 PASO 5: Compilar backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Invoke-SSHCommand -Command "cd $PROJECT_PATH/backend && npm run build" -Description "Compilación del backend"

# 6. Reiniciar PM2
Write-Host "🔄 PASO 6: Reiniciar PM2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Invoke-SSHCommand -Command "cd $PROJECT_PATH && pm2 restart $PM2_PROCESS" -Description "Reinicio de PM2"

# 7. Verificar estado de PM2
Write-Host "✅ PASO 7: Verificar estado de PM2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Invoke-SSHCommand -Command "pm2 status" -Description "Estado de PM2"

# 8. Compilar y desplegar frontend
Write-Host "🎨 PASO 8: Compilar y desplegar frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Invoke-SSHCommand -Command "cd $PROJECT_PATH/frontend && npm install" -Description "Instalación de dependencias frontend"
Invoke-SSHCommand -Command "cd $PROJECT_PATH/frontend && npm run build" -Description "Compilación del frontend"

# 9. Verificar logs
Write-Host "📋 PASO 9: Verificar logs del backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Mostrando últimas 30 líneas de logs..." -ForegroundColor Yellow
ssh -i $SSH_KEY "$SERVER_USER@$SERVER_IP" "pm2 logs $PM2_PROCESS --lines 30 --nostream"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumen de cambios v80.0.0:" -ForegroundColor Cyan
Write-Host "   ✅ Sistema de intentos de pago implementado" -ForegroundColor Green
Write-Host "   ✅ Regeneración automática de links Bold" -ForegroundColor Green
Write-Host "   ✅ Límite de 6 intentos por factura" -ForegroundColor Green
Write-Host "   ✅ Email automático cuando un pago falla" -ForegroundColor Green
Write-Host "   ✅ Historial de intentos en dashboard" -ForegroundColor Green
Write-Host "   ✅ Botón 'Reintentar Pago' en frontend" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 URLs para verificar:" -ForegroundColor Yellow
Write-Host "   Backend API: https://api.archivoenlinea.com/api/health" -ForegroundColor Gray
Write-Host "   Frontend: https://admin.archivoenlinea.com" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Probar flujo de pago rechazado" -ForegroundColor Gray
Write-Host "   2. Verificar email de pago fallido" -ForegroundColor Gray
Write-Host "   3. Probar botón 'Reintentar Pago'" -ForegroundColor Gray
Write-Host "   4. Verificar límite de 6 intentos" -ForegroundColor Gray
Write-Host ""
