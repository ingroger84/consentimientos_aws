# 📄 Sistema de Plantillas PDF Personalizadas

## ✅ Implementación Actual

El sistema ahora genera PDFs profesionales con:

### Características del PDF Generado:

1. **Header con Color Corporativo**
   - Fondo verde oscuro
   - Título "CONSENTIMIENTO INFORMADO"
   - Espacio para logo (próxima versión)

2. **Sección de Servicio**
   - Caja destacada con el nombre del servicio
   - Fondo gris claro

3. **Información del Cliente**
   - Nombre completo
   - Identificación
   - Email
   - Teléfono
   - Sede y dirección

4. **Preguntas y Respuestas**
   - Cada pregunta en caja gris
   - Respuestas claramente identificadas
   - Soporte para múltiples páginas

5. **Declaración de Consentimiento**
   - Texto legal estándar
   - Declaración de voluntariedad

6. **Firma Digital**
   - Caja para la firma
   - Firma embebida del cliente
   - Fecha y hora de firma

7. **Footer**
   - Línea separadora
   - Texto legal
   - Fecha de generación

---

## 🎨 Personalización Disponible

### Colores Actuales:
- **Verde Corporativo**: RGB(0.15, 0.45, 0.15) - #264726
- **Gris Claro**: RGB(0.95, 0.95, 0.95) - #F2F2F2
- **Gris Medio**: RGB(0.8, 0.8, 0.8) - #CCCCCC

### Para Cambiar Colores:
Edita el archivo `backend/src/consents/pdf.service.ts`:

```typescript
// Header color
color: rgb(0.15, 0.45, 0.15), // Cambia estos valores

// Service box
color: rgb(0.95, 0.95, 0.95), // Fondo gris claro
```

---

## 📊 Visualización de PDFs

### Opciones Implementadas:

1. **Ver en Navegador**
   - Clic en icono de documento
   - Abre en nueva pestaña
   - URL: `http://localhost:3000/api/consents/{id}/pdf`

2. **Descargar**
   - Clic en icono de descarga
   - Guarda con nombre: `consentimiento-{clientId}.pdf`

### Endpoint:
```
GET /api/consents/:id/pdf
```

**Respuesta:**
- Content-Type: application/pdf
- Content-Disposition: inline (para visualizar)

---

## 🔧 Próximas Mejoras (Opcional)

### 1. Logo Personalizado

Para agregar un logo, modifica `pdf.service.ts`:

```typescript
// Cargar logo
const logoPath = path.join(process.cwd(), 'assets', 'logo.png');
const logoBytes = await fs.readFile(logoPath);
const logoImage = await pdfDoc.embedPng(logoBytes);

// Dibujar logo
page.drawImage(logoImage, {
  x: margin,
  y: height - 70,
  width: 60,
  height: 60,
});
```

### 2. Plantillas por Servicio

Cada servicio puede tener su propia plantilla:

```typescript
// En Service entity
@Column({ nullable: true })
templateConfig: string; // JSON con configuración

// Ejemplo de configuración:
{
  "headerColor": "#264726",
  "logoUrl": "/assets/logos/servicio1.png",
  "footerText": "Texto personalizado",
  "sections": ["client", "questions", "declaration"]
}
```

### 3. Campos Personalizados

Agregar campos adicionales al PDF:

```typescript
// En el servicio
@Column({ type: 'json', nullable: true })
customFields: {
  field1: string;
  field2: string;
};

// En el PDF
page.drawText(`Campo Personalizado: ${consent.customFields.field1}`, {
  x: margin,
  y: yPosition,
  size: 10,
  font,
});
```

### 4. Watermark

Agregar marca de agua:

```typescript
// Texto diagonal
page.drawText('CONFIDENCIAL', {
  x: width / 2,
  y: height / 2,
  size: 60,
  font: fontBold,
  color: rgb(0.9, 0.9, 0.9),
  rotate: degrees(45),
  opacity: 0.3,
});
```

### 5. Códigos QR

Para verificación:

