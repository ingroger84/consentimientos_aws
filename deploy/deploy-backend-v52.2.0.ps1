# Script de despliegue del backend v52.2.0 con sistema de perfiles
# Fecha: 2026-03-02
# Servidor: admin.archivoenlinea.com (100.28.198.249)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE BACKEND v52.2.0" -ForegroundColor Cyan
Write-Host "Sistema de Perfiles y Permisos" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$SERVER_USER = "ubuntu"
$SERVER_IP = "100.28.198.249"
$SERVER_PATH = "/home/ubuntu/consentimientos_aws/backend"
$LOCAL_DIST = "backend/dist"
$PM2_PROCESS = "datagree"
$KEY_FILE = "credentials/AWS-ISSABEL.pem"

Write-Host "1. Verificando compilación local..." -ForegroundColor Yellow
if (-not (Test-Path $LOCAL_DIST)) {
    Write-Host "❌ Error: No existe el directorio dist/" -ForegroundColor Red
    Write-Host "Ejecuta: cd backend && npm run build" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Directorio dist/ encontrado" -ForegroundColor Green
Write-Host ""

Write-Host "2. Creando archivo comprimido..." -ForegroundColor Yellow
Push-Location backend
tar -czf backend-dist-v52.2.0.tar.gz dist/ package.json package-lock.json
Pop-Location

Write-Host "✓ Archivo backend-dist-v52.2.0.tar.gz creado" -ForegroundColor Green
Write-Host ""

Write-Host "3. Subiendo archivos al servidor..." -ForegroundColor Yellow
scp -i $KEY_FILE backend/backend-dist-v52.2.0.tar.gz "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"

Write-Host "✓ Archivos subidos" -ForegroundColor Green
Write-Host ""

Write-Host "4. Desplegando en el servidor..." -ForegroundColor Yellow
$sshCommand = "cd /home/ubuntu/consentimientos_aws/backend && tar -xzf backend-dist-v52.2.0.tar.gz && npm ci --only=production && pm2 restart datagree && sleep 5 && pm2 status datagree && pm2 logs datagree --lines 20 --nostream"

ssh -i $KEY_FILE "$SERVER_USER@$SERVER_IP" $sshCommand

Write-Host ""
Write-Host "✓ Despliegue completado" -ForegroundColor Green
Write-Host ""

Write-Host "5. Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item backend/backend-dist-v52.2.0.tar.gz -Force

Write-Host "✓ Limpieza completada" -ForegroundColor Green
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE COMPLETADO EXITOSAMENTE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verificaciones recomendadas:" -ForegroundColor Yellow
Write-Host "1. Acceder a: https://archivoenlinea.com/api/profiles" -ForegroundColor White
Write-Host "2. Verificar logs: ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249 'pm2 logs datagree'" -ForegroundColor White
Write-Host "3. Probar endpoint desde el frontend" -ForegroundColor White
Write-Host ""
