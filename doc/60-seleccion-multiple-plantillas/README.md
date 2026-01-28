# Selección Múltiple de Plantillas en Historias Clínicas

**Fecha:** 25 de enero de 2026  
**Versión:** 15.0.13  
**Estado:** ✅ Completado

## 📋 Funcionalidad Implementada

Se implementó la capacidad de seleccionar **múltiples plantillas** al generar un consentimiento desde una historia clínica, permitiendo crear un PDF compuesto con varios documentos.

## 🎯 Cambios Realizados

### Frontend

#### 1. Cambio de Dropdown a Checkboxes

**Antes:**
```tsx
<select>
  <option>Plantilla 1</option>
  <option>Plantilla 2</option>
</select>
```

**Después:**
```tsx
<div className="checkbox-list">
  ☑ Plantilla 1
  ☑ Plantilla 2
  ☐ Plantilla 3
</div>
```

#### 2. Estado para Plantillas Seleccionadas

```typescript
const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

const handleTemplateToggle = (templateId: string) => {
  setSelectedTemplates(prev => {
    if (prev.includes(templateId)) {
      return prev.filter(id => id !== templateId);
    } else {
      return [...prev, templateId];
    }
  });
};
```

#### 3. Validación

```typescript
if (selectedTemplates.length === 0) {
  toast.error('Selecciona al menos una plantilla');
  return;
}
```

#### 4. Envío al Backend

```typescript
await medicalRecordsService.createConsent(medicalRecordId, {
  ...data,
  templateIds: selectedTemplates, // Array de IDs
});
```

### Backend

#### 1. Recepción de Múltiples Plantillas

```typescript
const templateIds = dto.templateIds || [];
if (templateIds.length === 0) {
  throw new BadRequestException('Debe seleccionar al menos una plantilla');
}
```

#### 2. Almacenamiento en Placeholder

```typescript
const consentPlaceholder = {
  // ...
  templateIds: templateIds,
  templateCount: templateIds.length,
};
```

#### 3. Auditoría

```typescript
await this.logAudit({
  // ...
  newValues: {
    templateIds: templateIds,
    templateCount: templateIds.length,
  },
});
```

## 🎨 Interfaz de Usuario

### Vista del Modal

```
┌─────────────────────────────────────────────────┐
│  Generar Consentimiento                    [X]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ℹ️ Información Automática                      │
│  Los datos del paciente se llenarán            │
│  automáticamente. Puedes seleccionar           │
│  múltiples plantillas para un PDF compuesto.   │
│                                                 │
│  Plantillas de Consentimiento *  [Gestionar]   │
│  ┌───────────────────────────────────────────┐ │
│  │ ☑ Consentimiento Informado General       │ │
│  │   Plantilla predeterminada...            │ │
│  ├───────────────────────────────────────────┤ │
│  │ ☑ Tratamiento de Datos Personales        │ │
│  │   Autorización según Ley 1581...        │ │
│  ├───────────────────────────────────────────┤ │
│  │ ☐ Derechos de Imagen                     │ │
│  │   Autorización de uso de imagen...      │ │
│  └───────────────────────────────────────────┘ │
│  2 plantilla(s) seleccionada(s)                │
│                                                 │
│  Notas Adicionales                             │
│  [                                          ]   │
│                                                 │
│  📋 Próximos pasos:                            │
│  1. Se generará un PDF con todas las           │
│     plantillas seleccionadas                   │
│  2. El paciente deberá firmar                  │
│  3. Se vinculará a esta HC                     │
│                                                 │
│  [Cancelar]              [Generar Consentimiento]│
└─────────────────────────────────────────────────┘
```

## 🔄 Flujo de Usuario

### 1. Abrir Modal

```
Usuario → Historia Clínica → Generar Consentimiento
```

### 2. Seleccionar Plantillas

```
☐ Consentimiento Informado General
☐ Tratamiento de Datos Personales
☐ Derechos de Imagen

Usuario hace clic en checkboxes:
☑ Consentimiento Informado General
☑ Tratamiento de Datos Personales
☐ Derechos de Imagen

Contador: "2 plantilla(s) seleccionada(s)"
```

### 3. Generar

```
Usuario → Clic en "Generar Consentimiento"
    ↓
Validación: ¿Al menos 1 seleccionada? ✅
    ↓
Envío al backend con templateIds: [id1, id2]
    ↓
Backend crea registro con múltiples plantillas
    ↓
Mensaje de éxito
```

## 📊 Estructura de Datos

### Request al Backend

```json
{
  "templateIds": [
    "uuid-plantilla-1",
    "uuid-plantilla-2",
    "uuid-plantilla-3"
  ],
  "procedureName": "Rinoplastia",
  "notes": "Paciente con alergias a penicilina"
}
```

### Response del Backend

```json
{
  "consent": {
    "id": "pending-1737841234567",
    "consentNumber": "TEMP-1737841234567",
    "status": "pending_creation",
    "clientId": "uuid-cliente",
    "clientName": "Juan Pérez",
    "templateIds": [
      "uuid-plantilla-1",
      "uuid-plantilla-2"
    ],
    "templateCount": 2
  },
  "medicalRecordConsent": {
    "id": "uuid-vinculacion",
    "medicalRecordId": "uuid-hc",
    "consentId": "pending-1737841234567",
    "createdAt": "2026-01-25T20:00:00Z"
  }
}
```

## 🎯 Casos de Uso

### Caso 1: Consentimiento Simple

```
Usuario selecciona:
☑ Consentimiento Informado General

Resultado:
- 1 plantilla en el PDF
- Proceso estándar
```

