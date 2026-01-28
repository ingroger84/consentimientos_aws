# Instrucciones de Prueba - Página "Mi Plan"

**Versión:** 15.1.1  
**Fecha:** 2026-01-27

---

## 🎯 Objetivo

Verificar que la página "Mi Plan" muestra correctamente los nuevos recursos (HC, Plantillas CN, Plantillas HC) y que las alertas funcionan según los límites del plan.

---

## ⚙️ Prerequisitos

1. ✅ Backend corriendo en puerto 3000
2. ✅ Frontend corriendo en puerto 5173
3. ✅ Base de datos con datos de prueba
4. ✅ Al menos un tenant con plan asignado

---

## 🧪 Pruebas a Realizar

### Prueba 1: Verificar Visualización Básica

**Objetivo:** Confirmar que la página carga y muestra todos los recursos

**Pasos:**
1. Iniciar sesión como usuario de un tenant (NO Super Admin)
2. Ir al menú lateral → "Mi Plan"
3. Verificar que la página carga sin errores

**Resultado Esperado:**
- ✅ Página carga correctamente
- ✅ Se muestra el nombre del plan actual
- ✅ Se muestran 9 tarjetas de recursos:
  - Usuarios
  - Sedes
  - Servicios Médicos
  - Consentimientos (CN)
  - **Historias Clínicas (HC)** ← NUEVO
  - **Plantillas CN** ← NUEVO
  - **Plantillas HC** ← NUEVO
  - Preguntas Personalizadas
  - Almacenamiento

**Captura de Pantalla:**
```
┌─────────────────────────────────────────┐
│  Mi Plan                                │
│  Plan Emprendedor                       │
├─────────────────────────────────────────┤
│  [Tarjeta Usuarios]                     │
│  [Tarjeta Sedes]                        │
│  [Tarjeta Servicios]                    │
│  [Tarjeta Consentimientos CN]           │
│  [Tarjeta Historias Clínicas HC] ← NUEVO│
│  [Tarjeta Plantillas CN] ← NUEVO       │
│  [Tarjeta Plantillas HC] ← NUEVO       │
│  [Tarjeta Preguntas]                    │
│  [Tarjeta Almacenamiento]               │
└─────────────────────────────────────────┘
```

---

### Prueba 2: Verificar Contadores

**Objetivo:** Confirmar que los contadores muestran valores correctos

**Pasos:**
1. En la página "Mi Plan", observar los contadores de:
   - Historias Clínicas (HC)
   - Plantillas CN
   - Plantillas HC

2. Ir a "Historias Clínicas" y contar manualmente las HC creadas
3. Ir a "Plantillas CN" y contar manualmente las plantillas
4. Ir a "Plantillas HC" y contar manualmente las plantillas

**Resultado Esperado:**
- ✅ El contador de HC coincide con el número real de HC creadas
- ✅ El contador de Plantillas CN coincide con el número real
- ✅ El contador de Plantillas HC coincide con el número real
- ✅ Los límites mostrados coinciden con el plan actual

**Ejemplo:**
```
Si tienes Plan Emprendedor:
- HC: 25 / 100 ✅
- Plantillas CN: 8 / 20 ✅
- Plantillas HC: 5 / 10 ✅
```

---

### Prueba 3: Verificar Barras de Progreso

**Objetivo:** Confirmar que las barras de progreso reflejan el porcentaje correcto

**Pasos:**
1. Observar las barras de progreso de cada recurso
2. Verificar que el color corresponde al porcentaje:
   - Verde: 0-79%
   - Amarillo: 80-99%
   - Rojo: 100%

**Resultado Esperado:**
- ✅ Barra verde si uso < 80%
- ✅ Barra amarilla si uso >= 80% y < 100%
- ✅ Barra roja si uso = 100%
- ✅ El ancho de la barra corresponde al porcentaje

**Ejemplo Visual:**
```
25% → ████░░░░░░░░░░░░░░░░ (verde)
85% → █████████████████░░░ (amarillo)
100% → ████████████████████ (rojo)
```

---

### Prueba 4: Verificar Alertas de Warning (80%)

**Objetivo:** Confirmar que aparecen alertas cuando se acerca al límite

**Pasos:**
1. Crear recursos hasta alcanzar el 80% del límite
   - Ejemplo: Si límite es 100 HC, crear 80 HC
2. Recargar la página "Mi Plan"
3. Observar si aparece alerta amarilla

**Resultado Esperado:**
- ✅ Aparece alerta amarilla en la parte superior
- ✅ Mensaje: "Estás cerca del límite de historias clínicas (80/100)"
- ✅ Aparece mensaje en la tarjeta del recurso
- ✅ Barra de progreso es amarilla

