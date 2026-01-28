# 🎯 Recomendaciones de Implementación

## 📋 Mejores Prácticas Recomendadas

### 1. Arquitectura en Capas (Recomendado ✅)

```
PLANTILLAS → CONFIGURACIONES → INSTANCIAS
```

**Por qué:**
- Reutilización máxima
- Fácil mantenimiento
- Personalización por tenant
- Escalable

### 2. Sistema de Plantillas con Variables

**Usar:**
- Variables dinámicas: `{{clientName}}`, `{{serviceName}}`
- Condicionales: `{{#if condition}}...{{/if}}`
- Loops: `{{#each items}}...{{/each}}`

**Librería recomendada:** Handlebars.js

### 3. PDF Compuesto con PDFKit o Puppeteer

**Opción A: PDFKit (Recomendado para backend)**
```typescript
import PDFDocument from 'pdfkit';

// Ventajas:
// - Control total del layout
// - Ligero y rápido
// - No requiere navegador
```

**Opción B: Puppeteer (Recomendado para diseños complejos)**
```typescript
import puppeteer from 'puppeteer';

// Ventajas:
// - Renderiza HTML/CSS
// - Diseños complejos fáciles
// - Preview exacto
```

### 4. Firmas Digitales

**Recomendación:**
- Canvas HTML5 para captura
- Guardar como PNG en S3
- Metadata completa (IP, timestamp, geolocalización)
- Opcional: Integrar con firma electrónica certificada

### 5. Captura de Fotos

**Recomendación:**
- WebRTC para captura desde navegador
- Compresión antes de subir
- Detección facial opcional (AWS Rekognition)
- Almacenar en S3 con lifecycle policy

### 6. Preguntas Dinámicas

**Estructura JSON:**
```json
{
  "questions": [
    {
      "id": "q1",
      "type": "yes_no",
      "text": "¿Tiene alergias?",
      "required": true
    },
    {
      "id": "q2",
      "type": "text",
      "text": "Especifique cuáles:",
      "required": false,
      "showIf": {"q1": true}
    }
  ]
}
```

## 🏗️ Arquitectura Backend Recomendada

### Estructura de Módulos

```
backend/src/
├── consent-templates/          (Ya existe)
├── consent-configs/            (Nuevo)
│   ├── entities/
│   │   ├── consent-config.entity.ts
│   │   ├── consent-config-template.entity.ts
│   │   └── consent-question.entity.ts
│   ├── dto/
│   ├── consent-configs.service.ts
│   └── consent-configs.controller.ts
├── consents/                   (Mejorar existente)
│   ├── entities/
│   │   ├── consent.entity.ts
│   │   ├── consent-response.entity.ts
│   │   ├── consent-signature.entity.ts
│   │   └── consent-photo.entity.ts
│   ├── services/
│   │   ├── consents.service.ts
│   │   ├── pdf-generator.service.ts
│   │   ├── signature.service.ts
│   │   └── photo.service.ts
│   └── consents.controller.ts
└── common/
    └── services/
        └── template-renderer.service.ts
```

### Servicios Clave

#### 1. ConsentConfigsService
```typescript
class ConsentConfigsService {
  // CRUD de configuraciones
  create(dto, tenantId)
  findAll(tenantId, filters)
  findOne(id, tenantId)
  update(id, dto, tenantId)
  delete(id, tenantId)
  
  // Gestión de plantillas
  addTemplate(configId, templateId, order)
  removeTemplate(configId, templateId)
  reorderTemplates(configId, newOrder)
  
  // Gestión de preguntas
  addQuestion(configId, questionDto)
  updateQuestion(questionId, dto)
  deleteQuestion(questionId)
  
  // Vinculación
  linkToService(configId, serviceId)
  unlinkFromService(configId, serviceId)
}
```

#### 2. PDFGeneratorService
```typescript
class PDFGeneratorService {
  async generateCompositePDF(
    consentConfig: ConsentConfig,
    data: ConsentData,
    responses: ConsentResponse[],
    signatures: ConsentSignature[],
    photos: ConsentPhoto[]
  ): Promise<Buffer> {
    // 1. Renderizar cada plantilla con variables
    // 2. Agregar preguntas y respuestas
    // 3. Agregar firmas
    // 4. Agregar fotos
    // 5. Generar PDF final
    // 6. Subir a S3
    // 7. Retornar URL
  }
}
```

#### 3. TemplateRendererService
```typescript
class TemplateRendererService {
  render(template: string, variables: Record<string, any>): string {
    // Usar Handlebars para renderizar
    const compiled = Handlebars.compile(template);
    return compiled(variables);
  }
  
  getAvailableVariables(): Record<string, string> {
    // Retornar lista de variables disponibles
  }
}
```

## 🎨 Arquitectura Frontend Recomendada

### Estructura de Componentes

```
frontend/src/
├── pages/
│   ├── ConsentConfigsPage.tsx          (Nuevo)
│   ├── ConsentBuilderPage.tsx          (Nuevo)
│   └── ConsentSigningPage.tsx          (Nuevo)
├── components/
│   ├── consent-configs/                (Nuevo)
│   │   ├── ConfigList.tsx
│   │   ├── ConfigForm.tsx
│   │   ├── TemplateSelector.tsx
│   │   ├── QuestionBuilder.tsx
│   │   └── ConfigPreview.tsx
│   ├── consent-signing/                (Nuevo)
│   │   ├── ConsentViewer.tsx
│   │   ├── QuestionForm.tsx
│   │   ├── SignaturePad.tsx
│   │   ├── PhotoCapture.tsx
│   │   └── ConsentSummary.tsx
│   └── pdf-preview/                    (Nuevo)
│       └── PDFPreview.tsx
└── services/
    ├── consent-configs.service.ts      (Nuevo)
    └── consent-signing.service.ts      (Nuevo)
```

