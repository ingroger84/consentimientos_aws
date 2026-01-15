# 🧪 Guía de Prueba - Sistema de Permisos y Roles

## ✅ Estado Actual

- ✅ Backend actualizado con permisos granulares
- ✅ Frontend actualizado con navegación dinámica
- ✅ Permisos actualizados en la base de datos
- ✅ Funcionalidad de cambio de contraseña implementada

## 🚀 Pasos para Probar

### 1. Reiniciar Servicios

Los servicios ya están corriendo, pero es recomendable cerrar sesión y volver a iniciar para obtener el nuevo token con permisos actualizados.

### 2. Probar como Administrador General

**Credenciales**: admin@consentimientos.com / admin123

#### Verificar Navegación
1. Iniciar sesión
2. Verificar que el menú lateral muestra:
   - ✅ Dashboard
   - ✅ Consentimientos
   - ✅ Usuarios
   - ✅ Roles y Permisos
   - ✅ Sedes
   - ✅ Servicios
   - ✅ Preguntas
   - ✅ Configuración

#### Probar Gestión de Usuarios
1. Ir a "Usuarios"
2. Verificar que aparece el botón "Nuevo Usuario"
3. Click en "Nuevo Usuario" y crear un usuario de prueba:
   - Nombre: Usuario Prueba
   - Email: prueba@test.com
   - Contraseña: prueba123
   - Rol: Operador
   - Sede: Cualquiera
4. Verificar que el usuario se crea correctamente

#### Probar Cambio de Contraseña
1. En la lista de usuarios, buscar el usuario recién creado
2. Click en el icono de llave (🔑) junto al usuario
3. Ingresar nueva contraseña: "nuevapass123"
4. Click en "Cambiar Contraseña"
5. Verificar mensaje de éxito
6. Cerrar sesión
7. Intentar iniciar sesión con prueba@test.com / nuevapass123
8. Verificar que funciona

#### Probar Edición de Usuario
1. Iniciar sesión como admin nuevamente
2. Ir a "Usuarios"
3. Click en el icono de editar (✏️) de cualquier usuario
4. Cambiar el nombre
5. Click en "Actualizar"
6. Verificar que se actualiza

#### Probar Eliminación de Usuario
1. Click en el icono de eliminar (🗑️) del usuario de prueba
2. Confirmar eliminación
3. Verificar que el usuario desaparece de la lista

#### Probar Gestión de Sedes
1. Ir a "Sedes"
2. Verificar que aparece el botón "Nueva Sede"
3. Crear una sede de prueba
4. Editar la sede
5. Eliminar la sede (si no está en uso)

#### Probar Roles y Permisos
1. Ir a "Roles y Permisos"
2. Verificar que se muestran los 3 roles
3. Ver los permisos de cada rol

#### Probar Configuración
1. Ir a "Configuración"
2. Subir un logo
3. Cambiar colores
4. Verificar que los cambios se aplican

### 3. Probar como Administrador de Sede

**Crear usuario primero**:
1. Como admin, crear un usuario con rol "Administrador de Sede"
   - Email: admin.sede@test.com
   - Contraseña: sede123

**Cerrar sesión e iniciar como Admin de Sede**:

#### Verificar Navegación
1. Iniciar sesión con admin.sede@test.com / sede123
2. Verificar que el menú lateral muestra SOLO:
   - ✅ Dashboard
   - ✅ Consentimientos
   - ✅ Usuarios (solo ver)
   - ✅ Sedes (solo ver)
   - ✅ Servicios (solo ver)
   - ✅ Preguntas (solo ver)
3. Verificar que NO aparecen:
   - ❌ Roles y Permisos
   - ❌ Configuración

#### Verificar Restricciones en Usuarios
1. Ir a "Usuarios"
2. Verificar que NO aparece el botón "Nuevo Usuario"
3. Verificar que NO aparecen los botones de:
   - ❌ Editar (✏️)
   - ❌ Cambiar Contraseña (🔑)
   - ❌ Eliminar (🗑️)
4. Solo puede VER la lista de usuarios

#### Verificar Restricciones en Sedes
1. Ir a "Sedes"
2. Verificar que NO aparece el botón "Nueva Sede"
3. Verificar que NO aparecen botones de editar o eliminar
4. Solo puede VER la lista de sedes

#### Verificar Permisos en Consentimientos
1. Ir a "Consentimientos"
2. Verificar que SÍ aparece el botón "Nuevo Consentimiento"
3. Crear un consentimiento de prueba
4. Verificar que SÍ puede editar consentimientos
5. Verificar que SÍ puede eliminar consentimientos

#### Intentar Acceso Directo a Rutas Restringidas
1. En la barra de direcciones, intentar acceder a:
   - http://localhost:5173/roles
   - http://localhost:5173/settings
2. Verificar que NO puede acceder (debe redirigir o mostrar error)

### 4. Probar como Operador

**Credenciales**: operador@consentimientos.com / operador123

#### Verificar Navegación
1. Iniciar sesión con operador@consentimientos.com / operador123
2. Verificar que el menú lateral muestra SOLO:
   - ✅ Dashboard
   - ✅ Consentimientos
3. Verificar que NO aparecen:
   - ❌ Usuarios
   - ❌ Roles y Permisos
   - ❌ Sedes
   - ❌ Servicios
   - ❌ Preguntas
   - ❌ Configuración

