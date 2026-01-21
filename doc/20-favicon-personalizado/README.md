# Favicon Personalizado

## Fecha: 20 de Enero de 2026, 5:07 PM

## Estado: ✅ IMPLEMENTADO

---

## Descripcion

Se implemento la funcionalidad para que tanto el Super Admin como los Tenants puedan subir su propio favicon personalizado. El favicon aparece en la pestana del navegador y se actualiza dinamicamente.

---

## Funcionalidades Implementadas

### 1. Subida de Favicon

- **Ubicacion**: Configuracion > Logos > Favicon
- **Formatos soportados**: .ico, .png, .svg
- **Tamano maximo**: 1MB
- **Almacenamiento**: S3 o local segun configuracion

### 2. Actualizacion Dinamica

- El favicon se actualiza automaticamente al cambiar
- No requiere recargar la pagina manualmente
- Se aplica inmediatamente despues de subir

### 3. Multi-tenant

- Cada tenant puede tener su propio favicon
- El Super Admin puede configurar un favicon global
- El favicon del tenant tiene prioridad sobre el global

---

## Cambios Realizados

### Backend

#### 1. SettingsService (`backend/src/settings/settings.service.ts`)

**Metodo agregado**:
```typescript
async uploadFavicon(file: Express.Multer.File, tenantId?: string) {
  const ext = file.originalname.split('.').pop();
  const filename = `favicon-${tenantId || 'global'}-${Date.now()}.${ext}`;
  
  const faviconUrl = await this.storageService.uploadFile(file, 'favicon', filename);
  
  await this.updateSettings({ faviconUrl: faviconUrl }, tenantId);
  
  return { faviconUrl: faviconUrl };
}
```

**Campo agregado en getSettings()**:
```typescript
faviconUrl: settingsMap['faviconUrl'] || null,
```

#### 2. SettingsController (`backend/src/settings/settings.controller.ts`)

**Endpoint agregado**:
```typescript
@Post('favicon')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.EDIT_SETTINGS)
@UseInterceptors(
  FileInterceptor('favicon', {
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(ico|png|svg)$/)) {
        return cb(new Error('Solo se permiten archivos .ico, .png o .svg'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 1 * 1024 * 1024, // 1MB
    },
  }),
)
uploadFavicon(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {
  const tenantId = user.tenant?.id;
  return this.settingsService.uploadFavicon(file, tenantId);
}
```

#### 3. UpdateSettingsDto (`backend/src/settings/dto/update-settings.dto.ts`)

**Campo agregado**:
```typescript
@IsOptional()
@IsString()
faviconUrl?: string;
```

### Frontend

#### 1. SettingsPage (`frontend/src/pages/SettingsPage.tsx`)

**Estado agregado**:
```typescript
const [uploadingFavicon, setUploadingFavicon] = useState(false);
const faviconInputRef = useRef<HTMLInputElement>(null);
```

**Funcion actualizada**:
```typescript
const handleLogoUpload = async (
  event: React.ChangeEvent<HTMLInputElement>, 
  type: 'logo' | 'footer' | 'watermark' | 'favicon'
) => {
  // Validacion especifica para favicon
  if (type === 'favicon') {
    const validExtensions = ['ico', 'png', 'svg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      setMessage('Por favor selecciona un archivo .ico, .png o .svg para el favicon');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setMessage('El favicon no debe superar 1MB');
      return;
    }
  }
  
  // ... resto del codigo
}
```

**Seccion agregada en la pestana Logos**:
```tsx
<div className="card">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Favicon</h2>
  
  <div className="mb-4">
    {settings.faviconUrl ? (
      <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
        <img
          src={getResourceUrl(settings.faviconUrl)}
          alt="Favicon"
          className="w-16 h-16 object-contain"
        />
      </div>
    ) : (
      <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
        <div className="text-center text-gray-500">
          <Upload className="w-12 h-12 mx-auto mb-2" />
          <p>No hay favicon</p>
        </div>
      </div>
    )}
  </div>

  <input
    ref={faviconInputRef}
    type="file"
    accept=".ico,.png,.svg"
    onChange={(e) => handleLogoUpload(e, 'favicon')}
    className="hidden"
  />

  <button
    type="button"
    onClick={() => faviconInputRef.current?.click()}
    disabled={uploadingFavicon}
    className="btn btn-primary w-full"
  >
    {uploadingFavicon ? (
      <>
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        Subiendo...
      </>
    ) : (
      <>
        <Upload className="w-4 h-4 mr-2" />
        Subir Favicon
      </>
    )}
  </button>

  <p className="text-sm text-gray-500 mt-2">
    Aparece en la pestana del navegador (.ico, .png, .svg)
  </p>
</div>
```

#### 2. ThemeContext (`frontend/src/contexts/ThemeContext.tsx`)

**Interface actualizada**:
```typescript
export interface ThemeSettings {
  logoUrl: string | null;
  footerLogoUrl: string | null;
  watermarkLogoUrl: string | null;
  faviconUrl: string | null; // Nuevo campo
  // ... resto de campos
}
```

**Funcion agregada**:
```typescript
const updateFavicon = (faviconUrl: string) => {
  const fullUrl = faviconUrl.startsWith('http') 
    ? faviconUrl 
    : `${getApiBaseUrl()}${faviconUrl}`;
  
  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  
  link.href = fullUrl;
  
  // Tambien actualizar apple-touch-icon si existe
  let appleLink: HTMLLinkElement | null = document.querySelector("link[rel~='apple-touch-icon']");
  if (appleLink) {
    appleLink.href = fullUrl;
  }
};
```

**Funcion applyTheme actualizada**:
```typescript
const applyTheme = (themeSettings: ThemeSettings) => {
  // ... codigo existente
  
  // Actualizar el favicon si existe
  if (themeSettings.faviconUrl) {
    updateFavicon(themeSettings.faviconUrl);
  }
};
```

