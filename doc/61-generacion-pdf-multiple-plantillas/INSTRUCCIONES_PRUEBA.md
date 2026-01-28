# Instrucciones de Prueba - Generación de PDF con Múltiples Plantillas

**Fecha:** 25 de enero de 2026  
**Versión:** 15.0.13

## 🎯 Objetivo

Probar la funcionalidad completa de generación de PDF con múltiples plantillas de consentimiento desde historias clínicas.

## 📋 Pre-requisitos

### 1. Backend Corriendo
```bash
# Verificar que el backend esté corriendo en puerto 3000
# Debe mostrar: "Nest application successfully started"
```

### 2. Frontend Corriendo
```bash
# Verificar que el frontend esté corriendo en puerto 5173
# Acceder a: http://demo-medico.localhost:5173
```

### 3. Credenciales
- **URL:** http://demo-medico.localhost:5173
- **Usuario:** admin@clinicademo.com
- **Contraseña:** Demo123!

### 4. Plantillas Creadas
- Debe haber al menos 2-3 plantillas activas en el módulo de Plantillas
- Si no hay plantillas, crearlas primero

## 🧪 Pruebas a Realizar

### Prueba 1: Generar PDF con 1 Plantilla

**Pasos:**
1. Iniciar sesión en http://demo-medico.localhost:5173
2. Ir a "Historias Clínicas" en el menú lateral
3. Abrir una historia clínica existente (o crear una nueva)
4. Hacer clic en el botón "Generar Consentimiento"
5. En el modal, seleccionar **1 plantilla** (hacer clic en el checkbox)
6. Verificar que aparece "1 plantilla(s) seleccionada(s)"
7. Hacer clic en "Generar Consentimiento"

**Resultado Esperado:**
- ✅ Mensaje de éxito: "Consentimiento generado exitosamente"
- ✅ Se abre una nueva pestaña con el PDF
- ✅ El PDF contiene:
  - Título de la plantilla
  - Contenido renderizado con datos del paciente
  - Sección de firma al final
  - Footer con nombre de empresa
  - Número de página

**Verificar en el PDF:**
- [ ] Nombre del paciente aparece correctamente
- [ ] Número de identificación es correcto
- [ ] Número de historia clínica es correcto
- [ ] Fecha actual aparece formateada
- [ ] Hay una línea para firma
- [ ] Footer dice "Clínica Demo - Documento generado electrónicamente"
- [ ] Número de página dice "Página 1 de 1"

---

### Prueba 2: Generar PDF con 2 Plantillas

**Pasos:**
1. En la misma historia clínica, hacer clic en "Generar Consentimiento" nuevamente
2. Seleccionar **2 plantillas** diferentes
3. Verificar que aparece "2 plantilla(s) seleccionada(s)"
4. Hacer clic en "Generar Consentimiento"

**Resultado Esperado:**
- ✅ Mensaje de éxito con "PDF generado con 2 plantilla(s)"
- ✅ Se abre PDF en nueva pestaña
- ✅ El PDF contiene:
  - Primera plantilla en página 1
  - Sección de firma después de la primera plantilla
  - Salto de página
  - Segunda plantilla en página 2
  - Sección de firma después de la segunda plantilla
  - Footer en ambas páginas
  - "Página 1 de 2" y "Página 2 de 2"

**Verificar en el PDF:**
- [ ] Hay 2 páginas en total
- [ ] Primera plantilla está completa
- [ ] Segunda plantilla está completa
- [ ] Cada plantilla tiene su sección de firma
- [ ] Los datos del paciente son consistentes en ambas
- [ ] Numeración de páginas es correcta

---

### Prueba 3: Generar PDF con 3+ Plantillas

**Pasos:**
1. Hacer clic en "Generar Consentimiento"
2. Seleccionar **3 o más plantillas**
3. Verificar contador de plantillas seleccionadas
4. Hacer clic en "Generar Consentimiento"

**Resultado Esperado:**
- ✅ PDF con todas las plantillas seleccionadas
- ✅ Cada plantilla en su propia página
- ✅ Secciones de firma en cada una
- ✅ Numeración correcta (ej: "Página 3 de 3")

