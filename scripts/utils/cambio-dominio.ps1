# Script para cambiar dominio de datagree.net a archivoenlinea.com
# Y cambiar DatAgree/DataGree a "Archivo en Línea"

Write-Host "Iniciando cambio de dominio y marca..." -ForegroundColor Cyan

# Archivos a modificar
$archivos = @(
    "frontend/src/App.tsx",
    "frontend/src/utils/api-url.ts",
    "frontend/src/pages/PublicLandingPage.tsx",
    "frontend/src/pages/LandingPage.tsx",
    "frontend/src/pages/SuspendedAccountPage.tsx",
    "frontend/src/components/landing/SignupModal.tsx",
    "frontend/src/components/landing/PricingSection.tsx",
    "backend/src/mail/mail.service.ts",
    "scripts/deploy-auto.ps1",
    "README.md"
)

foreach ($archivo in $archivos) {
    if (Test-Path $archivo) {
        Write-Host "Procesando: $archivo" -ForegroundColor Yellow
        
        # Leer contenido
        $contenido = Get-Content $archivo -Raw -Encoding UTF8
        
        # Reemplazos de dominio
        $contenido = $contenido -replace 'datagree\.net', 'archivoenlinea.com'
        $contenido = $contenido -replace 'datagree-', 'archivoenlinea-'
        
        # Reemplazos de marca
        $contenido = $contenido -replace 'DatAgree', 'Archivo en Línea'
        $contenido = $contenido -replace 'DataGree', 'Archivo en Línea'
        
        # Guardar
        $contenido | Set-Content $archivo -Encoding UTF8 -NoNewline
        
        Write-Host "  ✓ Actualizado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ No encontrado: $archivo" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Cambio completado!" -ForegroundColor Green
Write-Host "Dominio: datagree.net → archivoenlinea.com" -ForegroundColor Cyan
Write-Host "Marca: DatAgree/DataGree → Archivo en Línea" -ForegroundColor Cyan
