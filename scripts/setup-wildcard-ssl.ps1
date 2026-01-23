# Script para configurar certificado SSL wildcard con Route 53
# Este script configura un certificado wildcard para *.archivoenlinea.com
# que cubrirá automáticamente todos los subdominios de tenants

param(
    [switch]$CreateIAMUser,
    [switch]$InstallCertbot,
    [switch]$GetCertificate,
    [switch]$ConfigureNginx,
    [switch]$All
)

$ErrorActionPreference = "Stop"

# Configuración
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$SSH_KEY = "AWS-ISSABEL.pem"
$DOMAIN = "archivoenlinea.com"
$EMAIL = "rcaraballo@innovasystems.com.co"
$IAM_USER_NAME = "archivoenlinea-certbot-route53"
$HOSTED_ZONE_ID = "" # Se obtendrá automáticamente

function Write-Step($message) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  $message" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "[OK] $message" -ForegroundColor Green
}

function Write-ErrorMsg($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Yellow
}

function Write-Warning($message) {
    Write-Host "[WARN] $message" -ForegroundColor Yellow
}

# Banner
Clear-Host
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURAR CERTIFICADO WILDCARD SSL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Info "Dominio: *.$DOMAIN"
Write-Info "Servidor: $SERVER_IP"
Write-Host ""

# Verificar que existe la clave SSH
if (-not (Test-Path $SSH_KEY)) {
    Write-ErrorMsg "No se encuentra la clave SSH: $SSH_KEY"
    exit 1
}

# Si se especifica -All, ejecutar todos los pasos
if ($All) {
    $CreateIAMUser = $true
    $InstallCertbot = $true
    $GetCertificate = $true
    $ConfigureNginx = $true
}

# PASO 1: Crear usuario IAM con permisos de Route 53
if ($CreateIAMUser) {
    Write-Step "PASO 1: CREAR USUARIO IAM PARA CERTBOT"
    
    Write-Info "Verificando si el usuario IAM ya existe..."
    $userExists = aws iam get-user --user-name $IAM_USER_NAME 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Warning "El usuario IAM '$IAM_USER_NAME' ya existe"
        Write-Info "¿Deseas crear nuevas credenciales para este usuario? (S/N)"
        $response = Read-Host
        if ($response -ne "S" -and $response -ne "s") {
            Write-Info "Saltando creación de usuario IAM"
        } else {
            # Crear nuevas credenciales
            Write-Info "Creando nuevas credenciales de acceso..."
            $accessKey = aws iam create-access-key --user-name $IAM_USER_NAME --output json | ConvertFrom-Json
            
            Write-Success "Credenciales creadas exitosamente"
            Write-Host ""
            Write-Host "GUARDA ESTAS CREDENCIALES EN UN LUGAR SEGURO:" -ForegroundColor Yellow
            Write-Host "Access Key ID: $($accessKey.AccessKey.AccessKeyId)" -ForegroundColor Green
            Write-Host "Secret Access Key: $($accessKey.AccessKey.SecretAccessKey)" -ForegroundColor Green
            Write-Host ""
            Write-Warning "Estas credenciales NO se mostrarán de nuevo"
            Write-Host ""
            
            # Guardar en variable de entorno temporal
            $env:CERTBOT_AWS_ACCESS_KEY_ID = $accessKey.AccessKey.AccessKeyId
            $env:CERTBOT_AWS_SECRET_ACCESS_KEY = $accessKey.AccessKey.SecretAccessKey
        }
    } else {
        Write-Info "Creando usuario IAM: $IAM_USER_NAME"
        
        # Crear usuario
        aws iam create-user --user-name $IAM_USER_NAME
        
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "Error al crear usuario IAM"
            exit 1
        }
        
        Write-Success "Usuario IAM creado"
        
        # Crear política personalizada para Route 53 (solo permisos necesarios)
        Write-Info "Creando politica de permisos para Route 53..."
        
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
            --query 'Policy.Arn'
        
        Remove-Item $policyFile
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "La politica ya existe o hubo un error. Intentando adjuntar politica existente..."
            $policyArn = "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/CertbotRoute53Access"
        }
        
        # Adjuntar politica al usuario
        Write-Info "Adjuntando politica al usuario..."
        aws iam attach-user-policy --user-name $IAM_USER_NAME --policy-arn $policyArn
        
        Write-Success "Politica adjuntada"
        
        # Crear credenciales de acceso
        Write-Info "Creando credenciales de acceso..."
        $accessKey = aws iam create-access-key --user-name $IAM_USER_NAME --output json | ConvertFrom-Json
        
        Write-Success "Credenciales creadas exitosamente"
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host "  GUARDA ESTAS CREDENCIALES" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host "Access Key ID: $($accessKey.AccessKey.AccessKeyId)" -ForegroundColor Green
        Write-Host "Secret Access Key: $($accessKey.AccessKey.SecretAccessKey)" -ForegroundColor Green
        Write-Host ""
        Write-Warning "Estas credenciales NO se mostrarán de nuevo"
        Write-Host ""
        Write-Host "Presiona Enter para continuar..."
        Read-Host
        
        # Guardar en variable de entorno temporal
        $env:CERTBOT_AWS_ACCESS_KEY_ID = $accessKey.AccessKey.AccessKeyId
        $env:CERTBOT_AWS_SECRET_ACCESS_KEY = $accessKey.AccessKey.SecretAccessKey
    }
}

