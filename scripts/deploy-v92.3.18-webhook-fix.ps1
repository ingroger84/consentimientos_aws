# Script de Despliegue v92.3.18 - Corrección Webhook Bold
# Fecha: 20 de mayo de 2026
# Descripción: Corrige validación de firma de webhooks Bold

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE v92.3.18" -ForegroundColor Cyan
Write-Host "  Corrección Webhook Bold" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$KEY_FILE = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

Write-Host "📋 Configuración:" -ForegroundColor Yellow
Write-Host "   Servidor: $SERVER_IP"
Write-Host "   Usuario: $SERVER_USER"
Write-Host "   Ruta remota: $REMOTE_PATH"
Write-Host ""

# Verificar que existe la llave SSH
if (-not (Test-Path $KEY_FILE)) {
    Write-Host "❌ Error: No se encuentra la llave SSH: $KEY_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Llave SSH encontrada" -ForegroundColor Green
Write-Host ""

# Paso 1: Editar .env en el servidor
Write-Host "📝 Paso 1: Editando .env en el servidor..." -ForegroundColor Yellow
Write-Host ""

$envCommand = @"
cd $REMOTE_PATH/backend && \
sed -i 's/#BOLD_WEBHOOK_SECRET=/BOLD_WEBHOOK_SECRET=/g' .env && \
echo '✅ .env actualizado' && \
grep 'BOLD_WEBHOOK_SECRET' .env
"@

ssh -i $KEY_FILE "$SERVER_USER@$SERVER_IP" $envCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al editar .env" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ .env actualizado correctamente" -ForegroundColor Green
Write-Host ""

# Paso 2: Reiniciar PM2
Write-Host "🔄 Paso 2: Reiniciando PM2..." -ForegroundColor Yellow
Write-Host ""

$pm2Command = @"
pm2 restart datagree && \
pm2 status && \
echo '' && \
echo '✅ PM2 reiniciado correctamente'
"@

ssh -i $KEY_FILE "$SERVER_USER@$SERVER_IP" $pm2Command

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al reiniciar PM2" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ PM2 reiniciado correctamente" -ForegroundColor Green
Write-Host ""

# Paso 3: Verificar logs
Write-Host "📋 Paso 3: Verificando logs de PM2..." -ForegroundColor Yellow
Write-Host ""

ssh -i $KEY_FILE "${SERVER_USER}@${SERVER_IP}" "pm2 logs datagree --lines 30 --nostream"

Write-Host ""

# Paso 4: Verificar configuración de Bold
Write-Host "🔍 Paso 4: Verificando configuración de Bold..." -ForegroundColor Yellow
Write-Host ""

$verifyCommand = @"
cd $REMOTE_PATH/backend && \
node -e "
require('dotenv').config();
console.log('🔍 Verificando configuración de Bold Webhooks:\n');
console.log('BOLD_API_KEY:', process.env.BOLD_API_KEY?.substring(0, 20) + '...');
console.log('BOLD_SECRET_KEY:', process.env.BOLD_SECRET_KEY);
console.log('BOLD_WEBHOOK_SECRET:', process.env.BOLD_WEBHOOK_SECRET || '❌ NO CONFIGURADO');
console.log('');
if (!process.env.BOLD_WEBHOOK_SECRET) {
  console.log('❌ ERROR: BOLD_WEBHOOK_SECRET no está configurado');
  process.exit(1);
} else {
  console.log('✅ BOLD_WEBHOOK_SECRET está configurado correctamente');
}
"
"@

ssh -i $KEY_FILE "$SERVER_USER@$SERVER_IP" $verifyCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error: BOLD_WEBHOOK_SECRET no está configurado" -ForegroundColor Red
    Write-Host "   Verifica manualmente el archivo .env" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Configuración de Bold verificada correctamente" -ForegroundColor Green
Write-Host ""

# Resumen final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Cambios aplicados:" -ForegroundColor Yellow
Write-Host "   ✅ BOLD_WEBHOOK_SECRET descomentado en .env"
Write-Host "   ✅ PM2 reiniciado"
Write-Host "   ✅ Configuración verificada"
Write-Host ""
Write-Host "🧪 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Monitorear logs de PM2: pm2 logs datagree"
Write-Host "   2. Verificar próximos webhooks de Bold"
Write-Host "   3. Probar con un pago real"
Write-Host ""
Write-Host "📝 Documentación: SOLUCION_WEBHOOK_BOLD_V92.3.18.md" -ForegroundColor Cyan
Write-Host ""
