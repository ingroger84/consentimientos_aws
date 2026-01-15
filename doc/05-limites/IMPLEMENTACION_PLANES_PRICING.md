# 💼 Implementación de Planes y Pricing

## Resumen

Sistema completo de planes de suscripción con límites por recursos y pricing en pesos colombianos (COP).

## Fecha de Implementación

Enero 2026

---

## 📋 Planes Implementados

### 🆓 Plan GRATUITO
- **Precio**: $0 COP/mes
- **Límites**:
  - 2 usuarios
  - 1 sede
  - 50 consentimientos/mes
  - 3 servicios médicos
  - 5 preguntas personalizadas
  - 100 MB almacenamiento
- **Features**: Marca de agua en PDFs, soporte 48h

### 🥉 Plan BÁSICO
- **Precio**: $89,900 COP/mes | $899,000 COP/año
- **Límites**:
  - 5 usuarios
  - 2 sedes
  - 200 consentimientos/mes
  - 10 servicios médicos
  - 20 preguntas personalizadas
  - 500 MB almacenamiento
- **Features**: Sin marca de agua, personalización básica, soporte 24h

### 🥈 Plan PROFESIONAL
- **Precio**: $249,900 COP/mes | $2,499,000 COP/año
- **Límites**:
  - 15 usuarios
  - 5 sedes
  - 1,000 consentimientos/mes
  - 30 servicios médicos
  - 50 preguntas personalizadas
  - 2 GB almacenamiento
- **Features**: Personalización completa, reportes avanzados, API básico, soporte 12h, backup semanal

### 🥇 Plan EMPRESARIAL
- **Precio**: $649,900 COP/mes | $6,499,000 COP/año
- **Límites**:
  - 50 usuarios
  - 20 sedes
  - 5,000 consentimientos/mes
  - 100 servicios médicos
  - 200 preguntas personalizadas
  - 10 GB almacenamiento
- **Features**: Todo incluido, API completo, soporte 4h, backup diario, dominio personalizado

### 💎 Plan ENTERPRISE
- **Precio**: Desde $1,500,000 COP/mes (personalizado)
- **Límites**: Personalizados según necesidad
- **Features**: White label, soporte 24/7, servidor dedicado, desarrollo custom

---

## 🔧 Implementación Backend

### 1. Migración de Base de Datos

**Archivo**: `backend/src/migrations/1704900000000-AddPlanFieldsToTenants.ts`

**Campos agregados a la tabla `tenants`**:
- `plan` (VARCHAR): ID del plan (free, basic, professional, enterprise, custom)
- `plan_price` (DECIMAL): Precio del plan
- `billing_cycle` (VARCHAR): Ciclo de facturación (monthly, annual)
- `plan_started_at` (TIMESTAMP): Fecha de inicio del plan
- `plan_expires_at` (TIMESTAMP): Fecha de expiración del plan
- `max_services` (INTEGER): Límite de servicios médicos
- `max_questions` (INTEGER): Límite de preguntas personalizadas
- `storage_limit_mb` (INTEGER): Límite de almacenamiento en MB
- `features` (JSONB): Features del plan
- `auto_renew` (BOOLEAN): Renovación automática

### 2. Entidad Tenant Actualizada

**Archivo**: `backend/src/tenants/entities/tenant.entity.ts`

**Nuevos enums**:
```typescript
export enum TenantPlan {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}
```

**Nuevas propiedades**:
- Información del plan y facturación
- Límites de recursos extendidos
- Features en formato JSON

### 3. Configuración de Planes

**Archivo**: `backend/src/tenants/plans.config.ts`

**Funciones**:
- `getPlanConfig(planId)`: Obtener configuración de un plan
- `getAllPlans()`: Obtener todos los planes
- `calculatePrice(planId, billingCycle)`: Calcular precio según ciclo

### 4. Helper de Planes

**Archivo**: `backend/src/tenants/tenants-plan.helper.ts`

**Función**: `applyPlanLimits(dto)`
- Aplica automáticamente los límites del plan seleccionado
- Calcula el precio según el ciclo de facturación
- Establece las features del plan
- Calcula fechas de inicio y expiración

### 5. Endpoint de Planes

**Ruta**: `GET /api/tenants/plans`

**Respuesta**: Array de planes con toda su configuración

---

## 🎨 Implementación Frontend

### 1. Página de Pricing

**Archivo**: `frontend/src/pages/PricingPage.tsx`

**Características**:
- Toggle mensual/anual con indicador de ahorro
- Grid responsive de planes
- Destacado del plan más popular
- Comparación de features
- Formato de precios en COP
- Sección de FAQ

**Componentes**:
- `Feature`: Muestra feature con check/x
- Formateo de precios con `Intl.NumberFormat`
- Formateo de almacenamiento (MB/GB)

### 2. Modal de Creación de Tenant (Pendiente)

**Archivo**: `frontend/src/components/TenantFormModal.tsx`

**Mejoras a implementar**:
- Selector de plan con preview de límites
- Toggle mensual/anual
- Mostrar precio calculado
- Resumen de features incluidas
- Validación de límites personalizados

---

## 📊 Flujo de Creación de Tenant

