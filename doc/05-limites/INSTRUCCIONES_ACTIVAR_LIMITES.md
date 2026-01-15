# 🚀 Instrucciones: Activar Sistema de Límites de Recursos

**Fecha:** 7 de enero de 2026  
**Estado:** ✅ CÓDIGO IMPLEMENTADO - REQUIERE REINICIO

---

## ⚠️ IMPORTANTE

El sistema de control de límites de recursos está **completamente implementado** pero requiere que **reinicies el backend** para que los cambios surtan efecto.

---

## 📋 Pasos para Activar

### Paso 1: Detener el Backend

Si el backend está corriendo, detenlo presionando `Ctrl+C` en la terminal.

### Paso 2: Verificar Estado Actual (Opcional)

Ejecuta este script para ver el estado actual de los límites:

```powershell
cd backend
npx ts-node test-resource-limits.ts
```

**Resultado esperado:**
- Verás una tabla con todos los tenants
- Mostrará cuántos recursos están usando vs sus límites
- Indicará si algún tenant ha excedido límites

### Paso 3: Compilar el Backend

```powershell
cd backend
npm run build
```

**Resultado esperado:**
```
webpack 5.97.1 compiled successfully
```

### Paso 4: Reiniciar el Backend

```powershell
cd backend
npm run start:dev
```

**Resultado esperado:**
```
[Nest] Application successfully started
```

### Paso 5: Verificar que el Guard Está Activo

En los logs del backend deberías ver:
```
[NestFactory] Starting Nest application...
[InstanceLoader] CommonModule dependencies initialized
[InstanceLoader] ResourceLimitGuard initialized
```

---

## 🧪 Cómo Probar

### Prueba 1: Crear Usuario Cuando el Límite Está Alcanzado

1. **Accede a un tenant que tenga el límite de usuarios alcanzado**
   ```
   http://[tenant-slug].localhost:5173
   ```

2. **Intenta crear un nuevo usuario**
   - Ve a "Usuarios"
   - Haz clic en "Nuevo Usuario"
   - Completa el formulario
   - Haz clic en "Crear"

3. **Resultado esperado:**
   - ❌ El backend rechaza la creación
   - 🔴 Error 403 Forbidden
   - 💬 Mensaje: "Has alcanzado el límite máximo de usuarios permitidos (X/X)..."

### Prueba 2: Verificar en Logs del Backend

Cuando intentes crear un recurso con el límite alcanzado, deberías ver en los logs:

```
[ResourceLimitGuard] Checking limits for tenant: [tenant-id]
[ResourceLimitGuard] Current users: 100, Max: 100
[ResourceLimitGuard] Limit reached, blocking creation
```

### Prueba 3: Verificar que Super Admin No Tiene Límites

1. **Accede como Super Admin**
   ```
   http://admin.localhost:5173
   Email: superadmin@sistema.com
   Password: superadmin123
   ```

2. **Crea recursos sin límite**
   - El Super Admin puede crear usuarios, sedes, etc. sin restricciones

---

## 🔍 Verificación de Funcionamiento

### ✅ El Sistema Funciona Correctamente Si:

1. **Backend inicia sin errores**
   - No hay errores de compilación
   - CommonModule se carga correctamente

2. **Tenants con límites alcanzados no pueden crear recursos**
   - Error 403 al intentar crear
   - Mensaje descriptivo mostrado

3. **Tenants con límites disponibles pueden crear recursos**
   - Creación exitosa
   - Sin errores

4. **Super Admin no tiene restricciones**
   - Puede crear recursos ilimitados

---

## 🐛 Troubleshooting

### Problema: "Cannot find module 'CommonModule'"

**Solución:**
```powershell
cd backend
npm run build
npm run start:dev
```

### Problema: "Tenant repository not found"

**Causa:** El CommonModule no se importó correctamente

**Solución:**
1. Verifica que `backend/src/app.module.ts` importe `CommonModule`
2. Verifica que `backend/src/common/common.module.ts` exista
3. Reinicia el backend

### Problema: Los límites no se están aplicando

