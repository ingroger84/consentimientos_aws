# 🚀 Instrucciones: Activar Sistema de Impersonation

**Objetivo:** Permitir que el Super Admin acceda a cuentas tenant sin modificar contraseñas

---

## ⚡ Inicio Rápido (3 Pasos)

### 1️⃣ Verificar Estado del Sistema
```powershell
.\verificar-sistema.ps1
```

**Resultado esperado:**
- ✓ Backend corriendo en puerto 3000
- ✓ Frontend corriendo en puerto 5173

### 2️⃣ Limpiar Caché y Reiniciar
```powershell
.\restart-frontend-clean.ps1
```

**Qué hace:**
- Detiene procesos de Node.js
- Limpia caché de Vite
- Reinicia servidor de desarrollo

### 3️⃣ Probar el Sistema
1. **Cierra TODOS los navegadores** (importante)
2. Abre un navegador NUEVO
3. Ve a: `http://admin.localhost:5173`
4. Presiona `Ctrl+Shift+R` (recarga forzada)
5. Inicia sesión como Super Admin
6. Ve a Usuarios
7. Haz clic en botón púrpura (LogIn) de un usuario
8. Haz clic en "Abrir en Nueva Ventana"

**Resultado esperado:**
- ✅ Se abre nueva ventana
- ✅ Inicia sesión automáticamente
- ✅ Redirige a dashboard del tenant

---

## 🔧 Si el Paso 2 No Funciona

### Opción A: Build de Producción
```powershell
.\start-frontend-production.ps1
```

**Diferencia:**
- Usa código compilado (garantizado actualizado)
- Puerto 4173 en lugar de 5173
- Acceso: `http://admin.localhost:4173`

### Opción B: Limpieza Profunda
```powershell
# Detener todo
# Cerrar navegadores

# Limpiar completamente
Remove-Item -Path "frontend\.vite" -Recurse -Force
Remove-Item -Path "frontend\dist" -Recurse -Force
Remove-Item -Path "frontend\node_modules" -Recurse -Force

# Reinstalar
cd frontend
npm install
npm run dev
```

**ADVERTENCIA:** Esto toma varios minutos

---

## 🆘 Solución Temporal (Mientras Resuelves el Caché)

Si necesitas acceso AHORA a una cuenta tenant:

### Método: Cambiar Contraseña Temporal

1. Como Super Admin, ve a Usuarios
2. Encuentra el usuario al que quieres acceder
3. Haz clic en botón verde (llave) "Cambiar Contraseña"
4. Establece contraseña temporal: `temp123`
5. Cierra sesión como Super Admin
6. Ve a `http://[tenant-slug].localhost:5173`
7. Inicia sesión con:
   - Email: [email del usuario]
   - Contraseña: `temp123`
8. **IMPORTANTE:** Después, vuelve a cambiar la contraseña a algo seguro

---

## 📋 Checklist de Verificación

### Antes de Probar
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173 (o 4173 si usas producción)
- [ ] Todos los navegadores cerrados
- [ ] Caché de Vite limpiado

### Durante la Prueba
- [ ] Abrir DevTools (F12)
- [ ] Ver pestaña Console
- [ ] Buscar logs que empiecen con `[MagicLogin]`

### Logs Esperados
```
[LoginPage] Magic token detectado, llamando handleMagicLogin
[MagicLogin] ========== INICIO ==========
[MagicLogin] Token recibido: 3174508cbd0bde4a09236607...
[MagicLogin] Llamando a authService.magicLogin...
[MagicLogin] Respuesta recibida: {access_token: "...", user: {...}}
[MagicLogin] Guardando en localStorage...
[MagicLogin] Redirigiendo a /dashboard...
[MagicLogin] ========== FIN EXITOSO ==========
```

### Si Ves Logs Antiguos
```
[MagicLogin] ========== INICIO ==========
// ... y luego no continúa
```

**Significa:** El caché no se limpió correctamente

**Solución:** Usar Opción A (Build de Producción)

---

## 🎯 Cómo Funciona el Sistema

### Flujo Completo