1. **Super Admin selecciona plan** en el modal
2. **Frontend muestra límites** del plan seleccionado
3. **Super Admin puede personalizar límites** (opcional)
4. **Backend aplica configuración del plan** automáticamente
5. **Se crean registros** con límites y features del plan
6. **Se calculan fechas** de inicio y expiración
7. **Se envía email de bienvenida** con información del plan

---

## 🔐 Validación de Límites

Los límites se validan en:

1. **Creación de recursos**:
   - Usuarios: Verificar `maxUsers`
   - Sedes: Verificar `maxBranches`
   - Consentimientos: Verificar `maxConsents`
   - Servicios: Verificar `maxServices`
   - Preguntas: Verificar `maxQuestions`

2. **Almacenamiento**:
   - PDFs generados
   - Fotos de pacientes
   - Logos personalizados

3. **Features**:
   - Marca de agua en PDFs
   - Personalización avanzada
   - Acceso a API
   - Reportes avanzados

---

## 💰 Estrategia de Precios

### Descuentos

**Plan Anual**: 17% de descuento (2 meses gratis)

**Ejemplo**:
- Básico Mensual: $89,900 x 12 = $1,078,800
- Básico Anual: $899,000 (ahorro de $179,800)

### Add-ons (Futuro)

**Almacenamiento adicional**:
- +1 GB: $15,000 COP/mes
- +5 GB: $60,000 COP/mes

**Consentimientos adicionales**:
- +100: $20,000 COP/mes
- +500: $80,000 COP/mes

**Usuarios adicionales**:
- +5 usuarios: $30,000 COP/mes

---

## 📈 Próximos Pasos

### Fase 1: Completar Implementación Básica
- [ ] Actualizar `TenantFormModal` con selector de planes
- [ ] Agregar preview de límites en el modal
- [ ] Implementar toggle mensual/anual en modal
- [ ] Mostrar precio calculado en tiempo real
- [ ] Agregar validación de límites en creación de recursos

### Fase 2: Dashboard de Plan
- [ ] Crear página de "Mi Plan" para tenants
- [ ] Mostrar uso actual vs límites
- [ ] Gráficos de consumo de recursos
- [ ] Botón de upgrade/downgrade
- [ ] Historial de facturación

### Fase 3: Sistema de Upgrades
- [ ] Endpoint para cambiar de plan
- [ ] Cálculo de prorrateo
- [ ] Confirmación de cambio de plan
- [ ] Notificación por email
- [ ] Actualización inmediata de límites

### Fase 4: Facturación
- [ ] Integración con pasarela de pagos
- [ ] Generación de facturas
- [ ] Recordatorios de pago
- [ ] Suspensión automática por falta de pago
- [ ] Reactivación automática al pagar

### Fase 5: Monitoreo y Alertas
- [ ] Alertas de uso al 80%
- [ ] Alertas de uso al 100%
- [ ] Notificación de próxima renovación
- [ ] Dashboard de métricas de uso
- [ ] Reportes de consumo

---

## 🧪 Testing

### Casos de Prueba

1. **Creación de tenant con plan free**
   - Verificar límites aplicados
   - Verificar features deshabilitadas
   - Verificar marca de agua en PDFs

2. **Creación de tenant con plan básico**
   - Verificar límites aplicados
   - Verificar precio calculado
   - Verificar features habilitadas

3. **Validación de límites**
   - Intentar crear más usuarios del límite
   - Intentar crear más sedes del límite
   - Verificar mensaje de error apropiado

4. **Cambio de plan (futuro)**
   - Upgrade de free a básico
   - Downgrade de profesional a básico
   - Verificar actualización de límites

---

## 📝 Notas Técnicas

### Almacenamiento de Features

Las features se guardan en formato JSONB:

```json
{
  "watermark": true,
  "customization": false,
  "advancedReports": false,
  "apiAccess": false,
  "prioritySupport": false,
  "customDomain": false,
  "whiteLabel": false,
  "backup": "none"
}
```

### Cálculo de Fechas

- **Plan Mensual**: `planExpiresAt = planStartedAt + 1 mes`
- **Plan Anual**: `planExpiresAt = planStartedAt + 1 año`

### Renovación Automática

Si `autoRenew = true`:
- El sistema debe renovar automáticamente al llegar a `planExpiresAt`
- Se debe cobrar el monto correspondiente
- Se debe extender `planExpiresAt` por otro período

---

## 🔗 Archivos Relacionados

### Backend
- `backend/src/migrations/1704900000000-AddPlanFieldsToTenants.ts`
- `backend/src/tenants/entities/tenant.entity.ts`
- `backend/src/tenants/plans.config.ts`
- `backend/src/tenants/tenants-plan.helper.ts`
- `backend/src/tenants/tenants.controller.ts`
- `backend/src/tenants/tenants.service.ts`
- `backend/src/tenants/dto/create-tenant.dto.ts`

### Frontend
- `frontend/src/pages/PricingPage.tsx`
- `frontend/src/components/TenantFormModal.tsx` (pendiente actualizar)
- `frontend/src/types/tenant.ts` (pendiente actualizar)

---

## 📞 Soporte

Para preguntas sobre la implementación de planes:
- Revisar este documento
- Consultar `plans.config.ts` para configuración de planes
- Verificar límites en la entidad `Tenant`

---

**Estado**: ✅ Backend implementado | ⏳ Frontend en progreso
**Última actualización**: Enero 2026