**Verificar en el PDF:**
- [ ] Todas las plantillas aparecen
- [ ] Orden de plantillas es correcto
- [ ] Cada una tiene sección de firma
- [ ] Numeración de páginas es correcta

---

### Prueba 4: Validación de Selección

**Pasos:**
1. Hacer clic en "Generar Consentimiento"
2. **NO seleccionar ninguna plantilla**
3. Hacer clic en "Generar Consentimiento"

**Resultado Esperado:**
- ✅ Mensaje de error: "Selecciona al menos una plantilla"
- ✅ El modal NO se cierra
- ✅ No se genera ningún PDF

---

### Prueba 5: Seleccionar y Deseleccionar

**Pasos:**
1. Hacer clic en "Generar Consentimiento"
2. Seleccionar 3 plantillas
3. Verificar contador: "3 plantilla(s) seleccionada(s)"
4. Deseleccionar 1 plantilla
5. Verificar contador: "2 plantilla(s) seleccionada(s)"
6. Deseleccionar todas
7. Verificar mensaje de error

**Resultado Esperado:**
- ✅ Contador se actualiza en tiempo real
- ✅ Checkboxes responden correctamente
- ✅ Validación funciona al deseleccionar todas

---

### Prueba 6: Variables Renderizadas

**Pasos:**
1. Crear o editar una plantilla que contenga variables:
   ```
   Paciente: {{clientName}}
   Identificación: {{clientId}}
   Historia Clínica: {{recordNumber}}
   Fecha: {{signDate}}
   ```
2. Generar consentimiento con esta plantilla
3. Abrir el PDF

**Resultado Esperado:**
- ✅ `{{clientName}}` se reemplaza por el nombre real del paciente
- ✅ `{{clientId}}` se reemplaza por el número de identificación
- ✅ `{{recordNumber}}` se reemplaza por el número de HC
- ✅ `{{signDate}}` se reemplaza por la fecha actual formateada

**Verificar en el PDF:**
- [ ] No aparecen las llaves `{{` `}}`
- [ ] Todos los valores son correctos
- [ ] Fechas están formateadas en español
- [ ] No hay campos vacíos

---

### Prueba 7: Link "Gestionar Plantillas"

**Pasos:**
1. Hacer clic en "Generar Consentimiento"
2. Hacer clic en el link "Gestionar plantillas" (arriba a la derecha)

**Resultado Esperado:**
- ✅ Se abre el módulo de Plantillas en nueva pestaña
- ✅ Se pueden ver todas las plantillas
- ✅ Se puede crear una nueva plantilla
- ✅ Al volver a HC, la nueva plantilla aparece en la lista

---

### Prueba 8: Almacenamiento en S3

**Pasos:**
1. Generar un consentimiento
2. Copiar la URL del PDF de la nueva pestaña
3. Cerrar la pestaña del PDF
4. Pegar la URL en una nueva pestaña

**Resultado Esperado:**
- ✅ El PDF se carga correctamente desde la URL
- ✅ La URL es accesible
- ✅ El PDF es el mismo que se generó

**Verificar:**
- [ ] URL comienza con `https://` o `http://`
- [ ] URL contiene el nombre del bucket S3
- [ ] PDF se descarga/visualiza correctamente

---

### Prueba 9: Auditoría

**Pasos:**
1. Generar un consentimiento
2. Verificar en la base de datos (opcional)
3. O verificar en logs del backend

**Resultado Esperado:**
- ✅ Se registra en auditoría:
  - Acción: CREATE_CONSENT
  - Usuario que generó
  - Plantillas seleccionadas
  - URL del PDF
  - Timestamp

---

### Prueba 10: Rendimiento

**Pasos:**
1. Generar PDF con 1 plantilla - medir tiempo
2. Generar PDF con 3 plantillas - medir tiempo
3. Generar PDF con 5 plantillas - medir tiempo

**Resultado Esperado:**
- ✅ 1 plantilla: 1-2 segundos
- ✅ 3 plantillas: 3-4 segundos
- ✅ 5 plantillas: 4-5 segundos
- ✅ No hay errores de timeout
- ✅ El navegador no se congela

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "Error al cargar plantillas"

**Causa:** Backend no está corriendo o no hay plantillas creadas

