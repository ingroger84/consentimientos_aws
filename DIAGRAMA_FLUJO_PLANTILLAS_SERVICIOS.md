# 📊 Diagramas de Flujo - Plantillas CN por Servicio

## 🔄 Flujo de Creación de Plantilla

```
┌─────────────────────────────────────────────────────────────┐
│                         USUARIO                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  1. Clic en "Nueva Plantilla"                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Modal se abre                                           │
│     ├─ Carga servicios activos del tenant                   │
│     └─ Muestra selector múltiple                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Usuario llena formulario                                │
│     ├─ Nombre: "Consentimiento de Spa"                      │
│     ├─ Tipo: "Procedimiento"                                │
│     ├─ Servicios: ☑ Spa ☑ Masajes                          │
│     └─ Contenido: "..."                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Validación Frontend                                     │
│     ├─ ¿Nombre válido? ────────────────┐                   │
│     ├─ ¿Contenido válido? ─────────────┤                   │
│     └─ ¿Al menos 1 servicio? ──────────┤                   │
│                                         │                   │
│                                    ┌────▼────┐              │
│                                    │   NO    │              │
│                                    └────┬────┘              │
│                                         │                   │
│                                         ↓                   │
│                              ┌──────────────────┐           │
│                              │ Mostrar error    │           │
│                              │ "Debe seleccionar│           │
│                              │ al menos 1       │           │
│                              │ servicio"        │           │
│                              └──────────────────┘           │
│                                                             │
│                                    ┌────▼────┐              │
│                                    │   SÍ    │              │
│                                    └────┬────┘              │
└─────────────────────────────────────────┼───────────────────┘
                                          │
                                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. POST /consent-templates                                 │
│     Body: {                                                 │
│       name: "Consentimiento de Spa",                        │
│       type: "procedure",                                    │
│       content: "...",                                       │
│       serviceIds: ["uuid1", "uuid2"]                        │
│     }                                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Backend - ConsentTemplatesService.create()              │
│                                                             │
│     ┌───────────────────────────────────────────┐          │
│     │ validateServices(serviceIds, tenantId)    │          │
│     │                                           │          │
│     │ ┌─────────────────────────────────────┐  │          │
│     │ │ ¿Servicios existen?                 │  │          │
│     │ └─────────────────────────────────────┘  │          │
│     │              │                            │          │
│     │              ↓                            │          │
│     │ ┌─────────────────────────────────────┐  │          │
│     │ │ ¿Pertenecen al tenant?              │  │          │
│     │ └─────────────────────────────────────┘  │          │
│     │              │                            │          │
│     │              ↓                            │          │
│     │ ┌─────────────────────────────────────┐  │          │
│     │ │ ¿Están activos?                     │  │          │
│     │ └─────────────────────────────────────┘  │          │
│     │              │                            │          │
│     │              ↓                            │          │
│     │         ┌────▼────┐                       │          │
│     │         │   NO    │                       │          │
│     │         └────┬────┘                       │          │
│     │              │                            │          │
│     │              ↓                            │          │
│     │    ┌──────────────────┐                  │          │
│     │    │ BadRequestException│                │          │
│     │    │ "Servicios no    │                  │          │
│     │    │ válidos"         │                  │          │
│     │    └──────────────────┘                  │          │
│     │                                           │          │
│     │         ┌────▼────┐                       │          │
│     │         │   SÍ    │                       │          │
│     │         └────┬────┘                       │          │
│     │              │                            │          │
│     │              ↓                            │          │
│     │    ┌──────────────────┐                  │          │
│     │    │ Retornar Service[]│                 │          │
│     │    └──────────────────┘                  │          │
│     └───────────────────────────────────────────┘          │
│                            │                                │
│                            ↓                                │
│     ┌───────────────────────────────────────────┐          │
│     │ Crear ConsentTemplate                     │          │
│     │   + Asociar servicios (ManyToMany)        │          │
│     └───────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  7. Base de Datos                                           │
│                                                             │
│     INSERT INTO consent_templates (...)                     │
│     VALUES (...);                                           │
│                                                             │
│     INSERT INTO consent_template_services                   │
│     VALUES (template_id, service_id_1);                     │
│                                                             │
│     INSERT INTO consent_template_services                   │
│     VALUES (template_id, service_id_2);                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  8. Respuesta al Frontend                                   │
│     {                                                       │
│       id: "uuid",                                           │
│       name: "Consentimiento de Spa",                        │
│       services: [                                           │
│         { id: "uuid1", name: "Spa" },                       │
│         { id: "uuid2", name: "Masajes" }                    │
│       ]                                                     │
│     }                                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  9. Frontend actualiza lista                                │
│     ├─ Cierra modal                                         │
│     ├─ Recarga plantillas                                   │
│     └─ Muestra mensaje de éxito                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  10. Usuario ve plantilla con servicios                     │
│                                                             │
│      📄 Consentimiento de Spa                               │
│         ⭐ Predeterminada  ✅ Activa                         │
│                                                             │
│         Servicios: [Spa] [Masajes]                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Flujo de Consulta por Servicio

```
┌─────────────────────────────────────────────────────────────┐
│  Cliente contrata servicio "Spa"                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Sistema necesita enviar consentimientos                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  GET /consent-templates/by-service/spa-uuid                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Backend - findByService(serviceId)                         │
│                                                             │
│  SELECT ct.*                                                │
│  FROM consent_templates ct                                  │
│  JOIN consent_template_services cts                         │
│    ON ct.id = cts.consentTemplateId                         │
│  WHERE cts.serviceId = 'spa-uuid'                           │
│    AND ct.isActive = true                                   │
│  ORDER BY ct.isDefault DESC                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Resultado:                                                 │
│  [                                                          │
│    {                                                        │
│      id: "uuid1",                                           │
│      name: "Consentimiento de Spa",                         │
│      type: "procedure",                                     │
│      content: "...",                                        │
│      isDefault: true                                        │
│    },                                                       │
│    {                                                        │
│      id: "uuid2",                                           │
│      name: "Tratamiento de Datos",                          │
│      type: "data_treatment",                                │
│      content: "...",                                        │
│      isDefault: false                                       │
│    }                                                        │
│  ]                                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Sistema envía solo estos 2 consentimientos al cliente     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Modelo de Datos

