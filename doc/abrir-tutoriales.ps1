# Script para Abrir Tutoriales de Pago
# Archivo en Línea - Tutorial de Pago

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TUTORIALES DE PAGO - ARCHIVO EN LÍNEA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Selecciona qué tutorial deseas abrir:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Tutorial Interactivo HTML (Recomendado)" -ForegroundColor Green
Write-Host "   - Navegación paso a paso" -ForegroundColor Gray
Write-Host "   - FAQ interactivo" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Presentación HTML (Estilo PowerPoint)" -ForegroundColor Green
Write-Host "   - 12 slides profesionales" -ForegroundColor Gray
Write-Host "   - Ideal para presentar" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Tutorial Markdown (Texto)" -ForegroundColor Green
Write-Host "   - Formato texto completo" -ForegroundColor Gray
Write-Host "   - Fácil de leer" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Guía para Crear PDF y Video" -ForegroundColor Green
Write-Host "   - Instrucciones detalladas" -ForegroundColor Gray
Write-Host "   - Herramientas recomendadas" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Guía para Crear PowerPoint" -ForegroundColor Green
Write-Host "   - Múltiples opciones" -ForegroundColor Gray
Write-Host "   - Plantillas sugeridas" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Resumen de Todos los Tutoriales" -ForegroundColor Green
Write-Host "   - Comparación de formatos" -ForegroundColor Gray
Write-Host "   - Estado de cada material" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Abrir TODOS los tutoriales" -ForegroundColor Magenta
Write-Host ""
Write-Host "0. Salir" -ForegroundColor Red
Write-Host ""

$opcion = Read-Host "Ingresa el número de tu opción"

switch ($opcion) {
    "1" {
        Write-Host ""
        Write-Host "Abriendo Tutorial Interactivo HTML..." -ForegroundColor Green
        Start-Process "tutorial-pago-interactivo.html"
        Write-Host "✓ Tutorial abierto en tu navegador" -ForegroundColor Green
        Write-Host ""
        Write-Host "Navegación:" -ForegroundColor Yellow
        Write-Host "  - Usa los botones 'Anterior' y 'Siguiente'" -ForegroundColor Gray
        Write-Host "  - O usa las flechas del teclado (← →)" -ForegroundColor Gray
    }
    "2" {
        Write-Host ""
        Write-Host "Abriendo Presentación HTML..." -ForegroundColor Green
        Start-Process "tutorial-pago-presentacion.html"
        Write-Host "✓ Presentación abierta en tu navegador" -ForegroundColor Green
        Write-Host ""
        Write-Host "Navegación:" -ForegroundColor Yellow
        Write-Host "  - Usa los botones 'Anterior' y 'Siguiente'" -ForegroundColor Gray
        Write-Host "  - O usa las flechas del teclado (← →)" -ForegroundColor Gray
        Write-Host "  - Presiona F11 para pantalla completa" -ForegroundColor Gray
    }
    "3" {
        Write-Host ""
        Write-Host "Abriendo Tutorial Markdown..." -ForegroundColor Green
        Start-Process "TUTORIAL_PAGO_FACTURA.md"
        Write-Host "✓ Tutorial abierto" -ForegroundColor Green
    }
    "4" {
        Write-Host ""
        Write-Host "Abriendo Guía para Crear PDF y Video..." -ForegroundColor Green
        Start-Process "GUIA_CREACION_TUTORIAL_PDF_VIDEO.md"
        Write-Host "✓ Guía abierta" -ForegroundColor Green
    }
    "5" {
        Write-Host ""
        Write-Host "Abriendo Guía para Crear PowerPoint..." -ForegroundColor Green
        Start-Process "CONVERTIR_PRESENTACION_A_POWERPOINT.md"
        Write-Host "✓ Guía abierta" -ForegroundColor Green
    }
    "6" {
        Write-Host ""
        Write-Host "Abriendo Resumen de Tutoriales..." -ForegroundColor Green
        Start-Process "RESUMEN_TUTORIALES_PAGO.md"
        Write-Host "✓ Resumen abierto" -ForegroundColor Green
    }
    "7" {
        Write-Host ""
        Write-Host "Abriendo TODOS los tutoriales..." -ForegroundColor Magenta
        Start-Process "tutorial-pago-interactivo.html"
        Start-Sleep -Seconds 1
        Start-Process "tutorial-pago-presentacion.html"
        Start-Sleep -Seconds 1
        Start-Process "TUTORIAL_PAGO_FACTURA.md"
        Start-Sleep -Seconds 1
        Start-Process "GUIA_CREACION_TUTORIAL_PDF_VIDEO.md"
        Start-Sleep -Seconds 1
        Start-Process "CONVERTIR_PRESENTACION_A_POWERPOINT.md"
        Start-Sleep -Seconds 1
        Start-Process "RESUMEN_TUTORIALES_PAGO.md"
        Write-Host "✓ Todos los tutoriales abiertos" -ForegroundColor Green
    }
    "0" {
        Write-Host ""
        Write-Host "Saliendo..." -ForegroundColor Yellow
        exit
    }
    default {
        Write-Host ""
        Write-Host "Opción no válida" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
