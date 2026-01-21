Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Agregar Permiso 'configure_email'" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cargar variables de entorno
$envFile = "backend\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$DB_HOST = $env:DB_HOST
$DB_PORT = $env:DB_PORT
$DB_USERNAME = $env:DB_USERNAME
$DB_PASSWORD = $env:DB_PASSWORD
$DB_DATABASE = $env:DB_DATABASE

Write-Host "Conectando a la base de datos..." -ForegroundColor Yellow
Write-Host "Host: $DB_HOST" -ForegroundColor Gray
Write-Host "Database: $DB_DATABASE" -ForegroundColor Gray
Write-Host ""

# Ejecutar el script SQL
$env:PGPASSWORD = $DB_PASSWORD
psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_DATABASE -f backend\add-configure-email-permission.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Permiso agregado exitosamente" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error al agregar el permiso" -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
