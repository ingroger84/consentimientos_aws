# Propuesta de Implementación Técnica

**Fecha:** 2026-01-27  
**Versión:** 15.0.14

## 🎯 Objetivo

Implementar las actualizaciones recomendadas en la landing page y sistema de planes para reflejar las nuevas funcionalidades de Historias Clínicas.

---

## 📋 OPCIÓN RECOMENDADA: Modelo Freemium Mejorado

### Justificación

1. **Competitivo:** Plan gratuito permanente atrae más usuarios
2. **Escalable:** Conversión natural de free a paid
3. **Flexible:** Permite probar antes de comprar
4. **Rentable:** Planes pagos bien diferenciados

---

## 🔧 CAMBIOS EN BACKEND

### 1. Actualizar Configuración de Planes

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
    medicalRecords: number;  // ⭐ NUEVO
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
    apiAccess: boolean;  // ⭐ NUEVO
    backup: 'none' | 'weekly' | 'daily';
    supportResponseTime: string;
  };
  popular?: boolean;
}
```

### 2. Nuevos Planes Propuestos

```typescript
export const PLANS: Record<string, PlanConfig> = {
  "free": {
    "id": "free",
    "name": "Gratuito",
    "description": "Perfecto para probar la plataforma",
    "priceMonthly": 0,
    "priceAnnual": 0,
    "limits": {
      "users": 1,
      "branches": 1,
      "consents": 20,
      "medicalRecords": 10,  // ⭐ NUEVO
      "services": 3,
      "questions": 6,
      "storageMb": 100
    },

    "features": {
      "customization": false,
      "advancedReports": false,
      "prioritySupport": false,
      "customDomain": false,
      "whiteLabel": false,
      "apiAccess": false,
      "backup": "none",
      "supportResponseTime": "48h"
    }
  },
  "starter": {
    "id": "starter",
    "name": "Starter",
    "description": "Para pequeñas clínicas y consultorios",
    "priceMonthly": 79900,
    "priceAnnual": 795000,  // 17% descuento
    "limits": {
      "users": 2,
      "branches": 1,
      "consents": 100,
      "medicalRecords": 50,  // ⭐ NUEVO
      "services": 5,
      "questions": 10,
      "storageMb": 500
    },
    "features": {
      "customization": true,
      "advancedReports": false,
      "prioritySupport": false,
      "customDomain": false,
      "whiteLabel": false,
      "apiAccess": false,
      "backup": "weekly",
      "supportResponseTime": "24h"
    }
  },
  "professional": {
    "id": "professional",
    "name": "Profesional",
    "description": "Para clínicas medianas y centros médicos",
    "priceMonthly": 129900,
    "priceAnnual": 1293000,  // 17% descuento
    "limits": {
      "users": 5,
      "branches": 3,
      "consents": 300,
      "medicalRecords": 200,  // ⭐ NUEVO
      "services": 15,
      "questions": 30,
      "storageMb": 2000
    },
    "features": {
      "customization": true,
      "advancedReports": true,
      "prioritySupport": true,
      "customDomain": false,
      "whiteLabel": false,
      "apiAccess": false,
      "backup": "daily",
      "supportResponseTime": "12h"
    },
    "popular": true  // ⭐ MÁS POPULAR
  },
  "enterprise": {
    "id": "enterprise",
    "name": "Empresarial",
    "description": "Para grandes organizaciones y hospitales",
    "priceMonthly": 199900,
    "priceAnnual": 1989000,  // 17% descuento
    "limits": {
      "users": -1,  // Ilimitado
      "branches": -1,  // Ilimitado
      "consents": -1,  // Ilimitado
      "medicalRecords": -1,  // ⭐ Ilimitado
      "services": -1,  // Ilimitado
      "questions": -1,  // Ilimitado
      "storageMb": 10000
    },
    "features": {
      "customization": true,
      "advancedReports": true,
      "prioritySupport": true,
      "customDomain": true,
      "whiteLabel": true,
      "apiAccess": true,  // ⭐ NUEVO
      "backup": "daily",
      "supportResponseTime": "24/7"
    }
  }
};
```

### 3. Servicio de Validación de Límites

**Archivo:** `backend/src/medical-records/medical-records.service.ts`

Agregar método:

```typescript
async checkMedicalRecordsLimit(tenantId: string): Promise<void> {
  const tenant = await this.tenantsService.findOne(tenantId);
  const plan = getPlanConfig(tenant.planId);
  
  // Si el plan tiene límite ilimitado (-1), no validar
  if (plan.limits.medicalRecords === -1) {
    return;
  }
  
  const count = await this.medicalRecordsRepository.count({
    where: { tenantId }
  });
  
  if (count >= plan.limits.medicalRecords) {
    throw new BadRequestException(
      `Has alcanzado el límite de ${plan.limits.medicalRecords} historias clínicas de tu plan. Actualiza tu plan para crear más.`
    );
  }
}
```

Llamar en el método `create`:

```typescript
async create(createDto: CreateMedicalRecordDto, tenantId: string, userId: string) {
  // Validar límite de HC
  await this.checkMedicalRecordsLimit(tenantId);
  
  // ... resto del código
}
```

---

## 🎨 CAMBIOS EN FRONTEND

### 1. Actualizar Landing Page

**Archivo:** `frontend/src/pages/PublicLandingPage.tsx`

#### A. Actualizar Hero Section

```tsx
<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
  Plataforma Integral de
  <span className="text-primary-600"> Gestión Clínica Digital</span>
