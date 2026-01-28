# Modal de Editar Tenant en Dashboard - Actualización

## Resumen Visual

### Antes
```
┌─────────────────────────────────────┐
│      Editar Tenant            [X]   │
├─────────────────────────────────────┤
│                                     │
│  Nombre: [Demo Santi          ]    │
│                                     │
│  Plan: [Emprendedor ▼]             │
│                                     │
│  ┌─────────┬─────────┬─────────┐   │
│  │Máx.     │Máx.     │Máx.     │   │
│  │Usuarios │Sedes    │Consents │   │
│  │[3]      │[2]      │[80]     │   │
│  └─────────┴─────────┴─────────┘   │
│                                     │
│  [Cancelar]  [Guardar Cambios]     │
└─────────────────────────────────────┘
```

### Después
```
┌─────────────────────────────────────┐
│      Editar Tenant            [X]   │
├─────────────────────────────────────┤
│                                     │
│  Nombre: [Demo Santi          ]    │
│                                     │
│  Plan: [Emprendedor ▼]             │
│                                     │
│  ┌─────────┬─────────┬─────────┐   │
│  │Máx.     │Máx.     │Máx.     │   │
│  │Usuarios │Sedes    │Consents │   │
│  │[3]      │[2]      │[80]     │   │
│  └─────────┴─────────┴─────────┘   │
│                                     │
│  ┌─────────┬─────────┬─────────┐   │
│  │Máx.     │Máx.     │Máx.     │   │
│  │HC       │Plant HC │Plant CN │   │
│  │[100]    │[10]     │[15]     │   │
│  │-1=ilim  │-1=ilim  │-1=ilim  │   │
│  └─────────┴─────────┴─────────┘   │
│                                     │
│  [Cancelar]  [Guardar Cambios]     │
└─────────────────────────────────────┘
```

## Características Implementadas

### 1. Nuevos Campos
- **Máx. Historias Clínicas**: Control del límite de HC por tenant
- **Máx. Plantillas HC**: Control del límite de plantillas de HC
- **Máx. Plantillas CN**: Control del límite de plantillas de consentimientos

### 2. Soporte para Ilimitados
- Valor `-1` indica recursos ilimitados
- Texto de ayuda visible: "-1 = ilimitadas"
- Validación de valores mínimos

### 3. Layout Mejorado
- Grid de 3 columnas x 2 filas
- Organización lógica de recursos
- Espaciado consistente

## Flujo de Uso

### Edición Rápida desde Dashboard

1. **Abrir Modal**
   - Usuario hace click en botón de editar (✏️) en la tabla
   - Modal se abre con datos actuales del tenant

2. **Modificar Límites**
   - Usuario puede cambiar cualquier límite
   - Valores se actualizan en tiempo real
   - Validación de valores mínimos (-1 o mayor)

3. **Guardar Cambios**
   - Click en "Guardar Cambios"
   - Request al backend con todos los campos
   - Tabla se actualiza automáticamente
   - Toast de confirmación

4. **Cancelar**
   - Click en "Cancelar" o [X]
   - Modal se cierra sin guardar
   - Datos originales se mantienen

## Integración con Backend

### Request de Actualización
```typescript
await tenantsService.update(tenantId, {
  name: string,
  maxUsers: number,
  maxBranches: number,
  maxConsents: number,
  maxMedicalRecords: number,      // Nuevo
  maxMRConsentTemplates: number,  // Nuevo
  maxConsentTemplates: number,    // Nuevo
  plan: string
});
```

### Respuesta
- Tenant actualizado con nuevos valores
- Tabla se recarga automáticamente
- Barras de progreso se actualizan
- Porcentajes se recalculan

## Validaciones

### Frontend
- Valores mínimos: -1 (ilimitado)
- Tipo: number
- Requerido: No (opcional con valor por defecto 0)

### Backend
- Validación de tipos
- Validación de rangos
- Actualización de registros existentes

## Diferencias entre Modales

### Modal Principal (TenantFormModal)
- Formulario completo con todas las opciones
- Vista previa del plan seleccionado
- Personalización de límites con toggle
- Restauración de límites base
- Información de contacto
- Usuario administrador (solo crear)

### Modal del Dashboard (TenantTableSection)
- Formulario simplificado
- Solo campos esenciales
- Edición rápida de límites
- Sin vista previa de plan
- Sin opciones avanzadas

## Casos de Uso

### 1. Aumentar Límite de HC
```
Escenario: Tenant alcanzó límite de HC
Acción: Editar tenant desde dashboard
Cambio: maxMedicalRecords: 100 → 200
Resultado: Tenant puede crear más HC
```

### 2. Establecer Plantillas Ilimitadas
```
Escenario: Tenant empresarial necesita plantillas ilimitadas
Acción: Editar tenant desde dashboard
Cambio: maxMRConsentTemplates: 10 → -1
Resultado: Tenant puede crear plantillas sin límite
```

### 3. Ajuste Rápido de Múltiples Límites
```
Escenario: Cambio de plan requiere ajustar límites
Acción: Editar tenant desde dashboard
Cambios:
  - maxMedicalRecords: 30 → 100
  - maxMRConsentTemplates: 5 → 10
  - maxConsentTemplates: 10 → 15
Resultado: Todos los límites actualizados en una operación
```

## Beneficios

### Para Administradores
- Edición rápida sin salir del dashboard
- Vista completa de recursos en la tabla
- Cambios inmediatos visibles
- Menos clicks para ajustar límites

### Para el Sistema
- Consistencia entre modales
- Validación centralizada
- Actualización eficiente
- Mantenimiento simplificado

## Notas Técnicas

### Estado del Modal
```typescript
const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
```

### Actualización de Estado
```typescript
onChange={(e) => setEditingTenant({ 
  ...editingTenant, 
  maxMedicalRecords: parseInt(e.target.value) 
})}
```

### Valores por Defecto
```typescript
value={editingTenant.maxMedicalRecords || 0}
value={editingTenant.maxMRConsentTemplates || 0}
value={editingTenant.maxConsentTemplates || 0}
```

## Próximos Pasos

1. ✅ Implementar campos en modal del dashboard
2. ✅ Actualizar interface Tenant
3. ✅ Actualizar función handleSaveEdit
4. ✅ Agregar validaciones
5. ⏳ Probar en navegador
6. ⏳ Verificar integración con backend
7. ⏳ Validar actualización de tabla

## Conclusión

El modal de editar tenant en el dashboard ahora permite gestionar todos los recursos del sistema de forma rápida y eficiente. La implementación mantiene la simplicidad del modal original mientras agrega las capacidades necesarias para los nuevos recursos de HC y plantillas.
