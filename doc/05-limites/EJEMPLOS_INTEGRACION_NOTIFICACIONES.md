# 📝 Ejemplos de Integración: Notificaciones de Límites

**Fecha:** 7 de enero de 2026  
**Estado:** ✅ LISTO PARA USAR

---

## 🎯 Guía Rápida de Integración

Esta guía muestra cómo integrar el sistema de notificaciones de límites en tus páginas existentes.

---

## 📦 Paso 1: Importar Componentes

```typescript
// Componentes
import ResourceLimitNotifications from '@/components/ResourceLimitNotifications';
import ResourceLimitBanner from '@/components/ResourceLimitBanner';
import ResourceLimitModal from '@/components/ResourceLimitModal';
import ResourceLimitIndicator from '@/components/ResourceLimitIndicator';

// Hook
import { useResourceLimitNotifications } from '@/hooks/useResourceLimitNotifications';
```

---

## 🏠 Ejemplo 1: Dashboard Principal

**Objetivo:** Mostrar todas las alertas activas en el dashboard.

```typescript
// frontend/src/pages/DashboardPage.tsx
import { useAuth } from '@/contexts/AuthContext';
import ResourceLimitNotifications from '@/components/ResourceLimitNotifications';

export default function DashboardPage() {
  const { user } = useAuth();

  // Solo mostrar para usuarios con tenant (no Super Admin)
  const showNotifications = user?.tenant;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Notificaciones de límites */}
      {showNotifications && (
        <div className="mb-6">
          <ResourceLimitNotifications />
        </div>
      )}

      {/* Resto del dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cards de estadísticas */}
      </div>
    </div>
  );
}
```

---

## 👥 Ejemplo 2: Página de Usuarios (Completo)

**Objetivo:** Mostrar indicador de límite, validar antes de crear, y mostrar modal si está bloqueado.

```typescript
// frontend/src/pages/UsersPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { useResourceLimitNotifications } from '@/hooks/useResourceLimitNotifications';
import ResourceLimitIndicator from '@/components/ResourceLimitIndicator';
import ResourceLimitModal from '@/components/ResourceLimitModal';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalLevel, setLimitModalLevel] = useState<'warning' | 'critical' | 'blocked'>('blocked');
  const queryClient = useQueryClient();

  // Hook de notificaciones
  const { limits, checkResourceLimit, refreshLimits } = useResourceLimitNotifications();

  // Query de usuarios
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });

  // Mutation para crear usuario
  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refreshLimits(); // Actualizar límites después de crear
      setIsModalOpen(false);
    },
  });

  // Validar límite antes de abrir modal de creación
  const handleOpenCreateModal = () => {
    const { canCreate, alert } = checkResourceLimit('users');

    if (!canCreate) {
      // Límite alcanzado - mostrar modal de bloqueo
      setLimitModalLevel('blocked');
      setShowLimitModal(true);
      return;
    }

    if (alert && alert.level === 'critical') {
      // Cerca del límite - mostrar advertencia pero permitir crear
      setLimitModalLevel('critical');
      setShowLimitModal(true);
      // Después de cerrar el modal, permitir abrir el de creación
      return;
    }

    // Todo OK - abrir modal de creación
    setIsModalOpen(true);
  };

  // Continuar con la creación después de ver la advertencia
  const handleContinueAfterWarning = () => {
    setShowLimitModal(false);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <button
          onClick={handleOpenCreateModal}
          className="btn btn-primary flex items-center"
          disabled={limits && limits.users.current >= limits.users.max}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </button>
      </div>

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

      {/* Lista de usuarios */}
      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {/* Tabla de usuarios */}
        </div>
      )}

      {/* Modal de límite */}
      {limits && (
        <ResourceLimitModal
          isOpen={showLimitModal}
          onClose={() => {
            setShowLimitModal(false);
            // Si era advertencia crítica, permitir continuar
            if (limitModalLevel === 'critical') {
              handleContinueAfterWarning();
            }
          }}
          resourceType="users"
          currentCount={limits.users.current}
          maxLimit={limits.users.max}
          level={limitModalLevel}
        />
      )}

      {/* Modal de creación de usuario */}
      {/* ... */}
    </div>
  );
}
```

---

## 🏢 Ejemplo 3: Página de Sedes (Con Banner)

**Objetivo:** Mostrar banner de advertencia y validar antes de crear.

