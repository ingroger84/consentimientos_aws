# Instrucciones de Prueba - Refresh Token Automático

## 🎯 Objetivo

Verificar que el sistema de refresh token automático funciona correctamente tanto en modo automático como manual.

## 📋 Pre-requisitos

1. Backend corriendo en `http://localhost:3000`
2. Frontend corriendo en `http://demo-medico.localhost:5173`
3. Dos navegadores o ventanas de incógnito diferentes
4. Usuario admin: `admin@clinicademo.com` / `Demo123!`
5. Usuario operador de prueba

## 🧪 Prueba 1: Refresh Automático - Asignar Permiso

### Objetivo
Verificar que cuando se asigna un nuevo permiso, el usuario puede acceder al recurso sin cerrar sesión.

### Pasos

1. **Preparación**
   ```
   - Abrir navegador 1 (Chrome)
   - Iniciar sesión como admin
   - Ir a Roles y Permisos
   - Seleccionar rol "Operador"
   - QUITAR permiso "Ver Plantillas" (view_templates)
   - Guardar cambios
   ```

2. **Sesión de Operador**
   ```
   - Abrir navegador 2 (Firefox o ventana incógnito)
   - Iniciar sesión como operador
   - Verificar que NO aparece "Plantillas" en el menú
   - Intentar acceder manualmente a /consent-templates
   - Verificar que aparece error 403
   ```

3. **Asignar Permiso**
   ```
   - Volver a navegador 1 (admin)
   - Ir a Roles y Permisos
   - Seleccionar rol "Operador"
   - AGREGAR permiso "Ver Plantillas" (view_templates)
   - Guardar cambios
   ```

4. **Verificar Refresh Automático**
   ```
   - Volver a navegador 2 (operador)
   - Intentar acceder a /consent-templates nuevamente
   - Abrir DevTools (F12) → Pestaña Network
   - Observar:
     ✓ Request a /consent-templates falla con 403
     ✓ Request automático a /auth/refresh-token
     ✓ Request a /consent-templates se reintenta
     ✓ Página de plantillas se carga correctamente
   ```

5. **Verificar Menú Actualizado**
   ```
   - Recargar la página (F5)
   - Verificar que ahora aparece "Plantillas" en el menú
   ```

### Resultado Esperado
✅ Usuario puede acceder a plantillas sin cerrar sesión
✅ Token se refresca automáticamente
✅ Request se reintenta exitosamente
✅ Menú se actualiza después de recargar

---

## 🧪 Prueba 2: Refresh Manual - Botón de Actualizar

### Objetivo
Verificar que el botón manual de refresh actualiza los permisos correctamente.

### Pasos

1. **Preparación**
   ```
   - Mantener sesión de operador abierta (navegador 2)
   - Volver a navegador 1 (admin)
   - Ir a Roles y Permisos
   - Seleccionar rol "Operador"
   - AGREGAR permiso "Ver Historias Clínicas" (view_medical_records)
   - Guardar cambios
   ```

2. **Usar Botón de Refresh**
   ```
   - Volver a navegador 2 (operador)
   - Observar que NO aparece "Historias Clínicas" en el menú
   - Localizar el botón de refresh (🔄) en el sidebar
   - Hacer clic en el botón de refresh
   - Observar:
     ✓ Ícono gira (animación de carga)
     ✓ Aparece alerta "Permisos actualizados correctamente"
     ✓ Página se recarga automáticamente
   ```

3. **Verificar Actualización**
   ```
   - Después de la recarga
   - Verificar que ahora aparece "Historias Clínicas" en el menú
   - Hacer clic en "Historias Clínicas"
   - Verificar que se carga la página correctamente
   ```

### Resultado Esperado
✅ Botón muestra animación de carga
✅ Aparece mensaje de confirmación
✅ Página se recarga automáticamente
✅ Nuevos permisos son visibles en el menú

---

## 🧪 Prueba 3: Refresh Automático - Revocar Permiso

### Objetivo
Verificar que cuando se revoca un permiso, el usuario pierde acceso inmediatamente.

### Pasos

1. **Preparación**
   ```
   - Mantener sesión de operador abierta (navegador 2)
   - Operador debe tener acceso a "Plantillas"
   - Volver a navegador 1 (admin)
   ```

