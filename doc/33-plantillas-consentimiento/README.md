# Sistema de Plantillas de Consentimiento Editables

**Versión**: 11.0.0  
**Fecha**: 23 de enero de 2026

## Descripción

Sistema completo para gestionar plantillas de consentimiento editables por el usuario. Permite a los tenants personalizar completamente el contenido de los textos legales de los consentimientos sin necesidad de modificar código.

## Características Principales

### 1. Tipos de Plantillas

El sistema soporta 3 tipos de plantillas:

- **Consentimiento de Procedimiento** (`procedure`): Texto de autorización para procedimientos médicos/servicios
- **Tratamiento de Datos Personales** (`data_treatment`): Autorización según Ley 1581 de 2012
- **Derechos de Imagen** (`image_rights`): Autorización de uso de imagen y datos personales

### 2. Variables Dinámicas

Las plantillas soportan variables que se reemplazan automáticamente al generar el PDF:

| Variable | Descripción |
|----------|-------------|
| `{{clientName}}` | Nombre completo del cliente |
| `{{clientId}}` | Número de identificación |
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

### 3. Gestión de Plantillas

- **Crear**: Nuevas plantillas personalizadas
- **Editar**: Modificar contenido y configuración
- **Ver**: Vista previa del contenido
- **Activar/Desactivar**: Control de plantillas activas
- **Marcar como predeterminada**: Una plantilla por tipo como default
- **Eliminar**: Borrar plantillas (excepto la predeterminada)

### 4. Plantillas por Defecto

Al crear un tenant, se generan automáticamente 3 plantillas predeterminadas (una por cada tipo) con contenido legal estándar que cumple con la normativa colombiana.

## Arquitectura

### Backend

#### Entidad: `ConsentTemplate`

```typescript
{
  id: string;
  tenantId: string;
  name: string;
  type: 'procedure' | 'data_treatment' | 'image_rights';
  content: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Endpoints

- `GET /consent-templates` - Listar todas las plantillas
- `GET /consent-templates/:id` - Obtener una plantilla
- `GET /consent-templates/by-type/:type` - Plantillas por tipo
- `GET /consent-templates/default/:type` - Plantilla predeterminada por tipo
- `GET /consent-templates/variables` - Variables disponibles
- `POST /consent-templates` - Crear plantilla
- `PATCH /consent-templates/:id` - Actualizar plantilla
- `PATCH /consent-templates/:id/set-default` - Marcar como predeterminada
- `DELETE /consent-templates/:id` - Eliminar plantilla

#### Servicio: `ConsentTemplatesService`

Métodos principales:
- `create()` - Crear plantilla
- `findAll()` - Listar plantillas
- `findByType()` - Filtrar por tipo
- `findDefaultByType()` - Obtener plantilla predeterminada
- `update()` - Actualizar plantilla
- `setAsDefault()` - Marcar como predeterminada
- `remove()` - Eliminar plantilla
- `replaceVariables()` - Reemplazar variables en contenido
- `getAvailableVariables()` - Obtener lista de variables

### Frontend

#### Página Principal: `ConsentTemplatesPage`

Características:
- Lista de plantillas agrupadas por tipo
- Filtros por tipo de plantilla
- Indicadores visuales (activa, predeterminada)
- Acciones: Ver, Editar, Marcar como default, Eliminar

#### Modales

1. **CreateTemplateModal**: Crear nueva plantilla
   - Selector de tipo
   - Editor de contenido con sintaxis de variables
   - Helper de variables con inserción automática
   - Opciones de activación y default

2. **EditTemplateModal**: Editar plantilla existente
   - Mismas características que crear
   - Pre-carga datos existentes

3. **ViewTemplateModal**: Vista previa de plantilla
   - Muestra contenido formateado
   - Información de estado y fechas

4. **VariablesHelper**: Ayudante de variables
   - Lista todas las variables disponibles
   - Inserción con un clic
   - Copiar al portapapeles
   - Descripción de cada variable

## Permisos

Se agregaron 4 nuevos permisos:

- `VIEW_TEMPLATES`: Ver plantillas de consentimiento
- `CREATE_TEMPLATES`: Crear plantillas de consentimiento
- `EDIT_TEMPLATES`: Editar plantillas de consentimiento
- `DELETE_TEMPLATES`: Eliminar plantillas de consentimiento

### Asignación por Rol

- **SUPER_ADMIN**: Todos los permisos
- **ADMIN_GENERAL**: Todos los permisos
- **ADMIN_SEDE**: Ver y editar plantillas
- **OPERADOR**: Sin permisos de plantillas

## Integración con PDFs

El servicio `PdfService` se modificará para:

1. Cargar plantillas desde la base de datos en lugar de usar texto hardcodeado
2. Reemplazar variables dinámicas con datos reales del consentimiento
3. Usar la plantilla predeterminada de cada tipo
4. Mantener compatibilidad con personalización visual (logos, colores)

## Base de Datos

### Tabla: `consent_templates`

```sql
CREATE TABLE consent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenantId" UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type ENUM('procedure', 'data_treatment', 'image_rights') NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "isDefault" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "IDX_consent_templates_tenant" ON consent_templates("tenantId");
CREATE INDEX "IDX_consent_templates_type" ON consent_templates(type);
CREATE INDEX "IDX_consent_templates_active" ON consent_templates("isActive");
CREATE INDEX "IDX_consent_templates_default" ON consent_templates("isDefault");
```

## Archivos Creados

### Backend

```
backend/src/consent-templates/
├── dto/
│   ├── create-consent-template.dto.ts
│   └── update-consent-template.dto.ts
├── entities/
│   └── consent-template.entity.ts
├── consent-templates.controller.ts
├── consent-templates.service.ts
└── consent-templates.module.ts

