# Personalización de Características de Planes

## Descripción

Sistema completo para gestionar las características (features) de cada tenant de forma individual. El Super Admin puede habilitar o deshabilitar funcionalidades específicas independientemente del plan base, proporcionando máxima flexibilidad.

---

## Características Implementadas

### 1. Toggle de Personalización de Features ✅

**Ubicación**: Modal de creación/edición de tenant (después de la sección de límites)

**Funcionalidad**:
- Checkbox "Personalizar características" que habilita/deshabilita la edición
- Por defecto, las características están bloqueadas según el plan
- Al activar, todos los checkboxes de features se vuelven editables

### 2. Características Gestionables ✅

**5 características principales**:

1. **Marca de agua en PDFs**
   - Descripción: Los PDFs generados incluirán una marca de agua
   - Por defecto: Activada en plan Free, desactivada en otros

2. **Personalización**
   - Descripción: Logo, colores y plantillas personalizadas
   - Por defecto: Desactivada en Free, activada en Basic+

3. **Reportes Avanzados**
   - Descripción: Estadísticas detalladas y exportación de datos
   - Por defecto: Desactivada en Free/Basic, activada en Professional+

4. **Acceso API**
   - Descripción: Integración con otros sistemas mediante API REST
   - Por defecto: Desactivada en Free/Basic, activada en Professional+

5. **Soporte Prioritario**
   - Descripción: Atención preferencial y tiempos de respuesta reducidos
   - Por defecto: Desactivada en Free/Basic, activada en Professional+

### 3. Panel Informativo ✅

**Cuando personalización está activa**:
- Panel azul con ícono de información
- Muestra características base del plan seleccionado
- Botón "Restaurar características del plan"
- Comparación clara entre plan base y personalización

### 4. Detección Automática ✅

**Al Editar Tenant**:
- Compara características actuales con las del plan
- Si hay diferencias, activa automáticamente el toggle
- Carga valores personalizados en los checkboxes

### 5. Función de Restauración ✅

**Botón "Restaurar características del plan"**:
- Vuelve todas las características a los valores del plan base
- Desactiva automáticamente el toggle
- Oculta el panel informativo

---

## Interfaz de Usuario

### Estado Deshabilitado (características del plan)

```
┌─────────────────────────────────────────────────────────┐
│ Características del Plan        ☐ Personalizar         │
│ Las características se establecen automáticamente...    │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐    │
│ │ Marca de agua en PDFs                      [✓] │ 🔒 │
│ │ Los PDFs generados incluirán una marca...       │    │
│ └─────────────────────────────────────────────────┘    │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Personalización                            [ ] │ 🔒 │
│ │ Logo, colores y plantillas personalizadas       │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Estado Habilitado (personalización activa)

```
┌─────────────────────────────────────────────────────────┐
│ Características del Plan        ☑ Personalizar         │
│ Características personalizadas activas...               │
├─────────────────────────────────────────────────────────┤
│ ℹ️ Características base del plan Basic:                │
│   Marca de agua: No                                     │
│   Personalización: Sí                                   │
│   Reportes avanzados: No                                │
│   Acceso API: No                                        │
│   Soporte prioritario: No                               │
│   [Restaurar características del plan]                  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐    │
│ │ Marca de agua en PDFs                      [✓] │ ✏️ │
│ │ Los PDFs generados incluirán una marca...       │    │
│ └─────────────────────────────────────────────────┘    │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Personalización                            [✓] │ ✏️ │
│ │ Logo, colores y plantillas personalizadas       │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Casos de Uso

### Caso 1: Habilitar Feature Premium en Plan Básico

**Escenario**: Cliente en plan Basic necesita acceso API pero no quiere pagar plan Professional completo.

**Solución**:
1. Editar tenant
2. Activar "Personalizar características"
3. Habilitar "Acceso API"
4. Mantener otras características del plan Basic
5. Guardar

**Resultado**: Cliente tiene acceso API pero paga plan Basic.

### Caso 2: Deshabilitar Marca de Agua Temporalmente

**Escenario**: Cliente en plan Free quiere probar sin marca de agua durante trial.

**Solución**:
1. Editar tenant
2. Activar "Personalizar características"
3. Deshabilitar "Marca de agua en PDFs"
4. Después del trial, restaurar características del plan

### Caso 3: Plan Enterprise con Configuración Específica

**Escenario**: Cliente enterprise quiere todas las features excepto API (por seguridad).

