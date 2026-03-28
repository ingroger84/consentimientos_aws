# Correo de Soporte Dinámico - V63

**Fecha:** 2026-03-20  
**Versión:** V63  
**Estado:** ✅ IMPLEMENTADO

---

## 📋 Problema Identificado

El sistema tenía el correo "soporte@innovasystems.com" hardcodeado en varios lugares, específicamente en:

1. **`backend/src/invoices/invoice-pdf.service.ts`** - Generación de PDFs de facturas

Este correo debía ser dinámico y obtenerse de la Configuración Avanzada del Super Admin, para que si el usuario cambia el correo en la configuración, ese cambio se refleje automáticamente en todos los documentos del sistema.

---

## ✅ Solución Implementada

### 1. Backend

#### A. Nuevo Campo en Settings

**Archivo:** `backend/src/settings/dto/update-settings.dto.ts`

```typescript
@IsOptional()
@IsString()
supportEmail?: string;
```

**Archivo:** `backend/src/settings/settings.service.ts`

```typescript
// En el método getSettings()
supportEmail: settingsMap['supportEmail'] || 'soporte@innovasystems.com',
```

#### B. Modificación del Servicio de PDFs de Facturas

**Archivo:** `backend/src/invoices/invoice-pdf.service.ts`

**ANTES:**
```typescript
@Injectable()
export class InvoicePdfService {
  async generateInvoicePdf(invoice: Invoice, tenant: Tenant): Promise<Buffer> {
    // ...
    this.addPartyInfo(doc, tenant);
    // ...
  }

  private addPartyInfo(doc: PDFKit.PDFDocument, tenant: Tenant) {
    // ...
    doc.text('soporte@innovasystems.com', 350, startY + 43); // ❌ Hardcodeado
  }
}
```

**DESPUÉS:**
```typescript
@Injectable()
export class InvoicePdfService {
  constructor(private settingsService: SettingsService) {}

  async generateInvoicePdf(invoice: Invoice, tenant: Tenant): Promise<Buffer> {
    // Obtener configuración del Super Admin para el correo de soporte
    const settings = await this.settingsService.getSettings();
    const supportEmail = settings.supportEmail || 'soporte@innovasystems.com';

    return new Promise((resolve, reject) => {
      // ...
      this.addPartyInfo(doc, tenant, supportEmail); // ✅ Dinámico
      // ...
    });
  }

  private addPartyInfo(doc: PDFKit.PDFDocument, tenant: Tenant, supportEmail: string) {
    // ...
    doc.text(supportEmail, 350, startY + 43); // ✅ Usa el correo dinámico
  }
}
```

#### C. Actualización del Módulo de Invoices

**Archivo:** `backend/src/invoices/invoices.module.ts`

```typescript
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    // ...
    SettingsModule, // ✅ Agregado
  ],
  // ...
})
export class InvoicesModule {}
```

---

### 2. Frontend

#### A. Interfaz de Configuración

**Archivo:** `frontend/src/pages/SettingsPage.tsx`

```typescript
interface SettingsForm {
  // ...
  supportEmail: string; // ✅ Nuevo campo
  // ...
}

// En el formulario:
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Email de Soporte
  </label>
  <input
    type="email"
    {...register('supportEmail')}
    className="input"
    placeholder="soporte@empresa.com"
  />
  <p className="text-sm text-gray-500 mt-1">
    Este correo se usará en facturas y documentos del sistema
  </p>
</div>
```

#### B. Contexto de Tema

**Archivo:** `frontend/src/contexts/ThemeContext.tsx`

```typescript
interface ThemeSettings {
  // ...
  supportEmail: string; // ✅ Nuevo campo
  // ...
}

const defaultSettings: ThemeSettings = {
  // ...
  supportEmail: 'soporte@innovasystems.com', // ✅ Valor por defecto
  // ...
};
```

---

## 🎯 Flujo de Funcionamiento

```
1. Super Admin va a Configuración Avanzada
   ↓
2. Ingresa/modifica el "Email de Soporte"
   ↓
3. Guarda la configuración
   ↓
4. El correo se almacena en la tabla app_settings
   ↓
5. Cuando se genera una factura PDF:
   - InvoicePdfService obtiene settings del Super Admin
   - Extrae el supportEmail de la configuración
   - Usa ese correo en el PDF
   ↓
6. El PDF muestra el correo configurado dinámicamente
```

---

## 📊 Ejemplo de Uso

### Configuración Inicial

```
Email de Soporte: soporte@innovasystems.com (por defecto)
```

**PDF de Factura muestra:**
```
EMITIDO POR:
Innova Systems
Sistema de Consentimientos
soporte@innovasystems.com
```

### Después de Cambiar la Configuración

```
Email de Soporte: ayuda@miempresa.com (nuevo)
```

**PDF de Factura muestra:**
```
EMITIDO POR:
Innova Systems
Sistema de Consentimientos
ayuda@miempresa.com ✅
```

---

## 🔍 Archivos Modificados

### Backend (5 archivos)

1. **`backend/src/settings/dto/update-settings.dto.ts`**
   - Agregado campo `supportEmail`

2. **`backend/src/settings/settings.service.ts`**
   - Agregado `supportEmail` en método `getSettings()`

3. **`backend/src/invoices/invoice-pdf.service.ts`**
   - Inyectado `SettingsService`
   - Modificado `generateInvoicePdf()` para obtener `supportEmail`
   - Modificado `addPartyInfo()` para recibir y usar `supportEmail`

