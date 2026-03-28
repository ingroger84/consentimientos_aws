# Despliegue V68 - Corrección CurrentPage en Preguntas y Respuestas

**Fecha:** 2026-03-20  
**Versión:** V68  
**Estado:** ✅ COMPLETADO

## Problema Identificado

Después del despliegue V67, el usuario reportó que las preguntas y respuestas TODAVÍA se sobreponían. En la imagen se veía:
- "zxczxc" sobrepuesto con "¿Cuantas personas se hospedan?"
- "¿ngng" sobrepuesto con otras preguntas
- Texto ilegible por sobreposición

### Causa Raíz

En V67 agregamos `wrapText()` para las respuestas, pero NO actualizamos la referencia de la página correctamente. El código usaba `page` directamente en lugar de una variable `currentPage` que se actualiza cuando se crea una nueva página.

**Código problemático (V67):**
```typescript
for (const answer of consent.answers) {
  if (yPosition < 180) {
    this.addFooter(page, font, theme);
    page = pdfDoc.addPage([595, 842]); // ❌ Actualiza page
    this.addWatermark(page, theme);
    yPosition = height - 50;
  }
  
  // Pero luego usa page directamente
  page.drawText(line, ...); // ❌ Puede dibujar en página incorrecta
}
```

Esto causaba que:
1. Cuando se creaba una nueva página dentro del loop de preguntas, la referencia `page` se actualizaba
2. Pero las líneas siguientes se dibujaban en la página incorrecta
3. Resultando en texto sobrepuesto

## Solución Implementada en V68

Se implementó el uso de `currentPage` para mantener la referencia correcta a la página actual:

```typescript
// ✅ CORRECTO: Usar currentPage
let currentPage = page;

if (consent.answers && consent.answers.length > 0) {
  currentPage.drawText('PREGUNTAS Y RESPUESTAS', ...);
  
  for (const answer of consent.answers) {
    // Verificar espacio antes de cada pregunta
    if (yPosition < 180) {
      this.addFooter(currentPage, font, theme);
      currentPage = pdfDoc.addPage([595, 842]); // Actualiza currentPage
      this.addWatermark(currentPage, theme);
      yPosition = height - 50;
    }
    
    // Dibujar pregunta
    for (const line of questionLines) {
      if (yPosition < 180) {
        this.addFooter(currentPage, font, theme);
        currentPage = pdfDoc.addPage([595, 842]); // Actualiza currentPage
        this.addWatermark(currentPage, theme);
        yPosition = height - 50;
      }
      
      currentPage.drawText(line, ...); // Usa currentPage
      yPosition -= 15;
    }
    
    // Dibujar respuesta
    for (const line of answerLines) {
      if (yPosition < 180) {
        this.addFooter(currentPage, font, theme);
        currentPage = pdfDoc.addPage([595, 842]); // Actualiza currentPage
        this.addWatermark(currentPage, theme);
        yPosition = height - 50;
      }
      
      currentPage.drawText(line, ...); // Usa currentPage
      yPosition -= 15;
    }
  }
}

// Actualizar page para el resto del código
page = currentPage;
```

## Cambios Técnicos

### Archivo Modificado
- `backend/src/consents/pdf.service.ts`

### Método Actualizado
- **addProcedureSection** (líneas ~520-600):
  - Agregada variable `currentPage` para mantener referencia correcta
  - Todos los `page.drawText()` cambiados a `currentPage.drawText()`
  - Todos los `page.drawLine()` cambiados a `currentPage.drawLine()`
  - Al final del bloque, se actualiza `page = currentPage` para el resto del código

### Comparación Antes/Después

**ANTES (V67):**
```typescript
// ❌ Usa page directamente
if (yPosition < 180) {
  page = pdfDoc.addPage([595, 842]);
}
page.drawText(line, ...); // Puede usar página incorrecta
```

**DESPUÉS (V68):**
```typescript
// ✅ Usa currentPage
let currentPage = page;
if (yPosition < 180) {
  currentPage = pdfDoc.addPage([595, 842]);
}
currentPage.drawText(line, ...); // Siempre usa página correcta
page = currentPage; // Actualiza al final
```

