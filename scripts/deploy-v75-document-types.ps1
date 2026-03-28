# Script de Despliegue v75.0.0 - Sistema de Tipos de Documentos
# Fecha: 2026-03-26
# Descripción: Despliega el sistema de tipos de documentos para tenants

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE v75.0.0 - TIPOS DE DOCUMENTOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "ubuntu@100.28.198.249"
$SSH_KEY = "AWS-ISSABEL.pem"
$BACKEND_PATH = "/home/ubuntu/consentimientos_aws/backend"
$FRONTEND_PATH = "/home/ubuntu/consentimientos_aws/frontend"

# 1. Ejecutar migración de base de datos
Write-Host "[1/6] Ejecutando migración de base de datos..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER @"
cd $BACKEND_PATH
export `$(cat .env | xargs)
psql `$DB_CONNECTION_STRING -f migrations/add-document-types-system.sql
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error ejecutando migración" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Migración ejecutada exitosamente" -ForegroundColor Green
Write-Host ""

# 2. Copiar migración al servidor
Write-Host "[2/6] Copiando migración al servidor..." -ForegroundColor Yellow
scp -i $SSH_KEY backend/migrations/add-document-types-system.sql "${SERVER}:${BACKEND_PATH}/migrations/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error copiando migración" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Migración copiada" -ForegroundColor Green
Write-Host ""

# 3. Desplegar Backend
Write-Host "[3/6] Desplegando backend v75.0.0..." -ForegroundColor Yellow
scp -i $SSH_KEY -r backend/dist/* "${SERVER}:${BACKEND_PATH}/dist/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error desplegando backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend desplegado" -ForegroundColor Green
Write-Host ""

# 4. Desplegar Frontend
Write-Host "[4/6] Desplegando frontend v75.0.0..." -ForegroundColor Yellow
scp -i $SSH_KEY -r frontend/dist/* "${SERVER}:${FRONTEND_PATH}/dist/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error desplegando frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend desplegado" -ForegroundColor Green
Write-Host ""

# 5. Reiniciar PM2
Write-Host "[5/6] Reiniciando PM2..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "pm2 restart datagree --update-env"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error reiniciando PM2" -ForegroundColor Red
    exit 1
}
Write-Host "✅ PM2 reiniciado" -ForegroundColor Green
Write-Host ""

# 6. Verificar versión
Write-Host "[6/6] Verificando versión desplegada..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
$version = ssh -i $SSH_KEY $SERVER "curl -s http://localhost:3000/health | grep -o '\"version\":\"[^\"]*\"' | cut -d'\"' -f4"
Write-Host "Versión en servidor: $version" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DESPLIEGUE COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Cambios desplegados:" -ForegroundColor Cyan
Write-Host "  • Tabla document_types creada" -ForegroundColor White
Write-Host "  • Campos documentTypeId y documentNumber agregados a tenants" -ForegroundColor White
Write-Host "  • 9 tipos de documentos por defecto insertados (CC, CE, TI, NIT, PAS, RC, DNI, RUT, OTHER)" -ForegroundColor White
Write-Host "  • Página de gestión de tipos de documentos (solo Super Admin)" -ForegroundColor White
Write-Host "  • Campos de identificación en formulario de tenants" -ForegroundColor White
Write-Host ""
Write-Host "Acceso:" -ForegroundColor Cyan
Write-Host "  • URL: https://demo-estetica.archivoenlinea.com" -ForegroundColor White
Write-Host "  • Gestión de Datos > Tipos de Documentos (Super Admin)" -ForegroundColor White
Write-Host ""
