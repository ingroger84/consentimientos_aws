# Guía para Crear Tutorial de Pago en PDF y Video

## 📄 Cómo Crear el PDF con Imágenes Reales

### Opción 1: Usando Pandoc (Recomendado)

#### Requisitos:
- Pandoc instalado: https://pandoc.org/installing.html
- Capturas de pantalla del sistema

#### Pasos:

1. **Tomar Capturas de Pantalla**
   
   Necesitas capturar las siguientes pantallas del sistema:
   
   - `screenshot-01-login.png` - Pantalla de inicio de sesión
   - `screenshot-02-menu-facturas.png` - Menú lateral con opción Facturas
   - `screenshot-03-lista-facturas.png` - Lista de facturas con botón "Pagar Ahora"
   - `screenshot-04-generando-link.png` - Mensaje de generación de link
   - `screenshot-05-bold-metodos.png` - Pantalla de Bold con métodos de pago
   - `screenshot-06-bold-tarjeta.png` - Formulario de pago con tarjeta
   - `screenshot-07-pago-exitoso.png` - Confirmación de pago exitoso
   - `screenshot-08-factura-pagada.png` - Factura actualizada en la plataforma

2. **Crear Carpeta de Imágenes**
   
   ```bash
   mkdir doc/tutorial-pago-imagenes
   # Coloca todas las capturas en esta carpeta
   ```

3. **Crear Archivo Markdown con Imágenes**
   
   Crea `doc/TUTORIAL_PAGO_FACTURA_CON_IMAGENES.md` basado en el archivo existente pero agregando las imágenes:
   
   ```markdown
   ## 🚀 Paso 1: Acceder a tu Cuenta
   
   ![Pantalla de Login](tutorial-pago-imagenes/screenshot-01-login.png)
   
   ### 1.1 Ingresa a la Plataforma
   ...
   ```

4. **Convertir a PDF con Pandoc**
   
   ```bash
   pandoc doc/TUTORIAL_PAGO_FACTURA_CON_IMAGENES.md \
     -o doc/TUTORIAL_PAGO_FACTURA.pdf \
     --pdf-engine=xelatex \
     --toc \
     --toc-depth=2 \
     -V geometry:margin=1in \
     -V fontsize=11pt \
     -V documentclass=article \
     -V colorlinks=true \
     -V linkcolor=blue \
     --highlight-style=tango
   ```

### Opción 2: Usando Markdown to PDF (Online)

1. Visita: https://www.markdowntopdf.com/
2. Copia el contenido de `TUTORIAL_PAGO_FACTURA.md`
3. Pega en el editor
4. Sube las imágenes usando el botón de imagen
5. Descarga el PDF generado

### Opción 3: Usando Microsoft Word

1. Abre `TUTORIAL_PAGO_FACTURA.md` en VS Code
2. Copia todo el contenido
3. Pega en Word (mantendrá el formato)
4. Inserta las capturas de pantalla manualmente
5. Guarda como PDF: Archivo → Guardar como → PDF

---

## 🎥 Cómo Crear el Video Tutorial

### Opción 1: OBS Studio (Gratuito y Profesional)

#### Instalación:
- Descarga: https://obsproject.com/
- Instala OBS Studio en tu computadora

#### Configuración:

1. **Configurar Escena**
   - Abre OBS Studio
   - Clic en "+" en Fuentes
   - Selecciona "Captura de Pantalla"
   - Nombra: "Pantalla Principal"

2. **Configurar Audio**
   - En Mezclador de Audio, verifica que "Mic/Aux" esté activo
   - Ajusta el volumen del micrófono

3. **Configurar Salida**
   - Archivo → Configuración → Salida
   - Formato: MP4
   - Calidad: Alta
   - Resolución: 1920x1080

#### Grabación:

1. **Preparar el Guion**
   
   Usa este guion basado en el tutorial:
   
   ```
   [INTRO - 10 segundos]
   "Hola, en este video te mostraré cómo pagar tu factura en Archivo en Línea paso a paso."
   
   [PASO 1 - 30 segundos]
   "Primero, ingresa a archivoenlinea.com y haz clic en Iniciar Sesión..."
   
   [PASO 2 - 20 segundos]
   "Una vez dentro, ve al menú lateral y haz clic en Facturas..."
   
   [PASO 3 - 30 segundos]
   "Aquí verás todas tus facturas. Identifica la que está pendiente y haz clic en Pagar Ahora..."
   
   [PASO 4 - 20 segundos]
   "El sistema generará un link de pago seguro y te redirigirá a Bold..."
   
   [PASO 5 - 60 segundos]
   "En Bold, selecciona tu método de pago preferido. Puedes usar tarjeta, PSE o efectivo..."
   
   [PASO 6 - 30 segundos]
   "Una vez completado el pago, verás la confirmación y recibirás un email..."
   
   [OUTRO - 10 segundos]
   "¡Y listo! Tu factura está pagada. Si tienes dudas, contacta a soporte@archivoenlinea.com"
   ```

2. **Grabar**
   - Clic en "Iniciar Grabación"
   - Sigue el guion mientras navegas por el sistema
   - Habla claro y pausado
   - Clic en "Detener Grabación" al finalizar