#### Verificar Permisos en Consentimientos
1. Ir a "Consentimientos"
2. Verificar que SÍ aparece el botón "Nuevo Consentimiento"
3. Crear un consentimiento de prueba
4. Verificar que NO aparecen botones de:
   - ❌ Editar
   - ❌ Eliminar
5. Solo puede VER y CREAR consentimientos

#### Intentar Acceso Directo a Rutas Restringidas
1. En la barra de direcciones, intentar acceder a:
   - http://localhost:5173/users
   - http://localhost:5173/roles
   - http://localhost:5173/branches
   - http://localhost:5173/services
   - http://localhost:5173/questions
   - http://localhost:5173/settings
2. Verificar que NO puede acceder a ninguna

### 5. Probar Seguridad en Backend

#### Usando Postman o cURL

**Obtener Token**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operador@consentimientos.com","password":"operador123"}'
```

Copiar el `access_token` de la respuesta.

**Intentar Crear Usuario (debe fallar)**:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN_DEL_OPERADOR]" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","roleId":"xxx"}'
```

**Resultado esperado**: Error 403 Forbidden con mensaje "No tienes permisos para realizar esta acción"

**Intentar Ver Roles (debe fallar)**:
```bash
curl -X GET http://localhost:3000/api/roles \
  -H "Authorization: Bearer [TOKEN_DEL_OPERADOR]"
```

**Resultado esperado**: Error 403 Forbidden

## ✅ Checklist de Funcionalidades

### Administrador General
- [ ] Ve todas las opciones del menú
- [ ] Puede crear usuarios
- [ ] Puede editar usuarios
- [ ] Puede eliminar usuarios
- [ ] Puede cambiar contraseñas de usuarios
- [ ] Puede ver roles y permisos
- [ ] Puede crear/editar/eliminar sedes
- [ ] Puede crear/editar/eliminar servicios
- [ ] Puede crear/editar/eliminar preguntas
- [ ] Puede configurar el sistema (logo, colores)
- [ ] Puede gestionar consentimientos

### Administrador de Sede
- [ ] Ve solo: Dashboard, Consentimientos, Usuarios, Sedes, Servicios, Preguntas
- [ ] NO ve: Roles, Configuración
- [ ] Puede ver usuarios pero NO crear/editar/eliminar
- [ ] Puede ver sedes pero NO crear/editar/eliminar
- [ ] Puede crear/editar/eliminar consentimientos
- [ ] NO puede cambiar contraseñas
- [ ] NO puede acceder a configuración

### Operador
- [ ] Ve solo: Dashboard, Consentimientos
- [ ] NO ve: Usuarios, Roles, Sedes, Servicios, Preguntas, Configuración
- [ ] Puede crear consentimientos
- [ ] NO puede editar consentimientos
- [ ] NO puede eliminar consentimientos
- [ ] NO puede acceder a ninguna otra funcionalidad

### Seguridad Backend
- [ ] Endpoints protegidos con guards
- [ ] Tokens JWT funcionando
- [ ] Permisos verificados en cada petición
- [ ] Mensajes de error claros
- [ ] No se puede bypassear la seguridad

### Seguridad Frontend
- [ ] Navegación dinámica según permisos
- [ ] Botones ocultos si no hay permisos
- [ ] Rutas protegidas
- [ ] Redirección automática si no hay acceso

## 🐛 Problemas Comunes y Soluciones

### Problema: Usuario admin no ve todas las opciones

**Solución**:
1. Cerrar sesión completamente
2. Volver a iniciar sesión
3. El nuevo token incluirá los permisos actualizados

### Problema: Error 403 en todas las peticiones

**Solución**:
1. Verificar que el token es válido
2. Cerrar sesión y volver a iniciar
3. Verificar que los permisos están en la base de datos

### Problema: Operador puede ver opciones que no debería

**Solución**:
1. Verificar que el frontend se actualizó correctamente
2. Limpiar caché del navegador (Ctrl + Shift + R)
3. Verificar que el hook usePermissions está funcionando

### Problema: No se puede cambiar contraseña

**Solución**:
1. Verificar que el usuario tiene permiso `change_passwords`
2. Verificar que el endpoint está disponible
3. Verificar que el backend se reinició después de los cambios

## 📊 Verificación en Base de Datos

Para verificar los permisos directamente en la base de datos:

```sql
-- Conectarse a PostgreSQL
docker exec -it consentimientos-db psql -U admin -d consentimientos

-- Ver permisos de todos los roles
SELECT name, type, permissions FROM roles ORDER BY type;

-- Ver usuarios y sus roles
SELECT u.name, u.email, r.name as role, r.permissions
FROM users u
JOIN roles r ON u."roleId" = r.id
WHERE u.deleted_at IS NULL;

-- Salir
\q
```

## 🎉 Resultado Esperado

Al completar todas las pruebas, deberías tener:

1. ✅ Sistema de permisos funcionando correctamente
2. ✅ Navegación dinámica según rol
3. ✅ Botones condicionales según permisos
4. ✅ Protección en backend funcionando
5. ✅ Cambio de contraseña funcionando
6. ✅ Mensajes de error claros
7. ✅ Experiencia de usuario optimizada

---

**Fecha**: 4 de enero de 2026
**Estado**: ✅ LISTO PARA PROBAR
**Versión**: 1.0.0

**IMPORTANTE**: Recuerda cerrar sesión y volver a iniciar después de actualizar permisos para obtener un nuevo token con los permisos actualizados.

