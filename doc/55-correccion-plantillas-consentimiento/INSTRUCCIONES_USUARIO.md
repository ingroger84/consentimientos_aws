# 📖 Instrucciones para Solucionar Errores en Plantillas

## 🎯 Objetivo
Solucionar los errores al cargar y crear plantillas de consentimiento.

## ⚡ Solución Rápida (2 minutos)

### Paso 1: Limpiar Caché del Navegador

#### Método Rápido (Recomendado)
1. Presiona `Ctrl + Shift + Delete`
2. Asegúrate de seleccionar:
   - ✅ Imágenes y archivos en caché
   - ✅ Intervalo de tiempo: "Desde siempre"
3. Haz clic en **"Borrar datos"**
4. Cierra y vuelve a abrir Chrome

#### Método Alternativo (DevTools)
1. Presiona `F12` para abrir DevTools
2. Haz clic en la pestaña **"Application"**
3. En el menú izquierdo, busca **"Storage"**
4. Haz clic en **"Clear site data"**
5. Confirma haciendo clic en **"Clear site data"** nuevamente

### Paso 2: Recargar la Página
1. Presiona `Ctrl + Shift + R` (recarga forzada)
2. O presiona `Ctrl + F5`

### Paso 3: Probar las Plantillas
1. Ve a: `http://demo-medico.localhost:5173/templates`
2. Deberías ver la página sin errores
3. Haz clic en **"Crear Plantillas Predeterminadas"**
4. Espera unos segundos
5. Deberías ver 3 plantillas creadas

## ✅ Verificación

### ¿Cómo saber si funcionó?

#### ✅ Señales de Éxito:
- La página de plantillas carga sin errores
- No ves mensajes de error en la esquina superior derecha
- Al hacer clic en "Crear Plantillas Predeterminadas" aparece un mensaje de éxito
- Ves 3 plantillas listadas:
  1. Consentimiento de Procedimiento (Predeterminado)
  2. Tratamiento de Datos Personales (Predeterminado)
  3. Autorización de Derechos de Imagen (Predeterminado)

#### ❌ Si aún ves errores:
- Revisa la consola del navegador (F12 > Console)
- Verifica que el backend esté corriendo
- Continúa con la sección de "Troubleshooting" más abajo

## 🔍 Verificación Técnica (Opcional)

### Verificar que el Backend está Corriendo

Abre PowerShell y ejecuta:
```powershell
curl http://localhost:3000/api/health
```

**Resultado esperado:**
```json
{"status":"ok"}
```

Si ves un error de conexión, el backend no está corriendo. Inicia el backend:
```powershell
cd backend
npm run start:dev
```

### Verificar Logs del Navegador

1. Presiona `F12`
2. Ve a la pestaña **"Console"**
3. Recarga la página
4. **NO deberías ver:**
   - ❌ "Error al cargar plantillas"
   - ❌ "Error al crear plantilla"
   - ❌ "SyntaxError: Unexpected token 'new'"

5. **Deberías ver:**
   - ✅ Logs normales de la aplicación
   - ✅ Peticiones HTTP exitosas (código 200)

## 🎓 Uso de las Plantillas

### Crear Plantillas Predeterminadas

1. Ve a: `http://demo-medico.localhost:5173/templates`
2. Haz clic en **"Crear Plantillas Predeterminadas"**
3. Aparecerá un mensaje de confirmación
4. Haz clic en **"Aceptar"**
5. Espera unos segundos
6. Verás un mensaje de éxito: "Se crearon 3 plantillas predeterminadas exitosamente"

### Ver una Plantilla

1. En la lista de plantillas, haz clic en el ícono de **ojo** 👁️
2. Se abrirá un modal mostrando el contenido completo
3. Verás las variables en formato `{{nombreVariable}}`
4. Haz clic en **"Cerrar"** para salir

### Editar una Plantilla

1. Haz clic en el ícono de **lápiz** ✏️
2. Modifica el nombre, descripción o contenido
3. Puedes hacer clic en **"Ver Variables"** para ver las variables disponibles
4. Haz clic en una variable para insertarla en el cursor
5. Haz clic en **"Guardar Cambios"**

### Crear una Plantilla Personalizada

1. Haz clic en **"Nueva Plantilla Personalizada"**
2. Selecciona el tipo de plantilla
3. Escribe un nombre descriptivo
4. Escribe el contenido
5. Usa variables como `{{clientName}}` para datos dinámicos
6. Marca como "Plantilla activa"
7. Opcionalmente marca como "Predeterminada"
8. Haz clic en **"Crear Plantilla"**

