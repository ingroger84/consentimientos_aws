# Control de Límites de Recursos por Tenant

**Fecha:** 7 de enero de 2026  
**Estado:** ✅ IMPLEMENTADO

---

## 🎯 Objetivo

Implementar un sistema robusto que impida a los usuarios de los tenants consumir más recursos de los asignados por su plan, mostrando mensajes claros cuando alcancen los límites.

---

## 🏗️ Arquitectura de la Solución

### Enfoque Multi-Capa

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
├─────────────────────────────────────────────────────────┤
│  1. Hook useResourceLimit()                             │
│     - Detecta errores de límite                         │
│     - Muestra modal informativo                         │
│                                                          │
│  2. Componente ResourceLimitModal                       │
│     - UI elegante para mostrar error                    │
│     - Botón para contactar soporte                      │
│                                                          │
│  3. Utilidades resource-limit-handler.ts                │
│     - Parseo de errores                                 │
│     - Mensajes de ayuda                                 │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Request
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND                               │
├─────────────────────────────────────────────────────────┤
│  1. ResourceLimitGuard                                  │
│     - Intercepta requests de creación                   │
│     - Consulta límites del tenant                       │
│     - Bloquea si se alcanzó el límite                   │
│                                                          │
│  2. Decorador @CheckResourceLimit()                     │
│     - Marca endpoints que deben validar límites         │
│     - Especifica tipo de recurso                        │
│                                                          │
│  3. Controllers (Users, Branches, Consents)             │
│     - Aplican guard y decorador                         │
│     - Retornan error 403 con mensaje descriptivo        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementación Backend

### 1. Guard de Límites de Recursos

**Archivo:** `backend/src/common/guards/resource-limit.guard.ts`

**Funcionalidad:**
- Intercepta requests de creación de recursos
- Consulta el tenant con sus relaciones (users, branches, consents)
- Compara cantidad actual vs límite máximo
- Bloquea la operación si se alcanzó el límite
- Retorna error 403 con mensaje descriptivo

**Código clave:**
```typescript
@Injectable()
export class ResourceLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceType = this.reflector.get<ResourceType>(
      RESOURCE_TYPE_KEY,
      context.getHandler(),
    );

    const user = request.user;

    // Super Admin no tiene límites
    if (!user.tenantId) {
      return true;
    }

    // Obtener tenant con relaciones
    const tenant = await this.tenantsRepository.findOne({
      where: { id: user.tenantId },
      relations: ['users', 'branches', 'consents'],
    });

    // Verificar límites
    const currentCount = this.getCurrentCount(tenant, resourceType);
    const maxLimit = this.getMaxLimit(tenant, resourceType);

    if (currentCount >= maxLimit) {
      throw new ForbiddenException(
        `Has alcanzado el límite máximo de ${resourceName} permitidos (${currentCount}/${maxLimit}). ` +
        `Por favor, contacta al administrador para aumentar tu límite.`
      );
    }

    return true;
  }
}
```

### 2. Decorador de Límites

**Archivo:** `backend/src/common/decorators/resource-limit.decorator.ts`

```typescript
export const CheckResourceLimit = (resourceType: ResourceType) =>
  SetMetadata(RESOURCE_TYPE_KEY, resourceType);
```

### 3. Aplicación en Controllers

**Usuarios:**
```typescript
@Post()
@UseGuards(PermissionsGuard, ResourceLimitGuard)
@RequirePermissions(PERMISSIONS.CREATE_USERS)
@CheckResourceLimit('users')
create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: User) {
  // ...
}
```

**Sedes:**
```typescript
@Post()
@UseGuards(PermissionsGuard, ResourceLimitGuard)
@RequirePermissions(PERMISSIONS.CREATE_BRANCHES)
@CheckResourceLimit('branches')
create(@Body() createBranchDto: CreateBranchDto, @CurrentUser() user: User) {
  // ...
}
```

**Consentimientos:**
```typescript
@Post()
@UseGuards(PermissionsGuard, ResourceLimitGuard)
@RequirePermissions(PERMISSIONS.CREATE_CONSENTS)
@CheckResourceLimit('consents')
create(@Body() createConsentDto: CreateConsentDto, @CurrentUser() user: User) {
  // ...
}
```

---

## 🎨 Implementación Frontend

### 1. Hook useResourceLimit

**Archivo:** `frontend/src/hooks/useResourceLimit.ts`

**Funcionalidad:**
- Detecta errores de límite de recursos (403)
- Extrae información del error (tipo, mensaje, límites)
- Controla el estado del modal
- Retorna funciones para manejar errores

