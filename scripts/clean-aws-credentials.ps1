# Script para limpiar credenciales AWS expuestas en archivos de documentación
# Fecha: 2026-01-22

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LIMPIEZA DE CREDENCIALES AWS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Archivos a limpiar
$files = @(
    "doc/19-aws-s3-storage/README.md",
    "doc/19-aws-s3-storage/INDEX.md",
    "doc/19-aws-s3-storage/VERIFICACION_COMPLETA.md",
    "doc/23-despliegue-aws/CERTIFICADO_WILDCARD_CONFIGURADO.md"
)

# Credenciales a reemplazar (EJEMPLO - NO USAR CREDENCIALES REALES)
$oldAccessKey1 = "AKIA**************"  # Credencial comprometida 1
$oldSecretKey1 = "******************"  # Secret comprometida 1
$oldAccessKey2 = "AKIA**************"  # Credencial comprometida 2
$oldSecretKey2 = "******************"  # Secret comprometida 2

$newAccessKey = "YOUR_AWS_ACCESS_KEY_HERE"
$newSecretKey = "YOUR_AWS_SECRET_KEY_HERE"

$totalReplacements = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "[INFO] Procesando: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Reemplazar credenciales
        $content = $content -replace [regex]::Escape($oldAccessKey1), $newAccessKey
        $content = $content -replace [regex]::Escape($oldSecretKey1), $newSecretKey
        $content = $content -replace [regex]::Escape($oldAccessKey2), $newAccessKey
        $content = $content -replace [regex]::Escape($oldSecretKey2), $newSecretKey
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "[OK] Credenciales eliminadas de: $file" -ForegroundColor Green
            $totalReplacements++
        } else {
            Write-Host "[SKIP] No se encontraron credenciales en: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "[WARN] Archivo no encontrado: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  LIMPIEZA COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos modificados: $totalReplacements" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Revisar los cambios con: git diff" -ForegroundColor White
Write-Host "2. Hacer commit: git add -A && git commit -m 'security: remove exposed AWS credentials'" -ForegroundColor White
Write-Host "3. Push a GitHub: git push origin main" -ForegroundColor White
Write-Host "4. Rotar credenciales en AWS Console" -ForegroundColor White
Write-Host "5. Actualizar .env en el servidor de producción" -ForegroundColor White
Write-Host ""
