# Análisis del Sistema de Límites de Recursos y Notificaciones

## 📊 Estado Actual de la Implementación

### ✅ Backend: IMPLEMENTADO CORRECTAMENTE

#### 1. Helper de Validación (`resource-limits.helper.ts`)

**Ubicación:** `backend/src/common/helpers/resource-limits.helper.ts`

**Funcionalidades:**
- ✅ Validación de límites por recurso (usuarios, sedes, consentimientos, servicios, preguntas)
- ✅ Cálculo de porcentaje de uso
- ✅ Detección de recursos cerca del límite (>= 80%)
- ✅ Detección de recursos en el límite (>= 100%)
- ✅ Clasificación de estado (normal, warning, critical)
- ✅ Mensajes de error personalizados

**Métodos Principales:**
```typescript
- validateUserLimit()
- validateBranchLimit()
- validateConsentLimit()
- validateServiceLimit()
- validateQuestionLimit()
- calculateUsagePercentage()
- isNearLimit()
- isAtLimit()
- getUsageStatus()
```

#### 2. Uso en Servicios

**Servicios que validan límites:**
- ✅ `users.service.ts` - Valida antes de crear usuarios
- ✅ `branches.service.ts` - Valida antes de crear sedes
- ✅ `services.service.ts` - Valida antes de crear servicios
- ✅ `questions.service.ts` - Valida antes de crear preguntas

**Ejemplo de implementación:**
```typescript
// En users.service.ts
async create(createUserDto: CreateUserDto) {
  // VALIDAR LÍMITE DE USUARIOS ANTES DE CREAR
  if (tenantId) {
    await this.checkUserLimit(tenantId);
  }
  // ... crear usuario
}

private async checkUserLimit(tenantId: string): Promise<void> {
  const tenant = await this.tenantsRepository.findOne({
    where: { id: tenantId },
    relations: ['users'],
  });
  
  const currentCount = tenant.users?.filter(u => !u.deletedAt).length || 0;
  ResourceLimitsHelper.validateUserLimit(tenant, currentCount);
}
```

**Comportamiento:**
- ✅ Lanza `ForbiddenException` (403) cuando se alcanza el límite
- ✅ Incluye información detallada del error:
  ```json
  {
    "message": "Has alcanzado el límite de usuarios (5/5)",
    "error": "RESOURCE_LIMIT_REACHED",
    "resourceType": "usuarios",
    "current": 5,
    "max": 5
  }
  ```

---

### ⚠️ Frontend: PARCIALMENTE IMPLEMENTADO (ACTUALIZADO: ✅ COMPLETAMENTE INTEGRADO)

#### 1. Hook de Notificaciones (`useResourceLimitNotifications.ts`)

**Ubicación:** `frontend/src/hooks/useResourceLimitNotifications.ts`

**Estado:** ✅ IMPLEMENTADO

**Funcionalidades:**
- ✅ Obtiene límites de recursos del tenant
- ✅ Calcula porcentajes de uso
- ✅ Genera alertas según umbrales:
  - 70-89%: Warning (Advertencia)
  - 90-99%: Critical (Crítico)
  - 100%+: Blocked (Bloqueado)
- ✅ Método para verificar si se puede crear un recurso
- ✅ Método para refrescar límites

#### 2. Componente de Banner (`ResourceLimitBanner.tsx`)

**Ubicación:** `frontend/src/components/ResourceLimitBanner.tsx`

**Estado:** ✅ IMPLEMENTADO

**Características:**
- ✅ Banner amarillo para advertencias (70-89%)
- ✅ Banner naranja animado para críticos (90-99%)
- ✅ Banner rojo para bloqueados (100%)
- ✅ Barra de progreso visual
- ✅ Botones de acción:
  - Contactar Soporte (email)
  - Ver Planes
- ✅ Botón para descartar notificación

#### 3. Componente Contenedor (`ResourceLimitNotifications.tsx`)

**Ubicación:** `frontend/src/components/ResourceLimitNotifications.tsx`

**Estado:** ✅ IMPLEMENTADO

**Funcionalidad:**
- ✅ Usa el hook `useResourceLimitNotifications`
- ✅ Ordena alertas por severidad
- ✅ Renderiza múltiples banners si hay varias alertas

