# 🧪 Guía de Pruebas - Sistema de Perfiles y Permisos v52.2.0

**Fecha:** 2026-03-01  
**Versión:** 52.2.0  
**Estado:** ✅ BACKEND Y FRONTEND CORRIENDO

---

## 🚀 Servicios Activos

### Backend
- **URL:** http://localhost:3000
- **API Docs:** http://localhost:3000/api/docs
- **Versión:** 52.2.0
- **Estado:** ✅ CORRIENDO

### Frontend
- **URL:** http://localhost:5173
- **Versión:** 52.2.0
- **Build Hash:** mm85v6s0
- **Estado:** ✅ CORRIENDO

---

## 📋 Plan de Pruebas

### 1. Verificar Versión del Sistema

#### Paso 1.1: Verificar en el navegador
1. Abrir http://localhost:5173
2. Abrir DevTools (F12)
3. Ir a Console
4. Verificar que aparezca: "✅ Caché limpiado. Nueva versión: 52.2.0"
5. En la parte inferior de la página debe aparecer: "v52.2.0"

#### Paso 1.2: Verificar en el footer
1. Hacer scroll hasta el final de la página
2. Verificar que el footer muestre: "Versión 52.2.0"

---

### 2. Acceder al Sistema

#### Paso 2.1: Login
1. Ir a http://localhost:5173
2. Ingresar credenciales:
   - **Email:** rcaraballo@innovasystems.com.co
   - **Password:** Admin123!
3. Hacer clic en "Iniciar Sesión"
4. Verificar que redirija al Dashboard

---

### 3. Navegar a Perfiles

#### Paso 3.1: Desde el menú lateral
1. En el menú lateral, buscar la sección "Organización"
2. Hacer clic en "Perfiles"
3. Verificar que redirija a `/profiles`

#### Paso 3.2: Verificar URL directa
1. Ir directamente a http://localhost:5173/profiles
2. Verificar que cargue la página de perfiles

---

### 4. Probar Lista de Perfiles

#### Paso 4.1: Verificar perfiles predeterminados
Debe mostrar 5 perfiles del sistema:
- ✅ Super Administrador (badge "Sistema")
- ✅ Administrador General (badge "Sistema")
- ✅ Administrador de Sede (badge "Sistema")
- ✅ Operador (badge "Sistema")
- ✅ Solo Lectura (badge "Sistema")

#### Paso 4.2: Verificar información de tarjetas
Cada tarjeta debe mostrar:
- ✅ Nombre del perfil
- ✅ Descripción
- ✅ Badge "Sistema" (para perfiles predeterminados)
- ✅ Número de permisos
- ✅ Número de usuarios asignados
- ✅ Botones: "Ver detalles", "Editar" (deshabilitado para sistema), "Eliminar" (deshabilitado para sistema)

#### Paso 4.3: Probar filtros
1. Hacer clic en "Todos" - Debe mostrar 5 perfiles
2. Hacer clic en "Sistema" - Debe mostrar 5 perfiles
3. Hacer clic en "Personalizados" - Debe mostrar 0 perfiles (o los que hayas creado)

---

### 5. Probar Creación de Perfil

#### Paso 5.1: Abrir formulario
1. Hacer clic en el botón "Crear perfil" (esquina superior derecha)
2. Verificar que redirija a `/profiles/new`

#### Paso 5.2: Llenar formulario
1. **Nombre:** "Médico Especialista"
2. **Descripción:** "Médico con acceso a HC y consentimientos"
3. **Permisos:** Seleccionar:
   - Dashboard → view
   - Historias Clínicas → view, create, edit, print
   - Consentimientos → view, sign
   - Clientes → view

#### Paso 5.3: Probar selector de permisos
1. Verificar que los módulos estén agrupados por categorías
2. Hacer clic en una categoría para expandir/colapsar
3. Seleccionar un módulo (checkbox)
4. Verificar que aparezcan las acciones disponibles
5. Seleccionar acciones específicas
6. Probar "Seleccionar todos" en una categoría
7. Probar "Deseleccionar todos" en una categoría

#### Paso 5.4: Guardar perfil
1. Hacer clic en "Crear perfil"
2. Verificar que aparezca toast de éxito: "Perfil creado exitosamente"
3. Verificar que redirija a `/profiles`
4. Verificar que el nuevo perfil aparezca en la lista

---

### 6. Probar Detalle de Perfil

#### Paso 6.1: Abrir detalle
1. Hacer clic en "Ver detalles" de cualquier perfil
2. Verificar que redirija a `/profiles/:id`

#### Paso 6.2: Verificar tabs
1. **Tab Permisos:**
   - Verificar que muestre permisos agrupados por categoría
   - Verificar badges de acciones con colores
   - Para Super Admin: Debe mostrar "Permisos Globales"

