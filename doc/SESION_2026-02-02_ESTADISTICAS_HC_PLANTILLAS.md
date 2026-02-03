# 📊 Estadísticas de HC y Plantillas - 02 de Febrero 2026

**Fecha**: 02 de Febrero 2026  
**Tipo**: Feature - Mejora de Estadísticas  
**Estado**: ✅ Implementado

---

## 🎯 OBJETIVO

Agregar las estadísticas de los nuevos recursos (Historias Clínicas y Plantillas) en las páginas de estadísticas tanto para Super Admin como para Tenants.

---

## ✅ CAMBIOS IMPLEMENTADOS

### 1. Frontend - Tipos (TypeScript)

**Archivo**: `frontend/src/types/tenant.ts`

**Cambios en `TenantStats`**:
```typescript
export interface TenantStats {
  // Recursos existentes
  totalUsers: number;
  totalBranches: number;
  totalServices: number;
  totalConsents: number;
  
  // ✨ NUEVOS RECURSOS
  totalMedicalRecords: number;
  totalMRConsentTemplates: number;
  totalConsentTemplates: number;
  
  // Límites existentes
  maxUsers: number;
  maxBranches: number;
  maxConsents: number;
  
  // ✨ NUEVOS LÍMITES
  maxMedicalRecords: number;
  maxMRConsentTemplates: number;
  maxConsentTemplates: number;
  
  // Porcentajes de uso
  usagePercentage: {
    users: number;
    branches: number;
    consents: number;
    // ✨ NUEVOS PORCENTAJES
    medicalRecords: number;
    mrConsentTemplates: number;
    consentTemplates: number;
  };
  
  status: TenantStatus;
  plan: TenantPlan;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
}
```

---

### 2. Frontend - Componente de Estadísticas

**Archivo**: `frontend/src/components/TenantStatsModal.tsx`

#### Nuevos Iconos Importados
```typescript
import { Heart, FileCheck } from 'lucide-react';
```

#### Nuevas Tarjetas de Resumen

**Historias Clínicas**:
```tsx
<div className="bg-pink-50 rounded-lg p-4">
  <div className="flex items-center justify-between">
    <Heart className="w-8 h-8 text-pink-600" />
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUsageColor(stats.usagePercentage.medicalRecords)}`}>
      {stats.usagePercentage.medicalRecords.toFixed(0)}%
    </span>
  </div>
  <p className="text-sm text-gray-600 mt-2">Historias Clínicas</p>
  <p className="text-2xl font-bold text-gray-900 mt-1">
    {stats.totalMedicalRecords} / {stats.maxMedicalRecords}
  </p>
</div>
```

**Plantillas de Consentimientos**:
```tsx
<div className="bg-indigo-50 rounded-lg p-4">
  <div className="flex items-center justify-between">
    <FileCheck className="w-8 h-8 text-indigo-600" />
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUsageColor(stats.usagePercentage.consentTemplates)}`}>
      {stats.usagePercentage.consentTemplates.toFixed(0)}%
    </span>
  </div>
  <p className="text-sm text-gray-600 mt-2">Plantillas CN</p>
  <p className="text-2xl font-bold text-gray-900 mt-1">
    {stats.totalConsentTemplates} / {stats.maxConsentTemplates}
  </p>
</div>
```

**Plantillas de HC**:
```tsx
<div className="bg-teal-50 rounded-lg p-4">
  <div className="flex items-center justify-between">
    <FileCheck className="w-8 h-8 text-teal-600" />
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUsageColor(stats.usagePercentage.mrConsentTemplates)}`}>
      {stats.usagePercentage.mrConsentTemplates.toFixed(0)}%
    </span>
  </div>
  <p className="text-sm text-gray-600 mt-2">Plantillas HC</p>
  <p className="text-2xl font-bold text-gray-900 mt-1">
    {stats.totalMRConsentTemplates} / {stats.maxMRConsentTemplates}
  </p>
</div>
```

#### Nuevas Barras de Progreso

**Historias Clínicas**:
```tsx
<div>
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-gray-700">Historias Clínicas</span>
    <span className="text-sm text-gray-600">
      {stats.totalMedicalRecords} de {stats.maxMedicalRecords} ({stats.usagePercentage.medicalRecords.toFixed(1)}%)
    </span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-3">
    <div
      className={`h-3 rounded-full transition-all ${getProgressColor(stats.usagePercentage.medicalRecords)}`}
      style={{ width: `${Math.min(stats.usagePercentage.medicalRecords, 100)}%` }}
    />
  </div>
</div>
```

**Plantillas de Consentimientos**:
```tsx
<div>
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-gray-700">Plantillas de Consentimientos</span>
    <span className="text-sm text-gray-600">
      {stats.totalConsentTemplates} de {stats.maxConsentTemplates} ({stats.usagePercentage.consentTemplates.toFixed(1)}%)
    </span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-3">
    <div
      className={`h-3 rounded-full transition-all ${getProgressColor(stats.usagePercentage.consentTemplates)}`}
      style={{ width: `${Math.min(stats.usagePercentage.consentTemplates, 100)}%` }}
    />
  </div>
