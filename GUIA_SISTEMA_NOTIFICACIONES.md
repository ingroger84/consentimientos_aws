# 🎨 Guía del Sistema de Notificaciones Moderno

## 📋 Descripción

Sistema de notificaciones y diálogos de confirmación moderno, amigable y profesional que reemplaza los `alert()` y `confirm()` nativos del navegador.

## ✨ Características

- ✅ Diseño moderno y profesional
- ✅ Animaciones suaves
- ✅ 4 tipos de notificaciones (success, error, warning, info)
- ✅ 4 tipos de diálogos (danger, warning, info, success)
- ✅ Cierre automático configurable
- ✅ Múltiples notificaciones simultáneas
- ✅ Accesibilidad (ARIA labels)
- ✅ Responsive
- ✅ TypeScript completo

---

## 🚀 Uso Rápido

### Notificaciones Toast

```typescript
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const toast = useToast();

  // Éxito
  toast.success('¡Operación exitosa!', 'El usuario fue creado correctamente');

  // Error
  toast.error('Error al guardar', 'Por favor, intenta nuevamente');

  // Advertencia
  toast.warning('Límite cercano', 'Has usado el 80% de tu cuota');

  // Información
  toast.info('Actualización disponible', 'Hay una nueva versión');
}
```

### Diálogos de Confirmación

```typescript
import { useConfirm } from '@/hooks/useConfirm';

function MyComponent() {
  const confirm = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      type: 'danger',
      title: '¿Eliminar usuario?',
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    if (confirmed) {
      // Proceder con la eliminación
    }
  };
}
```

---

## 📚 API Completa

### useToast()

Retorna un objeto con 4 métodos:

#### `toast.success(title, message?, duration?)`
- **title**: Título de la notificación (requerido)
- **message**: Mensaje descriptivo (opcional)
- **duration**: Duración en ms (opcional, default: 5000)

```typescript
toast.success('¡Guardado!', 'Los cambios se guardaron correctamente', 3000);
```

#### `toast.error(title, message?, duration?)`
```typescript
toast.error('Error', 'No se pudo conectar al servidor', 7000);
```

#### `toast.warning(title, message?, duration?)`
```typescript
toast.warning('Advertencia', 'Estás cerca del límite de almacenamiento');
```

#### `toast.info(title, message?, duration?)`
```typescript
toast.info('Información', 'Nueva actualización disponible');
```

### useConfirm()

Retorna una función que muestra un diálogo y retorna una Promise<boolean>:

```typescript
const confirmed = await confirm({
  type: 'danger' | 'warning' | 'info' | 'success',
  title: string,
  message: string,
  confirmText?: string,  // default: 'Confirmar'
  cancelText?: string,   // default: 'Cancelar'
});
```

---

## 🎨 Tipos de Notificaciones

### Success (Verde)
```typescript
toast.success('¡Éxito!', 'La operación se completó correctamente');
```
- Icono: CheckCircle
- Color: Verde
- Uso: Operaciones exitosas, confirmaciones

### Error (Rojo)
```typescript
toast.error('Error', 'No se pudo completar la operación');
```
- Icono: XCircle
- Color: Rojo
- Uso: Errores, fallos, problemas

### Warning (Amarillo)
```typescript
toast.warning('Advertencia', 'Estás cerca del límite');
```
- Icono: AlertCircle
- Color: Amarillo
- Uso: Advertencias, límites cercanos

### Info (Azul)
```typescript
toast.info('Información', 'Hay una actualización disponible');
```
- Icono: Info
- Color: Azul
- Uso: Información general, tips

---

## 🎯 Tipos de Diálogos

### Danger (Rojo)
```typescript
await confirm({
  type: 'danger',
  title: '¿Eliminar?',
  message: 'Esta acción no se puede deshacer',
});
```
- Uso: Eliminaciones, acciones destructivas

### Warning (Amarillo)
```typescript
await confirm({
  type: 'warning',
  title: '¿Continuar?',
  message: 'Estás cerca del límite',
});
```
- Uso: Advertencias, acciones con precaución

### Info (Azul)
```typescript
await confirm({
  type: 'info',
  title: '¿Solicitar plan?',
  message: 'El administrador revisará tu solicitud',
});
```
- Uso: Confirmaciones generales, información

### Success (Verde)
```typescript
await confirm({
  type: 'success',
  title: '¿Aprobar?',
  message: 'El usuario será activado',
});
```
- Uso: Aprobaciones, activaciones

---

## 📝 Ejemplos de Migración

### Antes (alert nativo)
```typescript
alert('Usuario creado exitosamente');
```

### Después (toast moderno)
```typescript
toast.success('¡Usuario creado!', 'El usuario fue creado exitosamente');
```

---

### Antes (confirm nativo)
```typescript
if (confirm('¿Estás seguro de eliminar este usuario?')) {
  deleteUser();
}
```

