# 📖 Instrucciones para el Usuario - Categoría Historias Clínicas

## ✅ Cambios Completados

Se ha agregado exitosamente la categoría **"Historias Clínicas"** en la página de Roles y Permisos.

## 🎯 Cómo Verificar

### 1. Acceder a la Página de Roles y Permisos

```
URL: http://demo-medico.localhost:5173/roles
```

O desde el menú lateral:
```
⚙️ Configuración → Roles y Permisos
```

### 2. Buscar la Categoría

Ahora deberías ver la categoría **"Historias Clínicas"** junto con las demás:

```
✓ Dashboard
✓ Consentimientos
✓ Usuarios
✓ Roles y Permisos
✓ Sedes
✓ Servicios
✓ Preguntas
✓ Clientes
✓ Plantillas de Consentimiento
✓ Historias Clínicas ← NUEVA
✓ Configuración
✓ Facturación
```

### 3. Ver los Permisos

Al expandir la categoría "Historias Clínicas", verás 7 permisos:

1. ✅ **Ver historias clínicas** - Permite visualizar las historias clínicas
2. ✅ **Crear historias clínicas** - Permite crear nuevas historias clínicas
3. ✅ **Editar historias clínicas** - Permite modificar historias clínicas existentes
4. ✅ **Eliminar historias clínicas** - Permite eliminar historias clínicas
5. ✅ **Cerrar historias clínicas** - Permite cerrar historias clínicas (no se pueden editar más)
6. ✅ **Firmar historias clínicas** - Permite firmar digitalmente las historias clínicas
7. ✅ **Exportar historias clínicas** - Permite exportar historias clínicas a PDF

## 🔧 Cómo Configurar Permisos

### Paso 1: Seleccionar un Rol

En la página de Roles y Permisos, haz clic en el botón **"Editar Permisos"** del rol que deseas configurar.

### Paso 2: Expandir la Categoría

Haz clic en la categoría **"Historias Clínicas"** para ver todos los permisos disponibles.

### Paso 3: Seleccionar Permisos

- **Seleccionar todos:** Haz clic en el checkbox al lado del nombre de la categoría
- **Seleccionar individual:** Haz clic en cada permiso que desees activar

### Paso 4: Guardar Cambios

Haz clic en el botón **"Guardar"** para aplicar los cambios.

## 👥 Permisos Recomendados por Rol

### 🔴 Super Admin
```
✅ Todos los permisos (7/7)
```
**Justificación:** Control total del sistema

### 🟠 Admin General
```
✅ Todos los permisos (7/7)
```
**Justificación:** Gestión completa del tenant

### 🟡 Admin Sede
```
✅ Ver historias clínicas
✅ Crear historias clínicas
✅ Editar historias clínicas
✅ Firmar historias clínicas
❌ Eliminar historias clínicas (seguridad)
❌ Cerrar historias clínicas (control)
❌ Exportar historias clínicas (privacidad)
```
**Justificación:** Gestión operativa sin acciones críticas

### 🟢 Operador
```
✅ Ver historias clínicas
✅ Crear historias clínicas
✅ Firmar historias clínicas
❌ Editar historias clínicas (control)
❌ Eliminar historias clínicas (seguridad)
❌ Cerrar historias clínicas (control)
❌ Exportar historias clínicas (privacidad)
```
**Justificación:** Operación básica sin modificaciones

## 🎨 Personalización

Puedes personalizar los permisos según las necesidades de tu organización:

### Ejemplo 1: Operador con Edición
Si necesitas que los operadores puedan editar historias clínicas:
```
✅ Ver historias clínicas
✅ Crear historias clínicas
✅ Editar historias clínicas ← Agregar este
✅ Firmar historias clínicas
```

### Ejemplo 2: Admin Sede con Exportación
Si necesitas que los admins de sede puedan exportar:
```
✅ Ver historias clínicas
✅ Crear historias clínicas
✅ Editar historias clínicas
✅ Firmar historias clínicas
✅ Exportar historias clínicas ← Agregar este
```

## 🔒 Consideraciones de Seguridad

### Permisos Críticos

Estos permisos deben asignarse con cuidado:

1. **Eliminar historias clínicas**
   - ⚠️ Acción irreversible
   - 💡 Solo para administradores de confianza

2. **Cerrar historias clínicas**
   - ⚠️ Impide futuras ediciones
   - 💡 Solo para roles con autoridad médica

3. **Exportar historias clínicas**
   - ⚠️ Datos sensibles pueden salir del sistema
   - 💡 Solo para roles que necesiten reportes

### Mejores Prácticas

1. ✅ **Principio de mínimo privilegio:** Asigna solo los permisos necesarios
2. ✅ **Revisión periódica:** Revisa los permisos cada 3-6 meses
3. ✅ **Documentación:** Documenta por qué cada rol tiene ciertos permisos
4. ✅ **Auditoría:** Revisa los logs de acciones críticas

## 🐛 Solución de Problemas

### Problema: No veo la categoría "Historias Clínicas"

**Solución:**
1. Refresca la página (F5)
2. Limpia la caché del navegador (Ctrl + Shift + R)
3. Verifica que el backend esté corriendo
4. Verifica que estés en la versión 15.0.3 o superior

### Problema: Los cambios no se guardan

**Solución:**
1. Verifica tu conexión a internet
2. Verifica que tengas el permiso "Editar permisos de roles"
3. Revisa la consola del navegador (F12) para errores
4. Contacta al administrador del sistema

### Problema: Un usuario no puede acceder a historias clínicas

**Solución:**
1. Verifica que su rol tenga el permiso "Ver historias clínicas"
2. Pide al usuario que cierre sesión y vuelva a iniciar
3. Verifica que el usuario esté activo
4. Verifica que el usuario pertenezca a una sede

## 📞 Soporte

Si tienes problemas o preguntas:

1. **Documentación:** Revisa los archivos en `doc/45-categoria-historias-clinicas-permisos/`
2. **Logs:** Revisa los logs del backend en `backend/logs/`
3. **Consola:** Abre la consola del navegador (F12) para ver errores
4. **Contacto:** Contacta al equipo de desarrollo

## 🎉 ¡Listo!

Ahora puedes configurar de manera granular qué puede hacer cada rol con las historias clínicas del sistema. Esto te permite:

- ✅ Controlar el acceso a información sensible
- ✅ Prevenir acciones no autorizadas
- ✅ Cumplir con regulaciones de privacidad
- ✅ Mantener un registro de auditoría claro

---

**Versión:** 15.0.3  
**Fecha:** 24 de enero de 2026  
**Estado:** ✅ Completado y Verificado
