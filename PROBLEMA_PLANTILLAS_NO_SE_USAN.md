# Problema: Plantillas de Consentimientos NO se Están Usando

## Fecha: 17 de marzo de 2026, 04:45 AM

## Problema Identificado

El tenant `hotelglampinglapolka` tiene sus propias plantillas configuradas, pero cuando se envía un consentimiento, el sistema NO está usando esas plantillas. En su lugar, está generando el PDF con contenido hardcodeado.

### Diagnóstico Realizado

#### 1. Plantillas del Tenant hotelglampinglapolka

**Plantillas CN (Consentimientos Convencionales):**
- ✅ Consentimiento Informado para Cabalgatas y/o Buggys (procedure) - DEFAULT
- ✅ Tratamiento de Datos Personales (data_treatment) - DEFAULT
- ✅ Autorización de Derechos de Imagen (image_rights) - DEFAULT

**Plantillas HC (Historias Clínicas):**
- ✅ 12 plantillas configuradas
- ✅ 2 plantillas activas (general y procedure)

#### 2. Código Actual

**Flujo de Creación de Consentimiento:**
```
1. Usuario crea consentimiento → consents.service.ts::create()
2. Usuario firma consentimiento → consents.service.ts::sign()
3. Se genera PDF → pdf.service.ts::generateAllConsentPdfs()
4. Se genera PDF unificado → pdf.service.ts::generateUnifiedConsentPdf()
5. Se agregan secciones → pdf.service.ts::addProcedureSection()
```

**Problema en pdf.service.ts::addProcedureSection():**
```typescript
// ❌ CONTENIDO HARDCODEADO - NO USA PLANTILLAS
const declaration = [
  'Declaro que he sido informado(a) sobre el procedimiento/servicio mencionado,',
  'sus beneficios, riesgos y alternativas. Autorizo voluntariamente la realización',
  'del procedimiento/servicio descrito en este documento.',
];
```

#### 3. Método Disponible pero NO Usado

Existe el método `ConsentTemplatesService::findDefaultByType()` que:
- ✅ Busca la plantilla default del tenant por tipo
- ✅ Si no hay default, busca la primera activa
- ✅ Filtra por tenantId correctamente
- ❌ PERO NO SE ESTÁ USANDO en el servicio PDF

## Impacto

### Problema de Aislamiento de Datos

1. **Todos los tenants reciben el mismo contenido**
   - No importa qué plantillas configuren
   - El contenido es siempre el mismo hardcodeado
   - NO hay personalización por tenant

2. **Violación de Multi-Tenancy**
   - Las plantillas configuradas por cada tenant NO se usan
   - No hay aislamiento de contenido entre tenants
   - Todos los PDFs son idénticos

3. **Funcionalidad Inútil**
   - Los tenants pueden crear plantillas personalizadas
   - Pueden marcar plantillas como default
   - PERO nada de eso se usa al generar PDFs

## Solución Requerida

### 1. Modificar pdf.service.ts

**Cambios necesarios en `generateUnifiedConsentPdf()`:**

```typescript
async generateUnifiedConsentPdf(consent: Consent): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Cargar tema personalizado con el tenantId del consentimiento
  const tenantId = consent.tenant?.id;
  const theme = await this.loadPdfTheme(pdfDoc, tenantId);

  // ✅ OBTENER PLANTILLAS DEL TENANT
  const tenantSlug = consent.tenant?.slug;
  
  // Obtener plantilla de procedimiento
  const procedureTemplate = await this.consentTemplatesService.findDefaultByType(
    'procedure',
    tenantSlug
  );
  
  // Obtener plantilla de tratamiento de datos
  const dataTreatmentTemplate = await this.consentTemplatesService.findDefaultByType(
    'data_treatment',
    tenantSlug
  );
  
  // Obtener plantilla de derechos de imagen
  const imageRightsTemplate = await this.consentTemplatesService.findDefaultByType(
    'image_rights',
    tenantSlug
  );

  // ✅ PASAR PLANTILLAS A LOS MÉTODOS
  await this.addProcedureSection(pdfDoc, consent, font, fontBold, theme, procedureTemplate);
  await this.addDataTreatmentSection(pdfDoc, consent, font, fontBold, theme, dataTreatmentTemplate);
  await this.addImageRightsSection(pdfDoc, consent, font, fontBold, theme, imageRightsTemplate);

  // Save unified PDF
  const pdfBytes = await pdfDoc.save();
  const fileName = `consent-unified-${consent.id}.pdf`;

  const pdfUrl = await this.storageService.uploadBuffer(
    Buffer.from(pdfBytes),
    'consents',
    fileName,
    'application/pdf'
  );

  return pdfUrl;
}
```

**Cambios necesarios en `addProcedureSection()`:**

