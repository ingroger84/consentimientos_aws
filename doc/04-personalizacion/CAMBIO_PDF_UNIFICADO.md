# Cambio a PDF Unificado

## ✅ Cambio Implementado

### Antes
- Se generaban **3 archivos PDF separados**:
  1. `consent-{id}.pdf` - Procedimiento
  2. `consent-data-treatment-{id}.pdf` - Datos Personales
  3. `consent-image-rights-{id}.pdf` - Imágenes
- El email incluía 3 archivos adjuntos

### Ahora
- Se genera **1 solo archivo PDF** con las 3 secciones:
  1. **Página 1-2:** Consentimiento del Procedimiento
  2. **Página 3:** Consentimiento de Tratamiento de Datos Personales
  3. **Página 4:** Consentimiento de Utilización de Imágenes
- El email incluye 1 solo archivo adjunto
- **Cada sección tiene su propia firma digital**

---

## 📄 Estructura del PDF Unificado

### Sección 1: Consentimiento del Procedimiento
- Header verde con título
- Información del servicio
- Datos del cliente
- Preguntas y respuestas del servicio
- Declaración de consentimiento
- **Firma digital**

### Sección 2: Tratamiento de Datos Personales
- Header verde con título
- Ley 1581 de 2012
- Derechos del titular
- Información de contacto de la sede
- Datos del titular
- **Firma digital**

### Sección 3: Utilización de Imágenes
- Header verde con título
- Autorización para uso de imágenes
- Finalidades del tratamiento
- Derechos del titular
- Datos del titular
- **Firma digital**

---

## 🔧 Cambios Técnicos

### Backend

#### `backend/src/consents/pdf.service.ts`
- **Nuevo método:** `generateUnifiedConsentPdf()` - Genera un solo PDF con las 3 secciones
- **Método privado:** `addProcedureSection()` - Agrega sección del procedimiento
- **Método privado:** `addDataTreatmentSection()` - Agrega sección de datos personales
- **Método privado:** `addImageRightsSection()` - Agrega sección de imágenes
- **Método privado:** `addSignatureSection()` - Agrega firma a cada sección

#### `backend/src/consents/email.service.ts`
- Actualizado para adjuntar solo 1 PDF
- Template de email actualizado con mensaje de documento único

### Frontend

#### `frontend/src/pages/ConsentsPage.tsx`
- Ahora muestra **1 solo botón de PDF** (verde) en lugar de 3
- Título actualizado: "Ver Consentimientos"

#### `frontend/src/components/PdfViewer.tsx`
- Título actualizado: "Consentimientos Informados Completos"
- Nombre de descarga: `consentimientos-{cedula}.pdf`

---

## 📧 Email Enviado

### Asunto
`Consentimientos Informados - [Nombre del Servicio]`

### Archivo Adjunto
`consentimientos-[cedula].pdf` (1 solo archivo)

### Contenido del Email
- Mensaje indicando que se adjunta el documento completo
- Información de la sede
- Fecha de firma

---

## 🎯 Ventajas del PDF Unificado

1. **Más fácil de gestionar** - Un solo archivo en lugar de 3
2. **Menos confusión** - El cliente recibe todo en un documento
3. **Mejor organización** - Todo está en orden secuencial
4. **Mismo nivel legal** - Cada sección mantiene su firma digital
5. **Más profesional** - Documento único y completo

---

## 🧪 Cómo Probar

### 1. Crear un Nuevo Consentimiento
1. Ir a http://localhost:5173
2. Login: admin@consentimientos.com / admin123
3. Ir a "Consentimientos" → "Nuevo Consentimiento"
4. Llenar datos y firmar

### 2. Verificar el PDF
1. En la lista de consentimientos
2. Click en el botón de PDF (📄 verde)
3. Verificar que el PDF tiene:
   - **Página 1-2:** Procedimiento con firma
   - **Página 3:** Datos personales con firma
   - **Página 4:** Imágenes con firma

### 3. Verificar el Email
1. Abrir MailHog: http://localhost:8025
2. Ver el email enviado
3. Verificar que tiene **1 solo archivo adjunto**
4. Descargar y verificar que contiene las 3 secciones

---

## 📋 Archivos Modificados

### Backend
1. ✅ `backend/src/consents/pdf.service.ts` - Reescrito completamente
2. ✅ `backend/src/consents/email.service.ts` - Actualizado para 1 PDF

### Frontend
1. ✅ `frontend/src/pages/ConsentsPage.tsx` - 1 botón en lugar de 3
2. ✅ `frontend/src/components/PdfViewer.tsx` - Títulos actualizados

---

## 🔄 Estado de la Base de Datos

**No se requieren cambios en la base de datos.**

Los campos `pdfDataTreatmentUrl` y `pdfImageRightsUrl` ahora apuntan al mismo archivo que `pdfUrl`, manteniendo compatibilidad con el código existente.

---

## ✅ Sistema Listo

El sistema está funcionando con el nuevo formato de PDF unificado:

- ✅ Backend corriendo en http://localhost:3000
- ✅ Frontend corriendo en http://localhost:5173
- ✅ Docker services activos
- ✅ PDF unificado generándose correctamente
- ✅ Email con 1 solo adjunto

**Todo está listo para usar.**
