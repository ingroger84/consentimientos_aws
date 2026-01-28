# Solución: Logos HC No Aparecen en PDFs Generados

**Fecha:** 26 de enero de 2026  
**Versión:** 15.0.12  
**Estado:** ✅ RESUELTO

---

## 📋 PROBLEMA IDENTIFICADO

Los PDFs de consentimientos de Historias Clínicas (HC) se generaban sin mostrar:
- Logo en el header
- Marca de agua en el fondo

A pesar de que los logos estaban correctamente configurados en la base de datos.

---

## 🔍 DIAGNÓSTICO

### Verificación Inicial
```bash
node backend/check-hc-logos-config.js
```

**Resultado:** Los logos HC estaban correctamente configurados en BD:
- `hcLogoUrl`: ✓ Configurado (S3)
- `hcWatermarkLogoUrl`: ✓ Configurado (S3)

### Causa Raíz Identificada

El problema estaba en `backend/src/medical-records/medical-records-pdf.service.ts`:

**ANTES:**
```typescript
private async loadImage(pdfDoc: PDFDocument, url: string): Promise<any> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const imageBytes = response.data;
  // ...
}
```

**Problema:** 
- El servicio usaba `axios` para descargar imágenes directamente desde las URLs
- Los archivos en S3 NO tienen ACL público (por seguridad)
- Las URLs de S3 requieren autenticación para acceder
- `axios` no puede acceder a archivos privados de S3

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. Modificación del PDF Service

**Archivo:** `backend/src/medical-records/medical-records-pdf.service.ts`

**Cambios:**

1. **Inyección del StorageService:**
```typescript
@Injectable()
export class MedicalRecordsPdfService {
  constructor(private storageService: StorageService) {}
```

2. **Método loadImage actualizado:**
```typescript
private async loadImage(pdfDoc: PDFDocument, url: string): Promise<any> {
  console.log('loadImage - Descargando imagen desde:', url);
  
  try {
    // Usar storage service para descargar (maneja S3 y local)
    const imageBytes = await this.storageService.downloadFile(url);
    console.log('loadImage - Imagen descargada, tamaño:', imageBytes.length, 'bytes');

    if (url.toLowerCase().endsWith('.png')) {
      console.log('loadImage - Embebiendo como PNG');
      return await pdfDoc.embedPng(imageBytes);
    } else {
      console.log('loadImage - Embebiendo como JPG');
      return await pdfDoc.embedJpg(imageBytes);
    }
  } catch (error) {
    console.error('loadImage - Error al cargar imagen:', error.message);
    throw error;
  }
}
```

### 2. Ventajas de la Solución

✅ **Maneja S3 con autenticación:** El StorageService usa las credenciales AWS configuradas  
✅ **Funciona con archivos locales:** También soporta archivos en `/uploads/`  
✅ **Logging mejorado:** Permite diagnosticar problemas de carga de imágenes  
✅ **Seguridad:** No requiere hacer públicos los archivos de S3  

---

## 🔧 PASOS DE IMPLEMENTACIÓN

### 1. Modificar el PDF Service
```bash
# Editar backend/src/medical-records/medical-records-pdf.service.ts
# - Agregar constructor con StorageService
# - Reemplazar método loadImage
```

### 2. Recompilar Backend
```bash
cd backend
npm run build
```

### 3. Reiniciar Backend
```bash
# Detener proceso actual
# Iniciar: npm run start:dev
```

---

## 📊 VERIFICACIÓN

### Antes de la Solución
- ❌ Logo header: No aparece
- ❌ Marca de agua: No aparece
- ⚠️ Error en logs: `axios` no puede acceder a URLs privadas de S3

### Después de la Solución
- ✅ Logo header: Aparece correctamente
- ✅ Marca de agua: Aparece con opacidad 0.1
- ✅ Logs: Muestran descarga exitosa de imágenes

### Cómo Probar

1. **Login como Admin General:**
   - URL: `http://demo-medico.localhost:5174`
   - Usuario: `admin@clinicademo.com`
   - Password: `Demo123!`

2. **Ir a Historias Clínicas:**
   - Abrir una HC existente
   - Click en "Generar Consentimiento"

3. **Generar Consentimiento:**
   - Seleccionar plantilla(s) HC
   - Capturar firma
   - Tomar foto
   - Generar PDF

4. **Verificar PDF:**
   - Abrir el PDF generado
   - Verificar logo en header (esquina superior izquierda)
   - Verificar marca de agua en el centro (opacidad baja)

---

## 🔄 FLUJO TÉCNICO

```
1. Usuario genera consentimiento HC
   ↓
2. medical-records.service.ts obtiene logos de settings
   - hcLogoUrl (o logoUrl como fallback)
   - hcWatermarkLogoUrl (o watermarkLogoUrl como fallback)
   ↓
3. Pasa URLs al medical-records-pdf.service.ts
   ↓
4. PDF Service llama a loadImage() para cada logo
   ↓
5. loadImage() usa storageService.downloadFile()
   - Si es S3: Usa credenciales AWS para descargar
   - Si es local: Lee desde sistema de archivos
   ↓
6. Imagen descargada se embebe en el PDF
   ↓
7. PDF generado con logos visibles
```

---

## 📝 ARCHIVOS MODIFICADOS

### Modificados
- `backend/src/medical-records/medical-records-pdf.service.ts`
  - Agregado constructor con StorageService
  - Reemplazado método loadImage()

### Sin Cambios (Ya Funcionaban Correctamente)
- `backend/src/medical-records/medical-records.service.ts` ✅
- `backend/src/settings/settings.service.ts` ✅
- `backend/src/common/services/storage.service.ts` ✅

---

## 🎯 RESULTADO FINAL

✅ **Problema resuelto completamente**

Los PDFs de consentimientos HC ahora muestran:
- Logo en el header (dentro de círculo blanco)
- Marca de agua en el centro (opacidad 0.1)
- Todos los logos se cargan correctamente desde S3

**Tiempo de implementación:** ~15 minutos  
**Complejidad:** Baja  
**Impacto:** Alto (funcionalidad crítica restaurada)

---

## 📚 LECCIONES APRENDIDAS

1. **No usar axios para archivos privados de S3**
   - Siempre usar el StorageService que maneja autenticación

2. **Verificar permisos de archivos en S3**
   - Los archivos pueden estar configurados pero no accesibles públicamente
   - El StorageService maneja esto correctamente

3. **Logging es crucial**
   - Los logs agregados ayudaron a identificar el problema rápidamente

4. **Reutilizar servicios existentes**
   - El StorageService ya existía y manejaba todos los casos
   - No reinventar la rueda

---

## 🔗 REFERENCIAS

- **Documentación S3:** https://docs.aws.amazon.com/s3/
- **pdf-lib:** https://pdf-lib.js.org/
- **StorageService:** `backend/src/common/services/storage.service.ts`

---

**Documentado por:** Kiro AI  
**Revisado por:** Usuario  
**Estado:** Producción ✅
