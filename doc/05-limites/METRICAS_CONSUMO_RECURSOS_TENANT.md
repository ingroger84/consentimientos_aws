# Métricas de Consumo de Recursos por Tenant

**Fecha:** 7 de enero de 2026  
**Estado:** ✅ IMPLEMENTADO

---

## 🎯 Objetivo

Mostrar en cada tarjeta de tenant (en la página de Gestión de Tenants del Super Admin) las métricas de consumo de recursos en tiempo real.

---

## 📊 Métricas Implementadas

### 1. Usuarios
- **Muestra:** Cantidad actual / Límite máximo
- **Ejemplo:** `5 / 100`
- **Barra de progreso:**
  - 🟢 Verde: 0-69% de uso
  - 🟡 Amarillo: 70-89% de uso
  - 🔴 Rojo: 90-100% de uso

### 2. Sedes
- **Muestra:** Cantidad actual / Límite máximo
- **Ejemplo:** `3 / 5`
- **Barra de progreso:**
  - 🟢 Verde: 0-69% de uso
  - 🟡 Amarillo: 70-89% de uso
  - 🔴 Rojo: 90-100% de uso

### 3. Servicios
- **Muestra:** Cantidad actual (sin límite)
- **Ejemplo:** `5`
- **Sin barra de progreso** (no hay límite configurado)

### 4. Consentimientos
- **Muestra:** Cantidad actual / Límite máximo
- **Ejemplo:** `9 / 100`
- **Barra de progreso:**
  - 🟢 Verde: 0-69% de uso
  - 🟡 Amarillo: 70-89% de uso
  - 🔴 Rojo: 90-100% de uso

---

## 🎨 Diseño Visual

### Antes (Solo Límites)
```
┌─────────────────────────────────────┐
│  Usuarios    Sedes    Docs          │
│     100        5       100           │
└─────────────────────────────────────┘
```

### Después (Consumo + Límites)
```
┌─────────────────────────────────────┐
│  Consumo de Recursos                │
│                                      │
│  👥 Usuarios          5 / 100       │
│  ████░░░░░░░░░░░░░░░░░░░░ 5%       │
│                                      │
│  📍 Sedes             3 / 5         │
│  ████████████░░░░░░░░░░░░ 60%      │
│                                      │
│  📄 Servicios         5             │
│                                      │
│  📋 Consentimientos   9 / 100       │
│  ██░░░░░░░░░░░░░░░░░░░░░░ 9%       │
└─────────────────────────────────────┘
```

---

## 🔧 Implementación Técnica

### Backend

#### 1. Carga de Relaciones
**Archivo:** `backend/src/tenants/tenants.service.ts`

```typescript
async findAll(): Promise<Tenant[]> {
  return await this.tenantsRepository.find({
    relations: ['users', 'branches', 'services', 'consents'],
    order: { createdAt: 'DESC' },
  });
}
```

**Nota:** El backend ya estaba cargando las relaciones necesarias, no se requirieron cambios.

---

### Frontend

#### 1. Actualización de Tipos
**Archivo:** `frontend/src/types/tenant.ts`

```typescript
export interface Tenant {
  // ... campos existentes
  
  // Relaciones para métricas de consumo
  users?: any[];
  branches?: any[];
  services?: any[];
  consents?: any[];
}
```

#### 2. Actualización del Componente TenantCard
**Archivo:** `frontend/src/components/TenantCard.tsx`

**Cambios:**
- Reemplazada sección "Limits" por "Consumo de Recursos"
- Agregadas barras de progreso con colores dinámicos
- Mostrado consumo actual vs límite máximo
- Agregado indicador visual de servicios (sin límite)

**Código clave:**
```typescript
{/* Usuarios */}
<div>
  <div className="flex items-center justify-between mb-1">
    <div className="flex items-center space-x-2">
      <Users className="w-4 h-4 text-gray-400" />
      <span className="text-xs text-gray-600">Usuarios</span>
    </div>
    <span className="text-xs font-semibold text-gray-900">
      {tenant.users?.length || 0} / {tenant.maxUsers}
    </span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className={`h-2 rounded-full transition-all ${
        ((tenant.users?.length || 0) / tenant.maxUsers) * 100 >= 90
          ? 'bg-red-500'
          : ((tenant.users?.length || 0) / tenant.maxUsers) * 100 >= 70
          ? 'bg-yellow-500'
          : 'bg-green-500'
      }`}
      style={{
        width: `${Math.min(((tenant.users?.length || 0) / tenant.maxUsers) * 100, 100)}%`,
      }}
    />
  </div>
</div>
```

---

## 📈 Lógica de Colores

### Barras de Progreso

```typescript
const getProgressColor = (current: number, max: number) => {
  const percentage = (current / max) * 100;
  
  if (percentage >= 90) return 'bg-red-500';    // 🔴 Rojo: Crítico
  if (percentage >= 70) return 'bg-yellow-500'; // 🟡 Amarillo: Advertencia
  return 'bg-green-500';                        // 🟢 Verde: Normal
};
```

### Umbrales
- **0-69%:** 🟢 Verde - Uso normal
- **70-89%:** 🟡 Amarillo - Advertencia, considerar upgrade
- **90-100%:** 🔴 Rojo - Crítico, upgrade necesario

---

## 🎯 Casos de Uso

### Caso 1: Tenant con Bajo Consumo
```
Usuarios:         5 / 100   (5%)   🟢
Sedes:            2 / 5     (40%)  🟢
Servicios:        3
Consentimientos:  10 / 100  (10%)  🟢
```
**Acción:** Ninguna, uso normal

