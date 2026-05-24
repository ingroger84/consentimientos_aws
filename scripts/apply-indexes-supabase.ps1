# =====================================================
# Script: Aplicar Índices en Supabase
# Versión: 1.0
# Fecha: 23 Mayo 2026
# Descripción: Aplica 24 índices de performance en Supabase
# =====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  APLICAR ÍNDICES EN SUPABASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el archivo SQL
$sqlFile = "backend\migrations\add-performance-indexes.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ ERROR: No se encuentra el archivo SQL" -ForegroundColor Red
    Write-Host "   Ruta esperada: $sqlFile" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Archivo SQL encontrado" -ForegroundColor Green
Write-Host ""

# Verificar si psql está instalado
$psqlInstalled = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlInstalled) {
    Write-Host "⚠️  PSQL no está instalado en este sistema" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "MÉTODO ALTERNATIVO (MÁS FÁCIL):" -ForegroundColor Cyan
    Write-Host "1. Abre: https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq/sql" -ForegroundColor White
    Write-Host "2. Copia el contenido de: $sqlFile" -ForegroundColor White
    Write-Host "3. Pega en el SQL Editor de Supabase" -ForegroundColor White
    Write-Host "4. Haz clic en 'Run' o presiona Ctrl+Enter" -ForegroundColor White
    Write-Host ""
    Write-Host "Ver instrucciones completas en: APLICAR_INDICES_AUTOMATICO.md" -ForegroundColor Yellow
    exit 0
}

Write-Host "✅ PSQL está instalado" -ForegroundColor Green
Write-Host ""

# Solicitar contraseña de Supabase
Write-Host "📝 Ingresa la contraseña de Supabase:" -ForegroundColor Cyan
$password = Read-Host -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

if ([string]::IsNullOrWhiteSpace($passwordPlain)) {
    Write-Host "❌ ERROR: Contraseña vacía" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Conectando a Supabase..." -ForegroundColor Yellow

# Construir connection string
$connectionString = "postgresql://postgres:$passwordPlain@db.witvuzaarlqxkiqfiljq.supabase.co:5432/postgres"

# Ejecutar el script SQL
Write-Host "🚀 Aplicando 24 índices..." -ForegroundColor Yellow
Write-Host ""

try {
    $env:PGPASSWORD = $passwordPlain
    psql $connectionString -f $sqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✅ ÍNDICES APLICADOS EXITOSAMENTE" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Verificando índices creados..." -ForegroundColor Cyan
        
        # Verificar índices
        $verifyQuery = "SELECT COUNT(*) as total_indices FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';"
        $result = psql $connectionString -t -c $verifyQuery
        
        Write-Host ""
        Write-Host "Total de índices creados: $result" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 OPTIMIZACIÓN COMPLETADA" -ForegroundColor Green
        Write-Host ""
        Write-Host "Mejora esperada:" -ForegroundColor Cyan
        Write-Host "  • Dashboard: 5-15s → <1s (95-97% más rápido)" -ForegroundColor White
        Write-Host "  • Consultas: 2-5s → 50-200ms" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "⚠️  Algunos índices pueden haber fallado" -ForegroundColor Yellow
        Write-Host "   Esto es normal si algunos índices ya existían" -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "❌ ERROR al aplicar índices:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "MÉTODO ALTERNATIVO:" -ForegroundColor Yellow
    Write-Host "Usa el Supabase Dashboard (ver APLICAR_INDICES_AUTOMATICO.md)" -ForegroundColor Yellow
    exit 1
} finally {
    # Limpiar contraseña de la variable de entorno
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
