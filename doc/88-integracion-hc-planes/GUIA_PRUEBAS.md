# Guía de Pruebas - Planes Mejorados con HC

**Fecha:** 2026-01-27  
**Versión:** 15.0.14

---

## 🎯 OBJETIVO

Verificar que los límites de planes funcionan correctamente y que las validaciones impiden exceder los límites configurados.

---

## 📋 PRE-REQUISITOS

1. ✅ Migración SQL aplicada (`apply-hc-limits-migration.ps1`)
2. ✅ Backend reiniciado
3. ✅ Frontend compilado
4. ✅ Acceso a Super Admin
5. ✅ Tenant de prueba creado

---

## 🧪 PRUEBAS A REALIZAR

### PRUEBA 1: Verificar Planes en Super Admin

**Objetivo:** Confirmar que los planes muestran los nuevos límites

**Pasos:**
1. Acceder a Super Admin
2. Ir a "Gestión de Planes"
3. Verificar cada plan

**Resultado Esperado:**

| Plan | CN | HC | Plantillas CN | Plantillas HC | Storage |
|------|----|----|---------------|---------------|---------|
| Gratuito | 20 | 5 | 3 | 2 | 200 MB |
| Básico | 100 | 30 | 10 | 5 | 500 MB |
| Emprendedor | 300 | 100 | 20 | 10 | 2 GB |
| Plus | 500 | 300 | 30 | 20 | 5 GB |
| Empresarial | ♾️ | ♾️ | ♾️ | ♾️ | 10 GB |

**Estado:** [ ] Pasó [ ] Falló

---

### PRUEBA 2: Verificar Landing Page

**Objetivo:** Confirmar que la landing page muestra los límites correctamente

**Pasos:**
1. Abrir `http://localhost:5173/landing`
2. Scroll hasta sección de planes
3. Verificar cada plan

**Resultado Esperado:**
- ✅ Muestra "20 consentimientos/mes" (no "20 consentimiento/mes")
- ✅ Muestra "5 historias clínicas/mes"
- ✅ Muestra "3 plantillas CN"
- ✅ Muestra "2 plantillas HC"
- ✅ Muestra "200 MB de almacenamiento"
- ✅ Plan Empresarial muestra "Ilimitados" (no "-1")
- ✅ Storage en GB cuando corresponde (2 GB, no 2000 MB)

**Estado:** [ ] Pasó [ ] Falló

---

### PRUEBA 3: Límite de Historias Clínicas

**Objetivo:** Verificar que no se pueden crear más HC del límite del plan

**Pasos:**
1. Crear tenant de prueba con plan **Gratuito** (límite: 5 HC)
2. Crear 5 historias clínicas
3. Intentar crear la 6ta historia clínica

**Resultado Esperado:**
```
❌ Error: Has alcanzado el límite de 5 historias clínicas de tu plan Gratuito. 
Actualiza tu plan para crear más.
```

**Verificación Adicional:**
```sql
-- Contar HC del tenant
SELECT COUNT(*) FROM medical_records WHERE tenant_id = 'ID_DEL_TENANT';
-- Debe mostrar: 5
```

**Estado:** [ ] Pasó [ ] Falló

---

### PRUEBA 4: Límite de Plantillas HC

**Objetivo:** Verificar que no se pueden crear más plantillas HC del límite

**Pasos:**
1. Usar tenant con plan **Básico** (límite: 5 plantillas HC)
2. Ir a "Plantillas de HC"
3. Crear 5 plantillas
4. Intentar crear la 6ta plantilla

**Resultado Esperado:**
```
❌ Error: Has alcanzado el límite de 5 plantillas de HC de tu plan Básico. 
Actualiza tu plan para crear más.
```

**Verificación Adicional:**
```sql
-- Contar plantillas HC del tenant
SELECT COUNT(*) FROM mr_consent_templates WHERE tenant_id = 'ID_DEL_TENANT';
-- Debe mostrar: 5
```

**Estado:** [ ] Pasó [ ] Falló

---

### PRUEBA 5: Límite de Plantillas CN

**Objetivo:** Verificar que no se pueden crear más plantillas CN del límite

**Pasos:**
1. Usar tenant con plan **Gratuito** (límite: 3 plantillas CN)
2. Ir a "Plantillas de Consentimientos"
3. Crear 3 plantillas
4. Intentar crear la 4ta plantilla

