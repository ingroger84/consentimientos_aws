# Corrección: Manejo de Saltos de Línea en PDFs de Historias Clínicas

## Estado: ✅ COMPLETADO

## Problema Identificado

Al intentar generar un consentimiento desde una historia clínica, se producía el siguiente error:

```
Error: WinAnsi cannot encode "\n" (0x000a)
```

**Causa**: El contenido de las plantillas HC contenía saltos de línea (`\n`) que no podían ser codificados por la fuente WinAnsi de pdf-lib cuando se intentaba calcular el ancho del texto.

**Error secundario**: También se detectaron errores con logos corruptos:
```
Error: SOI not found in JPEG
```

## Solución Implementada

### 1. Manejo de Saltos de Línea

Se actualizó la función `renderContent` en `MedicalRecordsPdfService` para:

1. **Dividir por párrafos** (doble salto de línea `\n\n`)
2. **Dividir cada párrafo por líneas** (salto de línea simple `\n`)
3. **Limpiar caracteres especiales** antes de calcular anchos y dibujar texto

```typescript
// Antes
const paragraphs = content.split('\n\n');
for (const paragraph of paragraphs) {
  const words = paragraph.trim().split(' ');
  // ... procesamiento
}

// Después
const paragraphs = content.split('\n\n');
for (const paragraph of paragraphs) {
  const lines = paragraph.split('\n'); // ← Dividir por líneas
  for (const line of lines) {
    const words = line.trim().split(' ');
    // ... procesamiento con limpieza de caracteres
    const cleanTestLine = testLine.replace(/[\r\n\t]/g, ' '); // ← Limpiar
  }
}
```

### 2. Limpieza de Caracteres Especiales

Se agregó limpieza de caracteres que WinAnsi no puede codificar:

```typescript
const cleanCurrentLine = currentLine.replace(/[\r\n\t]/g, ' ');
page.drawText(cleanCurrentLine, {
  x: margin,
  y: yPosition,
  size: fontSize,
  font: useFont,
  color: rgb(0, 0, 0),
});
```

## Archivos Modificados

- `backend/src/medical-records/medical-records-pdf.service.ts`
  - Función `renderContent` actualizada

## Verificación

### Compilación
```bash
npm run start:dev
```
✅ Backend compilando sin errores
✅ Servidor corriendo en puerto 3000

### Prueba Manual

1. Ir a una historia clínica
2. Click en "Generar Consentimiento"
3. Seleccionar plantilla HC
4. Capturar firma
5. Click en "Generar Consentimiento"

**Resultado esperado**: PDF generado exitosamente sin errores de codificación

## Nota sobre Logos

Si persisten errores con logos (`SOI not found in JPEG`), verificar:

1. **Formato de imagen**: Asegurarse de que los logos sean JPEGs o PNGs válidos
2. **Corrupción**: Re-subir los logos desde la página de configuración
3. **Tamaño**: Verificar que las imágenes no sean demasiado grandes

El sistema tiene manejo de errores para continuar sin logos si fallan al cargar.

## Mejoras Futuras

1. **Soporte para más formatos de imagen**: Agregar soporte para WebP, SVG
2. **Validación de imágenes**: Validar formato antes de guardar en base de datos
3. **Compresión automática**: Comprimir imágenes grandes automáticamente
4. **Fuentes personalizadas**: Permitir usar fuentes que soporten más caracteres especiales

## Fecha de Implementación

26 de enero de 2026