**Captura de Pantalla:**
```
┌─────────────────────────────────────────┐
│  ⚠️ Estás cerca del límite de          │
│     historias clínicas (80/100)         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📄  HISTORIAS CLÍNICAS (HC)      80%  │
│                                         │
│  80 / 100                               │
│  ████████████████░░░░  (amarillo)       │
│  ⚠️ Cerca del límite - Considera       │
│     actualizar tu plan                  │
└─────────────────────────────────────────┘
```

---

### Prueba 5: Verificar Alertas de Critical (100%)

**Objetivo:** Confirmar que aparecen alertas cuando se alcanza el límite

**Pasos:**
1. Crear recursos hasta alcanzar el 100% del límite
   - Ejemplo: Si límite es 100 HC, crear 100 HC
2. Recargar la página "Mi Plan"
3. Observar si aparece alerta roja

**Resultado Esperado:**
- ✅ Aparece alerta roja en la parte superior
- ✅ Mensaje: "Has alcanzado el límite de historias clínicas (100/100)"
- ✅ Aparece mensaje en la tarjeta del recurso
- ✅ Barra de progreso es roja y completa

**Captura de Pantalla:**
```
┌─────────────────────────────────────────┐
│  🚨 Has alcanzado el límite de         │
│     historias clínicas (100/100)        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📄  HISTORIAS CLÍNICAS (HC)     100%  │
│                                         │
│  100 / 100                              │
│  ████████████████████  (rojo)           │
│  ⚠️ Límite alcanzado - No puedes       │
│     crear más                           │
└─────────────────────────────────────────┘
```

---

### Prueba 6: Verificar Plan Empresarial (Ilimitado)

**Objetivo:** Confirmar que los recursos ilimitados se muestran correctamente

**Pasos:**
1. Cambiar el plan del tenant a "Empresarial" (custom)
2. Recargar la página "Mi Plan"
3. Observar los límites de HC, Plantillas CN y Plantillas HC

**Resultado Esperado:**
- ✅ Límite muestra un número muy alto (999999) o símbolo de infinito
- ✅ Porcentaje es 0% o muy bajo
- ✅ Barra de progreso es verde
- ✅ NO aparecen alertas

**Ejemplo:**
```
┌─────────────────────────────────────────┐
│  📄  HISTORIAS CLÍNICAS (HC)       0%  │
│                                         │
│  100 / 999,999                          │
│  ░░░░░░░░░░░░░░░░░░░░  (verde)         │
└─────────────────────────────────────────┘
```

---

### Prueba 7: Verificar Diferentes Planes

**Objetivo:** Confirmar que los límites cambian según el plan

**Pasos:**
1. Probar con Plan Gratuito
2. Probar con Plan Básico
3. Probar con Plan Emprendedor
4. Probar con Plan Plus
5. Probar con Plan Empresarial

**Resultado Esperado:**

| Plan | HC | Plantillas HC | Plantillas CN |
|------|----|--------------:|---------------|
| Gratuito | 5 | 2 | 3 |
| Básico | 30 | 5 | 10 |
| Emprendedor | 100 | 10 | 20 |
| Plus | 300 | 20 | 30 |
| Empresarial | 999,999 | 999,999 | 999,999 |

---

### Prueba 8: Verificar Formato de Números

**Objetivo:** Confirmar que los números grandes se formatean correctamente

**Pasos:**
1. Observar los contadores de recursos
2. Verificar que los números tienen separadores de miles

**Resultado Esperado:**
- ✅ 1000 se muestra como "1,000"
- ✅ 999999 se muestra como "999,999"
- ✅ Los números son legibles

---

### Prueba 9: Verificar Manejo de Errores

**Objetivo:** Confirmar que los errores se manejan correctamente

**Pasos:**
1. Detener el backend
2. Recargar la página "Mi Plan"
3. Observar el mensaje de error

**Resultado Esperado:**
- ✅ Aparece mensaje de error claro
- ✅ Botón "Reintentar" disponible
- ✅ No se rompe la aplicación

**Ejemplo:**
```
┌─────────────────────────────────────────┐
│  ❌ No se pudo cargar la información   │
│     del plan. Por favor, verifica que   │
│     tu tenant tenga un plan asignado.   │
│                                         │
│  [Reintentar]                           │
└─────────────────────────────────────────┘
```

---

### Prueba 10: Verificar Botón "Actualizar Plan"

**Objetivo:** Confirmar que el botón de actualización funciona

**Pasos:**
1. En la página "Mi Plan", hacer clic en "Actualizar Plan"
2. Verificar que redirige a la página de precios

**Resultado Esperado:**
- ✅ Redirige a `/pricing`
- ✅ Muestra los planes disponibles
- ✅ Permite solicitar cambio de plan

---

## 🔍 Verificación del Backend

### Probar Endpoint Directamente