</h1>
<p className="text-xl text-gray-600 mb-8">
  Historias Clínicas Electrónicas + Consentimientos Informados + 
  Gestión de Pacientes. Todo en una sola plataforma SaaS.
</p>

<div className="flex flex-wrap items-center gap-4 mb-8">
  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
    <ClipboardList className="w-5 h-5 text-blue-600" />
    <span className="text-sm font-medium text-blue-900">Historias Clínicas</span>
  </div>
  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
    <FileText className="w-5 h-5 text-green-600" />
    <span className="text-sm font-medium text-green-900">Consentimientos</span>
  </div>
  <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
    <Users className="w-5 h-5 text-purple-600" />
    <span className="text-sm font-medium text-purple-900">Gestión de Pacientes</span>
  </div>
</div>
```

#### B. Agregar Nueva Sección de Módulos

```tsx
{/* Modules Section */}
<section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        3 Módulos Integrados en 1 Plataforma
      </h2>
      <p className="text-xl text-gray-600">
        Todo lo que necesitas para gestionar tu clínica de forma profesional
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      {/* Módulo 1: Historias Clínicas */}
      <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
          <ClipboardList className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Historias Clínicas Electrónicas
        </h3>
        <p className="text-gray-600 mb-6">
          Sistema completo de historias clínicas digitales con todos los componentes necesarios.
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Anamnesis completa</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Exámenes físicos y signos vitales</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Diagnósticos CIE-10</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Evoluciones formato SOAP</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Firma digital integrada</span>
          </li>
        </ul>
      </div>

      {/* Módulo 2: Consentimientos */}
      <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
        <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Consentimientos Informados
        </h3>
        <p className="text-gray-600 mb-6">
          Gestión completa de consentimientos con firma digital y validez legal.
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Plantillas personalizables</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Firma digital con validez legal</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">PDFs profesionales automáticos</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Envío automático por email</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Trazabilidad completa</span>
          </li>
        </ul>
      </div>

      {/* Módulo 3: Gestión de Pacientes */}
      <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition">
        <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Gestión de Pacientes
        </h3>
        <p className="text-gray-600 mb-6">
          Base de datos centralizada de pacientes con historial completo.
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Registro completo de datos</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Búsqueda avanzada</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Historial de HC y CN</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Gestión multi-sede</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">Reportes y estadísticas</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

#### C. Actualizar Features Section

Agregar nuevas características relacionadas con HC:

```tsx
const features = [
  {
    icon: ClipboardList,
    title: 'Historias Clínicas Completas',
    description: 'Sistema completo de HC electrónicas con anamnesis, exámenes, diagnósticos y evoluciones.',
    color: 'text-blue-600',
    badge: 'NUEVO'  // ⭐
  },
  {
    icon: FileText,
    title: 'Consentimientos Digitales',
    description: 'Crea, gestiona y envía consentimientos informados de forma digital con firma electrónica.',
    color: 'text-green-600'
  },
  // ... resto de features
];
```

