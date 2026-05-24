# 📝 Explicación: Sistema de Logins - Multi-Tenant

## 🎯 Cómo Funciona el Sistema

El sistema tiene **DOS tipos de login diferentes**:

---

## 1️⃣ Login del Super Admin (Genérico)

### URL:
```
https://admin.archivoenlinea.com
```

### Características:
- ✅ Logo genérico: "Sistema de Consentimientos"
- ✅ Sin personalización
- ✅ Solo para super administradores
- ✅ Acceso a TODOS los tenants
- ✅ Gestión global del sistema

### Usuarios que pueden acceder:
- Super Admin (rcaraballo@innovasystems.com.co)

### Pantalla:
```
┌─────────────────────────────────────┐
│          [Logo Genérico S]          │
│                                     │
│    Sistema de Consentimientos       │
│    Ingresa tus credenciales         │
│                                     │
│    Email: ___________________       │
│    Contraseña: ______________       │
│                                     │
│    [Ingresar]                       │
│                                     │
│    Versión 92.3.1                   │
└─────────────────────────────────────┘
```

---

## 2️⃣ Login Personalizado por Tenant

### URLs (ejemplos):
```
https://termaleses.archivoenlinea.com
https://aquiub.archivoenlinea.com
https://hotelglampinglapolka.archivoenlinea.com
https://demo-medico.archivoenlinea.com
```

### Características:
- ✅ Logo personalizado del tenant
- ✅ Colores personalizados
- ✅ Nombre del tenant
- ✅ Solo usuarios de ese tenant
- ✅ Acceso limitado a datos del tenant

### Usuarios que pueden acceder:
- Administradores del tenant
- Operadores del tenant
- Usuarios del tenant

### Pantalla (ejemplo Termaleses):
```
┌─────────────────────────────────────┐
│      [Logo Termaleses]              │
│                                     │
│    Termaleses Espíritu Santo        │
│    Ingresa tus credenciales         │
│                                     │
│    Email: ___________________       │
│    Contraseña: ______________       │
│                                     │
│    [Ingresar]                       │
│                                     │
│    Versión 92.3.1                   │
└─────────────────────────────────────┘
```

---

## 🔍 Cómo Detecta el Sistema el Tenant

### Lógica en el Frontend:

```typescript
// Extraer el tenant slug del hostname
const hostname = window.location.hostname;
// Ejemplo: "termaleses.archivoenlinea.com"

const parts = hostname.split('.');
// parts = ["termaleses", "archivoenlinea", "com"]

let tenantSlug = null;

if (parts.length >= 3) {
  tenantSlug = parts[0]; // "termaleses"
}

// Si tenantSlug === "admin" → Login genérico
// Si tenantSlug !== "admin" → Login personalizado
```

---

## 📊 Matriz de URLs y Logins

| URL | Tipo de Login | Logo | Usuarios |
|-----|---------------|------|----------|
| `admin.archivoenlinea.com` | Genérico | S (genérico) | Super Admin |
| `termaleses.archivoenlinea.com` | Personalizado | Logo Termaleses | Usuarios Termaleses |
| `aquiub.archivoenlinea.com` | Personalizado | Logo Aquiub | Usuarios Aquiub |
| `hotelglampinglapolka.archivoenlinea.com` | Personalizado | Logo Hotel | Usuarios Hotel |
| `demo-medico.archivoenlinea.com` | Personalizado | Logo Demo | Usuarios Demo |

---

## ✅ Estado Actual del Sistema

### Verificación Realizada:

1. ✅ **Backend corriendo:** PM2 proceso "datagree" online
2. ✅ **Nginx configurado:** Soporte para `*.archivoenlinea.com`
3. ✅ **Frontend desplegado:** Versión 92.3.1
4. ✅ **Subdominios funcionando:** Configuración correcta

### Lo que Viste:

**URL accedida:** `https://admin.archivoenlinea.com/login?v=92.3.1`

**Login mostrado:** Genérico (correcto para esa URL)