#### 4. Utilidades de Manejo de Errores (`resource-limit-handler.ts`)

**Ubicación:** `frontend/src/utils/resource-limit-handler.ts`

**Estado:** ✅ IMPLEMENTADO

**Funcionalidades:**
- ✅ Detecta errores de límite de recursos
- ✅ Parsea información del error
- ✅ Muestra mensajes de error
- ✅ Genera mensajes de ayuda

---

## ✅ INTEGRACIÓN COMPLETADA (Enero 2026)

### Estado Final: SISTEMA COMPLETAMENTE FUNCIONAL

#### 1. ✅ Layout - INTEGRADO
**Archivo:** `frontend/src/components/Layout.tsx`
- ✅ `ResourceLimitNotifications` agregado después de `PaymentReminderBanner`
- ✅ Notificaciones visibles en todas las páginas del sistema
- ✅ Banners de advertencia (70%, 90%, 100%) funcionando

#### 2. ✅ UsersPage - INTEGRADO
**Archivo:** `frontend/src/pages/UsersPage.tsx`
- ✅ Hook `useResourceLimitNotifications` importado y en uso
- ✅ Función `handleCreateUser()` con validación preventiva
- ✅ Manejo de errores con `isResourceLimitError()` y `parseResourceLimitError()`
- ✅ `refreshLimits()` llamado después de crear usuario exitosamente
- ✅ Mensajes de advertencia y error personalizados

#### 3. ✅ BranchesPage - INTEGRADO
**Archivo:** `frontend/src/pages/BranchesPage.tsx`
- ✅ Hook `useResourceLimitNotifications` importado y en uso
- ✅ Función `handleCreateBranch()` con validación preventiva
- ✅ Manejo de errores con `isResourceLimitError()` y `parseResourceLimitError()`
- ✅ `refreshLimits()` llamado después de crear sede exitosamente
- ✅ Modal `ResourceLimitModal` para errores de límite

#### 4. ✅ ServicesPage - INTEGRADO
**Archivo:** `frontend/src/pages/ServicesPage.tsx`
- ✅ Hook `useResourceLimitNotifications` importado y en uso
- ✅ Función `handleCreateService()` con validación preventiva
- ✅ Manejo de errores con `isResourceLimitError()` y `parseResourceLimitError()`
- ✅ `refreshLimits()` llamado después de crear servicio exitosamente
- ✅ Mensajes de advertencia y error personalizados

### 🎯 Sistema Listo para Usar

El sistema de límites de recursos está completamente integrado y funcional:

- ✅ Notificaciones en tiempo real en el Layout
- ✅ Validación preventiva antes de crear recursos
- ✅ Manejo de errores consistente
- ✅ Refresh automático de límites
- ✅ Mensajes claros y amigables para el usuario

### 🔄 Mejoras Futuras (Opcionales)

1. **Mejorar UX de notificaciones**
   - Reemplazar `window.alert()` y `window.confirm()` con toast notifications
   - Considerar usar `react-hot-toast` o `sonner`

2. **Agregar animaciones**
   - Transiciones suaves para banners
   - Efectos visuales para alertas

3. **Dashboard de uso**
   - Página dedicada para ver uso de recursos
   - Gráficos de consumo por recurso

---

## ❌ PROBLEMA IDENTIFICADO (RESUELTO): Componentes NO Integrados

### El componente `ResourceLimitNotifications` NO se está usando en ninguna parte

**Búsqueda realizada:**
```bash
# Buscar uso del componente
grep -r "ResourceLimitNotifications" frontend/src/
# Resultado: Solo aparece en su propia definición
```

**Impacto:**
- ❌ Los usuarios NO ven notificaciones proactivas cuando se acercan a los límites
- ❌ Solo ven errores cuando intentan crear un recurso y ya alcanzaron el límite
- ❌ No hay advertencias preventivas (70%, 90%)

---

## 🔧 Solución Propuesta

### 1. Integrar Notificaciones en el Layout Principal

**Archivo:** `frontend/src/components/Layout.tsx`

**Agregar:**
```typescript
import ResourceLimitNotifications from '@/components/ResourceLimitNotifications';

// Dentro del componente Layout, después del PaymentReminderBanner:
<PaymentReminderBanner />
<ResourceLimitNotifications />
```

