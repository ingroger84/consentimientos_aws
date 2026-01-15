# Implementación de 3 PDFs por Consentimiento

## ✅ Cambios Implementados

### 1. **Base de Datos**
Se agregaron 2 nuevas columnas a la tabla `consents`:
- `pdf_data_treatment_url` - URL del PDF de Tratamiento de Datos Personales
- `pdf_image_rights_url` - URL del PDF de Utilización de Imágenes

**Migración:** `backend/src/database/migrations/1704297600000-AddMultiplePdfUrls.ts`

### 2. **Backend - Generación de PDFs**

#### PdfService (`backend/src/consents/pdf.service.ts`)
- **Nuevo método:** `generateAllConsentPdfs()` - Genera los 3 PDFs simultáneamente
- **Nuevo método:** `generateDataTreatmentPdf()` - PDF de Tratamiento de Datos Personales
- **Nuevo método:** `generateImageRightsPdf()` - PDF de Utilización de Imágenes
- Cada PDF incluye la firma digital del cliente

#### Contenido de los PDFs:

**1. PDF del Procedimiento** (ya existía, mejorado)
- Información del servicio específico
- Preguntas y respuestas del cliente
- Declaración de consentimiento
- Firma digital

**2. PDF de Tratamiento de Datos Personales**
- Ley Estatutaria 1581 de 2012
- Derechos del titular (acceso, corrección, supresión, revocación)
- Información de contacto de la sede
- Firma digital

**3. PDF de Utilización de Imágenes**
- Autorización para uso de imágenes fotográficas
- Finalidades del tratamiento (marketing, publicidad, etc.)
- Derechos del titular
- Firma digital

### 3. **Backend - Servicio de Consentimientos**

#### ConsentsService (`backend/src/consents/consents.service.ts`)
- Actualizado método `sign()` para generar los 3 PDFs
- Actualizado método `findAll()` con búsqueda por:
  - Nombre del cliente
  - Cédula/ID
  - Teléfono

#### ConsentsController (`backend/src/consents/consents.controller.ts`)
- **Nuevo endpoint:** `GET /consents/:id/pdf` - PDF del procedimiento
- **Nuevo endpoint:** `GET /consents/:id/pdf-data-treatment` - PDF de datos
- **Nuevo endpoint:** `GET /consents/:id/pdf-image-rights` - PDF de imágenes
- **Actualizado:** `GET /consents?search=...` - Búsqueda con query param

### 4. **Backend - Servicio de Email**

#### EmailService (`backend/src/consents/email.service.ts`)
- Actualizado para adjuntar los 3 PDFs en un solo email
- Template mejorado con lista de documentos adjuntos

### 5. **Frontend - Página de Consentimientos**

#### ConsentsPage (`frontend/src/pages/ConsentsPage.tsx`)
- **Barra de búsqueda** - Buscar por nombre, cédula o teléfono
- **3 botones de PDF** por consentimiento:
  - 📄 Verde - PDF del Procedimiento
  - 📄 Azul - PDF de Datos Personales
  - 📄 Morado - PDF de Imágenes
- **Botón de reenvío de email** - Reenvía los 3 PDFs
- **Botón de eliminar** - Elimina el consentimiento (soft delete)

#### PdfViewer (`frontend/src/components/PdfViewer.tsx`)
- Actualizado para soportar los 3 tipos de PDF
- Títulos dinámicos según el tipo de PDF
- Descarga con nombre apropiado

### 6. **Frontend - Tipos**

#### types/index.ts
- Agregados campos `pdfDataTreatmentUrl` y `pdfImageRightsUrl` al tipo `Consent`

---

## 🎯 Flujo Completo

### Al Firmar un Consentimiento:

1. **Cliente firma** en el paso 3 del formulario
2. **Backend genera 3 PDFs:**
   - `consent-{id}.pdf` - Procedimiento
   - `consent-data-treatment-{id}.pdf` - Datos Personales
   - `consent-image-rights-{id}.pdf` - Imágenes
3. **Cada PDF incluye:**
   - Información del cliente
   - Información de la sede
   - Firma digital
   - Fecha y hora
4. **Email enviado** con los 3 PDFs adjuntos
5. **Estado actualizado** a SENT

### En la Lista de Consentimientos:

