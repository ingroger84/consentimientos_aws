# Script para forzar actualizacion de cache en navegadores
# Agrega timestamp unico a todos los archivos

Write-Host "=== FORZANDO ACTUALIZACION DE CACHE ===" -ForegroundColor Cyan

# 1. Generar timestamp unico
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
Write-Host "Timestamp: $timestamp" -ForegroundColor Yellow

# 2. Modificar index.html en servidor para agregar timestamp a TODOS los archivos
Write-Host ""
Write-Host "Modificando index.html en servidor..." -ForegroundColor Yellow

$script = @"
cd /var/www/html
# Backup
sudo cp index.html index.html.bak

# Agregar timestamp a todos los archivos JS y CSS
sudo sed -i 's/\.js\"/\.js?v=$timestamp\"/g' index.html
sudo sed -i 's/\.css\"/\.css?v=$timestamp\"/g' index.html

# Mostrar resultado
echo "=== INDEX.HTML MODIFICADO ==="
cat index.html
"@

ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 $script

Write-Host ""
Write-Host "OK Index.html modificado con timestamp: $timestamp" -ForegroundColor Green

# 3. Reiniciar Nginx para limpiar cualquier cache del servidor
Write-Host ""
Write-Host "Reiniciando Nginx..." -ForegroundColor Yellow
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo systemctl restart nginx"
Write-Host "OK Nginx reiniciado" -ForegroundColor Green

# 4. Verificar
Write-Host ""
Write-Host "=== VERIFICACION ===" -ForegroundColor Cyan
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cat /var/www/html/index.html | grep 'index-' | head -3"

Write-Host ""
Write-Host "=== COMPLETADO ===" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "1. Cierra COMPLETAMENTE tu navegador (todas las ventanas)" -ForegroundColor White
Write-Host "2. Abre el navegador nuevamente" -ForegroundColor White
Write-Host "3. Ve a: https://archivoenlinea.com" -ForegroundColor White
Write-Host "4. Presiona Ctrl+F5 varias veces" -ForegroundColor White
Write-Host ""
Write-Host "Si aun ves la version antigua:" -ForegroundColor Yellow
Write-Host "- Abre modo incognito (Ctrl+Shift+N)" -ForegroundColor White
Write-Host "- Ve a archivoenlinea.com" -ForegroundColor White
Write-Host "- Deberas ver v7.0.4 - 2026-01-23" -ForegroundColor White
Write-Host ""
