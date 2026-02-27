# ============================================
# Script de Migración a Supabase
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "🚀 MIGRACIÓN A SUPABASE" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Credenciales AWS RDS
$AWS_HOST = "ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com"
$AWS_USER = "archivoenlinea"
$AWS_DB = "archivoenlinea"
$AWS_PASSWORD = "8K``=Yt|Qm2HHilf^}{(r=6I_`$auA.k2g"

# Credenciales Supabase
$SUPABASE_HOST = "db.witvuzaarlqxkiqfiljq.supabase.co"
$SUPABASE_USER = "postgres"
$SUPABASE_DB = "postgres"
$SUPABASE_PASSWORD = "%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD"

# Archivo de backup
$BACKUP_FILE = "backup_aws_rds_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

Write-Host "📋 Configuración:" -ForegroundColor Yellow
Write-Host "  AWS RDS: $AWS_HOST" -ForegroundColor Gray
Write-Host "  Supabase: $SUPABASE_HOST" -ForegroundColor Gray
Write-Host "  Backup: $BACKUP_FILE`n" -ForegroundColor Gray

# Verificar que pg_dump y psql estén instalados
Write-Host "🔍 Verificando herramientas..." -ForegroundColor Yellow
try {
    $null = Get-Command pg_dump -ErrorAction Stop
    $null = Get-Command psql -ErrorAction Stop
    Write-Host "✅ pg_dump y psql encontrados`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: pg_dump o psql no están instalados" -ForegroundColor Red
    Write-Host "   Instala PostgreSQL client tools desde:" -ForegroundColor Yellow
    Write-Host "   https://www.postgresql.org/download/windows/`n" -ForegroundColor Yellow
    exit 1
}

# Preguntar al usuario si quiere continuar
Write-Host "⚠️  ADVERTENCIA:" -ForegroundColor Yellow
Write-Host "   Este script exportará TODOS los datos de AWS RDS" -ForegroundColor Yellow
Write-Host "   e importará a Supabase (base de datos limpia)`n" -ForegroundColor Yellow

$confirm = Read-Host "¿Deseas continuar? (s/n)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "`n❌ Migración cancelada por el usuario" -ForegroundColor Red
    exit 0
}

# 1. Exportar desde AWS RDS
Write-Host "`n📦 Paso 1: Exportando datos desde AWS RDS..." -ForegroundColor Cyan
$env:PGPASSWORD = $AWS_PASSWORD
try {
    pg_dump -h $AWS_HOST -U $AWS_USER -d $AWS_DB -f $BACKUP_FILE --no-owner --no-acl
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Exportación exitosa: $BACKUP_FILE" -ForegroundColor Green
        $fileSize = (Get-Item $BACKUP_FILE).Length / 1MB
        Write-Host "   Tamaño: $([math]::Round($fileSize, 2)) MB`n" -ForegroundColor Gray
    } else {
        throw "Error en pg_dump"
    }
} catch {
    Write-Host "❌ Error al exportar desde AWS RDS" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
    exit 1
}

# 2. Importar a Supabase
Write-Host "📥 Paso 2: Importando datos a Supabase..." -ForegroundColor Cyan
$env:PGPASSWORD = $SUPABASE_PASSWORD
try {
    psql -h $SUPABASE_HOST -U $SUPABASE_USER -d $SUPABASE_DB -p 5432 -f $BACKUP_FILE
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Importación exitosa a Supabase`n" -ForegroundColor Green
    } else {
        throw "Error en psql"
    }
} catch {
    Write-Host "❌ Error al importar a Supabase" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
    Write-Host "`n💡 El archivo de backup se guardó en: $BACKUP_FILE" -ForegroundColor Yellow
    exit 1
}

# 3. Verificar migración
Write-Host "🔍 Paso 3: Verificando migración..." -ForegroundColor Cyan
try {
    $result = psql -h $SUPABASE_HOST -U $SUPABASE_USER -d $SUPABASE_DB -p 5432 -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
    $tableCount = $result.Trim()
    Write-Host "✅ Tablas migradas: $tableCount`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No se pudo verificar la migración" -ForegroundColor Yellow
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Actualizar .env en el servidor AWS" -ForegroundColor Gray
Write-Host "  2. Reiniciar el backend: pm2 restart datagree" -ForegroundColor Gray
Write-Host "  3. Verificar que la aplicación funcione correctamente" -ForegroundColor Gray
Write-Host "  4. Eliminar el backup si todo está OK: $BACKUP_FILE`n" -ForegroundColor Gray

Write-Host "💾 Backup guardado en: $BACKUP_FILE" -ForegroundColor Cyan
Write-Host "   (Guárdalo en un lugar seguro antes de eliminarlo)`n" -ForegroundColor Gray