2. **Revocar Permiso**
   ```
   - Ir a Roles y Permisos
   - Seleccionar rol "Operador"
   - QUITAR permiso "Ver Plantillas" (view_templates)
   - Guardar cambios
   ```

3. **Verificar Pérdida de Acceso**
   ```
   - Volver a navegador 2 (operador)
   - Estar en la página de plantillas
   - Intentar crear una nueva plantilla o hacer cualquier acción
   - Observar:
     ✓ Request falla con 403
     ✓ Token se refresca automáticamente
     ✓ Request se reintenta pero sigue fallando (correcto)
     ✓ Aparece mensaje de error de permisos
   ```

4. **Verificar Menú**
   ```
   - Recargar la página (F5)
   - Verificar que "Plantillas" ya NO aparece en el menú
   - Intentar acceder manualmente a /consent-templates
   - Verificar que aparece error 403
   ```

### Resultado Esperado
✅ Usuario pierde acceso inmediatamente
✅ Token se refresca pero acceso sigue denegado
✅ Menú se actualiza después de recargar
✅ Acceso manual también es denegado

---

## 🧪 Prueba 4: Múltiples Requests Simultáneos

### Objetivo
Verificar que múltiples requests que fallan por permisos se manejan correctamente.

### Pasos

1. **Preparación**
   ```
   - Abrir DevTools (F12) → Pestaña Network
   - Activar "Preserve log"
   - Limpiar log (Clear)
   ```

2. **Generar Múltiples Requests**
   ```
   - Quitar permiso "Ver Plantillas" al operador
   - En sesión de operador, abrir múltiples pestañas:
     * Pestaña 1: /consent-templates
     * Pestaña 2: /consent-templates
     * Pestaña 3: /consent-templates
   - Todas fallarán con 403
   ```

3. **Asignar Permiso**
   ```
   - Volver a admin
   - Agregar permiso "Ver Plantillas"
   - Guardar
   ```

4. **Recargar Todas las Pestañas**
   ```
   - Recargar pestaña 1
   - Recargar pestaña 2
   - Recargar pestaña 3
   - Observar en Network:
     ✓ Solo UN request a /auth/refresh-token
     ✓ Los demás requests esperan en cola
     ✓ Todos se reintentan después del refresh
     ✓ Todos se completan exitosamente
   ```

### Resultado Esperado
✅ Solo un refresh se ejecuta
✅ Otros requests esperan en cola
✅ Todos los requests se completan
✅ No hay múltiples refreshes simultáneos

---

## 🧪 Prueba 5: Error de Red Durante Refresh

### Objetivo
Verificar que el sistema maneja correctamente errores de red durante el refresh.

### Pasos

1. **Preparación**
   ```
   - Abrir DevTools (F12) → Pestaña Network
   - Mantener sesión de operador abierta
   ```

2. **Simular Error de Red**
   ```
   - En DevTools, activar "Offline" (simular sin conexión)
   - Hacer clic en el botón de refresh manual
   - Observar:
     ✓ Aparece error de red
     ✓ Mensaje de error al usuario
     ✓ Sesión NO se cierra
     ✓ Usuario puede seguir usando la aplicación
   ```

3. **Recuperar Conexión**
   ```
   - Desactivar "Offline"
   - Hacer clic en el botón de refresh nuevamente
   - Observar:
     ✓ Refresh se completa exitosamente
     ✓ Página se recarga
     ✓ Permisos se actualizan
   ```

### Resultado Esperado
✅ Error de red se maneja correctamente
✅ Usuario recibe mensaje de error claro
✅ Sesión no se pierde
✅ Puede reintentar después

---

## 🧪 Prueba 6: Token Expirado Durante Refresh

### Objetivo
Verificar que el sistema maneja correctamente un token expirado.

### Pasos

1. **Preparación**
   ```
   - Iniciar sesión como operador
   - Esperar a que el token expire (o modificar manualmente)
   ```

2. **Intentar Refresh con Token Expirado**
   ```
   - Hacer clic en el botón de refresh
   - Observar:
     ✓ Request a /auth/refresh-token falla con 401
     ✓ Usuario es redirigido a /login
     ✓ Mensaje indica que debe iniciar sesión nuevamente
   ```

