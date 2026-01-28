# Sincronización de Planes entre Gestión y Landing Page

**Fecha:** 2026-01-27  
**Versión:** 15.1.0  
**Estado:** ✅ IMPLEMENTADO

---

## 📋 RESUMEN

Se implementó la sincronización automática entre la gestión de planes del Super Admin y la landing page pública. Ahora cualquier cambio en los planes se refleja inmediatamente en la landing page.

---

## 🎯 OBJETIVOS CUMPLIDOS

1. ✅ Integrar todos los límites de recursos en la gestión de planes
2. ✅ Incluir nuevos límites: HC, Plantillas HC, Plantillas CN, API Access
3. ✅ Sincronización automática con la landing page
4. ✅ Endpoint público para obtener planes sin autenticación
5. ✅ Soporte para valores ilimitados (-1)

---

## 🔧 CAMBIOS IMPLEMENTADOS

### Backend

#### 1. `backend/src/plans/plans.controller.ts`
**Cambios:**
- ✅ Agregado endpoint público `GET /plans/public`
- ✅ Endpoint no requiere autenticación
- ✅ Permite que la landing page obtenga los planes

```typescript
@Get('public')
findAllPublic() {
  return this.plansService.findAll();
}
```

#### 2. `backend/src/plans/plans.service.ts`
**Cambios:**
- ✅ Actualizado `generatePlansFileContent()` con nuevos campos
- ✅ Incluye: medicalRecords, mrConsentTemplates, consentTemplates
- ✅ Incluye: apiAccess en features
- ✅ Mantiene funciones de carga dinámica desde JSON

#### 3. `backend/src/plans/dto/update-plan.dto.ts`
**Cambios:**
- ✅ Agregados nuevos campos en `LimitsDto`:
  - `medicalRecords?: number`
  - `mrConsentTemplates?: number`
  - `consentTemplates?: number`
- ✅ Agregado `apiAccess?: boolean` en `FeaturesDto`
- ✅ Cambiado `@Min(1)` a `@Min(-1)` para permitir ilimitados

### Frontend

#### 4. `frontend/src/services/plans.service.ts`
**Cambios:**
- ✅ Actualizada interface `PlanConfig` con nuevos límites
- ✅ Agregado `medicalRecords`, `mrConsentTemplates`, `consentTemplates`
- ✅ Mantiene métodos de formateo y cálculo

#### 5. `frontend/src/pages/PlansManagementPage.tsx`
**Cambios:**
- ✅ Agregados nuevos campos en el formulario de edición:
  - Historias Clínicas (HC)
  - Plantillas CN
  - Plantillas HC
- ✅ Soporte para valores ilimitados (-1)
- ✅ Placeholder: "-1 = ilimitado"
- ✅ Muestra "Ilimitado" en lugar de -1 en vista

#### 6. `frontend/src/components/landing/PricingSection.tsx`
**Cambios:**
- ✅ Cambiado endpoint de `/tenants/plans` a `/plans/public`
- ✅ Ya incluía soporte para nuevos límites (implementado previamente)
- ✅ Formato inteligente: ilimitados, GB, singular/plural

---

## 🚀 FLUJO DE SINCRONIZACIÓN

### 1. Super Admin Edita Plan

```
Super Admin → Gestión de Planes → Editar Plan
  ↓
Cambiar límites (ej: HC de 5 a 10)
  ↓
Guardar cambios
  ↓
Backend actualiza plans.config.ts
  ↓
Cambios guardados en memoria y archivo
```

### 2. Landing Page Obtiene Planes

```
Usuario visita Landing Page
  ↓
Frontend llama GET /plans/public
  ↓
Backend devuelve planes actualizados
  ↓
Landing muestra nuevos límites
```

### 3. Sincronización Automática

- ✅ Los cambios son inmediatos
- ✅ No requiere reiniciar el backend
- ✅ No requiere reiniciar el frontend
- ✅ La landing page se actualiza en el próximo refresh

---

## 📊 LÍMITES CONFIGURABLES

### Recursos Principales
- **Usuarios:** Cantidad de usuarios por tenant
- **Sedes:** Cantidad de sedes/sucursales
- **Consentimientos (CN):** Consentimientos tradicionales por mes
- **Historias Clínicas (HC):** Historias clínicas por mes
- **Plantillas CN:** Plantillas de consentimientos
- **Plantillas HC:** Plantillas de historias clínicas
- **Servicios:** Servicios médicos configurables
- **Preguntas:** Preguntas en formularios
- **Storage:** Almacenamiento en MB

### Valores Especiales
- **-1:** Ilimitado (solo para plan Empresarial)
- **0:** No disponible (no recomendado)
- **> 0:** Límite específico

---

## 🎨 INTERFAZ DE GESTIÓN

### Vista de Edición

```
┌─────────────────────────────────────┐
│ Plan: Básico                    [✏️] │
│ Para pequeñas clínicas...            │
├─────────────────────────────────────┤
│ Precios                              │
│ Mensual: $ 89.900                    │
│ Anual:   $ 895.404                   │
├─────────────────────────────────────┤
│ Límites de Recursos                  │
│ 👥 Usuarios:              2          │
│ 🏢 Sedes:                 1          │
│ 📄 Consentimientos (CN):  100        │
│ 📋 Historias Clínicas:    30         │
│ 📝 Plantillas CN:         10         │
│ 📑 Plantillas HC:         5          │
│ 💼 Servicios:             5          │
│ ❓ Preguntas:             10         │
│ 💾 Storage (MB):          500        │
└─────────────────────────────────────┘
```

### Vista de Landing Page

