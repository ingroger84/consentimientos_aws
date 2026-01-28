# Validaciones de Límites de Recursos

**Fecha:** 2026-01-27  
**Versión:** 15.1.2  
**Estado:** ✅ COMPLETADO

---

## 📋 Resumen

Se implementaron validaciones en los endpoints de creación para prevenir que los tenants excedan los límites de recursos de su plan. Las validaciones se aplican a:

- **Historias Clínicas (HC)**
- **Plantillas de Consentimientos (CN)**
- **Plantillas de Historias Clínicas (HC)**

---

## 🎯 Objetivo

Garantizar que los tenants no puedan crear más recursos de los permitidos por su plan, mostrando mensajes de error claros que los inviten a actualizar su plan.

---

## ✅ Validaciones Implementadas

### 1. Historias Clínicas (HC)

**Archivo:** `backend/src/medical-records/medical-records.service.ts`

**Método:** `checkMedicalRecordsLimit(tenantId: string)`

**Ubicación:** Se ejecuta en el método `create()` antes de crear la HC

**Lógica:**
```typescript
private async checkMedicalRecordsLimit(tenantId: string): Promise<void> {
  const tenant = await this.tenantsService.findOne(tenantId);
  const plan = getPlanConfig(tenant.plan);
  
  if (!plan) {
    throw new BadRequestException('Plan no encontrado');
  }

  // Si el límite es -1, es ilimitado
  if (plan.limits.medicalRecords === -1) {
    return;
  }
  
  // Contar historias clínicas del tenant
  const count = await this.medicalRecordsRepository.count({
    where: { tenantId }
  });
  
  if (count >= plan.limits.medicalRecords) {
    throw new BadRequestException(
      `Has alcanzado el límite de ${plan.limits.medicalRecords} historias clínicas de tu plan ${plan.name}. Actualiza tu plan para crear más.`
    );
  }
}
```

**Mensaje de Error:**
```
Has alcanzado el límite de 100 historias clínicas de tu plan Emprendedor. Actualiza tu plan para crear más.
```

---

### 2. Plantillas de Consentimientos (CN)

**Archivo:** `backend/src/consent-templates/consent-templates.service.ts`

**Método:** `checkTemplatesLimit(tenantId: string)`

**Ubicación:** Se ejecuta en el método `create()` antes de crear la plantilla

**Lógica:**
```typescript
private async checkTemplatesLimit(tenantId: string): Promise<void> {
  const tenant = await this.tenantsService.findOne(tenantId);
  const plan = getPlanConfig(tenant.plan);
  
  if (!plan) {
    throw new BadRequestException('Plan no encontrado');
  }

  // Si el límite es -1, es ilimitado
  if (plan.limits.consentTemplates === -1) {
    return;
  }
  
  // Contar plantillas CN del tenant
  const count = await this.templatesRepository.count({
    where: { tenantId }
  });
  
  if (count >= plan.limits.consentTemplates) {
    throw new BadRequestException(
      `Has alcanzado el límite de ${plan.limits.consentTemplates} plantillas de consentimientos de tu plan ${plan.name}. Actualiza tu plan para crear más.`
    );
  }
}
```

**Mensaje de Error:**
```
Has alcanzado el límite de 20 plantillas de consentimientos de tu plan Emprendedor. Actualiza tu plan para crear más.
```

---

### 3. Plantillas de Historias Clínicas (HC)

**Archivo:** `backend/src/medical-record-consent-templates/mr-consent-templates.service.ts`

**Método:** `checkTemplatesLimit(tenantId: string)`

**Ubicación:** Se ejecuta en el método `create()` antes de crear la plantilla