3. **Iniciar Sesión Nuevamente**
   ```
   - Iniciar sesión con las mismas credenciales
   - Verificar que todo funciona correctamente
   ```

### Resultado Esperado
✅ Token expirado es detectado
✅ Usuario es redirigido a login
✅ Mensaje claro al usuario
✅ Puede iniciar sesión nuevamente

---

## 📊 Checklist de Verificación

### Funcionalidad Básica
- [ ] Refresh automático funciona al detectar 403
- [ ] Refresh manual funciona con el botón
- [ ] Token se actualiza en localStorage
- [ ] Usuario se actualiza en localStorage
- [ ] Request original se reintenta después del refresh

### Interfaz de Usuario
- [ ] Botón de refresh visible en sidebar
- [ ] Ícono de refresh gira durante carga
- [ ] Mensaje de confirmación aparece
- [ ] Página se recarga después del refresh manual
- [ ] Menú se actualiza con nuevos permisos

### Manejo de Errores
- [ ] Error de red se maneja correctamente
- [ ] Token expirado redirige a login
- [ ] Múltiples refreshes no se ejecutan simultáneamente
- [ ] Errores se muestran al usuario
- [ ] Sesión no se pierde en errores recuperables

### Seguridad
- [ ] Token antiguo se invalida
- [ ] Permisos se obtienen de BD, no del token antiguo
- [ ] Usuario deshabilitado no puede refrescar
- [ ] Auditoría de sesión se mantiene
- [ ] IP y User-Agent se registran

### Performance
- [ ] Refresh es rápido (< 1 segundo)
- [ ] No hay múltiples requests innecesarios
- [ ] Cola de requests funciona correctamente
- [ ] No hay memory leaks
- [ ] Animaciones son fluidas

---

## 🐛 Problemas Conocidos y Soluciones

### Problema 1: Refresh no se activa automáticamente
**Síntoma**: Error 403 pero no se refresca el token
**Causa**: Mensaje de error no contiene palabras clave esperadas
**Solución**: Verificar que el mensaje incluya "permiso", "permission" o "autorizado"

### Problema 2: Página no se recarga después del refresh manual
**Síntoma**: Token se actualiza pero menú no cambia
**Causa**: `window.location.reload()` no se ejecuta
**Solución**: Verificar que no hay errores en la consola que bloqueen la ejecución

### Problema 3: Múltiples refreshes simultáneos
**Síntoma**: Varios requests a /auth/refresh-token al mismo tiempo
**Causa**: Variable `isRefreshing` no se está respetando
**Solución**: Verificar que la variable se inicializa correctamente

### Problema 4: Error "setUser is not a function"
**Síntoma**: Error en consola al hacer refresh manual
**Causa**: authStore no exporta setUser
**Solución**: Verificar que authStore.ts incluye el método setUser

---

## 📝 Notas Adicionales

1. **Tiempo de Expiración del Token**
   - Por defecto: 24 horas
   - Configurable en backend/src/auth/auth.service.ts

2. **Frecuencia de Refresh**
   - Automático: Solo cuando hay error 403
   - Manual: Cuando el usuario hace clic
   - Futuro: Cada 30 minutos automáticamente

3. **Compatibilidad**
   - Funciona en todos los navegadores modernos
   - Requiere JavaScript habilitado
   - No funciona en modo offline

4. **Logs para Debugging**
   - Backend: Logs en consola del servidor
   - Frontend: Logs en DevTools Console
   - Network: Ver requests en DevTools Network

---

## ✅ Criterios de Aceptación

La funcionalidad se considera exitosa si:

1. ✅ Usuario puede acceder a recursos después de asignar permisos sin cerrar sesión
2. ✅ Botón manual de refresh actualiza permisos correctamente
3. ✅ Token se refresca automáticamente al detectar error 403
4. ✅ Múltiples requests se manejan correctamente con una cola
5. ✅ Errores de red no causan pérdida de sesión
6. ✅ Token expirado redirige a login correctamente
7. ✅ Interfaz muestra feedback visual apropiado
8. ✅ No hay errores en consola durante el proceso
9. ✅ Performance es aceptable (< 1 segundo)
10. ✅ Seguridad se mantiene en todo momento
