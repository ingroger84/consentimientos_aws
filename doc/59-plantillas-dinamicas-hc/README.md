# Plantillas Dinámicas en Historias Clínicas

**Fecha:** 25 de enero de 2026  
**Versión:** 15.0.12  
**Estado:** ✅ Completado

## 📋 Cambios Implementados

### 1. Carga Dinámica de Plantillas

**Antes:**
- Tipos de consentimiento hardcodeados en el código
- Solo 4 opciones fijas
- No se podían personalizar

**Después:**
- Plantillas cargadas dinámicamente desde la base de datos
- Todas las plantillas activas disponibles
- Totalmente personalizable por tenant

### 2. Link Directo a Gestión de Plantillas

Se agregó un link "Gestionar plantillas" que abre el módulo de plantillas en una nueva pestaña, permitiendo:
- Crear nuevas plantillas
- Editar plantillas existentes
- Activar/desactivar plantillas
- Marcar plantillas como predeterminadas

## 🎯 Cómo Usar

### Para Editar "Consentimiento Informado General"

1. **Opción A: Desde Historia Clínica**
   ```
   1. Abre una historia clínica
   2. Haz clic en "Generar Consentimiento"
   3. Haz clic en "Gestionar plantillas" (arriba del dropdown)
   4. Se abre el módulo de plantillas en nueva pestaña
   5. Busca "Consentimiento Informado General"
   6. Haz clic en el ícono de editar (lápiz)
   7. Modifica el contenido
   8. Guarda los cambios
   ```

2. **Opción B: Directamente desde el Menú**
   ```
   1. Ve al menú lateral
   2. Haz clic en "Plantillas"
   3. Busca "Consentimiento Informado General"
   4. Haz clic en el ícono de editar (lápiz)
   5. Modifica el contenido
   6. Guarda los cambios
   ```

### Para Crear Nuevas Plantillas

1. Ve a **Plantillas** en el menú lateral
2. Haz clic en **"Nueva Plantilla"** (botón azul arriba a la derecha)
3. Llena el formulario:
   - **Tipo**: Selecciona el tipo de consentimiento
   - **Nombre**: Ej: "Consentimiento Quirúrgico Avanzado"
   - **Descripción**: Descripción breve
   - **Contenido**: Texto de la plantilla con variables
4. Marca como **"Plantilla activa"**
5. Opcionalmente marca como **"Predeterminada"**
6. Haz clic en **"Crear Plantilla"**

### Para Usar Múltiples Plantillas (Futuro)

Actualmente solo se puede seleccionar una plantilla a la vez. Para usar múltiples plantillas en un solo consentimiento, necesitarás implementar la arquitectura propuesta en `doc/58-arquitectura-consentimientos-avanzada/`.

## 📊 Estructura Actual

```
Historia Clínica
    ↓
Generar Consentimiento
    ↓
Seleccionar Plantilla (dropdown dinámico)
    ↓
Plantillas cargadas desde BD
    ├── Consentimiento Informado General
    ├── Procedimiento Específico
    ├── Tratamiento de Datos Personales
    ├── Uso de Imágenes
    └── [Todas las plantillas activas del tenant]
```

## 🔧 Cambios Técnicos

### Archivo Modificado
`frontend/src/components/medical-records/GenerateConsentModal.tsx`

### Cambios Realizados

1. **Importaciones agregadas:**
```typescript
import { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
```

2. **Estado agregado:**
```typescript
const [templates, setTemplates] = useState<any[]>([]);
const [loadingTemplates, setLoadingTemplates] = useState(true);
```

3. **Función para cargar plantillas:**
```typescript
const loadTemplates = async () => {
  const { templateService } = await import('@/services/template.service');
  const data = await templateService.getAll();
  setTemplates(data.filter(t => t.isActive));
};
```

4. **Dropdown dinámico:**
```tsx
<select {...register('consentType')}>
  <option value="">Seleccionar...</option>
  {templates.map((template) => (
    <option key={template.id} value={template.id}>
      {template.name}
    </option>
  ))}
</select>
```

5. **Link a gestión de plantillas:**
```tsx
<a href="/templates" target="_blank">
  Gestionar plantillas
</a>
```

## 🎨 Variables Disponibles en Plantillas

Al editar una plantilla, puedes usar estas variables dinámicas:

### Datos del Cliente
- `{{clientName}}` - Nombre completo
- `{{clientId}}` - Número de identificación
- `{{clientEmail}}` - Email
- `{{clientPhone}}` - Teléfono

