# 👥 Crear Tenant con Usuario Administrador

## ✅ Funcionalidad Implementada

Se ha implementado la creación automática del usuario administrador al crear un nuevo tenant.

## 📋 Descripción

Cuando el Super Admin crea un nuevo tenant desde la interfaz web, ahora debe proporcionar también los datos del usuario administrador que gestionará ese tenant.

### Características Principales

1. **Creación Simultánea**: El tenant y su administrador se crean en una sola transacción
2. **Validación Completa**: Se validan todos los campos antes de crear
3. **Email Único**: El email del administrador debe ser único en todo el sistema
4. **Contraseña Segura**: Mínimo 6 caracteres
5. **Rol Automático**: Se asigna automáticamente el rol "Administrador General"
6. **Asociación Automática**: El usuario queda vinculado al tenant creado

## 🚀 Cómo Usar

### Paso 1: Acceder como Super Admin

```
URL: http://localhost:5173/login
Email: superadmin@sistema.com
Password: superadmin123
```

### Paso 2: Ir a Gestión de Tenants

1. Click en **"Tenants"** en el menú lateral
2. Click en **"+ Nuevo Tenant"**

### Paso 3: Completar el Formulario

El formulario ahora tiene 4 secciones:

#### 1. Información Básica
```
Nombre: Mi Clínica Dental
Slug: mi-clinica-dental
Estado: Activo
Plan: Professional
```

#### 2. Información de Contacto (Opcional)
```
Nombre de Contacto: Juan Pérez
Email de Contacto: contacto@miclinica.com
Teléfono: +57 300 123 4567
```

#### 3. Usuario Administrador del Tenant (NUEVO - Requerido)
```
Nombre Completo: Juan Pérez
Email (Usuario de acceso): admin@miclinica.com
Contraseña: (mínimo 6 caracteres)
```

**Nota importante**: Esta sección solo aparece al crear un nuevo tenant, no al editar.

#### 4. Límites del Plan
```
Máximo de Usuarios: 50
Máximo de Sedes: 20
Máximo de Consentimientos: 5000
```

### Paso 4: Crear Tenant

1. Click en **"Crear"**
2. El sistema creará:
   - ✅ El tenant
   - ✅ El usuario administrador
   - ✅ La asociación entre ambos

### Paso 5: El Administrador Puede Iniciar Sesión

El administrador creado puede iniciar sesión inmediatamente:

```
URL: http://localhost:5173/login
Email: admin@miclinica.com (el que configuraste)
Password: (la que configuraste)
```

## 🔐 Permisos del Administrador del Tenant

El usuario administrador creado tiene:

### Rol Asignado
- **Administrador General** (ADMIN_GENERAL)

### Permisos Completos
- ✅ Ver dashboard
- ✅ Gestionar consentimientos (crear, editar, eliminar)
- ✅ Gestionar usuarios (crear, editar, eliminar, cambiar contraseñas)
- ✅ Gestionar roles
- ✅ Gestionar sedes (crear, editar, eliminar)
- ✅ Gestionar servicios (crear, editar, eliminar)
- ✅ Gestionar preguntas (crear, editar, eliminar)
- ✅ Ver y editar configuración

### Restricciones
- ❌ NO puede ver otros tenants
- ❌ NO puede gestionar tenants
- ❌ NO puede ver estadísticas globales
- ❌ Solo ve datos de su propio tenant

## 📊 Flujo Técnico

### Backend

1. **Validación**:
   - Verifica que el slug del tenant sea único
   - Verifica que el email del administrador sea único
   - Valida que la contraseña tenga mínimo 6 caracteres

2. **Transacción**:
   ```typescript
   BEGIN TRANSACTION
     1. Crear Tenant
     2. Obtener Rol "Administrador General"
     3. Hashear contraseña
     4. Crear Usuario Administrador
     5. Asociar Usuario con Tenant
   COMMIT TRANSACTION
   ```

3. **Rollback Automático**:
   - Si algo falla, se deshacen todos los cambios
   - No queda tenant sin administrador
   - No queda administrador sin tenant

### Frontend

1. **Formulario Dinámico**:
   - Al crear: Muestra sección de administrador (requerida)
   - Al editar: Oculta sección de administrador

2. **Validaciones**:
   - Campos requeridos marcados con *
   - Email válido
   - Contraseña mínimo 6 caracteres
   - Números positivos para límites

