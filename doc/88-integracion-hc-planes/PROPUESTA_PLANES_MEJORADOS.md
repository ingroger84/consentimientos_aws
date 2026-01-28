# Propuesta: Planes Mejorados con Historias Clínicas

**Fecha:** 2026-01-27  
**Versión:** 15.0.14  
**Estado:** PROPUESTA PARA REVISIÓN

---

## 📋 ANÁLISIS DE PLANES ACTUALES

### Planes Existentes

| Plan | Precio/mes | CN | Usuarios | Sedes | Almacenamiento |
|------|-----------|-----|----------|-------|----------------|
| **Gratuito** | $0 | 50 | 1 | 1 | 100 MB |
| **Básico** | $89,900 | 50 | 1 | 1 | 100 MB |
| **Emprendedor** | $119,900 | 80 | 3 | 2 | 200 MB |
| **Plus** | $149,900 | 100 | 5 | 4 | 300 MB |
| **Empresarial** | $189,900 | 500 | 11 | 10 | 600 MB |

### Problema Identificado

❌ Los planes actuales **NO incluyen límites para:**
- Historias Clínicas (HC)
- Plantillas de HC
- Consentimientos de HC

❌ **Inconsistencias:**
- Plan Gratuito y Básico tienen mismo límite de CN (50)
- No hay diferenciación clara de valor entre planes
- Almacenamiento muy limitado para HC (incluyen imágenes, PDFs)

---

## 💡 PROPUESTA DE PLANES MEJORADOS

### Filosofía de Diseño

1. **Separar CN convencionales de HC**
   - CN: Consentimientos independientes
   - HC: Historias clínicas completas (incluyen CN de HC)

2. **Escalabilidad clara**
   - Cada plan debe tener valor diferenciado
   - Progresión lógica de recursos

3. **Almacenamiento realista**
   - HC con imágenes requieren más espacio
   - PDFs de HC son más pesados

---

## 🎯 PLANES PROPUESTOS

### Plan 1: GRATUITO (Trial 7 días)

**Precio:** $0/mes  
**Objetivo:** Probar la plataforma

**Límites:**
```json
{
  "users": 1,
  "branches": 1,
  "consents": 20,              // ⭐ Reducido de 50
  "medicalRecords": 5,         // ⭐ NUEVO
  "mrConsentTemplates": 2,     // ⭐ NUEVO - Plantillas HC
  "consentTemplates": 3,       // ⭐ NUEVO - Plantillas CN
  "services": 3,
  "questions": 6,
  "storageMb": 200             // ⭐ Aumentado de 100
}
```

**Características:**
- ✅ Acceso completo a HC y CN
- ✅ Firma digital
- ✅ PDFs básicos
- ❌ Sin personalización de marca
- ❌ Sin reportes avanzados
- ❌ Soporte: Email (48h)

**Justificación:**
- 20 CN + 5 HC = 25 documentos totales (suficiente para probar)
- 200 MB permite almacenar PDFs con imágenes
- Trial real de 7 días

---

### Plan 2: BÁSICO

**Precio:** $89,900/mes  
**Objetivo:** Pequeñas clínicas y consultorios

**Límites:**
```json
{
  "users": 2,                  // ⭐ Aumentado de 1
  "branches": 1,
  "consents": 100,             // ⭐ Aumentado de 50
  "medicalRecords": 30,        // ⭐ NUEVO
  "mrConsentTemplates": 5,     // ⭐ NUEVO
  "consentTemplates": 10,      // ⭐ NUEVO
  "services": 5,
  "questions": 10,
  "storageMb": 500             // ⭐ Aumentado de 100
}
```

**Características:**
- ✅ Personalización básica (logo, colores)
- ✅ Firma digital
- ✅ PDFs profesionales
- ✅ Envío automático de emails
- ❌ Sin reportes avanzados
- ❌ Sin backup automático
- ✅ Soporte: Email (24h)

**Justificación:**
- 100 CN + 30 HC = 130 documentos/mes
- 2 usuarios permite recepcionista + médico
- 500 MB suficiente para operación básica

---

### Plan 3: EMPRENDEDOR ⭐ MÁS POPULAR

