# 🚀 Guía de Acceso al Sistema Multi-Tenant

## 📋 Requisitos Previos

Antes de acceder, asegúrate de que:

1. ✅ La base de datos PostgreSQL esté corriendo
2. ✅ Las migraciones se hayan ejecutado (`npm run migration:run`)
3. ✅ El seed se haya ejecutado (`npm run seed`)
4. ✅ El backend esté corriendo en puerto 3000
5. ✅ El frontend esté corriendo en puerto 5173

## 🔧 Paso 1: Iniciar el Sistema

### 1.1 Iniciar Backend
```bash
cd backend
npm run start:dev
```

Deberías ver:
```
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG Application is running on: http://localhost:3000
```

### 1.2 Iniciar Frontend
```bash
cd frontend
npm run dev
```

Deberías ver:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

## 🔐 Paso 2: Acceder como Super Admin

### 2.1 Abrir el Navegador
Abre tu navegador y ve a: **http://localhost:5173**

### 2.2 Iniciar Sesión
En la página de login, ingresa las credenciales del Super Admin:

```
📧 Email: superadmin@sistema.com
🔑 Password: superadmin123
```

### 2.3 Verificar Acceso
Después de iniciar sesión, deberías ver:
- ✅ El dashboard principal
- ✅ En el menú lateral, una opción llamada **"Tenants"** (solo visible para super_admin)

## 🏢 Paso 3: Acceder a la Gestión de Tenants

### 3.1 Hacer Click en "Tenants"
En el menú lateral izquierdo, busca y haz click en la opción **"Tenants"**

### 3.2 Vista de Tenants
Deberías ver:

#### Estadísticas Globales (arriba)
- **Total Tenants**: Número total de tenants en el sistema
- **Activos**: Tenants con estado activo
- **En Prueba**: Tenants en período de prueba
- **Suspendidos**: Tenants suspendidos

#### Recursos Totales
- Total de usuarios en todos los tenants
- Total de sedes
- Total de servicios
- Total de consentimientos

#### Distribución de Planes
- Gráfico de barras mostrando cuántos tenants hay en cada plan (Free, Basic, Professional, Enterprise)

#### Filtros
- 🔍 **Búsqueda**: Por nombre, slug o email
- 📊 **Estado**: Filtrar por Activo, Prueba, Suspendido, Expirado
- 💼 **Plan**: Filtrar por Free, Basic, Professional, Enterprise

#### Listado de Tenants
Verás tarjetas (cards) con cada tenant, mostrando:
- 🏢 Nombre del tenant
- 🔗 Slug (identificador único)
- 🟢 Estado (badge de color)
- 💎 Plan (badge de color)
- 📧 Email de contacto
- 👤 Nombre de contacto
- 📊 Límites:
  - Usuarios (actual/máximo)
  - Sedes (actual/máximo)
  - Documentos (actual/máximo)
- 📅 Fecha de creación

## 🎯 Paso 4: Acciones Disponibles

### 4.1 Crear Nuevo Tenant
1. Click en el botón **"+ Nuevo Tenant"** (arriba a la derecha)
2. Completa el formulario:

   **Información Básica:**
   - Nombre (ej: "Clínica Dental XYZ")
   - Slug (ej: "clinica-xyz", solo minúsculas y guiones)
   - Estado (Prueba, Activo, Suspendido, Expirado)
   - Plan (Free, Basic, Professional, Enterprise)

   **Información de Contacto:**
   - Nombre de contacto
   - Email de contacto
   - Teléfono de contacto

   **Límites del Plan:**
   - Máximo de usuarios
   - Máximo de sedes
   - Máximo de consentimientos

3. Click en **"Crear"**

### 4.2 Ver Estadísticas de un Tenant
1. En la tarjeta del tenant, click en el menú **⋮** (tres puntos)
2. Selecciona **"Ver Estadísticas"**
3. Verás un modal con:
   - 📊 Resumen de uso de recursos
   - 📈 Barras de progreso (verde < 70%, amarillo 70-90%, rojo > 90%)
   - ⚠️ Alertas si algún recurso está cerca del límite
   - 📋 Información del plan y fechas

