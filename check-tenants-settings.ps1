# Script para verificar settings de los tenants reportados

Write-Host "Verificando settings de tenants..." -ForegroundColor Cyan
Write-Host ""

$slugs = @("termaleses", "aquiub", "demo-medico")

foreach ($slug in $slugs) {
    Write-Host "Verificando: $slug.archivoenlinea.com" -ForegroundColor Yellow
    
    $url = "https://archivoenlinea.com/api/settings/public"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -Headers @{
            "X-Tenant-Slug" = $slug
        }
        
        Write-Host "  Company Name: $($response.companyName)" -ForegroundColor White
        Write-Host "  Logo URL: $($response.logoUrl)" -ForegroundColor White
        Write-Host "  Primary Color: $($response.primaryColor)" -ForegroundColor White
        
        if (-not $response.logoUrl) {
            Write-Host "  WARNING: NO tiene logo configurado" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Verificacion completada" -ForegroundColor Green