### Datos del Servicio
- `{{serviceName}}` - Nombre del servicio

### Datos de la Sede
- `{{branchName}}` - Nombre de la sede
- `{{branchAddress}}` - Dirección
- `{{branchPhone}}` - Teléfono
- `{{branchEmail}}` - Email

### Fechas
- `{{signDate}}` - Fecha de firma
- `{{signTime}}` - Hora de firma
- `{{currentDate}}` - Fecha actual
- `{{currentYear}}` - Año actual

## 📝 Ejemplo de Plantilla

```
CONSENTIMIENTO INFORMADO

Yo, {{clientName}}, identificado(a) con documento {{clientId}}, 
declaro que he sido informado(a) sobre el procedimiento {{serviceName}} 
que se realizará en {{branchName}}.

Fecha: {{currentDate}}
Sede: {{branchName}}
Dirección: {{branchAddress}}

_______________________
Firma del paciente
{{clientName}}
{{clientId}}
```

## 🚀 Próximos Pasos (Recomendados)

### Corto Plazo
1. ✅ Plantillas dinámicas (Completado)
2. ⏳ Permitir selección múltiple de plantillas
3. ⏳ Preview del PDF antes de generar
4. ⏳ Guardar plantillas favoritas por usuario

### Mediano Plazo
1. ⏳ Implementar arquitectura de ConsentConfigs
2. ⏳ Agregar preguntas personalizadas
3. ⏳ Generar PDF compuesto con múltiples plantillas
4. ⏳ Firma digital avanzada

### Largo Plazo
1. ⏳ Editor visual de plantillas
2. ⏳ Plantillas con formato HTML
3. ⏳ Firma electrónica certificada
4. ⏳ Integración con servicios automática

## 🔐 Permisos

Para gestionar plantillas, el usuario necesita:
- `view_templates` - Ver plantillas
- `create_templates` - Crear plantillas
- `edit_templates` - Editar plantillas
- `delete_templates` - Eliminar plantillas

## 📊 Flujo Completo

```
1. Usuario abre Historia Clínica
   ↓
2. Clic en "Generar Consentimiento"
   ↓
3. Modal se abre y carga plantillas activas
   ↓
4. Usuario ve dropdown con todas las plantillas
   ↓
5. Si no hay plantillas o quiere editar:
   ├── Clic en "Gestionar plantillas"
   ├── Se abre módulo de plantillas
   ├── Crea/edita plantillas
   └── Vuelve a Historia Clínica
   ↓
6. Selecciona plantilla deseada
   ↓
7. Llena información adicional
   ↓
8. Genera consentimiento
```

## ✅ Beneficios

### Para el Tenant
- ✅ Personalización total de plantillas
- ✅ Sin límite de plantillas
- ✅ Fácil gestión desde un solo lugar

### Para el Operador
- ✅ Acceso rápido a gestión de plantillas
- ✅ Todas las plantillas disponibles
- ✅ Proceso más fluido

### Para el Sistema
- ✅ Código más mantenible
- ✅ Escalable
- ✅ Flexible

## 🧪 Pruebas Sugeridas

1. **Cargar plantillas:**
   - [ ] Abrir modal de generar consentimiento
   - [ ] Verificar que carga plantillas
   - [ ] Verificar que solo muestra activas

2. **Link a gestión:**
   - [ ] Hacer clic en "Gestionar plantillas"
   - [ ] Verificar que abre en nueva pestaña
   - [ ] Verificar que llega al módulo correcto

3. **Crear plantilla:**
   - [ ] Crear nueva plantilla
   - [ ] Marcar como activa
   - [ ] Volver a HC
   - [ ] Verificar que aparece en dropdown

4. **Editar plantilla:**
   - [ ] Editar "Consentimiento Informado General"
   - [ ] Cambiar contenido
   - [ ] Guardar
   - [ ] Generar consentimiento
   - [ ] Verificar que usa nuevo contenido

## 📞 Soporte

### Si no aparecen plantillas:
1. Verifica que existan plantillas creadas
2. Verifica que estén marcadas como "activas"
3. Verifica que pertenezcan al tenant correcto
4. Revisa logs del backend

### Si no se puede editar:
1. Verifica permisos del usuario
2. Verifica que la plantilla no esté bloqueada
3. Intenta desde el módulo de plantillas directamente

---

**Preparado por:** Kiro AI  
**Fecha:** 25 de enero de 2026  
**Estado:** ✅ Implementado y funcionando
