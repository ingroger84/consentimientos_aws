# 📋 Sesión 2026-01-26 - Corrección Final Permisos Operador

## 🎯 Requisitos del Usuario

El usuario con perfil **Operador** debe tener las siguientes restricciones:

### En Plantillas HC
- ✅ Ver plantillas de consentimiento HC
- ✅ Crear plantillas de consentimiento HC
- ✅ Editar plantillas de consentimiento HC
- ❌ **NO** puede eliminar plantillas de consentimiento HC

### En Consentimientos Generados (dentro de HC)
- ✅ Ver vista previa de consentimientos
- ✅ Reenviar email de consentimientos
- ❌ **NO** puede eliminar consentimientos generados

---

## 🔧 Correcciones Realizadas

### Corrección 1: Remover Permiso de Eliminar Plantillas HC
**Permiso removido:** `delete_mr_consent_templates`

**Script:** `backend/fix-operador-permissions.js`

**Resultado:**
```
✅ delete_mr_consent_templates: NO (correcto)
```

### Corrección 2: Remover Permiso de Eliminar Consentimientos Generados
**Permiso removido:** `delete:medical-record-consents`

**Script:** `backend/remove-delete-consent-from-operador.js`

**Resultado:**
```
✅ delete:medical-record-consents: NO (correcto)
```

### Corrección 3: Limpieza de Sesiones
**Script:** `backend/clear-user-sessions.js`

**Resultado:**
```
✓ 1 sesión(es) eliminada(s)
```

---

## 📝 Permisos Finales del Rol Operador

### Total: 24 permisos

#### Permisos Generales (19)
1. `view_dashboard`
2. `view_consents`
3. `create_consents`
4. `edit_consents`
5. `sign_consents`
6. `resend_consent_email`
7. `view_branches`
8. `view_services`
9. `view_questions`
10. `view_clients`
11. `create_clients`
12. `edit_clients`
13. `view_templates`
14. `view_medical_records`
15. `create_medical_records`
16. `close_medical_records`
17. `sign_medical_records`
18. `export_medical_records`
19. `view_invoices`

#### Permisos de Plantillas HC (5)
20. `view_mr_consent_templates` - Ver plantillas HC
21. `create_mr_consent_templates` - Crear plantillas HC
22. `edit_mr_consent_templates` - Editar plantillas HC
23. `generate_mr_consents` - Generar consentimientos desde HC
24. `view_mr_consents` - Ver consentimientos generados

#### Permisos NO Incluidos (Correctamente Removidos)
- ❌ `delete_mr_consent_templates` - Eliminar plantillas HC
- ❌ `delete:medical-record-consents` - Eliminar consentimientos generados

---

## 🧪 Instrucciones de Prueba

### Paso 1: Refrescar el Navegador
Presiona `Ctrl + Shift + R` para forzar una recarga completa

### Paso 2: Iniciar Sesión Nuevamente
1. Abre `http://demo-medico.localhost:5174`
2. Inicia sesión con el usuario Operador
3. Los permisos ahora estarán actualizados

### Paso 3: Verificar en Roles y Permisos
1. Ve a **"Roles y Permisos"**
2. Expande **"Plantillas de Consentimiento HC"**
3. Verifica que el rol Operador tiene:
   - ☑ Ver plantillas de consentimiento HC
   - ☑ Crear plantillas de consentimiento HC
   - ☑ Editar plantillas de consentimiento HC
   - ☐ **Eliminar plantillas de consentimiento HC** (DESACTIVADO)
   - ☑ Generar consentimientos desde HC
   - ☑ Ver consentimientos generados desde HC

### Paso 4: Verificar en Plantillas HC
1. Ve a **"Plantillas HC"**
2. Verifica que:
   - ✅ Puedes ver las plantillas
   - ✅ Puedes crear nuevas plantillas (botón "Nueva Plantilla HC")
   - ✅ Puedes editar plantillas (icono de lápiz)
   - ❌ **NO** aparece el botón de eliminar (icono de papelera)

### Paso 5: Verificar en Historia Clínica
1. Ve a **"Historias Clínicas"**
2. Abre una HC que tenga consentimientos generados
3. Ve a la pestaña **"Consentimientos"**
4. Verifica que:
   - ✅ Aparece el botón de **Ver PDF** (icono de documento azul)
   - ✅ Aparece el botón de **Reenviar Email** (icono de sobre verde)
   - ❌ **NO** aparece el botón de **Eliminar** (icono de papelera roja)

