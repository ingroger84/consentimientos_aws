# Script para aplicar la migración de Bold
# Fecha: 20 de Enero de 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Aplicando Migración de Bold" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cargar variables de entorno
if (Test-Path ".env") {
    Write-Host "✓ Cargando variables de entorno..." -ForegroundColor Green
    Get-Content ".env" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $name = $parts[0].Trim()
            $value = $parts[1].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Host "✗ Archivo .env no encontrado" -ForegroundColor Red
    exit 1
}

# Obtener credenciales de la base de datos
$DB_HOST = $env:DB_HOST
$DB_PORT = $env:DB_PORT
$DB_NAME = $env:DB_NAME
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD

Write-Host "Conectando a la base de datos..." -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST" -ForegroundColor Gray
Write-Host "  Puerto: $DB_PORT" -ForegroundColor Gray
Write-Host "  Base de datos: $DB_NAME" -ForegroundColor Gray
Write-Host ""

# Construir cadena de conexión
$env:PGPASSWORD = $DB_PASSWORD

# Ejecutar migración
Write-Host "Ejecutando migración..." -ForegroundColor Yellow
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "add-bold-integration-columns.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Migración aplicada exitosamente" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Columnas agregadas:" -ForegroundColor Cyan
    Write-Host "  • invoices.bold_payment_link" -ForegroundColor White
    Write-Host "  • invoices.bold_transaction_id" -ForegroundColor White
    Write-Host "  • invoices.bold_payment_reference" -ForegroundColor White
    Write-Host "  • payments.bold_transaction_id" -ForegroundColor White
    Write-Host "  • payments.bold_payment_method" -ForegroundColor White
    Write-Host "  • payments.bold_payment_data" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ Error al aplicar la migración" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Limpiar variable de entorno
Remove-Item Env:PGPASSWORD
