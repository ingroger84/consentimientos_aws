# Guía de Pruebas - Sistema de Planes y Pricing

## Objetivo

Esta guía proporciona instrucciones paso a paso para probar todas las funcionalidades del sistema de planes y pricing implementado.

---

## Pre-requisitos

1. Backend corriendo en `http://localhost:3000`
2. Frontend corriendo en `http://localhost:5173`
3. Base de datos PostgreSQL con migración aplicada
4. Super Admin configurado: `superadmin@sistema.com` / `superadmin123`

---

## Prueba 1: Creación de Tenant con Diferentes Planes

### Objetivo
Verificar que se pueden crear tenants con diferentes planes y que los límites se aplican correctamente.

### Pasos

1. **Acceder como Super Admin**:
   - URL: `http://admin.localhost:5173`
   - Email: `superadmin@sistema.com`
   - Password: `superadmin123`

2. **Crear Tenant con Plan Free**:
   - Ir a "Tenants" en el menú
   - Clic en "Nuevo Tenant"
   - Completar datos básicos:
     - Nombre: "Clínica Test Free"
     - Slug: "test-free"
     - Email: `admin@test-free.com`
   - Seleccionar plan "Gratuito"
   - Verificar preview:
     - Precio: $0
     - Usuarios: 2
     - Sedes: 1
     - Consentimientos: 50/mes
   - Guardar

3. **Crear Tenant con Plan Basic**:
   - Repetir proceso con:
     - Nombre: "Clínica Test Basic"
     - Slug: "test-basic"
     - Email: `admin@test-basic.com`
     - Plan: "Básico"
     - Ciclo: Mensual
   - Verificar preview:
     - Precio: $89,900/mes
     - Usuarios: 5
     - Sedes: 2

4. **Crear Tenant con Plan Professional**:
   - Repetir con plan "Profesional"
   - Probar toggle Mensual/Anual
   - Verificar descuento anual (17%)

5. **Crear Tenant con Plan Custom**:
   - Seleccionar plan "Enterprise"
   - Personalizar límites:
     - Usuarios: 100
     - Sedes: 50
     - Consentimientos: 10,000
   - Guardar

### Resultados Esperados
- ✅ Todos los tenants se crean exitosamente
- ✅ Límites se aplican según el plan seleccionado
- ✅ Precios se calculan correctamente
- ✅ Toggle mensual/anual funciona
- ✅ Límites personalizables en plan Custom

---

## Prueba 2: Validación de Límites de Usuarios

### Objetivo
Verificar que el sistema bloquea la creación de usuarios al alcanzar el límite del plan.

### Pasos

1. **Acceder al Tenant Free**:
   - URL: `http://test-free.localhost:5173`
   - Email: `admin@test-free.com`
   - Password: (revisar email de bienvenida o usar reset password)

2. **Crear Primer Usuario**:
   - Ir a "Usuarios"
   - Clic en "Nuevo Usuario"
   - Completar datos:
     - Nombre: "Usuario 1"
     - Email: `usuario1@test-free.com`
     - Rol: Operador
   - Guardar
   - ✅ Debe crearse exitosamente

3. **Intentar Crear Tercer Usuario** (excede límite):
   - Clic en "Nuevo Usuario"
   - Completar datos:
     - Nombre: "Usuario 3"
     - Email: `usuario3@test-free.com`
   - Intentar guardar
   - ✅ Debe mostrar error: "Has alcanzado el límite de usuarios (2/2)"

4. **Verificar en Dashboard**:
   - Ir a "Mi Plan"
   - Verificar barra de usuarios:
     - Current: 2
     - Max: 2
     - Porcentaje: 100%
     - Estado: Critical (rojo)
   - ✅ Debe mostrar alerta crítica

### Resultados Esperados
- ✅ Se pueden crear usuarios hasta el límite
- ✅ Se bloquea la creación al alcanzar el límite
- ✅ Mensaje de error es claro y descriptivo
- ✅ Dashboard muestra estado crítico

---

## Prueba 3: Validación de Límites de Sedes

### Objetivo
Verificar límites de sedes en plan Basic (máximo 2).

### Pasos

1. **Acceder al Tenant Basic**:
   - URL: `http://test-basic.localhost:5173`
   - Login con credenciales del admin

2. **Crear Primera Sede**:
   - Ir a "Sedes"
   - Crear "Sede Principal"
   - ✅ Debe crearse exitosamente

3. **Crear Segunda Sede**:
   - Crear "Sede Secundaria"
   - ✅ Debe crearse exitosamente

4. **Intentar Crear Tercera Sede**:
   - Intentar crear "Sede Terciaria"
   - ✅ Debe mostrar error de límite alcanzado

5. **Verificar Alertas**:
   - Ir a "Mi Plan"
   - Verificar alerta crítica de sedes