## ⚠️ Validaciones y Errores

### Errores Comunes

#### "El slug ya está en uso"
**Causa**: Ya existe un tenant con ese slug
**Solución**: Usa un slug diferente (ej: mi-clinica-2)

#### "El email del administrador ya está en uso"
**Causa**: Ya existe un usuario con ese email
**Solución**: Usa un email diferente

#### "La contraseña debe tener al menos 6 caracteres"
**Causa**: Contraseña muy corta
**Solución**: Usa una contraseña más larga

#### "Todos los campos del administrador son requeridos"
**Causa**: Falta completar algún campo del administrador
**Solución**: Completa nombre, email y contraseña

## 🔄 Diferencias entre Crear y Editar

### Al Crear Tenant
- ✅ Sección de administrador visible y requerida
- ✅ Se crea el usuario administrador automáticamente
- ✅ El administrador puede iniciar sesión inmediatamente

### Al Editar Tenant
- ❌ Sección de administrador NO visible
- ✅ Solo se editan datos del tenant
- ✅ Los usuarios existentes no se modifican

## 📧 Email de Bienvenida (Próximamente)

En una futura versión, el sistema enviará automáticamente un email al administrador con:
- Credenciales de acceso
- Enlace de activación
- Instrucciones de uso
- Información del tenant

Por ahora, debes comunicar las credenciales manualmente al administrador.

## 🧪 Ejemplo Completo

### Crear Tenant "Clínica Dental ABC"

```json
{
  "name": "Clínica Dental ABC",
  "slug": "clinica-dental-abc",
  "status": "active",
  "plan": "professional",
  "contactName": "María García",
  "contactEmail": "contacto@clinicaabc.com",
  "contactPhone": "+57 300 123 4567",
  "maxUsers": 50,
  "maxBranches": 20,
  "maxConsents": 5000,
  "adminUser": {
    "name": "Dr. Juan Pérez",
    "email": "admin@clinicaabc.com",
    "password": "Admin123!"
  }
}
```

### Resultado

1. **Tenant Creado**:
   - ID: (generado automáticamente)
   - Nombre: Clínica Dental ABC
   - Slug: clinica-dental-abc
   - Estado: Activo
   - Plan: Professional

2. **Usuario Administrador Creado**:
   - Nombre: Dr. Juan Pérez
   - Email: admin@clinicaabc.com
   - Rol: Administrador General
   - Tenant: Clínica Dental ABC
   - Puede iniciar sesión: ✅

## 🎯 Casos de Uso

### Caso 1: Nuevo Cliente
1. Super Admin crea tenant para nuevo cliente
2. Proporciona datos del administrador del cliente
3. Cliente recibe credenciales
4. Cliente inicia sesión y configura su sistema

### Caso 2: Demo/Prueba
1. Super Admin crea tenant de prueba
2. Crea usuario administrador temporal
3. Realiza demostración
4. Puede eliminar tenant después

### Caso 3: Migración
1. Super Admin crea tenant para cliente existente
2. Crea administrador con datos del cliente
3. Cliente migra sus datos
4. Cliente comienza a usar el sistema

## 📋 Checklist de Verificación

Después de crear un tenant, verifica:

- [ ] El tenant aparece en la lista de tenants
- [ ] El tenant tiene el estado correcto
- [ ] El tenant tiene el plan correcto
- [ ] Puedes ver las estadísticas del tenant
- [ ] El administrador puede iniciar sesión
- [ ] El administrador solo ve datos de su tenant
- [ ] El administrador puede crear usuarios
- [ ] El administrador puede crear sedes
- [ ] El administrador puede crear servicios

## 🔧 Troubleshooting

### El administrador no puede iniciar sesión
**Verificar**:
1. Email correcto (sin espacios)
2. Contraseña correcta (case-sensitive)
3. Usuario fue creado (verificar en base de datos)
4. Tenant está activo

### El administrador ve datos de otros tenants
**Problema**: Error en la asociación
**Solución**: Verificar que el usuario tenga tenantId correcto

### Error al crear tenant
**Verificar**:
1. Todos los campos requeridos están completos
2. Email del administrador es único
3. Slug del tenant es único
4. Backend está corriendo
5. Base de datos está accesible

## 🎉 Beneficios

### Para el Super Admin
- ✅ Proceso simplificado (un solo paso)
- ✅ No olvida crear el administrador
- ✅ Menos errores de configuración
- ✅ Más rápido

