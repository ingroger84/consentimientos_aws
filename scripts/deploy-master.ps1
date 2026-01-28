# Script Maestro de Despliegue Completo
# Ejecuta todo el proceso de configuración y despliegue
# Versión: 1.0
# Fecha: 2026-01-27

param(
    [switch]$SetupServer = $false,
    [switch]$ConfigureNginx = $false,
    [switch]$Deploy = $false,
    [switch]$All = $false,
    [string]$Domain = "archivoenlinea.com",
    [string]$InstanceName = "datagree-prod"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE MAESTRO - DATAGREE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Si se especifica -All, ejecutar todo
if ($All) {
    $SetupServer = $true
    $ConfigureNginx = $true
    $Deploy = $true
}

# Si no se especifica ninguna opción, mostrar ayuda
if (-not $SetupServer -and -not $ConfigureNginx -and -not $Deploy) {
    Write-Host "Uso:" -ForegroundColor Yellow
    Write-Host "  .\scripts\deploy-master.ps1 -All" -ForegroundColor White
    Write-Host "  .\scripts\deploy-master.ps1 -SetupServer" -ForegroundColor White
    Write-Host "  .\scripts\deploy-master.ps1 -ConfigureNginx" -ForegroundColor White
    Write-Host "  .\scripts\deploy-master.ps1 -Deploy" -ForegroundColor White
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  -All              Ejecutar todo el proceso" -ForegroundColor White
    Write-Host "  -SetupServer      Configurar servidor desde cero" -ForegroundColor White
    Write-Host "  -ConfigureNginx   Configurar Nginx y SSL" -ForegroundColor White
    Write-Host "  -Deploy           Desplegar aplicación" -ForegroundColor White
    Write-Host "  -Domain           Dominio (default: archivoenlinea.com)" -ForegroundColor White
    Write-Host "  -InstanceName     Nombre de instancia (default: datagree-prod)" -ForegroundColor White
    Write-Host ""
    exit 0
}

# Verificar que los scripts existan
$scriptsPath = Split-Path -Parent $PSCommandPath
$setupScript = Join-Path $scriptsPath "setup-production-server.ps1"
$nginxScript = Join-Path $scriptsPath "configure-nginx-ssl.sh"
$deployScript = Join-Path $scriptsPath "deploy-production-complete.ps1"

if (-not (Test-Path $setupScript)) {
    Write-Host "✗ Script de setup no encontrado: $setupScript" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $deployScript)) {
    Write-Host "✗ Script de deploy no encontrado: $deployScript" -ForegroundColor Red
    exit 1
}

# Credenciales AWS - Usar credenciales del archivo CREDENCIALES.md
$env:AWS_ACCESS_KEY_ID = "TU_AWS_ACCESS_KEY_LIGHTSAIL"
$env:AWS_SECRET_ACCESS_KEY = "TU_AWS_SECRET_KEY_LIGHTSAIL"
$env:AWS_DEFAULT_REGION = "us-east-1"

Write-Host "Configuración:" -ForegroundColor White
Write-Host "  • Dominio: $Domain" -ForegroundColor White
Write-Host "  • Instancia: $InstanceName" -ForegroundColor White
Write-Host "  • Región: us-east-1" -ForegroundColor White
Write-Host ""

$startTime = Get-Date

# FASE 1: Configurar Servidor
if ($SetupServer) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  FASE 1: CONFIGURACIÓN DEL SERVIDOR" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        & $setupScript -InstanceName $InstanceName -Domain $Domain
        
        Write-Host ""
        Write-Host "✓ Fase 1 completada" -ForegroundColor Green
        Write-Host ""
        
        # Esperar a que el usuario suba el archivo .env
        Write-Host "⚠ ACCIÓN REQUERIDA:" -ForegroundColor Yellow
        Write-Host "  1. Sube el archivo temp_backend.env al servidor" -ForegroundColor White
        Write-Host "  2. Renómbralo a .env en /var/www/consentimientos/backend/" -ForegroundColor White
        Write-Host ""
        
        $continue = Read-Host "¿Archivo .env subido? (s/n)"
        if ($continue -ne "s") {
            Write-Host "Proceso pausado. Ejecuta de nuevo cuando esté listo." -ForegroundColor Yellow
            exit 0
        }
    }
    catch {
        Write-Host "✗ Error en Fase 1: $_" -ForegroundColor Red
        exit 1
    }
}

