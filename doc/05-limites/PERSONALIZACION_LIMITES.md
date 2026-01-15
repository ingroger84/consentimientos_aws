# Personalización de Límites de Planes

## Descripción

Sistema mejorado para permitir la personalización de límites de recursos en los planes de los tenants. El Super Admin puede ajustar los límites de cada tenant de forma individual, superando o reduciendo los límites base del plan seleccionado.

---

## Características Implementadas

### 1. Toggle de Personalización

**Ubicación**: Modal de creación/edición de tenant

**Funcionalidad**:
- Checkbox "Personalizar límites" que habilita/deshabilita la edición de límites
- Por defecto, los límites están bloqueados y se aplican automáticamente según el plan
- Al activar la personalización, todos los campos de límites se vuelven editables

### 2. Indicadores Visuales

**Límites del Plan Base**:
- Cuando la personalización está activa, se muestra un panel informativo azul
- Muestra los límites base del plan seleccionado para referencia
- Incluye botón "Restaurar límites del plan" para volver a los valores base

**Etiquetas en Campos**:
- Cada campo muestra el límite del plan base entre paréntesis
- Ejemplo: "Máximo de Usuarios (Plan: 5)"
- Solo visible cuando la personalización está desactivada

### 3. Estados de Campos

**Deshabilitados** (personalización OFF):
- Fondo gris claro
- Cursor "not-allowed"
- Valores bloqueados según el plan

**Habilitados** (personalización ON):
- Fondo blanco
- Totalmente editables
- Validaciones de rango aplicadas

### 4. Detección Automática

**Al Editar Tenant**:
- El sistema detecta automáticamente si los límites están personalizados
- Compara los límites actuales con los del plan base
- Si hay diferencias, activa automáticamente el toggle de personalización

---

## Flujo de Uso

### Crear Nuevo Tenant

1. **Seleccionar Plan**:
   - Elegir plan (Free, Basic, Professional, Enterprise, Custom)
   - Los límites se aplican automáticamente

2. **Personalizar (Opcional)**:
   - Activar checkbox "Personalizar límites"
   - Ajustar los valores según necesidades específicas
   - Ver límites base en panel informativo

3. **Guardar**:
   - Los límites personalizados se guardan en la base de datos
   - El tenant queda marcado con límites personalizados

### Editar Tenant Existente

1. **Abrir Modal de Edición**:
   - El sistema detecta si hay límites personalizados
   - Si los hay, activa automáticamente el toggle

2. **Modificar Límites**:
   - Ajustar valores según necesidad
   - O restaurar a límites del plan base

3. **Cambiar de Plan**:
   - Si se cambia el plan con personalización desactivada:
     - Los límites se actualizan al nuevo plan
   - Si se cambia con personalización activada:
     - Los límites personalizados se mantienen
     - Se muestra referencia del nuevo plan

---

## Validaciones

### Rangos Permitidos

```typescript
maxUsers: 1 - 10,000
maxBranches: 1 - 1,000
maxConsents: 1 - 1,000,000
maxServices: 1 - 1,000
maxQuestions: 1 - 1,000
storageLimitMb: 1 - 999,999
```

### Backend

Las validaciones están definidas en `CreateTenantDto`:

```typescript
@IsInt()
@Min(1)
@Max(10000)
@IsOptional()
maxUsers?: number;

@IsInt()
@Min(1)
@Max(1000000)
@IsOptional()
maxConsents?: number;

// ... etc
```

---

## Casos de Uso

### Caso 1: Cliente con Necesidades Especiales

**Escenario**: Cliente en plan Basic necesita más usuarios pero no todos los beneficios del plan Professional.

**Solución**:
1. Asignar plan Basic
2. Activar "Personalizar límites"
3. Aumentar `maxUsers` de 5 a 10
4. Mantener otros límites del plan Basic

**Resultado**: Cliente paga plan Basic pero tiene capacidad de 10 usuarios.

### Caso 2: Cliente en Período de Prueba

**Escenario**: Cliente quiere probar con límites reducidos antes de comprometerse.

**Solución**:
1. Asignar plan Professional
2. Activar "Personalizar límites"
3. Reducir temporalmente los límites
4. Después del trial, restaurar límites del plan

### Caso 3: Cliente Enterprise con Requisitos Únicos

**Escenario**: Gran hospital necesita configuración muy específica.

**Solución**:
1. Asignar plan Custom
2. Activar "Personalizar límites"
3. Configurar límites exactos según contrato
4. Ejemplo: 200 usuarios, 50 sedes, 20,000 consentimientos/mes

---

## Interfaz de Usuario

### Panel de Personalización

```
┌─────────────────────────────────────────────────────────┐
│ Límites del Plan                    ☑ Personalizar      │
│ Límites personalizados activos...                       │
├─────────────────────────────────────────────────────────┤
│ ℹ️ Límites base del plan Basic:                         │
│   Usuarios: 5    Sedes: 2    Consentimientos: 200      │
│   Servicios: 10  Preguntas: 20  Storage: 500 MB        │
│   [Restaurar límites del plan]                          │
├─────────────────────────────────────────────────────────┤
│ Máximo de Usuarios        Máximo de Sedes              │
│ [    10    ]              [    2     ]                  │
│                                                          │
│ Consentimientos/mes       Máximo de Servicios          │
│ [   200    ]              [   10    ]                   │
│                                                          │
│ Máximo de Preguntas       Almacenamiento (MB)          │
│ [    20    ]              [   500   ]                   │
└─────────────────────────────────────────────────────────┘
```