### Resultados Esperados
- ✅ Límite de 2 sedes se respeta
- ✅ Error descriptivo al exceder
- ✅ Dashboard muestra estado correcto

---

## Prueba 4: Validación de Límites de Consentimientos

### Objetivo
Verificar límite de consentimientos en plan Free (50/mes).

### Pasos

1. **Acceder al Tenant Free**

2. **Crear Consentimientos**:
   - Ir a "Consentimientos"
   - Crear consentimientos hasta llegar a 50
   - Usar script o crear manualmente

3. **Intentar Crear Consentimiento 51**:
   - Intentar crear uno más
   - ✅ Debe mostrar error de límite

4. **Verificar Dashboard**:
   - Ir a "Mi Plan"
   - Verificar barra de consentimientos al 100%

### Resultados Esperados
- ✅ Se pueden crear 50 consentimientos
- ✅ Se bloquea el consentimiento 51
- ✅ Dashboard refleja el uso correcto

---

## Prueba 5: Dashboard "Mi Plan"

### Objetivo
Verificar que el dashboard muestra información correcta y actualizada.

### Pasos

1. **Acceder a cualquier tenant**

2. **Ir a "Mi Plan"** en el menú lateral

3. **Verificar Sección de Plan**:
   - ✅ Nombre del plan correcto
   - ✅ Estado (Activo/Trial)
   - ✅ Ciclo de facturación
   - ✅ Fechas de renovación (si aplica)

4. **Verificar Recursos**:
   - ✅ 6 tarjetas de recursos:
     - Usuarios
     - Sedes
     - Servicios Médicos
     - Consentimientos
     - Preguntas Personalizadas
     - Almacenamiento
   - ✅ Cada tarjeta muestra:
     - Ícono correcto
     - Cantidad actual / máxima
     - Porcentaje
     - Barra de progreso con color correcto

5. **Verificar Alertas**:
   - Crear recursos hasta 80% del límite
   - ✅ Debe aparecer alerta amarilla (warning)
   - Crear hasta 100%
   - ✅ Debe aparecer alerta roja (critical)

6. **Verificar Características**:
   - ✅ Lista de features del plan
   - ✅ Iconos de check (verde) o cross (rojo)
   - ✅ Descripciones correctas

### Resultados Esperados
- ✅ Toda la información es precisa
- ✅ Porcentajes se calculan correctamente
- ✅ Colores reflejan el estado (verde/amarillo/rojo)
- ✅ Alertas aparecen en los momentos correctos

---

## Prueba 6: Página de Pricing Pública

### Objetivo
Verificar que la página de pricing muestra información correcta.

### Pasos

1. **Acceder a la página de pricing**:
   - URL: `http://localhost:5173/pricing` (si está pública)
   - O desde el modal de creación de tenant

2. **Verificar Toggle Mensual/Anual**:
   - ✅ Toggle funciona
   - ✅ Precios cambian correctamente
   - ✅ Indicador de ahorro aparece en anual (17%)

3. **Verificar Planes**:
   - ✅ 4 planes visibles (Free, Basic, Professional, Enterprise)
   - ✅ Plan Basic marcado como "Popular"
   - ✅ Límites correctos en cada plan
   - ✅ Características listadas correctamente

4. **Verificar Responsive**:
   - Probar en diferentes tamaños de pantalla
   - ✅ Grid se adapta correctamente
   - ✅ Legible en móvil

### Resultados Esperados
- ✅ Información precisa y actualizada
- ✅ Diseño profesional y atractivo
- ✅ Funcionalidad completa
- ✅ Responsive en todos los dispositivos

---

## Prueba 7: Validación de Servicios y Preguntas

### Objetivo
Verificar límites de servicios y preguntas personalizadas.

### Pasos

1. **Acceder a Tenant Free**

2. **Crear Servicios**:
   - Ir a "Servicios"
   - Crear 3 servicios (límite del plan Free)
   - ✅ Los 3 se crean exitosamente
   - Intentar crear el 4to
   - ✅ Debe mostrar error de límite

3. **Crear Preguntas**:
   - Ir a "Preguntas"
   - Crear 5 preguntas (límite del plan Free)
   - ✅ Las 5 se crean exitosamente
   - Intentar crear la 6ta
   - ✅ Debe mostrar error de límite

4. **Verificar Dashboard**:
   - Ir a "Mi Plan"
   - ✅ Servicios: 3/3 (100%)
   - ✅ Preguntas: 5/5 (100%)

### Resultados Esperados
- ✅ Límites se respetan en todos los recursos
- ✅ Errores descriptivos
- ✅ Dashboard actualizado

---

## Prueba 8: Soft Deletes y Límites

### Objetivo
Verificar que los recursos eliminados no cuentan para los límites.

### Pasos

1. **Acceder a Tenant con límite alcanzado**:
   - Ejemplo: Tenant Free con 2 usuarios