# PASO 2: Instalar Certbot con plugin de Route 53
if ($InstallCertbot) {
    Write-Step "PASO 2: INSTALAR CERTBOT CON PLUGIN DE ROUTE 53"
    
    Write-Info "Conectando al servidor..."
    
    $installScript = @"
#!/bin/bash
set -e

echo "[INFO] Actualizando paquetes..."
sudo apt-get update -qq

echo "[INFO] Instalando Certbot y plugin de Route 53..."
sudo apt-get install -y python3-certbot-dns-route53

echo "[INFO] Verificando instalación..."
certbot --version
python3 -c "import certbot_dns_route53; print('Plugin Route 53 instalado correctamente')"

echo "[OK] Certbot instalado exitosamente"
"@
    
    $installScript | ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cat > /tmp/install-certbot.sh && chmod +x /tmp/install-certbot.sh && /tmp/install-certbot.sh"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Certbot con plugin Route 53 instalado"
    } else {
        Write-ErrorMsg "Error al instalar Certbot"
        exit 1
    }
}

# PASO 3: Configurar credenciales AWS en el servidor
if ($GetCertificate) {
    Write-Step "PASO 3: CONFIGURAR CREDENCIALES Y OBTENER CERTIFICADO"
    
    # Solicitar credenciales si no están en variables de entorno
    if (-not $env:CERTBOT_AWS_ACCESS_KEY_ID) {
        Write-Info "Ingresa las credenciales del usuario IAM '$IAM_USER_NAME':"
        $env:CERTBOT_AWS_ACCESS_KEY_ID = Read-Host "Access Key ID"
        $env:CERTBOT_AWS_SECRET_ACCESS_KEY = Read-Host "Secret Access Key" -AsSecureString | ConvertFrom-SecureString -AsPlainText
    }
    
    Write-Info "Configurando credenciales AWS en el servidor..."
    
    $configScript = @"
#!/bin/bash
set -e

echo "[INFO] Creando directorio de credenciales..."
sudo mkdir -p /root/.aws

echo "[INFO] Configurando credenciales AWS..."
sudo tee /root/.aws/credentials > /dev/null <<EOF
[default]
aws_access_key_id = $env:CERTBOT_AWS_ACCESS_KEY_ID
aws_secret_access_key = $env:CERTBOT_AWS_SECRET_ACCESS_KEY
EOF

sudo tee /root/.aws/config > /dev/null <<EOF
[default]
region = us-east-1
EOF

sudo chmod 600 /root/.aws/credentials
sudo chmod 600 /root/.aws/config

echo "[OK] Credenciales configuradas"

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
    echo "[OK] Certificado wildcard obtenido exitosamente"
    echo ""
    echo "Certificado guardado en:"
    echo "  /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    echo "  /etc/letsencrypt/live/$DOMAIN/privkey.pem"
    echo ""
    echo "Expira en 90 días (renovación automática)"
else
    echo "[ERROR] Error al obtener certificado"
    exit 1
fi
"@
    
    $configScript | ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cat > /tmp/get-certificate.sh && chmod +x /tmp/get-certificate.sh && /tmp/get-certificate.sh"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Certificado wildcard obtenido exitosamente"
    } else {
        Write-ErrorMsg "Error al obtener certificado"
        exit 1
    }
}

