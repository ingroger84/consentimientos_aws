# Script simplificado para aplicar permisos
# Version: 38.1.19

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  APLICAR PERMISOS DE ADMISIONES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "../AWS-ISSABEL.pem"

# SQL a ejecutar
$SQL = @'
INSERT INTO role_permissions ("roleId", "permissionId", "createdAt", "updatedAt")
SELECT 
    r.id as "roleId",
    p.id as "permissionId",
    NOW() as "createdAt",
    NOW() as "updatedAt"
FROM roles r
CROSS JOIN permissions p
WHERE p.name = 'create_medical_records'
AND r.id IN (
    SELECT DISTINCT rp."roleId"
    FROM role_permissions rp
    JOIN permissions p2 ON rp."permissionId" = p2.id
    WHERE p2.name = 'view_medical_records'
)
AND NOT EXISTS (
    SELECT 1 
    FROM role_permissions rp2 
    WHERE rp2."roleId" = r.id 
    AND rp2."permissionId" = p.id
);
'@

Write-Host "Creando archivo SQL..." -ForegroundColor Yellow
$SQL | Out-File -FilePath "permissions.sql" -Encoding UTF8 -NoNewline

Write-Host "Copiando SQL al servidor..." -ForegroundColor Yellow
scp -i $KEY permissions.sql ${USER}@${SERVER}:/tmp/permissions.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al copiar SQL" -ForegroundColor Red
    exit 1
}

Write-Host "Ejecutando SQL..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar usando el script Node.js que ya existe
ssh -i $KEY ${USER}@${SERVER} @"
cd /home/ubuntu/consentimientos_aws/backend
cat > run-permissions.js << 'EOFJS'
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

async function run() {
  const client = await pool.connect();
  try {
    const fs = require('fs');
    const sql = fs.readFileSync('/tmp/permissions.sql', 'utf8');
    const result = await client.query(sql);
    console.log('Permisos aplicados:', result.rowCount, 'filas afectadas');
    
    const check = await client.query(\`
      SELECT r.name, COUNT(*) as perms
      FROM roles r
      JOIN role_permissions rp ON r.id = rp."roleId"
      JOIN permissions p ON rp."permissionId" = p.id
      WHERE p.name LIKE '%medical_records%'
      GROUP BY r.name
      ORDER BY r.name
    \`);
    
    console.log('\nPermisos por rol:');
    check.rows.forEach(row => console.log(\`  - \${row.name}: \${row.perms} permisos\`));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
EOFJS
node run-permissions.js
rm run-permissions.js
rm /tmp/permissions.sql
"@

Remove-Item "permissions.sql" -Force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  PERMISOS APLICADOS EXITOSAMENTE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE:" -ForegroundColor Yellow
    Write-Host "Los usuarios deben CERRAR SESION y volver a iniciar sesion" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Error al aplicar permisos" -ForegroundColor Red
    exit 1
}