### 4.3 Editar un Tenant
1. En la tarjeta del tenant, click en el menú **⋮**
2. Selecciona **"Editar"**
3. Modifica los campos necesarios
4. Click en **"Actualizar"**

### 4.4 Suspender un Tenant
1. En la tarjeta del tenant, click en el menú **⋮**
2. Selecciona **"Suspender"**
3. Confirma la acción
4. El tenant cambiará a estado "Suspendido" (badge rojo)
5. Los usuarios de ese tenant no podrán acceder al sistema

### 4.5 Activar un Tenant
1. En la tarjeta de un tenant suspendido, click en el menú **⋮**
2. Selecciona **"Activar"**
3. El tenant cambiará a estado "Activo" (badge verde)
4. Los usuarios de ese tenant podrán acceder nuevamente

### 4.6 Eliminar un Tenant
1. En la tarjeta del tenant, click en el menú **⋮**
2. Selecciona **"Eliminar"**
3. Confirma la acción (⚠️ Esta acción no se puede deshacer)
4. El tenant será eliminado (soft delete)

## 👥 Paso 5: Acceder como Usuario de un Tenant

### 5.1 Cerrar Sesión del Super Admin
1. Click en el botón de logout (icono de salida) en la parte inferior del menú

### 5.2 Iniciar Sesión como Admin del Tenant
```
📧 Email: admin@consentimientos.com
🔑 Password: admin123
```

### 5.3 Verificar Aislamiento de Datos
Después de iniciar sesión como admin del tenant, deberías ver:
- ✅ Solo los datos del tenant "Clínica Demo"
- ❌ NO verás la opción "Tenants" en el menú (solo super_admin la ve)
- ✅ Solo verás usuarios, sedes, servicios y consentimientos de tu tenant

## 🔍 Paso 6: Verificar el Tenant Demo

El seed creó un tenant de ejemplo con estos datos:

### Tenant: Clínica Demo
- **Nombre**: Clínica Demo
- **Slug**: clinica-demo
- **Estado**: Activo
- **Plan**: Professional
- **Contacto**: admin@clinicademo.com
- **Límites**:
  - Usuarios: 50
  - Sedes: 20
  - Consentimientos: 5000

### Sedes del Tenant
1. **Sede Principal**
   - Dirección: Calle 123 #45-67, Bogotá
   - Teléfono: +57 1 234 5678

2. **Sede Norte**
   - Dirección: Carrera 45 #123-45, Bogotá
   - Teléfono: +57 1 345 6789

### Usuarios del Tenant
1. **Admin Sistema**
   - Email: admin@consentimientos.com
   - Password: admin123
   - Rol: Administrador General
   - Acceso: Ambas sedes

2. **Operador Sede**
   - Email: operador@consentimientos.com
   - Password: operador123
   - Rol: Operador
   - Acceso: Solo Sede Principal

## 🎨 Colores de Estados

### Estados de Tenant
- 🟢 **Activo**: Verde (bg-green-100 text-green-800)
- 🔵 **Prueba**: Azul (bg-blue-100 text-blue-800)
- 🔴 **Suspendido**: Rojo (bg-red-100 text-red-800)
- ⚫ **Expirado**: Gris (bg-gray-100 text-gray-800)

### Planes
- ⚫ **Free**: Gris (bg-gray-100 text-gray-800)
- 🔵 **Basic**: Azul (bg-blue-100 text-blue-800)
- 🟣 **Professional**: Púrpura (bg-purple-100 text-purple-800)
- 🟡 **Enterprise**: Amarillo (bg-yellow-100 text-yellow-800)

### Uso de Recursos
- 🟢 **< 70%**: Verde (todo bien)
- 🟡 **70-90%**: Amarillo (advertencia)
- 🔴 **> 90%**: Rojo (crítico)

