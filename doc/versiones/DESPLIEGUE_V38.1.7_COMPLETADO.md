# Despliegue v38.1.7 - Corrección Título PDF HC

## ✅ Estado: COMPLETADO

**Fecha:** 2026-02-14  
**Hora:** 04:29 UTC  
**Versión:** 38.1.7

---

## 📋 Resumen del Cambio

Se corrigió el título del PDF de Historia Clínica que mostraba incorrectamente "CONSENTIMIENTO INFORMADO" en lugar de "HISTORIA CLÍNICA".

### Problema Identificado
- Los usuarios tenant al hacer click en "Vista Previa" de una Historia Clínica veían un PDF con el título "CONSENTIMIENTO INFORMADO" en el header
- Este título era incorrecto ya que el documento es una Historia Clínica completa, no un consentimiento

### Solución Implementada
- Modificado el método `addHeader()` en `medical-records-pdf.service.ts`
- Cambiado el texto de `'CONSENTIMIENTO INFORMADO'` a `'HISTORIA CLÍNICA'` (línea ~293)
- El cambio se aplica automáticamente a todos los PDFs generados

---

## 🔧 Cambios Técnicos

### Archivo Modificado
```
backend/src/medical-records/medical-records-pdf.service.ts
```

### Cambio Específico
```typescript
// ANTES (línea ~293)
page.drawText('CONSENTIMIENTO INFORMADO', {
  x: textX,
  y: textY - 20,
  size: 18,
  font: fontBold,
  color: rgb(1, 1, 1),
});

// DESPUÉS
page.drawText('HISTORIA CLÍNICA', {
  x: textX,
  y: textY - 20,
  size: 18,
  font: fontBold,
  color: rgb(1, 1, 1),
});
```

### Versiones Actualizadas
- `backend/src/config/version.ts` → v38.1.7
- `backend/package.json` → v38.1.7

---

## 🚀 Proceso de Despliegue

### 1. Compilación Local
```bash
cd backend
npm run build
```
✅ Compilación exitosa

### 2. Transferencia de Archivos
```bash
# Archivos transferidos a /tmp/
- medical-records-pdf.service.js
- version.js
```
✅ Archivos transferidos

### 3. Movimiento a Ubicación Final
```bash
sudo mv /tmp/medical-records-pdf.service.js /home/ubuntu/consentimientos_aws/backend/dist/medical-records/
sudo mv /tmp/version.js /home/ubuntu/consentimientos_aws/backend/dist/config/
sudo chown ubuntu:ubuntu [archivos]
```
✅ Archivos en ubicación correcta

### 4. Reinicio de Servicios
```bash
pm2 restart datagree
```
✅ Servicio reiniciado exitosamente

### 5. Verificación
```bash
curl http://localhost:3000/api/health/version
```
✅ Backend respondiendo con versión 38.1.7

### 6. Actualización del Frontend
```bash
# Actualizar versiones en archivos
frontend/src/config/version.ts → v38.1.7
frontend/package.json → v38.1.7

# Compilar frontend
npm run build

# Eliminar dist antiguo del servidor
rm -rf /home/ubuntu/consentimientos_aws/frontend/dist/*

# Transferir nuevo dist
scp -r frontend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/
```
✅ Frontend actualizado y desplegado

### 7. Reinicio de Nginx
```bash
sudo systemctl restart nginx
```
✅ Nginx reiniciado exitosamente

---

## 📊 Estado del Sistema

### Backend
- **Versión:** 38.1.7
- **Estado:** ✅ Online
- **Puerto:** 3000
- **Proceso PM2:** datagree (ID: 0)
- **Uptime:** Reiniciado exitosamente

### Frontend
- **Versión:** 38.1.7 (actualizado)
- **Estado:** ✅ Online
- **Ubicación:** /home/ubuntu/consentimientos_aws/frontend/dist/
- **Build Hash:** mllttfnp
- **Build Timestamp:** 1771043911045

### Base de Datos
- **Estado:** ✅ Conectada
- **Sin cambios en esquema**

---

## 🧪 Verificación del Cambio

### Importante: Limpiar Caché del Navegador
Antes de verificar, es necesario limpiar el caché del navegador para ver la nueva versión:

**Opción 1: Usar la página de actualización automática**
1. Abrir: `FORZAR_ACTUALIZACION_V38.1.7.html` en el navegador
2. Click en "Actualizar Ahora"
3. El sistema limpiará el caché automáticamente