```
Sistema de Consentimientos
Ingresa tus credenciales
```

✅ **ESTO ES CORRECTO** - Es el login del super admin

---

## 🎯 Cómo Acceder a los Logins Personalizados

### Paso 1: Identificar el Slug del Tenant

Puedes ver los slugs en el panel de super admin:
- Termaleses Espíritu Santo → `termaleses`
- Aquiub Casa de Pestañas → `aquiub`
- Hotel Glamping La Polka → `hotelglampinglapolka`

### Paso 2: Construir la URL

```
https://[slug].archivoenlinea.com
```

### Paso 3: Acceder

**Ejemplos:**

1. **Termaleses:**
   ```
   https://termaleses.archivoenlinea.com
   ```
   Verás el logo y colores de Termaleses

2. **Aquiub:**
   ```
   https://aquiub.archivoenlinea.com
   ```
   Verás el logo y colores de Aquiub

3. **Hotel Glamping:**
   ```
   https://hotelglampinglapolka.archivoenlinea.com
   ```
   Verás el logo y colores del Hotel

---

## 🔧 Verificación de Logins Personalizados

### Comando para Ver Todos los Tenants:

```sql
SELECT 
  name,
  slug,
  status,
  plan
FROM tenants
WHERE deleted_at IS NULL
ORDER BY name;
```

### Resultado Esperado:

| Nombre | Slug | Status | Plan |
|--------|------|--------|------|
| Aquiub Casa de Pestañas | aquiub | active | professional |
| Demo Estetica | demo-estetica | suspended | professional |
| Demo Médico | demo-medico | active | professional |
| Hotel Glamping La Polka | hotelglampinglapolka | active | basic |
| Termaleses Espíritu Santo | termaleses | active | professional |

### URLs de Login Personalizadas:

1. ✅ `https://aquiub.archivoenlinea.com`
2. ✅ `https://demo-estetica.archivoenlinea.com` (suspendido)
3. ✅ `https://demo-medico.archivoenlinea.com`
4. ✅ `https://hotelglampinglapolka.archivoenlinea.com`
5. ✅ `https://termaleses.archivoenlinea.com`

---

## 🎨 Personalización por Tenant

Cada tenant puede tener:

1. **Logo personalizado:**
   - Subido desde el panel de configuración
   - Almacenado en la base de datos
   - Mostrado en el login

2. **Colores personalizados:**
   - Color primario
   - Color secundario
   - Aplicados en toda la interfaz

3. **Nombre del tenant:**
   - Mostrado en el login
   - Mostrado en el header
   - Mostrado en los PDFs

---

## 📝 Resumen

### ¿Por qué ves el login genérico?

Porque estás accediendo a `admin.archivoenlinea.com`, que es el dominio del **super admin**.

### ¿Cómo ver los logins personalizados?

Accede a las URLs de los tenants:
- `https://termaleses.archivoenlinea.com`
- `https://aquiub.archivoenlinea.com`
- `https://hotelglampinglapolka.archivoenlinea.com`

### ¿El sistema está funcionando correctamente?

✅ **SÍ**, el sistema está funcionando correctamente. Solo necesitas acceder a la URL correcta según el tipo de login que quieras ver.

---

## 🔍 Prueba Rápida

### 1. Login Super Admin (Genérico):
```
URL: https://admin.archivoenlinea.com
Usuario: rcaraballo@innovasystems.com.co
Contraseña: [tu contraseña]
```

### 2. Login Termaleses (Personalizado):
```
URL: https://termaleses.archivoenlinea.com
Usuario: [usuario de termaleses]
Contraseña: [contraseña]
```

### 3. Login Aquiub (Personalizado):
```
URL: https://aquiub.archivoenlinea.com
Usuario: [usuario de aquiub]
Contraseña: [contraseña]
```

---

**Fecha:** 2026-05-04  
**Versión:** 92.3.1  
**Estado:** ✅ SISTEMA FUNCIONANDO CORRECTAMENTE

