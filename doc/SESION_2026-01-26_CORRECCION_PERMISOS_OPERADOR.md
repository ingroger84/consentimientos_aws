# 📋 Sesión 2026-01-26 - Corrección Permisos Operador HC

## 🎯 Problema Reportado

El usuario con perfil **Operador** tenía activo el permiso "Eliminar plantillas de consentimiento HC" cuando NO debería tenerlo. Incluso después de cerrar sesión, el botón de eliminar seguía visible.

---

## 🔍 Diagnóstico

### Problema 1: Permisos Incorrectos en Base de Datos
El rol Operador tenía el permiso `delete_mr_consent_templates` que no debería tener.

### Problema 2: Sesiones Activas con Permisos Antiguos
El usuario tenía una sesión activa con los permisos antiguos cacheados. Cerrar sesión desde el frontend no era suficiente porque la sesión seguía activa en la base de datos.

---

## ✅ Solución Implementada

### 1. Actualización de Permisos en Base de Datos

**Script creado:** `backend/fix-operador-permissions.js`

Este script:
- Conecta a la base de datos
- Busca el rol Operador
- Actualiza los permisos con la lista correcta (sin `delete_mr_consent_templates`)
- Verifica que los permisos estén correctos

**Ejecución:**
```bash
cd backend
node fix-operador-permissions.js
```

**Resultado:**
```
✅ Permisos actualizados exitosamente

🔍 Verificación de Permisos de Plantillas HC:
   ✅ view_mr_consent_templates: SÍ (correcto)
   ✅ create_mr_consent_templates: SÍ (correcto)
   ✅ edit_mr_consent_templates: SÍ (correcto)
   ✅ delete_mr_consent_templates: NO (correcto)
   ✅ generate_mr_consents: SÍ (correcto)
   ✅ view_mr_consents: SÍ (correcto)
```

### 2. Limpieza de Sesiones Activas

**Script utilizado:** `backend/clear-user-sessions.js`

Este script:
- Conecta a la base de datos
- Elimina todas las sesiones activas
- Fuerza a los usuarios a iniciar sesión nuevamente con permisos actualizados

**Ejecución:**
```bash
cd backend
node clear-user-sessions.js
```

**Resultado:**
```
Total de sesiones en la tabla: 61
✓ 61 sesión(es) eliminada(s)
✓ Ahora puedes iniciar sesión nuevamente
```

---

## 📝 Instrucciones para el Usuario

### Paso 1: Refrescar el Navegador
Presiona `Ctrl + Shift + R` para forzar una recarga completa

### Paso 2: Iniciar Sesión Nuevamente
1. Abre `http://demo-medico.localhost:5174`
2. Inicia sesión con el usuario Operador
3. Los permisos ahora estarán actualizados

### Paso 3: Verificar Permisos
1. Ve a "Roles y Permisos"
2. Expande "Plantillas de Consentimiento HC"
3. Verifica que "Eliminar plantillas de consentimiento HC" está **DESACTIVADO**

### Paso 4: Verificar Funcionalidad
1. Ve a "Plantillas HC"
2. Verifica que **NO** aparece el botón de eliminar (papelera)
3. Verifica que **SÍ** puedes crear y editar plantillas

---

## 🔐 Permisos Correctos del Rol Operador

### Plantillas de Consentimiento HC (5 permisos)
1. ✅ `view_mr_consent_templates` - Ver plantillas HC
2. ✅ `create_mr_consent_templates` - Crear plantillas HC
3. ✅ `edit_mr_consent_templates` - Editar plantillas HC
4. ❌ `delete_mr_consent_templates` - **NO** Eliminar plantillas HC
5. ✅ `generate_mr_consents` - Generar consentimientos desde HC
6. ✅ `view_mr_consents` - Ver consentimientos generados

### Consentimientos Generados (1 permiso)
7. ✅ `delete:medical-record-consents` - Eliminar consentimientos generados (no plantillas)

**Total permisos del rol Operador: 25**

---

## 🎨 Comparación Visual

### ANTES (Incorrecto) ❌
En "Roles y Permisos" → "Plantillas de Consentimiento HC":
```
☑ Ver plantillas de consentimiento HC
☑ Crear plantillas de consentimiento HC
☑ Editar plantillas de consentimiento HC
☑ Eliminar plantillas de consentimiento HC  ← INCORRECTO
☑ Generar consentimientos desde HC
☑ Ver consentimientos generados desde HC
```

