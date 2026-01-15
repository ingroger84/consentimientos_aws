# Solución: Error de Subdominio

## 🚨 Error Encontrado

```
Debes acceder desde tu subdominio: demo.tudominio.com
```

## 🔍 Diagnóstico

### Problema 1: BASE_DOMAIN Incorrecto

El archivo `backend/.env` tenía configurado:
```env
BASE_DOMAIN=tudominio.com
```

Pero en desarrollo local debemos usar:
```env
BASE_DOMAIN=localhost
```

### Problema 2: Slug del Tenant

El tenant creado tiene el slug `demo`, no `cliente-demo`.

Por lo tanto, la URL correcta es:
- ❌ Incorrecto: `http://cliente-demo.localhost:5173`
- ✅ Correcto: `http://demo.localhost:5173`

## ✅ Solución Aplicada

### 1. Actualizado `backend/.env`

```env
# Multi-Tenant (Subdominios)
BASE_DOMAIN=localhost
```

### 2. Actualizado `backend/.env.example`

```env
# Multi-Tenant (Subdominios)
# Para desarrollo local usar: localhost
# Para producción usar: tudominio.com
BASE_DOMAIN=localhost
```

### 3. Creado Script de Listado

Nuevo archivo: `backend/list-tenants.ts`

**Uso:**
```bash
cd backend
npx ts-node list-tenants.ts
```

**Salida:**
```
📋 Tenants encontrados: 1

1. Demo
   Slug:   demo
   Email:  demo@demo.com
   Estado: active
   URL:    http://demo.localhost:5173
```

## 🚀 Pasos para Resolver

### 1. Reiniciar el Backend

El backend necesita reiniciarse para tomar el cambio en `.env`:

**Si está corriendo en terminal de Kiro:**
1. Presiona `Ctrl+C` en la terminal del backend
2. Ejecuta nuevamente: `npm run start:dev`

**Si está corriendo en ventana externa:**
```powershell
.\stop.ps1
```
Luego inicia nuevamente el backend.

### 2. Acceder con la URL Correcta

Abre el navegador en:
```
http://demo.localhost:5173
```

### 3. Usar las Credenciales Correctas

Primero, verifica qué usuario se creó para el tenant:

```bash
cd backend
npx ts-node check-tenant-user.ts
```

Actualiza el script para buscar el slug correcto:

```bash
# Edita check-tenant-user.ts y cambia:
# WHERE slug = 'cliente-demo'
# Por:
# WHERE slug = 'demo'
```

O usa el email que configuraste al crear el tenant.

## 📋 Información del Tenant

**Tenant:** Demo
- **Slug:** `demo`
- **URL:** `http://demo.localhost:5173`
- **Email de contacto:** `demo@demo.com`
- **Estado:** Activo

**Usuario Administrador:**
- **Email:** (el que configuraste al crear el tenant)
- **Contraseña:** (la que configuraste al crear el tenant)

## 🔧 Comandos Útiles

### Listar Todos los Tenants

```bash
cd backend
npx ts-node list-tenants.ts
```

### Verificar Usuario de un Tenant

Edita `backend/check-tenant-user.ts` línea 24:
```typescript
WHERE slug = 'demo' AND deleted_at IS NULL
```

Luego ejecuta:
```bash
npx ts-node check-tenant-user.ts
```

### Ver Procesos Corriendo

```powershell
# Ver proceso en puerto 3000 (Backend)
Get-NetTCPConnection -LocalPort 3000

# Ver proceso en puerto 5173 (Frontend)
Get-NetTCPConnection -LocalPort 5173
```

## 🎯 URLs de Acceso Actualizadas

### Super Admin
```
URL:      http://admin.localhost:5173
Email:    superadmin@sistema.com
Password: superadmin123
```

### Tenant: Demo
```
URL:      http://demo.localhost:5173
Email:    (el que configuraste)
Password: (la que configuraste)
```

### Backend API
```
URL: http://localhost:3000/api
```

## ⚠️ Notas Importantes

### 1. BASE_DOMAIN en Desarrollo vs Producción

**Desarrollo (localhost):**
```env
BASE_DOMAIN=localhost
```

**Producción:**
```env
BASE_DOMAIN=tudominio.com
```

### 2. Reiniciar Después de Cambios en .env

Siempre que cambies el archivo `.env`, debes reiniciar el backend:
```bash
# Detener (Ctrl+C)
# Iniciar
npm run start:dev
```

### 3. Verificar Slug del Tenant

Antes de intentar acceder, verifica el slug correcto:
```bash
npx ts-node list-tenants.ts
```

### 4. Crear Nuevos Tenants

Al crear un nuevo tenant desde el Super Admin:
- El **slug** se genera automáticamente del nombre
- Ejemplo: "Cliente Demo" → slug: "cliente-demo"
- URL de acceso: `http://cliente-demo.localhost:5173`

## ✅ Checklist de Verificación

- [ ] `backend/.env` tiene `BASE_DOMAIN=localhost`
- [ ] Backend reiniciado después del cambio
- [ ] Ejecutado `npx ts-node list-tenants.ts` para ver el slug correcto
- [ ] Accediendo desde `http://demo.localhost:5173`
- [ ] Usando el email correcto del usuario administrador
- [ ] Usando la contraseña correcta

## 🔄 Flujo Correcto de Login

1. **Verificar el slug del tenant:**
   ```bash
   cd backend
   npx ts-node list-tenants.ts
   ```

2. **Acceder a la URL correcta:**
   ```
   http://{slug}.localhost:5173
   ```

3. **Ingresar credenciales:**
   - Email del usuario administrador del tenant
   - Contraseña configurada al crear el tenant

4. **Verificar en logs del backend:**
   ```
   [TenantMiddleware] Host: demo.localhost:3000 -> Tenant Slug: demo
   [AuthService] Login attempt - User: xxx@xxx.com, Tenant Slug: demo
   [AuthService] User xxx@xxx.com logged in to tenant: demo
   ```

## 📚 Referencias

- **[PRUEBA_LOGIN_TENANT.md](./PRUEBA_LOGIN_TENANT.md)** - Guía de pruebas de login
- **[IMPLEMENTACION_SUBDOMINIOS.md](./IMPLEMENTACION_SUBDOMINIOS.md)** - Arquitectura de subdominios
- **[ESTADO_ACTUAL_SISTEMA.md](./ESTADO_ACTUAL_SISTEMA.md)** - Estado del sistema

---

**¡Problema resuelto! 🎉**
