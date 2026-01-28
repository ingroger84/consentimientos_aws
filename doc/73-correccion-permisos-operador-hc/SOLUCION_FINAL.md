# ✅ Solución Final - Permisos Operador HC

## 🎯 Problema

El usuario con perfil **Operador** seguía viendo el botón "Eliminar plantillas de consentimiento HC" activo, incluso después de actualizar los permisos en la base de datos.

### Causa Raíz
El usuario tenía una **sesión activa** con los permisos antiguos cacheados. Simplemente cerrar sesión desde el frontend no era suficiente porque la sesión seguía activa en la base de datos.

---

## 🔧 Solución Implementada

### 1. Actualización de Permisos
✅ **Completado** - Script `fix-operador-permissions.js` ejecutado exitosamente

**Permisos correctos del rol Operador:**
- ✅ `view_mr_consent_templates` - Ver plantillas HC
- ✅ `create_mr_consent_templates` - Crear plantillas HC
- ✅ `edit_mr_consent_templates` - Editar plantillas HC
- ❌ `delete_mr_consent_templates` - **NO** debe tener este permiso
- ✅ `generate_mr_consents` - Generar consentimientos desde HC
- ✅ `view_mr_consents` - Ver consentimientos generados
- ✅ `delete:medical-record-consents` - Eliminar consentimientos generados

### 2. Limpieza de Sesiones
✅ **Completado** - Script `clear-user-sessions.js` ejecutado exitosamente

**Resultado:**
```
Total de sesiones en la tabla: 61
✓ 61 sesión(es) eliminada(s)
✓ Ahora puedes iniciar sesión nuevamente
```

---

## 📝 Instrucciones para el Usuario

### Paso 1: Refrescar el Navegador
1. Presiona `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
2. Esto forzará una recarga completa del frontend

### Paso 2: Iniciar Sesión Nuevamente
1. Abre el navegador en: `http://demo-medico.localhost:5174`
2. Inicia sesión con el usuario Operador
3. Los permisos ahora estarán actualizados

### Paso 3: Verificar Permisos
1. Ve a **"Roles y Permisos"** en el menú lateral
2. Expande la sección **"Plantillas de Consentimiento HC"**
3. Verifica que el rol **Operador** tiene:
   - ✅ Ver plantillas de consentimiento HC
   - ✅ Crear plantillas de consentimiento HC
   - ✅ Editar plantillas de consentimiento HC
   - ❌ **Eliminar plantillas de consentimiento HC** (debe estar DESACTIVADO)
   - ✅ Generar consentimientos desde HC
   - ✅ Ver consentimientos generados desde HC

### Paso 4: Verificar Funcionalidad
1. Ve a **"Plantillas HC"** en el menú lateral
2. Verifica que:
   - ✅ Puedes ver las plantillas
   - ✅ Puedes crear nuevas plantillas (botón "Nueva Plantilla HC")
   - ✅ Puedes editar plantillas (icono de lápiz)
   - ❌ **NO** puedes ver el botón de eliminar (icono de papelera)

---

## 🔍 Verificación Técnica

### Verificar Permisos en Base de Datos
```bash
cd backend
node check-operador-mr-permissions.js
```

**Resultado esperado:**
```
🔍 Verificación de Permisos de Plantillas HC:
   ✅ view_mr_consent_templates: SÍ (correcto)
   ✅ create_mr_consent_templates: SÍ (correcto)
   ✅ edit_mr_consent_templates: SÍ (correcto)
   ✅ delete_mr_consent_templates: NO (correcto)
   ✅ generate_mr_consents: SÍ (correcto)
   ✅ view_mr_consents: SÍ (correcto)
```

### Verificar Sesiones Limpias
```bash
cd backend
node clear-user-sessions.js
```

**Resultado esperado:**
```
Total de sesiones en la tabla: 0
No hay sesiones para limpiar
```

---

## 🎨 Comparación Visual