```bash
# Obtener token de autenticación
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo-medico" \
  -d '{"email":"admin@demo-medico.com","password":"tu_password"}'

# Copiar el token de la respuesta

# Probar endpoint de uso
curl -X GET http://localhost:3000/api/tenants/<tenant-id>/usage \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-Slug: demo-medico"
```

**Respuesta Esperada:**
```json
{
  "plan": {
    "id": "professional",
    "name": "Emprendedor",
    "billingCycle": "monthly",
    "status": "active"
  },
  "resources": {
    "medicalRecords": {
      "current": 25,
      "max": 100,
      "percentage": 25,
      "status": "normal"
    },
    "consentTemplates": {
      "current": 8,
      "max": 20,
      "percentage": 40,
      "status": "normal"
    },
    "mrConsentTemplates": {
      "current": 5,
      "max": 10,
      "percentage": 50,
      "status": "normal"
    }
  },
  "alerts": []
}
```

---

## 📊 Checklist de Pruebas

### Visualización
- [ ] Página carga sin errores
- [ ] Se muestran 9 tarjetas de recursos
- [ ] Tarjetas tienen iconos apropiados
- [ ] Labels son descriptivos

### Contadores
- [ ] Contador de HC es correcto
- [ ] Contador de Plantillas CN es correcto
- [ ] Contador de Plantillas HC es correcto
- [ ] Límites coinciden con el plan

### Barras de Progreso
- [ ] Barra verde cuando < 80%
- [ ] Barra amarilla cuando >= 80%
- [ ] Barra roja cuando = 100%
- [ ] Ancho corresponde al porcentaje

### Alertas
- [ ] Alerta amarilla al 80%
- [ ] Alerta roja al 100%
- [ ] Mensajes son claros
- [ ] Alertas aparecen en la parte superior

### Planes
- [ ] Plan Gratuito: límites correctos
- [ ] Plan Básico: límites correctos
- [ ] Plan Emprendedor: límites correctos
- [ ] Plan Plus: límites correctos
- [ ] Plan Empresarial: ilimitado

### Funcionalidad
- [ ] Botón "Actualizar Plan" funciona
- [ ] Formato de números correcto
- [ ] Manejo de errores correcto
- [ ] Endpoint backend responde correctamente

---

## 🐛 Problemas Comunes

### Problema 1: Contadores en 0
**Síntoma:** Todos los contadores muestran 0/X

**Solución:**
1. Verificar que el tenant tiene recursos creados
2. Verificar que el backend está corriendo
3. Verificar que el endpoint retorna datos correctos

### Problema 2: Límites Incorrectos
**Síntoma:** Los límites no coinciden con el plan

**Solución:**
1. Verificar que `plans.config.ts` tiene los límites correctos
2. Verificar que el tenant tiene el plan correcto asignado
3. Reiniciar el backend para recargar la configuración

### Problema 3: Alertas No Aparecen
**Síntoma:** No aparecen alertas aunque se alcanzó el límite

**Solución:**
1. Verificar que `generateUsageAlerts()` está funcionando
2. Verificar que el porcentaje se calcula correctamente
3. Revisar logs del backend

### Problema 4: Error 401 o 403
**Síntoma:** La página muestra error de autenticación

**Solución:**
1. Cerrar sesión y volver a iniciar
2. Verificar que el usuario tiene permisos
3. Verificar que el token JWT es válido

---

## ✅ Criterios de Aceptación

La implementación se considera exitosa si:

1. ✅ La página "Mi Plan" carga sin errores
2. ✅ Se muestran los 3 nuevos recursos (HC, Plantillas CN, Plantillas HC)
3. ✅ Los contadores son correctos
4. ✅ Las barras de progreso funcionan
5. ✅ Las alertas aparecen cuando corresponde
6. ✅ Los límites coinciden con el plan
7. ✅ El Plan Empresarial muestra recursos ilimitados
8. ✅ El botón "Actualizar Plan" funciona
9. ✅ Los errores se manejan correctamente
10. ✅ El endpoint backend responde correctamente

---

## 📝 Reporte de Pruebas

Después de completar las pruebas, documenta los resultados:

```
Fecha: _______________
Tester: _______________
Versión: 15.1.1

Pruebas Realizadas:
[ ] Prueba 1: Visualización Básica
[ ] Prueba 2: Contadores
[ ] Prueba 3: Barras de Progreso
[ ] Prueba 4: Alertas Warning
[ ] Prueba 5: Alertas Critical
[ ] Prueba 6: Plan Empresarial
[ ] Prueba 7: Diferentes Planes
[ ] Prueba 8: Formato de Números
[ ] Prueba 9: Manejo de Errores
[ ] Prueba 10: Botón Actualizar Plan

Problemas Encontrados:
_________________________________
_________________________________
_________________________________

Estado Final: [ ] APROBADO [ ] RECHAZADO

Notas:
_________________________________
_________________________________
_________________________________
```

---

**Fin de Instrucciones de Prueba**