### 2. Actualizar Pricing Section

**Archivo:** `frontend/src/components/landing/PricingSection.tsx`

Mostrar límite de HC en cada plan:

```tsx
<div className="space-y-4 mb-8">
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600">Historias Clínicas</span>
    <span className="font-semibold text-gray-900">
      {plan.limits.medicalRecords === -1 
        ? 'Ilimitadas' 
        : `${plan.limits.medicalRecords}/mes`}
    </span>
  </div>
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600">Consentimientos</span>
    <span className="font-semibold text-gray-900">
      {plan.limits.consents === -1 
        ? 'Ilimitados' 
        : `${plan.limits.consents}/mes`}
    </span>
  </div>
  {/* ... resto de límites */}
</div>
```

---

## 📊 DASHBOARD: Mostrar Límites

**Archivo:** `frontend/src/pages/DashboardPage.tsx`

Agregar tarjeta de uso de recursos:

```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold mb-4">Uso de Recursos</h3>
  
  {/* Historias Clínicas */}
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span>Historias Clínicas</span>
      <span>{stats.medicalRecords} / {plan.limits.medicalRecords}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full"
        style={{ width: `${(stats.medicalRecords / plan.limits.medicalRecords) * 100}%` }}
      />
    </div>
  </div>
  
  {/* Consentimientos */}
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span>Consentimientos</span>
      <span>{stats.consents} / {plan.limits.consents}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-green-600 h-2 rounded-full"
        style={{ width: `${(stats.consents / plan.limits.consents) * 100}%` }}
      />
    </div>
  </div>
  
  {/* Botón de upgrade si está cerca del límite */}
  {(stats.medicalRecords / plan.limits.medicalRecords) > 0.8 && (
    <button className="btn btn-primary w-full mt-4">
      Actualizar Plan
    </button>
  )}
</div>
```

---

## 🚀 PLAN DE DESPLIEGUE

### Fase 1: Backend (1-2 días)

1. ✅ Actualizar `plans.config.ts`
2. ✅ Agregar validación de límites en `medical-records.service.ts`
3. ✅ Agregar endpoint para obtener uso de recursos
4. ✅ Testing de validaciones
5. ✅ Deploy a producción

### Fase 2: Frontend Landing (2-3 días)

1. ✅ Actualizar Hero Section
2. ✅ Agregar Modules Section
3. ✅ Actualizar Features Section
4. ✅ Actualizar Pricing Section
5. ✅ Tomar screenshots de calidad
6. ✅ Testing responsive
7. ✅ Deploy a producción

### Fase 3: Frontend Dashboard (1 día)

1. ✅ Agregar tarjeta de uso de recursos
2. ✅ Agregar alertas de límites
3. ✅ Agregar botón de upgrade
4. ✅ Testing
5. ✅ Deploy a producción

### Fase 4: Marketing (1 semana)

1. ✅ Email a usuarios actuales
2. ✅ Post en redes sociales
3. ✅ Blog post
4. ✅ Actualizar documentación
5. ✅ Webinar demostrativo

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Actualizar `plans.config.ts` con nuevos planes
- [ ] Agregar campo `medicalRecords` a límites
- [ ] Implementar validación en `medical-records.service.ts`
- [ ] Crear endpoint `/tenants/usage` para obtener uso
- [ ] Testing de límites
- [ ] Migración de datos (si es necesario)

### Frontend - Landing
- [ ] Actualizar Hero Section
- [ ] Crear Modules Section
- [ ] Actualizar Features Section
- [ ] Actualizar Pricing Section
- [ ] Agregar badges "NUEVO"
- [ ] Tomar screenshots
- [ ] Testing responsive
- [ ] Optimizar SEO

### Frontend - Dashboard
- [ ] Crear componente ResourceUsageCard
- [ ] Agregar alertas de límites
- [ ] Agregar botón de upgrade
- [ ] Testing

### Marketing
- [ ] Preparar email de anuncio
- [ ] Crear posts para redes sociales
- [ ] Escribir blog post
- [ ] Preparar webinar
- [ ] Actualizar documentación

---

**Documento creado:** 2026-01-27  
**Versión:** 1.0  
**Estado:** Listo para implementación
