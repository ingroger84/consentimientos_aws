# Script para desplegar certificado wildcard SSL
# Usa credenciales IAM con permisos completos para crear usuario y configurar certificado

param(
    [Parameter(Mandatory=$true)]
    [string]$SecretAccessKey
)

$ErrorActionPreference = "Stop"

# Configuracion
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
$accountId = aws sts get-caller-identity --query Account --output text 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Credenciales AWS invalidas" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Credenciales validas - Account ID: $accountId" -ForegroundColor Green

Write-Host ""
Write-Host "[2/5] Creando usuario IAM para Certbot..." -ForegroundColor Yellow

# Verificar si el usuario ya existe
$userExists = aws iam get-user --user-name $IAM_USER_NAME 2>&1 | Out-String
if ($userExists -match "User") {
    Write-Host "[INFO] Usuario IAM ya existe" -ForegroundColor Yellow
    
    # Listar claves existentes
    $existingKeys = aws iam list-access-keys --user-name $IAM_USER_NAME --query 'AccessKeyMetadata[*].AccessKeyId' --output text
    
    if ($existingKeys) {
        Write-Host "[INFO] Claves existentes encontradas. Eliminando claves antiguas..." -ForegroundColor Yellow
        foreach ($key in $existingKeys -split '\s+') {
            if ($key) {
                aws iam delete-access-key --user-name $IAM_USER_NAME --access-key-id $key 2>&1 | Out-Null
            }
        }
    }
} else {
    Write-Host "[INFO] Creando usuario IAM..." -ForegroundColor Yellow
    aws iam create-user --user-name $IAM_USER_NAME 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Error al crear usuario IAM" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "[OK] Usuario IAM creado" -ForegroundColor Green
    
    # Crear politica personalizada
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
    
    $policyArn = aws iam create-policy `
        --policy-name "CertbotRoute53Access" `
        --policy-document file://$policyFile `
        --description "Permisos para Certbot con Route 53" `
        --output text `
        --query 'Policy.Arn' 2>&1
    
    Remove-Item $policyFile -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[INFO] Politica ya existe, usando existente..." -ForegroundColor Yellow
        $policyArn = "arn:aws:iam::${accountId}:policy/CertbotRoute53Access"
    }
    
    # Adjuntar politica
    Write-Host "[INFO] Adjuntando politica al usuario..." -ForegroundColor Yellow
    aws iam attach-user-policy --user-name $IAM_USER_NAME --policy-arn $policyArn 2>&1 | Out-Null
    Write-Host "[OK] Politica adjuntada" -ForegroundColor Green
}

# Crear nuevas credenciales
Write-Host "[INFO] Creando credenciales de acceso..." -ForegroundColor Yellow
$accessKeyJson = aws iam create-access-key --user-name $IAM_USER_NAME --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error al crear credenciales" -ForegroundColor Red
    Write-Host $accessKeyJson -ForegroundColor Red
    exit 1
}

$accessKey = $accessKeyJson | ConvertFrom-Json
$CERTBOT_ACCESS_KEY = $accessKey.AccessKey.AccessKeyId
$CERTBOT_SECRET_KEY = $accessKey.AccessKey.SecretAccessKey

Write-Host "[OK] Credenciales creadas exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "Nuevas credenciales para Certbot:" -ForegroundColor Cyan
Write-Host "  Access Key ID: $CERTBOT_ACCESS_KEY" -ForegroundColor Gray
Write-Host "  Secret Access Key: $CERTBOT_SECRET_KEY" -ForegroundColor Gray
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

$installScript | ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cat > /tmp/install-certbot.sh && chmod +x /tmp/install-certbot.sh && /tmp/install-certbot.sh" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Certbot instalado" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Error al instalar Certbot" -ForegroundColor Red
    exit 1
}

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

if [ \$? -eq 0 ]; then
    echo "[OK] Certificado wildcard obtenido"
else
    echo "[ERROR] Error al obtener certificado"
    exit 1
fi
"@

$certScript | ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cat > /tmp/get-cert.sh && chmod +x /tmp/get-cert.sh && /tmp/get-cert.sh" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Certificado wildcard obtenido" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Error al obtener certificado" -ForegroundColor Red
    exit 1
}

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

$nginxScript | ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cat > /tmp/config-nginx.sh && chmod +x /tmp/config-nginx.sh && /tmp/config-nginx.sh" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Nginx configurado" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Error al configurar Nginx" -ForegroundColor Red
    exit 1
}

# Verificacion
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICANDO CERTIFICADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testDomains = @("admin.$DOMAIN", "testsanto.$DOMAIN")

foreach ($testDomain in $testDomains) {
    Write-Host "[TEST] Probando: https://$testDomain" -ForegroundColor Yellow
    $result = ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "curl -I https://$testDomain 2>&1 | grep HTTP" 2>&1
    
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
Write-Host "Usuario IAM creado: $IAM_USER_NAME" -ForegroundColor Gray
Write-Host "Credenciales guardadas en: /root/.aws/credentials (servidor)" -ForegroundColor Gray
Write-Host ""