backend/src/database/migrations/
└── 1737700000000-CreateConsentTemplatesTable.ts

backend/
└── add-template-permissions-and-defaults.sql
```

### Frontend

```
frontend/src/types/
└── template.ts

frontend/src/services/
└── template.service.ts

frontend/src/pages/
└── ConsentTemplatesPage.tsx

frontend/src/components/templates/
├── CreateTemplateModal.tsx
├── EditTemplateModal.tsx
├── ViewTemplateModal.tsx
└── VariablesHelper.tsx
```

## Instalación y Configuración

### 1. Ejecutar Migración

```bash
cd backend
npm run migration:run
```

### 2. Agregar Permisos y Plantillas por Defecto

```bash
psql -U postgres -d consentimientos -f add-template-permissions-and-defaults.sql
```

### 3. Compilar Backend

```bash
cd backend
npm run build
```

### 4. Compilar Frontend

```bash
cd frontend
npm run build
```

### 5. Reiniciar Backend

```bash
pm2 restart datagree-backend
```

## Uso

### Crear una Plantilla

1. Ir a "Plantillas" en el menú
2. Clic en "Nueva Plantilla"
3. Seleccionar tipo de plantilla
4. Ingresar nombre y descripción
5. Escribir contenido usando variables
6. Usar el helper de variables para insertar variables dinámicas
7. Marcar como activa y/o predeterminada
8. Guardar

### Editar una Plantilla

1. En la lista de plantillas, clic en el ícono de editar
2. Modificar el contenido
3. Guardar cambios

### Marcar como Predeterminada

1. Clic en el ícono de estrella
2. Confirmar acción
3. La plantilla se usará por defecto para nuevos consentimientos

## Ejemplo de Plantilla

```
DECLARACIÓN DE CONSENTIMIENTO

Yo, {{clientName}}, identificado(a) con {{clientId}}, declaro que he sido informado(a) sobre el procedimiento/servicio {{serviceName}} que se realizará en {{branchName}}.

He tenido la oportunidad de hacer preguntas y todas mis dudas han sido resueltas satisfactoriamente.

Autorizo voluntariamente la realización del procedimiento descrito en este documento.

Fecha: {{signDate}}
Hora: {{signTime}}

Sede: {{branchName}}
Dirección: {{branchAddress}}
Teléfono: {{branchPhone}}

Firma: _______________________
```

## Validaciones

- El nombre debe tener mínimo 3 caracteres
- El contenido debe tener mínimo 10 caracteres
- No se puede eliminar la plantilla predeterminada
- Solo puede haber una plantilla predeterminada por tipo
- Las variables deben usar el formato `{{nombreVariable}}`

## Beneficios

1. **100% Personalizable**: Los clientes pueden adaptar los textos a sus necesidades
2. **Sin Código**: No requiere modificar código fuente
3. **Multi-tenant**: Cada tenant tiene sus propias plantillas
4. **Cumplimiento Legal**: Plantillas por defecto cumplen normativa colombiana
5. **Variables Dinámicas**: Inserción automática de datos del consentimiento
6. **Versionamiento**: Historial de cambios con fechas de actualización
7. **Flexibilidad**: Múltiples plantillas por tipo, activar/desactivar según necesidad

## Próximos Pasos

1. Integrar con `PdfService` para usar plantillas en generación de PDFs
2. Agregar vista previa de PDF con plantilla aplicada
3. Agregar historial de versiones de plantillas
4. Agregar plantillas compartidas entre tenants (opcional)
5. Agregar editor WYSIWYG para facilitar edición

## Estado

✅ **IMPLEMENTADO** - Sistema completo de plantillas de consentimiento editables

**Pendiente**: Integración con generación de PDFs (próxima fase)
