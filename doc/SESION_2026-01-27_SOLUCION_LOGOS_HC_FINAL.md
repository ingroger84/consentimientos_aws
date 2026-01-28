# Solución Final: Logos HC No Aparecen en PDFs

**Fecha:** 2026-01-27  
**Versión:** 15.0.14  
**Estado:** ✅ RESUELTO

---

## Problema

Los PDFs de consentimientos HC generados NO mostraban el logo en el header ni la marca de agua, a pesar de estar configurados correctamente en la base de datos.

### Síntomas
- Logo principal: NO aparecía en el header del PDF
- Marca de agua: NO aparecía en el fondo del PDF
- Configuración en BD: ✅ Correcta
- Descarga desde S3: ✅ Exitosa (55272 bytes)
- Error en logs: `SOI not found in JPEG`

---

## Causa Raíz

**Los archivos guardados en S3 con extensión `.jpg` eran en realidad archivos PNG.**

### Análisis Técnico

1. **Archivos en S3:**
   - Nombre: `hc-logo-661fc78c-b075-4249-b842-24514eb7bb5a-1769490873267.jpg`
   - Extensión: `.jpg`
   - **Formato real:** PNG

2. **Magic Numbers (primeros bytes):**
   ```
   89 50 4E 47 0D 0A 1A 0A  (‰PNG....)
   ```
   - Esto identifica un archivo PNG, NO JPEG
   - JPEG debería empezar con: `FF D8 FF`

3. **Código anterior:**
   ```typescript
   // ❌ INCORRECTO: Asumía formato por extensión
   if (url.toLowerCase().endsWith('.jpg')) {
     return await pdfDoc.embedJpg(imageBytes);
   } else {
     return await pdfDoc.embedPng(imageBytes);
   }
   ```

4. **Error resultante:**
   - `pdf-lib` intentaba embeder como JPEG
   - El archivo era PNG
   - Error: "SOI not found in JPEG" (Start Of Image marker)

---

## Solución Implementada

### Modificación en `medical-records-pdf.service.ts`

**Método `loadImage()` actualizado para detectar formato automáticamente:**

```typescript
private async loadImage(pdfDoc: PDFDocument, url: string): Promise<any> {
  console.log('loadImage - Descargando imagen desde:', url);
  
  try {
    // Usar storage service para descargar (maneja S3 y local)
    const imageBytes = await this.storageService.downloadFile(url);
    console.log('loadImage - Imagen descargada, tamaño:', imageBytes.length, 'bytes');

    // ✅ NUEVO: Detectar formato de imagen por magic numbers (primeros bytes)
    // PNG: 89 50 4E 47 (‰PNG)
    // JPEG: FF D8 FF
    const isPNG = imageBytes[0] === 0x89 && imageBytes[1] === 0x50 && 
                  imageBytes[2] === 0x4E && imageBytes[3] === 0x47;
    const isJPEG = imageBytes[0] === 0xFF && imageBytes[1] === 0xD8 && 
                   imageBytes[2] === 0xFF;

    if (isPNG) {
      console.log('loadImage - Detectado formato PNG (magic numbers)');
      return await pdfDoc.embedPng(imageBytes);
    } else if (isJPEG) {
      console.log('loadImage - Detectado formato JPEG (magic numbers)');
      return await pdfDoc.embedJpg(imageBytes);
    } else {
      console.error('loadImage - Formato de imagen no soportado');
      console.error('Primeros 4 bytes (hex):', imageBytes.slice(0, 4).toString('hex'));
      throw new Error('Formato de imagen no soportado. Solo PNG y JPEG son válidos.');
    }
  } catch (error) {
    console.error('loadImage - Error al cargar imagen:', error.message);
    throw error;
  }
}
```

### Ventajas de la Solución

1. **Independiente de extensión:** No confía en la extensión del archivo
2. **Detección precisa:** Usa magic numbers (estándar de la industria)
3. **Robusto:** Funciona con cualquier nombre de archivo
4. **Logs detallados:** Facilita debugging futuro
5. **Error handling:** Mensaje claro si el formato no es soportado

---

## Verificación

### Logs Exitosos

```
=== GENERANDO PDF HC - VERSIÓN 15.0.14 ===
Intentando cargar logo principal desde: https://...hc-logo-...jpg
loadImage - Descargando imagen desde: https://...hc-logo-...jpg
loadImage - Imagen descargada, tamaño: 55272 bytes
loadImage - Detectado formato PNG (magic numbers)
✓ Logo principal cargado exitosamente

Intentando cargar marca de agua desde: https://...hc-watermark-...jpg
loadImage - Descargando imagen desde: https://...hc-watermark-...jpg
loadImage - Imagen descargada, tamaño: 55272 bytes
loadImage - Detectado formato PNG (magic numbers)
✓ Marca de agua cargada exitosamente
```

