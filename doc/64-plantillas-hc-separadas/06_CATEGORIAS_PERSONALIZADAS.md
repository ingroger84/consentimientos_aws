# Categorías Personalizadas para Plantillas HC

## Resumen
Implementación de categorías personalizadas (texto libre) para plantillas de consentimiento de historias clínicas, reemplazando el enum fijo por un campo string flexible.

## Cambios Realizados

### 1. Backend - Entidad y DTOs

**Archivo**: `backend/src/medical-record-consent-templates/entities/mr-consent-template.entity.ts`

```typescript
// ANTES: Enum fijo
@Column({ type: 'enum', enum: MRTemplateCategory, nullable: true })
category: MRTemplateCategory;

// DESPUÉS: String flexible
@Column({ type: 'varchar', length: 100, nullable: true })
category: string;
```

**Archivo**: `backend/src/medical-record-consent-templates/dto/create-mr-consent-template.dto.ts`

```typescript
// ANTES: Enum validation
@IsEnum(MRTemplateCategory)
@IsOptional()
category?: MRTemplateCategory;

// DESPUÉS: String validation
@IsString()
@IsOptional()
@MaxLength(100)
category?: string;
```

### 2. Frontend - Input con Datalist

**Archivo**: `frontend/src/components/mr-consent-templates/CreateMRTemplateModal.tsx`

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Categoría
  </label>
  <input
    type="text"
    list="categories"
    {...register('category')}
    className="input"
    placeholder="Ej: Procedimiento, Anamnesis, o crea tu propia categoría..."
  />
  <datalist id="categories">
    <option value="general">General</option>
    <option value="procedure">Procedimiento</option>
    <option value="treatment">Tratamiento</option>
    <option value="anamnesis">Anamnesis</option>
    <option value="data-treatment">Tratamiento de Datos</option>
    <option value="image-rights">Derechos de Imagen</option>
  </datalist>
  <p className="text-xs text-gray-500 mt-1">
    Selecciona una categoría predefinida o escribe una personalizada
  </p>
</div>
```

### 3. Página de Listado - Filtros Dinámicos

**Archivo**: `frontend/src/pages/MRConsentTemplatesPage.tsx`

```typescript
// Obtener categorías únicas dinámicamente
const uniqueCategories = Array.from(
  new Set(templates.map(t => t.category).filter(Boolean))
).sort();

// Renderizar filtros dinámicos
{uniqueCategories.map(cat => (
  <button
    key={cat}
    onClick={() => setSelectedCategory(cat)}
    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
      selectedCategory === cat
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {cat}
  </button>
))}
```

### 4. Badges con Colores Predefinidos

```typescript
const getCategoryBadge = (category: string | undefined) => {
  if (!category) return null;

  const colors: Record<string, string> = {
    'general': 'bg-blue-100 text-blue-700',
    'procedure': 'bg-purple-100 text-purple-700',
    'treatment': 'bg-green-100 text-green-700',
    'anamnesis': 'bg-orange-100 text-orange-700',
    'data-treatment': 'bg-pink-100 text-pink-700',
    'image-rights': 'bg-indigo-100 text-indigo-700',
  };

  const colorClass = colors[category.toLowerCase()] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`px-2 py-1 rounded text-xs ${colorClass}`}>
      {category}
    </span>
  );
};
```

## Corrección del Error "Plantilla no encontrada"

### Problema Identificado
La tabla `medical_record_consent_templates` no existía en la base de datos porque:
1. TypeORM `synchronize: true` estaba habilitado pero el backend no se había reiniciado
2. La migración SQL no se había ejecutado

### Solución Aplicada

1. **Reiniciar el backend** para que TypeORM detecte la nueva entidad y cree la tabla automáticamente

2. **Verificar estructura de la tabla**:
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'medical_record_consent_templates';
```

3. **Verificar plantillas existentes**:
```sql
-- Plantillas del tenant
SELECT id, name, category, tenant_id 
FROM medical_record_consent_templates 
WHERE tenant_id = '661fc78c-b075-4249-b842-24514eb7bb5a';

-- Plantillas globales
SELECT id, name, category 
FROM medical_record_consent_templates 
WHERE tenant_id IS NULL;
```

### Resultado
- ✅ Tabla creada con 13 columnas
- ✅ 4 plantillas globales (Super Admin)
- ✅ 4 plantillas del tenant demo-medico
- ✅ Generación de consentimientos funcionando correctamente

## Beneficios

1. **Flexibilidad**: Los usuarios pueden crear sus propias categorías según sus necesidades
2. **Sugerencias**: Datalist HTML5 ofrece autocompletado sin restricciones
3. **Filtros Dinámicos**: La página de listado se adapta automáticamente a las categorías existentes
4. **Colores Predefinidos**: Categorías conocidas tienen colores específicos, personalizadas usan gris
5. **Compatibilidad**: Sistema funciona con categorías antiguas y nuevas sin migración de datos

## Archivos Modificados

### Backend
- `backend/src/medical-record-consent-templates/entities/mr-consent-template.entity.ts`
- `backend/src/medical-record-consent-templates/dto/create-mr-consent-template.dto.ts`
- `backend/src/medical-record-consent-templates/dto/update-mr-consent-template.dto.ts`
- `backend/src/medical-record-consent-templates/mr-consent-templates.controller.ts`
- `backend/src/medical-record-consent-templates/mr-consent-templates.module.ts`

### Frontend
- `frontend/src/components/mr-consent-templates/CreateMRTemplateModal.tsx`
- `frontend/src/components/mr-consent-templates/EditMRTemplateModal.tsx`
- `frontend/src/pages/MRConsentTemplatesPage.tsx`
- `frontend/src/components/medical-records/GenerateConsentModal.tsx`

### Scripts de Verificación
- `backend/check-mr-templates.js` - Verificar plantillas en BD
- `backend/check-mr-templates-structure.js` - Verificar estructura de tabla
- `backend/run-mr-templates-migration.js` - Ejecutar migración manual

## Pruebas Realizadas

1. ✅ Crear plantilla con categoría predefinida
2. ✅ Crear plantilla con categoría personalizada
3. ✅ Editar categoría de plantilla existente
4. ✅ Filtrar plantillas por categoría
5. ✅ Visualizar badges con colores correctos
6. ✅ Generar consentimiento desde HC con plantillas personalizadas
7. ✅ Traducción de categorías en modal de generación

## Notas Técnicas

- TypeORM usa camelCase para nombres de columnas por defecto
- La columna en BD es `category` (varchar 100)
- No se requiere migración de datos existentes
- Compatible con plantillas creadas antes del cambio
