# Configuración de Correo Electrónico - Instrucciones

## ✅ Implementación Completada

La funcionalidad de "Configuración de Correo Electrónico" ha sido implementada exitosamente.

## 🔑 Permisos Asignados

El permiso `configure_email` ha sido agregado automáticamente a:
- ✅ **Administrador General** (ADMIN_GENERAL)
- ✅ **Administrador de Sede** (ADMIN_SEDE)

## 📋 Cómo Ver la Funcionalidad

### Paso 1: Cerrar Sesión y Volver a Iniciar
Para que los permisos se actualicen en el frontend, debes:

1. **Cerrar sesión** en la aplicación
2. **Volver a iniciar sesión** con tu usuario

### Paso 2: Verificar el Menú
Después de iniciar sesión, deberías ver en el menú lateral:

```
📋 Dashboard
📄 Consentimientos
👥 Usuarios
🛡️ Roles y Permisos
🏢 Sedes
💼 Servicios
❓ Preguntas
⚙️ Configuración
📧 Correo Electrónico  ← NUEVO
💳 Mi Plan
```

## 🚫 Restricciones

Esta funcionalidad:
- ✅ **Solo está disponible** para usuarios de cuentas tenant
- ❌ **NO está disponible** para super_admin
- ✅ **Requiere el permiso** `configure_email`

## 🔧 Gestión de Permisos

Los administradores pueden gestionar este permiso desde:
- **Roles y Permisos** → Editar rol → Sección "Configuración"
- Activar/desactivar el permiso "Configurar correo electrónico"

## 📧 Funcionalidades Disponibles

Una vez dentro de "Correo Electrónico", podrás:

1. **Usar correo del sistema** (predeterminado)
   - No requiere configuración adicional
   - Usa la configuración SMTP del sistema

2. **Usar correo personalizado**
   - Configurar servidor SMTP propio
   - Servidor, puerto, usuario, contraseña
   - Email remitente personalizado
   - Soporte para Gmail con contraseñas de aplicación
   - Enviar correos de prueba

## 🐛 Solución de Problemas

### No veo el enlace "Correo Electrónico"

**Solución:**
1. Cierra sesión completamente
2. Vuelve a iniciar sesión
3. Verifica que tu usuario pertenezca a un tenant (no sea super_admin)
4. Verifica que tu rol tenga el permiso `configure_email`

### El permiso no aparece en Roles

**Solución:**
Ejecuta el script de actualización:
```bash
cd backend
node scripts/admin/add-email-permission-simple.js
```

## 📝 Scripts Disponibles

### Verificar y Agregar Permiso
```bash
cd backend
node scripts/admin/add-email-permission-simple.js
```

Este script:
- ✅ Verifica qué roles tienen el permiso
- ✅ Agrega el permiso a roles que no lo tienen
- ✅ Muestra un resumen del estado

## 🎯 Próximos Pasos

1. Cierra sesión y vuelve a iniciar
2. Verifica que veas el enlace "Correo Electrónico"
3. Configura tu servidor SMTP si lo deseas
4. Prueba el envío de correos

## ✅ Todo Listo

La implementación está completa y lista para usar. Solo necesitas refrescar tu sesión para ver los cambios.