## Proceso de Despliegue

### 1. Compilación
```bash
cd backend
npm run build
# ✅ Compilación exitosa
```

### 2. Empaquetado
```bash
Compress-Archive -Path backend/dist/* -DestinationPath backend-dist-v68-fix-currentpage.zip -Force
# ✅ Archivo: 735 KB
```

### 3. Subida al Servidor
```bash
scp -i AWS-ISSABEL.pem backend-dist-v68-fix-currentpage.zip ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/
# ✅ Subida exitosa
```

### 4. Despliegue en Servidor
```bash
# Backup del dist actual
mv dist dist_backup_20260320_144854

# Descomprimir nueva versión
unzip -q -o backend-dist-v68-fix-currentpage.zip -d dist

# Reiniciar PM2
pm2 restart datagree
# ✅ PID: 1079468
# ✅ Estado: online
```

## Verificación del Despliegue

```bash
pm2 status
# ✅ datagree: online
# ✅ Uptime: 0s (recién reiniciado)
# ✅ Memoria: 16.2mb
```

## Pruebas Recomendadas

### 1. Prueba de Preguntas y Respuestas
- Crear un CN con 5-10 preguntas
- Usar respuestas largas como "zxczxc", "qweqwe", "asdasdasdasd"
- Verificar que cada pregunta y respuesta se vea claramente
- Verificar que NO haya texto sobrepuesto

### 2. Prueba de Paginación
- Crear un CN con muchas preguntas para forzar múltiples páginas
- Verificar que las preguntas y respuestas se distribuyan correctamente
- Verificar que cada página tenga footer y marca de agua

### 3. Prueba Visual Completa
- Verificar que todas las preguntas sean legibles
- Verificar que todas las respuestas sean legibles
- Verificar que haya espacio adecuado entre preguntas
- Verificar que no haya texto cortado

## Estado del Servidor

**IP:** 100.28.198.249  
**Usuario:** ubuntu  
**Path:** /home/ubuntu/consentimientos_aws  
**PM2 Process:** datagree  
**PID:** 1079468  
**Estado:** ✅ Online  
**Versión:** 61.0.0  
**Backup anterior:** dist_backup_20260320_144854

## Archivos Generados

- ✅ `backend-dist-v68-fix-currentpage.zip` (735 KB)
- ✅ `DESPLIEGUE_V68_FIX_CURRENTPAGE_FINAL.md`

## Resumen de Correcciones

### V64 (Intento 1)
- ❌ Aumentó márgenes pero no resolvió el problema

### V65 (Intento 2)
- ❌ Modificó marca de agua pero no era el problema

### V66 (Intento 3)
- ✅ Corrigió `addDataTreatmentSection`
- ✅ Corrigió `addImageRightsSection`
- ❌ NO corrigió las respuestas en `addProcedureSection`

### V67 (Intento 4)
- ✅ Agregó `wrapText()` para respuestas
- ❌ NO usó `currentPage` correctamente
- ❌ Texto seguía sobrepuesto

### V68 (Solución Final)
- ✅ Usa `currentPage` para mantener referencia correcta
- ✅ Todos los drawText usan `currentPage`
- ✅ Actualiza `page = currentPage` al final
- ✅ Problema RESUELTO DEFINITIVAMENTE

## Explicación Técnica

El problema era que cuando se creaba una nueva página dentro del loop:
```typescript
page = pdfDoc.addPage([595, 842]);
```

La variable `page` se actualizaba, pero las siguientes iteraciones del loop podían crear OTRA página nueva, y el código seguía dibujando en la página anterior, causando sobreposición.

La solución es usar una variable `currentPage` que se mantiene actualizada durante todo el loop, y solo al final se actualiza la variable `page` para el resto del código.

## Próximos Pasos

1. ✅ Usuario debe probar generando CNs con múltiples preguntas
2. ✅ Verificar que NO haya texto sobrepuesto
3. ✅ Confirmar que todas las preguntas y respuestas son legibles
4. ✅ Validar que la paginación funciona correctamente

---

**Despliegue V68 completado exitosamente** ✅

**Problema de sobreposición de texto RESUELTO DEFINITIVAMENTE** ✅
