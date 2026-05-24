# Script de Despliegue: Redirección WWW en Nginx
# Versión: 92.3.11
# Propósito: Configurar redirección automática de www a sin www

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE: Redirección WWW → Sin WWW" -ForegroundColor Cyan
Write-Host "  Versión: 92.3.11" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "ubuntu@100.28.198.249"
$KEY = "AWS-ISSABEL.pem"
$CONFIG_FILE = "config/nginx/www-redirect.conf"

# Verificar que el archivo de configuración existe
if (-not (Test-Path $CONFIG_FILE)) {
    Write-Host "❌ Error: No se encuentra el archivo $CONFIG_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivo de configuración encontrado" -ForegroundColor Green
Write-Host ""

# Paso 1: Copiar archivo al servidor
Write-Host "📤 Paso 1: Copiando archivo al servidor..." -ForegroundColor Yellow
scp -i $KEY $CONFIG_FILE ${SERVER}:/tmp/www-redirect.conf
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al copiar archivo" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Archivo copiado a /tmp/www-redirect.conf" -ForegroundColor Green
Write-Host ""

# Paso 2: Mover al directorio de nginx
Write-Host "📁 Paso 2: Moviendo archivo a /etc/nginx/sites-available/..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "sudo mv /tmp/www-redirect.conf /etc/nginx/sites-available/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al mover archivo" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Archivo movido a /etc/nginx/sites-available/" -ForegroundColor Green
Write-Host ""

# Paso 3: Crear enlace simbólico
Write-Host "🔗 Paso 3: Creando enlace simbólico..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "sudo ln -sf /etc/nginx/sites-available/www-redirect.conf /etc/nginx/sites-enabled/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al crear enlace simbólico" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Enlace simbólico creado" -ForegroundColor Green
Write-Host ""

# Paso 4: Verificar configuración de nginx
Write-Host "🔍 Paso 4: Verificando configuración de nginx..." -ForegroundColor Yellow
$nginxTest = ssh -i $KEY $SERVER "sudo nginx -t 2>&1"
Write-Host $nginxTest
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en la configuración de nginx" -ForegroundColor Red
    Write-Host "⚠️  Revirtiendo cambios..." -ForegroundColor Yellow
    ssh -i $KEY $SERVER "sudo rm /etc/nginx/sites-enabled/www-redirect.conf"
    exit 1
}
Write-Host "✅ Configuración de nginx válida" -ForegroundColor Green
Write-Host ""

# Paso 5: Recargar nginx
Write-Host "🔄 Paso 5: Recargando nginx..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "sudo nginx -s reload"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al recargar nginx" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Nginx recargado exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 6: Probar redirecciones
Write-Host "🧪 Paso 6: Probando redirecciones..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Probando: www.termaleses.archivoenlinea.com" -ForegroundColor Cyan
$test1 = ssh -i $KEY $SERVER "curl -I -s http://www.termaleses.archivoenlinea.com | grep -i location"
if ($test1 -match "termaleses.archivoenlinea.com") {
    Write-Host "  ✅ Redirección funcionando: $test1" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Redirección no detectada (puede ser normal si el DNS no está configurado)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "  Probando: www.archivoenlinea.com" -ForegroundColor Cyan
$test2 = ssh -i $KEY $SERVER "curl -I -s http://www.archivoenlinea.com | grep -i location"
if ($test2 -match "archivoenlinea.com") {
    Write-Host "  ✅ Redirección funcionando: $test2" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Redirección no detectada (puede ser normal si el DNS no está configurado)" -ForegroundColor Yellow
}
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Configuración de redirección instalada" -ForegroundColor Green
Write-Host "✅ Nginx recargado" -ForegroundColor Green
Write-Host ""
Write-Host "📝 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verificar que el certificado SSL incluya www:" -ForegroundColor White
Write-Host "   ssh -i $KEY $SERVER 'sudo certbot certificates'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Si el certificado NO incluye www, agregarlo:" -ForegroundColor White
Write-Host "   ssh -i $KEY $SERVER 'sudo certbot certonly --nginx -d archivoenlinea.com -d www.archivoenlinea.com -d *.archivoenlinea.com'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Probar redirecciones desde tu navegador:" -ForegroundColor White
Write-Host "   - http://www.termaleses.archivoenlinea.com" -ForegroundColor Gray
Write-Host "   - http://www.archivoenlinea.com" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Informar al usuario sobre la URL correcta:" -ForegroundColor White
Write-Host "   - ✅ termaleses.archivoenlinea.com (sin www)" -ForegroundColor Gray
Write-Host "   - ❌ termales.archivoenlinea.com (slug incorrecto)" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