**Solución**:
1. Asignar plan Enterprise
2. Activar "Personalizar características"
3. Deshabilitar "Acceso API"
4. Mantener otras características activas

### Caso 4: Promoción Especial

**Escenario**: Ofrecer reportes avanzados gratis por 3 meses a clientes Basic.

**Solución**:
1. Editar tenants seleccionados
2. Activar "Personalizar características"
3. Habilitar "Reportes Avanzados"
4. Después de 3 meses, restaurar características del plan

---

## Características por Plan (Base)

| Característica | Free | Basic | Professional | Enterprise | Custom |
|----------------|------|-------|--------------|------------|--------|
| **Marca de agua** | ✅ Sí | ❌ No | ❌ No | ❌ No | ❌ No |
| **Personalización** | ❌ No | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| **Reportes avanzados** | ❌ No | ❌ No | ✅ Sí | ✅ Sí | ✅ Sí |
| **Acceso API** | ❌ No | ❌ No | ✅ Sí | ✅ Sí | ✅ Sí |
| **Soporte prioritario** | ❌ No | ❌ No | ✅ Sí | ✅ Sí | ✅ Sí |

---

## Código Implementado

### Frontend

**Archivo**: `frontend/src/components/TenantFormModal.tsx`

**Estado Agregado**:
```typescript
const [customizeFeatures, setCustomizeFeatures] = useState(false);
```

**Features en FormData**:
```typescript
features: {
  watermark: true,
  customization: false,
  advancedReports: false,
  apiAccess: false,
  prioritySupport: false,
}
```

**Handler de Cambios**:
```typescript
const handleFeatureChange = (featureName: string, value: boolean) => {
  setFormData(prev => ({
    ...prev,
    features: {
      ...prev.features,
      [featureName]: value,
    },
  }));
};
```

**Función de Restauración**:
```typescript
const resetToBaseFeatures = () => {
  if (selectedPlan) {
    setFormData(prev => ({
      ...prev,
      features: {
        watermark: selectedPlan.features.watermark,
        customization: selectedPlan.features.customization,
        advancedReports: selectedPlan.features.advancedReports,
        apiAccess: selectedPlan.features.apiAccess,
        prioritySupport: selectedPlan.features.prioritySupport,
      },
    }));
    setCustomizeFeatures(false);
  }
};
```

**Detección de Personalización**:
```typescript
const featuresCustomized =
  tenant.features?.watermark !== plan.features.watermark ||
  tenant.features?.customization !== plan.features.customization ||
  tenant.features?.advancedReports !== plan.features.advancedReports ||
  tenant.features?.apiAccess !== plan.features.apiAccess ||
  tenant.features?.prioritySupport !== plan.features.prioritySupport;
setCustomizeFeatures(featuresCustomized);
```

### Backend

**No requiere cambios**: El backend ya soporta features personalizadas a través del campo JSONB `features` en la tabla `tenants`.

---

## Flujo de Datos

### Crear Tenant

```
1. Usuario selecciona plan
   ↓
2. Características se aplican automáticamente
   ↓
3. Usuario activa "Personalizar características" (opcional)
   ↓
4. Usuario habilita/deshabilita features
   ↓
5. Backend guarda features en campo JSONB
```

### Editar Tenant

```
1. Modal se abre con datos del tenant
   ↓
2. Sistema compara features con plan base
   ↓
3. Si hay diferencias → Toggle ON
   ↓
4. Usuario puede modificar o restaurar
   ↓
5. Backend actualiza campo features
```

---

## Validaciones

### Frontend

- Checkboxes solo editables cuando `customizeFeatures` está activo
- Valores por defecto según plan seleccionado
- Validación de tipo boolean

### Backend

- Campo `features` es JSONB nullable
- Acepta cualquier combinación de características
- No hay validaciones estrictas (máxima flexibilidad)

---

## Persistencia

### Estructura en Base de Datos

```sql
-- Columna features en tabla tenants
features JSONB

-- Ejemplo de valor:
{
  "watermark": false,
  "customization": true,
  "advancedReports": true,
  "apiAccess": false,
  "prioritySupport": true
}
```

### Valores por Defecto

Si `features` es `null`, el sistema usa los valores del plan base.

---

## Mejores Prácticas

### Para Super Admins

✅ **Hacer**:
- Documentar por qué se personalizaron características
- Revisar periódicamente si siguen siendo necesarias
- Comunicar cambios al cliente
- Considerar impacto en facturación