**Resultado Esperado:**
```
❌ Error: Has alcanzado el límite de 3 plantillas de consentimientos de tu plan Gratuito. 
Actualiza tu plan para crear más.
```

**Verificación Adicional:**
```sql
-- Contar plantillas CN del tenant
SELECT COUNT(*) FROM consent_templates WHERE tenant_id = 'ID_DEL_TENANT';
-- Debe mostrar: 3
```

**Estado:** [ ] Pasó [ ] Falló

---

### PRUEBA 6: Plan Ilimitado (Empresarial)

**Objetivo:** Verificar que el plan Empresarial no tiene límites

**Pasos:**
1. Crear tenant con plan **Empresarial**
2. Crear 20 historias clínicas
3. Crear 30 plantillas HC
4. Crear 40 plantillas CN

**Resultado Esperado:**
- ✅ Todas las creaciones exitosas
- ✅ Sin mensajes de error
- ✅ Puede seguir creando más

**Verificación Adicional:**
```sql
-- Verificar plan del tenant
SELECT p.name, p.medical_records_limit, p.mr_consent_templates_limit, p.consent_templates_limit
FROM tenants t
JOIN plans p ON t.plan_id = p.id
WHERE t.id = 'ID_DEL_TENANT';
-- Debe mostrar: Empresarial, -1, -1, -1
```

**Estado:** [ ] Pasó [ ] Falló

---

### PRUEBA 7: Upgrade de Plan

**Objetivo:** Verificar que al cambiar de plan, los límites se actualizan

**Pasos:**
1. Tenant con plan **Gratuito** (5 HC creadas, límite alcanzado)
2. Super Admin cambia plan a **Básico** (límite: 30 HC)
3. Intentar crear nueva HC

**Resultado Esperado:**
- ✅ Creación exitosa
- ✅ Ahora puede crear hasta 30 HC total

**Verificación Adicional:**
```sql
-- Verificar cambio de plan
SELECT t.name, p.name as plan, p.medical_records_limit
FROM tenants t
JOIN plans p ON t.plan_id = p.id
WHERE t.id = 'ID_DEL_TENANT';
-- Debe mostrar: Básico, 30
```

**Estado:** [ ] Pasó [ ] Falló

---

### PRUEBA 8: Super Admin Sin Límites

**Objetivo:** Verificar que Super Admin no tiene límites

**Pasos:**
1. Acceder como Super Admin
2. Ir a "Plantillas Globales de HC"
3. Crear 50 plantillas globales

**Resultado Esperado:**
- ✅ Todas las creaciones exitosas
- ✅ Sin mensajes de error
- ✅ Super Admin no tiene restricciones

**Nota:** Super Admin tiene `tenantId = null`, por lo que las validaciones no aplican.

**Estado:** [ ] Pasó [ ] Falló

---

### PRUEBA 9: Mensajes de Error Claros

**Objetivo:** Verificar que los mensajes de error son útiles

**Pasos:**
1. Alcanzar límite de HC en plan Gratuito
2. Intentar crear nueva HC
3. Leer mensaje de error

**Resultado Esperado:**
```
❌ Has alcanzado el límite de 5 historias clínicas de tu plan Gratuito. 
   Actualiza tu plan para crear más.
```

**Verificar:**
- ✅ Menciona el límite específico (5)
- ✅ Menciona el nombre del plan (Gratuito)
- ✅ Sugiere acción (Actualiza tu plan)
- ✅ Mensaje en español
- ✅ Fácil de entender

**Estado:** [ ] Pasó [ ] Falló

---

### PRUEBA 10: Formato en Landing Page

**Objetivo:** Verificar formato correcto de límites

**Pasos:**
1. Abrir landing page
2. Revisar plan Emprendedor

**Resultado Esperado:**
```
✓ 5 usuarios (no "5 usuario")
✓ 3 sedes (no "3 sede")
✓ 300 consentimientos/mes
✓ 100 historias clínicas/mes
✓ 20 plantillas CN
✓ 10 plantillas HC
✓ 2 GB de almacenamiento (no "2000 MB")
✓ Personalización completa
✓ Reportes avanzados
✓ Soporte prioritario
✓ Backup semanal
✓ Soporte: 12h
```

**Estado:** [ ] Pasó [ ] Falló

---

## 🔍 VERIFICACIÓN SQL

### Script de Verificación Completa

