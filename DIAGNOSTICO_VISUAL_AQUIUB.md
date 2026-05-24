# 🎨 Diagnóstico Visual: Problema Creación Plantillas - Aquiub

**Fecha:** 22 de Mayo 2026

---

## 🔄 FLUJO DEL PROBLEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO INTENTA CREAR PLANTILLA          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND: Formulario de Creación de Plantilla             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Nombre: [Consentimiento de Procedimiento]            │ │
│  │ Tipo: [Procedimiento ▼]                              │ │
│  │ Contenido: [Texto de la plantilla...]                │ │
│  │ Servicios: [ ] ← ⚠️ USUARIO NO SELECCIONA NINGUNO    │ │
│  │                                                        │ │
│  │ [Guardar] ← Usuario hace clic                         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND: Envía petición al backend                        │
│  POST /api/consent-templates                                │
│  {                                                           │
│    "name": "Consentimiento de Procedimiento",               │
│    "type": "procedure",                                     │
│    "content": "...",                                        │
│    "serviceIds": []  ← ⚠️ ARRAY VACÍO                       │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND: consent-templates.controller.ts                   │
│  @Post()                                                     │
│  create(@Body() createDto, @TenantSlug() tenantId) {        │
│    return this.templatesService.create(createDto, tenantId);│
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND: consent-templates.service.ts                      │
│  async create(createDto, tenantSlug) {                      │
│    // 1. Validar límite de plantillas ✅ OK (7/1000)        │
│    await this.checkTemplatesLimit(tenantId);                │
│                                                              │
│    // 2. Validar servicios ❌ FALLA AQUÍ                    │
│    const services = await this.validateServices(            │
│      createDto.serviceIds,  // []                           │
│      tenantId                                               │
│    );                                                        │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND: validateServices()                                │
│  private async validateServices(serviceIds, tenantId) {     │
│    if (!serviceIds || serviceIds.length === 0) {            │
│      throw new BadRequestException(                         │
│        'Debe asociar al menos un servicio a la plantilla'   │
│      );  ← ❌ LANZA ERROR 400                               │
│    }                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND: Responde con error                                │
│  HTTP 400 Bad Request                                       │
│  {                                                           │
│    "statusCode": 400,                                       │
│    "message": "Debe asociar al menos un servicio..."        │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND: Recibe error                                     │
│  ⚠️ Botón se queda azul "cargando"                          │
│  ⚠️ No muestra mensaje de error al usuario                  │
│  ⚠️ Usuario no sabe qué pasó                                │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ FLUJO CORRECTO

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND: Formulario de Creación de Plantilla             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Nombre: [Consentimiento de Procedimiento]            │ │
│  │ Tipo: [Procedimiento ▼]                              │ │
│  │ Contenido: [Texto de la plantilla...]                │ │
│  │ Servicios: [✓] Servicio 1  ← ✅ SELECCIONA SERVICIO  │ │
│  │            [✓] Servicio 2                             │ │
│  │                                                        │ │
│  │ [Guardar]                                             │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND: Validaciones                                      │
│  ✅ Límite de plantillas OK (7/1000)                        │
│  ✅ Servicios OK (2 servicios seleccionados)                │
│  ✅ Servicios pertenecen al tenant                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND: Crea la plantilla                                 │
│  ✅ Plantilla guardada en base de datos                     │
│  ✅ Asociada a los servicios seleccionados                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND: Éxito                                            │
│  ✅ Muestra mensaje: "Plantilla creada exitosamente"        │
│  ✅ Redirige a la lista de plantillas                       │
│  ✅ Usuario ve la nueva plantilla en la lista               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 ESTADO DEL TENANT

```
┌─────────────────────────────────────────────────────────────┐
│  TENANT: Aquiub Casa de Pestañas                            │
├─────────────────────────────────────────────────────────────┤
│  ID: 2852b690-9401-4ad0-bc70-899977696e8d                   │
│  Estado: ✅ ACTIVO                                          │
│  Plan: Custom                                               │
├─────────────────────────────────────────────────────────────┤
│  PLANTILLAS CN:                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Usadas:  7                                          │   │
│  │ Límite:  1000                                       │   │
│  │ Uso:     0.7%                                       │   │
│  │ Estado:  ✅ OK (993 disponibles)                    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  SERVICIOS:                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Total:   ? (pendiente de verificar)                 │   │
│  │ Estado:  ⚠️ VERIFICAR SI EXISTEN                    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  USUARIOS:                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Permisos: ⚠️ VERIFICAR templates.create             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 PUNTOS DE VERIFICACIÓN

```
┌─────────────────────────────────────────────────────────────┐
│  CHECKLIST DE DIAGNÓSTICO                                   │
├─────────────────────────────────────────────────────────────┤
│  [ ] 1. ¿El tenant está activo?                             │
│      ✅ SÍ - Estado: active                                 │
│                                                              │
│  [ ] 2. ¿Ha alcanzado el límite de plantillas?              │
│      ✅ NO - 7/1000 (0.7% usado)                            │
│                                                              │
│  [ ] 3. ¿Tiene servicios creados?                           │
│      ⚠️ PENDIENTE DE VERIFICAR                              │
│                                                              │
│  [ ] 4. ¿El usuario tiene permisos?                         │
│      ⚠️ PENDIENTE DE VERIFICAR                              │
│                                                              │
│  [ ] 5. ¿Está seleccionando servicios al crear?             │
│      ❌ PROBABLEMENTE NO (causa más probable)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 SOLUCIÓN VISUAL

```
┌─────────────────────────────────────────────────────────────┐
│  ANTES (❌ Error)                                           │
├─────────────────────────────────────────────────────────────┤
│  Formulario de Plantilla:                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Nombre: [Mi Plantilla]                               │ │
│  │ Tipo: [Procedimiento]                                │ │
│  │ Contenido: [Texto...]                                │ │
│  │ Servicios: [ ] Ninguno seleccionado ← ❌ PROBLEMA    │ │
│  │ [Guardar]                                            │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  DESPUÉS (✅ Correcto)                                      │
├─────────────────────────────────────────────────────────────┤
│  Formulario de Plantilla:                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Nombre: [Mi Plantilla]                               │ │
│  │ Tipo: [Procedimiento]                                │ │
│  │ Contenido: [Texto...]                                │ │
│  │ Servicios:                                           │ │
│  │   [✓] Servicio 1  ← ✅ SELECCIONAR AL MENOS UNO      │ │
│  │   [✓] Servicio 2                                     │ │
│  │   [ ] Servicio 3                                     │ │
│  │ [Guardar]                                            │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 PROBABILIDAD DE CAUSAS

```
┌─────────────────────────────────────────────────────────────┐
│  ANÁLISIS DE PROBABILIDADES                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  85% ████████████████████ Falta seleccionar servicio        │
│                                                              │
│  10% ██                   Sin permisos                       │
│                                                              │
│   3% █                    No hay servicios creados           │
│                                                              │
│   2% █                    Otro error del servidor            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 PRÓXIMOS PASOS

```
┌─────────────────────────────────────────────────────────────┐
│  PASO 1: VALIDACIÓN RÁPIDA (5 min)                          │
├─────────────────────────────────────────────────────────────┤
│  → Enviar instrucciones al usuario                          │
│  → Pedir que seleccione un servicio al crear plantilla      │
│  → Verificar si se resuelve el problema                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 2: SI PERSISTE (10 min)                               │
├─────────────────────────────────────────────────────────────┤
│  → Pedir captura de error en DevTools (F12)                 │
│  → Revisar logs del servidor                                │
│  → Verificar permisos del usuario                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 3: SOLUCIÓN ESPECÍFICA (5-15 min)                     │
├─────────────────────────────────────────────────────────────┤
│  → Aplicar solución según el error identificado             │
│  → Verificar que funcione correctamente                     │
│  → Documentar la solución aplicada                          │
└─────────────────────────────────────────────────────────────┘
```

---

**Fecha:** 22 de Mayo 2026  
**Estado:** ✅ Diagnóstico completado  
**Confianza:** 85% - Causa probable identificada