### Script de Prueba

Creado `backend/test-logo-format.js` para verificar formato de archivos:

```javascript
// Descarga archivos desde S3 y verifica magic numbers
const isPNG = imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50 && 
              imageBuffer[2] === 0x4E && imageBuffer[3] === 0x47;
const isJPEG = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8 && 
               imageBuffer[2] === 0xFF;
```

**Resultado:**
```
✓ Logo descargado, tamaño: 55272 bytes
Primeros 10 bytes (hex): 89504e470d0a1a0a0000
Primeros 10 bytes (ascii): .PNG......
✗ NO es un JPEG válido (SOI marker NO encontrado)
✓ Es un PNG válido
```

---

## Archivos Modificados

1. **`backend/src/medical-records/medical-records-pdf.service.ts`**
   - Método `loadImage()` actualizado
   - Detección automática de formato por magic numbers

2. **`backend/package.json`**
   - Versión actualizada a 15.0.14

3. **`frontend/package.json`**
   - Versión actualizada a 15.0.14

4. **`VERSION.md`**
   - Historial actualizado con versión 15.0.14

5. **`doc/SESION_2026-01-27_SOLUCION_LOGOS_HC_FINAL.md`** (este archivo)
   - Documentación completa de la solución

---

## Scripts de Verificación Creados

1. **`backend/test-logo-format.js`**
   - Descarga logos desde S3
   - Verifica magic numbers
   - Identifica formato real del archivo

2. **`backend/test-consent-endpoint.js`**
   - Prueba completa del flujo de generación de consentimientos HC
   - Login → Obtener HC → Obtener plantillas → Crear consentimiento
   - Verifica que el PDF se genera correctamente

---

## Instrucciones para el Usuario

### Para Ver los Logos en PDFs

1. **Generar un NUEVO consentimiento HC:**
   - Ir a Historias Clínicas
   - Seleccionar una HC existente
   - Click en "Generar Consentimiento"
   - Seleccionar plantillas
   - Capturar firma
   - Click en "Generar Consentimiento"

2. **Verificar el PDF:**
   - El PDF se descargará automáticamente
   - Abrir el PDF
   - Verificar que aparezca:
     - ✅ Logo en el header (esquina superior izquierda)
     - ✅ Marca de agua en el fondo (centro de la página)

### Notas Importantes

- ⚠️ Los PDFs generados ANTES de esta actualización NO se modifican automáticamente
- ⚠️ Debe generar un NUEVO consentimiento HC para ver los logos
- ✅ Los logos configurados en Configuración → Logos HC se usarán automáticamente
- ✅ Si no hay logos HC configurados, se usarán los logos de CN como fallback

---

## Lecciones Aprendidas

1. **No confiar en extensiones de archivo:**
   - Las extensiones pueden ser incorrectas o engañosas
   - Siempre verificar el contenido real del archivo

2. **Magic Numbers son confiables:**
   - Estándar de la industria para identificar tipos de archivo
   - Independiente del nombre o extensión

3. **Logs detallados son esenciales:**
   - Facilitaron identificar el problema exacto
   - Permitieron verificar la solución

4. **Testing exhaustivo:**
   - Scripts de prueba automatizados
   - Verificación de cada paso del proceso

---

## Referencias

### Magic Numbers (File Signatures)

- **PNG:** `89 50 4E 47 0D 0A 1A 0A` (‰PNG....)
- **JPEG:** `FF D8 FF E0` o `FF D8 FF E1` (ÿØÿà o ÿØÿá)
- **GIF:** `47 49 46 38` (GIF8)
- **PDF:** `25 50 44 46` (%PDF)

### Documentación

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [File Signatures (Wikipedia)](https://en.wikipedia.org/wiki/List_of_file_signatures)
- [PNG Specification](http://www.libpng.org/pub/png/spec/1.2/PNG-Structure.html)
- [JPEG Specification](https://www.w3.org/Graphics/JPEG/)

---

## Estado Final

✅ **PROBLEMA RESUELTO**

- Logo principal: ✅ Aparece correctamente
- Marca de agua: ✅ Aparece correctamente
- Detección automática: ✅ Funciona
- Logs detallados: ✅ Implementados
- Testing: ✅ Verificado
- Documentación: ✅ Completa

**Versión:** 15.0.14  
**Fecha de Resolución:** 2026-01-27  
**Tiempo de Resolución:** ~2 horas  
**Complejidad:** Media (requirió análisis de formato de archivos)