1. **Búsqueda en tiempo real** por nombre, cédula o teléfono
2. **3 botones de visualización** para cada PDF
3. **Botón de reenvío** para enviar los 3 PDFs nuevamente
4. **Botón de eliminar** para borrar el consentimiento

---

## 📧 Email Enviado

El email incluye:
- Asunto: "Consentimientos Informados - [Nombre del Servicio]"
- Lista de los 3 documentos adjuntos
- Información de la sede
- Fecha de firma

**Archivos adjuntos:**
1. `consentimiento-procedimiento-[cedula].pdf`
2. `consentimiento-datos-personales-[cedula].pdf`
3. `consentimiento-imagenes-[cedula].pdf`

---

## 🔧 Migración de Base de Datos

Para aplicar los cambios en la base de datos:

```bash
cd backend
npm run migration:run
```

O si usas Docker:
```bash
docker-compose restart backend
```

La migración se ejecutará automáticamente al iniciar el backend.

---

## 🧪 Cómo Probar

### 1. Crear un Nuevo Consentimiento
1. Ir a `/consents/new`
2. Llenar datos del cliente
3. Responder preguntas
4. Firmar
5. Verificar que se generan los 3 PDFs

### 2. Verificar PDFs
1. Ir a `/consents`
2. Click en cada uno de los 3 botones de PDF
3. Verificar que cada PDF tiene:
   - Contenido correcto
   - Firma digital
   - Información de la sede

### 3. Verificar Email
1. Abrir MailHog: http://localhost:8025
2. Verificar que el email tiene 3 archivos adjuntos
3. Descargar y verificar cada PDF

### 4. Probar Búsqueda
1. En `/consents`, usar la barra de búsqueda
2. Buscar por nombre: "Juan"
3. Buscar por cédula: "123456"
4. Buscar por teléfono: "300"

### 5. Probar Reenvío
1. Click en el botón de email (📧)
2. Confirmar
3. Verificar en MailHog que llegan los 3 PDFs

### 6. Probar Eliminación
1. Click en el botón de eliminar (🗑️)
2. Confirmar
3. Verificar que el consentimiento desaparece de la lista

---

## 📋 Archivos Modificados

### Backend
1. ✅ `backend/src/consents/entities/consent.entity.ts`
2. ✅ `backend/src/consents/pdf.service.ts`
3. ✅ `backend/src/consents/consents.service.ts`
4. ✅ `backend/src/consents/consents.controller.ts`
5. ✅ `backend/src/consents/email.service.ts`
6. ✅ `backend/src/database/migrations/1704297600000-AddMultiplePdfUrls.ts`

### Frontend
1. ✅ `frontend/src/types/index.ts`
2. ✅ `frontend/src/pages/ConsentsPage.tsx`
3. ✅ `frontend/src/components/PdfViewer.tsx`
4. ✅ `frontend/src/services/consent.service.ts`

---

## 🎨 Interfaz de Usuario

### Página de Consentimientos

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Buscar por nombre, cédula o teléfono...              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Cliente    │ Servicio │ Estado │ Acciones               │
├────────────┼──────────┼────────┼────────────────────────┤
│ Juan Pérez │ Láser    │ SENT   │ 📄 📄 📄 📧 🗑️        │
│ 123456789  │          │        │ ↑  ↑  ↑  ↑  ↑         │
│            │          │        │ 1  2  3  4  5         │
└────────────┴──────────┴────────┴────────────────────────┘

Leyenda:
1. PDF Procedimiento (verde)
2. PDF Datos Personales (azul)
3. PDF Imágenes (morado)
4. Reenviar Email (verde)
5. Eliminar (rojo)
```

---

## ⚠️ Notas Importantes

1. **Los 3 PDFs se generan simultáneamente** al firmar el consentimiento
2. **Cada PDF incluye la misma firma digital** del cliente
3. **El email incluye los 3 PDFs** como archivos adjuntos
4. **La búsqueda es case-insensitive** y busca en nombre, cédula y teléfono
5. **La eliminación es soft delete** - Los registros no se borran físicamente

---

## 🚀 Próximos Pasos Sugeridos

1. Agregar preview de los PDFs antes de firmar
2. Permitir personalizar el contenido de los PDFs por sede
3. Agregar firma del profesional además de la del cliente
4. Implementar versionado de consentimientos
5. Agregar auditoría de cambios