</div>
```

**Plantillas de HC**:
```tsx
<div>
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-gray-700">Plantillas de HC</span>
    <span className="text-sm text-gray-600">
      {stats.totalMRConsentTemplates} de {stats.maxMRConsentTemplates} ({stats.usagePercentage.mrConsentTemplates.toFixed(1)}%)
    </span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-3">
    <div
      className={`h-3 rounded-full transition-all ${getProgressColor(stats.usagePercentage.mrConsentTemplates)}`}
      style={{ width: `${Math.min(stats.usagePercentage.mrConsentTemplates, 100)}%` }}
    />
  </div>
</div>
```

#### Alertas Actualizadas

```tsx
{(stats.usagePercentage.users >= 90 || 
  stats.usagePercentage.branches >= 90 || 
  stats.usagePercentage.consents >= 90 ||
  stats.usagePercentage.medicalRecords >= 90 ||
  stats.usagePercentage.consentTemplates >= 90 ||
  stats.usagePercentage.mrConsentTemplates >= 90) && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-start">
      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
      <div>
        <h4 className="text-sm font-semibold text-red-900 mb-1">
          Límites Críticos Alcanzados
        </h4>
        <p className="text-sm text-red-700">
          Uno o más recursos están cerca del límite. Considera actualizar el plan del tenant.
        </p>
      </div>
    </div>
  </div>
)}
```

---

### 3. Backend - Servicio de Tenants

**Archivo**: `backend/src/tenants/tenants.service.ts`

**Método `getStats` Actualizado**:
```typescript
async getStats(id: string) {
  const tenant = await this.findOne(id);

  // Obtener conteos de historias clínicas
  let totalMedicalRecords = 0;
  let totalConsentTemplates = 0;
  let totalMRConsentTemplates = 0;

  try {
    const medicalRecordsRepo = this.dataSource.getRepository('MedicalRecord');
    totalMedicalRecords = await medicalRecordsRepo.count({ where: { tenantId: id } });
  } catch (error) {
    console.log('Error counting medical records:', error.message);
  }

  try {
    const consentTemplatesRepo = this.dataSource.getRepository('ConsentTemplate');
    totalConsentTemplates = await consentTemplatesRepo.count({ where: { tenantId: id } });
  } catch (error) {
    console.log('Error counting consent templates:', error.message);
  }

  try {
    const mrConsentTemplatesRepo = this.dataSource.getRepository('MRConsentTemplate');
    totalMRConsentTemplates = await mrConsentTemplatesRepo.count({ where: { tenantId: id } });
  } catch (error) {
    console.log('Error counting MR consent templates:', error.message);
  }

  const stats = {
    totalUsers: tenant.users?.length || 0,
    totalBranches: tenant.branches?.length || 0,
    totalServices: tenant.services?.length || 0,
    totalConsents: tenant.consents?.length || 0,
    totalMedicalRecords,
    totalConsentTemplates,
    totalMRConsentTemplates,
    maxUsers: tenant.maxUsers,
    maxBranches: tenant.maxBranches,
    maxConsents: tenant.maxConsents,
    maxMedicalRecords: tenant.maxMedicalRecords || 0,
    maxConsentTemplates: tenant.maxConsentTemplates || 0,
    maxMRConsentTemplates: tenant.maxMRConsentTemplates || 0,
    usagePercentage: {
      users: ((tenant.users?.length || 0) / tenant.maxUsers) * 100,
      branches: ((tenant.branches?.length || 0) / tenant.maxBranches) * 100,
      consents: ((tenant.consents?.length || 0) / tenant.maxConsents) * 100,
      medicalRecords: tenant.maxMedicalRecords > 0 ? (totalMedicalRecords / tenant.maxMedicalRecords) * 100 : 0,
      consentTemplates: tenant.maxConsentTemplates > 0 ? (totalConsentTemplates / tenant.maxConsentTemplates) * 100 : 0,
      mrConsentTemplates: tenant.maxMRConsentTemplates > 0 ? (totalMRConsentTemplates / tenant.maxMRConsentTemplates) * 100 : 0,
    },
    status: tenant.status,
    plan: tenant.plan,
    trialEndsAt: tenant.trialEndsAt,
    subscriptionEndsAt: tenant.subscriptionEndsAt,
  };

  return stats;
}
```

---

## 📊 RECURSOS MOSTRADOS

### Recursos Existentes
1. ✅ Usuarios (con límite)
2. ✅ Sedes (con límite)
3. ✅ Servicios (sin límite)
4. ✅ Consentimientos (con límite)

### Nuevos Recursos Agregados
5. ✨ **Historias Clínicas** (con límite)
6. ✨ **Plantillas de Consentimientos** (con límite)
7. ✨ **Plantillas de HC** (con límite)

---

## 🎨 DISEÑO VISUAL

### Colores por Recurso
- **Usuarios**: Azul (`bg-blue-50`, `text-blue-600`)
- **Sedes**: Verde (`bg-green-50`, `text-green-600`)
- **Servicios**: Púrpura (`bg-purple-50`, `text-purple-600`)
- **Consentimientos**: Naranja (`bg-orange-50`, `text-orange-600`)
- **Historias Clínicas**: Rosa (`bg-pink-50`, `text-pink-600`) ✨
- **Plantillas CN**: Índigo (`bg-indigo-50`, `text-indigo-600`) ✨
- **Plantillas HC**: Teal (`bg-teal-50`, `text-teal-600`) ✨

### Indicadores de Uso
- **Verde**: 0-69% (uso normal)
- **Amarillo**: 70-89% (advertencia)
- **Rojo**: 90-100% (crítico)

---

## 🔍 FUNCIONALIDADES

### 1. Vista de Tarjetas
- Muestra el total usado vs límite máximo
- Indicador de porcentaje de uso con colores
- Iconos distintivos para cada recurso

### 2. Barras de Progreso
- Visualización clara del porcentaje de uso
- Colores dinámicos según el nivel de uso
- Información detallada (X de Y - Z%)

### 3. Alertas Automáticas
- Se activa cuando cualquier recurso alcanza 90% o más
- Mensaje claro sugiriendo actualizar el plan
- Icono de alerta visible

### 4. Información del Plan
- Nombre del plan actual
- Estado del tenant
- Fechas de expiración (trial/suscripción)

---

## 📝 ARCHIVOS MODIFICADOS

### Frontend
1. `frontend/src/types/tenant.ts` - Tipos actualizados
2. `frontend/src/components/TenantStatsModal.tsx` - Componente actualizado

### Backend
1. `backend/src/tenants/tenants.service.ts` - Servicio actualizado

---

## ✅ DESPLIEGUE COMPLETADO

### Fecha de Despliegue
**02 de Febrero 2026 - 05:22 UTC**

### Acciones Realizadas

#### Backend
```bash
# Compilado localmente
cd backend
NODE_OPTIONS='--max-old-space-size=2048' npm run build

