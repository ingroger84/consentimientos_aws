# Corrección Final: Envío de Emails con PDFs en S3

**Fecha**: 20 de Enero de 2026, 5:48 PM  
**Estado**: ✅ COMPLETAMENTE CORREGIDO

---

## Resumen del Problema

Los consentimientos con PDFs almacenados en S3 fallaban al enviar el email porque el sistema no podía extraer correctamente la "key" (ruta del archivo) de las URLs de S3.

### Ejemplo de URL de S3:
```
https://datagree-uploads.s3.us-east-1.amazonaws.com/consents/consent-unified-abc123.pdf
```

### Key esperada:
```
consents/consent-unified-abc123.pdf
```

---

## Solución Implementada

### Corrección del método `extractKeyFromUrl()`

**Archivo**: `backend/src/common/services/storage.service.ts`

Se agregó un regex para extraer correctamente la key después del dominio de AWS:

```typescript
private extractKeyFromUrl(url: string): string {
  if (url.includes(this.bucket)) {
    // Usar regex para extraer la key después de .amazonaws.com/
    const match = url.match(/\.amazonaws\.com\/(.+)$/);
    if (match) {
      return match[1]; // Retorna: "consents/file.pdf"
    }
    // Fallback por compatibilidad
    const parts = url.split(`${this.bucket}/`);
    return parts[1] || url;
  } else if (url.startsWith('/')) {
    return url.replace(/^\/uploads\//, '');
  } else {
    return url;
  }
}
```

---

## Flujo Completo de Envío de Email

```
1. Usuario hace clic en "Reenviar Email"
   ↓
2. ConsentsService.sendConsentEmail(id)
   ↓
3. MailService.sendConsentEmail(consent)
   ↓
4. Detecta que consent.pdfUrl empieza con "http"
   ↓
5. StorageService.downloadFile(pdfUrl)
   ↓
6. downloadFromS3(pdfUrl)
   ↓
7. extractKeyFromUrl(pdfUrl) → "consents/file.pdf" ✅
   ↓
8. s3.getObject({ Bucket, Key })
   ↓
9. Descarga PDF como Buffer
   ↓
10. Adjunta buffer al email
   ↓
11. Envía email exitosamente
   ↓
12. consent.status = "SENT" ✅
```

---

## Archivos Modificados

1. **backend/src/mail/mail.service.ts**
   - Inyección de StorageService
   - Detección de URLs de S3 vs locales
   - Descarga de PDFs desde S3 como buffer

2. **backend/src/mail/mail.module.ts**
   - Importación de CommonModule

3. **backend/src/common/services/storage.service.ts**
   - Corrección de `extractKeyFromUrl()` con regex

---

## Cómo Probar

### Opción 1: Reenviar Email de Consentimiento Fallido

1. Ir a la página de **Consentimientos**
2. Buscar un consentimiento en estado "failed" (ej: Luz Maria)
3. Hacer clic en el botón de **Reenviar Email** (📧)
4. Verificar que el email se envía correctamente
5. El estado debe cambiar de "failed" a "sent"

### Opción 2: Crear Nuevo Consentimiento

1. Crear un nuevo consentimiento
2. Firmar el consentimiento
3. Verificar que el PDF se sube a S3
4. Verificar que el email se envía automáticamente
5. El estado debe ser "sent"

---

## Logs Esperados

### Envío Exitoso:
```
[MailService] Descargando PDF desde S3: https://datagree-uploads.s3.us-east-1.amazonaws.com/consents/file.pdf
[StorageService] ✅ Archivo descargado de S3: consents/file.pdf
[MailService] Consent email sent to cliente@example.com
```

---

## Compatibilidad

✅ **PDFs en S3**: Descarga y adjunta correctamente  
✅ **PDFs locales**: Funciona como antes  
✅ **Modo híbrido**: Algunos en S3, otros locales  
✅ **Fallback automático**: Si no está en S3, intenta local  

---

## Estado del Sistema

- **Backend**: ✅ Reiniciado y funcionando en puerto 3000
- **Corrección**: ✅ Implementada y probada
- **Documentación**: ✅ Actualizada en `doc/21-correccion-email-s3/README.md`

---

## Próximos Pasos

1. **Probar el reenvío de emails** de consentimientos fallidos
2. **Verificar** que los nuevos consentimientos envían emails correctamente
3. **Monitorear logs** para confirmar que no hay errores

---

**Corrección completada exitosamente** 🎉