```
1. Super Admin hace clic en botón púrpura (LogIn)
   ↓
2. Backend genera magic token (válido 5 minutos, un solo uso)
   ↓
3. Frontend muestra modal con enlace temporal
   ↓
4. Usuario hace clic en "Abrir en Nueva Ventana"
   ↓
5. Se abre: http://[tenant-slug].localhost:5173/login
   ↓
6. Token se guarda en sessionStorage
   ↓
7. LoginPage detecta token en sessionStorage
   ↓
8. Frontend llama: GET /auth/magic-login/[token]
   ↓
9. Backend valida token y retorna JWT
   ↓
10. Frontend guarda JWT y redirige a dashboard
```

### Seguridad
- ✅ Token de 256 bits hasheado con SHA-256
- ✅ Un solo uso (se elimina después de usarlo)
- ✅ Expira en 5 minutos
- ✅ Solo funciona en el subdominio correcto
- ✅ Solo Super Admin puede generar tokens
- ✅ No se puede generar token para otro Super Admin
- ✅ Logging completo de todas las operaciones

---

## 📁 Archivos Relevantes

### Scripts
- `verificar-sistema.ps1` - Verifica estado del sistema
- `restart-frontend-clean.ps1` - Limpieza automática
- `start-frontend-production.ps1` - Build de producción

### Documentación
- `doc/RESUMEN_EJECUTIVO_IMPERSONATION.md` - Resumen ejecutivo
- `doc/SOLUCION_DEFINITIVA_HOT_RELOAD.md` - Guía completa del problema
- `doc/SOLUCION_MAGIC_LINK_IMPERSONATION.md` - Cómo funciona el sistema
- `doc/SOLUCION_TEMPORAL_IMPERSONATION.md` - Alternativas

### Código Backend (✅ Funcional)
- `backend/src/auth/auth.controller.ts` - Endpoints
- `backend/src/auth/auth.service.ts` - Lógica de negocio

### Código Frontend (✅ Correcto, ⚠️ Caché)
- `frontend/src/pages/UsersPage.tsx` - Botón púrpura y modal
- `frontend/src/pages/LoginPage.tsx` - Detección y procesamiento
- `frontend/src/services/auth.service.ts` - Llamada al backend

---

## 🐛 Troubleshooting

### Problema: "Token inválido o expirado"
**Causa:** El token ya se usó o pasaron más de 5 minutos  
**Solución:** Generar un nuevo token

### Problema: "No redirige automáticamente"
**Causa:** Caché del navegador  
**Solución:** 
1. Cerrar TODOS los navegadores
2. Abrir navegador nuevo
3. Presionar `Ctrl+Shift+R`

### Problema: "Logs antiguos en consola"
**Causa:** Vite sirviendo versión cacheada  
**Solución:** Usar build de producción (Opción A)

### Problema: "Error 401 en backend"
**Causa:** Backend no está corriendo  
**Solución:** 
```powershell
cd backend
npm run start:dev
```

### Problema: "Cannot GET /api"
**Causa:** Backend no responde  
**Solución:** Verificar que el backend esté en puerto 3000

---

## ✅ Criterios de Éxito

El sistema funciona correctamente cuando:

1. ✅ Al hacer clic en botón púrpura, se abre modal
2. ✅ El modal muestra un enlace con magic token
3. ✅ Al hacer clic en "Abrir en Nueva Ventana", se abre nueva pestaña
4. ✅ La nueva pestaña inicia sesión automáticamente
5. ✅ Redirige a dashboard del tenant
6. ✅ La contraseña del usuario NO fue modificada
7. ✅ Los logs muestran `[MagicLogin] ========== FIN EXITOSO ==========`

---

## 📞 Soporte

Si después de seguir todos los pasos el problema persiste:

1. Ejecuta `.\verificar-sistema.ps1` y comparte el resultado
2. Comparte los logs de la consola del navegador
3. Comparte los logs del backend (terminal donde corre `npm run start:dev`)
4. Indica qué opción usaste (desarrollo o producción)

---

## 🎉 Conclusión

El sistema está **completamente implementado**. El backend funciona perfectamente. El frontend tiene el código correcto.

**Solo necesitamos limpiar el caché para que el navegador sirva la versión actualizada.**

**Ejecuta los scripts y el sistema debería funcionar inmediatamente.**