2. **Tab Usuarios:**
   - Verificar lista de usuarios asignados
   - Si no hay usuarios: Debe mostrar "No hay usuarios asignados"

3. **Tab Auditoría:**
   - Verificar historial de cambios
   - Debe mostrar: acción, usuario, fecha y hora
   - Si no hay auditoría: Debe mostrar "No hay registros de auditoría"

---

### 7. Probar Edición de Perfil

#### Paso 7.1: Intentar editar perfil del sistema
1. Hacer clic en "Ver detalles" de "Super Administrador"
2. Hacer clic en "Editar perfil"
3. Verificar que muestre advertencia: "Los perfiles del sistema no pueden ser editados"
4. Hacer clic en "Volver a perfiles"

#### Paso 7.2: Editar perfil personalizado
1. Hacer clic en "Editar" del perfil "Médico Especialista" (creado anteriormente)
2. Verificar que redirija a `/profiles/:id/edit`
3. Verificar que el formulario esté prellenado con los datos actuales
4. Modificar nombre: "Médico Especialista Senior"
5. Agregar más permisos: Reportes → view, export
6. Hacer clic en "Guardar cambios"
7. Verificar toast de éxito: "Perfil actualizado exitosamente"
8. Verificar que redirija a `/profiles`

---

### 8. Probar Eliminación de Perfil

#### Paso 8.1: Intentar eliminar perfil del sistema
1. Hacer clic en "Eliminar" de "Super Administrador"
2. Verificar que el botón esté deshabilitado o no aparezca

#### Paso 8.2: Eliminar perfil personalizado sin usuarios
1. Crear un perfil de prueba: "Perfil Temporal"
2. Hacer clic en "Eliminar" del perfil "Perfil Temporal"
3. Verificar que aparezca confirmación: "¿Estás seguro de que deseas eliminar el perfil?"
4. Hacer clic en "Eliminar"
5. Verificar toast de éxito: "Perfil eliminado exitosamente"
6. Verificar que el perfil desaparezca de la lista

#### Paso 8.3: Intentar eliminar perfil con usuarios asignados
1. Asignar el perfil "Médico Especialista Senior" a un usuario
2. Intentar eliminar el perfil
3. Verificar que aparezca error: "No se puede eliminar el perfil porque tiene X usuario(s) asignado(s)"

---

### 9. Probar Validaciones de Seguridad

#### Paso 9.1: Intentar crear perfil con permisos globales (como Admin General)
1. Cerrar sesión
2. Iniciar sesión como Administrador General
3. Ir a Perfiles → Crear perfil
4. Intentar seleccionar permisos del módulo "super_admin"
5. Verificar que no aparezca o esté deshabilitado

#### Paso 9.2: Verificar que Admin General no puede crear perfiles
1. Como Administrador General, ir a Perfiles
2. Verificar que el botón "Crear perfil" no aparezca o esté deshabilitado
3. Verificar que solo puede "Ver detalles" y "Asignar" perfiles existentes

---

### 10. Probar Diseño Responsive

#### Paso 10.1: Modo Desktop
1. Abrir en pantalla completa (1920x1080)
2. Verificar que el grid muestre 3 columnas
3. Verificar que todos los elementos sean legibles

#### Paso 10.2: Modo Tablet
1. Abrir DevTools (F12)
2. Activar modo responsive (Ctrl + Shift + M)
3. Seleccionar iPad (768x1024)
4. Verificar que el grid muestre 2 columnas
5. Verificar que el menú lateral sea colapsable

#### Paso 10.3: Modo Mobile
1. Seleccionar iPhone 12 Pro (390x844)
2. Verificar que el grid muestre 1 columna
3. Verificar que el menú lateral sea un drawer
4. Verificar que los botones sean táctiles (mínimo 44x44px)

---

### 11. Probar Modo Oscuro

#### Paso 11.1: Activar modo oscuro
1. Hacer clic en el icono de luna/sol en la barra superior
2. Verificar que toda la interfaz cambie a modo oscuro
3. Verificar que los colores sean legibles
4. Verificar que las tarjetas tengan buen contraste

#### Paso 11.2: Verificar componentes
1. Verificar tarjetas de perfiles
2. Verificar formularios
3. Verificar selector de permisos
4. Verificar tabs
5. Verificar modales y confirmaciones

---

### 12. Probar Rendimiento

#### Paso 12.1: Tiempo de carga
1. Abrir DevTools → Network
2. Recargar la página de perfiles (Ctrl + R)
3. Verificar que cargue en menos de 2 segundos
4. Verificar que no haya errores 404 o 500

#### Paso 12.2: Tamaño de archivos
1. Verificar que los archivos JS estén comprimidos (gzip)
2. Verificar que las imágenes estén optimizadas
3. Verificar que no haya archivos duplicados

---

### 13. Probar Integración con API

