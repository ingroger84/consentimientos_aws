# Script de Despliegue - Versión 23.2.0
# Fecha: 01 de Febrero 2026
# Servidor: 100.28.198.249 (AWS Lightsail)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE VERSIÓN 23.2.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "100.28.198.249"
$USER = "ubuntu"
$KEY = "keys/AWS-ISSABEL.pem"
$REMOTE_PATH = "/home/ubuntu/consentimientos_aws"

# Verificar que existe la clave SSH
if (-not (Test-Path $KEY)) {
    Write-Host "❌ Error: No se encuentra la clave SSH en $KEY" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Paso 1: Compilando Frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ Frontend compilado exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Paso 2: Creando backup en servidor..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
ssh -i $KEY ${USER}@${SERVER} "cd $REMOTE_PATH; cp -r frontend/dist frontend/dist_backup_$timestamp"
Write-Host "✅ Backup creado: dist_backup_$timestamp" -ForegroundColor Green
Write-Host ""

Write-Host "📤 Paso 3: Subiendo archivos al servidor..." -ForegroundColor Yellow
scp -i $KEY -r frontend/dist/* ${USER}@${SERVER}:${REMOTE_PATH}/frontend/dist/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir archivos" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Archivos subidos exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Paso 4: Configurando permisos..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "cd $REMOTE_PATH/frontend/dist; chmod -R 755 ."
Write-Host "✅ Permisos configurados" -ForegroundColor Green
Write-Host ""

Write-Host "🧹 Paso 5: Limpiando caché de nginx..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "sudo rm -rf /var/cache/nginx/*"
Write-Host "✅ Caché de nginx limpiado" -ForegroundColor Green
Write-Host ""

Write-Host "🔄 Paso 6: Recargando nginx..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} "sudo systemctl reload nginx"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Advertencia: Error al recargar nginx, intentando restart..." -ForegroundColor Yellow
    ssh -i $KEY ${USER}@${SERVER} "sudo systemctl restart nginx"
}
Write-Host "✅ Nginx recargado" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Paso 7: Actualizando VERSION.md en servidor..." -ForegroundColor Yellow
ssh -i $KEY ${USER}@${SERVER} @"
cd $REMOTE_PATH
cat > VERSION.md << 'EOF'
# Versión del Sistema

## Versión Actual: 23.2.0
**Fecha:** 2026-02-01
**Tipo de Cambio:** MINOR

---

## Última Actualización
- **Versión**: 23.2.0
- **Fecha**: 01 de Febrero 2026
- **Hora**: $(Get-Date -Format "HH:mm:ss") UTC
- **Desplegado por**: Script automatizado

---

## Cambios en esta Versión
1. 🔐 Auditoría de seguridad crítica
2. 🔐 Removido archivo con credenciales del repositorio
3. 🔐 Actualizado .gitignore con mejores prácticas
4. 📝 Documentación completa de seguridad
5. 📝 Guías de rotación de credenciales

---

## Sincronización
La versión se sincroniza automáticamente en:
- ✓ frontend/package.json
- ✓ backend/package.json
- ✓ frontend/src/config/version.ts
- ✓ backend/src/config/version.ts
- ✓ VERSION.md (este archivo)
EOF
"@
Write-Host "✅ VERSION.md actualizado" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Paso 8: Verificando despliegue..." -ForegroundColor Yellow
Write-Host "Verificando archivos en servidor..." -ForegroundColor Gray
ssh -i $KEY ${USER}@${SERVER} "ls -lh $REMOTE_PATH/frontend/dist/index.html"
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "  • Versión desplegada: 23.2.0" -ForegroundColor White
Write-Host "  • Fecha: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor White
Write-Host "  • Servidor: $SERVER" -ForegroundColor White
Write-Host "  • Backup creado: dist_backup_$timestamp" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "  • Producción: https://archivoenlinea.com" -ForegroundColor White
Write-Host "  • Admin: https://admin.archivoenlinea.com" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "  • Limpia la caché de tu navegador (Ctrl + Shift + R)" -ForegroundColor White
Write-Host "  • O usa modo incógnito para verificar" -ForegroundColor White
Write-Host "  • Verifica que aparezca: Versión 23.2.0 - 2026-02-01" -ForegroundColor White
Write-Host ""
Write-Host "📝 Siguiente paso:" -ForegroundColor Cyan
Write-Host "  • Rotar credenciales expuestas (ver INSTRUCCIONES_URGENTES_SEGURIDAD.md)" -ForegroundColor White
Write-Host ""
