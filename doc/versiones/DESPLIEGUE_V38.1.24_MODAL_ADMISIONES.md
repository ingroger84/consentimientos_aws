# Despliegue V38.1.24 - Corrección Definitiva Modal Admisiones

## 📋 Resumen

**Versión:** 38.1.24  
**Fecha:** 2026-02-21  
**Objetivo:** Corregir definitivamente el problema del modal de admisiones que no se cierra

## 🔍 Problema Identificado

### Síntomas
- Al crear una admisión desde el modal, el modal NO se cierra
- La página se queda bloqueada mostrando "Paciente con Historia Clínica Existente"
- La admisión SÍ se crea exitosamente en el backend (aparece mensaje verde)
- El sistema NO navega a la página de la HC
- Los logs de depuración NO aparecen en la consola

### Causa Raíz
- **Problema de caché del navegador:** El código desplegado NO coincide con el código fuente
- Los archivos JavaScript con hash NO se están cargando correctamente
- El navegador está usando versiones antiguas de los archivos

### Confirmaciones
- ✅ NO es problema del servidor (probado en 3 computadores con diferentes ISP)
- ✅ NO es problema de caché del servidor
- ✅ El backend funciona correctamente (la admisión se crea)
- ❌ ES problema de caché del navegador

## 🔧 Cambios Implementados

### 1. CreateMedicalRecordPage.tsx
```typescript
// Mejoras en handleAdmissionTypeSelect:
- ✅ Logs con prefijo [PAGE] para identificar origen
- ✅ Re-lanzar errores para que el modal los maneje
- ✅ Toast de confirmación antes de navegar
- ✅ Navegación forzada con window.location.href
```

### 2. AdmissionTypeModal.tsx
```typescript
// Mejoras en handleSubmit:
- ✅ Logs con prefijo [MODAL] para identificar origen
- ✅ Esperar a que onSelect termine con await
- ✅ Auto-recuperación: si no navega en 2 segundos, recargar página
- ✅ Manejo robusto de errores
```

### 3. Archivos de Versión
- ✅ `frontend/src/config/version.ts` → 38.1.24
- ✅ `frontend/package.json` → 38.1.24
- ✅ `frontend/src/pages/SystemStatusPageSimple.tsx` → 38.1.24

## 🚀 Instrucciones de Despliegue

### Paso 1: Build del Frontend
```powershell
cd frontend
npm run build
```

**Verificar:** Debe aparecer la carpeta `frontend/dist/` con archivos nuevos

### Paso 2: Desplegar a AWS
```powershell
# Desde la raíz del proyecto
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/
```

**IMPORTANTE:** Usar `-r frontend/dist/*` para copiar TODOS los archivos, incluyendo subdirectorios

### Paso 3: Verificar Despliegue en el Servidor
```bash
# Conectarse al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Verificar archivos
ls -la /home/ubuntu/consentimientos_aws/frontend/dist/assets/

# Verificar que existen archivos con timestamp reciente
# Buscar archivos como: CreateMedicalRecordPage-XXXXXXXX.js, AdmissionTypeModal-XXXXXXXX.js
```

### Paso 4: Limpiar Caché del Navegador

**Opción 1: Usar el HTML de limpieza**
1. Abrir el archivo `SOLUCION_DEFINITIVA_MODAL_V38.1.24.html` en el navegador
2. Hacer clic en el botón "Limpiar Caché Completo"
3. Esperar a que redirija automáticamente

**Opción 2: Limpieza manual**
1. Abrir Chrome DevTools (F12)
2. Ir a la pestaña "Application"
3. En el menú izquierdo, hacer clic en "Clear storage"
4. Marcar todas las opciones EXCEPTO "Local storage" (para mantener la sesión)
5. Hacer clic en "Clear site data"
6. Recargar la página con Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)

## ⚠️ IMPORTANTE: Dominio Correcto

### ✅ Dominio CORRECTO
```
https://demo-estetica.archivoenlinea.com
```

### ❌ Dominio INCORRECTO
```
https://archivoenlinea.com  (sin subdominio)
```

**Si accede desde el dominio incorrecto:**
- Los archivos NO se cargarán correctamente
- Verá errores 404 en la consola
- El sistema NO funcionará

## 🧪 Pruebas Post-Despliegue