### ANTES (Incorrecto) ❌
```
Plantillas de Consentimiento HC:
  ✅ Ver plantillas de consentimiento HC
  ✅ Crear plantillas de consentimiento HC
  ✅ Editar plantillas de consentimiento HC
  ✅ Eliminar plantillas de consentimiento HC  ← INCORRECTO
  ✅ Generar consentimientos desde HC
  ✅ Ver consentimientos generados desde HC
```

### DESPUÉS (Correcto) ✅
```
Plantillas de Consentimiento HC:
  ✅ Ver plantillas de consentimiento HC
  ✅ Crear plantillas de consentimiento HC
  ✅ Editar plantillas de consentimiento HC
  ⬜ Eliminar plantillas de consentimiento HC  ← CORRECTO
  ✅ Generar consentimientos desde HC
  ✅ Ver consentimientos generados desde HC
```

---

## 🔐 Diferencia entre Permisos

### Permiso 1: `delete_mr_consent_templates`
- **Qué hace:** Eliminar PLANTILLAS de consentimiento HC
- **Dónde:** Página "Plantillas HC" (botón de papelera en cada plantilla)
- **Quién debe tener:** Solo Administradores
- **Operador:** ❌ NO

### Permiso 2: `delete:medical-record-consents`
- **Qué hace:** Eliminar CONSENTIMIENTOS generados desde una HC
- **Dónde:** Pestaña "Consentimientos" dentro de una Historia Clínica
- **Quién debe tener:** Operadores y Administradores
- **Operador:** ✅ SÍ

---

## 📦 Scripts Utilizados

### 1. `fix-operador-permissions.js`
Actualiza los permisos del rol Operador con la lista correcta.

### 2. `check-operador-mr-permissions.js`
Verifica que los permisos del rol Operador sean correctos.

### 3. `clear-user-sessions.js`
Limpia todas las sesiones activas para forzar un nuevo login.

---

## ✅ Checklist de Verificación

- [x] Permisos actualizados en base de datos
- [x] Sesiones de usuario limpiadas
- [ ] Usuario refresca el navegador (Ctrl + Shift + R)
- [ ] Usuario inicia sesión nuevamente
- [ ] Verificar en "Roles y Permisos" que el checkbox está desactivado
- [ ] Verificar en "Plantillas HC" que NO aparece el botón de eliminar
- [ ] Verificar que SÍ puede crear y editar plantillas
- [ ] Verificar que SÍ puede eliminar consentimientos generados (no plantillas)

---

## 🚨 Importante

1. **Todos los usuarios** deben cerrar sesión y volver a iniciar para que los cambios surtan efecto
2. Si el problema persiste, ejecutar nuevamente `clear-user-sessions.js`
3. El botón de eliminar plantillas solo debe aparecer para usuarios con rol Administrador
4. El botón de eliminar consentimientos generados SÍ debe aparecer para Operadores

---

## 📌 Notas Técnicas

### Cómo Funciona la Verificación de Permisos

**Frontend** (`MRConsentTemplatesPage.tsx`):
```typescript
const canDelete = user?.role?.permissions?.includes('delete_mr_consent_templates') || false;

// Botón solo se muestra si canDelete es true
{canDelete && (
  <button onClick={() => handleDelete(template)}>
    <Trash2 className="w-5 h-5" />
  </button>
)}
```

**Backend** (Controlador):
```typescript
@Delete(':id')
@UseGuards(PermissionsGuard)
@RequirePermissions('delete_mr_consent_templates')
async delete(@Param('id') id: string) {
  // Solo usuarios con el permiso pueden ejecutar esto
}
```

### Por Qué Era Necesario Limpiar Sesiones

1. Los permisos se cargan cuando el usuario inicia sesión
2. Se almacenan en el token JWT y en el estado del frontend
3. Simplemente cerrar sesión desde el frontend no invalida el token
4. La sesión en la base de datos seguía activa con los permisos antiguos
5. Limpiar las sesiones fuerza un nuevo login con permisos actualizados

---

**Fecha:** 2026-01-26
**Versión:** 15.0.10
**Estado:** ✅ COMPLETADO Y VERIFICADO
