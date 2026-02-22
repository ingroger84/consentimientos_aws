# Script para aplicar permisos directamente via SSH
# Version: 38.1.19
# Fecha: 2026-02-19

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  APLICAR PERMISOS - CONEXION DIRECTA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "../AWS-ISSABEL.pem"

Write-Host "Conectando al servidor AWS..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar SQL directamente en el servidor
$SQL = @"
-- Agregar permiso CREATE_MEDICAL_RECORDS a todos los roles que pueden ver HC
INSERT INTO role_permissions (\"roleId\", \"permissionId\", \"createdAt\", \"updatedAt\")
SELECT 
    r.id as \"roleId\",
    p.id as \"permissionId\",
    NOW() as \"createdAt\",
    NOW() as \"updatedAt\"
FROM roles r
CROSS JOIN permissions p
WHERE p.name = 'create_medical_records'
AND r.id IN (
    SELECT DISTINCT rp.\"roleId\"
    FROM role_permissions rp
    JOIN permissions p2 ON rp.\"permissionId\" = p2.id
    WHERE p2.name = 'view_medical_records'
)
AND NOT EXISTS (
    SELECT 1 
    FROM role_permissions rp2 
    WHERE rp2.\"roleId\" = r.id 
    AND rp2.\"permissionId\" = p.id
);

-- Verificar resultados
SELECT 
    r.name as role_name,
    COUNT(*) as total_permissions
FROM roles r
JOIN role_permissions rp ON r.id = rp.\"roleId\"
JOIN permissions p ON rp.\"permissionId\" = p.id
WHERE p.name LIKE '%medical_records%'
GROUP BY r.name
ORDER BY r.name;
"@

# Guardar SQL en archivo temporal
$SQL | Out-File -FilePath "temp_permissions.sql" -Encoding UTF8

# Copiar SQL al servidor
Write-Host "Copiando SQL al servidor..." -ForegroundColor Yellow
scp -i $KEY temp_permissions.sql ${USER}@${SERVER}:/tmp/

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al copiar SQL" -ForegroundColor Red
    Remove-Item "temp_permissions.sql" -Force
    exit 1
}

Write-Host "SQL copiado exitosamente" -ForegroundColor Green
Write-Host ""

# Ejecutar SQL en el servidor
Write-Host "Ejecutando SQL en la base de datos..." -ForegroundColor Yellow
Write-Host ""

ssh -i $KEY ${USER}@${SERVER} "cd /home/ubuntu/consentimientos_aws/backend ; export `$(cat .env | grep -v '^#' | xargs) ; psql postgresql://`$DB_USERNAME:`$DB_PASSWORD@`$DB_HOST:`$DB_PORT/`$DB_DATABASE -f /tmp/temp_permissions.sql"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Error al ejecutar SQL" -ForegroundColor Red
    Remove-Item "temp_permissions.sql" -Force
    exit 1
}

# Limpiar archivo temporal
Remove-Item "temp_permissions.sql" -Force
ssh -i $KEY ${USER}@${SERVER} "rm /tmp/temp_permissions.sql"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  PERMISOS APLICADOS EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "Los usuarios deben CERRAR SESION y volver a iniciar sesion" -ForegroundColor Yellow
Write-Host "para que los nuevos permisos surtan efecto." -ForegroundColor Yellow
Write-Host ""