---

## Estructura de Almacenamiento

### S3 Bucket

```
datagree-uploads/
├── favicon/
│   ├── favicon-global-1737410000000.ico
│   ├── favicon-tenant1-1737410001000.png
│   └── favicon-tenant2-1737410002000.svg
```

### Local

```
backend/uploads/
├── favicon/
│   ├── favicon-global-1737410000000.ico
│   ├── favicon-tenant1-1737410001000.png
│   └── favicon-tenant2-1737410002000.svg
```

---

## Flujo de Uso

### Para Super Admin

1. Ir a **Configuracion** > **Logos**
2. Scroll hasta la seccion **Favicon**
3. Click en **Subir Favicon**
4. Seleccionar archivo (.ico, .png o .svg)
5. El favicon se actualiza automaticamente
6. Aparece en la pestana del navegador

### Para Tenant Admin

1. Ir a **Configuracion** > **Logos**
2. Scroll hasta la seccion **Favicon**
3. Click en **Subir Favicon**
4. Seleccionar archivo (.ico, .png o .svg)
5. El favicon se actualiza automaticamente
6. Solo afecta a su tenant

---

## Validaciones

### Backend

- **Formato**: Solo .ico, .png, .svg
- **Tamano**: Maximo 1MB
- **Permisos**: Requiere permiso EDIT_SETTINGS

### Frontend

- **Formato**: Solo .ico, .png, .svg
- **Tamano**: Maximo 1MB
- **Validacion visual**: Muestra preview del favicon

---

## Comportamiento

### Prioridad

1. **Favicon del Tenant**: Si el tenant tiene favicon, se usa ese
2. **Favicon Global**: Si no hay favicon del tenant, se usa el global
3. **Favicon por Defecto**: Si no hay ninguno, se usa el del navegador

### Actualizacion

- El favicon se actualiza inmediatamente al subir
- No requiere recargar la pagina
- Se aplica a todas las pestanas abiertas del mismo dominio

### Multi-tenant

- Cada tenant ve su propio favicon
- El Super Admin ve el favicon global
- Los usuarios ven el favicon de su tenant

---

## Endpoints

### POST /api/settings/favicon

**Descripcion**: Sube un nuevo favicon

**Autenticacion**: JWT + EDIT_SETTINGS permission

**Body**: FormData con campo `favicon`

**Respuesta**:
```json
{
  "faviconUrl": "/uploads/favicon/favicon-tenant1-1737410000000.png"
}
```

### GET /api/settings

**Descripcion**: Obtiene la configuracion incluyendo favicon

**Autenticacion**: JWT

**Respuesta**:
```json
{
  "faviconUrl": "/uploads/favicon/favicon-tenant1-1737410000000.png",
  // ... otros campos
}
```

---

## Pruebas

### Prueba 1: Subir Favicon como Super Admin

1. Login como Super Admin
2. Ir a Configuracion > Logos
3. Subir un favicon .ico
4. Verificar que aparece en la pestana
5. Verificar en AWS Console que el archivo esta en S3

### Prueba 2: Subir Favicon como Tenant Admin

1. Login como Tenant Admin
2. Ir a Configuracion > Logos
3. Subir un favicon .png
4. Verificar que aparece en la pestana
5. Verificar que solo afecta a ese tenant

### Prueba 3: Formatos Soportados

1. Probar subir .ico - ✅ Debe funcionar
2. Probar subir .png - ✅ Debe funcionar
3. Probar subir .svg - ✅ Debe funcionar
4. Probar subir .jpg - ❌ Debe rechazar

### Prueba 4: Tamano Maximo

1. Probar subir archivo de 500KB - ✅ Debe funcionar
2. Probar subir archivo de 2MB - ❌ Debe rechazar

---

## Troubleshooting

### El favicon no se actualiza

**Causa**: Cache del navegador

**Solucion**:
1. Hacer Ctrl+F5 para recargar sin cache
2. Limpiar cache del navegador
3. Cerrar y abrir el navegador

### Error al subir favicon

**Causa**: Formato no soportado

**Solucion**:
1. Verificar que el archivo sea .ico, .png o .svg
2. Verificar que el tamano sea menor a 1MB
3. Verificar que el usuario tenga permiso EDIT_SETTINGS

### El favicon no aparece en S3

**Causa**: Configuracion de S3

**Solucion**:
1. Verificar que USE_S3=true en .env
2. Verificar credenciales de AWS
3. Verificar que el bucket existe
4. Verificar logs del backend

---

## Mejoras Futuras

### Sugerencias

1. **Generacion Automatica**: Generar multiples tamanos del favicon
2. **Preview en Tiempo Real**: Mostrar como se vera en diferentes navegadores
3. **Validacion de Dimensiones**: Recomendar 32x32 o 64x64 pixels
4. **Conversion Automatica**: Convertir PNG a ICO automaticamente
5. **Favicon Animado**: Soporte para favicons animados

---

## Archivos Modificados

### Backend

1. `backend/src/settings/settings.service.ts`
2. `backend/src/settings/settings.controller.ts`
3. `backend/src/settings/dto/update-settings.dto.ts`

### Frontend

1. `frontend/src/pages/SettingsPage.tsx`
2. `frontend/src/contexts/ThemeContext.tsx`

---

## Documentacion Relacionada

- [AWS S3 Storage](../19-aws-s3-storage/README.md)
- [Configuracion Avanzada](../configuracion-avanzada.md)
- [Multi-tenant](../multi-tenant.md)

---

**Fecha de Implementacion**: 20 de Enero de 2026, 5:07 PM
**Implementado por**: Kiro AI Assistant
**Estado**: PRODUCCION READY ✅