**Solución:**
1. Verificar que backend esté corriendo en puerto 3000
2. Ir a módulo de Plantillas y crear al menos 1 plantilla
3. Refrescar la página de Historia Clínica

---

### Problema 2: PDF no se abre automáticamente

**Causa:** Bloqueador de pop-ups del navegador

**Solución:**
1. Permitir pop-ups para localhost:5173
2. Buscar el ícono de pop-up bloqueado en la barra de direcciones
3. Hacer clic y permitir pop-ups

---

### Problema 3: Variables no se reemplazan (aparecen `{{variable}}`)

**Causa:** Error en el servicio de renderizado

**Solución:**
1. Verificar logs del backend
2. Verificar que las variables existen en el contexto
3. Verificar sintaxis de Handlebars en la plantilla

---

### Problema 4: "Error al subir PDF a S3"

**Causa:** Configuración de S3 incorrecta

**Solución:**
1. Verificar variables de entorno en `.env`:
   - `USE_S3=true`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET`
   - `AWS_REGION`
2. Si no tienes S3, cambiar `USE_S3=false` para usar almacenamiento local

---

### Problema 5: PDF se genera pero está vacío

**Causa:** Error en el servicio de generación de PDF

**Solución:**
1. Verificar logs del backend
2. Verificar que las plantillas tienen contenido
3. Verificar que PDFKit está instalado: `npm list pdfkit`

---

## 📊 Checklist de Pruebas

### Funcionalidad Básica
- [ ] Seleccionar 1 plantilla y generar PDF
- [ ] Seleccionar múltiples plantillas y generar PDF
- [ ] Validación de selección vacía
- [ ] Contador de plantillas seleccionadas

### Contenido del PDF
- [ ] Título de plantilla aparece
- [ ] Contenido renderizado correctamente
- [ ] Variables reemplazadas con datos reales
- [ ] Sección de firma en cada plantilla
- [ ] Footer con información de empresa
- [ ] Numeración de páginas correcta

### Integración
- [ ] PDF se sube a S3/almacenamiento
- [ ] URL del PDF es accesible
- [ ] PDF se abre en nueva pestaña
- [ ] Link "Gestionar plantillas" funciona
- [ ] Auditoría se registra correctamente

### Rendimiento
- [ ] Generación es rápida (< 5 segundos)
- [ ] No hay errores de timeout
- [ ] Navegador no se congela
- [ ] Tamaño de PDF es razonable (< 1 MB)

### UX
- [ ] Modal es intuitivo
- [ ] Mensajes de éxito/error son claros
- [ ] Loading state es visible
- [ ] Checkboxes responden bien
- [ ] Contador se actualiza en tiempo real

---

## 📝 Reporte de Pruebas

### Información a Incluir

Si encuentras algún problema, reporta:

1. **Descripción del problema**
2. **Pasos para reproducir**
3. **Resultado esperado**
4. **Resultado actual**
5. **Screenshots (si aplica)**
6. **Logs del backend (si aplica)**
7. **Navegador y versión**

### Ejemplo de Reporte

```
Problema: Variables no se reemplazan en el PDF

Pasos:
1. Crear plantilla con "Paciente: {{clientName}}"
2. Generar consentimiento
3. Abrir PDF

Esperado: "Paciente: Juan Pérez"
Actual: "Paciente: {{clientName}}"

Navegador: Chrome 120
Logs: [adjuntar logs del backend]
```

---

## ✅ Criterios de Aceptación

La funcionalidad se considera **completa y funcional** si:

1. ✅ Se pueden seleccionar múltiples plantillas
2. ✅ El PDF se genera correctamente
3. ✅ Las variables se reemplazan con datos reales
4. ✅ El PDF se sube a S3/almacenamiento
5. ✅ El PDF se abre automáticamente
6. ✅ La auditoría se registra
7. ✅ No hay errores en consola
8. ✅ El rendimiento es aceptable (< 5 segundos)
9. ✅ La UX es intuitiva y clara
10. ✅ Todas las pruebas del checklist pasan

---

**Preparado por:** Kiro AI  
**Fecha:** 25 de enero de 2026  
**Estado:** Listo para pruebas
