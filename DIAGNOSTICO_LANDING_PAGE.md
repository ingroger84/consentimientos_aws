# Diagnóstico de Problema en Landing Page

## Problema Reportado
Al hacer clic en "Seleccionar Plan" desde https://archivoenlinea.com/pricing, el sistema redirige al login en lugar de abrir el modal de registro.

## Verificaciones Realizadas

### 1. Backend - Endpoint /api/plans/public ✅
- **Estado:** FUNCIONANDO CORRECTAMENTE
- **Prueba:** `curl https://archivoenlinea.com/api/plans/public`
- **Resultado:** HTTP 200 OK
- **Decorador @Public():** Presente y funcionando

### 2. Código Compilado ✅
- **Archivo:** `backend/dist/plans/plans.controller.js`
- **Líneas 120 y 128:** Decorador `(0, public_decorator_1.Public)()` presente
- **Estado:** Código compilado correctamente

### 3. Despliegue ✅
- **Backend:** Desplegado y PM2 reiniciado
- **Frontend:** Desplegado (última modificación: Mar 26 13:05)
- **Nginx:** Configurado para no cachear HTML/JS/CSS

## Posibles Causas del Problema

### Causa 1: Caché del Navegador
Aunque nginx no cachea, el navegador puede tener caché local.

**Solución:**
1. Abrir https://archivoenlinea.com en modo incógnito
2. O hacer hard refresh: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)

### Causa 2: Error en la Carga de Planes
Si la petición a `/api/plans/public` falla por cualquier razón (CORS, timeout, etc.), el componente puede no manejar bien el error.

**Diagnóstico:**
1. Abrir https://archivoenlinea.com/pricing
2. Abrir DevTools (F12)
3. Ir a la pestaña "Network"
4. Buscar la petición a `plans/public`
5. Verificar:
   - ¿Se hace la petición?
   - ¿Cuál es el status code?
   - ¿Hay algún error en la consola?

### Causa 3: Interceptor de Axios Redirigiendo
El interceptor en `api.ts` redirige al login cuando recibe un 401, pero también podría estar redirigiendo por otros errores.

**Código problemático:**
```typescript
if (error.response?.status === 401) {
  // ...
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';  // <-- Redirección automática
  }
}
```

### Causa 4: Error de CORS
Si hay un problema de CORS, la petición falla y el interceptor podría estar manejándolo incorrectamente.

## Script de Diagnóstico

Ejecuta este código en la consola del navegador (F12) cuando estés en https://archivoenlinea.com/pricing:

```javascript
// Test 1: Verificar si el endpoint funciona
fetch('https://archivoenlinea.com/api/plans/public')
  .then(response => {
    console.log('✅ Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Planes recibidos:', data.plans?.length);
    console.log('✅ Datos:', data);
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });

// Test 2: Verificar localStorage
console.log('Token en localStorage:', localStorage.getItem('token') ? 'SÍ' : 'NO');
console.log('User en localStorage:', localStorage.getItem('user') ? 'SÍ' : 'NO');

// Test 3: Verificar si hay errores en consola
console.log('Revisa si hay errores en rojo arriba ↑');
```

## Solución Temporal

Si el problema persiste, podemos modificar el interceptor para que NO rediriga automáticamente en endpoints públicos:

```typescript
// En frontend/src/services/api.ts
if (error.response?.status === 401) {
  // NO redirigir si es un endpoint público
  if (originalRequest.url?.includes('/plans/public')) {
    return Promise.reject(error);
  }
  
  // Solo redirigir si no estamos en login
  if (!window.location.pathname.includes('/login')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}
```

## Próximos Pasos

1. **Usuario:** Ejecutar el script de diagnóstico en la consola
2. **Usuario:** Reportar los resultados (status code, errores, etc.)
3. **Desarrollador:** Basado en los resultados, aplicar la solución correspondiente

## Contacto

Si el problema persiste después de estas verificaciones, proporciona:
- Captura de pantalla de la consola (F12)
- Captura de pantalla de la pestaña Network
- Navegador y versión utilizada
- Sistema operativo
