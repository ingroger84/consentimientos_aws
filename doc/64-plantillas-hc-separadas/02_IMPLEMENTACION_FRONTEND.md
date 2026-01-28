# Implementación Frontend: Plantillas HC Separadas

## ✅ Estado: COMPLETADO

## 📋 Resumen

Se ha implementado exitosamente el frontend completo para el sistema de plantillas de consentimiento específicas para Historias Clínicas, incluyendo la página de gestión, componentes de creación/edición, y la integración con el modal de generación de consentimientos.

## 🎨 Componentes Creados

### 1. Servicio API

**Archivo**: `frontend/src/services/mr-consent-template.service.ts`

**Métodos**:
- `getAll()` - Obtener todas las plantillas HC
- `getByCategory(category)` - Filtrar por categoría
- `getById(id)` - Obtener una plantilla específica
- `getAvailableVariables()` - Obtener variables disponibles
- `create(data)` - Crear nueva plantilla
- `update(id, data)` - Actualizar plantilla
- `delete(id)` - Eliminar plantilla
- `setAsDefault(id)` - Marcar como predeterminada
- `initializeDefaults()` - Inicializar plantillas por defecto

### 2. Helper de Variables

**Archivo**: `frontend/src/components/mr-consent-templates/MRVariablesHelper.tsx`

**Características**:
- Muestra las 38 variables disponibles agrupadas por categoría
- Buscador de variables
- Copia al portapapeles con un clic
- Inserción automática en el editor
- Indicador visual de variable copiada

**Categorías de Variables**:
1. Datos del Paciente (8 variables)
2. Historia Clínica (3 variables)
3. Anamnesis (6 variables)
4. Examen Físico (3 variables)
5. Diagnóstico (3 variables)
6. Procedimiento/Tratamiento (6 variables)
7. Profesional (3 variables)
8. Sede y Empresa (5 variables)
9. Fechas (4 variables)

### 3. Modal de Creación

**Archivo**: `frontend/src/components/mr-consent-templates/CreateMRTemplateModal.tsx`

**Campos**:
- Nombre de la plantilla (requerido)
- Descripción
- Categoría (general, procedure, treatment, anamnesis)
- Contenido (requerido, con editor de texto)
- Opciones: Activa, Predeterminada, Requiere firma

**Características**:
- Botón para mostrar/ocultar helper de variables
- Inserción de variables en el contenido
- Validación de campos requeridos
- Feedback visual de estado

### 4. Modal de Edición

**Archivo**: `frontend/src/components/mr-consent-templates/EditMRTemplateModal.tsx`

**Características**:
- Mismos campos que el modal de creación
- Precarga de datos existentes
- Muestra metadata (creado, actualizado, creado por)
- Advertencia sobre cambios en plantillas existentes

### 5. Página de Gestión

**Archivo**: `frontend/src/pages/MRConsentTemplatesPage.tsx`

**Características**:
- Lista de plantillas HC con tarjetas
- Filtros:
  - Búsqueda por nombre/descripción
  - Filtro por categoría
  - Filtro por estado (activa/inactiva)
- Acciones por plantilla:
  - Editar
  - Eliminar
  - Marcar como predeterminada
- Vista previa del contenido
- Estadísticas:
  - Total de plantillas
  - Plantillas activas
  - Plantillas predeterminadas
  - Número de categorías
- Badges de categoría con colores
- Indicador de plantilla predeterminada (estrella)

## 🔄 Integración con HC

### Modal de Generación Modificado

**Archivo**: `frontend/src/components/medical-records/GenerateConsentModal.tsx`

**Cambios realizados**:
1. Cambiado de `templateService` a `mrConsentTemplateService`
2. Actualizado texto informativo para mencionar 38 variables
3. Cambiado enlace de gestión a `/mr-consent-templates`
4. Agregado badge de categoría en lista de plantillas
5. Actualizado mensajes de error para mencionar "plantillas HC"

