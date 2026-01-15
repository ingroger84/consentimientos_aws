# 🔔 Implementación de Notificaciones de Límites de Recursos

**Fecha:** 7 de enero de 2026  
**Estado:** ✅ IMPLEMENTADO

---

## 🎯 Objetivo

Implementar un sistema de notificaciones proactivas que alerte a los usuarios cuando estén cerca de alcanzar sus límites de recursos, mejorando la experiencia de usuario y evitando sorpresas.

---

## 📊 Niveles de Alerta

### 1. Normal (0-69%)
- ✅ Sin alertas
- ✅ Indicador verde
- ✅ Usuario puede crear recursos libremente

### 2. Advertencia (70-89%)
- ⚠️ Banner amarillo
- ⚠️ Mensaje: "Te estás acercando al límite"
- ⚠️ Sugerencia de actualizar plan
- ✅ Usuario aún puede crear recursos

### 3. Crítico (90-99%)
- 🔴 Banner naranja con animación
- 🔴 Mensaje: "¡Límite casi alcanzado!"
- 🔴 Llamado urgente a contactar administrador
- ✅ Usuario aún puede crear recursos (pero con advertencia)

### 4. Bloqueado (100%)
- 🚫 Banner rojo
- 🚫 Modal de bloqueo
- 🚫 Mensaje: "Límite alcanzado"
- ❌ Usuario NO puede crear más recursos

---

## 🧩 Componentes Implementados

### 1. ResourceLimitBanner
**Ubicación:** `frontend/src/components/ResourceLimitBanner.tsx`

Banner que se muestra en la parte superior de las páginas cuando el usuario está cerca del límite.

**Características:**
- Colores adaptativos según el nivel (amarillo, naranja, rojo)
- Barra de progreso visual
- Botones de acción (Contactar Soporte, Ver Planes)
- Puede ser descartado por el usuario
- Animación en nivel crítico

**Props:**
```typescript
interface ResourceLimitBannerProps {
  resourceType: 'users' | 'branches' | 'consents' | 'services';
  currentCount: number;
  maxLimit: number;
  onDismiss?: () => void;
}
```

**Ejemplo de uso:**
```tsx
<ResourceLimitBanner
  resourceType="users"
  currentCount={4}
  maxLimit={5}
  onDismiss={() => console.log('Banner descartado')}
/>
```

---

### 2. ResourceLimitModal
**Ubicación:** `frontend/src/components/ResourceLimitModal.tsx`

Modal que se muestra cuando el usuario intenta crear un recurso y está en nivel crítico o bloqueado.

**Características:**
- Diseño adaptativo según el nivel (warning, critical, blocked)
- Información detallada del límite
- Opciones de contacto (email, teléfono)
- Enlace a planes disponibles
- Botón de contacto con email pre-rellenado

**Props:**
```typescript
interface ResourceLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: 'users' | 'branches' | 'consents' | 'services';
  currentCount: number;
  maxLimit: number;
  level?: 'warning' | 'critical' | 'blocked';
}
```

**Ejemplo de uso:**
```tsx
<ResourceLimitModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  resourceType="branches"
  currentCount={5}
  maxLimit={5}
  level="blocked"
/>
```

---

### 3. ResourceLimitIndicator
**Ubicación:** `frontend/src/components/ResourceLimitIndicator.tsx`

Indicador compacto que muestra el uso actual de un recurso con barra de progreso.

**Características:**
- Tres tamaños disponibles (sm, md, lg)
- Colores adaptativos según el nivel
- Iconos visuales (CheckCircle, AlertTriangle, AlertCircle)
- Muestra cantidad disponible
- Puede ocultar etiquetas para diseños compactos

**Props:**
```typescript
interface ResourceLimitIndicatorProps {
  current: number;
  max: number;
  resourceType: 'users' | 'branches' | 'consents' | 'services';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

**Ejemplo de uso:**
```tsx
<ResourceLimitIndicator
  current={4}
  max={5}
  resourceType="users"
  showLabel={true}
  size="md"
