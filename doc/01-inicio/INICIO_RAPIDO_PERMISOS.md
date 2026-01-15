# 🚀 Inicio Rápido - Sistema de Permisos

## ✅ Todo Está Listo

El sistema de permisos y roles está completamente implementado y funcionando.

## 🎯 Acceso Rápido

### Servicios Activos
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Base de Datos**: PostgreSQL (Docker)

### Usuarios de Prueba

| Rol | Email | Contraseña | Permisos |
|-----|-------|------------|----------|
| **Admin General** | admin@consentimientos.com | admin123 | TODOS |
| **Operador** | operador@consentimientos.com | operador123 | Solo crear consentimientos |

## 🔑 Funcionalidades Principales

### Como Administrador General

1. **Gestionar Usuarios**
   - Crear, editar, eliminar usuarios
   - Cambiar contraseñas (icono 🔑)
   - Asignar roles y sedes

2. **Gestionar Sedes**
   - Crear, editar, eliminar sedes
   - Asignar usuarios a sedes

3. **Gestionar Roles**
   - Ver roles y permisos
   - Modificar permisos

4. **Configurar Sistema**
   - Subir logo
   - Cambiar colores
   - Personalizar nombre

### Como Operador

1. **Crear Consentimientos**
   - Llenar formulario
   - Generar PDF
   - Enviar email

2. **Ver Dashboard**
   - Estadísticas básicas
   - Consentimientos recientes

## 📋 Prueba Rápida (5 minutos)

### 1. Probar como Admin (2 min)
```
1. Ir a http://localhost:5173
2. Login: admin@consentimientos.com / admin123
3. Verificar que ve TODAS las opciones del menú
4. Ir a Usuarios → Click en 🔑 de cualquier usuario
5. Cambiar contraseña → Guardar
```

### 2. Probar como Operador (2 min)
```
1. Cerrar sesión
2. Login: operador@consentimientos.com / operador123
3. Verificar que SOLO ve: Dashboard y Consentimientos
4. Intentar acceder a /users (debe fallar)
5. Crear un consentimiento
```

### 3. Verificar Seguridad (1 min)
```
1. Como operador, intentar acceder a:
   - http://localhost:5173/users
   - http://localhost:5173/roles
   - http://localhost:5173/settings
2. Todas deben fallar o redirigir
```

## ⚠️ Importante

### Después de Cambiar Permisos
1. **Cerrar sesión**
2. **Volver a iniciar sesión**
3. Esto actualiza el token con nuevos permisos

### Contraseñas
- Mínimo 6 caracteres
- Solo admin puede cambiarlas
- Se hashean automáticamente

## 🆘 Solución Rápida de Problemas

### No veo opciones del menú
→ Cerrar sesión y volver a entrar

### Error 403 Forbidden
→ No tienes permisos para esa acción

### No puedo cambiar contraseña
→ Solo admin puede hacerlo

## 📚 Documentación Completa

- **Sistema completo**: `SISTEMA_PERMISOS_ROLES.md`
- **Guía de pruebas**: `PRUEBA_PERMISOS.md`
- **Resumen técnico**: `RESUMEN_IMPLEMENTACION_PERMISOS.md`

## 🎉 ¡Listo para Usar!

El sistema está completamente funcional. Puedes empezar a:
1. Crear usuarios con diferentes roles
2. Gestionar permisos
3. Cambiar contraseñas
4. Personalizar el sistema

---

**¿Necesitas ayuda?** Consulta la documentación completa en los archivos MD.