```typescript
import * as QRCode from 'qrcode';

// Generar QR
const qrDataUrl = await QRCode.toDataURL(`https://verify.com/${consent.id}`);
const qrImage = await pdfDoc.embedPng(qrDataUrl);

// Agregar al PDF
page.drawImage(qrImage, {
  x: width - margin - 80,
  y: 50,
  width: 80,
  height: 80,
});
```

---

## 📝 Etiquetas Disponibles

El sistema actualmente reemplaza automáticamente:

| Etiqueta | Valor |
|----------|-------|
| `{{clientName}}` | Nombre del cliente |
| `{{clientId}}` | Identificación |
| `{{clientEmail}}` | Email |
| `{{clientPhone}}` | Teléfono |
| `{{serviceName}}` | Nombre del servicio |
| `{{branchName}}` | Nombre de la sede |
| `{{branchAddress}}` | Dirección de la sede |
| `{{signDate}}` | Fecha de firma |
| `{{signTime}}` | Hora de firma |

---

## 🎯 Cómo Usar

### 1. Crear Consentimiento
```
POST /api/consents
```

### 2. Firmar Consentimiento
```
PATCH /api/consents/:id/sign
Body: { signatureData: "data:image/png;base64,..." }
```

### 3. Ver PDF
```
GET /api/consents/:id/pdf
```

### 4. Descargar PDF
```
GET /api/consents/:id/pdf
(con atributo download en el link)
```

---

## 📂 Estructura de Archivos

```
backend/
├── uploads/
│   └── consents/
│       ├── consent-{uuid}.pdf
│       ├── consent-{uuid}.pdf
│       └── ...
└── src/
    └── consents/
        └── pdf.service.ts  # Generación de PDFs
```

---

## 🔒 Seguridad

- ✅ PDFs solo accesibles con autenticación JWT
- ✅ Validación de permisos por usuario
- ✅ Archivos almacenados fuera del directorio público
- ✅ Nombres de archivo con UUID (no predecibles)

---

## 🐛 Solución de Problemas

### PDF no se visualiza
1. Verificar que el consentimiento esté firmado
2. Verificar que existe el archivo en `uploads/consents/`
3. Revisar permisos de la carpeta uploads

### PDF en blanco
1. Verificar que el backend esté corriendo
2. Verificar la URL: `http://localhost:3000/api/consents/{id}/pdf`
3. Revisar logs del backend para errores

### Firma no aparece
1. Verificar que signatureData sea base64 válido
2. Verificar que comience con `data:image/png;base64,`
3. Revisar logs de generación de PDF

---

## 📊 Ejemplo de PDF Generado

El PDF incluye:

```
┌─────────────────────────────────────────┐
│  [HEADER VERDE]                         │
│  CONSENTIMIENTO INFORMADO               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  SERVICIO: PROCEDIMIENTO ESTÉTICO       │
└─────────────────────────────────────────┘

INFORMACIÓN DEL CLIENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nombre Completo:    Juan Pérez
Identificación:     123456789
Email:              juan@email.com
Teléfono:           +57 300 123 4567
Sede:               Sede Principal
Dirección Sede:     Calle 123 #45-67

PREGUNTAS Y RESPUESTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────┐
│ ¿Tiene alergias a medicamentos?        │
└─────────────────────────────────────────┘
  Respuesta: No

DECLARACIÓN DE CONSENTIMIENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Declaro que he sido informado(a)...

FIRMA DEL CLIENTE:
┌─────────────────────┐
│                     │
│   [FIRMA DIGITAL]   │
│                     │
└─────────────────────┘

Fecha: 3 de enero de 2026
Hora: 01:30:00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Este documento es un consentimiento...
Documento generado el 03/01/2026
```

---

## ✨ Resumen

**Estado**: ✅ Sistema de PDFs Completamente Funcional

- PDFs profesionales con diseño mejorado
- Visualización en navegador
- Descarga directa
- Firma digital embebida
- Información completa del cliente
- Preguntas y respuestas
- Declaración legal
- Footer informativo

**Última actualización**: 3 de enero de 2026
