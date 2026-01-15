# Script para corregir la codificación de caracteres en mail.service.ts

$filePath = "src/mail/mail.service.ts"

# Leer el archivo con codificación UTF-8
$content = Get-Content -Path $filePath -Encoding UTF8 -Raw

Write-Host "Corrigiendo caracteres especiales..." -ForegroundColor Yellow

# Reemplazos de emojis usando códigos HTML
$content = $content -replace 'ðŸ"„', '&#128196;'  # 📄
$content = $content -replace 'âœ…', '&#9989;'    # ✅
$content = $content -replace 'ðŸ'°', '&#128176;'  # 💰
$content = $content -replace 'âš ï¸', '&#9888;&#65039;'  # ⚠️
$content = $content -replace 'ðŸŽ‰', '&#127881;'  # 🎉
$content = $content -replace 'ðŸ"§', '&#128295;'  # 🔧
$content = $content -replace 'ðŸ"', '&#128272;'  # 🔐
$content = $content -replace 'ðŸ"‹', '&#128203;'  # 📋
$content = $content -replace 'ðŸ"—', '&#128279;'  # 🔗
$content = $content -replace 'â°', '&#9200;'    # ⏰

Write-Host "Emojis corregidos!" -ForegroundColor Green

# Guardar el archivo con codificación UTF-8
Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline

Write-Host "Archivo guardado correctamente!" -ForegroundColor Green
Write-Host "Reinicia el backend para aplicar los cambios." -ForegroundColor Cyan
