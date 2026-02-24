# Script para despliegue con limpieza forzada
# Elimina completamente los archivos antiguos y despliega nuevos

$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "AWS-ISSABEL.pem"

Write-Host "=== DESPLIEGUE CON LIMPIEZA FORZADA ===" -ForegroundColor Cyan
Write-Host ""

# 1. Compilar frontend localmente
Write-Host "1. Compilando frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar frontend" -ForegroundColor Red
    exit 1
}
Set-Location ..

# 2. Crear archivo tar con el dist
Write-Host "2. Creando archivo tar..." -ForegroundColor Yellow
tar -czf frontend-dist.tar.gz -C frontend/dist .

# 3. Copiar al servidor
Write-Host "3. Copiando al servidor..." -ForegroundColor Yellow
scp -i $KEY frontend-dist.tar.gz "${USER}@${SERVER}:/tmp/"

# 4. Ejecutar limpieza y despliegue en el servidor
Write-Host "4. Ejecutando limpieza y despliegue en servidor..." -ForegroundColor Yellow
ssh -i $KEY "${USER}@${SERVER}" @"
echo '=== LIMPIEZA COMPLETA ==='

# Detener nginx temporalmente
sudo systemctl stop nginx

# Eliminar COMPLETAMENTE los directorios antiguos
echo 'Eliminando archivos antiguos...'
sudo rm -rf /var/www/html/*
sudo rm -rf /home/ubuntu/consentimientos_aws/frontend/dist/*

# Crear directorios limpios
sudo mkdir -p /var/www/html
sudo mkdir -p /home/ubuntu/consentimientos_aws/frontend/dist

# Extraer archivos nuevos
echo 'Extrayendo archivos nuevos...'
cd /var/www/html
sudo tar -xzf /tmp/frontend-dist.tar.gz
sudo chown -R www-data:www-data /var/www/html

cd /home/ubuntu/consentimientos_aws/frontend/dist
sudo tar -xzf /tmp/frontend-dist.tar.gz
sudo chown -R ubuntu:ubuntu /home/ubuntu/consentimientos_aws/frontend/dist

# Agregar timestamp único a TODOS los archivos
echo 'Agregando timestamp único...'
TIMESTAMP=\$(date +%s)
echo "Timestamp: \$TIMESTAMP"

# Actualizar index.html en ambas ubicaciones
cd /var/www/html
sudo sed -i "s/\\.js/\\.js?v=\$TIMESTAMP/g" index.html
sudo sed -i "s/\\.css/\\.css?v=\$TIMESTAMP/g" index.html

cd /home/ubuntu/consentimientos_aws/frontend/dist
sed -i "s/\\.js/\\.js?v=\$TIMESTAMP/g" index.html
sed -i "s/\\.css/\\.css?v=\$TIMESTAMP/g" index.html

# Copiar páginas de diagnóstico
echo 'Copiando páginas de diagnóstico...'
sudo cp /home/ubuntu/consentimientos_aws/frontend/dist/clear-cache.html /var/www/html/ 2>/dev/null || true
sudo cp /home/ubuntu/consentimientos_aws/frontend/dist/diagnostic.html /var/www/html/ 2>/dev/null || true

# Limpiar caché de Nginx
echo 'Limpiando caché de Nginx...'
sudo rm -rf /var/cache/nginx/*

# Reiniciar nginx
echo 'Reiniciando Nginx...'
sudo systemctl start nginx
sudo systemctl reload nginx

# Verificar
echo ''
echo '=== VERIFICACIÓN ==='
echo 'Archivos en /var/www/html:'
ls -lh /var/www/html/*.html

echo ''
echo 'Timestamp en index.html:'
grep 'v=' /var/www/html/index.html | head -1

echo ''
echo 'Nginx status:'
sudo systemctl is-active nginx

echo ''
echo '=== DESPLIEGUE COMPLETADO ==='
"@

# 5. Limpiar archivo temporal
Write-Host "5. Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item frontend-dist.tar.gz

Write-Host ""
Write-Host "=== DESPLIEGUE COMPLETADO EXITOSAMENTE ===" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: Pide al usuario que:" -ForegroundColor Yellow
Write-Host "1. Cierre TODAS las pestañas de archivoenlinea.com" -ForegroundColor White
Write-Host "2. Abra una ventana de incógnito" -ForegroundColor White
Write-Host "3. Acceda a: https://admin.archivoenlinea.com/diagnostic.html" -ForegroundColor White
Write-Host "4. Haga clic en 'LIMPIAR TODO'" -ForegroundColor White
Write-Host "5. Luego vaya al login" -ForegroundColor White
