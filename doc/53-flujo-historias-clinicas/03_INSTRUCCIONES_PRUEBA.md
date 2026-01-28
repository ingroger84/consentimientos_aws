# Instrucciones de Prueba: Integración HC-Consentimientos

**Fecha:** 2026-01-25  
**Versión:** 15.0.9  
**Tiempo estimado:** 15 minutos

---

## 🎯 Objetivo

Probar la funcionalidad de generación de consentimientos desde una historia clínica activa.

---

## 📋 Pre-requisitos

### 1. Base de Datos
✅ Migración ejecutada:
```bash
cd backend
node run-consent-integration-migration.js
```

### 2. Backend
✅ Backend corriendo en puerto 3000:
```bash
cd backend
npm run start:dev
```

### 3. Frontend
✅ Frontend corriendo en puerto 5173:
```bash
cd frontend
npm run dev
```

### 4. Credenciales
- **URL:** http://demo-medico.localhost:5173
- **Email:** admin@clinicademo.com
- **Password:** Demo123!

---

## 🧪 Casos de Prueba

### Caso 1: Generar Consentimiento General

**Objetivo:** Crear un consentimiento informado general desde una HC activa

**Pasos:**

1. **Iniciar sesión**
   - Ir a http://demo-medico.localhost:5173
   - Ingresar credenciales
   - Verificar que se carga el dashboard

2. **Navegar a Historias Clínicas**
   - Click en menú lateral "Historias Clínicas"
   - Verificar que se muestra la lista de HC

3. **Abrir una HC activa**
   - Click en una HC con estado "Activa"
   - Verificar que se carga la vista detallada
   - Verificar que aparece el botón "Generar Consentimiento" en el header

4. **Abrir modal de generación**
   - Click en "Generar Consentimiento"
   - Verificar que se abre el modal
   - Verificar que muestra el nombre del paciente
   - Verificar que muestra el mensaje informativo

5. **Completar formulario**
   - Seleccionar "Consentimiento Informado General"
   - Agregar notas: "Consentimiento para consulta general"
   - Click en "Generar Consentimiento"

6. **Verificar resultado**
   - Verificar que aparece toast de éxito
   - Verificar que el modal se cierra
   - Verificar que la página se recarga

7. **Ver consentimiento vinculado**
   - Click en tab "Consentimientos"
   - Verificar que aparece el consentimiento creado
   - Verificar que muestra:
     * Número de consentimiento (TEMP-...)
     * Estado "Pendiente"
     * Fecha de creación
     * Notas ingresadas

**Resultado esperado:** ✅ Consentimiento creado y vinculado exitosamente

---

### Caso 2: Generar Consentimiento para Procedimiento

**Objetivo:** Crear un consentimiento para un procedimiento específico

**Pasos:**

1. **Abrir modal de generación**
   - Desde la misma HC, click en "Generar Consentimiento"

2. **Completar formulario de procedimiento**
   - Seleccionar "Procedimiento Específico"
   - Verificar que aparecen campos adicionales
   - Ingresar:
     * Nombre del procedimiento: "Infiltración articular"
     * Código CIE-10: "M25.5"
     * Descripción del diagnóstico: "Dolor articular"
     * Marcar checkbox "Requerido para el procedimiento"
     * Notas: "Procedimiento programado para próxima semana"
   - Click en "Generar Consentimiento"

3. **Verificar resultado**
   - Verificar toast de éxito
   - Ir al tab "Consentimientos"
   - Verificar que aparece el nuevo consentimiento
   - Verificar que muestra:
     * Nombre del procedimiento
     * Código y descripción del diagnóstico
     * Notas adicionales

**Resultado esperado:** ✅ Consentimiento de procedimiento creado con todos los datos

---

### Caso 3: Intentar Generar en HC Cerrada

**Objetivo:** Verificar que no se pueden crear consentimientos en HC cerradas

**Pasos:**

1. **Cerrar una HC**
   - Abrir una HC activa
   - Click en botón "Cerrar Historia Clínica" (si existe)
   - O usar endpoint: `POST /api/medical-records/:id/close`

2. **Intentar generar consentimiento**
   - Verificar que el botón "Generar Consentimiento" NO aparece
   - O si aparece, verificar que muestra error al intentar crear

**Resultado esperado:** ✅ No se permite crear consentimientos en HC cerradas

---

### Caso 4: Ver Lista de Consentimientos

**Objetivo:** Verificar la visualización de múltiples consentimientos

**Pasos:**

1. **Crear varios consentimientos**
   - Generar 3-4 consentimientos diferentes en la misma HC
   - Usar diferentes tipos y datos

2. **Ver lista completa**
   - Ir al tab "Consentimientos"
   - Verificar que se muestran todos los consentimientos
   - Verificar orden (más reciente primero)
   - Verificar que cada uno muestra su información correcta