❌ **Evitar**:
- Habilitar features premium sin justificación
- Olvidar restaurar después de promociones
- Deshabilitar features críticas sin consultar

### Para Desarrollo

✅ **Hacer**:
- Verificar features antes de mostrar funcionalidad
- Manejar casos donde features es null
- Documentar nuevas features agregadas
- Mantener consistencia con plan base

❌ **Evitar**:
- Asumir que todas las features están presentes
- Hardcodear verificaciones de features
- Ignorar features en lógica de negocio

---

## Integración con Sistema

### Verificación de Features en Código

**Backend**:
```typescript
// En cualquier servicio
const tenant = await this.tenantsRepository.findOne({ where: { id } });
const hasApiAccess = tenant.features?.apiAccess ?? false;

if (!hasApiAccess) {
  throw new ForbiddenException('API access not enabled for this tenant');
}
```

**Frontend**:
```typescript
// En cualquier componente
const { user } = useAuthStore();
const hasAdvancedReports = user?.tenant?.features?.advancedReports ?? false;

{hasAdvancedReports && (
  <AdvancedReportsSection />
)}
```

---

## Testing

### Checklist de Pruebas

- [x] Crear tenant sin personalización de features
  - Features coinciden con plan
  - Checkboxes deshabilitados
  - Toggle OFF

- [x] Crear tenant con personalización de features
  - Features personalizadas se guardan
  - Checkboxes habilitados
  - Toggle ON

- [x] Editar tenant con features estándar
  - Toggle OFF al abrir
  - Features coinciden con plan

- [x] Editar tenant con features personalizadas
  - Toggle ON al abrir
  - Panel informativo visible
  - Valores personalizados cargados

- [x] Restaurar features
  - Valores vuelven al plan base
  - Toggle se desactiva
  - Panel desaparece

- [x] Cambiar plan con personalización
  - Features personalizadas se mantienen
  - Referencia del plan se actualiza

- [x] Habilitar/deshabilitar features individuales
  - Cambios se reflejan inmediatamente
  - Se guardan correctamente

---

## Futuras Mejoras

### Corto Plazo (1-2 meses)

- [ ] Agregar más features configurables:
  - Dominio personalizado
  - White label
  - Tipo de backup (none/weekly/daily)
  - Límite de tasa de API
  
- [ ] Tooltips explicativos para cada feature
- [ ] Indicador visual de features "premium"
- [ ] Historial de cambios de features

### Mediano Plazo (3-6 meses)

- [ ] Sistema de dependencias entre features
  - Ej: API Access requiere Customization
- [ ] Features temporales (activar por X días)
- [ ] Notificaciones al cliente cuando se modifican
- [ ] Dashboard de uso de features

### Largo Plazo (6-12 meses)

- [ ] Marketplace de features adicionales
- [ ] Features con costo adicional
- [ ] A/B testing de features
- [ ] Analytics de uso de features

---

## Impacto en Funcionalidad

### Features que Afectan el Sistema

**Marca de agua**:
- Afecta: Generación de PDFs
- Ubicación: `backend/src/consents/pdf.service.ts`
- Verificación: Antes de generar PDF

**Personalización**:
- Afecta: Configuración de tenant
- Ubicación: `frontend/src/pages/SettingsPage.tsx`
- Verificación: Al cargar página de configuración

**Reportes Avanzados**:
- Afecta: Dashboard y estadísticas
- Ubicación: `frontend/src/pages/DashboardPage.tsx`
- Verificación: Al mostrar secciones avanzadas

**Acceso API**:
- Afecta: Endpoints de API
- Ubicación: Guards y middlewares
- Verificación: En cada request de API

**Soporte Prioritario**:
- Afecta: Sistema de tickets (futuro)
- Ubicación: Por implementar
- Verificación: Al crear ticket

---

## Conclusión

El sistema de personalización de características proporciona flexibilidad total para ajustar las funcionalidades de cada tenant independientemente de su plan base. Esto permite:

- **Casos especiales**: Atender necesidades únicas sin crear planes nuevos
- **Promociones**: Ofrecer features premium temporalmente
- **Pruebas**: Permitir que clientes prueben features antes de upgrade
- **Retención**: Mantener clientes ofreciendo features específicas

La implementación es intuitiva, segura y completamente reversible, siguiendo las mejores prácticas de UX y desarrollo.

**Estado**: ✅ Completamente implementado y funcional