```
┌──────────────────────────────────────────────────────────────┐
│                      TENANTS                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │ id (PK)                                            │     │
│  │ name                                               │     │
│  │ slug                                               │     │
│  │ ...                                                │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│                          │ 1:N                               │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │                    SERVICES                        │     │
│  ├────────────────────────────────────────────────────┤     │
│  │ id (PK)                                            │     │
│  │ tenantId (FK) ──────────────────────────┐         │     │
│  │ name                                     │         │     │
│  │ description                              │         │     │
│  │ isActive                                 │         │     │
│  │ ...                                      │         │     │
│  └──────────────────────────────────────────┼─────────┘     │
│                          │                  │                │
│                          │                  │                │
│                          │ N:M              │                │
│                          ↓                  │                │
│  ┌────────────────────────────────────────────────────┐     │
│  │       CONSENT_TEMPLATE_SERVICES                    │     │
│  │              (Tabla Intermedia)                    │     │
│  ├────────────────────────────────────────────────────┤     │
│  │ id (PK)                                            │     │
│  │ consentTemplateId (FK) ─────────┐                 │     │
│  │ serviceId (FK) ─────────────────┼─────────────────┘     │
│  │ createdAt                        │                       │
│  │ UNIQUE(consentTemplateId, serviceId)                     │
│  └──────────────────────────────────┼───────────────────────┘
│                          │           │                       │
│                          │ N:M       │                       │
│                          ↓           │                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │              CONSENT_TEMPLATES                     │     │
│  ├────────────────────────────────────────────────────┤     │
│  │ id (PK)                                            │     │
│  │ tenantId (FK) ──────────────────────────────────────────┘
│  │ name                                               │
│  │ type (enum)                                        │
│  │ content (text)                                     │
│  │ description                                        │
│  │ isActive                                           │
│  │ isDefault                                          │
│  │ createdAt                                          │
│  │ updatedAt                                          │
│  └────────────────────────────────────────────────────┘
```

---

## 🎨 Interfaz de Usuario