### Para el Cliente
- ✅ Acceso inmediato
- ✅ Puede empezar a configurar de inmediato
- ✅ No necesita esperar creación de usuario
- ✅ Mejor experiencia de onboarding

### Para el Sistema
- ✅ Integridad de datos garantizada
- ✅ No hay tenants sin administrador
- ✅ Transacciones atómicas
- ✅ Rollback automático en errores

## 📚 Documentación Técnica

### Archivos Modificados

#### Backend
- `backend/src/tenants/dto/create-tenant.dto.ts` - Agregado AdminUserDto
- `backend/src/tenants/tenants.service.ts` - Lógica de creación con transacción
- `backend/src/tenants/tenants.module.ts` - Agregadas dependencias

#### Frontend
- `frontend/src/types/tenant.ts` - Agregado AdminUserDto
- `frontend/src/components/TenantFormModal.tsx` - Agregada sección de administrador

### API Endpoint

```
POST /tenants
Content-Type: application/json
Authorization: Bearer {super_admin_token}

Body:
{
  "name": "string",
  "slug": "string (optional)",
  "status": "active|trial|suspended|expired (optional)",
  "plan": "free|basic|professional|enterprise (optional)",
  "contactName": "string (optional)",
  "contactEmail": "string (optional)",
  "contactPhone": "string (optional)",
  "maxUsers": number (optional),
  "maxBranches": number (optional)",
  "maxConsents": number (optional)",
  "adminUser": {
    "name": "string (required)",
    "email": "string (required)",
    "password": "string (required, min 6 chars)"
  }
}

Response 201:
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  ...
}
```

## 🔐 Seguridad

### Contraseñas
- ✅ Hasheadas con bcrypt (10 rounds)
- ✅ Nunca se almacenan en texto plano
- ✅ Nunca se devuelven en respuestas API

### Validaciones
- ✅ Email único en todo el sistema
- ✅ Slug único en todo el sistema
- ✅ Contraseña mínimo 6 caracteres
- ✅ Todos los campos requeridos validados

### Transacciones
- ✅ Creación atómica (todo o nada)
- ✅ Rollback automático en errores
- ✅ No quedan datos inconsistentes

## 🎓 Próximos Pasos

Después de crear el tenant y su administrador:

1. **El administrador debe**:
   - Iniciar sesión
   - Cambiar su contraseña (recomendado)
   - Crear sedes
   - Crear servicios
   - Crear preguntas
   - Crear usuarios adicionales

2. **El Super Admin puede**:
   - Ver estadísticas del tenant
   - Suspender/activar el tenant
   - Cambiar el plan del tenant
   - Ver uso de recursos

¡El sistema está listo para que cada tenant gestione sus propios datos de forma independiente! 🎉


---

## 🔧 Corrección Aplicada: Reutilización de Slugs

### Problema Identificado

Inicialmente, al intentar crear un tenant con un slug que había sido usado previamente por un tenant eliminado (soft delete), el sistema arrojaba el error:

```
duplicate key value violates unique constraint "UQ_32731f181236a46182a38c992a8"
```

### Causa

El sistema usa **soft delete** para tenants (marca `deleted_at` en lugar de eliminar físicamente). La constraint UNIQUE original en la columna `slug` no excluía registros eliminados, impidiendo la reutilización de slugs.

### Solución

Se creó la migración `1736060000000-FixTenantSlugUniqueConstraint.ts` que:

1. Elimina la constraint UNIQUE original
2. Crea un **índice único parcial** que solo aplica a registros no eliminados:
   ```sql
   CREATE UNIQUE INDEX "IDX_tenants_slug_not_deleted" 
   ON "tenants" ("slug") 
   WHERE "deleted_at" IS NULL
   ```

### Resultado

✅ Ahora puedes reutilizar slugs de tenants eliminados  
✅ La unicidad se mantiene para tenants activos  
✅ Mensajes de error más claros en el frontend  

### Ejemplo

```
1. Crear tenant con slug "demo" → ✅ Éxito
2. Eliminar tenant "demo" → ✅ Soft delete
3. Crear nuevo tenant con slug "demo" → ✅ Éxito (antes fallaba)
```

Para más detalles técnicos, ver: `doc/CORRECCION_SLUG_TENANT.md`

---

**Última actualización**: 5 de enero de 2026  
**Estado**: ✅ Completamente Funcional
