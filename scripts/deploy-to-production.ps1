# Script de Despliegue a Producción - DatAgree
# Fecha: 2026-01-21
# Versión: 1.1.28

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE A PRODUCCION - DATAGREE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$SSH_KEY = "AWS-ISSABEL.pem"
$PROJECT_PATH = "/home/ubuntu/consentimientos_aws"

Write-Host "1. Verificando cambios locales..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "2. Deseas continuar con el commit y push? (S/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -ne "S" -and $response -ne "s") {
    Write-Host "Despliegue cancelado." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "3. Agregando cambios a Git..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "4. Creando commit..." -ForegroundColor Yellow
git commit -m "feat: Landing page SaaS completa con notificaciones v1.1.28" -m "- Landing page comercial con informacion del producto" -m "- Sistema de planes con registro de cuenta tenant" -m "- Trial de 7 dias para plan gratuito" -m "- Suspension automatica de cuentas expiradas" -m "- Notificaciones por correo al Super Admin" -m "- Sistema de notificaciones dentro del dashboard" -m "- Correccion de nombre: DataGree -> DatAgree" -m "- Documentacion completa en doc/27-landing-page-saas/"

Write-Host ""
Write-Host "5. Pusheando a GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  CODIGO SUBIDO A GITHUB" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "6. Deseas desplegar en el servidor? (S/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -ne "S" -and $response -ne "s") {
    Write-Host "Despliegue al servidor cancelado." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLEGANDO EN SERVIDOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Crear script de despliegue remoto (bash script para Linux)
$deployScript = @'
#!/bin/bash
set -e

echo "========================================="
echo "  DESPLIEGUE EN SERVIDOR - DATAGREE"
echo "========================================="
echo ""

cd /home/ubuntu/consentimientos_aws

echo "1. Haciendo backup de la base de datos..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres consentimientos > backup_$TIMESTAMP.sql

echo ""
echo "2. Pulling cambios desde GitHub..."
git pull origin main

echo ""
echo "3. Instalando dependencias del backend..."
cd backend
npm install

echo ""
echo "4. Ejecutando migraciones de base de datos..."
psql -U postgres -d consentimientos << 'EOF'
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
EOF

echo ""
echo "5. Reiniciando backend con PM2..."
pm2 restart datagree-backend

echo ""
echo "6. Compilando frontend..."
cd ../frontend
npm install
npm run build

echo ""
echo "7. Verificando estado del backend..."
pm2 status

echo ""
echo "========================================="
echo "  DESPLIEGUE COMPLETADO"
echo "========================================="
echo ""
echo "Verificar en: https://datagree.net"
'@

# Guardar script temporalmente
$deployScript | Out-File -FilePath "temp-deploy.sh" -Encoding UTF8 -NoNewline

Write-Host "7. Copiando script de despliegue al servidor..." -ForegroundColor Yellow
& scp -i $SSH_KEY temp-deploy.sh "${SERVER_USER}@${SERVER_IP}:~/deploy.sh"

Write-Host ""
Write-Host "8. Ejecutando despliegue en el servidor..." -ForegroundColor Yellow
& ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "chmod +x ~/deploy.sh && ~/deploy.sh"

Write-Host ""
Write-Host "9. Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item temp-deploy.sh -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs de verificacion:" -ForegroundColor Cyan
Write-Host "  - Landing: https://datagree.net" -ForegroundColor White
Write-Host "  - Admin: https://admin.datagree.net" -ForegroundColor White
Write-Host "  - API: https://datagree.net/api" -ForegroundColor White
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Verificar que la landing page carga correctamente" -ForegroundColor White
Write-Host "  2. Probar registro de cuenta desde la landing" -ForegroundColor White
Write-Host "  3. Verificar correo de notificacion al Super Admin" -ForegroundColor White
Write-Host "  4. Revisar notificaciones en el dashboard" -ForegroundColor White
Write-Host ""