3. **Editar (Opcional)**
   - Usa el editor de video de Windows (Fotos) o DaVinci Resolve (gratuito)
   - Corta errores o pausas largas
   - Agrega intro/outro con el logo de Archivo en Línea
   - Agrega música de fondo suave (opcional)

4. **Exportar**
   - Formato: MP4
   - Resolución: 1920x1080
   - Bitrate: 5000 kbps
   - Nombre: `tutorial-pago-archivo-en-linea.mp4`

### Opción 2: Loom (Más Fácil)

#### Instalación:
- Visita: https://www.loom.com/
- Crea una cuenta gratuita
- Instala la extensión de Chrome o la app de escritorio

#### Grabación:

1. Abre Loom
2. Selecciona "Pantalla y Cámara" o solo "Pantalla"
3. Clic en "Iniciar Grabación"
4. Sigue el guion del tutorial
5. Clic en "Finalizar"
6. Loom procesará el video automáticamente
7. Descarga el video o comparte el link

### Opción 3: Camtasia (Profesional - Pago)

- Descarga: https://www.techsmith.com/video-editor.html
- Prueba gratuita de 30 días
- Interfaz muy intuitiva
- Incluye editor completo con efectos

---

## 📊 Especificaciones Técnicas Recomendadas

### Para PDF:
- **Formato**: A4 (210 x 297 mm)
- **Márgenes**: 2.5 cm en todos los lados
- **Fuente**: Arial o Helvetica, 11pt
- **Imágenes**: PNG o JPG, máximo 1920x1080
- **Tamaño final**: Menos de 10 MB

### Para Video:
- **Resolución**: 1920x1080 (Full HD)
- **Frame Rate**: 30 fps
- **Formato**: MP4 (H.264)
- **Bitrate**: 5000 kbps
- **Audio**: AAC, 128 kbps, 44.1 kHz
- **Duración**: 3-5 minutos
- **Tamaño final**: Menos de 100 MB

---

## 📝 Checklist de Contenido

### Para el PDF:
- [ ] Portada con logo y título
- [ ] Índice de contenidos
- [ ] 8 capturas de pantalla reales
- [ ] Diagramas de flujo
- [ ] Sección de FAQ
- [ ] Información de contacto
- [ ] Pie de página con número de página

### Para el Video:
- [ ] Intro con logo (5-10 segundos)
- [ ] Demostración completa del proceso
- [ ] Narración clara en español
- [ ] Subtítulos (opcional pero recomendado)
- [ ] Música de fondo suave
- [ ] Outro con información de contacto
- [ ] Duración total: 3-5 minutos

---

## 🎨 Recursos Adicionales

### Herramientas para Capturas de Pantalla:
- **Windows**: Snipping Tool (Win + Shift + S)
- **Mac**: Cmd + Shift + 4
- **Extensión Chrome**: Awesome Screenshot

### Herramientas de Edición de Imágenes:
- **GIMP** (gratuito): https://www.gimp.org/
- **Paint.NET** (gratuito): https://www.getpaint.net/
- **Photoshop** (pago): https://www.adobe.com/photoshop

### Música de Fondo (Libre de Derechos):
- **YouTube Audio Library**: https://studio.youtube.com/
- **Incompetech**: https://incompetech.com/
- **Bensound**: https://www.bensound.com/

### Bancos de Iconos:
- **Flaticon**: https://www.flaticon.com/
- **Font Awesome**: https://fontawesome.com/
- **Material Icons**: https://fonts.google.com/icons

---

## 📤 Distribución

### Dónde Publicar el Video:
1. **YouTube** (público o no listado)
2. **Vimeo** (más profesional)
3. **Servidor propio** (mayor control)
4. **Dentro de la plataforma** (integrado en la app)

### Dónde Compartir el PDF:
1. **Email** a todos los clientes
2. **Centro de ayuda** en la web
3. **Dentro de la plataforma** (sección de ayuda)
4. **Google Drive** o **Dropbox** (link compartido)

---

## ⏱️ Tiempo Estimado

### Creación del PDF:
- Tomar capturas: 15 minutos
- Editar markdown: 30 minutos
- Generar PDF: 5 minutos
- **Total: ~50 minutos**

### Creación del Video:
- Preparar guion: 20 minutos
- Configurar OBS/Loom: 10 minutos
- Grabar (con ensayos): 30-60 minutos
- Editar: 30-60 minutos
- Exportar: 10 minutos
- **Total: ~2-3 horas**

---

## 💡 Consejos Finales

### Para el PDF:
1. Usa imágenes de alta calidad pero comprimidas
2. Mantén un diseño consistente en todas las páginas
3. Usa colores de la marca (morado/azul de Archivo en Línea)
4. Incluye números de página
5. Agrega un índice clickeable

### Para el Video:
1. Practica el guion antes de grabar
2. Usa un micrófono de buena calidad
3. Graba en un ambiente silencioso
4. Habla despacio y claro
5. Muestra el cursor claramente
6. Agrega pausas entre pasos
7. Incluye subtítulos para accesibilidad

---

## 📞 Soporte

Si necesitas ayuda con la creación de estos materiales, contacta al equipo de desarrollo o marketing.

**Email**: soporte@archivoenlinea.com

---

**Última Actualización**: Abril 2026  
**Versión**: 1.0
