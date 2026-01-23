# Script simplificado para configurar certificado wildcard SSL
$ErrorActionPreference = "Stop"

$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$SSH_KEY = "AWS-ISSABEL.pem"
$DOMAIN = "archivoenlinea.com"
$EMAIL = "rcaraballo@innovasystems.com.co"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAR CERTIFICADO WILDCARD SSL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Solicitar credenciales AWS
Write-Host "[INFO] Ingresa las credenciales del usuario IAM con permisos de Route 53:" -ForegroundColor Yellow
$AWS_ACCESS_KEY = Read-Host "Access Key ID"
$AWS_SECRET_KEY = Read-Host "Secret Access Key"

Write-Host ""
Write-Host "[INFO] Configurando certificado wildcard en el servidor..." -ForegroundColor Yellow

# Script que se ejecutará en el servidor
$remoteScript = @"
#!/bin/bash
set -e

echo "[1/5] Actualizando paquetes..."
sudo apt-get update -qq

echo "[2/5] Instalando Certbot con plugin Route 53..."
sudo apt-get install -y python3-certbot-dns-route53

echo "[3/5] Configurando credenciales AWS..."
sudo mkdir -p /root/.aws
sudo tee /root/.aws/credentials > /dev/null <<EOF
[default]
aws_access_key_id = $AWS_ACCESS_KEY
aws_secret_access_key = $AWS_SECRET_KEY
EOF

sudo tee /root/.aws/config > /dev/null <<EOF
[default]
region = us-east-1
EOF

sudo chmod 600 /root/.aws/credentials
sudo chmod 600 /root/.aws/config

echo "[4/5] Obteniendo certificado wildcard..."
sudo certbot certonly \
  --dns-route53 \
  -d $DOMAIN \
  -d *.$DOMAIN \
  --non-interactive \
  --agree-tos \
  --email $EMAIL \
  --preferred-challenges dns-01

echo "[5/5] Actualizando configuracion de Nginx..."
sudo cp /etc/nginx/sites-available/archivoenlinea /etc/nginx/sites-available/archivoenlinea.backup.\$(date +%Y%m%d_%H%M%S)
sudo sed -i 's|ssl_certificate .*|ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;|g' /etc/nginx/sites-available/archivoenlinea
sudo sed -i 's|ssl_certificate_key .*|ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;|g' /etc/nginx/sites-available/archivoenlinea

echo "[INFO] Verificando configuracion de Nginx..."
sudo nginx -t

echo "[INFO] Recargando Nginx..."
sudo systemctl reload nginx

echo ""
echo "========================================" 
echo "  CERTIFICADO WILDCARD CONFIGURADO"
echo "========================================" 
echo ""
echo "Certificado: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "Expira en: 90 dias (renovacion automatica)"
echo ""
echo "[OK] Todos los subdominios ahora tienen HTTPS automaticamente"
"@

# Ejecutar script en el servidor
$remoteScript | ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cat > /tmp/setup-wildcard.sh && chmod +x /tmp/setup-wildcard.sh && /tmp/setup-wildcard.sh"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  EXITO - CERTIFICADO CONFIGURADO" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "[OK] Certificado wildcard instalado exitosamente" -ForegroundColor Green
    Write-Host "[OK] Todos los subdominios ahora tienen HTTPS automaticamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prueba creando un nuevo tenant desde:" -ForegroundColor Cyan
    Write-Host "  https://$DOMAIN" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[ERROR] Hubo un error al configurar el certificado" -ForegroundColor Red
    Write-Host ""
    exit 1
}