**Verificaciones:**

1. **¿El backend se reinició después de los cambios?**
   ```powershell
   # Detener backend (Ctrl+C)
   # Reiniciar
   npm run start:dev
   ```

2. **¿El guard está aplicado en los controllers?**
   - Verifica que `@UseGuards(ResourceLimitGuard)` esté presente
   - Verifica que `@CheckResourceLimit('users')` esté presente

3. **¿El tenant realmente alcanzó el límite?**
   ```powershell
   npx ts-node test-resource-limits.ts
   ```

4. **¿Estás probando como Super Admin?**
   - El Super Admin NO tiene límites
   - Prueba con un usuario de tenant

---

## 📊 Verificar Límites Actuales

### Script de Verificación

```powershell
cd backend
npx ts-node test-resource-limits.ts
```

**Salida esperada:**
```
================================================================================
VERIFICACIÓN DE LÍMITES DE RECURSOS POR TENANT
================================================================================

📊 Tenant: Demo Estética (demo-estetica)
   Plan: basic | Estado: active

   👥 Usuarios: 5 / 100 (5.0%) 🟢 OK
   📍 Sedes: 3 / 5 (60.0%) 🟢 OK
   📋 Consentimientos: 9 / 100 (9.0%) 🟢 OK

--------------------------------------------------------------------------------

📊 Tenant: Aguilab Lashes (aguilab-lashes)
   Plan: basic | Estado: active

   👥 Usuarios: 100 / 100 (100.0%) 🔴 LÍMITE ALCANZADO
   📍 Sedes: 5 / 5 (100.0%) 🔴 LÍMITE ALCANZADO
   📋 Consentimientos: 95 / 100 (95.0%) 🟡 CRÍTICO

   ⚠️  ALERTA: Este tenant ha excedido uno o más límites!
   ℹ️  El guard debería estar bloqueando nuevas creaciones.

--------------------------------------------------------------------------------
```

---

## 📁 Archivos Clave

### Backend
- `backend/src/common/guards/resource-limit.guard.ts` - Guard principal
- `backend/src/common/decorators/resource-limit.decorator.ts` - Decorador
- `backend/src/common/common.module.ts` - Módulo común
- `backend/src/app.module.ts` - Importa CommonModule
- `backend/src/users/users.controller.ts` - Aplica guard
- `backend/src/branches/branches.controller.ts` - Aplica guard
- `backend/src/consents/consents.controller.ts` - Aplica guard

### Scripts
- `backend/test-resource-limits.ts` - Script de verificación

---

## ✅ Checklist de Activación

- [ ] Backend compilado sin errores (`npm run build`)
- [ ] Backend reiniciado (`npm run start:dev`)
- [ ] CommonModule cargado (verificar logs)
- [ ] Script de verificación ejecutado
- [ ] Prueba realizada con tenant que alcanzó límite
- [ ] Error 403 recibido correctamente
- [ ] Mensaje descriptivo mostrado
- [ ] Super Admin puede crear sin límites

---

## 🎯 Próximos Pasos

Una vez que el backend esté reiniciado y funcionando:

1. **Integrar el hook en el frontend** (opcional para mejor UX)
   - Ver: `doc/EJEMPLO_INTEGRACION_LIMITES.md`
   - Agregar `useResourceLimit()` en páginas
   - Agregar `ResourceLimitModal` para mensajes elegantes

2. **Ajustar límites de tenants** si es necesario
   - Desde el Super Admin
   - Editar tenant
   - Actualizar maxUsers, maxBranches, maxConsents

3. **Monitorear uso de recursos**
   - Ejecutar script de verificación periódicamente
   - Identificar tenants que necesitan upgrade

---

## 📞 Soporte

Si después de reiniciar el backend los límites no funcionan:

1. Verifica los logs del backend para errores
2. Ejecuta el script de verificación
3. Verifica que el guard esté en los controllers
4. Prueba con un tenant diferente
5. Verifica que no estés usando Super Admin

---

**¡El sistema está listo! Solo necesitas reiniciar el backend. 🚀**