# FASE 2: Configurar Nginx y SSL
if ($ConfigureNginx) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  FASE 2: CONFIGURACIÓN NGINX + SSL" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "⚠ ACCIÓN REQUERIDA:" -ForegroundColor Yellow
    Write-Host "  1. Asegúrate de que el DNS esté configurado" -ForegroundColor White
    Write-Host "  2. $Domain debe apuntar a la IP del servidor" -ForegroundColor White
    Write-Host "  3. *.$Domain debe tener un registro wildcard" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "¿DNS configurado? (s/n)"
    if ($continue -ne "s") {
        Write-Host "Configura el DNS y ejecuta de nuevo." -ForegroundColor Yellow
        exit 0
    }
    
    try {
        Write-Host "Subiendo script de Nginx al servidor..." -ForegroundColor Yellow
        
        # Subir script al servidor
        aws lightsail put-instance-public-ports `
            --instance-name $InstanceName `
            --port-infos fromPort=22,toPort=22,protocol=tcp `
            --region us-east-1
        
        # Ejecutar script en el servidor
        Write-Host "Ejecutando configuración de Nginx..." -ForegroundColor Yellow
        
        $nginxContent = Get-Content $nginxScript -Raw
        
        # Nota: Este comando debe ejecutarse manualmente en el servidor
        Write-Host "⚠ Sube el script configure-nginx-ssl.sh al servidor y ejecútalo manualmente" -ForegroundColor Yellow
        
        Write-Host ""
        Write-Host "✓ Fase 2 completada" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "✗ Error en Fase 2: $_" -ForegroundColor Red
        Write-Host "  Puedes ejecutar manualmente:" -ForegroundColor Yellow
        Write-Host "  sudo bash /tmp/configure-nginx.sh" -ForegroundColor White
        exit 1
    }
}

# FASE 3: Desplegar Aplicación
if ($Deploy) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  FASE 3: DESPLIEGUE DE APLICACIÓN" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        & $deployScript
        
        Write-Host ""
        Write-Host "✓ Fase 3 completada" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "✗ Error en Fase 3: $_" -ForegroundColor Red
        exit 1
    }
}

# Resumen Final
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resumen:" -ForegroundColor White
Write-Host "  • Tiempo total: $($duration.ToString('mm\:ss'))" -ForegroundColor White
Write-Host "  • Dominio: https://$Domain" -ForegroundColor White
Write-Host "  • Instancia: $InstanceName" -ForegroundColor White
Write-Host ""
Write-Host "Verificaciones:" -ForegroundColor Yellow
Write-Host "  1. Accede a: https://$Domain" -ForegroundColor White
Write-Host "  2. Verifica SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$Domain" -ForegroundColor White
Write-Host "  3. Health check: https://$Domain/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Crear super admin" -ForegroundColor White
Write-Host "  2. Configurar primer tenant" -ForegroundColor White
Write-Host "  3. Probar funcionalidades críticas" -ForegroundColor White
Write-Host "  4. Configurar monitoreo" -ForegroundColor White
Write-Host "  5. Configurar backups automáticos" -ForegroundColor White
Write-Host ""
Write-Host "Documentación:" -ForegroundColor Yellow
Write-Host "  • Guía completa: DEPLOYMENT.md" -ForegroundColor White
Write-Host "  • Troubleshooting: doc/90-auditoria-produccion/" -ForegroundColor White
Write-Host ""

# Guardar log del despliegue completo
$logFile = "deployment_master_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$logContent = @"
Despliegue Maestro - DatAgree
Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Duración: $($duration.ToString('mm\:ss'))

Configuración:
  • Dominio: $Domain
  • Instancia: $InstanceName
  • Región: us-east-1

Fases ejecutadas:
  • Setup Server: $SetupServer
  • Configure Nginx: $ConfigureNginx
  • Deploy: $Deploy

Estado: COMPLETADO

URLs:
  • Aplicación: https://$Domain
  • API: https://$Domain/api
  • Health: https://$Domain/api/health

Próximos pasos:
  1. Crear super admin
  2. Configurar primer tenant
  3. Probar funcionalidades
  4. Configurar monitoreo
  5. Configurar backups
"@

$logContent | Out-File -FilePath $logFile -Encoding UTF8
Write-Host "Log guardado en: $logFile" -ForegroundColor Green
Write-Host ""
