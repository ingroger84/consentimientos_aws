# 🎨 Sistema de Personalización - Logo y Colores

## ✅ Implementación Completada

Se ha implementado un sistema completo de personalización que permite:

1. **Cargar un logo personalizado**
2. **Configurar colores del sistema**
3. **Personalizar el nombre de la empresa**

## 🎯 Características

### Logo Personalizado

- **Ubicación en Login**: Se muestra antes de iniciar sesión
- **Ubicación en Sidebar**: Se muestra en la parte superior izquierda después de loguearse
- **Formatos soportados**: JPG, PNG, GIF, SVG
- **Tamaño máximo**: 5MB
- **Fallback**: Si no hay logo, muestra el nombre de la empresa o inicial

### Colores Personalizables

1. **Color Primario**: Botones principales, enlaces, elementos destacados
2. **Color Secundario**: Elementos complementarios, gradientes
3. **Color de Acento**: Elementos importantes, notificaciones

### Nombre de la Empresa

- Se muestra en el login
- Se muestra en el sidebar
- Se usa como título de la página

## 🏗️ Arquitectura

### Backend

#### Módulo de Settings

**Entidad**: `AppSettings`
```typescript
- id: UUID
- key: string (unique)
- value: string
- createdAt: Date
- updatedAt: Date
```

**Endpoints**:

1. `GET /api/settings` - Obtener configuración actual (público)
2. `PATCH /api/settings` - Actualizar configuración (requiere permisos)
3. `POST /api/settings/logo` - Subir logo (requiere permisos)

**Archivos Creados**:
- `backend/src/settings/entities/app-settings.entity.ts`
- `backend/src/settings/dto/update-settings.dto.ts`
- `backend/src/settings/settings.service.ts`
- `backend/src/settings/settings.controller.ts`
- `backend/src/settings/settings.module.ts`

**Carpeta de Uploads**:
- `backend/uploads/logo/` - Almacena los logos subidos
- Los archivos se sirven estáticamente en `/uploads`

### Frontend

#### Context API - ThemeContext

**Proveedor**: `ThemeProvider`
- Carga la configuración al iniciar
- Aplica los colores como variables CSS
- Actualiza el título de la página
- Proporciona método para refrescar configuración

**Hook**: `useTheme()`
```typescript
{
  settings: ThemeSettings,
  loading: boolean,
  refreshSettings: () => Promise<void>
}
```

**Archivos Creados**:
- `frontend/src/contexts/ThemeContext.tsx`
- `frontend/src/pages/SettingsPage.tsx`

**Archivos Modificados**:
- `frontend/src/App.tsx` - Agregado ThemeProvider
- `frontend/src/index.css` - Variables CSS personalizadas
- `frontend/src/pages/LoginPage.tsx` - Logo y colores dinámicos
- `frontend/src/components/Layout.tsx` - Logo en sidebar

## 🎨 Variables CSS

El sistema usa variables CSS para aplicar los colores:

```css
:root {
  --color-primary: #3B82F6;
  --color-secondary: #10B981;
  --color-accent: #F59E0B;
}
```

Estas variables se actualizan dinámicamente cuando cambia la configuración.

## 🔐 Seguridad

- Solo usuarios con permiso `manage_users` pueden modificar la configuración
- El endpoint GET es público para que el login pueda cargar el logo
- Validación de tipos de archivo (solo imágenes)
- Validación de tamaño de archivo (máximo 5MB)
- Los archivos se guardan con nombres únicos para evitar conflictos

## 📱 Uso

### Para Administradores

1. **Acceder a Configuración**:
   - Iniciar sesión como administrador
   - Ir a "Configuración" en el menú lateral

2. **Subir Logo**:
   - Click en "Subir Logo"
   - Seleccionar imagen (JPG, PNG, GIF, SVG)
   - El logo se actualiza automáticamente

3. **Cambiar Colores**:
   - Usar los selectores de color o ingresar código hexadecimal
   - Click en "Guardar Cambios"
   - Los colores se aplican inmediatamente

4. **Cambiar Nombre**:
   - Editar el campo "Nombre de la Empresa"
   - Click en "Guardar Cambios"

### Vista Previa

La página de configuración incluye una vista previa en tiempo real de los colores seleccionados.

## 🔄 Flujo de Datos

1. **Carga Inicial**:
   ```
   App.tsx → ThemeProvider → GET /api/settings → Aplicar tema
   ```

2. **Actualización de Logo**:
   ```
   SettingsPage → POST /api/settings/logo → refreshSettings() → Actualizar UI
   ```

3. **Actualización de Colores**:
   ```
   SettingsPage → PATCH /api/settings → refreshSettings() → Aplicar CSS
   ```

## 🎯 Mejores Prácticas Implementadas

### 1. **Separación de Responsabilidades**
- Backend: Almacenamiento y validación
- Frontend: Presentación y aplicación de estilos

### 2. **Context API**
- Estado global para configuración de tema
- Evita prop drilling
- Fácil acceso desde cualquier componente

### 3. **Variables CSS**
- Colores dinámicos sin recargar
- Mejor rendimiento que estilos inline
- Fácil mantenimiento

### 4. **Validación**
- Backend: Validación de archivos y datos
- Frontend: Validación de formularios con react-hook-form

### 5. **Feedback al Usuario**
- Mensajes de éxito/error
- Estados de carga
- Vista previa en tiempo real

### 6. **Fallbacks**
- Logo por defecto si no hay imagen
- Colores por defecto si no hay configuración
- Manejo de errores graceful

### 7. **TypeScript**
- Tipos definidos para toda la configuración
- Autocompletado y validación en tiempo de desarrollo

### 8. **Seguridad**
- Autenticación requerida
- Permisos específicos
- Validación de archivos
- Límites de tamaño

## 📊 Estructura de Datos

### Base de Datos

```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY,
  key VARCHAR UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Registros**:
- `logoUrl`: Ruta del logo
- `primaryColor`: Color primario (#RRGGBB)
- `secondaryColor`: Color secundario (#RRGGBB)
- `accentColor`: Color de acento (#RRGGBB)
- `companyName`: Nombre de la empresa

## 🚀 Próximas Mejoras Posibles

1. **Más opciones de personalización**:
   - Fuentes personalizadas
   - Favicon personalizado
   - Colores adicionales

2. **Temas predefinidos**:
   - Tema claro/oscuro
   - Paletas de colores predefinidas

3. **Historial de cambios**:
   - Auditoría de cambios de configuración
   - Posibilidad de revertir cambios

4. **Múltiples logos**:
   - Logo para modo claro
   - Logo para modo oscuro
   - Favicon

## 📝 Notas Técnicas

- Los logos se almacenan en el sistema de archivos local
- Para producción, considerar usar S3 o similar
- Los colores se validan como hexadecimales
- La configuración se carga una vez al iniciar y se puede refrescar manualmente

---

**Implementado**: 4 de enero de 2026
**Estado**: ✅ Funcionando correctamente
**Requiere**: Permisos de administrador para configurar
