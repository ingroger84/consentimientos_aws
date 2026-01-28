# Prueba Manual - Categorías Personalizadas

## Estado Actual

Se han implementado categorías personalizadas para plantillas HC. El backend y frontend están actualizados, pero hay un error 500 al crear plantillas vía API que necesita investigación adicional.

## Prueba Manual Recomendada

### Paso 1: Acceder a la Aplicación
1. Abrir navegador en: `http://demo-medico.localhost:5173`
2. Iniciar sesión con:
   - Email: `admin@clinicademo.com`
   - Password: `Demo123!`

### Paso 2: Ir a Plantillas HC
1. En el menú lateral, hacer clic en "Plantillas HC"
2. Verificar que se carguen las plantillas existentes

### Paso 3: Crear Plantilla con Categoría Predefinida
1. Hacer clic en "Nueva Plantilla HC"
2. Llenar el formulario:
   - **Nombre**: `Test Procedimiento Quirúrgico`
   - **Descripción**: `Plantilla de prueba para procedimientos`
   - **Categoría**: Escribir `procedure` o seleccionar "Procedimiento" de las sugerencias
   - **Contenido**: 
   ```
   CONSENTIMIENTO - PROCEDIMIENTO QUIRÚRGICO
   
   Paciente: {{patientName}}
   Documento: {{patientIdNumber}}
   Procedimiento: {{procedureName}}
   
   Autorizo el procedimiento descrito.
   ```
3. Marcar "Plantilla activa" y "Requiere firma"
4. Hacer clic en "Crear Plantilla HC"

### Paso 4: Crear Plantilla con Categoría Personalizada
1. Hacer clic en "Nueva Plantilla HC"
2. Llenar el formulario:
   - **Nombre**: `Consentimiento Cirugía Estética`
   - **Descripción**: `Para procedimientos de cirugía estética`
   - **Categoría**: Escribir `Cirugía Estética` (texto libre, no está en las sugerencias)
   - **Contenido**:
   ```
   CONSENTIMIENTO INFORMADO - CIRUGÍA ESTÉTICA
   
   Yo, {{patientName}}, identificado con {{patientIdNumber}},
   autorizo la realización del procedimiento de cirugía estética.
   
   Diagnóstico: {{diagnosisDescription}}
   Procedimiento: {{procedureName}}
   Fecha: {{currentDate}}
   
   Firma: _______________________
   ```
3. Marcar "Plantilla activa" y "Requiere firma"
4. Hacer clic en "Crear Plantilla HC"

### Paso 5: Verificar Filtros
1. En la página de plantillas, abrir el filtro de "Categoría"
2. Verificar que aparezcan:
   - ✅ Todas las categorías
   - ✅ General
   - ✅ Procedimiento
   - ✅ Tratamiento
   - ✅ Anamnesis
   - ⭐ **Cirugía Estética** (categoría personalizada)

### Paso 6: Filtrar por Categoría Personalizada
1. Seleccionar "Cirugía Estética" en el filtro
2. Verificar que solo se muestre la plantilla con esa categoría
3. Verificar que el badge de la categoría se muestre en color gris (categoría personalizada)

### Paso 7: Editar Categoría
1. Hacer clic en el botón de editar de una plantilla
2. Cambiar la categoría a otra personalizada (ej: `Tratamiento Dental`)
3. Guardar cambios
4. Verificar que el filtro se actualice automáticamente con la nueva categoría

## Resultados Esperados

### ✅ Funcionalidades que Deben Funcionar:
1. Input de categoría muestra sugerencias al escribir
2. Se puede escribir cualquier texto como categoría
3. Categorías predefinidas tienen colores específicos:
   - 🔵 General (azul)
   - 🟣 Procedimiento (morado)
   - 🟢 Tratamiento (verde)
   - 🟠 Anamnesis (naranja)
4. Categorías personalizadas tienen badge gris
5. Filtro muestra todas las categorías (predefinidas + personalizadas)
6. Filtrado funciona correctamente
7. Se pueden crear múltiples plantillas con la misma categoría personalizada

### ❌ Problemas Conocidos:
- Error 500 al crear plantillas vía API (script automatizado)
- Necesita investigación adicional del error en el backend

## Verificación en Base de Datos

Si tienes acceso a PostgreSQL, puedes verificar:

```sql
-- Ver todas las categorías únicas
SELECT DISTINCT category 
FROM medical_record_consent_templates 
WHERE category IS NOT NULL 
  AND deleted_at IS NULL
ORDER BY category;

-- Contar plantillas por categoría
SELECT 
  category,
  COUNT(*) as total,
  COUNT(CASE WHEN is_active THEN 1 END) as activas
FROM medical_record_consent_templates 
WHERE deleted_at IS NULL 
GROUP BY category 
ORDER BY total DESC;

-- Ver plantillas con categorías personalizadas
SELECT 
  name,
  category,
  created_at
FROM medical_record_consent_templates 
WHERE category NOT IN ('general', 'procedure', 'treatment', 'anamnesis')
  AND category IS NOT NULL
  AND deleted_at IS NULL
ORDER BY created_at DESC;
```

## Próximos Pasos

1. ✅ Probar creación manual desde el frontend
2. ❌ Investigar error 500 en API (pendiente)
3. ⏳ Considerar agregar normalización de categorías (minúsculas)
4. ⏳ Agregar endpoint para obtener categorías únicas del tenant
5. ⏳ Implementar gestión de categorías (renombrar/fusionar)

## Notas Técnicas

### Cambios Implementados:
- Backend: Campo `category` cambiado de enum a `string`
- Frontend: Input con `datalist` para sugerencias
- Filtros dinámicos que detectan categorías personalizadas
- Badges con colores predefinidos y fallback

### Archivos Modificados:
- `backend/src/medical-record-consent-templates/entities/mr-consent-template.entity.ts`
- `backend/src/medical-record-consent-templates/dto/create-mr-consent-template.dto.ts`
- `backend/src/medical-record-consent-templates/mr-consent-templates.controller.ts`
- `frontend/src/services/mr-consent-template.service.ts`
- `frontend/src/components/mr-consent-templates/CreateMRTemplateModal.tsx`
- `frontend/src/components/mr-consent-templates/EditMRTemplateModal.tsx`
- `frontend/src/pages/MRConsentTemplatesPage.tsx`

---

**Fecha**: 26 de enero de 2026  
**Estado**: Listo para prueba manual  
**Prioridad**: Alta