**Precio:** $119,900/mes  
**Objetivo:** Clínicas medianas en crecimiento

**Límites:**
```json
{
  "users": 5,                  // ⭐ Aumentado de 3
  "branches": 3,               // ⭐ Aumentado de 2
  "consents": 300,             // ⭐ Aumentado de 80
  "medicalRecords": 100,       // ⭐ NUEVO
  "mrConsentTemplates": 10,    // ⭐ NUEVO
  "consentTemplates": 20,      // ⭐ NUEVO
  "services": 15,              // ⭐ Aumentado de 10
  "questions": 30,             // ⭐ Aumentado de 20
  "storageMb": 2000            // ⭐ Aumentado de 200 (2 GB)
}
```

**Características:**
- ✅ Personalización completa
- ✅ Reportes avanzados
- ✅ Estadísticas por sede
- ✅ Backup semanal
- ✅ Soporte prioritario: Chat (12h)
- ✅ Logos separados HC/CN
- ✅ Marca de agua personalizada

**Justificación:**
- 300 CN + 100 HC = 400 documentos/mes
- 5 usuarios permite equipo completo
- 3 sedes para expansión
- 2 GB para operación profesional

---

### Plan 4: PLUS

**Precio:** $149,900/mes  
**Objetivo:** Grandes clínicas y hospitales

**Límites:**
```json
{
  "users": 10,                 // ⭐ Aumentado de 5
  "branches": 5,               // ⭐ Aumentado de 4
  "consents": 500,             // ⭐ Aumentado de 100
  "medicalRecords": 300,       // ⭐ NUEVO
  "mrConsentTemplates": 20,    // ⭐ NUEVO
  "consentTemplates": 30,      // ⭐ NUEVO
  "services": 30,              // ⭐ Aumentado de 20
  "questions": 50,             // ⭐ Aumentado de 40
  "storageMb": 5000            // ⭐ Aumentado de 300 (5 GB)
}
```

**Características:**
- ✅ Todo lo de Emprendedor +
- ✅ Backup diario
- ✅ Dominio personalizado
- ✅ Soporte prioritario: Tel/Chat (4h)
- ✅ Capacitación incluida (1 sesión)
- ✅ Integración con sistemas externos

**Justificación:**
- 500 CN + 300 HC = 800 documentos/mes
- 10 usuarios para equipos grandes
- 5 sedes para múltiples sucursales
- 5 GB para alto volumen

---

### Plan 5: EMPRESARIAL

**Precio:** $189,900/mes  
**Objetivo:** Organizaciones grandes y redes de clínicas

**Límites:**
```json
{
  "users": -1,                 // ⭐ Ilimitado
  "branches": -1,              // ⭐ Ilimitado
  "consents": -1,              // ⭐ Ilimitado
  "medicalRecords": -1,        // ⭐ Ilimitado
  "mrConsentTemplates": -1,    // ⭐ Ilimitado
  "consentTemplates": -1,      // ⭐ Ilimitado
  "services": -1,              // ⭐ Ilimitado
  "questions": -1,             // ⭐ Ilimitado
  "storageMb": 10000           // ⭐ 10 GB
}
```

**Características:**
- ✅ Todo ilimitado
- ✅ White Label
- ✅ API Access
- ✅ Backup diario + redundancia
- ✅ Soporte 24/7
- ✅ Capacitación ilimitada
- ✅ Gerente de cuenta dedicado
- ✅ SLA garantizado 99.9%

**Justificación:**
- Sin límites para grandes operaciones
- 10 GB base + expansión bajo demanda
- Soporte premium

---

## 📊 COMPARACIÓN VISUAL

### Recursos por Plan

