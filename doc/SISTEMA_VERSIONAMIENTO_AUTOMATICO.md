# Sistema de Versionamiento Automático v2.0

**Fecha:** 10 de febrero de 2026  
**Versión:** 2.0  
**Estado:** ✅ IMPLEMENTADO

---

## 🎯 Objetivo

Eliminar completamente los problemas de caché del navegador mediante un sistema automático de detección y notificación de actualizaciones.

---

## 🚀 Características Principales

### 1. Cache Busting Automático
- ✅ Archivos JavaScript y CSS con hash único en el nombre
- ✅ Nombres de archivo cambian en cada build: `main-a1b2c3d4.js`
- ✅ Navegadores descargan automáticamente archivos nuevos

### 2. Detección Automática de Actualizaciones
- ✅ Verificación cada 5 minutos en segundo plano
- ✅ Archivo `version.json` generado automáticamente en cada build
- ✅ Comparación de versión local vs servidor

### 3. Notificación al Usuario
- ✅ Banner superior cuando hay actualización disponible
- ✅ Botón "Actualizar Ahora" para recarga automática
- ✅ Limpieza automática de caché al actualizar

### 4. Control de Caché en Nginx
- ✅ HTML: NUNCA cachear
- ✅ version.json: NUNCA cachear
- ✅ JS/CSS con hash: Cachear 1 año (inmutables)
- ✅ JS/CSS sin hash: NUNCA cachear

---

## 📁 Archivos Implementados

### Frontend

#### 1. `src/services/version.service.ts`
Servicio principal de versionamiento:
```typescript
- startAutoCheck(): Inicia verificación automática
- checkForUpdates(): Verifica si hay actualizaciones
- reloadApp(): Recarga con limpieza de caché
- onUpdateAvailable(): Registra listeners
```

#### 2. `src/components/UpdateNotification.tsx`
Componente de notificación visual:
- Banner superior animado
- Botón de actualización
- Opción de cerrar temporalmente

#### 3. `public/version.json`
Archivo de versión (generado automáticamente):
```json
{
  "version": "36.0.1",
  "buildDate": "2026-02-09",
  "buildHash": "auto-generated",
  "buildTimestamp": 1707523200000
}
```

#### 4. `scripts/update-version.js`
Script que actualiza version.json en cada build:
- Lee versión de package.json
- Genera hash único
- Crea version.json en public/

#### 5. `vite.config.ts` (actualizado)
Configuración mejorada:
- Plugin personalizado para ejecutar update-version.js
- Cache busting con hash en nombres de archivo
- Optimización de chunks

### Nginx

#### `nginx-cache-control.conf`
Configuración optimizada de caché:
- HTML: `Cache-Control: no-cache, no-store, must-revalidate`
- version.json: `Cache-Control: no-cache, no-store, must-revalidate`
- JS/CSS con hash: `Cache-Control: public, max-age=31536000, immutable`
- Imágenes: `Cache-Control: public, max-age=31536000, immutable`

### Scripts

#### `scripts/deploy-with-cache-busting.ps1`
Script de despliegue mejorado:
1. Compila backend y frontend
2. Genera version.json automáticamente
3. Elimina archivos antiguos del servidor
4. Copia archivos nuevos
5. Reinicia PM2 y Nginx
6. Verifica despliegue

---

## 🔄 Flujo de Actualización

### 1. Desarrollo
```bash
# Desarrollador hace cambios
git add .
git commit -m "feat: nueva funcionalidad"
git push
```

### 2. Build
```bash
cd frontend
npm run build
# ↓
# scripts/update-version.js se ejecuta automáticamente
# ↓
# version.json se genera con nueva versión y hash
# ↓
# Archivos JS/CSS se generan con hash único
```

### 3. Despliegue
```powershell
.\scripts\deploy-with-cache-busting.ps1
# ↓
# Elimina archivos antiguos del servidor
# ↓
# Copia archivos nuevos con hash único
# ↓
# Reinicia servicios
```

### 4. Cliente (Automático)
```
Usuario tiene la app abierta
↓
Cada 5 minutos: verifica version.json
↓
Si hay nueva versión: muestra notificación
↓
Usuario hace clic en "Actualizar Ahora"
↓
Limpia caché y recarga
↓
Descarga archivos nuevos (nombres diferentes por hash)
↓
App actualizada ✓
```

---

## 🎨 Interfaz de Usuario

### Banner de Actualización
```
┌─────────────────────────────────────────────────────────┐
│ 🎉 Nueva versión disponible                             │
│ Actualiza para obtener las últimas mejoras              │
│                                    [Actualizar Ahora] [X]│
└─────────────────────────────────────────────────────────┘
```

**Características:**
- Aparece en la parte superior
- Animación suave de entrada
- No bloquea la navegación
- Se puede cerrar temporalmente
- Reaparece después de 10 minutos si no se actualiza

---

## 🔧 Configuración

### Intervalo de Verificación
Modificar en `src/services/version.service.ts`:
```typescript
private checkInterval: number = 5 * 60 * 1000; // 5 minutos
```

### Tiempo de Reaparición
Modificar en `src/components/UpdateNotification.tsx`:
```typescript
setTimeout(() => {
  setShowNotification(true);
}, 10 * 60 * 1000); // 10 minutos
```

---

## 📊 Ventajas del Nuevo Sistema

