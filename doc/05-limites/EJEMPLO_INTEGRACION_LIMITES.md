# Ejemplo de Integración: Control de Límites de Recursos

**Fecha:** 7 de enero de 2026

---

## 📝 Cómo Integrar en tus Páginas

### Paso 1: Importar el Hook y el Modal

```typescript
import { useResourceLimit } from '@/hooks/useResourceLimit';
import ResourceLimitModal from '@/components/ResourceLimitModal';
```

### Paso 2: Usar el Hook

```typescript
export default function UsersPage() {
  // Agregar el hook
  const { showLimitModal, limitError, handleResourceLimitError, closeLimitModal } = useResourceLimit();
  
  // ... resto del código
}
```

### Paso 3: Agregar onError a las Mutaciones

```typescript
const createMutation = useMutation({
  mutationFn: userService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    setIsModalOpen(false);
    reset();
  },
  onError: (error) => {
    // Intentar manejar como error de límite
    if (!handleResourceLimitError(error)) {
      // Si no es error de límite, manejar como error normal
      alert('Error al crear usuario');
    }
  },
});
```

### Paso 4: Agregar el Modal al JSX

```typescript
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
```

---

## 📄 Ejemplo Completo: UsersPage.tsx

```typescript
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { roleService } from '@/services/role.service';
import { branchService } from '@/services/branch.service';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/store/authStore';
import { useResourceLimit } from '@/hooks/useResourceLimit';
import ResourceLimitModal from '@/components/ResourceLimitModal';
import { Plus, Edit, Trash2, X, Key } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function UsersPage() {
  // Estados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const { user: currentUser } = useAuthStore();
  
  // Hook de límites de recursos
  const { showLimitModal, limitError, handleResourceLimitError, closeLimitModal } = useResourceLimit();

  // Queries
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getAll,
  });

  const { register, handleSubmit, reset } = useForm();

  // Mutations
  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      reset();
    },
    onError: (error) => {
      // Manejar error de límite de recursos
      if (!handleResourceLimitError(error)) {
        // Si no es error de límite, mostrar error genérico
        alert('Error al crear usuario');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
      reset();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al actualizar usuario');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al eliminar usuario');
    },
  });

  // Handlers
  const onSubmit = (data: any) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        {hasPermission('create_users') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Tabla de usuarios */}
      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Nombre</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Rol</th>
              <th className="text-left py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.role.name}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {hasPermission('edit_users') && (
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    {hasPermission('delete_users') && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={closeModal}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  {...register('name', { required: true })}
                  className="input"
                  placeholder="Nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  {...register('email', { required: true })}
                  className="input"
                  placeholder="email@ejemplo.com"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-2">Contraseña</label>
                  <input
                    type="password"
                    {...register('password', { required: !editingUser })}
                    className="input"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Rol</label>
                <select {...register('roleId', { required: true })} className="input">
                  <option value="">Seleccionar rol</option>
                  {roles?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

## 🎯 Puntos Clave

### 1. Importaciones
```typescript
import { useResourceLimit } from '@/hooks/useResourceLimit';
import ResourceLimitModal from '@/components/ResourceLimitModal';
```

### 2. Hook
```typescript
const { showLimitModal, limitError, handleResourceLimitError, closeLimitModal } = useResourceLimit();
```

### 3. onError en Mutation
```typescript
onError: (error) => {
  if (!handleResourceLimitError(error)) {
    alert('Error al crear usuario');
  }
},
```

### 4. Modal en JSX
```typescript
{showLimitModal && limitError && (
  <ResourceLimitModal
    isOpen={showLimitModal}
    onClose={closeLimitModal}
    resourceType={limitError.resourceType}
    currentCount={limitError.currentCount}
    maxLimit={limitError.maxLimit}
  />
)}
```

---

## ✅ Checklist de Integración

Para cada página (Users, Branches, Consents):

- [ ] Importar `useResourceLimit` y `ResourceLimitModal`
- [ ] Agregar hook al componente
- [ ] Agregar `onError` a la mutation de creación
- [ ] Llamar `handleResourceLimitError(error)` en `onError`
- [ ] Agregar `ResourceLimitModal` al JSX
- [ ] Probar creando recursos hasta el límite
- [ ] Verificar que el modal se muestre correctamente

---

**¡Listo para integrar en tus páginas! 🚀**