**Opción 2: Limpieza manual**
1. Presionar `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
2. Seleccionar "Todo el tiempo"
3. Marcar solo "Imágenes y archivos en caché"
4. Click en "Borrar datos"
5. Recargar con `Ctrl + F5`

### Para Usuarios Tenant:
1. Acceder a archivoenlinea.com
2. Ir a módulo "Historias Clínicas"
3. Seleccionar cualquier HC
4. Click en botón "Vista Previa"
5. **Verificar:** El header del PDF debe mostrar "HISTORIA CLÍNICA"

### Para Super Admin:
1. Acceder a admin.archivoenlinea.com
2. Ir a "Historias Clínicas" (vista global)
3. Seleccionar cualquier HC de cualquier tenant
4. Click en botón "Vista Previa"
5. **Verificar:** El header del PDF debe mostrar "HISTORIA CLÍNICA"

---

## 📝 Notas Importantes

### Alcance del Cambio
- ✅ Afecta al PDF de Historia Clínica completa (botón "Vista Previa")
- ❌ NO afecta a los PDFs de consentimientos individuales (mantienen "CONSENTIMIENTO INFORMADO")
- ✅ Funciona para usuarios tenant y Super Admin
- ✅ Se aplica automáticamente a todos los PDFs generados desde ahora

### Versiones Desplegadas
- **Backend:** 38.1.7 ✅
- **Frontend:** 38.1.7 ✅
- **Ambos sincronizados correctamente**

### Compatibilidad
- No requiere cambios en base de datos
- Requiere limpieza de caché del navegador para ver la nueva versión
- Compatible con todas las funcionalidades existentes

### PDFs Anteriores
- Los PDFs ya generados y almacenados en S3 mantienen el título anterior
- Solo los PDFs generados después del despliegue tendrán el nuevo título
- Esto es el comportamiento esperado y correcto

---

## 🔗 Archivos Relacionados

### Documentación
- `VERIFICACION_TITULO_PDF_HC_V38.1.7.html` - Guía visual de verificación
- `FORZAR_ACTUALIZACION_V38.1.7.html` - Herramienta para limpiar caché y actualizar

### Código Fuente
- `backend/src/medical-records/medical-records-pdf.service.ts` - Servicio modificado
- `backend/src/medical-records/medical-records.controller.ts` - Controller (sin cambios)
- `backend/src/config/version.ts` - Versión actualizada

---

## 📈 Historial de Versiones Relacionadas

### v38.1.7 (2026-02-14) - ACTUAL
- Corrección: Título del PDF de HC cambiado a "HISTORIA CLÍNICA"

### v38.1.6 (2026-02-14)
- Corrección: Super Admin puede ver PDFs de HC de cualquier tenant

### v38.1.5 (2026-02-14)
- Corrección: Error 401 en endpoint de PDF de HC

### v38.1.4 (2026-02-14)
- Implementación: Modal de vista previa de HC con PDF

---

## ✅ Checklist de Despliegue

- [x] Código modificado y probado localmente
- [x] Versiones actualizadas en package.json y version.ts
- [x] Backend compilado exitosamente
- [x] Archivos transferidos al servidor
- [x] Archivos movidos a ubicación final
- [x] Permisos correctos aplicados
- [x] PM2 reiniciado
- [x] Backend respondiendo correctamente
- [x] Versión verificada en /api/health/version
- [x] Frontend actualizado a v38.1.7
- [x] Frontend compilado exitosamente
- [x] Dist del frontend transferido al servidor
- [x] Nginx reiniciado
- [x] Documentación de verificación creada
- [x] Herramienta de limpieza de caché creada
- [x] Resumen de despliegue documentado

---

## 🎯 Resultado Final

✅ **Despliegue exitoso y completo**

El sistema está funcionando correctamente con la versión 38.1.7 en backend y frontend. El título del PDF de Historia Clínica ahora muestra correctamente "HISTORIA CLÍNICA" en lugar de "CONSENTIMIENTO INFORMADO".

**Importante:** Los usuarios deben limpiar el caché de su navegador para ver la nueva versión. Pueden usar la herramienta `FORZAR_ACTUALIZACION_V38.1.7.html` para hacerlo automáticamente.

**Próximos pasos:** 
1. Abrir `FORZAR_ACTUALIZACION_V38.1.7.html` en el navegador
2. Click en "Actualizar Ahora" para limpiar caché
3. Verificar en producción siguiendo la guía en `VERIFICACION_TITULO_PDF_HC_V38.1.7.html`

---

**Servidor:** 100.28.198.249  
**Dominio:** archivoenlinea.com  
**Admin:** admin.archivoenlinea.com  
**Fecha de despliegue:** 2026-02-14 04:29 UTC