# PASO 4: Configurar Nginx para usar el certificado wildcard
if ($ConfigureNginx) {
    Write-Step "PASO 4: CONFIGURAR NGINX"
    
    Write-Info "Actualizando configuración de Nginx..."
    
    $nginxScript = @"
#!/bin/bash
set -e

echo "[INFO] Respaldando configuración actual..."
sudo cp /etc/nginx/sites-available/archivoenlinea /etc/nginx/sites-available/archivoenlinea.backup.\$(date +%Y%m%d_%H%M%S)

echo "[INFO] Actualizando configuración de Nginx..."
sudo sed -i 's|ssl_certificate .*|ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;|g' /etc/nginx/sites-available/archivoenlinea
sudo sed -i 's|ssl_certificate_key .*|ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;|g' /etc/nginx/sites-available/archivoenlinea

echo "[INFO] Verificando configuración de Nginx..."
sudo nginx -t

if [ \$? -eq 0 ]; then
    echo "[INFO] Recargando Nginx..."
    sudo systemctl reload nginx
    echo "[OK] Nginx configurado y recargado exitosamente"
else
    echo "[ERROR] Error en la configuración de Nginx"
    exit 1
fi
"@
    
    $nginxScript | ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "cat > /tmp/configure-nginx.sh && chmod +x /tmp/configure-nginx.sh && /tmp/configure-nginx.sh"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Nginx configurado exitosamente"
    } else {
        Write-ErrorMsg "Error al configurar Nginx"
        exit 1
    }
}

# Verificación final
if ($GetCertificate -or $All) {
    Write-Step "VERIFICACIÓN FINAL"
    
    Write-Info "Probando certificado con subdominios de prueba..."
    
    # Probar con subdominios existentes
    $testDomains = @(
        "admin.$DOMAIN",
        "testsanto.$DOMAIN",
        "clinica-demo.$DOMAIN"
    )
    
    foreach ($testDomain in $testDomains) {
        Write-Info "Probando: https://$testDomain"
        $result = ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "curl -I https://$testDomain 2>&1 | grep -E 'HTTP|SSL'" 2>&1
        
        if ($result -match "HTTP/2 200") {
            Write-Success "$testDomain - OK"
        } else {
            Write-Warning "$testDomain - Verificar manualmente"
        }
    }
}

# Resumen
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  CERTIFICADO WILDCARD CONFIGURADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Dominio: *.$DOMAIN" -ForegroundColor Cyan
Write-Host "Certificado: /etc/letsencrypt/live/$DOMAIN/fullchain.pem" -ForegroundColor Gray
Write-Host "Expira: 90 días (renovación automática)" -ForegroundColor Gray
Write-Host ""
Write-Success "Todos los subdominios ahora tienen HTTPS automaticamente"
Write-Host ""
Write-Info "Proximos pasos:"
Write-Host "  1. Crear un nuevo tenant desde la landing page"
Write-Host "  2. Verificar que HTTPS funciona automaticamente"
Write-Host "  3. No se requiere configuracion adicional"
Write-Host ""