**Uso:**
```typescript
const { showLimitModal, limitError, handleResourceLimitError, closeLimitModal } = useResourceLimit();

const createMutation = useMutation({
  mutationFn: userService.create,
  onSuccess: () => {
    // ...
  },
  onError: (error) => {
    if (!handleResourceLimitError(error)) {
      // Manejar otros errores
      alert('Error al crear usuario');
    }
  },
});
```

### 2. Componente ResourceLimitModal

**Archivo:** `frontend/src/components/ResourceLimitModal.tsx`

**Características:**
- UI elegante con iconos y colores
- Muestra límite actual vs máximo
- Barra de progreso al 100%
- Instrucciones claras para el usuario
- Botón para contactar soporte
- Botón para cerrar

**Props:**
```typescript
interface ResourceLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: 'users' | 'branches' | 'consents';
  currentCount: number;
  maxLimit: number;
}
```

### 3. Utilidades

**Archivo:** `frontend/src/utils/resource-limit-handler.ts`

**Funciones:**
- `isResourceLimitError()` - Detecta si es error de límite
- `parseResourceLimitError()` - Extrae información del error
- `showResourceLimitError()` - Muestra alert simple
- `getResourceName()` - Obtiene nombre amigable del recurso
- `getResourceLimitHelpMessage()` - Genera mensaje de ayuda

---

## 📝 Ejemplo de Integración Completa

### UsersPage.tsx

```typescript
import { useResourceLimit } from '@/hooks/useResourceLimit';
import ResourceLimitModal from '@/components/ResourceLimitModal';

export default function UsersPage() {
  const { showLimitModal, limitError, handleResourceLimitError, closeLimitModal } = useResourceLimit();

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      reset();
    },
    onError: (error) => {
      if (!handleResourceLimitError(error)) {
        // Manejar otros errores
        alert('Error al crear usuario');
      }
    },
  });

  return (
    <div>
      {/* ... resto del componente ... */}

      {/* Modal de Límite de Recursos */}
      {showLimitModal && limitError && (
        <ResourceLimitModal
          isOpen={showLimitModal}
          onClose={closeLimitModal}
          resourceType={limitError.resourceType}
          currentCount={limitError.currentCount}
          maxLimit={limitError.maxLimit}
        />
      )}
    </div>
  );
}
```

---

## 🎯 Flujo Completo

### Caso: Usuario intenta crear un usuario cuando ya alcanzó el límite

```
1. USUARIO
   │
   ├─ Hace clic en "Nuevo Usuario"
   ├─ Completa formulario
   ├─ Hace clic en "Crear"
   │
   ▼
2. FRONTEND
   │
   ├─ Llama a userService.create()
   ├─ Envía POST /api/users
   │
   ▼
3. BACKEND - ResourceLimitGuard
   │
   ├─ Intercepta el request
   ├─ Obtiene tenantId del usuario
   ├─ Consulta tenant con relaciones
   ├─ Cuenta usuarios actuales: 100
   ├─ Obtiene límite máximo: 100
   ├─ Compara: 100 >= 100 ✓
   ├─ Lanza ForbiddenException
   │
   ▼
4. BACKEND - Response
   │
   ├─ Status: 403 Forbidden
   ├─ Message: "Has alcanzado el límite máximo de usuarios permitidos (100/100)..."
   │
   ▼
5. FRONTEND - onError
   │
   ├─ handleResourceLimitError(error)
   ├─ Detecta error 403 con mensaje de límite
   ├─ Extrae: resourceType='users', current=100, max=100
   ├─ Muestra ResourceLimitModal
   │
   ▼
6. USUARIO
   │
   ├─ Ve modal elegante con:
   │  - Icono de alerta
   │  - Mensaje claro
   │  - Barra de progreso al 100%
   │  - Instrucciones de qué hacer
   │  - Botón "Contactar Soporte"
   │  - Botón "Entendido"
   │
   └─ Hace clic en "Contactar Soporte"
      └─ Se abre email a soporte@sistema.com
```

---

## 🔒 Seguridad

### 1. Validación en Backend
✅ **Nunca confiar en el frontend**
- Todos los límites se validan en el backend
- El frontend solo muestra mensajes amigables

### 2. Super Admin Sin Límites
✅ **Super Admin puede crear recursos ilimitados**
```typescript
// Super Admin no tiene límites
if (!user.tenantId) {
  return true;
}
```

### 3. Aislamiento por Tenant
✅ **Cada tenant solo ve sus propios recursos**
- Los límites se calculan solo con recursos del tenant
- No se cuentan recursos de otros tenants

---

## 📊 Mensajes de Error

### Usuarios
```
Has alcanzado el límite máximo de usuarios permitidos (100/100).
Por favor, contacta al administrador para aumentar tu límite o 
considera actualizar tu plan.
```

