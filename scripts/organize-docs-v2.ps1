# Script para organizar documentación
Write-Host "Organizando documentación..." -ForegroundColor Cyan

# Crear carpetas
$folders = @(
    "doc/76-pagos-registro",
    "doc/75-tipos-documento", 
    "doc/74-integracion-bold",
    "doc/73-bold-correccion",
    "doc/60-68-plantillas-backups",
    "doc/54-57-perfiles-super-admin",
    "doc/39-53-admisiones-permisos",
    "doc/herramientas-test"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }
}

# Mover archivos v76 (pagos en registro)
Write-Host "Moviendo archivos v76..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*V76*" -File | Move-Item -Destination "doc/76-pagos-registro/" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Filter "*v76*" -File | Move-Item -Destination "doc/76-pagos-registro/" -Force -ErrorAction SilentlyContinue

# Mover archivos v75 (tipos documento)
Write-Host "Moviendo archivos v75..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*V75*" -File | Move-Item -Destination "doc/75-tipos-documento/" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Filter "*v75*" -File | Move-Item -Destination "doc/75-tipos-documento/" -Force -ErrorAction SilentlyContinue

# Mover archivos v74 (Bold)
Write-Host "Moviendo archivos v74..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*V74*" -File | Move-Item -Destination "doc/74-integracion-bold/" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Filter "*v74*" -File | Move-Item -Destination "doc/74-integracion-bold/" -Force -ErrorAction SilentlyContinue

# Mover archivos v73 (Bold corrección)
Write-Host "Moviendo archivos v73..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*V73*" -File | Move-Item -Destination "doc/73-bold-correccion/" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Filter "*v73*" -File | Move-Item -Destination "doc/73-bold-correccion/" -Force -ErrorAction SilentlyContinue

# Mover archivos Bold generales
Write-Host "Moviendo archivos Bold..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*BOLD*" -File | Move-Item -Destination "doc/74-integracion-bold/" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Filter "*Bold*" -File | Move-Item -Destination "doc/74-integracion-bold/" -Force -ErrorAction SilentlyContinue

# Mover archivos v60-68 (plantillas, backups)
Write-Host "Moviendo archivos v60-68..." -ForegroundColor Yellow
60..68 | ForEach-Object {
    Get-ChildItem -Path . -Filter "*V$_*" -File | Move-Item -Destination "doc/60-68-plantillas-backups/" -Force -ErrorAction SilentlyContinue
    Get-ChildItem -Path . -Filter "*v$_*" -File | Move-Item -Destination "doc/60-68-plantillas-backups/" -Force -ErrorAction SilentlyContinue
}

# Mover archivos v54-57 (perfiles)
Write-Host "Moviendo archivos v54-57..." -ForegroundColor Yellow
54..57 | ForEach-Object {
    Get-ChildItem -Path . -Filter "*V$_*" -File | Move-Item -Destination "doc/54-57-perfiles-super-admin/" -Force -ErrorAction SilentlyContinue
    Get-ChildItem -Path . -Filter "*v$_*" -File | Move-Item -Destination "doc/54-57-perfiles-super-admin/" -Force -ErrorAction SilentlyContinue
}

# Mover archivos HTML de test
Write-Host "Moviendo archivos HTML..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "test-*.html" -File | Move-Item -Destination "doc/herramientas-test/" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Filter "VERIFICAR_*.html" -File | Move-Item -Destination "doc/herramientas-test/" -Force -ErrorAction SilentlyContinue

Write-Host "Completado!" -ForegroundColor Green