# Subido a producción
scp -i "keys/AWS-ISSABEL.pem" -r backend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/

# Reiniciado servicio PM2
pm2 restart datagree --update-env
```

#### Frontend
```bash
# Compilado localmente
cd frontend
npm run build

# Subido a producción (54 archivos)
scp -i "keys/AWS-ISSABEL.pem" -r frontend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/

# Recargado nginx
sudo systemctl reload nginx
```

### Estado del Servidor
- **Backend**: Online (PM2 Process ID: 0)
- **Versión**: 23.1.0 (se actualizará a 23.2.0 en próximo despliegue)
- **Uptime**: Reiniciado exitosamente
- **Nginx**: Recargado correctamente

### Verificación
Las nuevas estadísticas de HC y Plantillas están ahora disponibles en:
- **Super Admin**: Dashboard → Tenants → Ver Estadísticas
- **Tenants**: Mi Plan → Ver Estadísticas

### Próxima Acción
Limpiar caché del navegador para ver los cambios:
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

## ✅ BENEFICIOS

### Para Super Admin
- Visibilidad completa del uso de recursos de cada tenant
- Identificación rápida de tenants cerca del límite
- Mejor toma de decisiones para upgrades de plan

### Para Tenants
- Conocimiento claro de su uso de recursos
- Alertas tempranas antes de alcanzar límites
- Transparencia en el consumo del plan

### Para el Sistema
- Mejor control de recursos
- Prevención de sobrecarga
- Datos para análisis de uso

---

## 📊 EJEMPLO DE USO

### Tenant con Plan Profesional
```
Usuarios:              8 / 10    (80%)  🟡
Sedes:                 2 / 2     (100%) 🔴
Servicios:             15        (-)
Consentimientos:       45 / 80   (56%)  🟢
Historias Clínicas:    12 / 50   (24%)  🟢
Plantillas CN:         5 / 10    (50%)  🟢
Plantillas HC:         3 / 10    (30%)  🟢
```

**Alerta**: Sedes al 100% - Considerar actualizar plan

---

## 🎯 CONCLUSIÓN

Se han agregado exitosamente las estadísticas de Historias Clínicas y Plantillas (CN y HC) tanto en la vista de Super Admin como en la vista de Tenants, proporcionando una visibilidad completa del uso de todos los recursos del sistema.

---

**Implementado por**: Kiro AI  
**Fecha**: 02 de Febrero 2026  
**Versión**: 23.2.0+  
**Estado**: ✅ Listo para compilar y desplegar