```
┌─────────────┬──────────┬──────┬──────┬──────────┬─────────────┐
│ Recurso     │ Gratuito │ Básico│ Empre│ Plus    │ Empresarial │
├─────────────┼──────────┼──────┼──────┼──────────┼─────────────┤
│ CN          │ 20       │ 100  │ 300  │ 500     │ ♾️          │
│ HC          │ 5        │ 30   │ 100  │ 300     │ ♾️          │
│ Usuarios    │ 1        │ 2    │ 5    │ 10      │ ♾️          │
│ Sedes       │ 1        │ 1    │ 3    │ 5       │ ♾️          │
│ Storage     │ 200 MB   │ 500MB│ 2 GB │ 5 GB    │ 10 GB       │
│ Plantillas  │ 5        │ 15   │ 30   │ 50      │ ♾️          │
└─────────────┴──────────┴──────┴──────┴──────────┴─────────────┘
```

### Progresión de Valor

```
Gratuito → Básico → Emprendedor → Plus → Empresarial
   $0       $90K      $120K        $150K     $190K
   
   5 HC  →  30 HC  →  100 HC   →  300 HC  →  ♾️ HC
  20 CN  → 100 CN  →  300 CN   →  500 CN  →  ♾️ CN
```

---

## 🔧 CAMBIOS TÉCNICOS NECESARIOS

### 1. Actualizar Interface PlanConfig

**Archivo:** `backend/src/tenants/plans.config.ts`

```typescript
export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  limits: {
    users: number;
    branches: number;
    consents: number;
    medicalRecords: number;           // ⭐ NUEVO
    mrConsentTemplates: number;       // ⭐ NUEVO
    consentTemplates: number;         // ⭐ NUEVO (antes ilimitado)
    services: number;
    questions: number;
    storageMb: number;
  };
  features: {
    customization: boolean;
    advancedReports: boolean;
    prioritySupport: boolean;
    customDomain: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;               // ⭐ NUEVO
    backup: 'none' | 'weekly' | 'daily';
    supportResponseTime: string;
  };
  popular?: boolean;
}
```

### 2. Migración de Base de Datos

**Crear migración para agregar columnas:**

```sql
-- Agregar nuevas columnas a tabla plans
ALTER TABLE plans 
ADD COLUMN medical_records_limit INTEGER DEFAULT 0,
ADD COLUMN mr_consent_templates_limit INTEGER DEFAULT 0,
ADD COLUMN consent_templates_limit INTEGER DEFAULT -1;

-- Actualizar planes existentes con valores por defecto
UPDATE plans SET 
  medical_records_limit = CASE 
    WHEN id = 'free' THEN 5
    WHEN id = 'basic' THEN 30
    WHEN id = 'professional' THEN 100
    WHEN id = 'enterprise' THEN 300
    WHEN id = 'custom' THEN -1
  END,
  mr_consent_templates_limit = CASE 
    WHEN id = 'free' THEN 2
    WHEN id = 'basic' THEN 5
    WHEN id = 'professional' THEN 10
    WHEN id = 'enterprise' THEN 20
    WHEN id = 'custom' THEN -1
  END,
  consent_templates_limit = CASE 
    WHEN id = 'free' THEN 3
    WHEN id = 'basic' THEN 10
    WHEN id = 'professional' THEN 20
    WHEN id = 'enterprise' THEN 30
    WHEN id = 'custom' THEN -1
  END;
```

### 3. Servicios de Validación

**Agregar validaciones en servicios:**

```typescript
// medical-records.service.ts
async checkMedicalRecordsLimit(tenantId: string) {
  const tenant = await this.tenantsService.findOne(tenantId);
  const plan = getPlanConfig(tenant.planId);
  
  if (plan.limits.medicalRecords === -1) return; // Ilimitado
  
  const count = await this.medicalRecordsRepository.count({
    where: { tenantId }
  });
  
  if (count >= plan.limits.medicalRecords) {
    throw new BadRequestException(
      `Has alcanzado el límite de ${plan.limits.medicalRecords} historias clínicas. Actualiza tu plan.`
    );
  }
}

// mr-consent-templates.service.ts
async checkTemplatesLimit(tenantId: string) {
  const tenant = await this.tenantsService.findOne(tenantId);
  const plan = getPlanConfig(tenant.planId);
  
  if (plan.limits.mrConsentTemplates === -1) return;
  
  const count = await this.mrConsentTemplatesRepository.count({
    where: { tenantId }
  });
  
  if (count >= plan.limits.mrConsentTemplates) {
    throw new BadRequestException(
      `Has alcanzado el límite de ${plan.limits.mrConsentTemplates} plantillas de HC. Actualiza tu plan.`
    );
  }
}
```

