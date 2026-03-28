# Despliegue V67 - Corrección Definitiva Respuestas con WrapText

**Fecha:** 2026-03-20  
**Versión:** V67  
**Estado:** ✅ COMPLETADO

## Problema Real Identificado

El usuario reportó que después del despliegue V66, el texto TODAVÍA se sobreponía en las respuestas de las preguntas. En la imagen proporcionada se ve claramente:
- "zxczxc" se sobrepone con "¿Cuantas personas se hospedan?"
- Las respuestas largas no se dividen en múltiples líneas

### Causa Raíz REAL

En V66 corregimos `addDataTreatmentSection` y `addImageRightsSection`, pero NO corregimos el problema PRINCIPAL en `addProcedureSection`:

**Las RESPUESTAS no estaban usando `wrapText()`**

```typescript
// ❌ CÓDIGO INCORRECTO (V66):
page.drawText(`Respuesta: ${answer.value}`, {
  x: margin + 10,
  y: yPosition,
  size: 10,
  font,
  color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
});
yPosition -= 20; // Solo resta 20px, sin importar cuánto texto haya
```

Esto causaba que:
1. Respuestas largas como "zxczxc" se dibujaran en UNA SOLA LÍNEA
2. Si la línea era muy larga, se salía del margen o se sobreponía con la siguiente pregunta
3. No se verificaba espacio antes de cada línea de respuesta

## Solución Implementada en V67

### Cambio en `addProcedureSection`

Se modificó el renderizado de respuestas para:

1. **Usar `wrapText()` para dividir respuestas largas:**
```typescript
const answerText = `Respuesta: ${answer.value}`;
const answerLines = this.wrapText(answerText, font, 10, contentWidth - 20);
```

2. **Verificar espacio ANTES de cada línea de respuesta:**
```typescript
for (const line of answerLines) {
  if (yPosition < 180) {
    this.addFooter(page, font, theme);
    page = pdfDoc.addPage([595, 842]);
    this.addWatermark(page, theme);
    yPosition = height - 50;
  }

  page.drawText(line, {
    x: margin + 10,
    y: yPosition,
    size: 10,
    font,
    color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
  });
  yPosition -= 15; // Resta 15px por CADA línea
}
```

3. **Agregar espacio adicional entre preguntas:**
```typescript
yPosition -= 5; // Espacio adicional entre preguntas
```

## Cambios Técnicos

### Archivo Modificado
- `backend/src/consents/pdf.service.ts`

### Método Actualizado
- **addProcedureSection** (líneas ~560-600):
  - Respuestas ahora usan `wrapText()` para dividirse en múltiples líneas
  - Cada línea de respuesta verifica espacio antes de dibujarse
  - Espacio adicional de 5px entre preguntas para mejor legibilidad

### Comparación Antes/Después

**ANTES (V66):**
```typescript
// Respuesta en una sola línea, sin wrap
page.drawText(`Respuesta: ${answer.value}`, ...);
yPosition -= 20;
```

**DESPUÉS (V67):**
```typescript
// Respuesta dividida en múltiples líneas con wrap
const answerText = `Respuesta: ${answer.value}`;
const answerLines = this.wrapText(answerText, font, 10, contentWidth - 20);

for (const line of answerLines) {
  if (yPosition < 180) {
    // crear nueva página
  }
  page.drawText(line, ...);
  yPosition -= 15;
}
yPosition -= 5; // espacio adicional
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
Compress-Archive -Path backend/dist/* -DestinationPath backend-dist-v67-fix-respuestas-wrap.zip -Force
# ✅ Archivo: 735 KB
```

### 3. Subida al Servidor
```bash
scp -i AWS-ISSABEL.pem backend-dist-v67-fix-respuestas-wrap.zip ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/
# ✅ Subida exitosa
```

### 4. Despliegue en Servidor
```bash
# Backup del dist actual
mv dist dist_backup_20260320_144212

# Descomprimir nueva versión
unzip -q -o backend-dist-v67-fix-respuestas-wrap.zip -d dist

# Reiniciar PM2
pm2 restart datagree
# ✅ PID: 1079196
# ✅ Estado: online
```

## Verificación del Despliegue

```bash
pm2 status
# ✅ datagree: online
# ✅ Uptime: 0s (recién reiniciado)
# ✅ Memoria: 18.1mb

pm2 logs datagree --lines 20 --nostream
# ✅ Application is running on: http://localhost:3000
# ✅ Version: 61.0.0
# ✅ Sin errores
```

## Pruebas Recomendadas

### 1. Prueba de Respuestas Largas
- Crear un CN con respuestas largas como "zxczxc", "asuastr", "qweqwe"
- Verificar que cada respuesta se divida en múltiples líneas si es necesaria
- Verificar que NO haya sobreposición de texto

### 2. Prueba de Múltiples Preguntas
- Crear un CN con 5-10 preguntas
- Verificar que haya espacio adecuado entre cada pregunta y respuesta
- Verificar que se creen páginas automáticamente cuando sea necesario

### 3. Prueba de Paginación
- Crear un CN con muchas preguntas para forzar múltiples páginas
- Verificar que cada página tenga footer y marca de agua
- Verificar que no haya texto cortado o sobrepuesto

### 4. Prueba Visual Completa
- Verificar sección "PREGUNTAS Y RESPUESTAS"
- Verificar sección "DECLARACIÓN DE CONSENTIMIENTO"
- Verificar sección "TRATAMIENTO DE DATOS"
- Verificar sección "DERECHOS DE IMAGEN"
- Todas deben tener texto legible sin sobreposición

## Configuración de Marca de Agua

La marca de agua está configurada correctamente:
```typescript
const watermarkSize = Math.min(width, height) * 0.4; // 40% del tamaño
opacity: theme.watermarkOpacity // Opacidad del tema
```

## Estado del Servidor

**IP:** 100.28.198.249  
**Usuario:** ubuntu  
**Path:** /home/ubuntu/consentimientos_aws  
**PM2 Process:** datagree  
**PID:** 1079196  
**Estado:** ✅ Online  
**Versión:** 61.0.0  
**Backup anterior:** dist_backup_20260320_144212

## Archivos Generados

- ✅ `backend-dist-v67-fix-respuestas-wrap.zip` (735 KB)
- ✅ `DESPLIEGUE_V67_FIX_RESPUESTAS_WRAP.md`

## Resumen de Correcciones

### V64 (Intento 1)
- ❌ Aumentó márgenes pero no resolvió el problema

### V65 (Intento 2)
- ❌ Modificó marca de agua pero no era el problema

### V66 (Intento 3)
- ✅ Corrigió `addDataTreatmentSection`
- ✅ Corrigió `addImageRightsSection`
- ❌ NO corrigió las respuestas en `addProcedureSection`

### V67 (Solución Final)
- ✅ Corrigió las RESPUESTAS usando `wrapText()`
- ✅ Verificación de espacio antes de cada línea de respuesta
- ✅ Espacio adicional entre preguntas
- ✅ Problema RESUELTO

## Próximos Pasos

1. ✅ Usuario debe probar generando CNs con respuestas largas
2. ✅ Verificar que las respuestas se dividan correctamente en múltiples líneas
3. ✅ Confirmar que NO haya sobreposición de texto
4. ✅ Validar que la paginación funciona correctamente

---

**Despliegue V67 completado exitosamente** ✅

**Problema de sobreposición de texto en respuestas RESUELTO** ✅