**Resultado esperado:** ✅ Lista completa y ordenada de consentimientos

---

### Caso 5: Validación de Formulario

**Objetivo:** Verificar validaciones del formulario

**Pasos:**

1. **Intentar enviar sin tipo**
   - Abrir modal
   - No seleccionar tipo de consentimiento
   - Click en "Generar Consentimiento"
   - Verificar mensaje de error: "Selecciona un tipo de consentimiento"

2. **Intentar procedimiento sin nombre**
   - Seleccionar "Procedimiento Específico"
   - No ingresar nombre del procedimiento
   - Click en "Generar Consentimiento"
   - Verificar mensaje de error: "El nombre del procedimiento es requerido"

**Resultado esperado:** ✅ Validaciones funcionando correctamente

---

## 🔍 Verificación en Base de Datos

### Consultar consentimientos vinculados

```sql
-- Ver todos los consentimientos vinculados
SELECT 
  mrc.id,
  mrc.medical_record_id,
  mrc.consent_id,
  mrc.procedure_name,
  mrc.diagnosis_code,
  mrc.diagnosis_description,
  mrc.required_for_procedure,
  mrc.notes,
  mrc.created_at,
  mr.record_number,
  c.full_name as client_name
FROM medical_record_consents mrc
JOIN medical_records mr ON mr.id = mrc.medical_record_id
JOIN clients c ON c.id = mr.client_id
ORDER BY mrc.created_at DESC;
```

### Consultar auditoría

```sql
-- Ver auditoría de creación de consentimientos
SELECT 
  action,
  entity_type,
  entity_id,
  medical_record_id,
  new_values,
  ip_address,
  user_agent,
  created_at
FROM medical_record_audits
WHERE action = 'CREATE_CONSENT'
ORDER BY created_at DESC;
```

---

## 🐛 Problemas Comunes

### Problema 1: Botón no aparece

**Síntoma:** No se ve el botón "Generar Consentimiento"

**Soluciones:**
1. Verificar que la HC está en estado "active"
2. Verificar que el frontend se recompiló correctamente
3. Limpiar caché del navegador (Ctrl + Shift + R)

### Problema 2: Error al crear

**Síntoma:** Error 500 al intentar crear consentimiento

**Soluciones:**
1. Verificar que la migración se ejecutó correctamente
2. Verificar logs del backend
3. Verificar que el backend está corriendo
4. Verificar conexión a base de datos

### Problema 3: No aparece en la lista

**Síntoma:** Consentimiento creado pero no aparece en el tab

**Soluciones:**
1. Recargar la página manualmente
2. Verificar en base de datos que se creó
3. Verificar que el endpoint GET funciona
4. Revisar consola del navegador para errores

### Problema 4: Modal no se cierra

**Síntoma:** Modal permanece abierto después de crear

**Soluciones:**
1. Verificar que no hay errores en consola
2. Cerrar manualmente con la X
3. Recargar la página
4. Verificar que el callback onSuccess se ejecuta

---

## 📊 Checklist de Pruebas

- [ ] Caso 1: Consentimiento general creado
- [ ] Caso 2: Consentimiento de procedimiento creado
- [ ] Caso 3: Validación de HC cerrada funciona
- [ ] Caso 4: Lista de consentimientos se muestra correctamente
- [ ] Caso 5: Validaciones de formulario funcionan
- [ ] Verificación en base de datos exitosa
- [ ] Auditoría registrada correctamente
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del backend
- [ ] Interfaz responsive en móvil

---

## 📝 Reporte de Pruebas

### Información del Tester
- **Nombre:** _______________
- **Fecha:** _______________
- **Navegador:** _______________
- **Versión:** _______________

### Resultados

| Caso de Prueba | Estado | Observaciones |
|----------------|--------|---------------|
| Caso 1         | ⬜ ✅ ❌ |               |
| Caso 2         | ⬜ ✅ ❌ |               |
| Caso 3         | ⬜ ✅ ❌ |               |
| Caso 4         | ⬜ ✅ ❌ |               |
| Caso 5         | ⬜ ✅ ❌ |               |

### Bugs Encontrados

1. **Bug #1**
   - Descripción: _______________
   - Severidad: ⬜ Crítico ⬜ Alto ⬜ Medio ⬜ Bajo
   - Pasos para reproducir: _______________

2. **Bug #2**
   - Descripción: _______________
   - Severidad: ⬜ Crítico ⬜ Alto ⬜ Medio ⬜ Bajo
   - Pasos para reproducir: _______________

### Comentarios Generales

_______________________________________________
_______________________________________________
_______________________________________________

---

## 🎉 Conclusión

Si todos los casos de prueba pasan exitosamente, la funcionalidad está lista para uso en producción. Cualquier bug encontrado debe ser reportado y corregido antes del despliegue.

**Próximo paso:** Implementar integración completa con ConsentsService para crear consentimientos reales.
