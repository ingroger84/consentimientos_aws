# 🔄 Instrucciones para Ver la Versión Correcta (42.1.2)

## Problema
Algunos navegadores están mostrando la versión antigua (40.3.11) debido a caché agresivo.

## ✅ Solución Rápida (Recomendada)

### Opción 1: Recarga Forzada (Más Rápido)

**Windows/Linux:**
```
Ctrl + Shift + R
```

**Mac:**
```
Cmd + Shift + R
```

**Móvil:**
- Android Chrome: Menú → Configuración → Privacidad → Borrar datos de navegación → Imágenes y archivos en caché
- iOS Safari: Ajustes → Safari → Borrar historial y datos

---

### Opción 2: Página de Actualización Automática

1. Visita esta URL:
   ```
   https://demo-estetica.archivoenlinea.com/FORZAR_RECARGA_V42.1.2.html
   ```

2. Presiona el botón "🚀 Actualizar Ahora"

3. Espera a que se limpie el caché y se recargue automáticamente

---

### Opción 3: Limpiar Caché desde Consola del Navegador

1. Abre la consola del navegador:
   - **Windows/Linux:** `F12` o `Ctrl + Shift + I`
   - **Mac:** `Cmd + Option + I`

2. Ve a la pestaña "Console" (Consola)

3. Copia y pega este código:

```javascript
(async function() {
    console.log('🔄 Limpiando caché...');
    
    // Limpiar Service Workers
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            await registration.unregister();
            console.log('✅ Service Worker eliminado');
        }
    }
    
    // Limpiar Cache Storage
    if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('✅ Cache Storage limpiado');
    }
    
    // Limpiar localStorage y sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Storage limpiado');
    
    console.log('✅ Caché completamente limpiado');
    console.log('🔄 Recargando en 2 segundos...');
    
    setTimeout(() => {
        window.location.href = window.location.origin + '/?v=' + Date.now();
    }, 2000);
})();
```

4. Presiona `Enter`

5. La página se recargará automáticamente con la versión correcta

---

## 🔍 Verificar que Estás en la Versión Correcta

Después de limpiar el caché, verifica que estés en la versión 42.1.2:

### Método 1: Página de Estado del Sistema
1. Inicia sesión en la aplicación
2. Ve a: **Configuración → Estado del Sistema**
3. Deberías ver: **Versión 42.1.2 - 2026-02-24**

### Método 2: Consola del Navegador
Ejecuta este código en la consola:

```javascript
fetch('/api/health/detailed')
    .then(r => r.json())
    .then(d => {
        console.log('Backend:', d.version.version);
        return fetch('/version.json?t=' + Date.now());
    })
    .then(r => r.json())
    .then(d => console.log('Frontend:', d.version))
    .catch(e => console.error('Error:', e));
```

Deberías ver:
```
Backend: 42.1.2
Frontend: 42.1.2
```

---

## 🛠️ Solución para Administradores del Servidor

Si necesitas forzar la actualización para todos los usuarios, puedes modificar el `index.html` para incluir un hash único:

```bash
# Conectar al servidor
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249

# Agregar timestamp al index.html
cd /home/ubuntu/consentimientos_aws/frontend/dist
sudo sed -i "s/<head>/<head><meta http-equiv=\"Cache-Control\" content=\"no-cache, no-store, must-revalidate\"><meta name=\"version\" content=\"42.1.2-$(date +%s)\">/" index.html

# Reiniciar nginx
sudo systemctl reload nginx
```

---

## 📊 Cambios en la Versión 42.1.2

- ✅ Organización completa del proyecto
- ✅ Scripts consolidados en `/scripts/`
- ✅ Credenciales consolidadas en `/credentials/`
- ✅ Mejoras de seguridad en `.gitignore`
- ✅ Documentación actualizada
- ✅ Sistema de versionamiento mejorado

---

## ❓ Preguntas Frecuentes

### ¿Por qué veo la versión antigua?
Los navegadores modernos cachean agresivamente los archivos estáticos para mejorar el rendimiento. Aunque el servidor tiene la versión correcta, tu navegador está mostrando la versión cacheada.

### ¿Es seguro limpiar el caché?
Sí, es completamente seguro. Solo se eliminarán archivos temporales y tendrás que volver a iniciar sesión.

### ¿Afectará a mis datos?
No, tus datos están en el servidor. Solo se limpiarán archivos temporales del navegador.

### ¿Tengo que hacer esto cada vez que se actualice?
No, este problema es específico de esta actualización. Las futuras actualizaciones usarán un sistema de versionamiento mejorado que evitará este problema.

---

## 📞 Soporte

Si después de seguir estos pasos sigues viendo la versión antigua, contacta al equipo de soporte con:
- Navegador y versión (ej: Chrome 120)
- Sistema operativo (Windows, Mac, Linux, iOS, Android)
- Captura de pantalla de la página de estado del sistema
