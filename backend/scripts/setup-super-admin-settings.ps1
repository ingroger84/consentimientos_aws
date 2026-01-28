# Script para configurar los settings del Super Admin
# Ejecuta el archivo SQL que crea los settings por defecto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configurar Settings del Super Admin  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cargar variables de entorno desde .env
if (Test-Path ".env") {
    Write-Host "Cargando variables de entorno desde .env..." -ForegroundColor Green
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Host "Archivo .env no encontrado" -ForegroundColor Red
    exit 1
}

# Obtener credenciales de la base de datos
$DB_HOST = $env:DB_HOST
$DB_PORT = $env:DB_PORT
$DB_USERNAME = $env:DB_USERNAME
$DB_PASSWORD = $env:DB_PASSWORD
$DB_DATABASE = $env:DB_DATABASE

Write-Host "Configuración de Base de Datos:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST" -ForegroundColor Gray
Write-Host "  Port: $DB_PORT" -ForegroundColor Gray
Write-Host "  Database: $DB_DATABASE" -ForegroundColor Gray
Write-Host "  User: $DB_USERNAME" -ForegroundColor Gray
Write-Host ""

# Verificar que psql esté instalado
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "psql no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host "  Instala PostgreSQL client tools" -ForegroundColor Yellow
    exit 1
}

Write-Host "psql encontrado: $($psqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Ejecutar el script SQL
Write-Host "Ejecutando script SQL..." -ForegroundColor Yellow
Write-Host ""

$env:PGPASSWORD = $DB_PASSWORD

try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_DATABASE -f "scripts/setup-super-admin-settings.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  Settings configurados exitosamente  " -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Proximos pasos:" -ForegroundColor Cyan
        Write-Host "1. Recarga la pagina de login en localhost:5173" -ForegroundColor White
        Write-Host "2. Deberias ver 'Sistema de Consentimientos' como nombre" -ForegroundColor White
        Write-Host "3. Si quieres personalizar, ve a Configuracion despues de iniciar sesion" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Error al ejecutar el script SQL" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