### Marcar como Predeterminada

1. Haz clic en el ícono de **estrella** ⭐
2. Confirma la acción
3. La plantilla se marcará como predeterminada
4. Solo puede haber una plantilla predeterminada por tipo

### Eliminar una Plantilla

1. Haz clic en el ícono de **papelera** 🗑️
2. Confirma la eliminación
3. **Nota:** No puedes eliminar plantillas predeterminadas
4. Primero marca otra como predeterminada

## 🎨 Variables Disponibles

Al crear o editar plantillas, puedes usar estas variables:

### Datos del Cliente
- `{{clientName}}` - Nombre completo del cliente
- `{{clientId}}` - Número de identificación
- `{{clientEmail}}` - Email del cliente
- `{{clientPhone}}` - Teléfono del cliente

### Datos del Servicio
- `{{serviceName}}` - Nombre del servicio contratado

### Datos de la Sede
- `{{branchName}}` - Nombre de la sede
- `{{branchAddress}}` - Dirección de la sede
- `{{branchPhone}}` - Teléfono de la sede
- `{{branchEmail}}` - Email de la sede

### Datos de Fecha/Hora
- `{{signDate}}` - Fecha de firma del consentimiento
- `{{signTime}}` - Hora de firma
- `{{currentDate}}` - Fecha actual
- `{{currentYear}}` - Año actual

### Otros
- `{{companyName}}` - Nombre de la empresa

## 🚨 Troubleshooting

### Problema: "Error al cargar plantillas"

**Causa:** El backend no está respondiendo o no tienes permisos

**Solución:**
1. Verifica que el backend esté corriendo:
   ```powershell
   curl http://localhost:3000/api/health
   ```
2. Verifica que tu usuario tenga el permiso `view_templates`
3. Verifica que estés accediendo desde el subdominio correcto: `demo-medico.localhost:5173`

### Problema: "Error al crear plantilla"

**Causa:** No tienes permisos o hay un error en el servidor

**Solución:**
1. Verifica que tu usuario tenga el permiso `create_templates`
2. Revisa los logs del backend en la terminal
3. Verifica que el nombre de la plantilla no esté vacío
4. Verifica que el contenido no esté vacío

### Problema: "SyntaxError: Unexpected token 'new'"

**Causa:** Caché del navegador desactualizada

**Solución:**
1. Limpia la caché del navegador (ver Paso 1 arriba)
2. Recarga con `Ctrl + Shift + R`
3. Si persiste, cierra y vuelve a abrir Chrome

### Problema: La página no carga

**Causa:** Frontend no está corriendo

**Solución:**
1. Abre una terminal en la carpeta del proyecto
2. Ejecuta:
   ```powershell
   cd frontend
   npm run dev
   ```
3. Espera a que inicie
4. Accede a `http://demo-medico.localhost:5173`

### Problema: "Unauthorized" o "No autorizado"

**Causa:** No has iniciado sesión o tu sesión expiró

**Solución:**
1. Ve a `http://demo-medico.localhost:5173/login`
2. Inicia sesión con:
   - Email: `admin@clinicademo.com`
   - Contraseña: `Demo123!`
3. Vuelve a intentar acceder a las plantillas

## 📞 Soporte Adicional

Si después de seguir todos estos pasos aún tienes problemas:

1. **Captura de pantalla:** Toma una captura de los errores en la consola (F12 > Console)
2. **Logs del backend:** Copia los últimos logs de la terminal donde corre el backend
3. **Información del navegador:** Indica qué navegador y versión estás usando
4. **Pasos reproducidos:** Describe exactamente qué hiciste antes del error

## ✅ Checklist Final

Antes de reportar un problema, verifica:

- [ ] Limpié la caché del navegador
- [ ] Recargué con Ctrl+Shift+R
- [ ] El backend está corriendo (puerto 3000)
- [ ] El frontend está corriendo (puerto 5173)
- [ ] Estoy accediendo desde `demo-medico.localhost:5173`
- [ ] He iniciado sesión correctamente
- [ ] Mi usuario tiene permisos de plantillas
- [ ] No veo errores en la consola del navegador
- [ ] Revisé los logs del backend

---

**🎯 Resultado Esperado:** Después de seguir estas instrucciones, deberías poder crear, editar y gestionar plantillas de consentimiento sin problemas.

**⏱️ Tiempo Total:** 2-5 minutos

**🔑 Paso Más Importante:** Limpiar la caché del navegador