```typescript
// frontend/src/pages/BranchesPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService } from '@/services/branch.service';
import { useResourceLimitNotifications } from '@/hooks/useResourceLimitNotifications';
import ResourceLimitBanner from '@/components/ResourceLimitBanner';
import ResourceLimitModal from '@/components/ResourceLimitModal';
import { Plus } from 'lucide-react';

export default function BranchesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const queryClient = useQueryClient();

  const { limits, checkResourceLimit, refreshLimits } = useResourceLimitNotifications();

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: branchService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: branchService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      refreshLimits();
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      // Si el error es 403 (límite alcanzado), mostrar modal
      if (error.response?.status === 403) {
        setShowLimitModal(true);
      }
    },
  });

  const handleOpenCreateModal = () => {
    const { canCreate } = checkResourceLimit('branches');

    if (!canCreate) {
      setShowLimitModal(true);
      return;
    }

    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sedes</h1>
        <button
          onClick={handleOpenCreateModal}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Sede
        </button>
      </div>

      {/* Banner de advertencia */}
      {limits && (
        <ResourceLimitBanner
          resourceType="branches"
          currentCount={limits.branches.current}
          maxLimit={limits.branches.max}
          onDismiss={refreshLimits}
        />
      )}

      {/* Lista de sedes */}
      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches?.map((branch: any) => (
            <div key={branch.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold">{branch.name}</h3>
              <p className="text-sm text-gray-600">{branch.address}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal de límite */}
      {limits && (
        <ResourceLimitModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          resourceType="branches"
          currentCount={limits.branches.current}
          maxLimit={limits.branches.max}
          level="blocked"
        />
      )}
    </div>
  );
}
```

---

## 📋 Ejemplo 4: Página de Consentimientos (Mínimo)

**Objetivo:** Solo validar antes de crear, sin mostrar indicadores.

```typescript
// frontend/src/pages/ConsentsPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResourceLimitNotifications } from '@/hooks/useResourceLimitNotifications';
import ResourceLimitModal from '@/components/ResourceLimitModal';
import { Plus } from 'lucide-react';

export default function ConsentsPage() {
  const navigate = useNavigate();
  const [showLimitModal, setShowLimitModal] = useState(false);

  const { limits, checkResourceLimit } = useResourceLimitNotifications();

  const handleCreateConsent = () => {
    const { canCreate } = checkResourceLimit('consents');

    if (!canCreate) {
      setShowLimitModal(true);
      return;
    }

    // Navegar a la página de creación
    navigate('/consents/new');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Consentimientos</h1>
        <button
          onClick={handleCreateConsent}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Consentimiento
        </button>
      </div>

      {/* Contenido de la página */}

      {/* Modal de límite */}
      {limits && (
        <ResourceLimitModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          resourceType="consents"
          currentCount={limits.consents.current}
          maxLimit={limits.consents.max}
          level="blocked"
        />
      )}
    </div>
  );
}
```

---

## 🎨 Ejemplo 5: Card de Resumen con Indicadores

**Objetivo:** Mostrar resumen de todos los recursos en un card.

```typescript
// frontend/src/components/ResourceSummaryCard.tsx
import { useResourceLimitNotifications } from '@/hooks/useResourceLimitNotifications';
import ResourceLimitIndicator from '@/components/ResourceLimitIndicator';
import { Users, Building2, FileText, Briefcase } from 'lucide-react';

export default function ResourceSummaryCard() {
  const { limits, hasAlerts, hasCriticalAlerts } = useResourceLimitNotifications();

  if (!limits) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Uso de Recursos</h2>
        {hasCriticalAlerts && (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
            Atención Requerida
          </span>
        )}
        {hasAlerts && !hasCriticalAlerts && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
            Advertencia
          </span>
        )}
      </div>

      <div className="space-y-4">
        <ResourceLimitIndicator
          current={limits.users.current}
          max={limits.users.max}
          resourceType="users"
          size="sm"
        />

        <ResourceLimitIndicator
          current={limits.branches.current}
          max={limits.branches.max}
          resourceType="branches"
          size="sm"
        />

        <ResourceLimitIndicator
          current={limits.services.current}
          max={limits.services.max}
          resourceType="services"
          size="sm"
        />

        <ResourceLimitIndicator
          current={limits.consents.current}
          max={limits.consents.max}
          resourceType="consents"
          size="sm"
        />
      </div>

      {hasAlerts && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Algunos recursos están cerca de su límite. Considera actualizar tu plan.
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Ejemplo 6: Manejo de Errores del Backend

**Objetivo:** Capturar errores 403 del backend y mostrar modal.

```typescript
// frontend/src/pages/UsersPage.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { useResourceLimitNotifications } from '@/hooks/useResourceLimitNotifications';
import ResourceLimitModal from '@/components/ResourceLimitModal';
import { toast } from 'react-hot-toast';