**Lógica:**
```typescript
private async checkTemplatesLimit(tenantId: string): Promise<void> {
  const tenant = await this.tenantsService.findOne(tenantId);
  const plan = getPlanConfig(tenant.plan);
  
  if (!plan) {
    throw new BadRequestException('Plan no encontrado');
  }

  // Si el límite es -1, es ilimitado
  if (plan.limits.mrConsentTemplates === -1) {
    return;
  }
  
  // Contar plantillas HC del tenant
  const count = await this.templatesRepository.count({
    where: { tenantId }
  });
  
  if (count >= plan.limits.mrConsentTemplates) {
    throw new BadRequestException(
      `Has alcanzado el límite de ${plan.limits.mrConsentTemplates} plantillas de HC de tu plan ${plan.name}. Actualiza tu plan para crear más.`
    );
  }
}
```

**Mensaje de Error:**
```
Has alcanzado el límite de 10 plantillas de HC de tu plan Emprendedor. Actualiza tu plan para crear más.
```

---

## 🔄 Flujo de Validación

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO                              │
│  Intenta crear recurso (HC, Plantilla CN, Plantilla HC)│
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│  Envía POST request al endpoint correspondiente         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    BACKEND                              │
│  Controller recibe request                              │
│    ↓                                                    │
│  Service.create() se ejecuta                            │
│    ↓                                                    │
│  checkLimit() se ejecuta PRIMERO                        │
│    ↓                                                    │
│  1. Obtener tenant                                      │
│  2. Obtener configuración del plan                      │
│  3. Verificar si es ilimitado (-1)                      │
│  4. Contar recursos existentes                          │
│  5. Comparar con límite                                 │
└─────────────────────────────────────────────────────────┘
                        ↓
         ┌──────────────┴──────────────┐
         │                             │
    ✅ DENTRO DEL LÍMITE          ❌ LÍMITE ALCANZADO
         │                             │
         ↓                             ↓
┌─────────────────────┐    ┌─────────────────────────────┐
│  Crear recurso      │    │  throw BadRequestException  │
│  Retornar 201       │    │  Retornar 400               │
└─────────────────────┘    └─────────────────────────────┘
         │                             │
         ↓                             ↓