```
┌──────────────────────────────────────────────────────────────┐
│  Gestión de Plantillas > Plantillas de CN                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Nueva Plantilla]                                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📄 Consentimiento de Spa                               │ │
│  │    ⭐ Predeterminada  ✅ Activa                         │ │
│  │                                                        │ │
│  │    Plantilla para tratamientos de spa y bienestar     │ │
│  │                                                        │ │
│  │    Servicios: [Spa] [Masajes] [Sauna]                 │ │
│  │                                                        │ │
│  │    Tipo: Consentimiento de Procedimiento              │ │
│  │    Actualizada: 17/03/2026                             │ │
│  │                                                        │ │
│  │    [👁️ Ver] [⭐ Default] [✏️ Editar] [🗑️ Eliminar]    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📄 Tratamiento de Datos Personales                     │ │
│  │    ⭐ Predeterminada  ✅ Activa                         │ │
│  │                                                        │ │
│  │    Autorización según Ley 1581 de 2012                │ │
│  │                                                        │ │
│  │    Servicios: [Spa] [Masajes] [Sauna] [Alojamiento]   │ │
│  │              [Restaurante] [Tours]                     │ │
│  │                                                        │ │
│  │    Tipo: Tratamiento de Datos Personales              │ │
│  │    Actualizada: 17/03/2026                             │ │
│  │                                                        │ │
│  │    [👁️ Ver] [⭐ Default] [✏️ Editar] [🗑️ Eliminar]    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📝 Modal de Creación/Edición

```
┌──────────────────────────────────────────────────────────────┐
│  Nueva Plantilla                                        [✕]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Tipo de Plantilla *                                        │
│  [Consentimiento de Procedimiento ▼]                        │
│                                                              │
│  Nombre de la Plantilla *                                   │
│  [Consentimiento de Spa                              ]      │
│                                                              │
│  Descripción                                                │
│  [Plantilla para tratamientos de spa                 ]      │
│                                                              │
│  Servicios Asociados *                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☑ 🏷️ Spa                                              │ │
│  │ ☑ 🏷️ Masajes                                          │ │
│  │ ☐ 🏷️ Sauna                                            │ │
│  │ ☐ 🏷️ Alojamiento                                      │ │
│  │ ☐ 🏷️ Restaurante                                      │ │
│  │ ☐ 🏷️ Tours                                            │ │
│  └────────────────────────────────────────────────────────┘ │
│  2 servicios seleccionados                                  │
│                                                              │
│  Contenido de la Plantilla *        [ℹ️ Ver Variables]      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ CONSENTIMIENTO INFORMADO                               │ │
│  │                                                        │ │
│  │ Yo, {{clientName}}, identificado con {{clientId}},    │ │
│  │ autorizo la realización de tratamientos de spa...     │ │
│  │                                                        │ │
│  │ Servicio: {{serviceName}}                              │ │
│  │ Fecha: {{signDate}}                                    │ │
│  │                                                        │ │
│  │ Firma: _______________________                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ☑ Plantilla activa                                         │
│  ☐ Marcar como predeterminada                               │
│                                                              │
│                                    [Cancelar] [Crear]       │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Migración de Datos

```
┌──────────────────────────────────────────────────────────────┐
│  Script: migrate-existing-templates-to-services.js           │
└──────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  1. Conectar a base de datos                                 │
└──────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  2. Obtener todas las plantillas con tenant                  │
│                                                              │
│     SELECT ct.*, t.name as tenant_name                       │
│     FROM consent_templates ct                                │
│     JOIN tenants t ON ct.tenantId = t.id                     │
└──────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  3. Para cada plantilla:                                     │
│                                                              │
│     ┌────────────────────────────────────────────────────┐  │
│     │ Obtener servicios activos del tenant               │  │
│     │                                                    │  │
│     │ SELECT id, name FROM services                      │  │
│     │ WHERE tenantId = ? AND isActive = true             │  │
│     └────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            ↓                                 │
│     ┌────────────────────────────────────────────────────┐  │
│     │ Para cada servicio:                                │  │
│     │                                                    │  │
│     │ INSERT INTO consent_template_services              │  │
│     │ (consentTemplateId, serviceId, createdAt)          │  │
│     │ VALUES (?, ?, NOW())                               │  │
│     │ ON CONFLICT DO NOTHING                             │  │
│     └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  4. Generar reporte                                          │
│                                                              │
│     📊 RESUMEN DE MIGRACIÓN                                  │
│     ✅ Total de asociaciones creadas: 45                     │
│     ❌ Errores: 0                                            │
│                                                              │
│     📈 VERIFICACIÓN:                                         │
│     Glamping La Polka - Consentimiento Spa: 3 servicios     │
│     Glamping La Polka - Tratamiento Datos: 6 servicios      │
│     ...                                                      │
└──────────────────────────────────────────────────────────────┘
```

---

**Versión**: v61.0.0  
**Fecha**: 17 de marzo de 2026  
**Estado**: ✅ Documentación completa
