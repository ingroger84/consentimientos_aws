# 🧪 Instrucciones de Prueba - Creación de Clientes

**Versión:** 15.0.9  
**Fecha:** 2026-01-25

---

## 🎯 Objetivo

Verificar que la creación de clientes funciona correctamente después de la corrección del error 500.

---

## 📋 Pre-requisitos

1. ✅ Backend corriendo en `http://localhost:3000`
2. ✅ Frontend corriendo en `http://localhost:5173`
3. ✅ Base de datos PostgreSQL activa
4. ✅ Tenant "demo-medico" creado y activo
5. ✅ Usuario con permisos para crear clientes

---

## 🚀 Pasos de Prueba

### 1. Acceder al Sistema

```
URL: http://demo-medico.localhost:5173
```

**Credenciales de prueba:**
- Email: (usuario del tenant demo-medico)
- Password: (contraseña del usuario)

### 2. Navegar a Clientes

1. Hacer clic en el menú lateral
2. Seleccionar "Clientes"
3. Verificar que la página carga correctamente

### 3. Crear un Nuevo Cliente

1. Hacer clic en el botón **"Nuevo Cliente"**
2. Llenar el formulario con los siguientes datos:

```
┌─────────────────────────────────────────────────────────┐
│              DATOS DEL CLIENTE DE PRUEBA                 │
├─────────────────────────────────────────────────────────┤
│  Nombre:              Juan Pérez García                 │
│  Tipo de Documento:   Cédula de Ciudadanía (CC)        │
│  Número de Documento: 1234567890                        │
│  Email:               juan.perez@example.com            │
│  Teléfono:            3001234567                        │
│  Fecha de Nacimiento: 01/01/1990                        │
│  Género:              Masculino                         │
│  Dirección:           Calle 123 #45-67                  │
│  Ciudad:              Bogotá                            │
│  Departamento:        Cundinamarca                      │
└─────────────────────────────────────────────────────────┘
```

3. Hacer clic en **"Crear Cliente"**

### 4. Verificar Resultado Exitoso

✅ **Debe ocurrir:**
- Mensaje de éxito: "Cliente creado exitosamente"
- El modal se cierra automáticamente
- El cliente aparece en la lista de clientes
- No hay errores en la consola del navegador

❌ **NO debe ocurrir:**
- Error 500 (Internal Server Error)
- Mensaje de error en pantalla
- Errores en la consola del navegador
- El modal permanece abierto sin respuesta

---

## 🔍 Verificaciones Adicionales

### Verificar en la Lista de Clientes

1. El cliente "Juan Pérez García" debe aparecer en la lista
2. Los datos deben coincidir con los ingresados
3. El documento debe mostrarse como "CC 1234567890"

### Verificar Detalles del Cliente

1. Hacer clic en el cliente recién creado
2. Verificar que todos los datos se guardaron correctamente
3. Verificar que el cliente pertenece al tenant correcto

### Verificar Búsqueda

1. Usar el campo de búsqueda
2. Buscar por nombre: "Juan"
3. Buscar por documento: "1234567890"
4. Verificar que el cliente aparece en los resultados

---

## 🐛 Solución de Problemas

### Si aún aparece Error 500

1. **Verificar que el backend se reinició:**
   ```powershell
   # Detener el backend
   Ctrl + C
   
   # Iniciar nuevamente
   cd backend
   npm run start:dev
   ```

2. **Verificar logs del backend:**
   - Buscar errores en la consola del backend
   - Verificar que no hay errores de compilación

3. **Verificar la base de datos:**
   ```sql
   -- Verificar que el tenant existe
   SELECT id, slug, name FROM tenants WHERE slug = 'demo-medico';
   ```

### Si el cliente no aparece en la lista

1. Refrescar la página (F5)
2. Verificar filtros de búsqueda
3. Verificar que no hay errores en la consola

### Si hay errores de permisos

1. Verificar que el usuario tiene el permiso `create_clients`
2. Cerrar sesión y volver a iniciar
3. Verificar el rol del usuario

---

## 📊 Casos de Prueba Adicionales

### Caso 1: Cliente Duplicado

1. Intentar crear otro cliente con el mismo documento
2. **Resultado esperado:** Error de validación "Ya existe un cliente con este documento"

### Caso 2: Datos Inválidos

1. Intentar crear cliente sin nombre
2. **Resultado esperado:** Error de validación "El nombre es requerido"

### Caso 3: Múltiples Clientes

1. Crear 3-5 clientes diferentes
2. **Resultado esperado:** Todos se crean exitosamente
3. Verificar que todos aparecen en la lista

---

## 🎯 Criterios de Éxito

La prueba es exitosa si:

- ✅ Se puede crear un cliente sin errores
- ✅ El cliente aparece en la lista inmediatamente
- ✅ Los datos se guardan correctamente
- ✅ No hay errores 500 en ningún momento
- ✅ La búsqueda funciona correctamente
- ✅ Se pueden crear múltiples clientes

---

## 📝 Registro de Pruebas

```
┌─────────────────────────────────────────────────────────┐
│              REGISTRO DE PRUEBA                          │
├─────────────────────────────────────────────────────────┤
│  Fecha:           _____________________                 │
│  Probado por:     _____________________                 │
│  Tenant usado:    demo-medico                           │
│  Resultado:       [ ] Exitoso  [ ] Fallido              │
│                                                          │
│  Observaciones:                                         │
│  ________________________________________________        │
│  ________________________________________________        │
│  ________________________________________________        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Próximos Pasos

Después de verificar que la creación funciona:

1. ✅ Probar edición de clientes
2. ✅ Probar eliminación de clientes
3. ✅ Probar búsqueda avanzada
4. ✅ Probar desde diferentes tenants
5. ✅ Probar con diferentes roles de usuario

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisar la documentación en `doc/50-correccion-crear-clientes/`
2. Verificar los logs del backend
3. Revisar la consola del navegador
4. Contactar al equipo de desarrollo

---

**Estado:** ✅ LISTO PARA PRUEBAS  
**Versión:** 15.0.9  
**Prioridad:** 🔴 CRÍTICA
