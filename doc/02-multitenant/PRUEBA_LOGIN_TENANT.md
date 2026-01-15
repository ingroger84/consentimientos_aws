# Guía de Prueba: Login en Tenant

## 📋 Información del Tenant Creado

**Tenant:** Cliente Demo
- **Slug:** `cliente-demo`
- **URL de acceso:** `http://cliente-demo.localhost:5173/login`
- **Estado:** Activo

**Usuario Administrador:**
- **Email:** `clientedemo@demo.com`
- **Contraseña:** La que configuraste al crear el tenant
- **Rol:** Administrador General

**Configuración del Tenant:**
- Nombre de empresa: Cliente Demo
- Email: demo@demo.com
- Teléfono: 3000000000

---

## 🔧 Correcciones Implementadas

### Problema Identificado
El frontend estaba enviando peticiones a `localhost:3000` sin incluir el subdominio, por lo que el backend no podía detectar el tenant desde el header `Host`.

### Solución Implementada

1. **Nuevo archivo:** `frontend/src/utils/api-url.ts`
   - Función `getApiBaseUrl()`: Detecta el subdominio actual y lo mantiene en las peticiones al backend
   - Función `getResourceUrl()`: Genera URLs completas para recursos (imágenes, archivos)

2. **Actualizado:** `frontend/src/services/api.ts`
   - Ahora usa `getApiBaseUrl()` para mantener el subdominio en todas las peticiones

3. **Actualizados:** Componentes con URLs hardcodeadas
   - `LoginPage.tsx`
   - `Layout.tsx`
   - `SettingsPage.tsx`

### Cómo Funciona

**Antes:**
```
Usuario accede a: cliente-demo.localhost:5173
Frontend hace peticiones a: localhost:3000 ❌
Backend recibe Host: localhost:3000
Middleware detecta: null (Super Admin) ❌
```

**Ahora:**
```
Usuario accede a: cliente-demo.localhost:5173
Frontend hace peticiones a: cliente-demo.localhost:3000 ✅
Backend recibe Host: cliente-demo.localhost:3000
Middleware detecta: cliente-demo ✅
```

---

## 🧪 Pasos para Probar

### 1. Recargar el Frontend

El frontend necesita recargar para aplicar los cambios en la configuración de API:

```bash
# Presiona Ctrl+C en la terminal del frontend y vuelve a ejecutar
cd frontend
npm run dev
```

O simplemente **recarga la página en el navegador** (F5 o Ctrl+R).

### 2. Acceder al Tenant

1. Abre el navegador en: `http://cliente-demo.localhost:5173/login`
2. Ingresa las credenciales:
   - **Email:** `clientedemo@demo.com`
   - **Contraseña:** La que configuraste al crear el tenant

### 3. Verificar en el Backend

Abre la terminal del backend y verifica los logs. Deberías ver:

```
[TenantMiddleware] Host: cliente-demo.localhost:3000 -> Tenant Slug: cliente-demo
[AuthService] Login attempt - User: clientedemo@demo.com, Tenant Slug: cliente-demo
[AuthService] User clientedemo@demo.com logged in to tenant: cliente-demo
```

### 4. Verificar Configuración

Una vez dentro:
1. Ve a "Configuración Avanzada"
2. Verifica que aparezcan los datos del tenant:
   - Nombre de la empresa: Cliente Demo
   - Email: demo@demo.com
   - Teléfono: 3000000000

---

## 🔍 Verificación de Datos del Tenant

Si necesitas verificar qué usuarios existen para un tenant, ejecuta:

```bash
cd backend
npx ts-node check-tenant-user.ts
```

Este script muestra:
- Información del tenant
- Usuarios asociados con sus emails
- Configuración del tenant

---

## 🚨 Solución de Problemas

### Error: "No se puede iniciar sesión"

**Causa:** Email o contraseña incorrectos

**Solución:** Verifica el email correcto ejecutando:
```bash
cd backend
npx ts-node check-tenant-user.ts
```

### Error: "Debes acceder desde tu subdominio"

**Causa:** Estás intentando acceder desde el dominio incorrecto

**Solución:** 
- Para Super Admin: `http://admin.localhost:5173` o `http://localhost:5173`
- Para Tenant: `http://cliente-demo.localhost:5173`

### Error: "Not allowed by CORS"

**Causa:** El frontend no se recargó después de los cambios

**Solución:** 
1. Recarga la página del navegador (F5)
2. Si persiste, reinicia el servidor del frontend

### El middleware detecta "null" en lugar del tenant

**Causa:** El frontend está enviando peticiones a `localhost:3000` sin subdominio

**Solución:**
1. Verifica que accediste desde `cliente-demo.localhost:5173`
2. Recarga la página del navegador
3. Abre las DevTools (F12) → Network → Verifica que las peticiones vayan a `cliente-demo.localhost:3000`

---

## 📝 Notas Importantes

1. **Subdominios en localhost:** Los navegadores modernos soportan subdominios en localhost sin configuración adicional

2. **Caché del navegador:** Si los cambios no se reflejan, limpia el caché o usa modo incógnito

3. **Múltiples tenants:** Puedes crear más tenants y cada uno tendrá su propio subdominio:
   - `cliente1.localhost:5173`
   - `cliente2.localhost:5173`
   - `empresa-abc.localhost:5173`

4. **Super Admin:** Siempre accede desde:
   - `http://admin.localhost:5173` (recomendado)
   - `http://localhost:5173` (también funciona)

---

## ✅ Checklist de Verificación

- [ ] Frontend recargado o reiniciado
- [ ] Accediendo desde `http://cliente-demo.localhost:5173/login`
- [ ] Email correcto: `clientedemo@demo.com`
- [ ] Contraseña correcta (la que configuraste)
- [ ] Backend muestra logs con "Tenant Slug: cliente-demo"
- [ ] Login exitoso
- [ ] Configuración muestra datos del tenant

---

## 🎯 Próximos Pasos

Una vez que el login funcione correctamente:

1. Crear usuarios adicionales para el tenant
2. Crear sedes/sucursales
3. Crear servicios
4. Generar consentimientos
5. Verificar que todos los datos están aislados por tenant