### Caso 2: Consentimiento Completo

```
Usuario selecciona:
☑ Consentimiento Informado General
☑ Tratamiento de Datos Personales
☑ Derechos de Imagen

Resultado:
- 3 plantillas en un solo PDF
- Todas con datos del paciente
- Firma única para todo el documento
```

### Caso 3: Consentimiento Personalizado

```
Usuario selecciona:
☑ Consentimiento Quirúrgico Avanzado
☑ Riesgos Específicos de Rinoplastia
☑ Tratamiento de Datos

Resultado:
- PDF compuesto personalizado
- Específico para el procedimiento
```

## ⚠️ Estado Actual

### ✅ Implementado Completamente

1. ✅ Selección múltiple de plantillas
2. ✅ Validación de al menos 1 plantilla
3. ✅ Envío de array de IDs al backend
4. ✅ Almacenamiento de IDs en registro
5. ✅ Contador de plantillas seleccionadas
6. ✅ Auditoría con información de plantillas
7. ✅ **Generación real del PDF compuesto** (v15.0.10)
8. ✅ **Renderizado de variables con Handlebars** (v15.0.10)
9. ✅ **Almacenamiento en S3 con URL accesible** (v15.0.10)
10. ✅ **Apertura automática del PDF en nueva pestaña** (v15.0.10)

### 📝 Documentación Adicional

Para más información sobre la generación de PDF, consultar:
- `doc/61-generacion-pdf-multiple-plantillas/README.md`
- `doc/61-generacion-pdf-multiple-plantillas/RESUMEN_EJECUTIVO.md`
- `doc/61-generacion-pdf-multiple-plantillas/INSTRUCCIONES_PRUEBA.md`

## 🚀 Próximos Pasos Recomendados

### Fase 1: Generación de PDF (Prioritario)

1. Instalar librería de PDF
   ```bash
   npm install pdfkit
   # o
   npm install puppeteer
   ```

2. Crear servicio de generación
   ```typescript
   class PDFGeneratorService {
     async generateCompositePDF(
       templates: Template[],
       data: ConsentData
     ): Promise<Buffer>
   }
   ```

3. Implementar renderizado de variables
   ```typescript
   class TemplateRendererService {
     render(template: string, variables: object): string
   }
   ```

### Fase 2: Mejoras de UX

1. Drag & drop para reordenar
2. Preview del PDF
3. Configuración de saltos de página
4. Plantillas favoritas

### Fase 3: Funcionalidades Avanzadas

1. Preguntas personalizadas por plantilla
2. Firmas múltiples
3. Captura de fotos
4. Envío por email automático

## 📁 Archivos Modificados

### Frontend
- `frontend/src/components/medical-records/GenerateConsentModal.tsx`
  - Cambio de dropdown a checkboxes
  - Estado para plantillas seleccionadas
  - Validación de selección
  - Contador de plantillas

### Backend
- `backend/src/medical-records/medical-records.service.ts`
  - Recepción de array de templateIds
  - Validación de al menos 1 plantilla
  - Almacenamiento en placeholder
  - Auditoría mejorada

## 🧪 Pruebas Sugeridas

### Prueba 1: Selección Única
- [ ] Seleccionar 1 plantilla
- [ ] Generar consentimiento
- [ ] Verificar que se crea correctamente

### Prueba 2: Selección Múltiple
- [ ] Seleccionar 3 plantillas
- [ ] Verificar contador "3 plantilla(s) seleccionada(s)"
- [ ] Generar consentimiento
- [ ] Verificar que se almacenan los 3 IDs

### Prueba 3: Sin Selección
- [ ] No seleccionar ninguna plantilla
- [ ] Intentar generar
- [ ] Verificar mensaje de error

### Prueba 4: Seleccionar/Deseleccionar
- [ ] Seleccionar plantilla
- [ ] Deseleccionar plantilla
- [ ] Verificar que el contador se actualiza

### Prueba 5: Link a Gestión
- [ ] Hacer clic en "Gestionar plantillas"
- [ ] Verificar que abre módulo de plantillas
- [ ] Crear nueva plantilla
- [ ] Volver y verificar que aparece

## 💡 Recomendaciones

### Para el Usuario

1. **Selecciona solo las plantillas necesarias**
   - Más plantillas = PDF más largo
   - Considera la experiencia del paciente

2. **Usa plantillas complementarias**
   - Consentimiento + Datos + Imagen
   - Crea un paquete completo

3. **Crea plantillas específicas**
   - Por tipo de procedimiento
   - Por especialidad médica

### Para el Desarrollo

1. **Implementar generación de PDF pronto**
   - Es la funcionalidad más esperada
   - Actualmente solo es placeholder

2. **Considerar performance**
   - Muchas plantillas = PDF pesado
   - Implementar límite razonable (ej: máximo 5)

3. **Agregar preview**
   - Fundamental para UX
   - Evita errores y retrabajos

## ✅ Beneficios

### Para el Tenant
- ✅ Flexibilidad total
- ✅ Consentimientos personalizados
- ✅ Ahorro de tiempo

### Para el Operador
- ✅ Proceso más rápido
- ✅ Menos errores
- ✅ Mejor organización

### Para el Paciente
- ✅ Documento completo
- ✅ Toda la información en un PDF
- ✅ Proceso más profesional

---

**Preparado por:** Kiro AI  
**Fecha:** 25 de enero de 2026  
**Estado:** ✅ Selección múltiple implementada, generación de PDF pendiente