## 🐛 Solución de Problemas

### No veo la opción "Tenants" en el menú
- ✅ Verifica que iniciaste sesión con superadmin@sistema.com
- ✅ Solo el rol super_admin puede ver esta opción
- ✅ Cierra sesión y vuelve a iniciar con las credenciales correctas

### Error al crear tenant
- ✅ Verifica que el slug sea único (no puede repetirse)
- ✅ El slug solo puede contener letras minúsculas, números y guiones
- ✅ Todos los campos marcados con * son obligatorios

### No puedo suspender un tenant
- ✅ Solo el super_admin puede suspender tenants
- ✅ Verifica que tengas los permisos correctos

### Las estadísticas no se cargan
- ✅ Verifica que el backend esté corriendo
- ✅ Abre la consola del navegador (F12) para ver errores
- ✅ Verifica que el endpoint `/tenants/:id/stats` responda correctamente

## 📸 Capturas de Pantalla Esperadas

### 1. Login del Super Admin
```
┌─────────────────────────────────┐
│   Sistema de Consentimientos    │
│                                 │
│   Email: [superadmin@sistema.com]│
│   Password: [••••••••••••••]    │
│                                 │
│   [    Iniciar Sesión    ]      │
└─────────────────────────────────┘
```

### 2. Menú con Opción Tenants
```
┌──────────────┐
│ 📊 Dashboard │
│ 📄 Consentim.│
│ 👥 Usuarios  │
│ 🛡️ Roles     │
│ 🏢 Sedes     │
│ 💼 Servicios │
│ ❓ Preguntas │
│ ⚙️ Config.   │
│ 🏢 Tenants   │ ← Solo super_admin
└──────────────┘
```

### 3. Página de Tenants
```
┌────────────────────────────────────────────────┐
│ Gestión de Tenants    [+ Nuevo Tenant]        │
├────────────────────────────────────────────────┤
│ Estadísticas Globales                          │
│ [Total: 1] [Activos: 1] [Prueba: 0] [Susp: 0]│
├────────────────────────────────────────────────┤
│ [🔍 Buscar] [Estado ▼] [Plan ▼]               │
├────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐             │
│ │ 🏢 Clínica   │ │ 🏢 Otro      │             │
│ │    Demo      │ │    Tenant    │             │
│ │ /clinica-demo│ │ /otro-tenant │             │
│ │ 🟢 Activo    │ │ 🔵 Prueba    │             │
│ │ 🟣 Professional│ │ ⚫ Free      │             │
│ │ ⋮            │ │ ⋮            │             │
│ └──────────────┘ └──────────────┘             │
└────────────────────────────────────────────────┘
```

## ✅ Checklist de Verificación

Marca cada item cuando lo hayas verificado:

- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] Puedo acceder a http://localhost:5173
- [ ] Puedo iniciar sesión con superadmin@sistema.com
- [ ] Veo la opción "Tenants" en el menú
- [ ] Puedo acceder a la página de Tenants
- [ ] Veo las estadísticas globales
- [ ] Veo el tenant "Clínica Demo"
- [ ] Puedo crear un nuevo tenant
- [ ] Puedo editar un tenant
- [ ] Puedo ver estadísticas de un tenant
- [ ] Puedo suspender un tenant
- [ ] Puedo activar un tenant
- [ ] Los filtros funcionan correctamente
- [ ] Puedo cerrar sesión
- [ ] Puedo iniciar sesión como admin@consentimientos.com
- [ ] Como admin del tenant, NO veo la opción "Tenants"
- [ ] Como admin del tenant, solo veo datos de mi tenant

## 🎉 ¡Listo!

Si completaste todos los pasos del checklist, el sistema multi-tenant está funcionando correctamente.

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del backend en la terminal
2. Revisa la consola del navegador (F12)
3. Verifica que la base de datos tenga los datos del seed
4. Asegúrate de que todos los servicios estén corriendo