### 2. Integrar Validación Preventiva en Formularios

**Archivos a modificar:**
- `frontend/src/pages/UsersPage.tsx` - Antes de abrir modal de crear usuario
- `frontend/src/pages/BranchesPage.tsx` - Antes de abrir modal de crear sede
- `frontend/src/pages/ServicesPage.tsx` - Antes de abrir modal de crear servicio

**Ejemplo:**
```typescript
import { useResourceLimitNotifications } from '@/hooks/useResourceLimitNotifications';

function UsersPage() {
  const { checkResourceLimit } = useResourceLimitNotifications();
  
  const handleCreateUser = () => {
    const { canCreate, alert } = checkResourceLimit('users');
    
    if (!canCreate) {
      // Mostrar mensaje de error
      toast.error(
        `Has alcanzado el límite de usuarios (${alert.current}/${alert.max}). ` +
        `Por favor, contacta al administrador para actualizar tu plan.`
      );
      return;
    }
    
    if (alert && alert.level === 'critical') {
      // Mostrar advertencia pero permitir crear
      toast.warning(
        `Estás cerca del límite de usuarios (${alert.current}/${alert.max}). ` +
        `Considera actualizar tu plan pronto.`
      );
    }
    
    // Abrir modal de crear usuario
    setShowCreateModal(true);
  };
  
  // ...
}
```

### 3. Mejorar Manejo de Errores en Formularios

**Agregar en cada formulario de creación:**
```typescript
import { isResourceLimitError, showResourceLimitError } from '@/utils/resource-limit-handler';

try {
  await createUser(data);
  toast.success('Usuario creado exitosamente');
} catch (error) {
  if (isResourceLimitError(error)) {
    showResourceLimitError(error);
  } else {
    toast.error('Error al crear usuario');
  }
}
```

---

## 📋 Checklist de Implementación

### Backend ✅
- [x] Helper de validación de límites
- [x] Validación en UsersService
- [x] Validación en BranchesService
- [x] Validación en ServicesService
- [x] Validación en QuestionsService
- [x] Mensajes de error descriptivos
- [x] Códigos de error estructurados

### Frontend ✅ COMPLETADO
- [x] Hook useResourceLimitNotifications
- [x] Componente ResourceLimitBanner
- [x] Componente ResourceLimitNotifications
- [x] Utilidades de manejo de errores
- [x] **INTEGRADO:** Integración en Layout
- [x] **INTEGRADO:** Validación preventiva en UsersPage
- [x] **INTEGRADO:** Validación preventiva en BranchesPage
- [x] **INTEGRADO:** Validación preventiva en ServicesPage
- [x] **INTEGRADO:** Manejo de errores con utilidades
- [x] **INTEGRADO:** Refresh automático de límites

---

## 🎯 Umbrales de Notificación

### Niveles de Alerta:

| Porcentaje | Nivel | Color | Comportamiento |
|------------|-------|-------|----------------|
| 0-69% | Normal | - | Sin notificación |
| 70-89% | Warning | Amarillo | Banner de advertencia |
| 90-99% | Critical | Naranja | Banner crítico animado |
| 100%+ | Blocked | Rojo | Banner de bloqueo + Prevenir creación |

### Acciones Sugeridas por Nivel:

**Warning (70-89%):**
- Mostrar banner informativo
- Sugerir contactar soporte
- Permitir todas las operaciones

**Critical (90-99%):**
- Mostrar banner crítico animado
- Urgir contacto con administrador
- Mostrar advertencia en formularios
- Permitir operaciones con advertencia

**Blocked (100%):**
- Mostrar banner de bloqueo
- Prevenir creación de nuevos recursos
- Mostrar error en formularios
- Forzar contacto con administrador

---

## 📊 Ejemplo de Flujo Completo

### Escenario: Usuario intenta crear un nuevo usuario

1. **Usuario hace clic en "Crear Usuario"**
   - Frontend verifica límite con `checkResourceLimit('users')`
   - Si está en 100%: Muestra error y no abre modal
   - Si está en 90-99%: Muestra advertencia pero permite continuar
   - Si está en 0-89%: Abre modal normalmente

