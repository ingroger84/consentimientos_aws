#!/usr/bin/env pwsh
# Script para aplicar la migracion de facturas exentas de impuestos
# Fecha: 2026-01-20

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MIGRACION: Facturas Exentas de Impuestos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: No se encontró el archivo .env" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio backend/" -ForegroundColor Yellow
    exit 1
}

# Leer variables de entorno
Write-Host "Leyendo configuracion de base de datos..." -ForegroundColor Yellow
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1]
        $value = $matches[2]
        Set-Item -Path "env:$name" -Value $value
    }
}

# Extraer información de la cadena de conexión
$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) {
    Write-Host "ERROR: No se encontró DATABASE_URL en .env" -ForegroundColor Red
    exit 1
}

Write-Host "Conexion: $dbUrl" -ForegroundColor Gray
Write-Host ""

# Preguntar confirmacion
Write-Host "Esta migracion agregara las siguientes columnas a la tabla 'invoices':" -ForegroundColor White
Write-Host "  - taxExempt (boolean, default: false)" -ForegroundColor White
Write-Host "  - taxExemptReason (text, nullable)" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Deseas continuar? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Migracion cancelada" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Aplicando migracion..." -ForegroundColor Yellow

# Ejecutar el script SQL
try {
    # Extraer componentes de la URL
    if ($dbUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
        $dbUser = $matches[1]
        $dbPass = $matches[2]
        $dbHost = $matches[3]
        $dbPort = $matches[4]
        $dbName = $matches[5]
        
        # Configurar variable de entorno para la contrasena
        $env:PGPASSWORD = $dbPass
        
        # Ejecutar psql
        $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f add-tax-exempt-columns.sql 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Migracion aplicada exitosamente" -ForegroundColor Green
            Write-Host ""
            Write-Host "Resultado:" -ForegroundColor Cyan
            Write-Host $result
        } else {
            Write-Host ""
            Write-Host "✗ Error al aplicar la migracion" -ForegroundColor Red
            Write-Host $result
            exit 1
        }
        
        # Limpiar variable de entorno
        Remove-Item env:PGPASSWORD
    } else {
        Write-Host "ERROR: Formato de DATABASE_URL no valido" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MIGRACIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "1. Reinicia el servidor backend si esta corriendo" -ForegroundColor White
Write-Host "2. Verifica que las facturas se muestren correctamente" -ForegroundColor White
Write-Host "3. Consulta la documentacion en doc/14-impuestos/MEJORAS_IMPLEMENTADAS.md" -ForegroundColor White
Write-Host ""
