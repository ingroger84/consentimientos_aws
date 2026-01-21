# Script para probar la conexion con AWS S3
# Ejecutar: .\test-s3-connection.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Probando Conexion con AWS S3" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el backend este corriendo
Write-Host "1. Verificando que el backend este corriendo..." -ForegroundColor Yellow
try {
    # Intentar hacer login para verificar que el backend responde
    $testBody = @{
        email = "test@test.com"
        password = "test"
    } | ConvertTo-Json
    
    $null = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $testBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   OK Backend esta corriendo" -ForegroundColor Green
} catch {
    # Si recibimos un error 401, significa que el backend esta corriendo
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   OK Backend esta corriendo" -ForegroundColor Green
    } else {
        Write-Host "   ERROR Backend NO esta corriendo" -ForegroundColor Red
        Write-Host "   Por favor inicia el backend con: npm run start:dev" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "2. Obteniendo token de autenticacion..." -ForegroundColor Yellow

# Login como Super Admin
$loginBody = @{
    email = "superadmin@sistema.com"
    password = "superadmin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "   OK Token obtenido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "   ERROR al obtener token" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Consultando estado del almacenamiento..." -ForegroundColor Yellow

# Consultar estado
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/storage/status" -Method GET -Headers $headers
    Write-Host "   OK Estado obtenido:" -ForegroundColor Green
    Write-Host "     - Usar S3: $($statusResponse.useS3)" -ForegroundColor Cyan
    Write-Host "     - Bucket: $($statusResponse.bucket)" -ForegroundColor Cyan
    Write-Host "     - Region: $($statusResponse.region)" -ForegroundColor Cyan
    Write-Host "     - Endpoint: $($statusResponse.endpoint)" -ForegroundColor Cyan
} catch {
    Write-Host "   ERROR al obtener estado" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Probando conexion con S3..." -ForegroundColor Yellow

try {
    $testResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/storage/test-connection" -Method GET -Headers $headers
    
    if ($testResponse.success) {
        Write-Host "   OK Conexion exitosa con S3!" -ForegroundColor Green
        Write-Host "     - Mensaje: $($testResponse.message)" -ForegroundColor Cyan
        if ($testResponse.details) {
            Write-Host "     - Bucket: $($testResponse.details.bucket)" -ForegroundColor Cyan
            Write-Host "     - Region: $($testResponse.details.region)" -ForegroundColor Cyan
            Write-Host "     - Endpoint: $($testResponse.details.endpoint)" -ForegroundColor Cyan
            if ($testResponse.details.objectsCount -ne $null) {
                Write-Host "     - Objetos en bucket: $($testResponse.details.objectsCount)" -ForegroundColor Cyan
            }
        }
    } else {
        Write-Host "   ERROR en la conexion con S3" -ForegroundColor Red
        Write-Host "     - Mensaje: $($testResponse.message)" -ForegroundColor Yellow
        if ($testResponse.details) {
            Write-Host "     - Error: $($testResponse.details.error)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ERROR al probar conexion" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Prueba Completada" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
