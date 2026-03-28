# Script para ejecutar la prueba de formatos de autenticación Bold en producción
# Uso: .\scripts\test-bold-auth-formats.ps1

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔍 PRUEBA DE FORMATOS DE AUTENTICACIÓN BOLD" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Este script ejecutará test-bold-auth-formats.js en el servidor de producción" -ForegroundColor Yellow
Write-Host "   El script probará 12 formatos diferentes de autenticación" -ForegroundColor Yellow
Write-Host ""

# Verificar que existe la clave SSH
if (-not (Test-Path "AWS-ISSABEL.pem")) {
    Write-Host "❌ Error: No se encuentra el archivo AWS-ISSABEL.pem" -ForegroundColor Red
    Write-Host "   Asegúrate de estar en el directorio raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Clave SSH encontrada" -ForegroundColor Green
Write-Host ""

# Información del servidor
$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$BACKEND_PATH = "/home/ubuntu/consentimientos_aws/backend"

Write-Host "🌐 Servidor: $SERVER" -ForegroundColor Cyan
Write-Host "📁 Directorio: $BACKEND_PATH" -ForegroundColor Cyan
Write-Host ""

# Confirmar ejecución
Write-Host "⚠️  ¿Deseas continuar? (S/N): " -ForegroundColor Yellow -NoNewline
$confirm = Read-Host

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 EJECUTANDO PRUEBA EN PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Ejecutar el script en el servidor
Write-Host "📡 Conectando al servidor..." -ForegroundColor Yellow
Write-Host ""

$command = "cd $BACKEND_PATH && node test-bold-auth-formats.js"

ssh -i $KEY $SERVER $command

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ PRUEBA COMPLETADA" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Revisa los resultados anteriores" -ForegroundColor White
Write-Host "2. Si se encontró un formato exitoso:" -ForegroundColor White
Write-Host "   - Actualiza backend/src/payments/bold.service.ts" -ForegroundColor White
Write-Host "   - Prueba con: node test-bold-standalone.js" -ForegroundColor White
Write-Host "   - Despliega en producción" -ForegroundColor White
Write-Host ""
Write-Host "3. Si NO se encontró ningún formato:" -ForegroundColor White
Write-Host "   - Contacta con Bold Colombia (soporte@bold.co)" -ForegroundColor White
Write-Host "   - Solicita documentación actualizada de la API" -ForegroundColor White
Write-Host "   - Solicita nuevas credenciales (por exposición)" -ForegroundColor White
Write-Host ""

Write-Host "📚 Documentación:" -ForegroundColor Cyan
Write-Host "   - SOLUCION_AUTENTICACION_BOLD.md" -ForegroundColor White
Write-Host "   - INTEGRACION_BOLD_COMPLETA.md" -ForegroundColor White
Write-Host ""
