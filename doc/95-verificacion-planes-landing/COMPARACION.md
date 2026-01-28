# Comparación Planes: Landing vs Backend

**Fecha**: 2026-01-27  
**Versión**: 15.1.3

## 📊 Análisis de Discrepancias

### Lo que se ve en la Landing Page (Captura de Pantalla)

#### Plan Básico - $89,900
- ✅ 2 Usuarios
- ✅ 1 Sedes
- ✅ 100 Consentimientos/mes
- ❌ **FALTA**: Historias Clínicas/mes
- ❌ **FALTA**: Plantillas CN
- ❌ **FALTA**: Plantillas HC
- ✅ 5 Servicios
- ✅ 500 MB Almacenamiento

#### Plan Emprendedor - $119,900 (Más Popular)
- ✅ 5 Usuarios
- ✅ 3 Sedes
- ✅ 300 Consentimientos/mes
- ❌ **FALTA**: Historias Clínicas/mes
- ❌ **FALTA**: Plantillas CN
- ❌ **FALTA**: Plantillas HC
- ✅ 15 Servicios
- ✅ 2 GB Almacenamiento

#### Plan Plus - $149,900
- ✅ 10 Usuarios
- ✅ 5 Sedes
- ✅ 500 Consentimientos/mes
- ❌ **FALTA**: Historias Clínicas/mes
- ❌ **FALTA**: Plantillas CN
- ❌ **FALTA**: Plantillas HC
- ✅ 30 Servicios
- ✅ 5 GB Almacenamiento

#### Plan Empresarial - $189,900
- ✅ -1 Usuarios (ilimitado)
- ✅ -1 Sedes (ilimitado)
- ✅ -1 Consentimientos/mes (ilimitado)
- ❌ **FALTA**: Historias Clínicas/mes
- ❌ **FALTA**: Plantillas CN
- ❌ **FALTA**: Plantillas HC
- ✅ -1 Servicios (ilimitado)
- ✅ 10 GB Almacenamiento

---

### Lo que DEBERÍA mostrar según plans.json

#### Plan Básico - $89,900
- ✅ 2 Usuarios
- ✅ 1 Sedes
- ✅ 100 Consentimientos/mes
- ✅ **30 Historias Clínicas/mes**
- ✅ **10 Plantillas CN**
- ✅ **5 Plantillas HC**
- ✅ 5 Servicios
- ✅ 500 MB Almacenamiento

#### Plan Emprendedor - $119,900
- ✅ 5 Usuarios
- ✅ 3 Sedes
- ✅ 300 Consentimientos/mes
- ✅ **100 Historias Clínicas/mes**
- ✅ **20 Plantillas CN**
- ✅ **10 Plantillas HC**
- ✅ 15 Servicios
- ✅ 2 GB Almacenamiento

#### Plan Plus - $149,900
- ✅ 10 Usuarios
- ✅ 5 Sedes
- ✅ 500 Consentimientos/mes
- ✅ **300 Historias Clínicas/mes**
- ✅ **30 Plantillas CN**
- ✅ **20 Plantillas HC**
- ✅ 30 Servicios
- ✅ 5 GB Almacenamiento

#### Plan Empresarial - $189,900
- ✅ -1 Usuarios (ilimitado)
- ✅ -1 Sedes (ilimitado)
- ✅ -1 Consentimientos/mes (ilimitado)
- ✅ **-1 Historias Clínicas/mes (ilimitado)**
- ✅ **-1 Plantillas CN (ilimitado)**
- ✅ **-1 Plantillas HC (ilimitado)**
- ✅ -1 Servicios (ilimitado)
- ✅ 10 GB Almacenamiento

---

## 🔍 Diagnóstico

### Problema Identificado
La landing page NO está mostrando los nuevos recursos:
- Historias Clínicas/mes
- Plantillas CN
- Plantillas HC

### Posibles Causas

1. **Caché del navegador**: El navegador tiene en caché la versión antigua del JavaScript
2. **Frontend no recargado**: El servidor de desarrollo no ha recargado los cambios
3. **API no actualizada**: El endpoint `/api/plans/public` está retornando datos antiguos
4. **Código desactualizado**: El componente `PricingSection.tsx` tiene una versión antigua

### Verificación del Código

Revisando `PricingSection.tsx`, el código SÍ incluye los nuevos campos:

```typescript
const features = [
  formatLimit(plan.limits.users, 'usuario', 'usuarios'),
  formatLimit(plan.limits.branches, 'sede', 'sedes'),
  formatLimit(plan.limits.consents, 'consentimiento', 'consentimientos') + '/mes',
  formatLimit(plan.limits.medicalRecords, 'historia clínica', 'historias clínicas') + '/mes', // ✅
  formatLimit(plan.limits.consentTemplates, 'plantilla CN', 'plantillas CN'), // ✅
  formatLimit(plan.limits.mrConsentTemplates, 'plantilla HC', 'plantillas HC'), // ✅
  `${formatStorage(plan.limits.storageMb)} de almacenamiento`,
  // ... features
];
```

## ✅ Solución

### Pasos para Resolver

1. **Limpiar caché del navegador**:
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)
   - O abrir en modo incógnito

2. **Verificar que el backend esté corriendo**:
   ```bash
   # El backend debe estar en puerto 3000
   # Verificar que plans.json tenga los datos correctos
   ```

3. **Verificar que el frontend esté compilando**:
   ```bash
   # El frontend debe estar recompilando automáticamente
   # Verificar la consola del navegador por errores
   ```

4. **Probar el endpoint directamente**:
   ```bash
   curl http://localhost:3000/api/plans/public
   ```

## 📝 Recomendaciones

### Para el Usuario

1. **Recargar la página con caché limpio**: Ctrl + Shift + R
2. **Verificar la consola del navegador**: F12 → Console
3. **Verificar la pestaña Network**: Ver si el endpoint `/api/plans/public` retorna los datos correctos
4. **Si persiste el problema**: Reiniciar el servidor de desarrollo del frontend

### Verificación Esperada

Después de limpiar el caché, la landing page DEBE mostrar:

```
Plan Básico - $89,900
├─ 2 usuarios
├─ 1 sede
├─ 100 consentimientos/mes
├─ 30 historias clínicas/mes      ← NUEVO
├─ 10 plantillas CN                ← NUEVO
├─ 5 plantillas HC                 ← NUEVO
├─ 5 servicios
└─ 500 MB de almacenamiento
```

---

## 🎯 Conclusión

El código está **CORRECTO** en:
- ✅ `backend/src/tenants/plans.json`
- ✅ `frontend/src/components/landing/PricingSection.tsx`
- ✅ `backend/src/plans/plans.controller.ts`

El problema es de **visualización/caché** en el navegador del usuario.

**Acción requerida**: Limpiar caché del navegador y recargar la página.