```typescript
private async addProcedureSection(
  pdfDoc: PDFDocument,
  consent: Consent,
  font: any,
  fontBold: any,
  theme: PdfTheme,
  template: ConsentTemplate, // ✅ NUEVO PARÁMETRO
): Promise<void> {
  // ... código existente ...

  // ✅ USAR CONTENIDO DE LA PLANTILLA EN LUGAR DE HARDCODED
  const templateContent = this.replaceTemplateVariables(template.content, {
    clientName: consent.clientName,
    clientId: consent.clientId,
    clientEmail: consent.clientEmail,
    clientPhone: consent.clientPhone || 'N/A',
    serviceName: consent.service.name,
    branchName: consent.branch.name,
    branchAddress: consent.branch.address || 'N/A',
    branchPhone: consent.branch.phone || 'N/A',
    branchEmail: consent.branch.email || 'N/A',
    companyName: theme.companyName,
    signDate: consent.signedAt ? consent.signedAt.toLocaleDateString() : 'N/A',
    signTime: consent.signedAt ? consent.signedAt.toLocaleTimeString() : 'N/A',
    currentDate: new Date().toLocaleDateString(),
    currentYear: new Date().getFullYear().toString(),
  });

  // ✅ RENDERIZAR CONTENIDO DE LA PLANTILLA
  const contentLines = templateContent.split('\n');
  for (const line of contentLines) {
    if (yPosition < 150) {
      this.addFooter(page, font, theme);
      page = pdfDoc.addPage([595, 842]);
      this.addWatermark(page, theme);
      yPosition = height - 50;
    }

    const wrappedLines = this.wrapText(line, font, 10, contentWidth);
    for (const wrappedLine of wrappedLines) {
      page.drawText(wrappedLine, {
        x: margin,
        y: yPosition,
        size: 10,
        font,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
      yPosition -= 15;
    }
  }

  // ... resto del código ...
}
```

**Nuevo método para reemplazar variables:**

```typescript
private replaceTemplateVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }

  return result;
}
```

### 2. Inyectar ConsentTemplatesService en PdfService

**Modificar constructor de PdfService:**

```typescript
constructor(
  @InjectRepository(Consent)
  private consentsRepository: Repository<Consent>,
  private storageService: StorageService,
  private consentTemplatesService: ConsentTemplatesService, // ✅ NUEVO
) {}
```

**Modificar módulo:**

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Consent, Answer]),
    forwardRef(() => ConsentTemplatesModule), // ✅ NUEVO
  ],
  providers: [ConsentsService, PdfService],
  exports: [ConsentsService, PdfService],
})
export class ConsentsModule {}
```

### 3. Aplicar Misma Solución para Historias Clínicas

El mismo problema existe en `medical-records-pdf.service.ts`. Debe:
- Inyectar `MRConsentTemplatesService`
- Obtener plantillas del tenant usando `findActive()` o similar
- Usar el contenido de las plantillas en lugar de hardcoded

## Verificación Necesaria

Después de implementar los cambios:

1. **Verificar que cada tenant usa sus plantillas:**
   ```sql
   -- Verificar consentimientos y sus plantillas
   SELECT 
     c.id,
     c.created_at,
     t.name as tenant_name,
     ct.name as template_name,
     ct.type as template_type
   FROM consents c
   LEFT JOIN tenants t ON c.tenant_id = t.id
   LEFT JOIN consent_templates ct ON c.template_id = ct.id
   ORDER BY c.created_at DESC
   LIMIT 10;
   ```

2. **Probar con hotelglampinglapolka:**
   - Crear un nuevo consentimiento
   - Firmarlo
   - Verificar que el PDF contiene el texto de la plantilla personalizada
   - Verificar que dice "Consentimiento Informado para Cabalgatas y/o Buggys"

3. **Probar con otro tenant:**
   - Crear consentimiento en otro tenant
   - Verificar que usa SUS plantillas, no las de hotelglampinglapolka

## Prioridad

🔴 **CRÍTICO** - Este es un problema de aislamiento de datos entre tenants que viola el principio fundamental de multi-tenancy.

## Archivos a Modificar

1. `backend/src/consents/pdf.service.ts`
   - Inyectar ConsentTemplatesService
   - Modificar generateUnifiedConsentPdf()
   - Modificar addProcedureSection()
   - Modificar addDataTreatmentSection()
   - Modificar addImageRightsSection()
   - Agregar método replaceTemplateVariables()

2. `backend/src/consents/consents.module.ts`
   - Importar ConsentTemplatesModule

3. `backend/src/medical-records/medical-records-pdf.service.ts`
   - Aplicar misma solución para HC

4. `backend/src/medical-records/medical-records.module.ts`
   - Importar MRConsentTemplatesModule

## Impacto de NO Corregir

- ❌ Todos los tenants reciben el mismo contenido genérico
- ❌ Las plantillas personalizadas no sirven para nada
- ❌ No hay diferenciación entre tenants
- ❌ Violación de multi-tenancy
- ❌ Clientes insatisfechos porque no pueden personalizar
- ❌ Posible pérdida de clientes

---

**Estado**: ⚠️ PROBLEMA IDENTIFICADO - REQUIERE CORRECCIÓN URGENTE
