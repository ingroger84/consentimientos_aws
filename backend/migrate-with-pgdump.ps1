# Script de migración usando pg_dump y pg_restore
# Más robusto para migraciones completas

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  MIGRACIÓN CON PG_DUMP A SUPABASE         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Configuración de base de datos local
Write-Host "=== Configuración de Base de Datos LOCAL ===" -ForegroundColor Yellow
Write-Host ""
$LOCAL_HOST = Read-Host "Host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($LOCAL_HOST)) { $LOCAL_HOST = "localhost" }

$LOCAL_PORT = Read-Host "Port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($LOCAL_PORT)) { $LOCAL_PORT = "5432" }

$LOCAL_USER = Read-Host "User (default: postgres)"
if ([string]::IsNullOrWhiteSpace($LOCAL_USER)) { $LOCAL_USER = "postgres" }

$LOCAL_PASSWORD = Read-Host "Password" -AsSecureString
$LOCAL_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($LOCAL_PASSWORD)
)

$LOCAL_DATABASE = Read-Host "Database name"

# Configuración de Supabase (destino)
$SUPABASE_HOST = "db.witvuzaarlqxkiqfiljq.supabase.co"
$SUPABASE_PORT = "5432"
$SUPABASE_USER = "postgres"
$SUPABASE_PASSWORD = "%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD"
$SUPABASE_DATABASE = "postgres"

Write-Host "`n=== Probando conexión a base de datos LOCAL ===" -ForegroundColor Yellow

$env:PGPASSWORD = $LOCAL_PASSWORD_PLAIN
$testLocal = & psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DATABASE -c "SELECT 1" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error conectando a base de datos local" -ForegroundColor Red
    Write-Host $testLocal
    exit 1
}

Write-Host "✅ Conexión exitosa a base de datos local" -ForegroundColor Green

Write-Host "`n=== Probando conexión a Supabase ===" -ForegroundColor Yellow

$env:PGPASSWORD = $SUPABASE_PASSWORD
$testSupabase = & psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DATABASE -c "SELECT 1" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error conectando a Supabase" -ForegroundColor Red
    Write-Host $testSupabase
    exit 1
}

Write-Host "✅ Conexión exitosa a Supabase" -ForegroundColor Green

# Crear backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup_local_$timestamp.sql"

Write-Host "`n=== Exportando datos de base de datos LOCAL ===" -ForegroundColor Yellow
Write-Host "Archivo: $backupFile"
Write-Host ""

$env:PGPASSWORD = $LOCAL_PASSWORD_PLAIN
& pg_dump -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DATABASE `
    --data-only `
    --no-owner `
    --no-privileges `
    --disable-triggers `
    -f $backupFile

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error exportando datos" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Datos exportados exitosamente" -ForegroundColor Green

# Mostrar tamaño del backup
$fileSize = (Get-Item $backupFile).Length / 1KB
Write-Host "Tamaño del backup: $([math]::Round($fileSize, 2)) KB"

Write-Host "`n=== ¿Deseas continuar con la importación a Supabase? ===" -ForegroundColor Yellow
$confirm = Read-Host "(s/n)"

if ($confirm -ne "s") {
    Write-Host "Migración cancelada" -ForegroundColor Yellow
    Write-Host "El backup se guardó en: $backupFile"
    exit 0
}

Write-Host "`n=== Importando datos a Supabase ===" -ForegroundColor Yellow
Write-Host ""

$env:PGPASSWORD = $SUPABASE_PASSWORD
& psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DATABASE -f $backupFile

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error importando datos a Supabase" -ForegroundColor Red
    Write-Host "El backup se guardó en: $backupFile"
    exit 1
}

Write-Host "`n✅ Datos importados exitosamente a Supabase" -ForegroundColor Green

Write-Host "`n=== Verificando datos en Supabase ===" -ForegroundColor Yellow
Write-Host ""

$env:PGPASSWORD = $SUPABASE_PASSWORD
& psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DATABASE -c "
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM pg_catalog.pg_class c WHERE c.relname = tablename) as count
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ MIGRACIÓN COMPLETADA                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Backup guardado en: $backupFile" -ForegroundColor Cyan
Write-Host ""
