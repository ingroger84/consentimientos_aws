# Script para agregar admin.localhost al archivo hosts
# EJECUTAR COMO ADMINISTRADOR

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"

# Verificar si ya existe la entrada
$content = Get-Content $hostsPath
$exists = $content | Select-String "admin.localhost"

if ($exists) {
    Write-Host "✅ La entrada 'admin.localhost' ya existe en el archivo hosts" -ForegroundColor Green
} else {
    Write-Host "📝 Agregando 'admin.localhost' al archivo hosts..." -ForegroundColor Yellow
    
    # Agregar la entrada
    Add-Content -Path $hostsPath -Value "`n127.0.0.1 admin.localhost"
    
    Write-Host "✅ Entrada agregada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ahora puedes acceder a:" -ForegroundColor Cyan
    Write-Host "  - http://admin.localhost:5173" -ForegroundColor White
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
