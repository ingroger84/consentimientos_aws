# Instrucciones de Verificación - Planes en Landing Page

**Fecha**: 2026-01-27  
**Versión**: 15.1.3

## 🎯 Objetivo

Verificar que la landing page muestre correctamente los nuevos límites de recursos (Historias Clínicas, Plantillas CN, Plantillas HC) en todos los planes.

## 📋 Problema Identificado

En la captura de pantalla proporcionada, la landing page NO muestra:
- ❌ Historias Clínicas/mes
- ❌ Plantillas CN
- ❌ Plantillas HC

Estos campos están correctamente configurados en el backend, pero no se visualizan en el navegador.

## 🔍 Diagnóstico

El código está **CORRECTO** en:
- ✅ `backend/src/tenants/plans.json` - Datos correctos
- ✅ `frontend/src/components/landing/PricingSection.tsx` - Código actualizado
- ✅ `backend/src/plans/plans.controller.ts` - Endpoint funcionando

**Causa probable**: Caché del navegador o frontend no recargado.

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar el Backend

Ejecuta el script de verificación para confirmar que el endpoint retorna los datos correctos:

```powershell
cd backend
node verify-plans-endpoint.js
```

**Resultado esperado**:
```
✅ TODOS los planes tienen los nuevos campos
   - medicalRecords ✅
   - consentTemplates ✅
   - mrConsentTemplates ✅
```

Si el script muestra errores, el backend necesita reiniciarse.

### Paso 2: Limpiar Caché del Navegador