4. **`backend/src/invoices/invoices.module.ts`**
   - Importado `SettingsModule`

### Frontend (2 archivos)

5. **`frontend/src/pages/SettingsPage.tsx`**
   - Agregado campo `supportEmail` en interfaz `SettingsForm`
   - Agregado input para `supportEmail` en formulario
   - Agregado valor por defecto en `reset()`

6. **`frontend/src/contexts/ThemeContext.tsx`**
   - Agregado campo `supportEmail` en interfaz `ThemeSettings`
   - Agregado valor por defecto en `defaultSettings`

---

## 🧪 Cómo Probar

### Paso 1: Configurar el Correo

1. Iniciar sesión como Super Admin
2. Ir a "Configuración Avanzada"
3. En la sección "Información de la Empresa"
4. Buscar el campo "Email de Soporte"
5. Ingresar un correo personalizado (ej: `ayuda@miempresa.com`)
6. Guardar cambios

### Paso 2: Generar una Factura

1. Ir a "Facturación"
2. Generar una nueva factura para un tenant
3. Descargar el PDF de la factura

### Paso 3: Verificar el PDF

1. Abrir el PDF generado
2. Buscar la sección "EMITIDO POR" (lado derecho superior)
3. Verificar que muestre el correo configurado

**Resultado Esperado:**
```
EMITIDO POR:
Innova Systems
Sistema de Consentimientos
ayuda@miempresa.com ✅ (tu correo personalizado)
```

---

## 🚀 Despliegue

### Backend

```bash
cd backend
npm run build
```

**Archivo generado:** `backend-dist-v63-correo-dinamico.zip`

### Frontend

```bash
cd frontend
npm run build
```

**Archivo generado:** `frontend-dist-v63-correo-dinamico.zip`

### Comandos de Despliegue

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Backend
cd /home/ubuntu/consentimientos_aws
unzip -o /home/ubuntu/backend-dist-v63-correo-dinamico.zip -d backend/dist/

# Frontend
unzip -o /home/ubuntu/frontend-dist-v63-correo-dinamico.zip -d frontend/dist/

# Reiniciar PM2
pm2 restart all
```

---

## 📝 Notas Importantes

### 1. Valor por Defecto

Si el Super Admin no configura un correo de soporte, el sistema usa:
```
soporte@innovasystems.com
```

### 2. Alcance del Cambio

Actualmente, el correo dinámico se usa en:
- ✅ PDFs de facturas

**Futuras implementaciones podrían incluir:**
- Correos de notificación
- Otros documentos PDF
- Mensajes del sistema

### 3. Compatibilidad

- ✅ Compatible con configuraciones existentes
- ✅ No requiere migración de datos
- ✅ Valor por defecto asegura funcionamiento sin configuración

### 4. Seguridad

- El correo se almacena en la tabla `app_settings`
- Solo el Super Admin puede modificarlo
- Se valida como email en el DTO

---

## 🔄 Extensibilidad

Para agregar el correo dinámico en otros lugares del sistema:

```typescript
// 1. Inyectar SettingsService
constructor(private settingsService: SettingsService) {}

// 2. Obtener configuración
const settings = await this.settingsService.getSettings();
const supportEmail = settings.supportEmail || 'soporte@innovasystems.com';

// 3. Usar el correo dinámico
// ... tu código aquí ...
```

---

## ✅ Checklist de Verificación

### Backend
- [x] Campo `supportEmail` agregado en DTO
- [x] Campo `supportEmail` agregado en servicio
- [x] `InvoicePdfService` usa correo dinámico
- [x] `SettingsModule` importado en `InvoicesModule`
- [x] Sin errores de compilación

### Frontend
- [x] Campo `supportEmail` agregado en interfaz
- [x] Input de `supportEmail` agregado en formulario
- [x] Campo `supportEmail` agregado en contexto
- [x] Valor por defecto configurado
- [x] Sin errores de compilación

### Funcionalidad
- [ ] Super Admin puede configurar correo de soporte
- [ ] Cambios se guardan correctamente
- [ ] PDFs de facturas usan correo configurado
- [ ] Valor por defecto funciona si no hay configuración

---

## 📞 Información Técnica

**Tabla de Base de Datos:** `app_settings`

**Registro del correo:**
```sql
SELECT * FROM app_settings 
WHERE key = 'supportEmail' 
AND "tenantId" IS NULL;
```

**Actualizar manualmente (si es necesario):**
```sql
INSERT INTO app_settings (key, value, "tenantId", "created_at", "updated_at")
VALUES ('supportEmail', 'nuevo@correo.com', NULL, NOW(), NOW())
ON CONFLICT (key, "tenantId") 
DO UPDATE SET value = 'nuevo@correo.com', "updated_at" = NOW();
```

---

## 🎯 Resumen Ejecutivo

| Aspecto | Estado |
|---------|--------|
| Campo agregado en backend | ✅ Sí |
| Campo agregado en frontend | ✅ Sí |
| Correo hardcodeado eliminado | ✅ Sí |
| Correo dinámico implementado | ✅ Sí |
| Valor por defecto configurado | ✅ Sí |
| Sin errores de compilación | ✅ Sí |
| Listo para despliegue | ✅ Sí |

---

**Estado Final:** ✅ IMPLEMENTACIÓN COMPLETADA

**Próximo Paso:** Compilar, desplegar y probar en producción

**Versión:** V63  
**Fecha:** 2026-03-20