```sql
-- 1. Verificar columnas agregadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'plans' 
AND column_name IN (
  'medical_records_limit', 
  'mr_consent_templates_limit', 
  'consent_templates_limit', 
  'api_access'
)
ORDER BY column_name;

-- 2. Verificar valores de planes
SELECT 
  id,
  name,
  consents_limit as cn,
  medical_records_limit as hc,
  mr_consent_templates_limit as plantillas_hc,
  consent_templates_limit as plantillas_cn,
  users_limit as usuarios,
  branches_limit as sedes,
  storage_mb as storage,
  api_access
FROM plans
ORDER BY 
  CASE id
    WHEN 'free' THEN 1
    WHEN 'basic' THEN 2
    WHEN 'professional' THEN 3
    WHEN 'enterprise' THEN 4
    WHEN 'custom' THEN 5
  END;

-- 3. Verificar uso de recursos de un tenant
SELECT 
  t.name as tenant,
  p.name as plan,
  (SELECT COUNT(*) FROM medical_records WHERE tenant_id = t.id) as hc_usadas,
  p.medical_records_limit as hc_limite,
  (SELECT COUNT(*) FROM mr_consent_templates WHERE tenant_id = t.id) as plantillas_hc_usadas,
  p.mr_consent_templates_limit as plantillas_hc_limite,
  (SELECT COUNT(*) FROM consent_templates WHERE tenant_id = t.id) as plantillas_cn_usadas,
  p.consent_templates_limit as plantillas_cn_limite
FROM tenants t
JOIN plans p ON t.plan_id = p.id
WHERE t.slug = 'demo-medico';

-- 4. Verificar tenants cerca del límite (>80%)
SELECT 
  t.name as tenant,
  p.name as plan,
  (SELECT COUNT(*) FROM medical_records WHERE tenant_id = t.id) as hc_usadas,
  p.medical_records_limit as hc_limite,
  ROUND(
    (SELECT COUNT(*) FROM medical_records WHERE tenant_id = t.id)::numeric / 
    NULLIF(p.medical_records_limit, -1)::numeric * 100, 
    2
  ) as porcentaje_uso
FROM tenants t
JOIN plans p ON t.plan_id = p.id
WHERE p.medical_records_limit > 0
AND (SELECT COUNT(*) FROM medical_records WHERE tenant_id = t.id)::numeric / 
    p.medical_records_limit::numeric > 0.8;
```

---

## 📊 RESULTADOS ESPERADOS

### Resumen de Pruebas

| # | Prueba | Estado | Notas |
|---|--------|--------|-------|
| 1 | Planes en Super Admin | [ ] | |
| 2 | Landing Page | [ ] | |
| 3 | Límite HC | [ ] | |
| 4 | Límite Plantillas HC | [ ] | |
| 5 | Límite Plantillas CN | [ ] | |
| 6 | Plan Ilimitado | [ ] | |
| 7 | Upgrade de Plan | [ ] | |
| 8 | Super Admin Sin Límites | [ ] | |
| 9 | Mensajes de Error | [ ] | |
| 10 | Formato Landing | [ ] | |

### Criterios de Éxito

- ✅ Todas las pruebas pasan
- ✅ Mensajes de error claros
- ✅ Formato correcto en UI
- ✅ Validaciones funcionan
- ✅ Plan ilimitado funciona
- ✅ Super Admin sin restricciones

---

## 🐛 PROBLEMAS COMUNES

### Problema 1: Error "Plan no encontrado"
**Causa:** Migración no aplicada o plan no existe
**Solución:** Ejecutar `apply-hc-limits-migration.ps1`

### Problema 2: Límites no se respetan
**Causa:** Backend no reiniciado
**Solución:** Reiniciar backend con `npm run start:dev`

### Problema 3: Landing page no muestra límites
**Causa:** Frontend no compilado o cache
**Solución:** 
```bash
cd frontend
npm run build
# O limpiar cache del navegador
```

### Problema 4: Super Admin tiene límites
**Causa:** tenantId no es null
**Solución:** Verificar que Super Admin tenga `tenantId = null` en BD

---

## 📝 NOTAS FINALES

- Ejecutar todas las pruebas en orden
- Documentar cualquier fallo
- Tomar screenshots de errores
- Verificar logs del backend
- Probar en diferentes navegadores

---

**Documento creado:** 2026-01-27  
**Versión:** 1.0