---

## 🎨 Comparación Visual

### En Plantillas HC

#### ANTES (Incorrecto) ❌
```
Plantilla 1
  [✏️ Editar]  [🗑️ Eliminar]  ← Operador podía eliminar
```

#### DESPUÉS (Correcto) ✅
```
Plantilla 1
  [✏️ Editar]  ← Operador NO puede eliminar
```

### En Consentimientos de HC

#### ANTES (Incorrecto) ❌
```
Consentimiento 1
  [📄 Ver PDF]  [✉️ Reenviar]  [🗑️ Eliminar]  ← Operador podía eliminar
```

#### DESPUÉS (Correcto) ✅
```
Consentimiento 1
  [📄 Ver PDF]  [✉️ Reenviar]  ← Operador NO puede eliminar
```

---

## 🔐 Matriz de Permisos por Rol

| Acción | Operador | Administrador |
|--------|----------|---------------|
| Ver plantillas HC | ✅ | ✅ |
| Crear plantillas HC | ✅ | ✅ |
| Editar plantillas HC | ✅ | ✅ |
| **Eliminar plantillas HC** | ❌ | ✅ |
| Generar consentimientos HC | ✅ | ✅ |
| Ver consentimientos generados | ✅ | ✅ |
| Ver PDF de consentimientos | ✅ | ✅ |
| Reenviar email de consentimientos | ✅ | ✅ |
| **Eliminar consentimientos generados** | ❌ | ✅ |

---

## 📦 Scripts Ejecutados

### 1. `fix-operador-permissions.js`
Actualiza los permisos del rol Operador con la lista correcta (sin `delete_mr_consent_templates`)

### 2. `remove-delete-consent-from-operador.js`
Remueve el permiso `delete:medical-record-consents` del rol Operador

### 3. `clear-user-sessions.js`
Limpia todas las sesiones activas para forzar un nuevo login

---

## ✅ Checklist de Verificación

- [x] Permiso `delete_mr_consent_templates` removido
- [x] Permiso `delete:medical-record-consents` removido
- [x] Sesiones de usuario limpiadas
- [x] Scripts de verificación creados
- [x] Documentación completa creada
- [ ] Usuario refresca el navegador (Ctrl + Shift + R)
- [ ] Usuario inicia sesión nuevamente
- [ ] Verificar en "Roles y Permisos" que ambos checkboxes están desactivados
- [ ] Verificar en "Plantillas HC" que NO aparece el botón de eliminar
- [ ] Verificar en HC que NO aparece el botón de eliminar consentimientos

---

## 📌 Notas Importantes

1. **Todos los usuarios** deben cerrar sesión y volver a iniciar para que los cambios surtan efecto
2. Las sesiones fueron limpiadas, por lo que el próximo acceso requerirá login
3. El Operador puede crear, editar y ver plantillas HC, pero NO eliminarlas
4. El Operador puede ver y reenviar consentimientos generados, pero NO eliminarlos
5. Solo los Administradores pueden eliminar plantillas y consentimientos

---

## 🔍 Verificación Técnica

### Verificar Permisos en Base de Datos
```bash
cd backend
node check-operador-mr-permissions.js
```

**Resultado esperado:**
```
✅ view_mr_consent_templates: SÍ (correcto)
✅ create_mr_consent_templates: SÍ (correcto)
✅ edit_mr_consent_templates: SÍ (correcto)
✅ delete_mr_consent_templates: NO (correcto)
✅ generate_mr_consents: SÍ (correcto)
✅ view_mr_consents: SÍ (correcto)
✅ delete:medical-record-consents: NO (correcto)
```

---

## 🎯 Resultado Final

✅ **Permisos corregidos** - Operador NO puede eliminar plantillas ni consentimientos
✅ **Sesiones limpiadas** - Forzado nuevo login con permisos actualizados
✅ **Documentación completa** - Guías de verificación y prueba
✅ **Scripts de verificación** - Disponibles para futuras comprobaciones

El usuario Operador ahora tiene los permisos correctos según los requisitos:
- ✅ Puede gestionar plantillas HC (ver, crear, editar)
- ✅ Puede gestionar consentimientos (generar, ver, reenviar)
- ❌ NO puede eliminar plantillas HC
- ❌ NO puede eliminar consentimientos generados

---

**Fecha:** 2026-01-26
**Versión:** 15.0.10
**Estado:** ✅ COMPLETADO Y VERIFICADO
**Tiempo total:** 30 minutos
