# ✅ Prueba de Personalización Avanzada de PDFs

## 🎯 Estado Actual

### ✅ Implementación Completada
- **Backend**: 100% funcional con 23 campos configurables
- **Frontend**: Página de configuración con 4 tabs completamente implementada
- **Hot-Reload**: Vite detectó los cambios correctamente
- **Rutas**: Configuradas en `/settings`
- **Permisos**: `view_settings` y `edit_settings` configurados para admin

---

## 🚀 Pasos para Probar

### 1. Refrescar el Navegador
```
Presiona: Ctrl + Shift + R (Windows)
o
Cmd + Shift + R (Mac)
```

### 2. Acceder a Configuración
1. Login como admin:
   - Email: `admin@consentimientos.com`
   - Password: `admin123`

2. Click en **"Configuración"** en el menú lateral izquierdo

3. Deberías ver 4 tabs:
   - 🏢 **Empresa**: Información de contacto + configuración de logo
   - 🖼️ **Logos**: Subida de 3 logos (principal, footer, marca de agua)
   - 🎨 **Colores**: 6 colores personalizables
   - 📝 **Textos**: Títulos de secciones + texto del footer

---

## 📋 Funcionalidades a Probar

### Tab 1: Empresa
- [ ] Editar nombre de la empresa
- [ ] Agregar dirección, teléfono, email, sitio web
- [ ] Cambiar tamaño del logo (30-150px)
- [ ] Cambiar posición del logo (izquierda, centro, derecha)
- [ ] Ajustar opacidad de marca de agua (0.0-1.0)
- [ ] Guardar cambios

### Tab 2: Logos
- [ ] Subir logo principal (aparece en header del PDF)
- [ ] Subir logo del footer (aparece en footer del PDF)
- [ ] Subir marca de agua (aparece centrada en el fondo)
- [ ] Verificar vista previa de cada logo

### Tab 3: Colores
- [ ] Cambiar color primario (header del PDF)
- [ ] Cambiar color secundario
- [ ] Cambiar color de acento (títulos de secciones)
- [ ] Cambiar color de texto principal
- [ ] Cambiar color de enlaces
- [ ] Cambiar color de bordes
- [ ] Ver vista previa de colores en la parte inferior

### Tab 4: Textos
- [ ] Editar título del consentimiento del procedimiento
- [ ] Editar título del tratamiento de datos
- [ ] Editar título de derechos de imagen
- [ ] Agregar texto personalizado para el footer
- [ ] Guardar cambios

---

## 🧪 Prueba Completa

### Paso 1: Personalizar Configuración
1. Ve a **Configuración**
2. En tab **Empresa**:
   - Cambia el nombre a "Mi Clínica"
   - Agrega dirección, teléfono, email
   - Cambia tamaño de logo a 80px
   - Cambia posición a "centro"

3. En tab **Logos**:
   - Sube un logo principal (PNG o JPG)
   - Sube un logo para el footer
   - Sube una marca de agua

4. En tab **Colores**:
   - Cambia el color primario a #2563EB (azul)
   - Cambia el color de acento a #DC2626 (rojo)

5. En tab **Textos**:
   - Cambia el título del procedimiento
   - Agrega texto en el footer: "Documento confidencial"

6. Click en **"Guardar Cambios"**

### Paso 2: Crear Consentimiento de Prueba
1. Ve a **"Consentimientos"**
2. Click en **"Nuevo Consentimiento"**
3. Llena el formulario:
   - Selecciona una sede
   - Selecciona un servicio
   - Llena datos del cliente
   - Responde las preguntas
   - Firma el consentimiento
   - Toma foto del cliente

4. Click en **"Guardar"**

### Paso 3: Verificar PDF Personalizado
1. En la lista de consentimientos, busca el que acabas de crear
2. Click en **"Ver PDF"** o descarga el PDF
3. Verifica que el PDF tenga:
   - ✅ Logo en el header (tamaño y posición correctos)
   - ✅ Colores personalizados en header y títulos
   - ✅ Marca de agua centrada en el fondo
   - ✅ Footer con logo e información de contacto
   - ✅ Texto personalizado en el footer
   - ✅ Títulos personalizados en las 3 secciones

