# Guía de Uso: Sincronización Automática de Planes

## ¿Qué hace esta funcionalidad?

Cuando modificas los límites de un plan desde **"Gestión de Planes"**, los cambios se aplican **automáticamente** a todos los tenants que tienen ese plan asignado.

## ¿Cómo usar?

### 1. Accede a Gestión de Planes

Como **Super Admin**, ve a:
```
http://admin.localhost:5173/plans
```

### 2. Edita un Plan

1. Haz clic en el botón **"Editar"** (icono de lápiz) del plan que quieres modificar
2. Modifica los límites que necesites:
   - Usuarios
   - Sedes
   - Consentimientos
   - Servicios
   - Preguntas
   - Storage (MB)
3. Haz clic en **"Guardar"** (icono de check verde)

### 3. Verifica los Cambios

Los cambios se aplican **inmediatamente** en:

#### Backend:
Verás en los logs del backend:
```
[PlansService] Configuración de planes actualizada exitosamente
[PlansService] Actualizando tenants con plan: basic
[PlansService] Encontrados 3 tenants con plan basic
[PlansService] Límites actualizados para tenant: Demo Estetica
[PlansService] Límites actualizados para tenant: Demo Consultorio Medico
[PlansService] Límites actualizados para tenant: Aquiub Lashes
[PlansService] Actualización de tenants completada
```

#### Frontend (Tenant):
1. Inicia sesión como un tenant que tiene el plan modificado
2. Ve a **"Mi Plan"** (`/my-plan`)
3. Recarga la página (`F5`)
4. Verás los nuevos límites actualizados

## Ejemplo Práctico

### Escenario:
Tienes 3 tenants con **Plan Básico**:
- Demo Estetica
- Demo Consultorio Medico
- Aquiub Lashes

### Acción:
Modificas el **Plan Básico** desde "Gestión de Planes":
- Usuarios: 5 → **10** ✏️
- Sedes: 2 → **3** ✏️
- Consentimientos: 200 → **300** ✏️

### Resultado:
Los 3 tenants ahora tienen automáticamente:
- ✅ Usuarios: 10
- ✅ Sedes: 3
- ✅ Consentimientos: 300

## Ventajas

✅ **Sincronización automática**: No necesitas actualizar manualmente cada tenant  
✅ **Cambios inmediatos**: Los tenants ven los nuevos límites al recargar  
✅ **Centralizado**: Modificas una vez y afecta a todos los tenants con ese plan  
✅ **Logs detallados**: Puedes ver qué tenants se actualizaron  
✅ **Manejo de errores**: Si falla la actualización de un tenant, no bloquea el resto  

## Consideraciones Importantes

### ⚠️ Límites Personalizados

Si un tenant tiene límites personalizados (diferentes al plan), esta actualización los **sobrescribirá** con los límites del plan.

**Solución futura:** Agregar un flag `hasCustomLimits` para identificar tenants con límites personalizados y no actualizarlos automáticamente.

### ⚠️ Tenants con Uso Mayor al Nuevo Límite

Si un tenant está usando más recursos que el nuevo límite:

**Ejemplo:** Un tenant tiene 8 usuarios y reduces el límite a 5:

- ✅ Los usuarios existentes **NO se eliminan**
- ⚠️ El tenant **NO podrá crear nuevos usuarios** hasta que esté por debajo del límite
- 📊 En "Mi Plan" verá "8 / 5" (160%) con alerta roja

## Pruebas

Para probar la funcionalidad, ejecuta:

```bash
cd backend
npx ts-node test-plan-sync.ts
```

Este script:
1. Obtiene el Plan Básico actual
2. Busca todos los tenants con ese plan
3. Modifica los límites del plan
4. Verifica que todos los tenants se actualizaron
5. Restaura los valores originales

## Archivos Relacionados

### Backend:
- `backend/src/plans/plans.service.ts` - Lógica de sincronización
- `backend/src/tenants/tenants.service.ts` - Métodos de actualización
- `backend/src/plans/plans.module.ts` - Configuración de dependencias
- `backend/test-plan-sync.ts` - Script de prueba

### Frontend:
- `frontend/src/pages/PlansManagementPage.tsx` - Interfaz de gestión
- `frontend/src/pages/MyPlanPage.tsx` - Vista de tenant

### Documentación:
- `SINCRONIZACION_PLANES_TENANTS.md` - Documentación técnica completa

## Soporte

Si tienes problemas:

1. **Verifica los logs del backend** para ver si hay errores
2. **Recarga la página** del tenant (`Ctrl + Shift + R`)
3. **Verifica que el tenant tenga el plan correcto** asignado
4. **Ejecuta el script de prueba** para verificar que la funcionalidad está activa

## Estado

✅ **IMPLEMENTADO Y PROBADO**

La funcionalidad está completamente operativa y ha sido probada exitosamente con 3 tenants.