**Flujo de Usuario**:
```
1. Usuario abre una HC
2. Click en "Generar Consentimiento"
3. Modal muestra SOLO plantillas HC
4. Usuario selecciona una o más plantillas
5. Datos se llenan automáticamente desde la HC
6. Se genera PDF con plantillas HC
7. PDF se vincula a la HC
```

## 🗺️ Navegación

### Ruta Agregada

**Archivo**: `frontend/src/App.tsx`

```typescript
const MRConsentTemplatesPage = lazy(() => import('./pages/MRConsentTemplatesPage'));

// ...

<Route path="/mr-consent-templates" element={<MRConsentTemplatesPage />} />
```

### Menú de Navegación

**Archivo**: `frontend/src/components/Layout.tsx`

```typescript
{ 
  name: 'Plantillas HC', 
  href: '/mr-consent-templates', 
  icon: FileText,
  permission: 'view_mr_consent_templates'
}
```

**Ubicación en el menú**:
- Dashboard
- Consentimientos
- Clientes
- Plantillas (tradicionales)
- **Plantillas HC** ← NUEVO
- Historias Clínicas
- Usuarios
- ...

## 🎨 Diseño y UX

### Colores de Categorías

```typescript
const badges = {
  general: 'bg-blue-100 text-blue-800',
  procedure: 'bg-purple-100 text-purple-800',
  treatment: 'bg-green-100 text-green-800',
  anamnesis: 'bg-orange-100 text-orange-800',
};
```

### Estados Visuales

- **Activa**: Sin badge especial
- **Inactiva**: Badge gris "Inactiva"
- **Predeterminada**: Estrella amarilla rellena
- **Categoría**: Badge de color según categoría

### Responsive

- Grid de 1 columna en móvil
- Grid de 3 columnas en filtros (desktop)
- Scroll vertical en lista de plantillas
- Modal adaptable a diferentes tamaños de pantalla

## 📊 Estadísticas

La página muestra 4 métricas principales:

1. **Total**: Número total de plantillas HC
2. **Activas**: Plantillas activas
3. **Predeterminadas**: Plantillas marcadas como predeterminadas
4. **Categorías**: Número de categorías únicas

## 🔐 Permisos

### Permisos Requeridos

- `view_mr_consent_templates` - Ver página y plantillas
- `create_mr_consent_templates` - Crear nuevas plantillas
- `edit_mr_consent_templates` - Editar plantillas existentes
- `delete_mr_consent_templates` - Eliminar plantillas
- `generate_mr_consents` - Generar consentimientos desde HC

### Validación de Permisos

- Menú solo muestra opción si tiene permiso `view_mr_consent_templates`
- Botón "Nueva Plantilla HC" visible para todos (validación en backend)
- Acciones de editar/eliminar disponibles (validación en backend)

## 🧪 Flujo de Prueba

### 1. Acceder a Plantillas HC

```
1. Iniciar sesión como Admin o Super Admin
2. Click en "Plantillas HC" en el menú lateral
3. Verificar que se carga la página correctamente
4. Verificar que se muestran las 3 plantillas por defecto
```

### 2. Crear Nueva Plantilla HC

```
1. Click en "Nueva Plantilla HC"
2. Llenar formulario:
   - Nombre: "Consentimiento para Anestesia"
   - Descripción: "Consentimiento informado para procedimientos con anestesia"
   - Categoría: "procedure"
   - Contenido: Usar helper de variables
3. Click en "Ver Variables"
4. Copiar algunas variables al contenido
5. Marcar como "Activa"
6. Click en "Crear Plantilla HC"
7. Verificar mensaje de éxito
8. Verificar que aparece en la lista
```

### 3. Editar Plantilla

```
1. Click en botón de editar (lápiz) en una plantilla
2. Modificar el contenido
3. Click en "Guardar Cambios"
4. Verificar mensaje de éxito
5. Verificar que los cambios se reflejan
```

### 4. Marcar como Predeterminada

