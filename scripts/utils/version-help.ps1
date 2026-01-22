# Ayuda del Sistema de Versionamiento

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     SISTEMA INTELIGENTE DE VERSIONAMIENTO v1.2.0          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 COMANDOS DISPONIBLES" -ForegroundColor Yellow
Write-Host ""

Write-Host "  Ver versión actual:" -ForegroundColor White
Write-Host "    .\scripts\utils\version.ps1 show" -ForegroundColor Gray
Write-Host "    node scripts/utils/show-version.js" -ForegroundColor Gray
Write-Host ""

Write-Host "  Incrementar versión:" -ForegroundColor White
Write-Host "    .\scripts\utils\version.ps1 patch    " -ForegroundColor Gray -NoNewline
Write-Host "# 1.2.0 → 1.2.1" -ForegroundColor DarkGray
Write-Host "    .\scripts\utils\version.ps1 minor    " -ForegroundColor Gray -NoNewline
Write-Host "# 1.2.0 → 1.3.0" -ForegroundColor DarkGray
Write-Host "    .\scripts\utils\version.ps1 major    " -ForegroundColor Gray -NoNewline
Write-Host "# 1.2.0 → 2.0.0" -ForegroundColor DarkGray
Write-Host ""

Write-Host "  Verificar sincronización:" -ForegroundColor White
Write-Host "    node scripts/utils/verify-version-sync.js" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 DETECCIÓN AUTOMÁTICA" -ForegroundColor Yellow
Write-Host ""
Write-Host "  El sistema detecta automáticamente el tipo de cambio:" -ForegroundColor White
Write-Host ""
Write-Host "  MAJOR (X.0.0) - Breaking Changes" -ForegroundColor Red
Write-Host "    • Cambios en migraciones de BD" -ForegroundColor Gray
Write-Host "    • Modificaciones en autenticación" -ForegroundColor Gray
Write-Host "    • Commits con: BREAKING CHANGE, [MAJOR]" -ForegroundColor Gray
Write-Host ""
Write-Host "  MINOR (0.X.0) - Nuevas Funcionalidades" -ForegroundColor Green
Write-Host "    • Nuevas features" -ForegroundColor Gray
Write-Host "    • Commits con: feat:, feature:, [MINOR]" -ForegroundColor Gray
Write-Host ""
Write-Host "  PATCH (0.0.X) - Correcciones" -ForegroundColor Blue
Write-Host "    • Correcciones de bugs" -ForegroundColor Gray
Write-Host "    • Optimizaciones" -ForegroundColor Gray
Write-Host "    • Commits con: fix:, bugfix:, hotfix:" -ForegroundColor Gray
Write-Host ""

Write-Host "📝 EJEMPLOS DE COMMITS" -ForegroundColor Yellow
Write-Host ""
Write-Host "  git commit -m 'feat: sistema de reportes'      " -ForegroundColor Gray -NoNewline
Write-Host "→ MINOR" -ForegroundColor Green
Write-Host "  git commit -m 'fix: error en cálculo'          " -ForegroundColor Gray -NoNewline
Write-Host "→ PATCH" -ForegroundColor Blue
Write-Host "  git commit -m 'BREAKING CHANGE: nueva API'     " -ForegroundColor Gray -NoNewline
Write-Host "→ MAJOR" -ForegroundColor Red
Write-Host ""

Write-Host "🔄 FLUJO AUTOMÁTICO" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Hacer cambios en el código" -ForegroundColor White
Write-Host "  2. git add ." -ForegroundColor Gray
Write-Host "  3. git commit -m 'feat: nueva funcionalidad'" -ForegroundColor Gray
Write-Host "  4. " -ForegroundColor Gray -NoNewline
Write-Host "✓ Versión actualizada automáticamente" -ForegroundColor Green
Write-Host "  5. git push origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "📖 DOCUMENTACIÓN COMPLETA" -ForegroundColor Yellow
Write-Host ""
Write-Host "  doc/15-versionamiento/SISTEMA_INTELIGENTE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
