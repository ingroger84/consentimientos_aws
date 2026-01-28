# Instrucciones de Prueba - Permisos Operador en Plantillas HC

## Objetivo

Verificar que los usuarios con rol "operador" solo puedan ver plantillas HC pero no editarlas, eliminarlas o crear nuevas.

---

## Pre-requisitos

1. **Backend corriendo**: `npm run start:dev` en carpeta `backend/`
2. **Frontend corriendo**: `npm run dev` en carpeta `frontend/`
3. **Acceso a la aplicación**: http://demo-medico.localhost:5174

---

## Prueba 1: Usuario Operador (Sin Permisos de Edición)

### Paso 1: Iniciar Sesión como Operador

1. Ir a: http://demo-medico.localhost:5174
2. Iniciar sesión con:
   - Email: `operador1@demo-clinica.com`
   - Password: (contraseña del operador)

### Paso 2: Navegar a Plantillas HC

1. En el menú lateral, hacer clic en **"Plantillas HC"**
2. Deberías ver la lista de plantillas HC existentes

### Paso 3: Verificar Botones NO Visibles

✅ **Verificar que NO se vean los siguientes botones**:

1. **Botón "Nueva Plantilla HC"** (esquina superior derecha)
   - ❌ NO debe aparecer

2. **Botón "Editar"** (icono de lápiz en cada plantilla)
   - ❌ NO debe aparecer

3. **Botón "Eliminar"** (icono de papelera en cada plantilla)
   - ❌ NO debe aparecer

4. **Botón "Marcar como predeterminada"** (icono de estrella en cada plantilla)
   - ❌ NO debe aparecer

### Paso 4: Verificar Funcionalidad Permitida

✅ **Verificar que SÍ puedas**:

1. Ver la lista de plantillas HC
2. Ver el contenido de cada plantilla (vista previa)
3. Usar los filtros de búsqueda
4. Ver las estadísticas en la parte inferior

---

## Prueba 2: Usuario Admin (Con Todos los Permisos)

### Paso 1: Cerrar Sesión y Iniciar como Admin

1. Cerrar sesión del usuario operador
2. Iniciar sesión con:
   - Email: `admin@clinicademo.com`
   - Password: `Demo123!`

### Paso 2: Navegar a Plantillas HC

1. En el menú lateral, hacer clic en **"Plantillas HC"**

### Paso 3: Verificar Botones Visibles

✅ **Verificar que SÍ se vean los siguientes botones**:

1. **Botón "Nueva Plantilla HC"** (esquina superior derecha)
   - ✅ Debe aparecer

2. **Botón "Editar"** (icono de lápiz en cada plantilla)
   - ✅ Debe aparecer

3. **Botón "Eliminar"** (icono de papelera en cada plantilla)
   - ✅ Debe aparecer

4. **Botón "Marcar como predeterminada"** (icono de estrella en cada plantilla)
   - ✅ Debe aparecer (solo en plantillas que no son predeterminadas)

### Paso 4: Probar Funcionalidad

✅ **Probar que funcionen**:

1. Hacer clic en "Nueva Plantilla HC" → Debe abrir modal de creación
2. Hacer clic en "Editar" → Debe abrir modal de edición
3. Hacer clic en "Eliminar" → Debe pedir confirmación
4. Hacer clic en "Marcar como predeterminada" → Debe marcar la plantilla

---

## Resultados Esperados

### Para Usuario Operador
```
✅ Puede ver plantillas HC
✅ Puede usar filtros de búsqueda
❌ NO puede crear plantillas HC
❌ NO puede editar plantillas HC
❌ NO puede eliminar plantillas HC
❌ NO puede marcar plantillas como predeterminadas
```

### Para Usuario Admin
```
✅ Puede ver plantillas HC
✅ Puede usar filtros de búsqueda
✅ Puede crear plantillas HC
✅ Puede editar plantillas HC
✅ Puede eliminar plantillas HC
✅ Puede marcar plantillas como predeterminadas
```

---

## Capturas de Pantalla Esperadas

### Vista Operador (Sin Botones de Acción)
```
┌─────────────────────────────────────────────────────┐
│  Plantillas de Consentimiento HC                    │
│  Gestiona plantillas específicas para historias...  │
│                                                      │
│  [NO HAY BOTÓN "Nueva Plantilla HC"]                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📄 Plantilla General HC                            │
│  Descripción de la plantilla...                     │
│                                                      │
│  [NO HAY BOTONES DE EDITAR/ELIMINAR/ESTRELLA]      │
└─────────────────────────────────────────────────────┘
```

### Vista Admin (Con Todos los Botones)
```
┌─────────────────────────────────────────────────────┐
│  Plantillas de Consentimiento HC                    │
│  Gestiona plantillas específicas para historias...  │
│                                                      │
│                          [+ Nueva Plantilla HC]     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📄 Plantilla General HC                            │
│  Descripción de la plantilla...                     │
│                                                      │
│                          [⭐] [✏️] [🗑️]              │
└─────────────────────────────────────────────────────┘
```

---

## Solución de Problemas

### Problema: Operador ve botones que no debería

**Causa**: Permisos no actualizados en el frontend

**Solución**:
1. Hacer clic en el botón de actualizar (🔄) en el sidebar
2. Cerrar sesión y volver a iniciar sesión
3. Verificar que el rol tenga los permisos correctos en la base de datos

### Problema: Admin no ve botones

**Causa**: Permisos no asignados al rol admin

**Solución**:
1. Verificar en base de datos que el rol admin tenga los permisos:
   - `create_mr_consent_templates`
   - `edit_mr_consent_templates`
   - `delete_mr_consent_templates`
   - `view_mr_consent_templates`

---

## Fecha de Prueba

26 de enero de 2026