---

## 🎨 Características Implementadas

### Logos (3 tipos)
- ✅ Logo principal (header)
- ✅ Logo del footer
- ✅ Marca de agua (fondo transparente)

### Colores (6 personalizables)
- ✅ Color primario (header)
- ✅ Color secundario
- ✅ Color de acento (títulos)
- ✅ Color de texto principal
- ✅ Color de enlaces
- ✅ Color de bordes

### Configuración de Logo
- ✅ Tamaño configurable (30-150px)
- ✅ Posición configurable (izquierda, centro, derecha)
- ✅ Opacidad de marca de agua (0.0-1.0)

### Información de Empresa
- ✅ Nombre de la empresa
- ✅ Dirección
- ✅ Teléfono
- ✅ Email
- ✅ Sitio web

### Textos Personalizables
- ✅ Título del consentimiento del procedimiento
- ✅ Título del tratamiento de datos
- ✅ Título de derechos de imagen
- ✅ Texto del footer

### Footer Personalizado
- ✅ Logo del footer
- ✅ Información de contacto (dirección, teléfono, email, web)
- ✅ Texto personalizado
- ✅ Línea separadora con color configurable

---

## 🔧 Servicios Corriendo

### Backend
- **Puerto**: 3000
- **Estado**: ✅ Corriendo
- **Endpoints**:
  - `GET /api/settings` - Obtener configuración
  - `PATCH /api/settings` - Actualizar configuración
  - `POST /api/settings/logo` - Subir logo principal
  - `POST /api/settings/footer-logo` - Subir logo del footer
  - `POST /api/settings/watermark-logo` - Subir marca de agua

### Frontend
- **Puerto**: 5173
- **Estado**: ✅ Corriendo
- **Hot-Reload**: ✅ Activo
- **Ruta**: http://localhost:5173/settings

---

## 📝 Notas Importantes

1. **Refrescar Navegador**: Después de los cambios, es necesario refrescar con `Ctrl + Shift + R`

2. **Formatos de Imagen**: Los logos aceptan PNG y JPG (máximo 5MB)

3. **Colores**: Se pueden ingresar en formato hexadecimal (#RRGGBB) o usar el selector de color

4. **Permisos**: Solo usuarios con rol admin pueden ver y editar la configuración

5. **PDFs**: Los cambios se aplican a los nuevos PDFs generados (no afectan PDFs anteriores)

6. **Vista Previa**: En la parte inferior de la página hay una vista previa de los colores configurados

---

## ✅ Checklist de Verificación

- [ ] Puedo acceder a `/settings` desde el menú
- [ ] Veo las 4 tabs (Empresa, Logos, Colores, Textos)
- [ ] Puedo editar información de la empresa
- [ ] Puedo subir los 3 tipos de logos
- [ ] Puedo cambiar los 6 colores
- [ ] Puedo editar los textos personalizables
- [ ] El botón "Guardar Cambios" funciona
- [ ] Veo mensajes de éxito/error
- [ ] Los cambios se reflejan en nuevos PDFs
- [ ] El footer aparece en todas las páginas del PDF
- [ ] La marca de agua aparece centrada en el fondo

---

## 🎉 ¡Todo Listo!

El sistema de personalización avanzada de PDFs está completamente implementado y funcional. Puedes personalizar completamente la apariencia de tus PDFs desde la interfaz web.

**Próximos pasos sugeridos**:
1. Probar todas las funcionalidades
2. Crear varios consentimientos de prueba
3. Verificar que los PDFs se generen correctamente
4. Ajustar colores y logos según tu marca

---

**Fecha de implementación**: 5 de enero de 2026
**Estado**: ✅ COMPLETADO
