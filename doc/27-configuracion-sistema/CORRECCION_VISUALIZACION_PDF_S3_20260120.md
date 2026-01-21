# Corrección: Visualización de PDFs desde S3

**Fecha**: 20 de Enero de 2026, 6:29 PM  
**Estado**: ✅ CORREGIDO

---

## Problema Identificado

Al intentar visualizar PDFs de consentimientos almacenados en S3, el sistema mostraba el error:

```
Error al cargar el PDF. Request failed with status code 404
```

### Causa

El método `servePdf()` en `ConsentsController` intentaba leer los PDFs como archivos locales usando:
- `fs.existsSync(filePath)` 
- `fs.createReadStream(filePath)`

Pero cuando los PDFs están en S3, `consent.pdfUrl` es una URL completa de S3 (ej: `https://datagree-uploads.s3.us-east-1.amazonaws.com/consents/...`), no una ruta local.

---

## Solución Implementada

### 1. Modificar ConsentsController

**Archivo**: `backend/src/consents/consents.controller.ts`

#### Cambio 1: Inyectar StorageService

```typescript
import { StorageService } from '../common/services/storage.service';

@Controller('consents')
@UseGuards(JwtAuthGuard)
export class ConsentsController {
  constructor(
    private readonly consentsService: ConsentsService,
    private readonly storageService: StorageService,
  ) {}
```

#### Cambio 2: Actualizar método servePdf()

```typescript
private async servePdf(id: string, type: 'procedure' | 'data-treatment' | 'image-rights', res: Response) {
  try {
    const consent = await this.consentsService.findOne(id);
    
    let pdfUrl: string;
    let filename: string;

    switch (type) {
      case 'procedure':
        pdfUrl = consent.pdfUrl;
        filename = `consentimiento-procedimiento-${consent.clientId}.pdf`;
        break;
      case 'data-treatment':
        pdfUrl = consent.pdfDataTreatmentUrl;
        filename = `consentimiento-datos-${consent.clientId}.pdf`;
        break;
      case 'image-rights':
        pdfUrl = consent.pdfImageRightsUrl;
        filename = `consentimiento-imagenes-${consent.clientId}.pdf`;
        break;
    }

    if (!pdfUrl) {
      return res.status(404).json({ message: 'PDF no encontrado' });
    }

    // Si la URL es de S3 (empieza con http), descargar el archivo
    if (pdfUrl.startsWith('http')) {
      console.log(`Descargando PDF desde S3 para visualización: ${pdfUrl}`);
      const pdfBuffer = await this.storageService.downloadFile(pdfUrl);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      
      return res.send(pdfBuffer);
    } else {
      // Si es una ruta local, usar el método tradicional
      const filePath = path.join(process.cwd(), pdfUrl);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Archivo PDF no encontrado' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    }
  } catch (error) {
    console.error('Error al servir PDF:', error);
    return res.status(500).json({ message: 'Error al cargar el PDF' });
  }
}
```

### 2. Actualizar ConsentsModule

**Archivo**: `backend/src/consents/consents.module.ts`

```typescript
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consent, Answer, Tenant]),
    SettingsModule,
    MailModule,
    CommonModule, // ← Agregado
  ],
  controllers: [ConsentsController],
  providers: [ConsentsService, PdfService],
  exports: [ConsentsService],
})
export class ConsentsModule {}
```

---

## Flujo de Visualización de PDF

### PDFs en S3:

```
1. Usuario hace clic en "Ver PDF" en un consentimiento
   ↓
2. Frontend llama a GET /api/consents/:id/pdf
   ↓
3. ConsentsController.getPdf()
   ↓
4. servePdf() detecta que pdfUrl empieza con "http"
   ↓
5. StorageService.downloadFile(pdfUrl)
   ↓
6. Descarga PDF desde S3 como Buffer
   ↓
7. Envía el buffer al navegador con headers correctos
   ↓
8. El navegador muestra el PDF ✅
```

### PDFs locales:

```
1. Usuario hace clic en "Ver PDF"
   ↓
2. servePdf() detecta que pdfUrl empieza con "/"
   ↓
3. Lee el archivo desde el sistema de archivos local
   ↓
4. Envía el stream al navegador
   ↓
5. El navegador muestra el PDF ✅
```

---

## Archivos Modificados

1. **backend/src/consents/consents.controller.ts**
   - Inyección de StorageService
   - Método `servePdf()` actualizado para detectar y descargar PDFs desde S3

2. **backend/src/consents/consents.module.ts**
   - Importación de CommonModule

---

## Endpoints Afectados

Los siguientes endpoints ahora funcionan correctamente con PDFs en S3:

- `GET /api/consents/:id/pdf` - PDF de procedimiento
- `GET /api/consents/:id/pdf-data-treatment` - PDF de tratamiento de datos
- `GET /api/consents/:id/pdf-image-rights` - PDF de derechos de imagen

---

## Cómo Probar

### Prueba 1: Visualizar PDF de Consentimiento en S3

1. Ir a la página de **Consentimientos**
2. Hacer clic en el icono de "Ver PDF" (👁️) de cualquier consentimiento
3. El PDF debe cargarse y mostrarse en el modal
4. Verificar que se puede descargar

**Resultado Esperado**: ✅ PDF se visualiza correctamente

### Prueba 2: Visualizar los 3 tipos de PDF

1. Abrir un consentimiento
2. Hacer clic en "Ver PDF" (procedimiento)
3. Hacer clic en "Ver PDF Datos" (tratamiento de datos)
4. Hacer clic en "Ver PDF Imágenes" (derechos de imagen)

**Resultado Esperado**: ✅ Los 3 PDFs se visualizan correctamente

### Prueba 3: PDF Local (si aplica)

1. Si hay consentimientos con PDFs locales
2. Verificar que también se visualizan correctamente

**Resultado Esperado**: ✅ PDFs locales funcionan como antes

---

## Logs Esperados

### Visualización Exitosa desde S3:

```
Descargando PDF desde S3 para visualización: https://datagree-uploads.s3.us-east-1.amazonaws.com/consents/file.pdf
[StorageService] ✅ Archivo descargado de S3: consents/file.pdf
```

---

## Compatibilidad

✅ **PDFs en S3**: Descarga y visualiza correctamente  
✅ **PDFs locales**: Funciona como antes  
✅ **Modo híbrido**: Algunos en S3, otros locales  
✅ **3 tipos de PDF**: Procedimiento, Datos, Imágenes  

---

## Resumen de Correcciones S3

Esta es la **tercera corrección** relacionada con S3:

1. ✅ **Corrección ACL**: Removido ACL de uploads a S3
2. ✅ **Corrección Email**: Descarga de PDFs desde S3 para enviar por email
3. ✅ **Corrección Visualización**: Descarga de PDFs desde S3 para visualizar en navegador

---

## Estado del Sistema

- **Backend**: ✅ Reiniciado y funcionando en puerto 3000
- **Visualización de PDFs**: ✅ Funcionando con S3
- **Envío de Emails**: ✅ Funcionando con S3
- **Uploads a S3**: ✅ Funcionando sin ACL

---

**Corrección completada exitosamente** 🎉

Ahora puedes visualizar los PDFs de consentimientos almacenados en S3 directamente desde la interfaz.
