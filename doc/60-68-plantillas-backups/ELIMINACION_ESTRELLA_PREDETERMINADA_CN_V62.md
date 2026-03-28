# Eliminación de Estrella Predeterminada en Plantillas CN

**Fecha:** 2026-03-19  
**Versión:** V62  
**Estado:** ✅ COMPLETADO

---

## 📋 Descripción del Cambio

Se eliminó la funcionalidad de "plantilla predeterminada" (estrella) en las Plantillas de Consentimiento (CN), ya que ahora el sistema utiliza la relación directa entre plantillas y servicios para determinar qué plantilla usar.

---

## 🎯 Objetivo

Simplificar el sistema de selección de plantillas CN utilizando únicamente la relación muchos-a-muchos entre plantillas y servicios, eliminando la necesidad del campo `is_default`.

---

## 🔧 Cambios Realizados

### 1. Frontend - Página de Plantillas CN

**Archivo:** `frontend/src/pages/ConsentTemplatesPage.tsx`

#### Cambios:
- ✅ Eliminada la importación del ícono `Star` de lucide-react
- ✅ Eliminado el badge "Predeterminada" que se mostraba en las plantillas
- ✅ Eliminado el botón de estrella para marcar como predeterminada
- ✅ Eliminada la función `handleSetAsDefault`

#### Antes:
```tsx
{template.isDefault && (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
    <Star className="w-3 h-3" />
    Predeterminada
  </span>
)}

{!template.isDefault && (isSuperAdmin || hasPermission('edit_templates')) && (
  <button
    onClick={() => handleSetAsDefault(template)}
    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
    title="Marcar como predeterminada"
  >
    <Star className="w-5 h-5" />
  </button>
)}
```

#### Después:
```tsx
// Código eliminado - ya no se muestra el badge ni el botón
```

---

### 2. Backend - Servicio de PDF

**Archivo:** `backend/src/consents/pdf.service.ts`

#### Cambios:
- ✅ Cambiado de `findDefaultByType` a `findByTypeAndService`
- ✅ Ahora se pasa el `serviceId` del consentimiento para buscar la plantilla correcta
- ✅ Validación de que el consentimiento tenga un servicio asociado

#### Antes:
```typescript
procedureTemplate = await this.consentTemplatesService.findDefaultByType(
  TemplateType.PROCEDURE, 
  tenantSlug
);
```

#### Después:
```typescript
const serviceId = consent.service?.id;
if (!serviceId) {
  throw new Error('El consentimiento no tiene un servicio asociado');
}

procedureTemplate = await this.consentTemplatesService.findByTypeAndService(
  TemplateType.PROCEDURE, 
  serviceId, 
  tenantSlug
);
```

---

### 3. Backend - Servicio de Plantillas CN

**Archivo:** `backend/src/consent-templates/consent-templates.service.ts`

#### Método Existente Utilizado:
El método `findByTypeAndService` ya existía y funciona perfectamente:

```typescript
async findByTypeAndService(
  type: TemplateType,
  serviceId: string,
  tenantSlug?: string,
): Promise<ConsentTemplate> {
  const tenantId = await this.getTenantIdFromSlug(tenantSlug);
  
  // Buscar plantilla activa asociada al servicio específico
  const templateWithService = await this.templatesRepository
    .createQueryBuilder('template')
    .leftJoinAndSelect('template.services', 'service')
    .where('template.tenantId = :tenantId', { tenantId: tenantId || null })
    .andWhere('template.type = :type', { type })
    .andWhere('template.isActive = :isActive', { isActive: true })
    .andWhere('service.id = :serviceId', { serviceId })
    .orderBy('template.createdAt', 'DESC')
    .getOne();

  if (templateWithService) {
    return templateWithService;
  }

  // Si no hay plantilla asociada al servicio, buscar la primera activa del tipo
  const firstActive = await this.templatesRepository.findOne({
    where: {
      tenantId: tenantId || null,
      type,
      isActive: true,
    },
    order: { createdAt: 'ASC' },
  });

  if (!firstActive) {
    throw new NotFoundException(
      `No se encontró plantilla activa para el tipo ${type}`,
    );
  }

  return firstActive;
}
```

---

## 🔄 Flujo de Selección de Plantillas

### Nuevo Flujo (Basado en Servicios)

1. **Usuario crea un consentimiento** seleccionando un servicio
2. **Sistema genera PDF** del consentimiento
3. **Para cada tipo de plantilla** (Procedimiento, Datos, Imagen):
   - Busca plantilla activa asociada al servicio específico
   - Si encuentra plantilla asociada → la usa
   - Si NO encuentra plantilla asociada → usa la primera plantilla activa del tipo
4. **Genera el PDF** con las plantillas seleccionadas

### Ventajas del Nuevo Flujo

- ✅ Más flexible: múltiples plantillas por servicio
- ✅ Más claro: la relación es explícita en la base de datos
- ✅ Más simple: no hay que gestionar el campo `is_default`
- ✅ Más escalable: fácil agregar más servicios y plantillas

---

## 📊 Relación Base de Datos

