# Script para verificar tenant Termales directamente con SQL

$serverIP = "100.28.198.249"
$keyPath = "AWS-ISSABEL.pem"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO TENANT TERMALES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ejecutando queries SQL..." -ForegroundColor Yellow

$query = @"
-- Verificar datos del tenant
SELECT 
  id,
  name,
  slug,
  status,
  plan,
  billing_day,
  billing_cycle,
  trial_ends_at,
  use_custom_price,
  custom_price_monthly,
  custom_price_annual
FROM tenants
WHERE slug = 'termaleses'
  AND deleted_at IS NULL;

-- Verificar facturas pendientes
SELECT 
  id,
  invoice_number,
  status,
  due_date,
  total_amount,
  created_at
FROM invoices
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'termaleses' AND deleted_at IS NULL)
  AND status IN ('pending', 'overdue')
ORDER BY due_date ASC;
"@

# Guardar query en archivo temporal
$query | Out-File -FilePath "temp-query.sql" -Encoding UTF8

# Subir query al servidor
scp -i $keyPath temp-query.sql ubuntu@${serverIP}:/tmp/

# Ejecutar query
ssh -i $keyPath ubuntu@$serverIP @"
cd /home/ubuntu/consentimientos_aws/backend
source .env
psql `$DATABASE_URL -f /tmp/temp-query.sql
"@

# Limpiar archivo temporal
Remove-Item temp-query.sql

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "VERIFICACION COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