/>
```

---

### 4. ResourceLimitNotifications
**Ubicación:** `frontend/src/components/ResourceLimitNotifications.tsx`

Componente contenedor que muestra todas las alertas activas del tenant.

**Características:**
- Carga automática de límites del tenant
- Ordena alertas por severidad
- Muestra múltiples alertas simultáneamente
- Se actualiza automáticamente

**Ejemplo de uso:**
```tsx
// En el Dashboard o Layout principal
<ResourceLimitNotifications />
```

---

### 5. useResourceLimitNotifications (Hook)
**Ubicación:** `frontend/src/hooks/useResourceLimitNotifications.ts`

Hook personalizado para gestionar las notificaciones de límites.

**Características:**
- Carga automática de límites del tenant
- Genera alertas según porcentajes
- Verifica si se puede crear un recurso
- Función para refrescar límites
- Indicadores de alertas críticas

**API:**
```typescript
const {
  alerts,              // Array de alertas activas
  limits,              // Límites actuales del tenant
  checkResourceLimit,  // Función para verificar límite
  refreshLimits,       // Función para refrescar
  hasAlerts,           // Boolean: tiene alertas
  hasCriticalAlerts,   // Boolean: tiene alertas críticas
} = useResourceLimitNotifications();
```

**Ejemplo de uso:**
```tsx
function UsersPage() {
  const { checkResourceLimit, refreshLimits } = useResourceLimitNotifications();

  const handleCreateUser = () => {
    const { canCreate, alert } = checkResourceLimit('users');
    
    if (!canCreate) {
      // Mostrar modal de bloqueo
      setShowLimitModal(true);
      return;
    }
    
    if (alert && alert.level === 'critical') {
      // Mostrar advertencia pero permitir crear
      setShowWarningModal(true);
    }
    
    // Continuar con la creación
    createUser();
  };

  return (
    <div>
      <ResourceLimitNotifications />
      {/* Resto del contenido */}
    </div>
  );
}
```

---

## 🎨 Integración en Páginas

### Ejemplo 1: Dashboard Principal

```tsx
import ResourceLimitNotifications from '../components/ResourceLimitNotifications';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Notificaciones globales */}
      <ResourceLimitNotifications />
      
      {/* Resto del dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cards del dashboard */}
      </div>
    </div>
  );
}
```

---

### Ejemplo 2: Página de Usuarios

```tsx
import { useState } from 'react';
import { useResourceLimitNotifications } from '../hooks/useResourceLimitNotifications';
import ResourceLimitIndicator from '../components/ResourceLimitIndicator';
import ResourceLimitModal from '../components/ResourceLimitModal';

export default function UsersPage() {
  const { limits, checkResourceLimit, refreshLimits } = useResourceLimitNotifications();
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleCreateUser = () => {
    const { canCreate, alert } = checkResourceLimit('users');
    
    if (!canCreate) {
      setShowLimitModal(true);
      return;
    }
    
    // Continuar con la creación
    // ...
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Indicador de límite */}
      {limits && (
        <div className="mb-6">
          <ResourceLimitIndicator
            current={limits.users.current}
            max={limits.users.max}
            resourceType="users"
            size="lg"
          />
        </div>
      )}

      {/* Botón de crear */}
      <button
        onClick={handleCreateUser}
        className="btn btn-primary"
        disabled={limits && limits.users.current >= limits.users.max}
      >
        Crear Usuario
      </button>

      {/* Modal de límite */}
      {limits && (
        <ResourceLimitModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          resourceType="users"
          currentCount={limits.users.current}
          maxLimit={limits.users.max}
          level="blocked"
        />
      )}

      {/* Lista de usuarios */}
      {/* ... */}
    </div>
  );
}
```

---

### Ejemplo 3: Página de Sedes

```tsx
import { useState, useEffect } from 'react';
import { useResourceLimitNotifications } from '../hooks/useResourceLimitNotifications';
import ResourceLimitBanner from '../components/ResourceLimitBanner';
import ResourceLimitModal from '../components/ResourceLimitModal';

export default function BranchesPage() {
  const { limits, checkResourceLimit } = useResourceLimitNotifications();
  const [showModal, setShowModal] = useState(false);
  const [modalLevel, setModalLevel] = useState<'warning' | 'critical' | 'blocked'>('blocked');

  const handleCreateBranch = () => {
    const { canCreate, alert } = checkResourceLimit('branches');
    
    if (!canCreate) {
      setModalLevel('blocked');
      setShowModal(true);
      return;
    }
    
    if (alert) {
      setModalLevel(alert.level);
      setShowModal(true);
      // Permitir continuar después de ver la advertencia
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Banner de advertencia */}
      {limits && (
        <ResourceLimitBanner
          resourceType="branches"
          currentCount={limits.branches.current}
          maxLimit={limits.branches.max}
        />
      )}

      {/* Contenido de la página */}
      <div className="mt-6">
        <button onClick={handleCreateBranch} className="btn btn-primary">
          Nueva Sede
        </button>
      </div>

      {/* Modal */}
      {limits && (
        <ResourceLimitModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          resourceType="branches"
          currentCount={limits.branches.current}
          maxLimit={limits.branches.max}
          level={modalLevel}
        />
      )}
    </div>
  );
}
```

---

## 🎨 Estilos y Colores

### Nivel Normal (Verde)
```css
bg-green-50, border-green-200, text-green-800
bg-green-500 (barra de progreso)
```

### Nivel Advertencia (Amarillo)
```css
bg-yellow-50, border-yellow-400, text-yellow-800
bg-yellow-500 (barra de progreso)
```

### Nivel Crítico (Naranja)
```css
bg-orange-50, border-orange-500, text-orange-800
bg-orange-600 (barra de progreso)
animate-pulse (animación)
```

### Nivel Bloqueado (Rojo)
```css
bg-red-50, border-red-600, text-red-800
bg-red-600 (barra de progreso)
```

---

## 📧 Contacto con Soporte

Todos los componentes incluyen un botón de "Contactar Soporte" que abre el cliente de email con:

- **Asunto:** Pre-rellenado con el tipo de recurso
- **Cuerpo:** Incluye información del límite actual
- **Destinatario:** soporte@sistema.com

**Ejemplo de email generado:**
```
Para: soporte@sistema.com
Asunto: Solicitud de aumento de límite - usuarios

