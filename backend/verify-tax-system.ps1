#!/usr/bin/env pwsh
# Script de verificación rápida del sistema de impuestos
# Fecha: 2026-01-20

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICACIÓN DEL SISTEMA DE IMPUESTOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Verificar que existe el archivo .env
Write-Host "1. Verificando archivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✓ Archivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "   ✗ Archivo .env no encontrado" -ForegroundColor Red
    $allPassed = $false
}

# Leer variables de entorno
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

# Verificar DATABASE_URL
Write-Host ""
Write-Host "2. Verificando DATABASE_URL..." -ForegroundColor Yellow
$dbUrl = $env:DATABASE_URL
if ($dbUrl) {
    Write-Host "   ✓ DATABASE_URL configurada" -ForegroundColor Green
} else {
    Write-Host "   ✗ DATABASE_URL no encontrada" -ForegroundColor Red
    $allPassed = $false
}

# Verificar columnas en la base de datos
Write-Host ""
Write-Host "3. Verificando columnas en base de datos..." -ForegroundColor Yellow

if ($dbUrl -and $dbUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPass = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
    
    $env:PGPASSWORD = $dbPass
    
    $query = @"
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'invoices' 
  AND column_name IN ('taxExempt', 'taxExemptReason', 'taxConfigId')
ORDER BY column_name;
"@
    
    try {
        $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -A -F"," -c $query 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $columns = $result | Where-Object { $_ -match '\w' }
            
            $hasTaxExempt = $false
            $hasTaxExemptReason = $false
            $hasTaxConfigId = $false
            
            foreach ($line in $columns) {
                if ($line -match 'taxExempt') { $hasTaxExempt = $true }
                if ($line -match 'taxExemptReason') { $hasTaxExemptReason = $true }
                if ($line -match 'taxConfigId') { $hasTaxConfigId = $true }
            }
            
            if ($hasTaxExempt) {
                Write-Host "   ✓ Columna 'taxExempt' existe" -ForegroundColor Green
            } else {
                Write-Host "   ✗ Columna 'taxExempt' no existe" -ForegroundColor Red
                $allPassed = $false
            }
            
            if ($hasTaxExemptReason) {
                Write-Host "   ✓ Columna 'taxExemptReason' existe" -ForegroundColor Green
            } else {
                Write-Host "   ✗ Columna 'taxExemptReason' no existe" -ForegroundColor Red
                $allPassed = $false
            }
            
            if ($hasTaxConfigId) {
                Write-Host "   ✓ Columna 'taxConfigId' existe" -ForegroundColor Green
            } else {
                Write-Host "   ✗ Columna 'taxConfigId' no existe" -ForegroundColor Red
                $allPassed = $false
            }
        } else {
            Write-Host "   ✗ Error al consultar la base de datos" -ForegroundColor Red
            $allPassed = $false
        }
    } catch {
        Write-Host "   ✗ Error: $_" -ForegroundColor Red
        $allPassed = $false
    }
    
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
} else {
    Write-Host "   ⚠ No se pudo verificar (DATABASE_URL inválida)" -ForegroundColor Yellow
}

# Verificar tabla tax_configs
Write-Host ""
Write-Host "4. Verificando tabla tax_configs..." -ForegroundColor Yellow

if ($dbUrl -and $dbUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPass = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
    
    $env:PGPASSWORD = $dbPass
    
    $query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'tax_configs';"
    
    try {
        $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -A -c $query 2>&1
        
        if ($LASTEXITCODE -eq 0 -and $result -match '1') {
            Write-Host "   ✓ Tabla 'tax_configs' existe" -ForegroundColor Green
            
            # Contar registros
            $countQuery = "SELECT COUNT(*) FROM tax_configs;"
            $count = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -A -c $countQuery 2>&1
            
            if ($count -match '(\d+)') {
                $numConfigs = $matches[1]
                Write-Host "   ✓ Configuraciones de impuestos: $numConfigs" -ForegroundColor Green
            }
        } else {
            Write-Host "   ✗ Tabla 'tax_configs' no existe" -ForegroundColor Red
            $allPassed = $false
        }
    } catch {
        Write-Host "   ✗ Error: $_" -ForegroundColor Red
        $allPassed = $false
    }
    
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}

# Verificar archivos del backend
Write-Host ""
Write-Host "5. Verificando archivos del backend..." -ForegroundColor Yellow

$backendFiles = @(
    "src/invoices/entities/invoice.entity.ts",
    "src/invoices/entities/tax-config.entity.ts",
    "src/invoices/tax-config.service.ts",
    "src/invoices/dto/create-invoice.dto.ts",
    "src/invoices/invoices.service.ts"
)

foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file no encontrado" -ForegroundColor Red
        $allPassed = $false
    }
}

# Verificar archivos del frontend
Write-Host ""
Write-Host "6. Verificando archivos del frontend..." -ForegroundColor Yellow

$frontendFiles = @(
    "../frontend/src/pages/TaxConfigPage.tsx",
    "../frontend/src/services/tax-config.service.ts",
    "../frontend/src/services/invoices.service.ts"
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file no encontrado" -ForegroundColor Red
        $allPassed = $false
    }
}

# Verificar documentación
Write-Host ""
Write-Host "7. Verificando documentación..." -ForegroundColor Yellow

$docFiles = @(
    "../doc/14-impuestos/README.md",
    "../doc/14-impuestos/MEJORAS_IMPLEMENTADAS.md",
    "../doc/14-impuestos/EJEMPLOS_USO.md",
    "../doc/14-impuestos/RESUMEN_COMPLETO.md",
    "../doc/14-impuestos/CHECKLIST_VERIFICACION.md"
)

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file no encontrado" -ForegroundColor Red
        $allPassed = $false
    }
}

# Verificar scripts de migración
Write-Host ""
Write-Host "8. Verificando scripts de migración..." -ForegroundColor Yellow

$migrationFiles = @(
    "add-tax-exempt-columns.sql",
    "apply-tax-exempt-migration.ps1",
    "src/migrations/1737417600000-AddTaxExemptToInvoices.ts"
)

foreach ($file in $migrationFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file no encontrado" -ForegroundColor Red
        $allPassed = $false
    }
}

# Resultado final
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "✓ VERIFICACIÓN EXITOSA" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "El sistema de impuestos está correctamente instalado." -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Reinicia el servidor backend si está corriendo" -ForegroundColor White
    Write-Host "2. Reinicia el servidor frontend si está corriendo" -ForegroundColor White
    Write-Host "3. Accede a http://localhost:5173" -ForegroundColor White
    Write-Host "4. Ve a 'Configuración de Impuestos'" -ForegroundColor White
    Write-Host "5. Crea una configuración de impuesto de prueba" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "✗ VERIFICACIÓN FALLIDA" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Se encontraron problemas. Por favor revisa los errores arriba." -ForegroundColor Red
    Write-Host ""
    Write-Host "Soluciones posibles:" -ForegroundColor Yellow
    Write-Host "1. Si faltan columnas en la BD, ejecuta: .\apply-tax-exempt-migration.ps1" -ForegroundColor White
    Write-Host "2. Si falta la tabla tax_configs, ejecuta: node scripts/create-tax-config.js" -ForegroundColor White
    Write-Host "3. Si faltan archivos, verifica que estés en la rama correcta" -ForegroundColor White
    Write-Host ""
    exit 1
}
