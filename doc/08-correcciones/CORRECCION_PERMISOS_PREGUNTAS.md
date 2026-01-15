# Corrección de Permisos en Página de Preguntas

## Problema Identificado

Usuario con perfil **Operador** podía ver botones de editar y eliminar en la página de preguntas, aunque solo tenía el permiso `view_questions` asignado.

### Comportamiento Incorrecto
- Usuario operador veía botones "Editar" y "Eliminar" en ambas vistas (agrupada y lista)
- Usuario operador veía botón "Nueva Pregunta"
- Los botones eran visibles aunque el usuario no tenía permisos de edición/eliminación

## Solución Implementada

### 1. Protección de Botones con Permisos

Se aplicó protección condicional a todos los botones de acción usando el hook `usePermissions`:

```typescript
const { hasPermission } = usePermissions();

// Verificar permisos
const canCreate = hasPermission('create_questions');
const canEdit = hasPermission('edit_questions');
const canDelete = hasPermission('delete_questions');
```

### 2. Botón "Nueva Pregunta"

**Antes:**
```typescript
<button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
  <Plus className="w-5 h-5" />
  Nueva Pregunta
</button>
```

**Después:**
```typescript
{canCreate && (
  <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
    <Plus className="w-5 h-5" />
    Nueva Pregunta
  </button>
)}
```

### 3. Botones de Editar/Eliminar en Vista Agrupada

**Antes:**
```typescript
<div className="flex gap-2 ml-4">
  <button onClick={() => handleEdit(question)}>
    <Edit className="w-5 h-5" />
  </button>
  <button onClick={() => handleDelete(question.id)}>
    <Trash2 className="w-5 h-5" />
  </button>
</div>
```

**Después:**
```typescript
<div className="flex gap-2 ml-4">
  {canEdit && (
    <button onClick={() => handleEdit(question)}>
      <Edit className="w-5 h-5" />
    </button>
  )}
  {canDelete && (
    <button onClick={() => handleDelete(question.id)}>
      <Trash2 className="w-5 h-5" />
    </button>
  )}
  {!canEdit && !canDelete && (
    <div className="text-sm text-gray-500 px-3 py-2">
      Solo lectura
    </div>
  )}
</div>
```

### 4. Botones de Editar/Eliminar en Vista de Lista

Se aplicó la misma protección condicional en la vista de lista.

## Permisos Relacionados

| Permiso | Descripción | Acción Protegida |
|---------|-------------|------------------|
| `view_questions` | Ver preguntas | Acceso a la página |
| `create_questions` | Crear preguntas | Botón "Nueva Pregunta" |
| `edit_questions` | Editar preguntas | Botón "Editar" |
| `delete_questions` | Eliminar preguntas | Botón "Eliminar" |

## Comportamiento Esperado

### Usuario con Solo `view_questions`
- ✅ Puede ver la lista de preguntas
- ✅ Puede cambiar entre vista agrupada y lista
- ✅ Puede filtrar por servicio
- ✅ Ve mensaje "Solo lectura" en lugar de botones
- ❌ NO ve botón "Nueva Pregunta"
- ❌ NO ve botones de editar
- ❌ NO ve botones de eliminar

### Usuario con Todos los Permisos
- ✅ Puede ver la lista de preguntas
- ✅ Puede crear nuevas preguntas
- ✅ Puede editar preguntas existentes
- ✅ Puede eliminar preguntas

## Archivos Modificados

- `frontend/src/pages/QuestionsPage.tsx` - Aplicada protección de permisos en todos los botones

## Patrón Implementado

Este patrón es consistente con las páginas de Servicios y Sedes:

1. Importar hook `usePermissions`
2. Verificar permisos específicos con `hasPermission()`
3. Renderizar botones condicionalmente con `{canAction && <button>...}`
4. Mostrar mensaje "Solo lectura" cuando no hay permisos de edición

## Pruebas Realizadas

✅ Compilación sin errores
✅ No hay warnings de TypeScript
✅ Variables de permisos utilizadas correctamente

## Próximos Pasos

Probar con usuario operador:
1. Login con `operador1@demo-medico.com`
2. Verificar que solo ve las preguntas
3. Verificar que NO ve botón "Nueva Pregunta"
4. Verificar que NO ve botones de editar/eliminar
5. Verificar que ve mensaje "Solo lectura"
