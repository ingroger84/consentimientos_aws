# Guia de Pruebas - Favicon Personalizado

## Checklist de Pruebas

---

## Pruebas Funcionales

### ✅ Prueba 1: Subir Favicon como Super Admin

**Objetivo**: Verificar que el Super Admin puede subir un favicon global

**Pasos**:
1. Login como Super Admin (`superadmin@sistema.com` / `superadmin123`)
2. Ir a **Configuracion** > **Logos**
3. Scroll hasta la seccion **Favicon**
4. Click en **Subir Favicon**
5. Seleccionar un archivo .ico
6. Esperar a que se suba

**Resultado Esperado**:
- ✅ Mensaje: "Favicon actualizado correctamente"
- ✅ El favicon aparece en la preview
- ✅ El favicon aparece en la pestana del navegador
- ✅ El archivo esta en S3 (verificar en AWS Console)

---

### ✅ Prueba 2: Subir Favicon como Tenant Admin

**Objetivo**: Verificar que un Tenant Admin puede subir su propio favicon

**Pasos**:
1. Login como Tenant Admin
2. Ir a **Configuracion** > **Logos**
3. Scroll hasta la seccion **Favicon**
4. Click en **Subir Favicon**
5. Seleccionar un archivo .png diferente al del Super Admin
6. Esperar a que se suba

**Resultado Esperado**:
- ✅ Mensaje: "Favicon actualizado correctamente"
- ✅ El favicon aparece en la preview
- ✅ El favicon del tenant aparece en la pestana (no el global)
- ✅ El archivo esta en S3 con el tenantId en el nombre

---

### ✅ Prueba 3: Formatos Soportados

**Objetivo**: Verificar que solo se aceptan formatos validos

**Pasos**:
1. Intentar subir archivo .ico
2. Intentar subir archivo .png
3. Intentar subir archivo .svg
4. Intentar subir archivo .jpg
5. Intentar subir archivo .gif

**Resultado Esperado**:
- ✅ .ico: Aceptado
- ✅ .png: Aceptado
- ✅ .svg: Aceptado
- ❌ .jpg: Rechazado con mensaje de error
- ❌ .gif: Rechazado con mensaje de error

---

### ✅ Prueba 4: Tamano Maximo

**Objetivo**: Verificar que se respeta el limite de 1MB

**Pasos**:
1. Intentar subir archivo de 500KB
2. Intentar subir archivo de 1MB
3. Intentar subir archivo de 2MB

**Resultado Esperado**:
- ✅ 500KB: Aceptado
- ✅ 1MB: Aceptado
- ❌ 2MB: Rechazado con mensaje "El favicon no debe superar 1MB"

---

### ✅ Prueba 5: Actualizacion Dinamica

**Objetivo**: Verificar que el favicon se actualiza sin recargar

**Pasos**:
1. Subir un favicon
2. Observar la pestana del navegador
3. Subir otro favicon diferente
4. Observar la pestana del navegador

**Resultado Esperado**:
- ✅ El favicon cambia automaticamente
- ✅ No se requiere recargar la pagina
- ✅ El cambio es inmediato

---

### ✅ Prueba 6: Multi-tenant

**Objetivo**: Verificar que cada tenant tiene su propio favicon

**Pasos**:
1. Login como Super Admin y subir favicon A
2. Logout
3. Login como Tenant 1 Admin y subir favicon B
4. Logout
5. Login como Tenant 2 Admin y subir favicon C
6. Verificar que cada uno ve su propio favicon

**Resultado Esperado**:
- ✅ Super Admin ve favicon A
- ✅ Tenant 1 ve favicon B
- ✅ Tenant 2 ve favicon C
- ✅ Los favicons no se mezclan

---

### ✅ Prueba 7: Prioridad de Favicon

**Objetivo**: Verificar la prioridad: Tenant > Global > Default

**Pasos**:
1. Super Admin sube favicon global
2. Tenant 1 NO sube favicon
3. Tenant 2 SI sube favicon
4. Verificar que Tenant 1 ve el global
5. Verificar que Tenant 2 ve el suyo

**Resultado Esperado**:
- ✅ Tenant 1 ve el favicon global
- ✅ Tenant 2 ve su propio favicon
- ✅ La prioridad se respeta

---

## Pruebas de Seguridad

### ✅ Prueba 8: Permisos

**Objetivo**: Verificar que solo usuarios con permiso pueden subir favicon

**Pasos**:
1. Login como usuario sin permiso EDIT_SETTINGS
2. Intentar acceder a Configuracion > Logos
3. Intentar subir favicon via API directamente

**Resultado Esperado**:
- ❌ No puede ver la seccion de Logos
- ❌ API retorna 403 Forbidden

---

### ✅ Prueba 9: Validacion de Archivo

**Objetivo**: Verificar que no se pueden subir archivos maliciosos

**Pasos**:
1. Renombrar un archivo .exe a .ico
2. Intentar subirlo como favicon
3. Verificar que el backend valida el contenido

**Resultado Esperado**:
- ❌ El archivo es rechazado
- ❌ Mensaje de error apropiado

---

## Pruebas de Integracion

### ✅ Prueba 10: Almacenamiento S3

**Objetivo**: Verificar que el favicon se guarda en S3

**Pasos**:
1. Subir un favicon
2. Ir a AWS Console > S3 > datagree-uploads
3. Buscar la carpeta `favicon/`
4. Verificar que el archivo esta ahi

**Resultado Esperado**:
- ✅ El archivo esta en S3
- ✅ El nombre incluye el timestamp
- ✅ El nombre incluye el tenantId (o 'global')