### 1. Verificar Versión
1. Ir a "Estado del Sistema" en el menú
2. Verificar que muestra: **Versión 38.1.24**

### 2. Verificar Logs en Consola
1. Abrir Chrome DevTools (F12)
2. Ir a la pestaña "Console"
3. Crear una nueva HC para un cliente existente
4. Verificar que aparecen los logs:
   ```
   🔵 [PAGE] handleAdmissionTypeSelect llamado
   🔵 [PAGE] Creando admisión...
   ✅ [PAGE] Admisión creada exitosamente
   🚀 [PAGE] Navegando a: /medical-records/...
   ```

### 3. Probar Flujo Completo
1. Ir a "Historias Clínicas" → "Nueva Historia Clínica"
2. Buscar un cliente que YA tenga HC activa
3. Debe aparecer el modal "Paciente con Historia Clínica Existente"
4. Seleccionar tipo de admisión (ej: "Control")
5. Ingresar motivo (ej: "Control post-operatorio")
6. Hacer clic en "Crear Admisión"
7. **Resultado esperado:**
   - Aparece toast verde "Admisión creada, redirigiendo..."
   - El modal se cierra automáticamente
   - Navega a la página de la HC con la nueva admisión
   - Si no navega en 2 segundos, la página se recarga automáticamente

## 📊 Archivos Modificados

```
frontend/src/pages/CreateMedicalRecordPage.tsx
frontend/src/components/AdmissionTypeModal.tsx
frontend/src/config/version.ts
frontend/package.json
frontend/src/pages/SystemStatusPageSimple.tsx
```

## 🔄 Flujo de Navegación Mejorado

```
1. Usuario hace clic en "Crear Admisión"
   ↓
2. Modal ejecuta handleSubmit()
   ↓
3. Modal llama a onSelect() (handleAdmissionTypeSelect en la página)
   ↓
4. Página crea la admisión en el backend
   ↓
5. Backend responde con la admisión creada
   ↓
6. Página muestra toast "Admisión creada, redirigiendo..."
   ↓
7. Página ejecuta window.location.href (navegación forzada)
   ↓
8. Navegador carga la página de la HC
   ↓
9. [FALLBACK] Si no navega en 2 segundos → window.location.reload()
```

## 🐛 Debugging

### Si el modal sigue sin cerrarse:

1. **Verificar que los logs aparecen:**
   - Abrir consola (F12)
   - Buscar logs con prefijo `[PAGE]` y `[MODAL]`
   - Si NO aparecen, el código NO se actualizó → limpiar caché

2. **Verificar versión en consola:**
   ```javascript
   localStorage.getItem('app_version')
   // Debe mostrar: "38.1.24"
   ```

3. **Verificar archivos cargados:**
   - Abrir DevTools → Network
   - Recargar la página
   - Buscar archivos `CreateMedicalRecordPage-*.js` y `AdmissionTypeModal-*.js`
   - Verificar que el hash (XXXXXXXX) es diferente al anterior

4. **Forzar recarga completa:**
   ```javascript
   // En la consola del navegador
   localStorage.clear();
   sessionStorage.clear();
   window.location.href = 'https://demo-estetica.archivoenlinea.com/?v=38.1.24&t=' + Date.now();
   ```

## 📞 Soporte

Si después de seguir todos los pasos el problema persiste:

1. Verificar que está accediendo desde `https://demo-estetica.archivoenlinea.com`
2. Probar en modo incógnito (Ctrl+Shift+N)
3. Probar en otro navegador (Firefox, Edge)
4. Verificar que los archivos se desplegaron correctamente en el servidor
5. Revisar logs del backend: `pm2 logs datagree`

## ✅ Checklist de Despliegue

- [ ] Build del frontend ejecutado (`npm run build`)
- [ ] Archivos copiados a AWS con `scp -r`
- [ ] Verificado que los archivos están en el servidor
- [ ] Caché del navegador limpiado
- [ ] Versión 38.1.24 visible en "Estado del Sistema"
- [ ] Logs `[PAGE]` y `[MODAL]` aparecen en consola
- [ ] Flujo de admisiones funciona correctamente
- [ ] Modal se cierra automáticamente
- [ ] Navegación a HC funciona

---

**Última actualización:** 2026-02-21  
**Versión del documento:** 1.0
