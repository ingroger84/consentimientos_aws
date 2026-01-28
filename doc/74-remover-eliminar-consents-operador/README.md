# 🔧 Remover Permiso de Eliminar Consentimientos - Rol Operador

## 📋 Requisito

El usuario con perfil **Operador** NO debe poder eliminar consentimientos generados desde la historia clínica. Solo debe poder:
- ✅ Ver vista previa de consentimientos
- ✅ Reenviar el correo del consentimiento

La opción de eliminar solo debe estar disponible para roles que tengan el permiso activo en "Roles y Permisos".

---

## 🔍 Problema Detectado

El rol **Operador** tenía el permiso `delete:medical-record-consents` que le permitía eliminar consentimientos generados desde las historias clínicas.

### Permiso Incorrecto
- ❌ `delete:medical-record-consents` - Eliminar consentimientos generados desde HC

---

## 🔧 Solución Implementada

### Script Creado
`backend/remove-delete-consent-from-operador.js`

Este script:
1. Conecta a la base de datos
2. Busca el rol Operador
3. Remueve el permiso `delete:medical-record-consents`
4. Verifica que los permisos estén correctos

### Ejecución
```bash
cd backend
node remove-delete-consent-from-operador.js
```

### Resultado
```
✅ Conectado a la base de datos

📋 Rol: Operador (OPERADOR)
   ID: d763718a-693e-4152-8d8e-536b9c0684e5

📝 Permisos actuales:
   Total: 25 permisos

🔍 Permiso 'delete:medical-record-consents': SÍ ❌

⚠️  REMOVIENDO permiso 'delete:medical-record-consents'...
✅ Permiso removido exitosamente

📝 Permisos finales (24):

🔍 Verificación de Permisos de HC:
   ✅ view_mr_consent_templates: SÍ (correcto)
   ✅ create_mr_consent_templates: SÍ (correcto)
   ✅ edit_mr_consent_templates: SÍ (correcto)
   ✅ delete_mr_consent_templates: NO (correcto)
   ✅ generate_mr_consents: SÍ (correcto)
   ✅ view_mr_consents: SÍ (correcto)
   ✅ delete:medical-record-consents: NO (correcto)

✅ Todos los permisos están correctos
```

### Limpieza de Sesiones
```bash
cd backend
node clear-user-sessions.js
```

**Resultado:**
```
Total de sesiones en la tabla: 1
✓ 1 sesión(es) eliminada(s)
✓ Ahora puedes iniciar sesión nuevamente
```

---

## 📝 Permisos Finales del Rol Operador

### Permisos Generales (19)
1. `view_dashboard` - Ver dashboard
2. `view_consents` - Ver consentimientos
3. `create_consents` - Crear consentimientos
4. `edit_consents` - Editar consentimientos
5. `sign_consents` - Firmar consentimientos
6. `resend_consent_email` - Reenviar email de consentimientos
7. `view_branches` - Ver sedes
8. `view_services` - Ver servicios
9. `view_questions` - Ver preguntas
10. `view_clients` - Ver clientes
11. `create_clients` - Crear clientes
12. `edit_clients` - Editar clientes
13. `view_templates` - Ver plantillas
14. `view_medical_records` - Ver historias clínicas
15. `create_medical_records` - Crear historias clínicas
16. `close_medical_records` - Cerrar historias clínicas
17. `sign_medical_records` - Firmar historias clínicas
18. `export_medical_records` - Exportar historias clínicas
19. `view_invoices` - Ver facturas

### Permisos de Plantillas HC (5)
20. `view_mr_consent_templates` - Ver plantillas de consentimiento HC
21. `create_mr_consent_templates` - Crear plantillas de consentimiento HC
22. `edit_mr_consent_templates` - Editar plantillas de consentimiento HC
23. `generate_mr_consents` - Generar consentimientos desde HC
24. `view_mr_consents` - Ver consentimientos generados desde HC

**Total: 24 permisos** (se removió 1 permiso)

### Permisos Removidos
- ❌ `delete_mr_consent_templates` - Eliminar plantillas HC (nunca lo tuvo)
- ❌ `delete:medical-record-consents` - Eliminar consentimientos generados (REMOVIDO)

---

## 🧪 Instrucciones de Prueba

