# Despliegue V72 - Corrección de Sobreposición de Texto en PDFs CN

**Fecha**: 2026-03-21 17:34  
**Versión**: 72.0.0  
**Estado**: ✅ COMPLETADO

---

## Problema Identificado

Después de 7 intentos de despliegue (V64-V71), el problema persistía:
- Las preguntas y respuestas se sobreponían en los PDFs de CN
- Los logs de debug NO se ejecutaban (indicando que el código no se desplegaba correctamente)

### Causa Raíz Encontrada

Al revisar el código en el servidor, encontré que:

1. **Las respuestas NO usaban `wrapText()`** - Se dibujaban en una sola línea sin importar su longitud
2. **No había verificación de espacio antes de cada línea** - Solo se verificaba al inicio del loop
3. **El código desplegado en V64-V71 nunca se subió al servidor** - Los archivos se compilaban localmente pero no se transferían

Código problemático (línea 513 del servidor):
```typescript
page.drawText(`Respuesta: ${answer.value}`, {  // ❌ Sin wrapText
  x: margin + 10,
  y: yPosition,
  size: 10,
  font,
  color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
});
yPosition -= 20;
```

---

## Solución Implementada

### Cambios en `backend/src/consents/pdf.service.ts`

1. **Respuestas con `wrapText()`**:
```typescript
const answerText = `Respuesta: ${answer.value}`;
const answerLines = this.wrapText(answerText, font, 10, contentWidth - 20);
```

2. **Verificación de espacio ANTES de cada línea**:
```typescript
for (const line of answerLines) {
  if (yPosition < 180) {
    this.addFooter(currentPage, font, theme);
    currentPage = pdfDoc.addPage([595, 842]);
    this.addWatermark(currentPage, theme);
    yPosition = height - 50;
  }
  currentPage.drawText(line, { ... });
  yPosition -= 15;
}
```

3. **Variable `currentPage` para mantener referencia correcta**:
```typescript
let currentPage = page;
// ... operaciones con currentPage ...
page = currentPage; // Actualizar referencia al final
```

4. **Marca de agua usa opacidad de configuración** (ya estaba correcto):
```typescript
opacity: theme.watermarkOpacity
```

---

## Archivos Modificados

- `backend/src/consents/pdf.service.ts` - Método `addProcedureSection`
- `backend/package.json` - Versión 72.0.0
- `frontend/package.json` - Versión 72.0.0
- `frontend/src/config/version.ts` - Versión 72.0.0

---

## Despliegue Realizado

1. ✅ Backend compilado (72.0.0)
2. ✅ Frontend compilado (72.0.0)
3. ✅ Archivo `pdf.service.js` subido al servidor
4. ✅ Frontend desplegado
5. ✅ Servidor reiniciado (PM2 PID: 1094538)
6. ✅ Código verificado en servidor (wrapText presente)

---

## Verificación

```bash
# Verificar código en servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "grep -n 'wrapText.*answerText' /home/ubuntu/consentimientos_aws/backend/dist/consents/pdf.service.js"
# Resultado: Línea 446 - ✅ Código presente

# Verificar versión frontend
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cat /home/ubuntu/consentimientos_aws/frontend/dist/version.json"
# Resultado: 72.0.0 - ✅ Versión correcta
```

---

## Instrucciones de Prueba

1. Genera un nuevo consentimiento CN con preguntas y respuestas largas
2. Verifica que las preguntas y respuestas NO se sobrepongan
3. Verifica que cada pregunta y respuesta se divida en múltiples líneas si es necesario
4. Verifica que se creen nuevas páginas automáticamente cuando no hay espacio
5. Verifica que la marca de agua respete la opacidad configurada en Sistema/Configuración

---

## Diferencia con Despliegues Anteriores

**V64-V71**: El código se compilaba localmente pero NO se subía al servidor correctamente

**V72**: 
- Código compilado Y subido correctamente
- Verificado en servidor con grep
- Servidor reiniciado completamente
- Frontend actualizado con versión 72.0.0

---

## Próximos Pasos

Si el problema persiste después de generar un nuevo consentimiento:
1. Verificar logs del servidor: `pm2 logs datagree --lines 50`
2. Verificar que `consent.answers` tenga datos
3. Verificar que las relaciones se carguen correctamente en `consents.service.ts`