### Después (confirm moderno)
```typescript
const confirmed = await confirm({
  type: 'danger',
  title: '¿Eliminar usuario?',
  message: 'Esta acción no se puede deshacer.',
  confirmText: 'Eliminar',
  cancelText: 'Cancelar',
});

if (confirmed) {
  deleteUser();
}
```

---

## 🔄 Patrones Comunes

### Operación CRUD Exitosa
```typescript
const handleCreate = async () => {
  try {
    await createUser(data);
    toast.success('¡Usuario creado!', 'El usuario fue creado correctamente');
  } catch (error) {
    toast.error('Error al crear', error.message);
  }
};
```

### Confirmación antes de Eliminar
```typescript
const handleDelete = async (id: string) => {
  const confirmed = await confirm({
    type: 'danger',
    title: '¿Eliminar usuario?',
    message: 'Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
  });

  if (!confirmed) return;

  try {
    await deleteUser(id);
    toast.success('Usuario eliminado', 'El usuario fue eliminado correctamente');
  } catch (error) {
    toast.error('Error al eliminar', error.message);
  }
};
```

### Validación con Advertencia
```typescript
const handleSubmit = async () => {
  if (isNearLimit) {
    const proceed = await confirm({
      type: 'warning',
      title: 'Límite cercano',
      message: `Estás usando el ${percentage}% de tu cuota. ¿Deseas continuar?`,
      confirmText: 'Continuar',
      cancelText: 'Cancelar',
    });

    if (!proceed) return;
  }

  // Proceder con la operación
};
```

### Error de Límite Alcanzado
```typescript
if (limitReached) {
  toast.error(
    'Límite alcanzado',
    `Has alcanzado el límite máximo de usuarios (${current}/${max}). Actualiza tu plan para continuar.`,
    7000 // Duración más larga para errores importantes
  );
  return;
}
```

---

## 🎨 Personalización

### Duración Personalizada
```typescript
// Notificación rápida (2 segundos)
toast.info('Guardando...', undefined, 2000);

// Notificación larga (10 segundos)
toast.error('Error crítico', 'Contacta al administrador', 10000);

// Sin cierre automático (0 = manual)
toast.warning('Acción requerida', 'Debes completar tu perfil', 0);
```

### Mensajes Multilinea
```typescript
toast.info(
  'Actualización disponible',
  'Versión 2.0.0\n\n• Nueva interfaz\n• Mejor rendimiento\n• Corrección de errores'
);
```

---

## ♿ Accesibilidad

El sistema incluye:
- ✅ Roles ARIA apropiados (`role="alert"`)
- ✅ Labels descriptivos (`aria-label`)
- ✅ Navegación por teclado
- ✅ Colores con contraste adecuado
- ✅ Iconos descriptivos

---

## 📱 Responsive

- Desktop: Notificaciones en esquina superior derecha
- Mobile: Notificaciones adaptadas al ancho de pantalla
- Diálogos: Centrados y responsive en todos los dispositivos

---

## 🔧 Componentes Internos

### Toast
Componente individual de notificación con cierre automático.

### ToastContainer
Contenedor que maneja múltiples toasts simultáneos.

### ConfirmDialog
Diálogo modal de confirmación con backdrop.

### ConfirmDialogContainer
Contenedor global para el diálogo de confirmación.

---

## 📦 Archivos Creados

```
frontend/src/
├── components/ui/
│   ├── Toast.tsx                    # Componente de notificación
│   ├── ToastContainer.tsx           # Contenedor de toasts
│   ├── ConfirmDialog.tsx            # Diálogo de confirmación
│   └── ConfirmDialogContainer.tsx   # Contenedor de diálogo
├── hooks/
│   ├── useToast.tsx                 # Hook para notificaciones
│   └── useConfirm.tsx               # Hook para confirmaciones
└── index.css                        # Animaciones CSS
```

---

## ✅ Ventajas sobre alert() y confirm()

| Característica | alert/confirm | Sistema Nuevo |
|----------------|---------------|---------------|
| Diseño | Nativo del navegador | Moderno y personalizado |
| Animaciones | No | Sí, suaves |
| Tipos | 1 (alert) | 4 (success, error, warning, info) |
| Personalización | No | Completa |
| Múltiples | No | Sí |
| Accesibilidad | Básica | Completa |
| UX | Intrusivo | Amigable |
| Responsive | No | Sí |

---

## 🚀 Próximos Pasos

1. Reemplazar todos los `alert()` por `toast.*()` en el proyecto
2. Reemplazar todos los `confirm()` por `useConfirm()`
3. Agregar notificaciones en operaciones sin feedback visual
4. Mejorar mensajes de error con información útil

---

**Fecha de creación:** 9 de enero de 2026  
**Estado:** ✅ Implementado y listo para usar