### 1. Refrescar el Navegador
Presiona `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)

### 2. Iniciar Sesión Nuevamente
1. Abre `http://demo-medico.localhost:5174`
2. Inicia sesión con el usuario Operador
3. Los permisos ahora estarán actualizados

### 3. Verificar en Historia Clínica
1. Ve a **"Historias Clínicas"**
2. Abre una HC que tenga consentimientos generados
3. Ve a la pestaña **"Consentimientos"**
4. Verifica que:
   - ✅ Aparece el botón de **Ver PDF** (icono de documento azul)
   - ✅ Aparece el botón de **Reenviar Email** (icono de sobre verde)
   - ❌ **NO** aparece el botón de **Eliminar** (icono de papelera roja)

### 4. Verificar Funcionalidad
1. Haz clic en **"Ver PDF"** → Debe abrir el modal con el PDF
2. Haz clic en **"Reenviar Email"** → Debe reenviar el email al paciente
3. El botón de **Eliminar** NO debe estar visible

---

## 🎨 Comparación Visual

### ANTES (Incorrecto) ❌
En la pestaña "Consentimientos" de una HC:
```
[📄 Ver PDF]  [✉️ Reenviar]  [🗑️ Eliminar]  ← Operador podía eliminar
```

### DESPUÉS (Correcto) ✅
En la pestaña "Consentimientos" de una HC:
```
[📄 Ver PDF]  [✉️ Reenviar]  ← Operador NO puede eliminar
```

---

## 🔐 Diferencia de Permisos por Rol

### Rol Operador
- ✅ Ver vista previa de consentimientos
- ✅ Reenviar email de consentimientos
- ❌ **NO** puede eliminar consentimientos generados
- ❌ **NO** puede eliminar plantillas HC

### Rol Administrador
- ✅ Ver vista previa de consentimientos
- ✅ Reenviar email de consentimientos
- ✅ **SÍ** puede eliminar consentimientos generados
- ✅ **SÍ** puede eliminar plantillas HC

---

## 📦 Archivos Creados

- `backend/remove-delete-consent-from-operador.js` - Script de corrección
- `doc/74-remover-eliminar-consents-operador/README.md` - Documentación

---

## ✅ Checklist de Verificación

- [x] Script de corrección creado
- [x] Script ejecutado exitosamente
- [x] Permiso `delete:medical-record-consents` removido del rol Operador
- [x] Sesiones de usuario limpiadas (1 sesión eliminada)
- [x] Documentación creada
- [ ] Usuario refresca el navegador (Ctrl + Shift + R)
- [ ] Usuario inicia sesión nuevamente
- [ ] Verificar en HC que NO aparece el botón de eliminar
- [ ] Verificar que SÍ aparecen los botones de ver PDF y reenviar email

---

## 📌 Notas Importantes

1. **Todos los usuarios** deben cerrar sesión y volver a iniciar para que los cambios surtan efecto
2. El botón de eliminar consentimientos solo debe aparecer para Administradores
3. El Operador puede ver y reenviar consentimientos, pero NO eliminarlos
4. El Operador tampoco puede eliminar plantillas HC
5. Los permisos se verifican tanto en el frontend como en el backend

---

## 🔍 Verificación Técnica

### Frontend (`ViewMedicalRecordPage.tsx`)
```typescript
const canDeleteConsents = user?.role?.permissions?.includes('delete:medical-record-consents') || false;

// Botón solo se muestra si canDeleteConsents es true
{canDeleteConsents && (
  <button onClick={() => handleDeleteConsent(item.id)}>
    <Trash2 className="w-5 h-5" />
  </button>
)}
```

### Backend (`medical-records.controller.ts`)
```typescript
@Delete(':id/consents/:consentId')
async deleteConsent(
  @Param('id') id: string,
  @Param('consentId') consentId: string,
  @Request() req: any,
) {
  // El PermissionsGuard verifica el permiso antes de ejecutar
  await this.medicalRecordsService.deleteConsent(
    id,
    consentId,
    req.user.tenantId,
    req.user.sub,
  );
  return { message: 'Consentimiento eliminado exitosamente' };
}
```

---

**Fecha:** 2026-01-26
**Versión:** 15.0.10
**Estado:** ✅ COMPLETADO
