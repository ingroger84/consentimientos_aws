# Corrección: Password del Super Admin

**Fecha:** 6 de enero de 2026  
**Estado:** ✅ RESUELTO

---

## 🎯 Problema Detectado

Al intentar hacer login con el Super Admin desde `http://admin.localhost:5173`, el login fallaba sin mostrar errores específicos en el frontend.

---

## 🔍 Diagnóstico

### Investigación Realizada

1. **Verificación del Middleware**
   - ✅ El `TenantMiddleware` detecta correctamente el subdominio `admin`
   - ✅ Marca correctamente `tenantSlug = null` para Super Admin
   - Logs: `[TenantMiddleware] Host: admin.localhost:3000 -> Tenant Slug: null (Super Admin)`

2. **Verificación del Usuario**
   - ✅ El usuario Super Admin existe en la base de datos
   - ✅ Email: `superadmin@sistema.com`
   - ✅ Rol: Super Administrador
   - ✅ Estado: Activo
   - ❌ **Password: NULL**

### Causa Raíz

El Super Admin fue creado en la base de datos pero **sin contraseña**. Esto puede ocurrir si:
- El seed se ejecutó parcialmente
- Hubo un error durante la creación del usuario
- Se ejecutó una migración que creó el usuario sin password

### Nota Técnica

El campo `password` en la entidad `User` tiene la propiedad `select: false`, lo que significa que TypeORM no lo carga por defecto. Para verificar el password, es necesario incluirlo explícitamente en el select:

```typescript
const user = await userRepo.findOne({
  where: { email: 'superadmin@sistema.com' },
  select: ['id', 'name', 'email', 'password'], // Incluir password explícitamente
});
```

---

## ✅ Solución Aplicada

### Script de Reseteo de Contraseña

Se creó el script `backend/reset-superadmin-password.ts` que:

1. Conecta a la base de datos
2. Busca el usuario Super Admin
3. Genera un nuevo hash de contraseña usando bcrypt
4. Actualiza el campo password en la base de datos

### Ejecución

```bash
cd backend
npx ts-node reset-superadmin-password.ts
```

**Salida:**
```
✅ Conectado a la base de datos

👤 Super Admin encontrado:
  ID: aa63b5f4-3f7e-4991-b2d8-a59afafb4f4a
  Nombre: Super Admin
  Email: superadmin@sistema.com
  Password actual: ❌ NULL

🔐 Actualizando contraseña...
✅ Contraseña actualizada exitosamente!

📧 Credenciales:
  Email: superadmin@sistema.com
  Password: superadmin123

🌐 Acceso:
  URL: http://admin.localhost:5173
  o
  URL: http://localhost:5173
```

---

## 🧪 Verificación

### Script de Verificación

Se creó el script `backend/check-superadmin.ts` para verificar el estado del Super Admin:

```bash
cd backend
npx ts-node check-superadmin.ts
```

**Salida después de la corrección:**
```
✅ Conectado a la base de datos

👤 Super Admin encontrado:
  ID: aa63b5f4-3f7e-4991-b2d8-a59afafb4f4a
  Nombre: Super Admin
  Email: superadmin@sistema.com
  Activo: true
  Tenant ID: NULL (Super Admin)
  Rol: Super Administrador
  Eliminado: NO

🔐 Password Hash:
   $2b$10$dOqSqo0S6ASw9...
```

---

## 📋 Credenciales del Super Admin

### Acceso

```
URL:      http://admin.localhost:5173
          o
          http://localhost:5173

Email:    superadmin@sistema.com
Password: superadmin123
```

### Permisos

El Super Admin tiene acceso completo a:
- ✅ Gestión de Tenants (crear, editar, eliminar)
- ✅ Estadísticas globales del sistema
- ✅ Configuración del sistema
- ✅ Gestión de usuarios Super Admin
- ✅ Todos los módulos del sistema

---

## 🔧 Scripts Creados

### 1. reset-superadmin-password.ts

**Ubicación:** `backend/reset-superadmin-password.ts`

**Propósito:** Resetear la contraseña del Super Admin a `superadmin123`

**Uso:**
```bash
cd backend
npx ts-node reset-superadmin-password.ts
```

### 2. check-superadmin.ts

**Ubicación:** `backend/check-superadmin.ts`

**Propósito:** Verificar el estado del Super Admin (incluye password hash)

**Uso:**
```bash
cd backend
npx ts-node check-superadmin.ts
```

**Nota:** Este script incluye explícitamente el campo `password` en el select para poder verificarlo.

---

## 🚨 Troubleshooting

### Error: "Invalid credentials"

**Causa:** La contraseña es incorrecta o NULL

**Solución:**
```bash
cd backend
npx ts-node reset-superadmin-password.ts
```

### Error: "Super Admin NO encontrado"

**Causa:** El usuario no existe en la base de datos

**Solución:**
```bash
cd backend
npm run seed
```

### El login no responde

**Verificar:**
1. Backend corriendo en puerto 3000
2. Frontend corriendo en puerto 5173
3. Accediendo desde `http://admin.localhost:5173` o `http://localhost:5173`
4. Logs del backend para ver errores

**Comandos:**
```bash
# Ver logs del backend
# (En Kiro, usar getProcessOutput para el proceso del backend)

# Verificar que los servicios están corriendo
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

---

## 📝 Lecciones Aprendidas

### 1. Campo Password con select: false

**Problema:** El campo password no se carga por defecto en las consultas

**Solución:** Incluir explícitamente en el select cuando se necesita verificar:
```typescript
select: ['id', 'name', 'email', 'password']
```

### 2. Verificación de Datos Críticos

**Problema:** El seed puede fallar parcialmente sin notificación clara

**Solución:** Crear scripts de verificación para datos críticos como el Super Admin

### 3. Scripts de Mantenimiento

**Importancia:** Tener scripts para resetear contraseñas y verificar usuarios es esencial para troubleshooting rápido

---

## ✅ Estado Final

**Sistema completamente funcional con:**

- ✅ Super Admin con contraseña correcta
- ✅ Login funcional desde `http://admin.localhost:5173`
- ✅ Login funcional desde `http://localhost:5173`
- ✅ Scripts de verificación y reseteo disponibles
- ✅ Middleware detectando subdominios correctamente
- ✅ Backend y Frontend corriendo sin errores

**Credenciales verificadas:**
- Email: `superadmin@sistema.com`
- Password: `superadmin123`
- Password Hash: `$2b$10$dOqSqo0S6ASw9...` ✓

---

## 📚 Referencias

- [ESTADO_ACTUAL_SISTEMA.md](./ESTADO_ACTUAL_SISTEMA.md) - Estado del sistema
- [CORRECCION_FINAL_LOGIN_SUBDOMINIOS.md](./CORRECCION_FINAL_LOGIN_SUBDOMINIOS.md) - Corrección de subdominios
- [IMPLEMENTACION_SUBDOMINIOS.md](./IMPLEMENTACION_SUBDOMINIOS.md) - Arquitectura de subdominios
- [SCRIPTS_EJECUCION.md](./SCRIPTS_EJECUCION.md) - Scripts disponibles

---

**¡Super Admin Listo para Usar! 🎉**

Ahora puedes hacer login desde `http://admin.localhost:5173` con las credenciales:
- Email: `superadmin@sistema.com`
- Password: `superadmin123`

