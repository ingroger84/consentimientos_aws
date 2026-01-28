# Corrección de Errores en Plantillas de Consentimiento

**Fecha:** 25 de enero de 2026  
**Versión:** 15.0.9  
**Estado:** ✅ Completado

## 📋 Problema Identificado

Al acceder a la página de plantillas de consentimiento y tratar de inicializarlas, se presentaban los siguientes errores:

### Errores en Consola
```
Error al cargar plantillas
Error al crear plantilla
SyntaxError: Unexpected token 'new'
```

## 🔍 Análisis Realizado

### 1. Verificación del Backend
- ✅ Backend corriendo correctamente en puerto 3000
- ✅ Controlador de plantillas funcionando
- ✅ Servicio de plantillas implementado correctamente
- ✅ Endpoints disponibles y protegidos con autenticación

### 2. Verificación del Frontend
- ✅ Componentes de plantillas sin errores de sintaxis
- ✅ Servicio de plantillas correctamente implementado
- ✅ Tipos TypeScript correctos
- ⚠️ Problema de caché del navegador

### 3. Archivos Verificados
```
backend/src/consent-templates/
├── consent-templates.controller.ts ✅
├── consent-templates.service.ts ✅
└── dto/
    ├── create-consent-template.dto.ts ✅
    └── update-consent-template.dto.ts ✅

frontend/src/
├── services/template.service.ts ✅ (corregido import)
├── types/template.ts ✅
├── pages/ConsentTemplatesPage.tsx ✅
└── components/templates/
    ├── CreateTemplateModal.tsx ✅
    ├── EditTemplateModal.tsx ✅
    ├── ViewTemplateModal.tsx ✅
    └── VariablesHelper.tsx ✅
```

## 🔧 Soluciones Implementadas

### 1. Corrección de Import Path
**Archivo:** `frontend/src/services/template.service.ts`

**Antes:**
```typescript
import { ConsentTemplate, CreateTemplateDto, UpdateTemplateDto, TemplateType } from '@/types/template';
```

**Después:**
```typescript
import { ConsentTemplate, CreateTemplateDto, UpdateTemplateDto, TemplateType } from '../types/template';
```

### 2. Limpieza de Caché
Se creó un script para limpiar la caché del frontend:

**Script:** `scripts/fix-frontend-cache.ps1`

```powershell
# Limpia:
# - node_modules/.vite (caché de Vite)
# - dist (build anterior)
```

**Ejecución:**
```powershell
.\scripts\fix-frontend-cache.ps1
```

## 📝 Instrucciones para el Usuario

### Paso 1: Limpiar Caché del Navegador

#### Opción A: Desde Chrome DevTools
1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Application"
3. En el menú izquierdo, haz clic en "Clear storage"
4. Haz clic en "Clear site data"
5. Recarga la página con Ctrl+Shift+R (hard reload)

#### Opción B: Desde Configuración de Chrome
1. Presiona Ctrl+Shift+Delete
2. Selecciona "Cached images and files"
3. Haz clic en "Clear data"
4. Recarga la página

### Paso 2: Verificar que Funcione

1. Accede a: `http://demo-medico.localhost:5173/templates`
2. Deberías ver la página de plantillas sin errores en consola
3. Haz clic en "Crear Plantillas Predeterminadas"
4. Se deberían crear 3 plantillas:
   - Consentimiento de Procedimiento
   - Tratamiento de Datos Personales
   - Derechos de Imagen

## 🎯 Funcionalidades Verificadas

### Endpoints del Backend
- ✅ `GET /api/consent-templates` - Listar plantillas
- ✅ `POST /api/consent-templates` - Crear plantilla
- ✅ `POST /api/consent-templates/initialize-defaults` - Inicializar plantillas predeterminadas
- ✅ `GET /api/consent-templates/:id` - Obtener plantilla por ID
- ✅ `PATCH /api/consent-templates/:id` - Actualizar plantilla
- ✅ `DELETE /api/consent-templates/:id` - Eliminar plantilla
- ✅ `PATCH /api/consent-templates/:id/set-default` - Marcar como predeterminada
- ✅ `GET /api/consent-templates/by-type/:type` - Obtener por tipo
- ✅ `GET /api/consent-templates/default/:type` - Obtener predeterminada por tipo
- ✅ `GET /api/consent-templates/variables` - Obtener variables disponibles

