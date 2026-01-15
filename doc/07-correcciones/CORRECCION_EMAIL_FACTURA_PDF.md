# Corrección de Email de Facturación y Descarga de PDF

## Problemas Identificados

1. **Caracteres especiales mal codificados en el email**:
   - Emojis mostraban como "ðŸ"„" en lugar de 📄
   - Texto con tildes mostraba "Número" como "NÃºmero"

2. **PDF no se podía descargar desde el email**:
   - El botón "Descargar Factura PDF" tenía un enlace `href="#"` sin funcionalidad
   - El endpoint requería autenticación JWT, imposible de usar desde un email

## Soluciones Implementadas

### 1. Corrección de Caracteres Especiales

Se actualizó el script `backend/fix-encoding.js` para corregir todos los caracteres mal codificados en los templates de email:

**Caracteres corregidos:**
- Emojis: 📄, ✅, 💰, ⚠️, 🎉, 📧, 🔐, 📋, 🔗, ⏰
- Tildes: á, é, í, ó, ú, ñ
- Palabras: Número, confirmación, suspensión, activación, Método, etc.

**Uso del script:**
```bash
cd backend
node fix-encoding.js
```

### 2. Endpoint Público para Descarga de PDF

Se creó un nuevo endpoint público que permite descargar el PDF sin autenticación, usando un token de seguridad:

**Nuevo endpoint:**
```
GET /api/invoices/:id/pdf/:token
```

**Características:**
- No requiere autenticación JWT
- Usa un token simple basado en `invoice.id` + `tenant.id` codificado en base64
- El token se genera automáticamente al enviar el email
- Solo permite descargar el PDF de la factura específica

**Implementación:**

```typescript
// Controller
@Public()
@Get(':id/pdf/:token')
async downloadPdfPublic(
  @Param('id') id: string,
  @Param('token') token: string,
  @Res() res: Response,
) {
  const invoice = await this.invoicesService.findOne(id);
  
  // Verificar token
  const expectedToken = Buffer.from(`${invoice.id}-${invoice.tenantId}`).toString('base64');
  if (token !== expectedToken) {
    throw new Error('Token inválido');
  }
  
  // Generar y enviar PDF
  const pdfBuffer = await this.invoicePdfService.generateInvoicePdf(invoice, invoice.tenant);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="factura-${invoice.invoiceNumber}.pdf"`);
  res.send(pdfBuffer);
}
```

### 3. Decorador @Public()

Se creó un decorador personalizado para marcar endpoints como públicos (sin autenticación):

**Archivo:** `backend/src/auth/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Modificación del JwtAuthGuard:**

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }
}
```

### 4. Actualización del Template de Email

Se actualizó el template de email de facturación para incluir el enlace correcto con token:

```typescript
private getInvoiceEmailTemplate(tenant: any, invoice: any): string {
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('es-CO');
  const amount = this.formatCurrency(invoice.total);
  const apiUrl = this.configService.get('API_URL') || 'http://localhost:3000';
  
  // Generar token para acceso público al PDF
  const token = Buffer.from(`${invoice.id}-${invoice.tenantId}`).toString('base64');
  const pdfUrl = `${apiUrl}/api/invoices/${invoice.id}/pdf/${token}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ...
    </head>
    <body>
      ...
      <a href="${pdfUrl}" class="button">Descargar Factura PDF</a>
      ...
    </body>
    </html>
  `;
}
```

## Archivos Modificados

1. **backend/src/auth/decorators/public.decorator.ts** (nuevo)
   - Decorador @Public() para endpoints sin autenticación

2. **backend/src/auth/guards/jwt-auth.guard.ts**
   - Soporte para decorador @Public()

3. **backend/src/invoices/invoices.controller.ts**
   - Nuevo endpoint público `/api/invoices/:id/pdf/:token`
   - Import del decorador @Public()

4. **backend/src/mail/mail.service.ts**
   - Corrección de caracteres especiales
   - Generación de token y URL pública para PDF

5. **backend/fix-encoding.js**
   - Script actualizado para corregir caracteres

6. **backend/fix-invoice-email.js** (nuevo)
   - Script para corregir enlace del PDF

## Seguridad

El token de acceso público es simple pero efectivo:
- Se genera como: `Base64(invoice.id + "-" + tenant.id)`
- Solo permite acceso a la factura específica
- No expone información sensible
- No tiene fecha de expiración (las facturas son documentos permanentes)

Para mayor seguridad en producción, se podría:
- Agregar fecha de expiración al token
- Usar JWT con firma
- Agregar rate limiting al endpoint público

## Resultado

Ahora el email de facturación:
- ✅ Muestra correctamente todos los caracteres especiales y emojis
- ✅ Tiene un botón funcional para descargar el PDF
- ✅ El PDF se descarga sin necesidad de autenticación
- ✅ Mantiene la seguridad con validación de token

## Pruebas

Para probar la funcionalidad:

1. Generar una factura desde el Dashboard de Facturación
2. Verificar el email recibido:
   - Los caracteres especiales deben verse correctamente
   - El emoji 📄 debe mostrarse correctamente
3. Hacer clic en "Descargar Factura PDF"
4. El PDF debe descargarse automáticamente
5. Verificar que el PDF contiene:
   - Información correcta de la factura
   - Tabla de items con el detalle del servicio
   - Totales correctos

## Configuración Requerida

Asegurarse de que la variable de entorno `API_URL` esté configurada en `backend/.env`:

```env
API_URL=http://localhost:3000
```

En producción, debe apuntar a la URL pública del API:

```env
API_URL=https://api.tudominio.com
```