Hola,

Estoy alcanzando el límite de usuarios en mi cuenta.

Uso actual: 4 / 5 (80.0%)

Por favor, ayúdame a aumentar mi límite o actualizar mi plan.

Gracias.
```

---

## 🔄 Flujo de Usuario

### Escenario 1: Usuario en 75% del límite

1. Usuario accede al dashboard
2. Ve banner amarillo: "Te estás acercando al límite"
3. Puede descartar el banner
4. Puede crear recursos normalmente
5. Se le sugiere actualizar el plan

### Escenario 2: Usuario en 95% del límite

1. Usuario accede al dashboard
2. Ve banner naranja con animación: "¡Límite casi alcanzado!"
3. Mensaje urgente de contactar administrador
4. Puede crear recursos pero con advertencia
5. Al intentar crear, ve modal de advertencia crítica

### Escenario 3: Usuario en 100% del límite

1. Usuario accede al dashboard
2. Ve banner rojo: "Límite alcanzado"
3. Botón de crear está deshabilitado
4. Al intentar crear, ve modal de bloqueo
5. Debe contactar administrador para continuar

---

## ✅ Ventajas de Esta Implementación

### 1. Proactiva
- Alerta antes de que sea demasiado tarde
- Usuario tiene tiempo de reaccionar
- Evita interrupciones inesperadas

### 2. Clara
- Mensajes descriptivos y específicos
- Información visual (barras de progreso, colores)
- Acciones claras (contactar, actualizar plan)

### 3. No Intrusiva
- Banners pueden ser descartados
- No bloquea la navegación
- Solo modal cuando es crítico

### 4. Accionable
- Botones de contacto directo
- Enlaces a planes
- Email pre-rellenado

### 5. Escalable
- Fácil agregar nuevos tipos de recursos
- Componentes reutilizables
- Hook centralizado

---

## 🧪 Pruebas Recomendadas

### 1. Probar Niveles de Alerta

```typescript
// Simular diferentes porcentajes
<ResourceLimitBanner
  resourceType="users"
  currentCount={3}  // 60% - No muestra
  maxLimit={5}
/>

<ResourceLimitBanner
  resourceType="users"
  currentCount={4}  // 80% - Amarillo
  maxLimit={5}
/>

<ResourceLimitBanner
  resourceType="users"
  currentCount={5}  // 100% - Rojo
  maxLimit={5}
/>
```

### 2. Probar Hook

```typescript
const { checkResourceLimit } = useResourceLimitNotifications();

// Verificar si puede crear
const result = checkResourceLimit('users');
console.log('Can create:', result.canCreate);
console.log('Alert:', result.alert);
```

### 3. Probar Modal

```typescript
// Probar diferentes niveles
<ResourceLimitModal
  isOpen={true}
  onClose={() => {}}
  resourceType="branches"
  currentCount={4}
  maxLimit={5}
  level="warning"  // Cambiar a: critical, blocked
/>
```

---

## 📁 Archivos Creados

- ✅ `frontend/src/components/ResourceLimitBanner.tsx`
- ✅ `frontend/src/components/ResourceLimitModal.tsx` (actualizado)
- ✅ `frontend/src/components/ResourceLimitIndicator.tsx`
- ✅ `frontend/src/components/ResourceLimitNotifications.tsx`
- ✅ `frontend/src/hooks/useResourceLimitNotifications.ts`
- ✅ `doc/IMPLEMENTACION_NOTIFICACIONES_LIMITES.md`

---

## 🎯 Próximos Pasos

1. **Integrar en páginas principales:**
   - Dashboard
   - Usuarios
   - Sedes
   - Servicios
   - Consentimientos

2. **Personalizar emails de contacto:**
   - Configurar email real de soporte
   - Agregar información adicional del tenant

3. **Crear página de planes:**
   - Mostrar planes disponibles
   - Comparación de límites
   - Proceso de actualización

4. **Agregar notificaciones por email:**
   - Enviar email cuando alcance 80%
   - Enviar email cuando alcance 90%
   - Enviar email cuando alcance 100%

---

**¡Sistema de notificaciones implementado y listo para usar! 🎉**
