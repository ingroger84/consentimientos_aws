# 🎯 Plan de Acción: Problema Creación Plantillas - Aquiub

**Fecha:** 22 de Mayo 2026  
**Estado:** Diagnóstico completado, pendiente de validación

---

## 📋 RESUMEN EJECUTIVO

**Problema:** Botón de crear plantilla se queda cargando  
**Causa Probable (85%):** Falta seleccionar servicio en el formulario  
**Impacto:** Usuario no puede crear nuevas plantillas  
**Urgencia:** Media (funcionalidad bloqueada pero no crítica)

---

## ✅ FASE 1: VALIDACIÓN RÁPIDA (5 minutos)

### Acción 1.1: Verificar Servicios
```bash
# Conectar al servidor y verificar servicios del tenant
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ejecutar query
psql $DATABASE_URL -c "
SELECT COUNT(*) as total_servicios
FROM services
WHERE \"tenantId\" = '2852b690-9401-4ad0-bc70-899977696e8d';
"
```

**Resultado Esperado:**
- Si `total_servicios = 0` → El tenant necesita crear servicios primero
- Si `total_servicios > 0` → Continuar con Acción 1.2

### Acción 1.2: Pedir al Usuario que Pruebe
Enviar al usuario: `INSTRUCCIONES_USUARIO_AQUIUB_PLANTILLAS.md`

**Instrucción clave:** "Al crear la plantilla, asegúrate de seleccionar al menos un servicio"

---

## 🔍 FASE 2: DIAGNÓSTICO DETALLADO (10 minutos)

### Si la Fase 1 no resuelve el problema:

### Acción 2.1: Capturar Error Exacto
Pedir al usuario que:
1. Abra DevTools (F12)
2. Vaya a Network
3. Intente crear plantilla
4. Capture el error de la petición `consent-templates`

### Acción 2.2: Revisar Logs del Servidor
```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ver logs en tiempo real
pm2 logs datagree --lines 100

# Pedir al usuario que intente crear plantilla mientras se ven los logs
```

### Acción 2.3: Verificar Permisos
```bash
# Verificar permisos del usuario
psql $DATABASE_URL -c "
SELECT 
  u.email,
  u.name,
  p.name as perfil,
  p.permissions->'templates.create' as puede_crear_plantillas
FROM users u
JOIN profiles p ON u.\"profileId\" = p.id
WHERE u.\"tenantId\" = '2852b690-9401-4ad0-bc70-899977696e8d';
"
```

---

## 🔧 FASE 3: SOLUCIONES SEGÚN EL ERROR

### Escenario A: Error "Debe asociar al menos un servicio"

**Solución Inmediata:**
- Instruir al usuario a seleccionar un servicio

**Solución a Largo Plazo (Opcional):**
```typescript
// Modificar backend/src/consent-templates/consent-templates.service.ts
private async validateServices(serviceIds: string[], tenantId: string | null) {
  if (!serviceIds || serviceIds.length === 0) {
    return []; // Permitir plantillas sin servicios
  }
  // ... resto del código
}
```

### Escenario B: Error "Has alcanzado el límite"

**Solución:**
```sql
-- Aumentar límite de plantillas
UPDATE tenants 
SET max_consent_templates = 2000 
WHERE id = '2852b690-9401-4ad0-bc70-899977696e8d';
```

### Escenario C: Error 403 (Sin permisos)

**Solución:**
```sql
-- Actualizar permisos del perfil
UPDATE profiles
SET permissions = jsonb_set(
  permissions::jsonb,
  '{templates.create}',
  'true'::jsonb
)
WHERE id = (
  SELECT "profileId" 
  FROM users 
  WHERE "tenantId" = '2852b690-9401-4ad0-bc70-899977696e8d' 
  LIMIT 1
);
```

### Escenario D: Error 500 (Error del servidor)

**Solución:**
1. Revisar logs completos: `pm2 logs datagree --lines 500`
2. Identificar el stack trace
3. Corregir el error en el código
4. Desplegar la corrección

---

## 📊 FASE 4: VERIFICACIÓN (5 minutos)

### Acción 4.1: Prueba de Creación
1. Pedir al usuario que intente crear una plantilla nuevamente
2. Verificar que se cree correctamente
3. Verificar que aparezca en la lista de plantillas

### Acción 4.2: Verificación en Base de Datos
```bash
# Verificar que la plantilla se creó
psql $DATABASE_URL -c "
SELECT 
  id,
  name,
  type,
  \"isActive\",
  \"createdAt\"
FROM consent_templates
WHERE \"tenantId\" = '2852b690-9401-4ad0-bc70-899977696e8d'
ORDER BY \"createdAt\" DESC
LIMIT 5;
"
```

---

## 📝 FASE 5: DOCUMENTACIÓN (5 minutos)

### Acción 5.1: Actualizar Documentación
Crear documento: `SOLUCION_FINAL_AQUIUB_PLANTILLAS_22_MAYO_2026.md`

Incluir:
- Causa raíz confirmada
- Solución aplicada
- Pasos de verificación
- Lecciones aprendidas

### Acción 5.2: Mejoras Preventivas (Opcional)

**Frontend:**
```typescript
// Mejorar validación en el formulario
if (!selectedServices || selectedServices.length === 0) {
  toast.error('Debes seleccionar al menos un servicio');
  return;
}
```

**Backend:**
```typescript
// Mejorar mensaje de error
throw new BadRequestException({
  message: 'Debe asociar al menos un servicio a la plantilla',
  field: 'serviceIds',
  hint: 'Selecciona uno o más servicios de la lista'
});
```

---

## ⏱️ TIEMPO ESTIMADO TOTAL

- **Fase 1 (Validación Rápida):** 5 minutos
- **Fase 2 (Diagnóstico Detallado):** 10 minutos
- **Fase 3 (Aplicar Solución):** 5-15 minutos
- **Fase 4 (Verificación):** 5 minutos
- **Fase 5 (Documentación):** 5 minutos

**Total:** 30-40 minutos

---

## 🎯 CRITERIOS DE ÉXITO

- [ ] Usuario puede crear plantillas sin que el botón se quede cargando
- [ ] Las plantillas se guardan correctamente en la base de datos
- [ ] Las plantillas aparecen en la lista
- [ ] No hay errores en los logs del servidor
- [ ] Usuario confirma que el problema está resuelto

---

## 📞 CONTACTOS

**Usuario:** Aquiub Casa de Pestañas  
**Tenant ID:** 2852b690-9401-4ad0-bc70-899977696e8d  
**Servidor:** 100.28.198.249  

---

## 📚 DOCUMENTOS DE REFERENCIA

1. `DIAGNOSTICO_AQUIUB_PLANTILLAS_22_MAYO_2026.md` - Diagnóstico técnico
2. `SOLUCION_AQUIUB_PLANTILLAS_22_MAYO_2026.md` - Análisis de soluciones
3. `INSTRUCCIONES_USUARIO_AQUIUB_PLANTILLAS.md` - Guía para el usuario
4. `RESUMEN_DIAGNOSTICO_AQUIUB_22_MAYO_2026.md` - Resumen ejecutivo

---

**Fecha de Creación:** 22 de Mayo 2026  
**Última Actualización:** 22 de Mayo 2026  
**Estado:** ✅ Plan listo para ejecutar