```
┌─────────────────────────────────────┐
│           Plan Básico                │
│   Para pequeñas clínicas...          │
│                                      │
│        $ 89.900 / mes                │
│                                      │
│  [Seleccionar Plan]                  │
│                                      │
│ ✓ 2 usuarios                         │
│ ✓ 1 sede                             │
│ ✓ 100 consentimientos/mes            │
│ ✓ 30 historias clínicas/mes          │
│ ✓ 10 plantillas CN                   │
│ ✓ 5 plantillas HC                    │
│ ✓ 500 MB de almacenamiento           │
│ ✓ Personalización completa           │
│ ✓ Soporte: 24h                       │
└─────────────────────────────────────┘
```

---

## ✅ PRUEBAS RECOMENDADAS

### Prueba 1: Editar Plan desde Super Admin

1. Acceder como Super Admin
2. Ir a "Gestión de Planes"
3. Editar plan "Básico"
4. Cambiar "Historias Clínicas" de 30 a 50
5. Guardar cambios
6. Verificar mensaje de éxito

**Resultado esperado:**
- ✅ Plan actualizado correctamente
- ✅ Cambios guardados en `plans.config.ts`

### Prueba 2: Verificar en Landing Page

1. Abrir landing page en navegador (sin autenticación)
2. Ir a sección de precios
3. Buscar plan "Básico"
4. Verificar que muestre "50 historias clínicas/mes"

**Resultado esperado:**
- ✅ Landing muestra el nuevo límite
- ✅ Formato correcto: "50 historias clínicas/mes"

### Prueba 3: Valores Ilimitados

1. Editar plan "Empresarial"
2. Cambiar "Historias Clínicas" a -1
3. Guardar cambios
4. Verificar en gestión: muestra "Ilimitado"
5. Verificar en landing: muestra "Historias clínicas ilimitadas"

**Resultado esperado:**
- ✅ Gestión muestra "Ilimitado"
- ✅ Landing muestra "ilimitadas"

### Prueba 4: Múltiples Cambios

1. Editar plan "Emprendedor"
2. Cambiar varios límites:
   - CN: 300 → 500
   - HC: 100 → 150
   - Plantillas CN: 20 → 30
   - Plantillas HC: 10 → 15
3. Guardar cambios
4. Verificar todos los cambios en landing

**Resultado esperado:**
- ✅ Todos los cambios se reflejan
- ✅ Formato correcto en landing

---

## 🔍 VERIFICACIÓN TÉCNICA

### Verificar Endpoint Público

```bash
curl http://localhost:3000/api/plans/public
```

**Respuesta esperada:**
```json
[
  {
    "id": "free",
    "name": "Gratuito",
    "limits": {
      "users": 1,
      "branches": 1,
      "consents": 20,
      "medicalRecords": 5,
      "mrConsentTemplates": 2,
      "consentTemplates": 3,
      ...
    },
    ...
  },
  ...
]
```

### Verificar Archivo de Configuración

```bash
cat backend/src/tenants/plans.config.ts
```

**Debe contener:**
- ✅ Interface con nuevos campos
- ✅ PLANS con valores actualizados
- ✅ Funciones de carga dinámica

---

## 📝 NOTAS IMPORTANTES

### Para Desarrollo

- ✅ Los cambios son inmediatos (no requiere reinicio)
- ✅ El archivo `plans.config.ts` se actualiza automáticamente
- ✅ La landing page obtiene datos en tiempo real

### Para Producción

- ⚠️ Los cambios en planes NO afectan tenants existentes
- ⚠️ Solo se aplican a nuevas asignaciones de planes
- ⚠️ Para actualizar tenants existentes, hacerlo manualmente
- ⚠️ Considerar comunicar cambios a clientes

### Política de Sincronización

**IMPORTANTE:** Los cambios en planes NO actualizan automáticamente los límites de tenants existentes. Esto es intencional para:

1. Evitar reducir límites de clientes sin aviso
2. Permitir límites personalizados por tenant
3. Mantener contratos existentes

Si necesitas actualizar tenants existentes:
- Hazlo manualmente desde "Gestión de Tenants"
- O implementa un script de migración específico

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### Corto Plazo

1. ✅ Probar todos los escenarios de edición
2. ✅ Verificar formato en landing page
3. ✅ Documentar cambios para el equipo
4. ✅ Comunicar nueva funcionalidad

### Mediano Plazo

1. ✅ Agregar historial de cambios en planes
2. ✅ Notificar a Super Admin cuando se edita un plan
3. ✅ Agregar preview de cómo se verá en landing
4. ✅ Implementar versionado de planes

### Largo Plazo

1. ✅ Sistema de migración de tenants a nuevos límites
2. ✅ Análisis de impacto antes de cambiar planes
3. ✅ Alertas si un cambio afectaría a muchos tenants
4. ✅ Dashboard de uso vs límites por plan

---

## 🐛 TROUBLESHOOTING

### Problema: Cambios no se reflejan en landing

**Solución:**
1. Verificar que el backend esté corriendo
2. Verificar endpoint: `curl http://localhost:3000/api/plans/public`
3. Limpiar caché del navegador
4. Verificar consola del navegador por errores

### Problema: Error al guardar cambios

**Solución:**
1. Verificar permisos de escritura en `plans.config.ts`
2. Verificar que el archivo existe
3. Verificar logs del backend
4. Verificar que los valores sean válidos (-1 o > 0)

### Problema: Valores ilimitados no se muestran

**Solución:**
1. Verificar que el valor sea exactamente -1
2. Verificar formato en `getFeaturesList()`
3. Limpiar caché del navegador

---

**Documento creado:** 2026-01-27  
**Versión:** 1.0  
**Estado:** ✅ IMPLEMENTACIÓN COMPLETADA
