# Análisis: Plantillas de Consentimiento

**Fecha**: 23 de enero de 2026

## Resumen de Búsqueda

He revisado toda la documentación y código del proyecto para verificar si existe alguna implementación de plantillas de consentimiento editables por el usuario.

## Hallazgos

### ✅ Lo que SÍ está implementado:

1. **Personalización de PDFs** (doc/04-personalizacion/)
   - Logos personalizados (principal, footer, marca de agua)
   - Colores corporativos (6 colores configurables)
   - Información de empresa (nombre, dirección, teléfono, email, web)
   - Textos de títulos de secciones:
     * Título del consentimiento del procedimiento
     * Título del tratamiento de datos
     * Título de derechos de imagen
   - Texto del footer personalizable
   - Tamaño y posición del logo
   - Opacidad de marca de agua

2. **Edición de Consentimientos DRAFT** (doc/26-edicion-consentimientos-draft/)
   - Permite editar consentimientos que quedaron en estado DRAFT
   - Permite modificar datos del cliente, servicio, sede y respuestas
   - NO permite editar el contenido/texto del consentimiento en sí

### ❌ Lo que NO está implementado:

**Plantillas de Contenido de Consentimiento Editables**

El contenido de los consentimientos (declaraciones legales, textos de autorización) está **hardcodeado** en el archivo `backend/src/consents/pdf.service.ts`.

#### Ejemplos de texto hardcodeado:

**Declaración de Consentimiento del Procedimiento:**
```typescript
const declaration = [
  'Declaro que he sido informado(a) sobre el procedimiento/servicio mencionado,',
  'sus beneficios, riesgos y alternativas. Autorizo voluntariamente la realización',
  'del procedimiento/servicio descrito en este documento.',
];
```

**Tratamiento de Datos:**
```typescript
const content = [
  'De acuerdo con la Ley Estatutaria 1581 de 2.012 de Protección de Datos y sus normas',
  'reglamentarias, doy mi consentimiento, como Titular de los datos, para que éstos sean',
  `incorporados en una base de datos responsabilidad de ${consent.branch.name}, para que sean`,
  'tratados con arreglo a los siguientes criterios:',
  // ... más líneas
];
```

**Derechos de Imagen:**
```typescript
const content = [
  'Autorizo expresamente el uso de mi imagen, voz y/o cualquier otro dato de carácter',
  'personal que pueda ser captado en fotografías, videos o grabaciones realizadas durante',
  'el procedimiento/servicio.',
  // ... más líneas
];
```

## Conclusión

**NO existe actualmente un sistema de plantillas de consentimiento editables por el usuario.**

Los textos legales de los consentimientos están fijos en el código y requieren modificación del código fuente para cambiarlos.

## Recomendación de Implementación

Si deseas implementar plantillas de consentimiento editables, se necesitaría:

### 1. Base de Datos
Crear una tabla `consent_templates` con campos:
- `id` (UUID)
- `tenant_id` (FK a tenants)
- `name` (nombre de la plantilla)
- `type` (procedure, data_treatment, image_rights)
- `content` (texto de la plantilla con variables)
- `is_active` (boolean)
- `created_at`, `updated_at`

### 2. Backend
- Módulo `ConsentTemplatesModule`
- CRUD completo para gestionar plantillas
- Sistema de variables/placeholders (ej: `{{clientName}}`, `{{branchName}}`)
- Validación de plantillas
- Plantillas por defecto para nuevos tenants

### 3. Frontend
- Página de gestión de plantillas
- Editor de texto enriquecido (WYSIWYG o Markdown)
- Vista previa de plantillas
- Selector de variables disponibles
- Permisos: `view_templates`, `edit_templates`

### 4. Integración con PDF
- Modificar `pdf.service.ts` para cargar plantillas desde BD
- Reemplazar textos hardcodeados con contenido de plantillas
- Sistema de reemplazo de variables

### 5. Permisos
Agregar nuevos permisos:
- `VIEW_TEMPLATES`: Ver plantillas
- `CREATE_TEMPLATES`: Crear plantillas
- `EDIT_TEMPLATES`: Editar plantillas
- `DELETE_TEMPLATES`: Eliminar plantillas

## Archivos Relevantes

### Código Actual
- `backend/src/consents/pdf.service.ts` - Generación de PDFs con textos hardcodeados
- `backend/src/settings/settings.service.ts` - Personalización de PDFs (colores, logos)
- `frontend/src/pages/SettingsPage.tsx` - Configuración de personalización

### Documentación
- `doc/04-personalizacion/PLANTILLAS_PDF.md` - Personalización de PDFs
- `doc/04-personalizacion/PERSONALIZACION_PDF_COMPLETA.md` - Guía completa
- `doc/26-edicion-consentimientos-draft/README.md` - Edición de consentimientos DRAFT

## Estado

❌ **NO IMPLEMENTADO** - Las plantillas de contenido de consentimiento editables por el usuario no existen actualmente en el sistema.

✅ **IMPLEMENTADO** - Personalización visual de PDFs (logos, colores, títulos de secciones)

## Próximos Pasos

Si deseas implementar esta funcionalidad, puedo:
1. Crear el diseño de base de datos
2. Implementar el backend completo
3. Crear la interfaz de usuario
4. Integrar con el sistema de generación de PDFs
5. Agregar permisos y validaciones
6. Crear documentación

¿Te gustaría que proceda con la implementación de plantillas de consentimiento editables?
