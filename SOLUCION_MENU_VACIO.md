# ✅ Solución al Menú Vacío del Super Admin

## 🔍 Problema Identificado

El Super Admin puede ver el dashboard pero no ve el menú lateral. Esto se debe a que:

1. **Los permisos en localStorage están en formato antiguo** (no son un array)
2. **El transformer de permisos fue actualizado** pero el usuario tiene datos antiguos en caché
3. **El hook `usePermissions` no puede leer los permisos** porque no están en el formato correcto

## ✅ Solución

### Opción 1: Herramienta Automática de Diagnóstico y Corrección (RECOMENDADO)

1. **Accede a:** https://admin.archivoenlinea.com/check-user-permissions.html

2. **Verifica tus permisos:**
   - La página mostrará tus permisos actuales en localStorage
   - Te dirá si están en el formato correcto

3. **Haz clic en "Obtener Usuario Actual":**
   - Esto obtendrá tus permisos actualizados desde el servidor
   - Actualizará automáticamente tu localStorage

4. **Recarga la página del dashboard:**
   - Presiona F5 o Ctrl+R
   - Deberías ver el menú completo

### Opción 2: Refrescar Token (Desde el Dashboard)

Si ya estás en el dashboard:

1. **Busca el botón "Refrescar Permisos"** (ícono de refresh)
2. **Haz clic en él**
3. **La página se recargará automáticamente**
4. **Deberías ver el menú completo**

### Opción 3: Cerrar Sesión y Volver a Iniciar

1. **Cierra sesión** (botón de logout)
2. **Limpia el caché del navegador:**
   - Chrome/Edge: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Marca "Cookies" y "Caché"
3. **Vuelve a iniciar sesión**
4. **Deberías ver el menú completo**

### Opción 4: Limpiar Todo (Última Opción)

Si nada funciona:

1. **Accede a:** https://admin.archivoenlinea.com/check-user-permissions.html
2. **Haz clic en "Limpiar Todo y Recargar"** (botón rojo)
3. **Confirma la acción**
4. **Vuelve a iniciar sesión**

## 🔧 Qué Se Corrigió en el Backend

### 1. Transformer de Permisos Actualizado

**Archivo:** `backend/src/roles/entities/role.entity.ts`

**Antes:**
```typescript
transformer: {
  to: (value: string[]) => JSON.stringify(value || []),
  from: (value: string) => {
    if (!value) return [];
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return [];
    }
  }
}
```

**Después:**
```typescript
transformer: {
  to: (value: string[]) => {
    if (!value || value.length === 0) return '';
    if (typeof value === 'string') return value;
    return value.join(',');
  },
  from: (value: string) => {
    if (!value) return [];
    if (typeof value === 'string') {
      // Intentar parsear como JSON primero (compatibilidad)
      if (value.startsWith('[') || value.startsWith('{')) {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return value.split(',').map(p => p.trim()).filter(p => p.length > 0);
        }
      }
      // String separado por comas
      return value.split(',').map(p => p.trim()).filter(p => p.length > 0);
    }
    return Array.isArray(value) ? value : [];
  }
}
```

**Cambio:** Ahora el transformer puede leer permisos en formato de string separado por comas (como están en la base de datos) y convertirlos a array correctamente.

### 2. Backend Recompilado y Reiniciado

```bash
cd /home/ubuntu/consentimientos_aws/backend
NODE_OPTIONS='--max-old-space-size=2048' npm run build
pm2 restart datagree
```

## 📊 Verificación

### Permisos Correctos del Super Admin

El Super Admin debería tener **52 permisos**:

```
view_dashboard, view_global_stats, view_consents, create_consents,
edit_consents, delete_consents, sign_consents, resend_consent_email,
view_users, create_users, edit_users, delete_users, change_passwords,
view_roles, edit_roles, view_branches, create_branches, edit_branches,
delete_branches, view_services, create_services, edit_services,
delete_services, view_questions, create_questions, edit_questions,
delete_questions, view_clients, create_clients, edit_clients,
delete_clients, view_templates, create_templates, edit_templates,
delete_templates, view_mr_consent_templates, create_mr_consent_templates,
edit_mr_consent_templates, delete_mr_consent_templates, generate_mr_consents,
view_mr_consents, delete_mr_consents, view_medical_records,
create_medical_records, edit_medical_records, delete_medical_records,
close_medical_records, sign_medical_records, export_medical_records,
view_settings, edit_settings, manage_tenants
```

### Menú Que Deberías Ver

Como Super Admin, deberías ver:

**Principal:**
- Dashboard

**Gestión Clínica:**
- Historias Clínicas
- Consentimientos

**Plantillas:**
- Plantillas HC
- Plantillas CN

**Gestión de Datos:**
- Clientes
- Usuarios

**Organización:**
- Sedes
- Servicios
- Preguntas
- Roles y Permisos

**Administración:**
- Tenants
- Planes
- Facturación
- Impuestos

**Configuración:**
- Configuración

## 🆘 Si Aún No Funciona

1. **Abre la consola del navegador** (F12)
2. **Ve a la pestaña "Console"**
3. **Busca errores en rojo**
4. **Toma una captura de pantalla**
5. **Comparte la captura para análisis adicional**

También puedes verificar:

```javascript
// En la consola del navegador
const user = JSON.parse(localStorage.getItem('user'));
console.log('Permisos:', user.role.permissions);
console.log('Es array?', Array.isArray(user.role.permissions));
console.log('Cantidad:', user.role.permissions.length);
```

## 📝 Archivos Creados

1. `check-user-permissions.html` - Herramienta de diagnóstico y corrección
2. `SOLUCION_MENU_VACIO.md` - Este documento
3. `backend/src/roles/entities/role.entity.ts` - Transformer actualizado

## 🎯 Resultado Esperado

Después de aplicar cualquiera de las soluciones, deberías:

- ✓ Ver el menú lateral completo
- ✓ Tener acceso a todas las secciones según tu rol
- ✓ Ver 52 permisos en la herramienta de diagnóstico
- ✓ Poder navegar por todas las opciones del menú

---

**Fecha de solución:** 28 de enero de 2026, 04:00 AM
**Versión:** 19.0.0
**Estado:** ✅ Corrección aplicada en el backend
**Acción requerida:** Usuario debe refrescar sus permisos usando una de las opciones anteriores