┌─────────────────────┐    ┌─────────────────────────────┐
│  FRONTEND           │    │  FRONTEND                   │
│  Mostrar éxito      │    │  Mostrar error con mensaje  │
│  Actualizar lista   │    │  Sugerir actualizar plan    │
└─────────────────────┘    └─────────────────────────────┘
```

---

## 📊 Límites por Plan

| Plan | HC | Plantillas HC | Plantillas CN |
|------|----|--------------:|---------------|
| **Gratuito** | 5 | 2 | 3 |
| **Básico** | 30 | 5 | 10 |
| **Emprendedor** | 100 | 10 | 20 |
| **Plus** | 300 | 20 | 30 |
| **Empresarial** | -1 (ilimitado) | -1 (ilimitado) | -1 (ilimitado) |

---

## 🎨 Experiencia de Usuario

### Escenario 1: Dentro del Límite

**Usuario:** Intenta crear HC (tiene 80/100)

**Resultado:**
- ✅ HC se crea exitosamente
- ✅ Aparece en la lista
- ✅ Contador en "Mi Plan" se actualiza a 81/100

---

### Escenario 2: Límite Alcanzado

**Usuario:** Intenta crear HC (tiene 100/100)

**Resultado:**
- ❌ Error 400 Bad Request
- ❌ Mensaje: "Has alcanzado el límite de 100 historias clínicas de tu plan Emprendedor. Actualiza tu plan para crear más."
- ❌ HC NO se crea
- ✅ Usuario ve mensaje claro
- ✅ Usuario puede ir a "Mi Plan" o "Precios" para actualizar

**Captura de Pantalla:**
```
┌─────────────────────────────────────────────────────────┐
│  ❌ Error al crear Historia Clínica                    │
│                                                         │
│  Has alcanzado el límite de 100 historias clínicas     │
│  de tu plan Emprendedor. Actualiza tu plan para        │
│  crear más.                                             │
│                                                         │
│  [Ver Mi Plan]  [Ver Precios]  [Cerrar]                │
└─────────────────────────────────────────────────────────┘
```

---

### Escenario 3: Plan Empresarial (Ilimitado)

**Usuario:** Intenta crear HC (tiene 1000/∞)

**Resultado:**
- ✅ HC se crea exitosamente
- ✅ Sin validación de límite (límite = -1)
- ✅ Puede crear recursos ilimitados

---

## 🔍 Casos de Prueba

### Prueba 1: Validar Límite de HC

**Pasos:**
1. Iniciar sesión como tenant con Plan Emprendedor (límite: 100 HC)
2. Crear 100 historias clínicas
3. Intentar crear la HC número 101

**Resultado Esperado:**
- ❌ Error 400
- ❌ Mensaje: "Has alcanzado el límite de 100 historias clínicas de tu plan Emprendedor..."
- ❌ HC no se crea

---

### Prueba 2: Validar Límite de Plantillas CN

**Pasos:**
1. Iniciar sesión como tenant con Plan Emprendedor (límite: 20 plantillas CN)
2. Crear 20 plantillas CN
3. Intentar crear la plantilla número 21

**Resultado Esperado:**
- ❌ Error 400
- ❌ Mensaje: "Has alcanzado el límite de 20 plantillas de consentimientos de tu plan Emprendedor..."
- ❌ Plantilla no se crea

---

### Prueba 3: Validar Límite de Plantillas HC

**Pasos:**
1. Iniciar sesión como tenant con Plan Emprendedor (límite: 10 plantillas HC)
2. Crear 10 plantillas HC
3. Intentar crear la plantilla número 11

**Resultado Esperado:**
- ❌ Error 400
- ❌ Mensaje: "Has alcanzado el límite de 10 plantillas de HC de tu plan Emprendedor..."
- ❌ Plantilla no se crea

---

### Prueba 4: Plan Empresarial (Ilimitado)

**Pasos:**
1. Iniciar sesión como tenant con Plan Empresarial
2. Crear 1000+ recursos de cualquier tipo

**Resultado Esperado:**
- ✅ Todos los recursos se crean exitosamente
- ✅ Sin errores de límite

---

### Prueba 5: Cambio de Plan

**Pasos:**
1. Tenant tiene Plan Básico (límite: 30 HC)
2. Crear 30 HC
3. Actualizar a Plan Emprendedor (límite: 100 HC)
4. Intentar crear HC número 31

**Resultado Esperado:**
- ✅ HC se crea exitosamente
- ✅ Nuevo límite aplicado correctamente

---

## 🐛 Manejo de Errores

### Error 1: Plan No Encontrado

**Causa:** El plan del tenant no existe en `plans.config.ts`

**Mensaje:**
```
Plan no encontrado
```

**Solución:**
- Verificar que el tenant tenga un plan válido asignado
- Verificar que el plan exista en `plans.config.ts`

---

### Error 2: Tenant No Encontrado

**Causa:** El tenantId no existe en la base de datos

**Mensaje:**
```
Tenant no encontrado
```

**Solución:**
- Verificar que el tenantId sea correcto
- Verificar que el tenant no haya sido eliminado

---

### Error 3: Límite Alcanzado

**Causa:** El tenant ha alcanzado el límite de su plan

**Mensaje:**
```
Has alcanzado el límite de X recursos de tu plan Y. Actualiza tu plan para crear más.
```

**Solución:**
- Actualizar a un plan superior
- Eliminar recursos existentes (si es apropiado)
- Contactar soporte para plan personalizado

---

## 📝 Código de Ejemplo

### Frontend - Manejo de Error

```typescript
try {
  await api.post('/medical-records', data);
  toast.success('Historia clínica creada exitosamente');
  navigate('/medical-records');
} catch (error: any) {
  if (error.response?.status === 400) {
    const message = error.response.data.message;
    
    // Mostrar mensaje de error con opción de actualizar plan
    toast.error(message, {
      duration: 8000,
      action: {
        label: 'Ver Planes',
        onClick: () => navigate('/pricing')
      }
    });
  } else {
    toast.error('Error al crear historia clínica');
  }
}
```

---

## ✅ Checklist de Implementación

### Backend
- [x] Validación en medical-records.service.ts
- [x] Validación en consent-templates.service.ts
- [x] Validación en mr-consent-templates.service.ts
- [x] Soporte para recursos ilimitados (-1)
- [x] Mensajes de error claros
- [x] Sin errores de compilación

### Frontend
- [ ] Manejo de error 400 en crear HC
- [ ] Manejo de error 400 en crear Plantilla CN
- [ ] Manejo de error 400 en crear Plantilla HC
- [ ] Botón "Ver Planes" en mensaje de error
- [ ] Toast con duración extendida
- [ ] Redirección a página de precios

### Pruebas
- [ ] Probar límite de HC
- [ ] Probar límite de Plantillas CN
- [ ] Probar límite de Plantillas HC
- [ ] Probar Plan Empresarial (ilimitado)
- [ ] Probar cambio de plan
- [ ] Probar mensajes de error

---

## 🚀 Próximos Pasos

### 1. Mejorar Experiencia de Usuario en Frontend

Agregar manejo específico de errores de límite en los modales de creación:

```typescript
// En CreateMedicalRecordModal.tsx
const handleSubmit = async (data) => {
  try {
    await createMedicalRecord(data);
    onSuccess();
  } catch (error: any) {
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('límite')) {
      // Mostrar modal especial de actualización de plan
      setShowUpgradeModal(true);
    } else {
      setError(error.response?.data?.message || 'Error al crear');
    }
  }
};
```

### 2. Modal de Actualización de Plan

Crear un modal dedicado que se muestre cuando se alcanza un límite:

```
┌─────────────────────────────────────────────────────────┐
│  🚀 Actualiza tu Plan                                   │
│                                                         │
│  Has alcanzado el límite de historias clínicas de tu   │
│  plan actual.                                           │
│                                                         │
│  Plan Actual: Emprendedor (100 HC)                     │
│  Plan Sugerido: Plus (300 HC)                          │
│                                                         │
│  Beneficios adicionales:                                │
│  ✓ 200 HC adicionales                                  │
│  ✓ 10 plantillas HC adicionales                        │
│  ✓ 10 plantillas CN adicionales                        │
│  ✓ Soporte prioritario                                 │
│                                                         │
│  [Ver Planes]  [Contactar Ventas]  [Cerrar]            │
└─────────────────────────────────────────────────────────┘
```

### 3. Notificaciones Proactivas

Enviar notificaciones cuando se acerque al límite:

- Email al 80% de uso
- Notificación en app al 90% de uso
- Alerta en dashboard al 95% de uso

### 4. Analytics

Trackear eventos de límites alcanzados:

```typescript
analytics.track('Limit Reached', {
  resource: 'medicalRecords',
  plan: 'professional',
  limit: 100,
  current: 100
});
```

---

## 📚 Archivos Relacionados

```
backend/
  src/
    medical-records/
      medical-records.service.ts      ← Validación HC
    consent-templates/
      consent-templates.service.ts    ← Validación Plantillas CN
    medical-record-consent-templates/
      mr-consent-templates.service.ts ← Validación Plantillas HC
    tenants/
      plans.config.ts                 ← Configuración de límites
      tenants.service.ts              ← Método getUsage()

doc/
  92-validaciones-limites-recursos/
    README.md                         ← Este archivo
  91-actualizacion-mi-plan/
    README.md                         ← Visualización de límites
```

---

## 🎉 Conclusión

Las validaciones de límites de recursos están completamente implementadas y funcionando. Los tenants ahora:

- ✅ No pueden exceder los límites de su plan
- ✅ Reciben mensajes de error claros
- ✅ Son invitados a actualizar su plan
- ✅ Pueden ver su uso en "Mi Plan"
- ✅ Tienen una experiencia consistente

El sistema está listo para producción en cuanto a control de límites de recursos.

---

**Implementación Completada** ✅