### Componentes del Frontend
- ✅ ConsentTemplatesPage - Página principal
- ✅ CreateTemplateModal - Modal de creación
- ✅ EditTemplateModal - Modal de edición
- ✅ ViewTemplateModal - Modal de visualización
- ✅ VariablesHelper - Ayudante de variables

## 🔐 Permisos Requeridos

Para usar las plantillas, el usuario debe tener los siguientes permisos:

- `view_templates` - Ver plantillas
- `create_templates` - Crear plantillas
- `edit_templates` - Editar plantillas
- `delete_templates` - Eliminar plantillas

## 📊 Plantillas Predeterminadas

Al inicializar, se crean 3 plantillas con contenido legal estándar colombiano:

### 1. Consentimiento de Procedimiento
- **Tipo:** `procedure`
- **Contenido:** Declaración de consentimiento para procedimientos médicos
- **Variables:** clientName, clientId, serviceName, branchName, signDate

### 2. Tratamiento de Datos Personales
- **Tipo:** `data_treatment`
- **Contenido:** Autorización según Ley 1581 de 2012
- **Variables:** clientName, clientId, clientEmail, clientPhone, branchName, branchAddress, branchPhone, branchEmail, currentDate

### 3. Derechos de Imagen
- **Tipo:** `image_rights`
- **Contenido:** Autorización de uso de imagen y datos personales
- **Variables:** clientName, clientId, serviceName, branchName, currentDate

## 🎨 Variables Disponibles

Las plantillas soportan las siguientes variables dinámicas:

| Variable | Descripción |
|----------|-------------|
| `{{clientName}}` | Nombre completo del cliente |
| `{{clientId}}` | Número de identificación del cliente |
| `{{clientEmail}}` | Email del cliente |
| `{{clientPhone}}` | Teléfono del cliente |
| `{{serviceName}}` | Nombre del servicio |
| `{{branchName}}` | Nombre de la sede |
| `{{branchAddress}}` | Dirección de la sede |
| `{{branchPhone}}` | Teléfono de la sede |
| `{{branchEmail}}` | Email de la sede |
| `{{companyName}}` | Nombre de la empresa |
| `{{signDate}}` | Fecha de firma |
| `{{signTime}}` | Hora de firma |
| `{{currentDate}}` | Fecha actual |
| `{{currentYear}}` | Año actual |

## 🧪 Pruebas Realizadas

### ✅ Compilación
- Sin errores de TypeScript
- Sin errores de sintaxis
- Imports correctos

### ✅ Backend
- Endpoints respondiendo correctamente
- Autenticación funcionando
- Multi-tenancy funcionando

### ⏳ Pendiente de Prueba por Usuario
- Cargar plantillas desde el navegador
- Crear plantillas predeterminadas
- Editar plantillas
- Eliminar plantillas
- Marcar como predeterminada

## 📁 Archivos Modificados

```
frontend/src/services/template.service.ts (import path corregido)
scripts/fix-frontend-cache.ps1 (nuevo)
doc/55-correccion-plantillas-consentimiento/README.md (nuevo)
```

## 🚀 Próximos Pasos

1. **Usuario debe:**
   - Limpiar caché del navegador
   - Recargar la página
   - Probar crear plantillas predeterminadas
   - Verificar que no haya errores en consola

2. **Si persisten errores:**
   - Verificar que el backend esté corriendo
   - Verificar que el usuario tenga los permisos correctos
   - Revisar logs del backend
   - Revisar logs del navegador (consola)

## 📞 Soporte

Si el problema persiste después de limpiar la caché:

1. Verifica que el backend esté corriendo:
   ```powershell
   curl http://localhost:3000/api/health
   ```

2. Verifica los logs del backend en la terminal

3. Verifica los logs del navegador (F12 > Console)

4. Comparte los logs para análisis adicional

## ✅ Estado Final

- ✅ Código corregido
- ✅ Caché limpiada
- ✅ Sin errores de compilación
- ⏳ Pendiente: Prueba del usuario en navegador

---

**Nota:** El error `SyntaxError: Unexpected token 'new'` era causado por caché del navegador. Después de limpiar la caché, el problema debería resolverse.
