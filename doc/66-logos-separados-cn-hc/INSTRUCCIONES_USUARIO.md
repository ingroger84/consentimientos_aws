# 📖 Guía de Usuario - Logos Separados CN/HC

## 🎯 ¿Qué es esta funcionalidad?

Ahora puedes configurar logos diferentes para:
- **Consentimientos tradicionales (CN)**: Los consentimientos que generas desde el módulo "Consentimientos"
- **Historias Clínicas (HC)**: Los consentimientos que generas desde el módulo "Historias Clínicas"

Esto te permite tener una identidad visual diferente para cada tipo de documento.

## 🚀 Cómo Usar

### 1. Acceder a la Configuración

1. Inicia sesión en tu cuenta
2. Ve al menú lateral izquierdo
3. Click en **"Configuración"**
4. Verás varias pestañas en la parte superior

### 2. Configurar Logos para Consentimientos (CN)

1. Click en la pestaña **"Logos CN"**
2. Verás 4 opciones:
   - **Logo Principal CN**: Aparece en la parte superior del PDF
   - **Logo del Footer CN**: Aparece en la parte inferior del PDF
   - **Marca de Agua CN**: Aparece en el fondo del PDF (con transparencia)
   - **Favicon**: Icono que aparece en la pestaña del navegador

3. Para subir un logo:
   - Click en el botón **"Subir Logo"**
   - Selecciona una imagen de tu computadora
   - Formatos permitidos: JPG, PNG, GIF, SVG
   - Tamaño máximo: 5MB
   - Espera a que se suba (verás un mensaje de confirmación)

4. El logo se mostrará inmediatamente en la interfaz

### 3. Configurar Logos para Historias Clínicas (HC)

1. Click en la pestaña **"Logos HC"**
2. Verás un mensaje informativo:
   > "Estos logos se usarán exclusivamente en los PDFs generados desde el módulo de Historias Clínicas. Si no configuras logos HC, se usarán automáticamente los logos CN como respaldo."

3. Verás 3 opciones:
   - **Logo Principal HC**: Aparece en la parte superior del PDF de HC
   - **Logo del Footer HC**: Aparece en la parte inferior del PDF de HC
   - **Marca de Agua HC**: Aparece en el fondo del PDF de HC

4. Para subir un logo HC:
   - Click en el botón **"Subir Logo HC"**
   - Selecciona una imagen de tu computadora
   - Formatos permitidos: JPG, PNG, GIF, SVG
   - Tamaño máximo: 5MB
   - Espera a que se suba (verás un mensaje de confirmación)

5. Si NO subes logos HC:
   - Verás un borde punteado
   - Mensaje: "No configurado - Usando logo CN"
   - Los PDFs de HC usarán automáticamente los logos CN

## 🎨 Casos de Uso

### Caso 1: Mismos logos para todo
**Situación**: Quieres usar los mismos logos en consentimientos y HC

**Solución**:
1. Configura solo los logos CN
2. NO configures logos HC
3. Todos los PDFs usarán los logos CN automáticamente

### Caso 2: Logos diferentes para HC
**Situación**: Quieres que las HC tengan logos diferentes

**Solución**:
1. Configura los logos CN (para consentimientos tradicionales)
2. Configura los logos HC (para historias clínicas)
3. Cada módulo usará sus propios logos

### Caso 3: Solo algunos logos HC diferentes
**Situación**: Quieres que solo el logo principal sea diferente en HC

**Solución**:
1. Configura todos los logos CN
2. Configura solo el logo principal HC
3. Las HC usarán:
   - Logo principal HC (el que subiste)
   - Logo footer CN (fallback automático)
   - Marca de agua CN (fallback automático)

## 📋 Verificar que Funciona

### Verificar Logos CN
1. Ve a **Consentimientos**
2. Genera un nuevo consentimiento
3. Descarga el PDF
4. Verifica que aparecen tus logos CN

### Verificar Logos HC
1. Ve a **Historias Clínicas**
2. Abre una historia clínica
3. Click en **"Generar Consentimiento"**
4. Selecciona plantillas
5. Genera el PDF
6. Descarga el PDF
7. Verifica que aparecen:
   - Logos HC (si los configuraste)
   - Logos CN (si NO configuraste logos HC)

## ❓ Preguntas Frecuentes

### ¿Qué pasa si no configuro logos HC?
Los PDFs de historias clínicas usarán automáticamente los logos CN. No necesitas hacer nada especial.

### ¿Puedo usar diferentes logos para cada sede?
No, los logos son por tenant (cuenta). Todas las sedes de tu cuenta usarán los mismos logos.

### ¿Qué formatos de imagen puedo usar?
JPG, JPEG, PNG, GIF, SVG. Recomendamos PNG con fondo transparente para mejor calidad.

### ¿Cuál es el tamaño recomendado para los logos?
- **Logo principal**: 200-400px de ancho
- **Logo footer**: 150-300px de ancho
- **Marca de agua**: 500-800px de ancho (se mostrará con transparencia)
- **Favicon**: 32x32px o 64x64px

### ¿Puedo eliminar un logo?
Actualmente no hay opción de eliminar. Puedes subir un logo nuevo para reemplazarlo.

### ¿Los cambios afectan PDFs ya generados?
No, solo afectan los PDFs que generes después de cambiar los logos.

### ¿Puedo ver un preview antes de generar el PDF?
Actualmente no, pero puedes generar un PDF de prueba para verificar cómo se ven los logos.

## 🎯 Mejores Prácticas

1. **Usa PNG con fondo transparente**: Se ve mejor en los PDFs
2. **Optimiza el tamaño**: Logos muy grandes pueden hacer el PDF más pesado
3. **Mantén la proporción**: Logos cuadrados o rectangulares funcionan mejor
4. **Prueba primero**: Genera un PDF de prueba antes de usar en producción
5. **Consistencia**: Usa logos con colores que combinen con tu marca

## 🆘 Soporte

Si tienes problemas:
1. Verifica que la imagen sea menor a 5MB
2. Verifica que el formato sea JPG, PNG, GIF o SVG
3. Intenta con otra imagen
4. Contacta a soporte técnico si el problema persiste

---

**Última actualización**: 26 de enero de 2026
**Versión**: 15.0.10