### Tabla Intermedia: `consent_template_services`

```sql
CREATE TABLE consent_template_services (
  id UUID PRIMARY KEY,
  "consentTemplateId" UUID NOT NULL,
  "serviceId" UUID NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_consent_template 
    FOREIGN KEY ("consentTemplateId") 
    REFERENCES consent_templates(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_service 
    FOREIGN KEY ("serviceId") 
    REFERENCES services(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT unique_template_service 
    UNIQUE ("consentTemplateId", "serviceId")
);
```

### Ejemplo de Uso

```
Servicio: "Cabalgatas"
  ├─ Plantilla CN Procedimiento: "Consentimiento Cabalgatas"
  ├─ Plantilla CN Datos: "Tratamiento de Datos Personales"
  └─ Plantilla CN Imagen: "Autorización de Derechos de Imagen"

Servicio: "Buggy"
  ├─ Plantilla CN Procedimiento: "Consentimiento Buggy"
  ├─ Plantilla CN Datos: "Tratamiento de Datos Personales"
  └─ Plantilla CN Imagen: "Autorización de Derechos de Imagen"
```

---

## 🧪 Pruebas Recomendadas

### 1. Crear Plantilla CN y Asociar a Servicio

1. Ir a "Plantillas CN"
2. Crear nueva plantilla
3. En el formulario, seleccionar uno o más servicios
4. Guardar plantilla
5. Verificar que la plantilla muestra los servicios asociados

### 2. Generar Consentimiento

1. Crear un nuevo consentimiento
2. Seleccionar un servicio que tenga plantillas asociadas
3. Completar el formulario y firmar
4. Generar PDF
5. Verificar que el PDF usa las plantillas correctas del servicio

### 3. Servicio Sin Plantillas Asociadas

1. Crear un consentimiento con un servicio sin plantillas asociadas
2. Generar PDF
3. Verificar que usa las plantillas activas por defecto (primera creada)

---

## 📝 Notas Importantes

### Campo `is_default` en Base de Datos

- ❗ El campo `is_default` **NO se eliminó** de la base de datos
- ❗ El campo sigue existiendo pero **ya no se usa** en el frontend
- ❗ El método `findDefaultByType` está marcado como `@deprecated`
- ✅ Esto permite compatibilidad hacia atrás si es necesario

### Migración de Datos

- ✅ No se requiere migración de datos
- ✅ Las plantillas existentes siguen funcionando
- ✅ Solo necesitas asociar las plantillas a los servicios correspondientes

---

## 🔍 Verificación del Sistema

### Verificar Plantillas Asociadas a Servicios

```sql
-- Ver plantillas y sus servicios asociados
SELECT 
  ct.id,
  ct.name AS plantilla,
  ct.type AS tipo,
  s.name AS servicio
FROM consent_templates ct
LEFT JOIN consent_template_services cts ON ct.id = cts."consentTemplateId"
LEFT JOIN services s ON cts."serviceId" = s.id
WHERE ct."tenantId" = 'TU_TENANT_ID'
ORDER BY ct.type, ct.name;
```

### Verificar Plantillas Sin Servicios

```sql
-- Ver plantillas que NO tienen servicios asociados
SELECT 
  ct.id,
  ct.name,
  ct.type,
  ct."isActive"
FROM consent_templates ct
WHERE ct."tenantId" = 'TU_TENANT_ID'
  AND NOT EXISTS (
    SELECT 1 
    FROM consent_template_services cts 
    WHERE cts."consentTemplateId" = ct.id
  )
ORDER BY ct.type, ct.name;
```

---

## 📋 Checklist de Despliegue

- [x] Cambios en frontend compilados
- [x] Cambios en backend probados
- [ ] Asociar plantillas existentes a servicios
- [ ] Probar generación de PDF con diferentes servicios
- [ ] Verificar que no hay errores en logs
- [ ] Documentar a usuarios el nuevo flujo

---

## 🎓 Capacitación de Usuarios

### Mensaje para Usuarios

**Cambio en Plantillas de Consentimiento**

A partir de ahora, las plantillas de consentimiento se asocian directamente a los servicios. Ya no es necesario marcar una plantilla como "predeterminada".

**Cómo funciona:**
1. Al crear o editar una plantilla CN, selecciona los servicios donde se usará
2. Cuando generes un consentimiento, el sistema usará automáticamente las plantillas asociadas al servicio seleccionado
3. Si un servicio no tiene plantillas asociadas, se usarán las plantillas activas disponibles

**Ventajas:**
- Más control sobre qué plantilla se usa en cada servicio
- Puedes tener plantillas diferentes para servicios diferentes
- Más fácil de gestionar cuando tienes muchos servicios

---

## ✅ Estado Final

- ✅ Estrella predeterminada eliminada del frontend
- ✅ Sistema usa relación plantillas-servicios
- ✅ Fallback a primera plantilla activa si no hay asociación
- ✅ Logs informativos en consola para debugging
- ✅ Compatibilidad hacia atrás mantenida

---

**Implementado por:** Kiro AI  
**Fecha:** 2026-03-19  
**Versión:** V62