2. **Usuario llena el formulario y envía**
   - Frontend envía petición al backend
   - Backend valida límite con `ResourceLimitsHelper.validateUserLimit()`
   - Si alcanzó límite: Lanza `ForbiddenException` (403)
   - Si no: Crea el usuario

3. **Frontend recibe respuesta**
   - Si es error 403 de límite: Muestra mensaje específico
   - Si es éxito: Muestra confirmación y refresca límites
   - Actualiza notificaciones en el Layout

4. **Sistema muestra notificaciones**
   - Si ahora está en 70%+: Aparece banner en el Layout
   - Banner se actualiza automáticamente
   - Usuario puede ver su uso en "Mi Plan"

---

## 🔍 Verificación del Sistema

### Para verificar que todo funciona:

1. **Backend:**
   ```bash
   # Intentar crear un usuario cuando el límite está alcanzado
   curl -X POST http://localhost:3000/api/users \
     -H "Authorization: Bearer TOKEN" \
     -d '{"name":"Test","email":"test@test.com"}'
   
   # Debe retornar 403 con mensaje de límite
   ```

2. **Frontend:**
   ```typescript
   // En la consola del navegador
   const { alerts, limits } = useResourceLimitNotifications();
   console.log('Alertas:', alerts);
   console.log('Límites:', limits);
   ```

3. **Página "Mi Plan":**
   - Debe mostrar barras de progreso
   - Debe mostrar alertas si está cerca del límite
   - Debe mostrar porcentajes correctos

---

## 📝 Recomendaciones

### Mejoras Sugeridas:

1. **Notificaciones Toast:**
   - Usar una librería como `react-hot-toast` o `sonner`
   - Mostrar notificaciones temporales en lugar de alerts

2. **Modal de Confirmación:**
   - Cuando está en nivel crítico, mostrar modal antes de crear
   - Explicar consecuencias de alcanzar el límite

3. **Dashboard de Uso:**
   - Agregar sección en el dashboard principal
   - Mostrar gráficos de uso de recursos
   - Proyectar cuándo se alcanzará el límite

4. **Emails de Notificación:**
   - Enviar email cuando se alcanza 80%
   - Enviar email cuando se alcanza 95%
   - Enviar email cuando se alcanza 100%

5. **Historial de Uso:**
   - Registrar cuándo se alcanzan umbrales
   - Mostrar tendencias de uso
   - Alertar sobre crecimientos anormales

---

## 🎨 Mejoras de UX

### Sugerencias de Interfaz:

1. **Indicador en el Menú:**
   - Badge rojo en "Usuarios" si está en límite
   - Badge naranja si está cerca del límite

2. **Tooltip Informativo:**
   - Al pasar el mouse sobre "Crear Usuario"
   - Mostrar: "3 de 5 usuarios disponibles"

3. **Página de Upgrade:**
   - Crear página dedicada para comparar planes
   - Mostrar beneficios de actualizar
   - Proceso simplificado de contacto

4. **Animaciones:**
   - Pulsar botones cuando hay alertas críticas
   - Shake en formularios cuando se intenta crear en límite
   - Fade in/out suave de notificaciones

---

## 📚 Documentación Relacionada

- `doc/05-limites/IMPLEMENTACION_PLANES_PRICING.md` - Implementación de planes
- `doc/05-limites/RESUMEN_IMPLEMENTACION_PLANES.md` - Resumen de límites
- `frontend/src/pages/MyPlanPage.tsx` - Página de visualización de plan
- `backend/src/tenants/tenants.service.ts` - Servicio de gestión de tenants

---

## ✅ Conclusión

El sistema de límites de recursos está **completamente implementado e integrado** tanto en backend como en frontend.

### Backend ✅
- Validaciones robustas y mensajes de error claros
- Helper `ResourceLimitsHelper` funcionando correctamente
- Validaciones en todos los servicios relevantes

### Frontend ✅
- Componentes de notificación integrados en Layout
- Validación preventiva en formularios de creación
- Manejo de errores consistente con utilidades
- Refresh automático de límites después de crear recursos
- Experiencia de usuario completa y funcional

**Estado:** Sistema listo para producción. Los usuarios reciben notificaciones proactivas cuando se acercan a los límites y validaciones preventivas antes de intentar crear recursos.
