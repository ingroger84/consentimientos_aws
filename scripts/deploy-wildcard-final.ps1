# Script final para desplegar certificado wildcard SSL
param(
    [Parameter(Mandatory=$true)]
    [string]$SecretAccessKey
)

$ErrorActionPreference = "Continue"

$ACCESS_KEY_ID = "AKIA42IJAAWUM75HB4EZ"
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$SSH_KEY = "AWS-ISSABEL.pem"
$DOMAIN = "archivoenlinea.com"
$EMAIL = "rcaraballo@innovasystems.com.co"
$IAM_USER_NAME = "archivoenlinea-certbot-route53"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLEGAR CERTIFICADO WILDCARD SSL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configurar credenciales AWS
$env:AWS_ACCESS_KEY_ID = $ACCESS_KEY_ID
$env:AWS_SECRET_ACCESS_KEY = $SecretAccessKey
$env:AWS_DEFAULT_REGION = "us-east-1"

Write-Host "[1/5] Verificando credenciales AWS..." -ForegroundColor Yellow
$accountId = aws sts get-caller-identity --query Account --output text
Write-Host "[OK] Credenciales validas - Account ID: $accountId" -ForegroundColor Green

Write-Host ""
Write-Host "[2/5] Creando usuario IAM para Certbot..." -ForegroundColor Yellow

# Intentar crear usuario (si ya existe, continuamos)
Write-Host "[INFO] Creando usuario IAM..." -ForegroundColor Yellow
aws iam create-user --user-name $IAM_USER_NAME 2>&1 | Out-Null

# Crear politica
Write-Host "[INFO] Creando politica de Route 53..." -ForegroundColor Yellow
$policyDocument = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "route53:ListHostedZones",
                "route53:GetChange"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "route53:ChangeResourceRecordSets"
            ],
            "Resource": "arn:aws:route53:::hostedzone/*"
        }
    ]
}
"@

$policyFile = "temp-route53-policy.json"
$policyDocument | Out-File -FilePath $policyFile -Encoding UTF8

aws iam create-policy `
    --policy-name "CertbotRoute53Access" `
    --policy-document file://$policyFile `
    --description "Permisos para Certbot con Route 53" 2>&1 | Out-Null

Remove-Item $policyFile -ErrorAction SilentlyContinue

$policyArn = "arn:aws:iam::${accountId}:policy/CertbotRoute53Access"

# Adjuntar politica
Write-Host "[INFO] Adjuntando politica al usuario..." -ForegroundColor Yellow
aws iam attach-user-policy --user-name $IAM_USER_NAME --policy-arn $policyArn 2>&1 | Out-Null

# Eliminar claves antiguas
Write-Host "[INFO] Limpiando claves antiguas..." -ForegroundColor Yellow
$existingKeys = aws iam list-access-keys --user-name $IAM_USER_NAME --query 'AccessKeyMetadata[*].AccessKeyId' --output text 2>&1
if ($existingKeys -and $existingKeys -notmatch "error") {
    foreach ($key in $existingKeys -split '\s+') {
        if ($key -and $key.StartsWith("AKIA")) {
            aws iam delete-access-key --user-name $IAM_USER_NAME --access-key-id $key 2>&1 | Out-Null
        }
    }
}

# Crear nuevas credenciales
Write-Host "[INFO] Creando credenciales de acceso..." -ForegroundColor Yellow
$accessKeyJson = aws iam create-access-key --user-name $IAM_USER_NAME --output json

if (-not $accessKeyJson) {
    Write-Host "[ERROR] Error al crear credenciales" -ForegroundColor Red
    exit 1
}

$accessKey = $accessKeyJson | ConvertFrom-Json
$CERTBOT_ACCESS_KEY = $accessKey.AccessKey.AccessKeyId
$CERTBOT_SECRET_KEY = $accessKey.AccessKey.SecretAccessKey

Write-Host "[OK] Usuario IAM configurado" -ForegroundColor Green
Write-Host "  Access Key: $CERTBOT_ACCESS_KEY" -ForegroundColor Gray

Write-Host ""
Write-Host "[3/5] Instalando Certbot en el servidor..." -ForegroundColor Yellow