### Caso 2: Tenant Cerca del Límite
```
Usuarios:         75 / 100  (75%)  🟡
Sedes:            4 / 5     (80%)  🟡
Servicios:        15
Consentimientos:  85 / 100  (85%)  🟡
```
**Acción:** Considerar upgrade de plan

### Caso 3: Tenant en Límite Crítico
```
Usuarios:         95 / 100  (95%)  🔴
Sedes:            5 / 5     (100%) 🔴
Servicios:        20
Consentimientos:  98 / 100  (98%)  🔴
```
**Acción:** Upgrade urgente o suspender creación de nuevos recursos

---

## 🔍 Beneficios

### Para el Super Admin
1. ✅ **Visibilidad inmediata** del consumo de cada tenant
2. ✅ **Identificación rápida** de tenants cerca del límite
3. ✅ **Toma de decisiones** informada sobre upgrades
4. ✅ **Prevención de problemas** antes de que ocurran
5. ✅ **Monitoreo visual** sin necesidad de abrir estadísticas

### Para el Negocio
1. ✅ **Oportunidades de upselling** identificadas fácilmente
2. ✅ **Mejor planificación** de recursos del sistema
3. ✅ **Prevención de quejas** por límites alcanzados
4. ✅ **Datos para análisis** de uso por plan

---

## 📊 Ejemplo Visual Completo

```
┌──────────────────────────────────────────────────────────┐
│  🏢 Aguilab Lashes                          ⋮            │
│     /aguilab-lashes                                       │
│                                                           │
│  🟢 Activo    🔵 Basic                                    │
│                                                           │
│  roger.caraballo@gmail.com                               │
│  Andrea Quintero                                         │
│                                                           │
│  📍 URL de Acceso:                                       │
│  http://aguilab-lashes.localhost:5173                    │
│                                                           │
│  ─────────────────────────────────────────────────────   │
│                                                           │
│  Consumo de Recursos                                     │
│                                                           │
│  👥 Usuarios                              5 / 100        │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 5%           │
│                                                           │
│  📍 Sedes                                 5 / 5          │
│  ████████████████████████████████████████ 100% 🔴       │
│                                                           │
│  📄 Servicios                             5              │
│                                                           │
│  📋 Consentimientos                       9 / 100        │
│  ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 9%            │
│                                                           │
│  ─────────────────────────────────────────────────────   │
│                                                           │
│  Creado: 7/1/2026                                        │
└──────────────────────────────────────────────────────────┘
```

---

## 🧪 Cómo Probar

### 1. Iniciar el Sistema
```powershell
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Acceder como Super Admin
```
URL: http://admin.localhost:5173
Email: superadmin@sistema.com
Password: superadmin123
```

### 3. Ver Métricas
1. Ir a "Gestión de Tenants"
2. Observar las tarjetas de cada tenant
3. Verificar que se muestren:
   - Cantidad actual de usuarios, sedes, servicios y consentimientos
   - Barras de progreso con colores apropiados
   - Límites máximos

### 4. Crear Recursos para Probar
1. Acceder a un tenant: `http://[slug].localhost:5173`
2. Crear usuarios, sedes, servicios y consentimientos
3. Volver a la página de Tenants del Super Admin
4. Verificar que las métricas se actualizaron

---

## 📁 Archivos Modificados

### Frontend
- `frontend/src/types/tenant.ts` - Agregadas relaciones para métricas
- `frontend/src/components/TenantCard.tsx` - Actualizada UI con barras de progreso

### Backend
- ✅ Sin cambios (ya cargaba las relaciones necesarias)

---

## 🔄 Actualización en Tiempo Real

Las métricas se actualizan automáticamente cuando:
1. Se recarga la página de Tenants
2. Se crea/edita/elimina un tenant
3. Se realiza cualquier acción que llame a `loadData()`

**Nota:** Las métricas NO se actualizan en tiempo real sin recargar. Si se necesita actualización automática, se puede implementar polling o WebSockets.

---

## 🚀 Mejoras Futuras (Opcional)

### 1. Alertas Automáticas
- Notificar al Super Admin cuando un tenant alcance 80% de uso
- Enviar email al tenant cuando esté cerca del límite

### 2. Gráficos de Tendencia
- Mostrar consumo histórico en el modal de estadísticas
- Gráficos de línea para ver evolución del uso

### 3. Recomendaciones de Plan
- Sugerir automáticamente upgrade de plan basado en uso
- Calcular ROI de upgrade

### 4. Exportación de Reportes
- Exportar métricas de todos los tenants a CSV/Excel
- Reportes mensuales de consumo

---

## ✅ Estado Final

**Implementación:** ✅ Completada  
**Pruebas:** ⏳ Pendiente de prueba del usuario  
**Documentación:** ✅ Completada

---

## 📞 Soporte

Si las métricas no se muestran correctamente:

1. Verificar que el backend esté cargando las relaciones:
   ```typescript
   relations: ['users', 'branches', 'services', 'consents']
   ```

2. Verificar en DevTools (Network) que la respuesta incluya los arrays:
   ```json
   {
     "id": "...",
     "name": "...",
     "users": [...],
     "branches": [...],
     "services": [...],
     "consents": [...]
   }
   ```

3. Verificar que no haya errores en la consola del navegador

---

**¡Las métricas de consumo de recursos están listas para usar! 🎉**