#### Paso 13.1: Verificar llamadas a la API
1. Abrir DevTools → Network
2. Filtrar por "XHR"
3. Navegar a Perfiles
4. Verificar llamadas:
   - `GET /api/profiles` - Lista de perfiles
   - `GET /api/modules/by-category` - Módulos por categoría

#### Paso 13.2: Crear perfil
1. Crear un nuevo perfil
2. Verificar llamada:
   - `POST /api/profiles` - Crear perfil
   - Status: 201 Created
   - Response: Perfil creado con ID

#### Paso 13.3: Editar perfil
1. Editar un perfil
2. Verificar llamada:
   - `PATCH /api/profiles/:id` - Actualizar perfil
   - Status: 200 OK
   - Response: Perfil actualizado

#### Paso 13.4: Eliminar perfil
1. Eliminar un perfil
2. Verificar llamada:
   - `DELETE /api/profiles/:id` - Eliminar perfil
   - Status: 200 OK

---

### 14. Probar Manejo de Errores

#### Paso 14.1: Error de red
1. Detener el backend (Ctrl + C en la terminal del backend)
2. Intentar crear un perfil
3. Verificar que aparezca toast de error: "Error al guardar perfil"
4. Reiniciar el backend

#### Paso 14.2: Error de validación
1. Intentar crear un perfil sin nombre
2. Verificar que aparezca toast de error: "El nombre es requerido"

#### Paso 14.3: Error de permisos
1. Intentar crear un perfil sin seleccionar permisos
2. Verificar que aparezca toast de error: "Debes seleccionar al menos un permiso"

---

### 15. Probar Navegación

#### Paso 15.1: Breadcrumbs
1. Navegar: Dashboard → Perfiles → Crear perfil
2. Verificar que se pueda volver atrás con el botón "Cancelar"
3. Verificar que se pueda volver con el botón "Atrás" del navegador

#### Paso 15.2: URLs directas
1. Copiar URL de un perfil: `/profiles/:id`
2. Pegar en una nueva pestaña
3. Verificar que cargue correctamente
4. Probar con URL inválida: `/profiles/invalid-id`
5. Verificar que muestre error o redirija

---

## ✅ Checklist de Pruebas

### Funcionalidad
- [ ] Lista de perfiles carga correctamente
- [ ] Filtros funcionan (Todos, Sistema, Personalizados)
- [ ] Crear perfil funciona
- [ ] Selector de permisos funciona
- [ ] Editar perfil funciona
- [ ] Eliminar perfil funciona
- [ ] Detalle de perfil muestra información correcta
- [ ] Tabs funcionan (Permisos, Usuarios, Auditoría)
- [ ] Validaciones de seguridad funcionan
- [ ] Perfiles del sistema están protegidos

### Diseño
- [ ] Diseño responsive (Desktop, Tablet, Mobile)
- [ ] Modo oscuro funciona correctamente
- [ ] Colores y contraste son adecuados
- [ ] Iconos se muestran correctamente
- [ ] Animaciones son suaves
- [ ] Loading states se muestran

### UX
- [ ] Toast notifications aparecen
- [ ] Confirmaciones funcionan
- [ ] Botones son táctiles
- [ ] Formularios son intuitivos
- [ ] Mensajes de error son claros
- [ ] Navegación es fluida

### Rendimiento
- [ ] Carga rápida (< 2 segundos)
- [ ] No hay errores en consola
- [ ] No hay warnings en consola
- [ ] Archivos están comprimidos
- [ ] Imágenes están optimizadas

### API
- [ ] Llamadas a la API funcionan
- [ ] Respuestas son correctas
- [ ] Errores se manejan correctamente
- [ ] Tokens de autenticación funcionan

---

## 🐛 Reporte de Bugs

Si encuentras algún bug, documéntalo con:

1. **Descripción:** ¿Qué pasó?
2. **Pasos para reproducir:** ¿Cómo llegaste ahí?
3. **Resultado esperado:** ¿Qué debería pasar?
4. **Resultado actual:** ¿Qué pasó realmente?
5. **Navegador:** Chrome, Firefox, Safari, Edge
6. **Versión:** 52.2.0
7. **Screenshots:** Si es posible

---

## 📊 Resultados de Pruebas

### Fecha: _____________
### Probado por: _____________

| Categoría | Pruebas | Pasadas | Fallidas | Notas |
|-----------|---------|---------|----------|-------|
| Funcionalidad | 10 | | | |
| Diseño | 5 | | | |
| UX | 6 | | | |
| Rendimiento | 4 | | | |
| API | 5 | | | |
| **TOTAL** | **30** | | | |

---

## 🎉 Conclusión

Una vez completadas todas las pruebas, el sistema de perfiles y permisos estará validado y listo para despliegue en producción.

**Versión probada:** 52.2.0  
**Estado:** ⏳ PENDIENTE DE PRUEBAS
