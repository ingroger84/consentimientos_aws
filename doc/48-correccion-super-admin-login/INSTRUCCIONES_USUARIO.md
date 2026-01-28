# 📖 Instrucciones para el Usuario - Login Super Admin

**Versión**: 15.0.6  
**Fecha**: 2026-01-25

---

## 🎯 ¿Qué se Corrigió?

Se solucionó el problema donde el login del Super Admin en `admin.localhost:5173` no mostraba la personalización (nombre, colores, logo) debido a errores 401 al cargar la configuración.

---

## 🚀 Cómo Probar la Corrección

### Paso 1: Limpiar Caché del Navegador

Es importante limpiar el caché para eliminar tokens antiguos que puedan causar problemas:

1. Presiona `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
2. Selecciona:
   - ✅ Cookies y otros datos de sitios
   - ✅ Imágenes y archivos en caché
3. Rango de tiempo: **Última hora** (o **Todo**)
4. Haz clic en **Borrar datos**

### Paso 2: Acceder al Login del Super Admin

1. Abre tu navegador
2. Ve a: `http://admin.localhost:5173/`
3. Deberías ver el login con:
   - ✅ Nombre: "Sistema de Consentimientos"
   - ✅ Colores personalizados (azul #3B82F6)
   - ✅ Footer: "Sistema de Consentimientos - Administración"
   - ⚠️ Logo: Si no aparece, es normal (ver Paso 4)

### Paso 3: Iniciar Sesión

1. Ingresa tus credenciales de Super Admin:
   - Email: `admin@sistema.com` (o tu email de Super Admin)
   - Contraseña: (tu contraseña)
2. Haz clic en **Iniciar Sesión**
3. Deberías ser redirigido al Dashboard

### Paso 4: Subir Logo del Super Admin (Opcional)

Si quieres que el login muestre un logo personalizado:

1. Desde el Dashboard, ve a **Configuración** (menú lateral)
2. Haz clic en la pestaña **Personalización**
3. En la sección **Logo Principal**:
   - Haz clic en **Seleccionar archivo**
   - Elige tu logo (PNG, JPG, SVG)
   - Tamaño recomendado: 200x200 px
4. Haz clic en **Guardar Cambios**
5. Cierra sesión
6. Vuelve a `admin.localhost:5173`
7. Ahora deberías ver tu logo en el login

---

## 🔍 Verificar que Todo Funciona

### En el Navegador

Abre las **Herramientas de Desarrollo** (F12) y ve a la pestaña **Console**:

✅ **Deberías ver**:
```
[getTenantSlug] Detectado "admin" subdomain -> NULL (Super Admin)
[publicSettingsApi] NO enviando X-Tenant-Slug (Super Admin)
[ThemeContext] No token found, loading public settings
```

❌ **NO deberías ver**:
```
Failed to load resource: 401 (Unauthorized)
Error loading settings
```

### En el Login

✅ **Deberías ver**:
- Nombre de la empresa personalizado
- Colores personalizados
- Footer personalizado
- Logo (si lo subiste)

❌ **NO deberías ver**:
- Letra "S" genérica (a menos que no hayas subido logo)
- Errores en la consola
- Mensajes de error en pantalla

---

## 🐛 Solución de Problemas

### Problema 1: Sigo viendo errores 401

**Solución**:
1. Limpia completamente el localStorage:
   - Abre la consola (F12)
   - Ve a la pestaña **Application** (Chrome) o **Storage** (Firefox)
   - En el menú lateral, haz clic en **Local Storage**
   - Haz clic derecho en `http://admin.localhost:5173`
   - Selecciona **Clear**
2. Recarga la página (F5)

### Problema 2: No veo la personalización

**Solución**:
1. Verifica que el backend esté corriendo:
   - Abre una terminal
   - Ve a la carpeta `backend`
   - Ejecuta: `npm run start:dev`
2. Verifica que el frontend esté corriendo:
   - Abre otra terminal
   - Ve a la carpeta `frontend`
   - Ejecuta: `npm run dev`
3. Verifica que los settings estén en la base de datos:
   - Abre una terminal
   - Ve a la carpeta `backend`
   - Ejecuta: `node scripts/check-super-admin-settings.js`
   - Deberías ver 18 settings

### Problema 3: El logo no aparece

**Solución**:
1. El logo NO se carga automáticamente, debes subirlo manualmente
2. Sigue el **Paso 4** de las instrucciones arriba
3. Asegúrate de que el archivo sea una imagen válida (PNG, JPG, SVG)
4. Tamaño máximo: 5 MB

### Problema 4: "Cannot connect to backend"

**Solución**:
1. Verifica que el backend esté corriendo en puerto 3000:
   ```powershell
   cd backend
   npm run start:dev
   ```
2. Verifica que puedas acceder a: `http://localhost:3000/api/settings/public`
3. Si no funciona, revisa el archivo `.env` en la carpeta `backend`

---

## 📝 Notas Importantes

### Sobre el Logo

⚠️ **El logo NO se migra automáticamente**. Si tenías un logo previamente:
- Debes subirlo de nuevo desde Configuración
- El logo es un archivo físico, no un setting de texto
- Se almacena en la carpeta `backend/uploads/`

### Sobre los Settings

✅ **Los settings de texto SÍ están configurados**:
- Nombre de la empresa
- Colores
- Textos del footer
- Títulos de consentimientos
- Información de contacto

### Sobre el Acceso

✅ **El Super Admin SIEMPRE debe acceder desde**:
- `admin.localhost:5173` (desarrollo)
- `admin.tudominio.com` (producción)

❌ **NO acceder desde**:
- `localhost:5173` (sin subdominio)
- `tudominio.com` (sin subdominio)

---

## 🎓 Conceptos Clave

### ¿Qué es el Super Admin?

El Super Admin es el administrador global del sistema que:
- Gestiona todos los tenants (clientes)
- Tiene acceso a estadísticas globales
- Puede crear y configurar nuevos tenants
- Accede desde el subdominio `admin`

### ¿Qué son los Settings?

Los settings son configuraciones personalizables:
- Nombre de la empresa
- Logo
- Colores del tema
- Información de contacto
- Textos personalizables

Cada tenant tiene sus propios settings, y el Super Admin también.

### ¿Por qué se Separaron las Instancias Axios?

Para evitar enviar el token JWT a endpoints públicos:
- **Endpoints públicos** (como `/settings/public`): NO requieren autenticación
- **Endpoints privados** (como `/settings`): SÍ requieren autenticación

Si se envía un token inválido a un endpoint público, el backend lo rechaza con 401.

---

## 📞 Soporte

Si tienes problemas después de seguir estas instrucciones:

1. **Revisa los logs del backend**:
   ```powershell
   cd backend
   npm run start:dev
   # Observa los mensajes en la consola
   ```

2. **Revisa los logs del frontend**:
   - Abre la consola del navegador (F12)
   - Ve a la pestaña **Console**
   - Busca mensajes de error en rojo

3. **Ejecuta el script de verificación**:
   ```powershell
   cd backend
   node scripts/check-super-admin-settings.js
   ```

4. **Contacta al equipo de desarrollo** con:
   - Capturas de pantalla de los errores
   - Logs de la consola del navegador
   - Logs del backend
   - Pasos que seguiste

---

## ✅ Checklist Final

Después de seguir estas instrucciones, verifica:

- [ ] Puedo acceder a `admin.localhost:5173`
- [ ] El login muestra el nombre personalizado
- [ ] El login muestra los colores personalizados
- [ ] No hay errores 401 en la consola
- [ ] Puedo iniciar sesión correctamente
- [ ] El dashboard carga sin errores
- [ ] (Opcional) Subí el logo y se muestra en el login

---

**Desarrollado por**: Kiro AI Assistant  
**Fecha**: 2026-01-25  
**Versión**: 15.0.6
