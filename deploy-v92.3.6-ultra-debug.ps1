# Script para desplegar versión 92.3.6 - Ultra debugging

$serverIP = "100.28.198.249"
$keyPath = "AWS-ISSABEL.pem"

Write-Host "Desplegando v92.3.6..." -ForegroundColor Cyan

scp -i $keyPath -r frontend/dist/* ubuntu@${serverIP}:/home/ubuntu/consentimientos_aws/frontend/dist/
ssh -i $keyPath ubuntu@$serverIP "sudo rm -rf /var/cache/nginx/* && sudo nginx -s reload"

Write-Host "Despliegue completado. Version: 92.3.6" -ForegroundColor Green
Write-Host "Accede a termaleses.archivoenlinea.com con Ctrl+Shift+R" -ForegroundColor Yellow
Write-Host "Abre la consola (F12) y busca logs con 🏠 y 🚨" -ForegroundColor Yellow
