# Script para configurar Bucket Policy en S3
# Este script configura el acceso publico al bucket sin usar ACLs

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configurar Bucket Policy en S3" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cargar variables de entorno
$envFile = ".\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

$bucket = $env:AWS_S3_BUCKET
$region = $env:AWS_REGION

Write-Host "Bucket: $bucket" -ForegroundColor Yellow
Write-Host "Region: $region" -ForegroundColor Yellow
Write-Host ""

# Bucket Policy JSON
$policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$bucket/*"
    }
  ]
}
"@

Write-Host "Bucket Policy a aplicar:" -ForegroundColor Green
Write-Host $policy -ForegroundColor White
Write-Host ""

Write-Host "INSTRUCCIONES PARA APLICAR LA POLICY:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ir a AWS Console: https://console.aws.amazon.com/s3/" -ForegroundColor White
Write-Host "2. Seleccionar el bucket: $bucket" -ForegroundColor White
Write-Host "3. Ir a la pestana 'Permissions'" -ForegroundColor White
Write-Host "4. Scroll down hasta 'Bucket policy'" -ForegroundColor White
Write-Host "5. Click en 'Edit'" -ForegroundColor White
Write-Host "6. Copiar y pegar la policy de arriba" -ForegroundColor White
Write-Host "7. Click en 'Save changes'" -ForegroundColor White
Write-Host ""

Write-Host "ALTERNATIVA - Usar AWS CLI:" -ForegroundColor Yellow
Write-Host ""
Write-Host "aws s3api put-bucket-policy --bucket $bucket --policy file://bucket-policy.json" -ForegroundColor Cyan
Write-Host ""

# Guardar policy en archivo
$policyFile = "bucket-policy.json"
$policy | Out-File -FilePath $policyFile -Encoding UTF8
Write-Host "Policy guardada en: $policyFile" -ForegroundColor Green
Write-Host ""

Write-Host "NOTA IMPORTANTE:" -ForegroundColor Red
Write-Host "Si el bucket tiene 'Block all public access' habilitado," -ForegroundColor Yellow
Write-Host "debes deshabilitarlo primero en la seccion 'Block public access'." -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuracion Lista" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