### Componentes Clave

#### 1. ConfigBuilder (Constructor Visual)
```tsx
<ConfigBuilder>
  <TemplateSelector 
    templates={templates}
    onAdd={handleAddTemplate}
    onReorder={handleReorder}
  />
  <QuestionBuilder
    questions={questions}
    onAdd={handleAddQuestion}
    onEdit={handleEditQuestion}
  />
  <ConfigPreview
    config={config}
    onGenerate={handleGeneratePreview}
  />
</ConfigBuilder>
```

#### 2. ConsentSigning (Proceso de Firma)
```tsx
<ConsentSigning consentId={id}>
  <ConsentViewer pdf={pdfUrl} />
  <QuestionForm 
    questions={questions}
    onSubmit={handleSubmitAnswers}
  />
  <PhotoCapture
    onCapture={handlePhotoCapture}
    required={config.requirePhoto}
  />
  <SignaturePad
    onSign={handleSign}
    signerInfo={signerInfo}
  />
</ConsentSigning>
```

## 🔄 Flujo Completo Recomendado

### Fase 1: Configuración (Admin)

```
1. Admin crea ConsentConfig
   ├── Nombre: "Cirugía Estética Completa"
   ├── Selecciona plantillas:
   │   ├── Consentimiento Informado
   │   ├── Tratamiento de Datos
   │   └── Derechos de Imagen
   ├── Agrega preguntas:
   │   ├── ¿Alergias?
   │   ├── ¿Cirugías previas?
   │   └── ¿Medicamentos actuales?
   └── Vincula con servicios:
       └── Servicio: "Rinoplastia"
```

### Fase 2: Generación (Operador)

```
1. Operador selecciona cliente
2. Selecciona servicio "Rinoplastia"
3. Sistema sugiere config vinculada
4. Operador genera consentimiento
5. Sistema crea instancia en estado "draft"
6. Operador envía link/QR al cliente
```

### Fase 3: Firma (Cliente)

```
1. Cliente abre link en móvil/tablet
2. Lee PDF completo (scroll obligatorio)
3. Responde preguntas
4. Captura selfie (si requerido)
5. Firma en canvas
6. Confirma y envía
7. Sistema genera PDF final
8. Cliente recibe copia por email
```

## 📊 Generación de PDF Compuesto

### Estructura Recomendada

```
PDF Final:
├── Portada
│   ├── Logo del tenant
│   ├── Título del consentimiento
│   ├── Datos del cliente
│   └── Fecha y hora
├── Plantilla 1: Consentimiento Informado
│   └── [Contenido renderizado con variables]
├── Plantilla 2: Tratamiento de Datos
│   └── [Contenido renderizado con variables]
├── Plantilla 3: Derechos de Imagen
│   └── [Contenido renderizado con variables]
├── Sección de Preguntas y Respuestas
│   ├── Pregunta 1: ¿Alergias? → Sí
│   ├── Pregunta 2: Especifique → Penicilina
│   └── ...
├── Sección de Firmas
│   ├── Firma del paciente
│   │   ├── [Imagen de firma]
│   │   ├── Nombre: Juan Pérez
│   │   ├── ID: 123456789
│   │   └── Fecha: 2026-01-25 15:30
│   └── Firma del testigo (si aplica)
└── Anexos
    ├── Foto del cliente
    └── Metadata (QR con verificación)
```

## 🔐 Seguridad y Cumplimiento

### Recomendaciones

1. **Trazabilidad Completa**
   - Registrar cada acción
   - IP, timestamp, user agent
   - Geolocalización de firma

2. **Integridad del Documento**
   - Hash SHA-256 del PDF
   - Código de verificación único
   - QR con link de verificación

3. **Almacenamiento Seguro**
   - PDFs en S3 con encriptación
   - Acceso mediante signed URLs
   - Lifecycle policy (retención 10 años)

4. **Cumplimiento Normativo**
   - Ley 1581 de 2012 (Datos personales)
   - Resolución 1995 de 1999 (Historia clínica)
   - Ley 23 de 1981 (Ética médica)

## 🎯 MVP Recomendado (Fase 1)

### Funcionalidades Mínimas

1. ✅ Crear ConsentConfig con múltiples plantillas
2. ✅ Generar PDF compuesto
3. ✅ Agregar 3-5 preguntas básicas
4. ✅ Captura de firma digital
5. ✅ Envío por email
6. ✅ Vinculación con servicios

### Dejar para Fase 2

- ⏳ Captura de foto
- ⏳ Firma de testigo
- ⏳ Preguntas condicionales complejas
- ⏳ Editor visual de plantillas
- ⏳ Firma electrónica certificada

## 📚 Librerías Recomendadas

### Backend
- `pdfkit` - Generación de PDFs
- `handlebars` - Template rendering
- `sharp` - Procesamiento de imágenes
- `qrcode` - Generación de QR

### Frontend
- `react-pdf` - Visualización de PDFs
- `signature_pad` - Captura de firmas
- `react-webcam` - Captura de fotos
- `react-hook-form` - Formularios dinámicos

---

**¿Quieres que implemente alguna parte específica de esta arquitectura?**
