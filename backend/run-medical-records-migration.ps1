# Script para ejecutar migración de historias clínicas
# Ejecutar desde la raíz del proyecto

Write-Host "=== Migración de Historias Clínicas ===" -ForegroundColor Cyan

# Configuración
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "consentimientos"
$dbUser = "datagree_admin"
$dbPassword = "DataGree2026!Secure"
$migrationFile = "backend/src/migrations/create-medical-records-tables.sql"

# Verificar que existe el archivo
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Error: No se encontró el archivo de migración" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Archivo de migración: $migrationFile" -ForegroundColor Yellow

# Leer el contenido del archivo SQL
$sqlContent = Get-Content $migrationFile -Raw

# Ejecutar usando .NET PostgreSQL
try {
    Add-Type -Path "C:\Program Files\PostgreSQL\16\lib\Npgsql.dll" -ErrorAction SilentlyContinue
} catch {
    Write-Host "⚠️  No se pudo cargar Npgsql, intentando con psql..." -ForegroundColor Yellow
}

# Intentar con psql si está disponible
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

if (Test-Path $psqlPath) {
    Write-Host "✓ Usando psql para ejecutar migración..." -ForegroundColor Green
    
    $env:PGPASSWORD = $dbPassword
    & $psqlPath -U $dbUser -d $dbName -h $dbHost -f $migrationFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migración ejecutada exitosamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al ejecutar migración" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ No se encontró psql. Por favor ejecuta manualmente:" -ForegroundColor Red
    Write-Host "psql -U $dbUser -d $dbName -h $dbHost -f $migrationFile" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "O copia y pega el contenido del archivo en pgAdmin" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Migración Completada ===" -ForegroundColor Cyan
