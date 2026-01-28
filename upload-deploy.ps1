# Script para subir codigo y desplegar
# IP del servidor
$ServerIP = "18.232.87.116"
$KeyFile = "AWS-ISSABEL.pem"

Write-Host "Subiendo codigo al servidor..." -ForegroundColor Yellow

# Verificar que existe la clave
if (-not (Test-Path $KeyFile)) {
    Write-Host "ERROR: No se encuentra $KeyFile" -ForegroundColor Red
    Write-Host "Descargala desde: https://lightsail.aws.amazon.com/" -ForegroundColor Yellow
    exit 1
}

# Crear archivo tar del codigo
Write-Host "Comprimiendo codigo..." -ForegroundColor Yellow
tar -czf code.tar.gz backend frontend package.json

# Subir script de instalacion
Write-Host "Subiendo script de instalacion..." -ForegroundColor Yellow
scp -i $KeyFile deploy-server.sh ubuntu@${ServerIP}:/home/ubuntu/

# Subir codigo
Write-Host "Subiendo codigo..." -ForegroundColor Yellow
scp -i $KeyFile code.tar.gz ubuntu@${ServerIP}:/home/ubuntu/

# Ejecutar instalacion
Write-Host "Ejecutando instalacion en servidor..." -ForegroundColor Yellow
ssh -i $KeyFile ubuntu@$ServerIP "chmod +x deploy-server.sh && ./deploy-server.sh"

# Descomprimir y desplegar codigo
Write-Host "Desplegando codigo..." -ForegroundColor Yellow
ssh -i $KeyFile ubuntu@$ServerIP @"
cd /var/www/consentimientos
tar -xzf /home/ubuntu/code.tar.gz
/home/ubuntu/deploy-code.sh
"@

Write-Host ""
Write-Host "DESPLIEGUE COMPLETADO!" -ForegroundColor Green
Write-Host ""
Write-Host "Servidor: http://$ServerIP" -ForegroundColor White
Write-Host "API: http://$ServerIP/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Para configurar SSL:" -ForegroundColor Yellow
Write-Host "ssh -i $KeyFile ubuntu@$ServerIP" -ForegroundColor White
Write-Host "sudo certbot --nginx -d archivoenlinea.com -d www.archivoenlinea.com" -ForegroundColor White
Write-Host ""

# Limpiar
Remove-Item code.tar.gz -ErrorAction SilentlyContinue