### Antes (Sistema Antiguo)
❌ Usuario debe limpiar caché manualmente  
❌ Archivos con mismo nombre se cachean  
❌ No hay notificación de actualizaciones  
❌ Requiere instrucciones al usuario  
❌ Problemas frecuentes de versión antigua  

### Ahora (Sistema Nuevo)
✅ Detección automática de actualizaciones  
✅ Notificación visual al usuario  
✅ Actualización con un clic  
✅ Cache busting automático con hash  
✅ Sin intervención manual necesaria  
✅ Archivos nuevos se descargan automáticamente  

---

## 🧪 Pruebas

### Probar Detección de Actualización

1. **Abrir la aplicación en el navegador**
2. **Abrir consola del navegador (F12)**
3. **Ejecutar:**
   ```javascript
   // Forzar verificación inmediata
   await versionService.checkForUpdates();
   ```
4. **Debería aparecer el banner si hay actualización**

### Probar Actualización Manual

1. **Hacer clic en "Actualizar Ahora"**
2. **Verificar en consola:**
   ```
   🔄 Recargando aplicación...
   ```
3. **La página se recarga automáticamente**
4. **Verificar nueva versión en el footer**

### Probar Cache Busting

1. **Inspeccionar archivos en Network (F12)**
2. **Buscar archivos JS:**
   ```
   main-a1b2c3d4.js
   vendor-react-e5f6g7h8.js
   ```
3. **Hacer nuevo build y desplegar**
4. **Los nombres de archivo deben cambiar:**
   ```
   main-i9j0k1l2.js  ← Hash diferente
   vendor-react-m3n4o5p6.js  ← Hash diferente
   ```

---

## 🚀 Despliegue

### Opción 1: Script Automático (Recomendado)
```powershell
.\scripts\deploy-with-cache-busting.ps1
```

### Opción 2: Manual
```bash
# 1. Compilar frontend
cd frontend
npm run build

# 2. Verificar version.json
cat dist/version.json

# 3. Desplegar
scp -r dist/* ubuntu@server:/var/www/consentimientos/frontend/

# 4. Reiniciar servicios
ssh ubuntu@server "sudo systemctl reload nginx"
```

---

## 📝 Mantenimiento

### Actualizar Nginx
```bash
# Copiar configuración
sudo cp /tmp/nginx-cache-control.conf /etc/nginx/sites-available/consentimientos

# Verificar sintaxis
sudo nginx -t

# Aplicar cambios
sudo systemctl reload nginx
```

### Verificar Logs
```bash
# Logs de Nginx
sudo tail -f /var/log/nginx/consentimientos-access.log

# Logs de PM2
pm2 logs datagree
```

### Limpiar Backups Antiguos
```bash
# Mantener solo últimos 10 backups
cd ~/backups
ls -t | tail -n +11 | xargs rm -f
```

---

## 🔍 Troubleshooting

### Problema: Banner no aparece

**Solución:**
1. Verificar que version.json existe en el servidor
2. Verificar que version.json no está cacheado
3. Abrir consola y ejecutar:
   ```javascript
   await versionService.checkForUpdates();
   ```

### Problema: Archivos sin hash

**Solución:**
1. Verificar vite.config.ts tiene la configuración correcta
2. Limpiar y recompilar:
   ```bash
   rm -rf dist node_modules/.vite
   npm run build
   ```

### Problema: version.json no se genera

**Solución:**
1. Verificar que scripts/update-version.js existe
2. Ejecutar manualmente:
   ```bash
   node scripts/update-version.js
   ```
3. Verificar que package.json tiene el script correcto

---

## 📈 Métricas de Éxito

### Antes
- ⏱️ Tiempo para ver actualización: **Manual (indefinido)**
- 🔄 Actualizaciones exitosas: **~60%** (requiere instrucciones)
- 📞 Reportes de versión antigua: **Frecuentes**

### Después (Esperado)
- ⏱️ Tiempo para ver actualización: **~5 minutos** (automático)
- 🔄 Actualizaciones exitosas: **~95%** (un clic)
- 📞 Reportes de versión antigua: **Mínimos**

---

## 🎯 Próximas Mejoras

### Fase 2 (Futuro)
- [ ] Service Worker para control avanzado de caché
- [ ] Actualización en segundo plano (sin recarga)
- [ ] Notificación push cuando hay actualización crítica
- [ ] Historial de versiones en la app
- [ ] Rollback automático si hay errores

---

## ✅ Checklist de Implementación

- [x] Crear version.service.ts
- [x] Crear UpdateNotification.tsx
- [x] Crear update-version.js
- [x] Actualizar vite.config.ts
- [x] Actualizar App.tsx
- [x] Agregar animaciones en index.css
- [x] Crear nginx-cache-control.conf
- [x] Crear deploy-with-cache-busting.ps1
- [x] Documentar sistema completo
- [ ] Desplegar en producción
- [ ] Probar con usuarios reales
- [ ] Monitorear métricas

---

## 📞 Soporte

Si tienes problemas con el sistema de versionamiento:

1. Verificar logs del navegador (F12 → Console)
2. Verificar version.json en el servidor
3. Verificar configuración de Nginx
4. Contactar al equipo de desarrollo

---

**Última actualización:** 10 de febrero de 2026  
**Versión del documento:** 1.0  
**Autor:** Sistema de Versionamiento Automático