### 4. Frontend - Mostrar Límites

**Actualizar PricingSection.tsx:**

```tsx
<div className="space-y-3 mb-6">
  {/* Consentimientos */}
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600">Consentimientos</span>
    <span className="font-semibold text-gray-900">
      {plan.limits.consents === -1 ? 'Ilimitados' : `${plan.limits.consents}/mes`}
    </span>
  </div>
  
  {/* Historias Clínicas - NUEVO */}
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600">Historias Clínicas</span>
    <span className="font-semibold text-gray-900">
      {plan.limits.medicalRecords === -1 ? 'Ilimitadas' : `${plan.limits.medicalRecords}/mes`}
    </span>
  </div>
  
  {/* Plantillas HC - NUEVO */}
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600">Plantillas HC</span>
    <span className="font-semibold text-gray-900">
      {plan.limits.mrConsentTemplates === -1 ? 'Ilimitadas' : plan.limits.mrConsentTemplates}
    </span>
  </div>
  
  {/* Plantillas CN - NUEVO */}
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600">Plantillas CN</span>
    <span className="font-semibold text-gray-900">
      {plan.limits.consentTemplates === -1 ? 'Ilimitadas' : plan.limits.consentTemplates}
    </span>
  </div>
</div>
```

---

## 💰 ANÁLISIS FINANCIERO

### Ingresos Proyectados (100 clientes)

**Distribución esperada:**
- Gratuito: 20 clientes (20%) - $0
- Básico: 30 clientes (30%) - $2,697,000
- Emprendedor: 35 clientes (35%) - $4,196,500
- Plus: 10 clientes (10%) - $1,499,000
- Empresarial: 5 clientes (5%) - $949,500

**Total MRR:** $9,342,000/mes  
**Total ARR:** $112,104,000/año

### Comparación con Planes Actuales

**Actual:** $13,690,000 MRR (100 clientes pagos)  
**Propuesto:** $9,342,000 MRR (80 clientes pagos + 20 free)

**Pero con crecimiento:**
- Mes 1-3: +40% conversión free → paid = 8 clientes más
- Mes 4-6: +30% nuevos registros por plan gratuito
- Mes 7-12: MRR proyectado $15,000,000+

---

## ✅ VENTAJAS DE LA PROPUESTA

### Comerciales
1. ✅ **Plan gratuito real** atrae más usuarios
2. ✅ **Diferenciación clara** entre planes
3. ✅ **Escalabilidad lógica** de recursos
4. ✅ **Valor percibido** mayor (HC + CN)

### Técnicas
1. ✅ **Límites claros** por recurso
2. ✅ **Validaciones** en backend
3. ✅ **Almacenamiento realista** para HC
4. ✅ **Fácil de mantener** en tabla de planes

### UX
1. ✅ **Transparencia** en límites
2. ✅ **Alertas** cuando se acerca al límite
3. ✅ **Upgrade path** claro
4. ✅ **Dashboard** muestra uso actual

---

## 📝 PRÓXIMOS PASOS

### Fase 1: Aprobación
- [ ] Revisar propuesta de planes
- [ ] Aprobar precios y límites
- [ ] Definir fecha de implementación

### Fase 2: Implementación Backend
- [ ] Actualizar interface PlanConfig
- [ ] Crear migración de BD
- [ ] Actualizar plans.config.ts
- [ ] Implementar validaciones
- [ ] Testing

### Fase 3: Implementación Frontend
- [ ] Actualizar PricingSection
- [ ] Actualizar Dashboard (uso de recursos)
- [ ] Agregar alertas de límites
- [ ] Testing

### Fase 4: Migración de Clientes
- [ ] Comunicar cambios a clientes actuales
- [ ] Migrar clientes a nuevos planes
- [ ] Grandfathering (opcional)
- [ ] Monitoreo

---

**Documento creado:** 2026-01-27  
**Versión:** 1.0  
**Estado:** PROPUESTA PARA REVISIÓN Y APROBACIÓN
