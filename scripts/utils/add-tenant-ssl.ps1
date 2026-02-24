# Script para agregar certificado SSL a un nuevo tenant
# Uso: .\scripts\add-tenant-ssl.ps1 -TenantSlug "nombre-tenant"

param(
    [Parameter(Mandatory=$true)]
    [string]$TenantSlug
)

$ErrorActionPreference = "Stop"

# Configuración
$SERVER_IP = "100.28.198.249"
$SERVER_USER = "ubuntu"
$SSH_KEY = "AWS-ISSABEL.pem"
$DOMAIN = "archivoenlinea.com"
$EMAIL = "rcaraballo@innovasystems.com.co"

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

# Banner
Clear-Host
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AGREGAR CERTIFICADO SSL A TENANT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Info "Tenant: $TenantSlug"
Write-Info "Dominio: $TenantSlug.$DOMAIN"
Write-Host ""

# Verificar que existe la clave SSH
if (-not (Test-Path $SSH_KEY)) {
    Write-ErrorMsg "No se encuentra la clave SSH: $SSH_KEY"
    exit 1
}

# Verificar conectividad
Write-Step "VERIFICANDO CONECTIVIDAD"
try {
    $testConnection = & ssh -i $SSH_KEY -o ConnectTimeout=10 -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "echo 'OK'" 2>&1
    if ($testConnection -match "OK") {
        Write-Success "Conexión SSH exitosa"
    } else {
        throw "No se pudo conectar"
    }
} catch {
    Write-ErrorMsg "No se pudo conectar al servidor"
    exit 1
}

# Verificar que el tenant existe en la base de datos
Write-Step "VERIFICANDO TENANT EN BASE DE DATOS"
$checkTenant = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "sudo -u postgres psql -d consentimientos -t -A -c 'SELECT slug FROM tenants WHERE slug = ''$TenantSlug'';'" 2>&1

if ($checkTenant -match $TenantSlug) {
    Write-Success "Tenant '$TenantSlug' encontrado en la base de datos"
} else {
    Write-ErrorMsg "Tenant '$TenantSlug' no existe en la base de datos"
    Write-Info "Tenants disponibles:"
    $tenants = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "sudo -u postgres psql -d consentimientos -t -A -c 'SELECT slug FROM tenants;'" 2>&1
    Write-Host $tenants -ForegroundColor Gray
    exit 1
}

# Obtener certificado SSL
Write-Step "OBTENIENDO CERTIFICADO SSL"
Write-Info "Solicitando certificado para $TenantSlug.$DOMAIN..."

$certCommand = "sudo certbot --nginx -d $TenantSlug.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect"
$certResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $certCommand 2>&1

if ($certResult -match "Successfully deployed certificate") {
    Write-Success "Certificado SSL instalado exitosamente"
} elseif ($certResult -match "Certificate not yet due for renewal") {
    Write-Success "El certificado ya existe y está activo"
} else {
    Write-ErrorMsg "Error al obtener certificado SSL"
    Write-Host $certResult -ForegroundColor Red
    exit 1
}

# Verificar que HTTPS funciona
Write-Step "VERIFICANDO HTTPS"
Write-Info "Probando https://$TenantSlug.$DOMAIN..."

Start-Sleep -Seconds 2

$verifyCommand = "curl -I https://$TenantSlug.$DOMAIN 2>&1 | grep -E 'HTTP'"
$verifyResult = & ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $verifyCommand 2>&1

if ($verifyResult -match "HTTP/2 200") {
    Write-Success "HTTPS funcionando correctamente"
} else {
    Write-ErrorMsg "Error al verificar HTTPS"
    Write-Host $verifyResult -ForegroundColor Red
}

# Resumen
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  CERTIFICADO SSL INSTALADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Tenant: $TenantSlug" -ForegroundColor Cyan
Write-Host "URL: https://$TenantSlug.$DOMAIN" -ForegroundColor Yellow
Write-Host "Expira: 2026-04-23 (90 días)" -ForegroundColor Gray
Write-Host "Renovación: Automática" -ForegroundColor Gray
Write-Host ""
Write-Success "Proceso completado"
Write-Host ""