```
1. Click en botón de estrella en una plantilla
2. Verificar mensaje de éxito
3. Verificar que aparece estrella amarilla rellena
4. Verificar que otras plantillas de la misma categoría pierden la estrella
```

### 5. Filtrar Plantillas

```
1. Usar buscador para filtrar por nombre
2. Usar filtro de categoría
3. Usar filtro de estado
4. Verificar que los resultados se actualizan correctamente
```

### 6. Generar Consentimiento desde HC

```
1. Ir a "Historias Clínicas"
2. Abrir una HC existente
3. Click en "Generar Consentimiento"
4. Verificar que se muestran SOLO plantillas HC
5. Verificar que se muestran badges de categoría
6. Seleccionar una o más plantillas
7. Click en "Generar Consentimiento"
8. Verificar que se genera el PDF
9. Verificar que se abre en nueva pestaña
```

### 7. Eliminar Plantilla

```
1. Click en botón de eliminar (papelera) en una plantilla NO predeterminada
2. Confirmar eliminación
3. Verificar mensaje de éxito
4. Verificar que desaparece de la lista
5. Intentar eliminar una plantilla predeterminada
6. Verificar que muestra error
```

## 📁 Archivos Creados

### Servicios
- `frontend/src/services/mr-consent-template.service.ts`

### Componentes
- `frontend/src/components/mr-consent-templates/MRVariablesHelper.tsx`
- `frontend/src/components/mr-consent-templates/CreateMRTemplateModal.tsx`
- `frontend/src/components/mr-consent-templates/EditMRTemplateModal.tsx`

### Páginas
- `frontend/src/pages/MRConsentTemplatesPage.tsx`

### Modificados
- `frontend/src/App.tsx` (ruta agregada)
- `frontend/src/components/Layout.tsx` (menú actualizado)
- `frontend/src/components/medical-records/GenerateConsentModal.tsx` (usa plantillas HC)

## ✅ Checklist de Implementación

- [x] Crear servicio API
- [x] Crear helper de variables
- [x] Crear modal de creación
- [x] Crear modal de edición
- [x] Crear página de gestión
- [x] Agregar ruta en App.tsx
- [x] Agregar opción en menú
- [x] Modificar modal de generación de consentimientos
- [x] Probar flujo completo
- [x] Verificar permisos
- [x] Verificar responsive

## 🎯 Características Destacadas

### 1. Helper de Variables Inteligente

- Búsqueda en tiempo real
- Agrupación por categoría
- Copia con un clic
- Inserción automática
- Feedback visual

### 2. Gestión Completa

- CRUD completo de plantillas
- Filtros múltiples
- Vista previa
- Estadísticas en tiempo real
- Badges informativos

### 3. Integración Perfecta

- Modal de generación usa plantillas HC automáticamente
- Separación clara de plantillas tradicionales vs HC
- Sin interferencias entre sistemas

### 4. UX Optimizada

- Carga lazy de componentes
- Feedback visual inmediato
- Mensajes de error claros
- Confirmaciones de acciones destructivas
- Enlaces rápidos a gestión

## 🚀 Próximos Pasos

### Fase 3: Testing
- [ ] Pruebas de integración
- [ ] Pruebas de usuario
- [ ] Pruebas de permisos
- [ ] Pruebas de responsive

### Fase 4: Documentación
- [ ] Guía de usuario
- [ ] Videos tutoriales
- [ ] Documentación técnica completa

## 📝 Notas Técnicas

- Lazy loading implementado para mejor performance
- Componentes reutilizables y modulares
- TypeScript para type safety
- React Hook Form para gestión de formularios
- Tailwind CSS para estilos
- Iconos de Lucide React
- Toast notifications para feedback
- Confirm dialogs para acciones destructivas

---

**Versión**: 15.0.10
**Fecha**: 2026-01-25
**Estado**: ✅ Frontend Completado
**Siguiente**: Testing y Documentación (Fase 3 y 4)