2. **Eliminar un Usuario**:
   - Ir a "Usuarios"
   - Eliminar "Usuario 1"
   - ✅ Usuario se elimina (soft delete)

3. **Verificar Dashboard**:
   - Ir a "Mi Plan"
   - ✅ Usuarios debe mostrar: 1/2 (50%)
   - ✅ Estado debe cambiar a "normal" (verde)

4. **Crear Nuevo Usuario**:
   - Intentar crear nuevo usuario
   - ✅ Debe permitir la creación
   - ✅ Dashboard debe mostrar: 2/2 (100%)

### Resultados Esperados
- ✅ Recursos eliminados no cuentan
- ✅ Se puede crear después de eliminar
- ✅ Dashboard se actualiza correctamente

---

## Prueba 9: Comparación de Planes

### Objetivo
Verificar diferencias entre planes en funcionalidad.

### Pasos

1. **Crear 4 tenants** (uno de cada plan principal)

2. **Comparar Características**:

   **Plan Free**:
   - ✅ PDFs con marca de agua
   - ❌ Sin personalización
   - ❌ Sin reportes avanzados
   - ❌ Sin acceso API

   **Plan Basic**:
   - ✅ PDFs sin marca de agua
   - ✅ Con personalización
   - ❌ Sin reportes avanzados
   - ❌ Sin acceso API

   **Plan Professional**:
   - ✅ PDFs sin marca de agua
   - ✅ Con personalización
   - ✅ Con reportes avanzados
   - ✅ Con acceso API

   **Plan Enterprise**:
   - ✅ Todas las características
   - ✅ Soporte prioritario
   - ✅ Dominio personalizado

3. **Verificar en "Mi Plan"**:
   - Cada tenant debe mostrar sus características correctamente

### Resultados Esperados
- ✅ Características se aplican según el plan
- ✅ Diferencias visibles en funcionalidad
- ✅ Dashboard refleja características correctas

---

## Prueba 10: Alertas de Trial

### Objetivo
Verificar alertas de período de prueba.

### Pasos

1. **Crear Tenant en Trial**:
   - Crear tenant con estado "trial"
   - Establecer `trialEndsAt` en 5 días

2. **Acceder al Tenant**:
   - Login como admin del tenant

3. **Ir a "Mi Plan"**:
   - ✅ Debe mostrar alerta amarilla:
     - "Tu período de prueba expira en 5 días"

4. **Simular Trial Expirado**:
   - Cambiar `trialEndsAt` a fecha pasada
   - Recargar página
   - ✅ Debe mostrar alerta roja:
     - "Tu período de prueba ha expirado"

### Resultados Esperados
- ✅ Alertas de trial funcionan
- ✅ Mensajes claros y oportunos
- ✅ Colores apropiados (amarillo/rojo)

---

## Checklist Final

### Backend
- [ ] Migración aplicada correctamente
- [ ] Todos los servicios validan límites
- [ ] Endpoint `/api/tenants/plans` funciona
- [ ] Endpoint `/api/tenants/:id/usage` funciona
- [ ] Errores descriptivos y claros

### Frontend
- [ ] Página "Mi Plan" carga correctamente
- [ ] Dashboard muestra datos precisos
- [ ] Alertas aparecen correctamente
- [ ] Barras de progreso funcionan
- [ ] Colores reflejan estados correctos
- [ ] Página de Pricing funciona
- [ ] Modal de tenant con selector de planes
- [ ] Navegación incluye enlace "Mi Plan"

### Validaciones
- [ ] Límite de usuarios funciona
- [ ] Límite de sedes funciona
- [ ] Límite de servicios funciona
- [ ] Límite de consentimientos funciona
- [ ] Límite de preguntas funciona
- [ ] Soft deletes no cuentan para límites

### UX
- [ ] Mensajes de error claros
- [ ] Alertas visibles y comprensibles
- [ ] Diseño responsive
- [ ] Navegación intuitiva
- [ ] Información precisa y actualizada

---

## Problemas Comunes y Soluciones

### Problema: "No se pudo cargar la información del plan"
**Solución**: Verificar que el tenant tenga un plan asignado en la BD.

### Problema: Límites no se respetan
**Solución**: Verificar que la migración se aplicó correctamente y que los campos tienen valores.

### Problema: Dashboard muestra 0% en todos los recursos
**Solución**: Verificar que el endpoint `/api/tenants/:id/usage` retorna datos correctos.

### Problema: Alertas no aparecen
**Solución**: Verificar que el cálculo de porcentajes es correcto y que las alertas se generan en el backend.

---

## Conclusión

Siguiendo esta guía, se pueden probar todas las funcionalidades del sistema de planes y pricing. Cualquier problema encontrado debe ser documentado y reportado para su corrección.

Para más información técnica, consultar:
- `IMPLEMENTACION_COMPLETA_PLANES.md`
- `ESTADO_FINAL_IMPLEMENTACION.md`