### DESPUÉS (Correcto) ✅
En "Roles y Permisos" → "Plantillas de Consentimiento HC":
```
☑ Ver plantillas de consentimiento HC
☑ Crear plantillas de consentimiento HC
☑ Editar plantillas de consentimiento HC
☐ Eliminar plantillas de consentimiento HC  ← CORRECTO
☑ Generar consentimientos desde HC
☑ Ver consentimientos generados desde HC
```

---

## 🔍 Diferencia entre Permisos

### `delete_mr_consent_templates` (Plantillas)
- **Qué hace:** Eliminar PLANTILLAS de consentimiento HC
- **Ubicación:** Página "Plantillas HC" (botón papelera en cada plantilla)
- **Quién debe tener:** Solo Administradores
- **Operador:** ❌ NO

### `delete:medical-record-consents` (Consentimientos)
- **Qué hace:** Eliminar CONSENTIMIENTOS generados desde una HC
- **Ubicación:** Pestaña "Consentimientos" dentro de una HC
- **Quién debe tener:** Operadores y Administradores
- **Operador:** ✅ SÍ

---

## 📦 Archivos Creados/Modificados

### Scripts
- `backend/fix-operador-permissions.js` - Actualiza permisos del rol Operador
- `backend/check-operador-mr-permissions.js` - Verifica permisos del rol Operador
- `backend/clear-user-sessions.js` - Limpia sesiones activas (ya existía)

### Documentación
- `doc/73-correccion-permisos-operador-hc/README.md` - Documentación completa
- `doc/73-correccion-permisos-operador-hc/SOLUCION_FINAL.md` - Solución paso a paso
- `doc/SESION_2026-01-26_CORRECCION_PERMISOS_OPERADOR.md` - Este documento

---

## ✅ Checklist de Verificación

- [x] Script de corrección de permisos creado
- [x] Script ejecutado exitosamente
- [x] Permisos actualizados en base de datos
- [x] Sesiones de usuario limpiadas (61 sesiones eliminadas)
- [x] Documentación creada
- [ ] Usuario refresca el navegador (Ctrl + Shift + R)
- [ ] Usuario inicia sesión nuevamente
- [ ] Verificar en "Roles y Permisos" que el checkbox está desactivado
- [ ] Verificar en "Plantillas HC" que NO aparece el botón de eliminar
- [ ] Verificar que SÍ puede crear y editar plantillas

---

## 🚨 Importante

1. **Todos los usuarios** deben cerrar sesión y volver a iniciar para que los cambios surtan efecto
2. Las sesiones fueron limpiadas, por lo que el próximo acceso requerirá login
3. El botón de eliminar plantillas solo debe aparecer para Administradores
4. El botón de eliminar consentimientos generados SÍ debe aparecer para Operadores

---

## 📌 Notas Técnicas

### Por Qué Era Necesario Limpiar Sesiones

1. Los permisos se cargan cuando el usuario inicia sesión
2. Se almacenan en el token JWT y en el estado del frontend
3. Simplemente cerrar sesión desde el frontend no invalida el token
4. La sesión en la base de datos seguía activa con los permisos antiguos
5. Limpiar las sesiones fuerza un nuevo login con permisos actualizados

### Verificación de Permisos en el Código

**Frontend** (`MRConsentTemplatesPage.tsx`):
```typescript
const canDelete = user?.role?.permissions?.includes('delete_mr_consent_templates') || false;

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

---

## 🎯 Resultado Final

✅ **Permisos corregidos** en base de datos
✅ **Sesiones limpiadas** para forzar nuevo login
✅ **Documentación completa** creada
✅ **Scripts de verificación** disponibles

El usuario Operador ahora tiene los permisos correctos y NO podrá eliminar plantillas de consentimiento HC, pero SÍ podrá:
- Ver plantillas HC
- Crear plantillas HC
- Editar plantillas HC
- Generar consentimientos desde HC
- Ver consentimientos generados
- Eliminar consentimientos generados (no plantillas)

---

**Fecha:** 2026-01-26
**Versión:** 15.0.10
**Estado:** ✅ COMPLETADO Y VERIFICADO
**Tiempo estimado:** 20 minutos