---

### ✅ Prueba 11: Almacenamiento Local (Fallback)

**Objetivo**: Verificar que funciona con almacenamiento local

**Pasos**:
1. Cambiar USE_S3=false en .env
2. Reiniciar backend
3. Subir un favicon
4. Verificar que esta en `backend/uploads/favicon/`

**Resultado Esperado**:
- ✅ El archivo esta en local
- ✅ El sistema funciona correctamente
- ✅ El favicon se muestra en el navegador

---

### ✅ Prueba 12: API Endpoint

**Objetivo**: Verificar que el endpoint funciona correctamente

**Pasos**:
1. Hacer POST a `/api/settings/favicon` con FormData
2. Verificar la respuesta
3. Hacer GET a `/api/settings`
4. Verificar que incluye faviconUrl

**Resultado Esperado**:
```json
// POST Response
{
  "faviconUrl": "/uploads/favicon/favicon-tenant1-1737410000000.png"
}

// GET Response
{
  "faviconUrl": "/uploads/favicon/favicon-tenant1-1737410000000.png",
  // ... otros campos
}
```

---

## Pruebas de UI/UX

### ✅ Prueba 13: Preview del Favicon

**Objetivo**: Verificar que el preview se muestra correctamente

**Pasos**:
1. Ir a Configuracion > Logos
2. Observar la seccion de Favicon
3. Si no hay favicon, debe mostrar icono de Upload
4. Si hay favicon, debe mostrar la imagen

**Resultado Esperado**:
- ✅ Sin favicon: Icono de Upload + "No hay favicon"
- ✅ Con favicon: Imagen del favicon (16x16 o 32x32)
- ✅ El preview es claro y visible

---

### ✅ Prueba 14: Mensajes de Error

**Objetivo**: Verificar que los mensajes de error son claros

**Pasos**:
1. Intentar subir archivo muy grande
2. Intentar subir formato invalido
3. Observar los mensajes

**Resultado Esperado**:
- ✅ "El favicon no debe superar 1MB"
- ✅ "Por favor selecciona un archivo .ico, .png o .svg para el favicon"
- ✅ Los mensajes son claros y utiles

---

### ✅ Prueba 15: Estado de Carga

**Objetivo**: Verificar que el estado de carga se muestra

**Pasos**:
1. Subir un favicon
2. Observar el boton durante la subida
3. Observar el boton despues de la subida

**Resultado Esperado**:
- ✅ Durante: Boton deshabilitado + "Subiendo..." + spinner
- ✅ Despues: Boton habilitado + "Subir Favicon"
- ✅ Mensaje de exito verde

---

## Pruebas de Compatibilidad

### ✅ Prueba 16: Navegadores

**Objetivo**: Verificar que funciona en diferentes navegadores

**Navegadores a probar**:
- Chrome
- Firefox
- Edge
- Safari (si disponible)

**Resultado Esperado**:
- ✅ El favicon se muestra en todos los navegadores
- ✅ La subida funciona en todos los navegadores
- ✅ No hay errores de consola

---

### ✅ Prueba 17: Dispositivos

**Objetivo**: Verificar que funciona en diferentes dispositivos

**Dispositivos a probar**:
- Desktop
- Tablet
- Mobile

**Resultado Esperado**:
- ✅ La UI es responsive
- ✅ El favicon se muestra correctamente
- ✅ La subida funciona en todos los dispositivos

---

## Pruebas de Rendimiento

### ✅ Prueba 18: Tiempo de Subida

**Objetivo**: Verificar que la subida es rapida

**Pasos**:
1. Subir un favicon de 100KB
2. Medir el tiempo
3. Subir un favicon de 1MB
4. Medir el tiempo

**Resultado Esperado**:
- ✅ 100KB: Menos de 2 segundos
- ✅ 1MB: Menos de 5 segundos
- ✅ No hay timeouts

---

### ✅ Prueba 19: Cache del Navegador

**Objetivo**: Verificar que el cache se maneja correctamente

**Pasos**:
1. Subir un favicon
2. Recargar la pagina
3. Verificar que el favicon se carga desde cache
4. Subir otro favicon
5. Verificar que el cache se invalida

**Resultado Esperado**:
- ✅ El favicon se cachea correctamente
- ✅ El cache se invalida al cambiar
- ✅ No hay problemas de cache

---

## Resumen de Pruebas

### Pruebas Obligatorias (Minimo)

- ✅ Prueba 1: Subir Favicon como Super Admin
- ✅ Prueba 2: Subir Favicon como Tenant Admin
- ✅ Prueba 3: Formatos Soportados
- ✅ Prueba 4: Tamano Maximo
- ✅ Prueba 6: Multi-tenant

### Pruebas Recomendadas

- ✅ Prueba 5: Actualizacion Dinamica
- ✅ Prueba 7: Prioridad de Favicon
- ✅ Prueba 10: Almacenamiento S3
- ✅ Prueba 13: Preview del Favicon

### Pruebas Opcionales

- ✅ Prueba 8-19: Resto de pruebas

---

## Reporte de Bugs

Si encuentras algun bug, reportalo con:

1. **Titulo**: Descripcion breve del bug
2. **Pasos para reproducir**: Lista de pasos
3. **Resultado esperado**: Que deberia pasar
4. **Resultado actual**: Que paso realmente
5. **Screenshots**: Si es posible
6. **Navegador/Dispositivo**: Informacion del entorno

---

**Fecha**: 20 de Enero de 2026
**Version**: 1.1.1
**Estado**: LISTO PARA PRUEBAS ✅