### Sedes
```
Has alcanzado el límite máximo de sedes permitidos (5/5).
Por favor, contacta al administrador para aumentar tu límite o 
considera actualizar tu plan.
```

### Consentimientos
```
Has alcanzado el límite máximo de consentimientos permitidos (1000/1000).
Por favor, contacta al administrador para aumentar tu límite o 
considera actualizar tu plan.
```

---

## 🧪 Cómo Probar

### Paso 1: Crear un Tenant con Límites Bajos
```typescript
// Crear tenant con límites bajos para pruebas
{
  name: "Tenant Prueba",
  slug: "tenant-prueba",
  maxUsers: 2,
  maxBranches: 2,
  maxConsents: 5,
  // ...
}
```

### Paso 2: Crear Recursos Hasta el Límite
1. Login como usuario del tenant
2. Crear 2 usuarios (alcanza el límite)
3. Intentar crear un tercer usuario
4. **Resultado esperado:** Modal de límite alcanzado

### Paso 3: Verificar Mensaje
- ✅ Modal se muestra
- ✅ Mensaje claro y descriptivo
- ✅ Números correctos (2/2)
- ✅ Barra de progreso al 100%
- ✅ Botón "Contactar Soporte" funciona

### Paso 4: Verificar Backend
```bash
# En logs del backend debería aparecer:
[ResourceLimitGuard] Tenant tenant-prueba alcanzó límite de users: 2/2
```

---

## 📁 Archivos Creados/Modificados

### Backend
- ✅ `backend/src/common/guards/resource-limit.guard.ts` (nuevo)
- ✅ `backend/src/common/decorators/resource-limit.decorator.ts` (nuevo)
- ✅ `backend/src/users/users.controller.ts` (modificado)
- ✅ `backend/src/users/users.module.ts` (modificado)
- ✅ `backend/src/branches/branches.controller.ts` (modificado)
- ✅ `backend/src/branches/branches.module.ts` (modificado)
- ✅ `backend/src/consents/consents.controller.ts` (modificado)
- ✅ `backend/src/consents/consents.module.ts` (modificado)

### Frontend
- ✅ `frontend/src/hooks/useResourceLimit.ts` (nuevo)
- ✅ `frontend/src/components/ResourceLimitModal.tsx` (nuevo)
- ✅ `frontend/src/utils/resource-limit-handler.ts` (nuevo)
- ⏳ `frontend/src/pages/UsersPage.tsx` (pendiente integración)
- ⏳ `frontend/src/pages/BranchesPage.tsx` (pendiente integración)
- ⏳ `frontend/src/pages/ConsentsPage.tsx` (pendiente integración)

---

## 🚀 Próximos Pasos

### 1. Integrar Hook en Páginas
Agregar `useResourceLimit()` y `ResourceLimitModal` en:
- UsersPage.tsx
- BranchesPage.tsx (si existe)
- ConsentsPage.tsx

### 2. Probar con Diferentes Planes
- Plan Free: Límites bajos
- Plan Basic: Límites medios
- Plan Professional: Límites altos
- Plan Enterprise: Límites muy altos

### 3. Agregar Métricas
- Registrar cuántas veces se alcanza cada límite
- Identificar tenants que necesitan upgrade
- Generar reportes de uso

---

## 💡 Mejoras Futuras (Opcional)

### 1. Notificaciones Proactivas
- Enviar email cuando se alcance 80% del límite
- Notificar al Super Admin de tenants cerca del límite

### 2. Soft Limits vs Hard Limits
- Soft Limit (80%): Advertencia pero permite crear
- Hard Limit (100%): Bloquea creación

### 3. Límites Temporales
- Permitir exceder límite por X días
- Útil para períodos de prueba o promociones

### 4. Auto-Upgrade
- Sugerir plan óptimo basado en uso
- Botón para solicitar upgrade directamente

---

## ✅ Checklist de Verificación

- [x] Guard de límites implementado
- [x] Decorador implementado
- [x] Controllers actualizados
- [x] Módulos actualizados con Tenant repository
- [x] Hook useResourceLimit creado
- [x] Componente ResourceLimitModal creado
- [x] Utilidades de manejo de errores creadas
- [ ] Hook integrado en UsersPage
- [ ] Hook integrado en BranchesPage
- [ ] Hook integrado en ConsentsPage
- [ ] Pruebas realizadas
- [ ] Documentación actualizada

---

## 📞 Soporte

Si el sistema de límites no funciona:

1. Verificar que el guard esté aplicado en el controller
2. Verificar que el decorador esté presente
3. Verificar que el módulo incluya Tenant repository
4. Verificar logs del backend para ver si el guard se ejecuta
5. Verificar que el error 403 llegue al frontend
6. Verificar que el hook detecte el error correctamente

---

**¡El sistema de control de límites está listo para usar! 🎉**

