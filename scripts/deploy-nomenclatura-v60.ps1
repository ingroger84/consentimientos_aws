# Script de despliegue - Cambios de nomenclatura v60
# Fecha: 2026-03-17 05:15 AM
# Cambios:
# - Dashboard: "Plantillas de Consentimientos" → "Plantillas de CN"
# - Menú: "GESTION CLINICA" → "GESTION DOCUMENTOS"
# - Menú: "Clientes" → "Clientes o Pacientes"
# - Menú: "Usuarios" → "Usuarios Sistema"
# - Menú: "PLANTILLAS" → "GESTION DE PLANTILLAS"

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE CAMBIOS NOMENCLATURA V60" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$SERVER = "ubuntu@100.28.198.249"
$KEY_PATH = "AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"
$LOCAL_DIST = "frontend/dist"
$BACKUP_NAME = "frontend-dist-backup-nomenclatura-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "[1/6] Verificando archivos locales..." -ForegroundColor Yellow
if (-not (Test-Path $LOCAL_DIST)) {
    Write-Host "❌ Error: No existe el directorio $LOCAL_DIST" -ForegroundColor Red
    Write-Host "Ejecuta primero: cd frontend && npm run build" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Archivos locales verificados" -ForegroundColor Green

Write-Host ""
Write-Host "[2/6] Creando backup del frontend actual..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER @"
cd $REMOTE_PATH
if [ -d frontend/dist ]; then
    echo '📦 Creando backup...'
    cp -r frontend/dist $BACKUP_NAME
    echo '✅ Backup creado: $BACKUP_NAME'
else
    echo '⚠️  No existe frontend/dist, no se crea backup'
fi
"@

Write-Host ""
Write-Host "[3/6] Limpiando directorio dist remoto..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER @"
cd $REMOTE_PATH/frontend
rm -rf dist/*
echo '✅ Directorio limpiado'
"@

Write-Host ""
Write-Host "[4/6] Subiendo nuevos archivos..." -ForegroundColor Yellow
scp -i $KEY_PATH -r "$LOCAL_DIST/*" "${SERVER}:${REMOTE_PATH}/frontend/dist/"
Write-Host "✅ Archivos subidos" -ForegroundColor Green

Write-Host ""
Write-Host "[5/6] Verificando despliegue..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER @"
cd $REMOTE_PATH/frontend/dist
echo '📊 Archivos en dist:'
ls -lh
echo ''
echo '📄 Contenido de version.json:'
cat version.json
"@

Write-Host ""
Write-Host "[6/6] Verificando servicio..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER @"
echo '🔍 Estado de PM2:'
pm2 list
echo ''
echo '🌐 Verificando API:'
curl -s http://localhost:3000/health | head -n 5
"@

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Cambios desplegados:" -ForegroundColor Cyan
Write-Host "  • Dashboard: 'Plantillas de Consentimientos' → 'Plantillas de CN'" -ForegroundColor White
Write-Host "  • Menú: 'GESTION CLINICA' → 'GESTION DOCUMENTOS'" -ForegroundColor White
Write-Host "  • Menú: 'Clientes' → 'Clientes o Pacientes'" -ForegroundColor White
Write-Host "  • Menú: 'Usuarios' → 'Usuarios Sistema'" -ForegroundColor White
Write-Host "  • Menú: 'PLANTILLAS' → 'GESTION DE PLANTILLAS'" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Accede a: https://archivoenlinea.com" -ForegroundColor Cyan
Write-Host "💡 Presiona Ctrl+F5 para limpiar caché del navegador" -ForegroundColor Yellow
Write-Host ""
Write-Host "📦 Backup creado en servidor: $BACKUP_NAME" -ForegroundColor Gray
Write-Host ""