export default function UsersPage() {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const queryClient = useQueryClient();

  const { limits, refreshLimits } = useResourceLimitNotifications();

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refreshLimits();
      toast.success('Usuario creado exitosamente');
    },
    onError: (error: any) => {
      // Capturar error 403 (límite alcanzado)
      if (error.response?.status === 403) {
        setErrorMessage(error.response.data.message);
        setShowLimitModal(true);
      } else {
        toast.error('Error al crear usuario');
      }
    },
  });

  const handleCreateUser = (data: any) => {
    createMutation.mutate(data);
  };

  return (
    <div>
      {/* Contenido de la página */}

      {/* Modal de límite con mensaje del backend */}
      {limits && (
        <ResourceLimitModal
          isOpen={showLimitModal}
          onClose={() => {
            setShowLimitModal(false);
            setErrorMessage('');
          }}
          resourceType="users"
          currentCount={limits.users.current}
          maxLimit={limits.users.max}
          level="blocked"
        />
      )}

      {/* Mostrar mensaje de error del backend si existe */}
      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Ejemplo 7: Layout Principal con Notificaciones Globales

**Objetivo:** Mostrar notificaciones en todas las páginas.

```typescript
// frontend/src/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ResourceLimitNotifications from '@/components/ResourceLimitNotifications';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function MainLayout() {
  const { user } = useAuth();
  const showNotifications = user?.tenant; // Solo para usuarios con tenant

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Notificaciones globales */}
          {showNotifications && (
            <div className="mb-6">
              <ResourceLimitNotifications />
            </div>
          )}

          {/* Contenido de la página */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

---

## 📱 Ejemplo 8: Versión Móvil Responsive

**Objetivo:** Adaptar notificaciones para móviles.

```typescript
// frontend/src/components/MobileResourceAlert.tsx
import { useState } from 'react';
import { useResourceLimitNotifications } from '@/hooks/useResourceLimitNotifications';
import { AlertCircle, X } from 'lucide-react';

export default function MobileResourceAlert() {
  const [isDismissed, setIsDismissed] = useState(false);
  const { alerts, hasCriticalAlerts } = useResourceLimitNotifications();

  if (!hasCriticalAlerts || isDismissed) {
    return null;
  }

  const criticalAlert = alerts.find(a => a.level === 'critical' || a.level === 'blocked');

  if (!criticalAlert) {
    return null;
  }

  const resourceNames = {
    users: 'usuarios',
    branches: 'sedes',
    consents: 'consentimientos',
    services: 'servicios',
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-4 shadow-lg z-50 md:hidden">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              Límite de {resourceNames[criticalAlert.type]} alcanzado
            </p>
            <p className="text-xs mt-1 opacity-90">
              {criticalAlert.current} / {criticalAlert.max} usados
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-white hover:text-gray-200 ml-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

---

## ✅ Checklist de Integración

### Para cada página que crea recursos:

- [ ] Importar `useResourceLimitNotifications` hook
- [ ] Importar `ResourceLimitModal` componente
- [ ] Llamar `checkResourceLimit()` antes de abrir modal de creación
- [ ] Mostrar modal de límite si `canCreate` es `false`
- [ ] Llamar `refreshLimits()` después de crear recurso exitosamente
- [ ] Capturar errores 403 del backend
- [ ] Deshabilitar botón de crear si límite alcanzado

### Para el dashboard:

- [ ] Importar `ResourceLimitNotifications` componente
- [ ] Mostrar en la parte superior del dashboard
- [ ] Solo mostrar para usuarios con tenant

### Para el layout principal:

- [ ] Considerar mostrar notificaciones globales
- [ ] Agregar indicador en navbar si hay alertas críticas

---

## 🎨 Personalización

### Cambiar colores:

```typescript
// En ResourceLimitBanner.tsx
const statusConfig = {
  warning: {
    bgColor: 'bg-yellow-50',    // Cambiar a tu color
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-800',
    // ...
  },
};
```

### Cambiar email de soporte:

```typescript
// En todos los componentes
const handleContactSupport = () => {
  window.location.href = `mailto:tu-email@dominio.com?subject=...`;
};
```

### Cambiar umbrales de alerta:

```typescript
// En useResourceLimitNotifications.ts
if (percentage >= 100) {
  // Bloqueado
} else if (percentage >= 90) {  // Cambiar a 85 si quieres
  // Crítico
} else if (percentage >= 70) {  // Cambiar a 60 si quieres
  // Advertencia
}
```

---

**¡Listo para integrar en tu aplicación! 🚀**
