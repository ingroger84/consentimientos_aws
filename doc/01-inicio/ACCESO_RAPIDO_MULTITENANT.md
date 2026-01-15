# 🚀 Acceso Rápido al Sistema Multi-Tenant

## ✅ Servicios Activos

- ✅ **Backend**: http://localhost:3000 (corriendo)
- ✅ **Frontend**: http://localhost:5173 (corriendo)

## 🔐 Credenciales de Acceso

### Super Admin (Gestión de Tenants)
```
🌐 URL: http://localhost:5173/login

📧 Email:    superadmin@sistema.com
🔑 Password: superadmin123

✨ Permisos:
   - Acceso completo al sistema
   - Gestión de todos los tenants
   - Ver estadísticas globales
   - No pertenece a ningún tenant
```

### Admin del Tenant (Clínica Demo)
```
🌐 URL: http://localhost:5173/login

📧 Email:    admin@consentimientos.com
🔑 Password: admin123

✨ Permisos:
   - Acceso completo a su tenant
   - Gestión de usuarios, sedes, servicios
   - Solo ve datos de "Clínica Demo"
   - NO puede gestionar tenants
```

### Operador (Clínica Demo)
```
🌐 URL: http://localhost:5173/login

📧 Email:    operador@consentimientos.com
🔑 Password: operador123

✨ Permisos:
   - Crear consentimientos
   - Ver dashboard
   - Acceso limitado a Sede Principal
```

## 📍 Pasos para Acceder al Multi-Tenant

### 1️⃣ Abrir el Navegador
```
http://localhost:5173
```

### 2️⃣ Iniciar Sesión como Super Admin
```
Email:    superadmin@sistema.com
Password: superadmin123
```

### 3️⃣ Buscar "Tenants" en el Menú
En el menú lateral izquierdo, verás:
```
📊 Dashboard
📄 Consentimientos
👥 Usuarios
🛡️ Roles y Permisos
🏢 Sedes
💼 Servicios
❓ Preguntas
⚙️ Configuración
🏢 Tenants          ← ¡AQUÍ!
```

### 4️⃣ Hacer Click en "Tenants"
Serás redirigido a: `http://localhost:5173/tenants`

## 🎯 ¿Qué Verás en la Página de Tenants?

### Estadísticas Globales
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total: 1    │ Activos: 1  │ Prueba: 0   │ Suspendidos:│
│             │             │             │ 0           │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Recursos Totales
```
👥 Usuarios: 3
🏢 Sedes: 2
💼 Servicios: 2
📄 Consentimientos: X
```

### Tenant Demo
```
┌────────────────────────────────────┐
│ 🏢 Clínica Demo                    │
│ /clinica-demo                      │
│                                    │
│ 🟢 Activo  🟣 Professional         │
│                                    │
│ 📧 admin@clinicademo.com           │
│ 👤 Admin Demo                      │
│                                    │
│ Límites:                           │
│ 👥 Usuarios:  3 / 50               │
│ 🏢 Sedes:     2 / 20               │
│ 📄 Docs:      X / 5000             │
│                                    │
│ 📅 Creado: [fecha]                 │
│                                    │
│ [⋮ Menú de acciones]               │
└────────────────────────────────────┘
```

## 🎨 Acciones Disponibles

### Botón "Nuevo Tenant"
```
┌─────────────────────────────────────┐
│ [+ Nuevo Tenant]                    │
└─────────────────────────────────────┘
```
Crea un nuevo tenant con:
- Nombre y slug
- Estado y plan
- Información de contacto
- Límites de recursos

### Menú de Acciones (⋮)
```
┌──────────────────────┐
│ ✏️ Editar            │
│ 📊 Ver Estadísticas  │
│ 🚫 Suspender         │
│ ✅ Activar           │
│ 🗑️ Eliminar          │
└──────────────────────┘
```

## 🔍 Filtros Disponibles

### Búsqueda
```
[🔍 Buscar por nombre, slug o email...]
```

### Filtro por Estado
```
[Todos los estados ▼]
- Todos los estados
- Activo
- Prueba
- Suspendido
- Expirado
```

### Filtro por Plan
```
[Todos los planes ▼]
- Todos los planes
- Free
- Basic
- Professional
- Enterprise
```

## 📊 Ver Estadísticas de un Tenant

Al hacer click en "Ver Estadísticas", verás:

```
┌─────────────────────────────────────────────┐
│ Estadísticas de Clínica Demo               │
├─────────────────────────────────────────────┤
│                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ 👥 3/50  │ │ 🏢 2/20  │ │ 📄 X/5000│    │
│ │ 6%       │ │ 10%      │ │ X%       │    │
│ └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│ Uso de Recursos:                            │
│                                             │
│ Usuarios:  [████░░░░░░] 6%                 │
│ Sedes:     [██░░░░░░░░] 10%                │
│ Docs:      [█░░░░░░░░░] X%                 │
│                                             │
│ Plan: Professional                          │
│ Estado: Activo                              │
│                                             │
│ [Cerrar]                                    │
└─────────────────────────────────────────────┘
```

## ⚠️ Importante

### Solo Super Admin puede:
- ✅ Ver la página de Tenants
- ✅ Crear nuevos tenants
- ✅ Editar tenants
- ✅ Suspender/Activar tenants
- ✅ Eliminar tenants
- ✅ Ver estadísticas globales

### Los usuarios normales:
- ❌ NO ven la opción "Tenants" en el menú
- ❌ NO pueden acceder a `/tenants`
- ✅ Solo ven datos de su propio tenant
- ✅ Están aislados de otros tenants

## 🧪 Prueba Rápida

### Test 1: Acceso como Super Admin
1. Login con `superadmin@sistema.com`
2. ¿Ves "Tenants" en el menú? ✅
3. ¿Puedes acceder a `/tenants`? ✅
4. ¿Ves el tenant "Clínica Demo"? ✅

### Test 2: Acceso como Admin del Tenant
1. Logout
2. Login con `admin@consentimientos.com`
3. ¿Ves "Tenants" en el menú? ❌ (correcto)
4. ¿Solo ves datos de Clínica Demo? ✅

### Test 3: Crear Nuevo Tenant
1. Login como super admin
2. Click en "Tenants"
3. Click en "+ Nuevo Tenant"
4. Completa el formulario:
   ```
   Nombre: Mi Nueva Clínica
   Slug: mi-nueva-clinica
   Estado: Activo
   Plan: Basic
   Max Usuarios: 10
   Max Sedes: 5
   Max Docs: 1000
   ```
5. Click en "Crear"
6. ¿Aparece en la lista? ✅

## 🎉 ¡Listo para Usar!

El sistema multi-tenant está completamente funcional. Puedes:

1. ✅ Gestionar múltiples tenants
2. ✅ Ver estadísticas globales y por tenant
3. ✅ Crear, editar, suspender y eliminar tenants
4. ✅ Aislamiento completo de datos entre tenants
5. ✅ Control de acceso basado en roles

## 📞 Enlaces Rápidos

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Tenants Page**: http://localhost:5173/tenants
- **Login**: http://localhost:5173/login

## 🔗 Documentación Adicional

- `GUIA_ACCESO_MULTITENANT.md` - Guía detallada paso a paso
- `IMPLEMENTACION_MULTITENANT_COMPLETADA.md` - Detalles técnicos
- `SISTEMA_MULTITENANT.md` - Especificación completa