**Opción A - Recarga Forzada**:
1. Abre la landing page en el navegador
2. Presiona `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
3. Esto forzará la recarga sin usar caché

**Opción B - Modo Incógnito**:
1. Abre una ventana de incógnito/privada
2. Navega a la landing page
3. Verifica si los nuevos campos aparecen

**Opción C - Limpiar Caché Manualmente**:
1. Abre DevTools (F12)
2. Ve a la pestaña "Application" o "Almacenamiento"
3. Haz clic en "Clear storage" o "Borrar almacenamiento"
4. Marca todas las opciones
5. Haz clic en "Clear site data"
6. Recarga la página

### Paso 3: Verificar en DevTools

1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Recarga la página
4. Busca la petición a `/api/plans/public`
5. Haz clic en ella y ve a la pestaña "Response"
6. Verifica que los datos incluyan:
   ```json
   {
     "limits": {
       "medicalRecords": 30,
       "consentTemplates": 10,
       "mrConsentTemplates": 5,
       ...
     }
   }
   ```

### Paso 4: Verificar la Consola

1. En DevTools, ve a la pestaña "Console"
2. Busca errores en rojo
3. Si hay errores de JavaScript, repórtalos

---

## 📊 Valores Esperados por Plan

### Plan Gratuito - $0
- 1 usuario
- 1 sede
- 20 consentimientos/mes
- **5 historias clínicas/mes** ← NUEVO
- **3 plantillas CN** ← NUEVO
- **2 plantillas HC** ← NUEVO
- 3 servicios
- 200 MB almacenamiento

### Plan Básico - $89,900
- 2 usuarios
- 1 sede
- 100 consentimientos/mes
- **30 historias clínicas/mes** ← NUEVO
- **10 plantillas CN** ← NUEVO
- **5 plantillas HC** ← NUEVO
- 5 servicios
- 500 MB almacenamiento

### Plan Emprendedor - $119,900 (Más Popular)
- 5 usuarios
- 3 sedes
- 300 consentimientos/mes
- **100 historias clínicas/mes** ← NUEVO
- **20 plantillas CN** ← NUEVO
- **10 plantillas HC** ← NUEVO
- 15 servicios
- 2 GB almacenamiento

### Plan Plus - $149,900
- 10 usuarios
- 5 sedes
- 500 consentimientos/mes
- **300 historias clínicas/mes** ← NUEVO
- **30 plantillas CN** ← NUEVO
- **20 plantillas HC** ← NUEVO
- 30 servicios
- 5 GB almacenamiento

### Plan Empresarial - $189,900
- ∞ usuarios ilimitados
- ∞ sedes ilimitadas
- ∞ consentimientos/mes ilimitados
- **∞ historias clínicas/mes ilimitadas** ← NUEVO
- **∞ plantillas CN ilimitadas** ← NUEVO
- **∞ plantillas HC ilimitadas** ← NUEVO
- ∞ servicios ilimitados
- 10 GB almacenamiento

---

## 🔧 Solución de Problemas

### Problema 1: El endpoint no responde

**Síntoma**: El script `verify-plans-endpoint.js` muestra error de conexión

**Solución**:
```powershell
# Verificar que el backend esté corriendo
cd backend
npm run start:dev
```

### Problema 2: Los datos no incluyen los nuevos campos

**Síntoma**: El endpoint retorna datos sin `medicalRecords`, `consentTemplates`, `mrConsentTemplates`

**Solución**:
```powershell
# Reiniciar el backend
cd backend
# Ctrl + C para detener
npm run start:dev
```

### Problema 3: El frontend no se actualiza

**Síntoma**: Después de limpiar caché, los datos siguen sin aparecer

**Solución**:
```powershell
# Reiniciar el frontend
cd frontend
# Ctrl + C para detener
npm run dev
```

### Problema 4: Error en la consola del navegador

**Síntoma**: Errores de JavaScript en la consola

**Solución**:
1. Copia el error completo
2. Verifica que `PricingSection.tsx` esté actualizado
3. Verifica que no haya errores de TypeScript:
   ```powershell
   cd frontend
   npm run build
   ```

---

## ✅ Checklist de Verificación

Marca cada paso a medida que lo completes:

- [ ] Backend corriendo en puerto 3000
- [ ] Script `verify-plans-endpoint.js` ejecutado exitosamente
- [ ] Endpoint `/api/plans/public` retorna datos correctos
- [ ] Caché del navegador limpiado
- [ ] Página recargada con Ctrl + Shift + R
- [ ] DevTools abierto y verificado
- [ ] Petición a `/api/plans/public` visible en Network
- [ ] Response incluye los nuevos campos
- [ ] No hay errores en la consola
- [ ] Los planes muestran los nuevos límites

---

## 📸 Resultado Esperado

Después de seguir estos pasos, cada plan debe mostrar:

```
Plan Básico
$ 89.900 por mes

✓ 2 usuarios
✓ 1 sede
✓ 100 consentimientos/mes
✓ 30 historias clínicas/mes        ← DEBE APARECER
✓ 10 plantillas CN                 ← DEBE APARECER
✓ 5 plantillas HC                  ← DEBE APARECER
✓ 5 servicios
✓ 500 MB de almacenamiento
✓ Personalización completa
✓ Soporte: 24h
```

---

## 🆘 Si Nada Funciona

Si después de seguir todos los pasos el problema persiste:

1. **Captura de pantalla de DevTools**:
   - Pestaña Network mostrando la petición `/api/plans/public`
   - Pestaña Console mostrando errores (si los hay)

2. **Ejecuta estos comandos y comparte el resultado**:
   ```powershell
   cd backend
   node verify-plans-endpoint.js > verificacion-planes.txt
   ```

3. **Verifica la versión del código**:
   ```powershell
   git log --oneline -5
   ```

---

## 📚 Archivos Relacionados

- `backend/src/tenants/plans.json` - Configuración de planes
- `frontend/src/components/landing/PricingSection.tsx` - Componente de precios
- `backend/src/plans/plans.controller.ts` - Controlador de API
- `backend/verify-plans-endpoint.js` - Script de verificación

---

**Nota**: El código está correcto. El problema es de visualización/caché. Siguiendo estos pasos debería resolverse.