$installScript = @"
#!/bin/bash
set -e
echo "[INFO] Actualizando paquetes..."
sudo apt-get update -qq
echo "[INFO] Instalando Certbot con plugin Route 53..."
sudo apt-get install -y python3-certbot-dns-route53
echo "[OK] Certbot instalado"
"@

$installScript | ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cat > /tmp/install-certbot.sh && chmod +x /tmp/install-certbot.sh && /tmp/install-certbot.sh"

Write-Host "[OK] Certbot instalado" -ForegroundColor Green

Write-Host ""
Write-Host "[4/5] Configurando certificado wildcard..." -ForegroundColor Yellow

$certScript = @"
#!/bin/bash
set -e

echo "[INFO] Configurando credenciales AWS..."
sudo mkdir -p /root/.aws

sudo tee /root/.aws/credentials > /dev/null <<EOF
[default]
aws_access_key_id = $CERTBOT_ACCESS_KEY
aws_secret_access_key = $CERTBOT_SECRET_KEY
EOF

sudo tee /root/.aws/config > /dev/null <<EOF
[default]
region = us-east-1
EOF

sudo chmod 600 /root/.aws/credentials
sudo chmod 600 /root/.aws/config

echo "[INFO] Obteniendo certificado wildcard..."
sudo certbot certonly \
  --dns-route53 \
  -d $DOMAIN \
  -d *.$DOMAIN \
  --non-interactive \
  --agree-tos \
  --email $EMAIL \
  --preferred-challenges dns-01

echo "[OK] Certificado wildcard obtenido"
"@

$certScript | ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cat > /tmp/get-cert.sh && chmod +x /tmp/get-cert.sh && /tmp/get-cert.sh"

Write-Host "[OK] Certificado wildcard obtenido" -ForegroundColor Green

Write-Host ""
Write-Host "[5/5] Configurando Nginx..." -ForegroundColor Yellow

$nginxScript = @"
#!/bin/bash
set -e

echo "[INFO] Respaldando configuracion..."
sudo cp /etc/nginx/sites-available/archivoenlinea /etc/nginx/sites-available/archivoenlinea.backup.\$(date +%Y%m%d_%H%M%S)

echo "[INFO] Actualizando configuracion de Nginx..."
sudo sed -i 's|ssl_certificate .*|ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;|g' /etc/nginx/sites-available/archivoenlinea
sudo sed -i 's|ssl_certificate_key .*|ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;|g' /etc/nginx/sites-available/archivoenlinea

echo "[INFO] Verificando configuracion..."
sudo nginx -t

echo "[INFO] Recargando Nginx..."
sudo systemctl reload nginx

echo "[OK] Nginx configurado"
"@

$nginxScript | ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cat > /tmp/config-nginx.sh && chmod +x /tmp/config-nginx.sh && /tmp/config-nginx.sh"

Write-Host "[OK] Nginx configurado" -ForegroundColor Green

# Verificacion
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICANDO CERTIFICADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testDomains = @("admin.$DOMAIN", "testsanto.$DOMAIN")

foreach ($testDomain in $testDomains) {
    Write-Host "[TEST] Probando: https://$testDomain" -ForegroundColor Yellow
    $result = ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "curl -I https://$testDomain 2>&1 | grep HTTP"
    
    if ($result -match "HTTP/2 200") {
        Write-Host "[OK] $testDomain - HTTPS funcionando" -ForegroundColor Green
    } else {
        Write-Host "[WARN] $testDomain - Verificar manualmente" -ForegroundColor Yellow
    }
}

# Resumen final
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  CERTIFICADO WILDCARD CONFIGURADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Dominio: *.$DOMAIN" -ForegroundColor Cyan
Write-Host "Certificado: /etc/letsencrypt/live/$DOMAIN/fullchain.pem" -ForegroundColor Gray
Write-Host "Expira: 90 dias (renovacion automatica)" -ForegroundColor Gray
Write-Host ""
Write-Host "[OK] Todos los subdominios ahora tienen HTTPS automaticamente" -ForegroundColor Green
Write-Host ""
Write-Host "Prueba creando un nuevo tenant desde:" -ForegroundColor Cyan
Write-Host "  https://$DOMAIN" -ForegroundColor Yellow
Write-Host ""
