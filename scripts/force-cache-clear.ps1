# Script para forzar limpieza de caché en producción
# Este script agrega headers de no-cache al index.html

$serverIP = "100.28.198.249"
$sshKey = "AWS-ISSABEL.pem"

Write-Host "🔄 Forzando limpieza de caché en producción..." -ForegroundColor Cyan

# Crear archivo .htaccess para forzar no-cache en archivos HTML
$htaccessContent = @"
# Forzar no-cache para archivos HTML
<FilesMatch "\.(html|htm)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
</FilesMatch>

# Cache para assets (JS, CSS, imágenes)
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=31536000"
</FilesMatch>
"@

# Guardar temporalmente
$htaccessContent | Out-File -FilePath "temp/.htaccess" -Encoding UTF8 -NoNewline

Write-Host "📤 Copiando .htaccess al servidor..." -ForegroundColor Yellow
scp -i $sshKey temp/.htaccess ubuntu@${serverIP}:/var/www/html/

Write-Host "🔄 Reiniciando Nginx..." -ForegroundColor Yellow
ssh -i $sshKey ubuntu@${serverIP} "sudo systemctl reload nginx"

Write-Host "✅ Caché forzada a limpiar. Los usuarios verán la nueva versión." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Instrucciones para usuarios:" -ForegroundColor Cyan
Write-Host "   1. Presionar Ctrl+F5 (Windows) o Cmd+Shift+R (Mac)" -ForegroundColor White
Write-Host "   2. O limpiar caché del navegador manualmente" -ForegroundColor White