### Estados Visuales

**Personalización Desactivada**:
- Campos con fondo gris
- Etiquetas muestran límites del plan
- Valores no editables

**Personalización Activada**:
- Campos con fondo blanco
- Panel informativo azul visible
- Valores totalmente editables
- Botón de restaurar disponible

---

## Código Implementado

### Frontend

**Archivo**: `frontend/src/components/TenantFormModal.tsx`

**Estado Agregado**:
```typescript
const [customizeLimits, setCustomizeLimits] = useState(false);
```

**Función de Detección**:
```typescript
// Verificar si los límites están personalizados
const plan = plansService.getPlanById(plans, tenant.plan);
if (plan) {
  const isCustomized = 
    tenant.maxUsers !== plan.limits.users ||
    tenant.maxBranches !== plan.limits.branches ||
    tenant.maxConsents !== plan.limits.consents ||
    tenant.maxServices !== plan.limits.services ||
    tenant.maxQuestions !== plan.limits.questions ||
    tenant.storageLimitMb !== plan.limits.storageMb;
  setCustomizeLimits(isCustomized);
}
```

**Función de Restauración**:
```typescript
const resetToBaseLimits = () => {
  if (selectedPlan) {
    setFormData(prev => ({
      ...prev,
      maxUsers: selectedPlan.limits.users,
      maxBranches: selectedPlan.limits.branches,
      maxConsents: selectedPlan.limits.consents,
      maxServices: selectedPlan.limits.services,
      maxQuestions: selectedPlan.limits.questions,
      storageLimitMb: selectedPlan.limits.storageMb,
    }));
    setCustomizeLimits(false);
  }
};
```

### Backend

**No requiere cambios**: El backend ya soporta límites personalizados a través de `UpdateTenantDto` que hereda de `CreateTenantDto`.

---

## Mejores Prácticas

### Para Super Admins

1. **Documentar Personalizaciones**:
   - Anotar en metadata del tenant por qué se personalizaron límites
   - Mantener registro de cambios

2. **Revisar Periódicamente**:
   - Verificar si los límites personalizados siguen siendo necesarios
   - Considerar migrar a plan superior si es más apropiado

3. **Comunicar con Cliente**:
   - Informar al cliente sobre límites personalizados
   - Explicar diferencias con plan base

### Para Desarrollo

1. **Validaciones**:
   - Siempre validar rangos en backend
   - No confiar solo en validaciones de frontend

2. **Auditoría**:
   - Considerar agregar log de cambios de límites
   - Útil para análisis y soporte

3. **Migraciones**:
   - Al cambiar estructura de planes, considerar límites personalizados
   - Proveer scripts de migración si es necesario

---

## Consideraciones Técnicas

### Persistencia

Los límites personalizados se guardan directamente en las columnas del tenant:
- `max_users`
- `max_branches`
- `max_consents`
- `max_services`
- `max_questions`
- `storage_limit_mb`

No hay tabla separada de "personalizaciones", los valores simplemente difieren del plan base.

### Detección de Personalización

La detección se hace comparando valores actuales con los del plan:

```typescript
const isCustomized = 
  tenant.maxUsers !== plan.limits.users ||
  tenant.maxBranches !== plan.limits.branches ||
  // ... etc
```

### Cambio de Plan

Al cambiar de plan:
- **Sin personalización**: Límites se actualizan automáticamente
- **Con personalización**: Límites se mantienen, solo cambia la referencia del plan

---

## Testing

### Casos de Prueba

1. **Crear tenant sin personalización**:
   - ✅ Límites coinciden con plan
   - ✅ Campos deshabilitados
   - ✅ Toggle OFF

2. **Crear tenant con personalización**:
   - ✅ Límites personalizados se guardan
   - ✅ Campos habilitados
   - ✅ Toggle ON

3. **Editar tenant con límites estándar**:
   - ✅ Toggle OFF al abrir
   - ✅ Límites coinciden con plan

4. **Editar tenant con límites personalizados**:
   - ✅ Toggle ON al abrir
   - ✅ Panel informativo visible
   - ✅ Valores personalizados cargados

5. **Restaurar límites**:
   - ✅ Valores vuelven al plan base
   - ✅ Toggle se desactiva
   - ✅ Panel informativo desaparece

6. **Cambiar plan con personalización**:
   - ✅ Límites personalizados se mantienen
   - ✅ Referencia del plan se actualiza

---

## Futuras Mejoras

### Corto Plazo

- [ ] Agregar tooltip con explicación de cada límite
- [ ] Mostrar uso actual vs límite en el modal
- [ ] Agregar presets de personalización comunes

### Mediano Plazo

- [ ] Historial de cambios de límites
- [ ] Notificaciones al cliente cuando se modifican límites
- [ ] Sugerencias automáticas de plan según uso

### Largo Plazo

- [ ] Sistema de aprobación para cambios de límites
- [ ] Límites temporales (ej: aumentar por 1 mes)
- [ ] Análisis predictivo de necesidades de límites

---

## Conclusión

El sistema de personalización de límites proporciona flexibilidad total al Super Admin para ajustar los recursos de cada tenant según necesidades específicas, manteniendo la simplicidad de los planes base mientras permite casos de uso especiales.

La implementación sigue las mejores prácticas de UX:
- **Claridad**: Siempre se muestra qué es del plan y qué es personalizado
- **Seguridad**: Validaciones en frontend y backend
- **Reversibilidad**: Fácil volver a límites del plan base
- **Transparencia**: Detección automática de personalizaciones
