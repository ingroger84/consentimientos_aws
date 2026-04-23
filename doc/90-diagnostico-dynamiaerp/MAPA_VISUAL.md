# Mapa Visual: Corrección Integración DynamiaERP

**Fecha**: 20 de Abril de 2026

---

## 🗺️ Flujo de Integración

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE FACTURACIÓN                         │
└─────────────────────────────────────────────────────────────────┘

1. CLIENTE PAGA FACTURA
   │
   ├─► Bold procesa pago
   │   └─► Webhook notifica a nuestro sistema
   │
   ├─► Sistema marca factura como PAGADA
   │   └─► invoices.service.ts → markAsPaid()
   │
   └─► 🔥 INTEGRACIÓN DYNAMIAERP
       │
       ├─► invoices.service.ts → sendToDynamiaErp()
       │   │
       │   ├─► Prepara datos de la factura
       │   │   ├─► Cliente (tenant)
       │   │   ├─► Items (detalles)
       │   │   ├─► Totales
       │   │   └─► Período de facturación
       │   │
       │   └─► dynamiaerp.service.ts → createElectronicInvoice()
       │       │
       │       ├─► HTTP POST a api.pos.dynamiaerp.co
       │       │   └─► /api/ventas/facturaElectronica
       │       │
       │       └─► Respuesta de DynamiaERP
       │           │
       │           ├─► ✅ ÉXITO
       │           │   ├─► CUFE generado
       │           │   ├─► Factura electrónica creada
       │           │   └─► Actualizar BD con CUFE
       │           │
       │           └─► ❌ ERROR
       │               ├─► Guardar error en BD
       │               ├─► Log de error
       │               └─► Continuar (no interrumpir pago)
       │
       └─► Registrar en billing_history
```

---

## 🔧 Arquitectura de Archivos

```
archivo-en-linea/
│
├─► backend/
│   ├─► src/
│   │   ├─► dynamiaerp/
│   │   │   └─► dynamiaerp.service.ts ✅ MODIFICADO
│   │   │       ├─► Interfaces completas
│   │   │       ├─► HTTP (no HTTPS)
│   │   │       └─► URL correcta
│   │   │
│   │   └─► invoices/
│   │       └─► invoices.service.ts ✅ MODIFICADO
│   │           ├─► sendToDynamiaErp()
│   │           ├─► Campos adicionales
│   │           └─► Distribución IVA corregida
│   │
│   ├─► resend-invoice-to-dynamiaerp.js ✅ MODIFICADO
│   ├─► test-dynamiaerp-correct-endpoint.js ✅ MODIFICADO
│   └─► diagnose-dynamiaerp-invoice.js
│
├─► scripts/
│   └─► deploy-v90-dynamiaerp-fix.ps1 ✅ NUEVO
│
└─► doc/
    └─► 90-diagnostico-dynamiaerp/
        ├─► README.md ✅ NUEVO
        ├─► PROBLEMA_FACTURA_NO_ENVIADA.md
        ├─► CORRECCION_URL_ENDPOINT.md
        ├─► CORRECCION_ESTRUCTURA_BODY_SWAGGER.md ✅ NUEVO
        ├─► RESUMEN_CORRECCION_FINAL.md ✅ NUEVO
        └─► MAPA_VISUAL.md ✅ NUEVO (este archivo)
```

---

## 🔄 Flujo de Datos

```
┌──────────────────────────────────────────────────────────────────┐
│                    ESTRUCTURA DEL REQUEST                        │
└──────────────────────────────────────────────────────────────────┘

NUESTRO SISTEMA                    DYNAMIAERP
─────────────────                  ──────────

Invoice (BD)
├─► invoiceNumber ────────────────► numero
├─► paidAt ───────────────────────► fecha, fechaEnvio
├─► dueDate ──────────────────────► fechaVencimiento
├─► periodStart ──────────────────► periodoFacturacion.fechaInicial
├─► periodEnd ────────────────────► periodoFacturacion.fechaFinal
├─► amount ───────────────────────► totales.subtotal
├─► tax ──────────────────────────► totales.totalIVA
├─► total ────────────────────────► totales.total
└─► items[] ──────────────────────► detalles[]

Tenant (BD)
├─► name ─────────────────────────► cliente.razonSocial
├─► documentNumber ───────────────► cliente.identificacion
├─► documentType.code ────────────► cliente.tipoId
├─► contactEmail ─────────────────► cliente.email
└─► contactPhone ─────────────────► cliente.telefono

Config (.env)
├─► DYNAMIAERP_BASE_URL ──────────► hostname
├─► DYNAMIAERP_TOKEN ─────────────► Authorization header
├─► DYNAMIAERP_LLAVE_TECNICA ─────► llaveTecnica
└─► DYNAMIAERP_SUCURSAL ──────────► sucursal
```

---

## 🎯 Cambios Implementados

```
┌──────────────────────────────────────────────────────────────────┐
│                    ANTES vs DESPUÉS                              │
└──────────────────────────────────────────────────────────────────┘

CONFIGURACIÓN:
─────────────
ANTES:                              DESPUÉS:
❌ innovasystems.dynamiaerp.app     ✅ api.pos.dynamiaerp.co
❌ HTTPS puerto 443                 ✅ HTTP puerto 80
❌ Estructura básica                ✅ Estructura completa

INTERFACES:
───────────
ANTES:                              DESPUÉS:
❌ 3 interfaces básicas             ✅ 5 interfaces completas
❌ ~20 campos                       ✅ 50+ campos
❌ Sin tipos opcionales             ✅ Todos los tipos definidos

BODY DEL REQUEST:
─────────────────
ANTES:                              DESPUÉS:
❌ Solo campos básicos              ✅ Campos básicos + opcionales
❌ Sin fechaEnvio                   ✅ Con fechaEnvio
❌ Sin periodoFacturacion           ✅ Con periodoFacturacion
❌ Sin moneda                       ✅ Con moneda (COP)
❌ IVA mal distribuido              ✅ IVA distribuido correctamente

MANEJO DE ERRORES:
──────────────────
ANTES:                              DESPUÉS:
❌ Errores silenciosos              ✅ Errores registrados
❌ Sin logs detallados              ✅ Logs completos
❌ Sin scripts de diagnóstico       ✅ Scripts de diagnóstico
```

---

## 📊 Diagrama de Secuencia

```
Cliente    Bold    Backend    DynamiaERP    DIAN
  │         │         │           │          │
  │ Paga    │         │           │          │
  ├────────►│         │           │          │
  │         │ Webhook │           │          │
  │         ├────────►│           │          │
  │         │         │ Marca     │          │
  │         │         │ PAGADA    │          │
  │         │         │           │          │
  │         │         │ POST      │          │
  │         │         ├──────────►│          │
  │         │         │ /api/     │          │
  │         │         │ ventas/   │          │
  │         │         │ factura   │          │
  │         │         │ Electro   │          │
  │         │         │ nica      │          │
  │         │         │           │          │
  │         │         │           │ Envía    │
  │         │         │           ├─────────►│
  │         │         │           │ XML      │
  │         │         │           │          │
  │         │         │           │ CUFE     │
  │         │         │           │◄─────────┤
  │         │         │           │          │
  │         │         │ Response  │          │
  │         │         │◄──────────┤          │
  │         │         │ {cufe,    │          │
  │         │         │  estado}  │          │
  │         │         │           │          │
  │         │         │ Actualiza │          │
  │         │         │ BD con    │          │
  │         │         │ CUFE      │          │
  │         │         │           │          │
  │ Email   │         │           │          │
  │◄────────┼─────────┤           │          │
  │ Factura │         │           │          │
  │ Pagada  │         │           │          │
```

---

## 🗂️ Estructura de Datos

```
┌──────────────────────────────────────────────────────────────────┐
│                    INVOICE (Base de Datos)                       │
└──────────────────────────────────────────────────────────────────┘

invoices
├─► id (UUID)
├─► invoiceNumber (INV-202604-3740)
├─► tenantId (UUID)
├─► status (paid)
├─► amount (203000.00)
├─► tax (0.00)
├─► total (203000.00)
├─► paidAt (2026-04-20 11:13:30)
├─► dueDate (2026-04-21)
├─► periodStart (2026-04-01)
├─► periodEnd (2026-04-30)
├─► items (JSON[])
│   └─► [{
│         description: "Plan Profesional",
│         quantity: 1,
│         unitPrice: 203000,
│         total: 203000
│       }]
│
└─► DynamiaERP Fields:
    ├─► dynamiaerpCufe (CUFE generado) ✅
    ├─► dynamiaerpInvoiceId (ID en DynamiaERP)
    ├─► dynamiaerpInvoiceNumber (Número en DynamiaERP)
    ├─► dynamiaerpStatus (Estado)
    ├─► dynamiaerpSentAt (Fecha de envío)
    ├─► dynamiaerpSentToDian (Boolean)
    ├─► dynamiaerpError (Mensaje de error)
    └─► dynamiaerpResponse (JSON completo)
```

---

## 🔐 Códigos DIAN

```
┌──────────────────────────────────────────────────────────────────┐
│                    CÓDIGOS OFICIALES DIAN                        │
└──────────────────────────────────────────────────────────────────┘

TIPOS DE DOCUMENTO:
───────────────────
11 ─► Registro Civil (RC)
12 ─► Tarjeta de Identidad (TI)
13 ─► Cédula de Ciudadanía (CC) ⭐ Más común
22 ─► Cédula de Extranjería (CE)
31 ─► NIT ⭐ Para empresas
41 ─► Pasaporte (PP)

RESPONSABILIDADES FISCALES:
───────────────────────────
O-13 ─► Gran contribuyente ⭐ Default
O-15 ─► Autorretenedor
O-23 ─► Agente de retención IVA
O-47 ─► Régimen simple de tributación
R-99-PN ─► No responsable de IVA

CIUDADES PRINCIPALES:
─────────────────────
11001 ─► Bogotá D.C. ⭐ Default
05001 ─► Medellín
76001 ─► Cali
08001 ─► Barranquilla
13001 ─► Cartagena
54001 ─► Cúcuta
66001 ─► Pereira
17001 ─► Manizales

DEPARTAMENTOS:
──────────────
11 ─► Cundinamarca (Bogotá) ⭐ Default
05 ─► Antioquia (Medellín)
76 ─► Valle del Cauca (Cali)
08 ─► Atlántico (Barranquilla)
13 ─► Bolívar (Cartagena)
```

---

## 🚀 Proceso de Despliegue

```
┌──────────────────────────────────────────────────────────────────┐
│                    FLUJO DE DESPLIEGUE                           │
└──────────────────────────────────────────────────────────────────┘

LOCAL                           SERVIDOR
─────                           ────────

1. Compilar Backend
   npm run build
   │
   └─► dist/ generado
       │
       ├─► 2. Subir dist/
       │   scp -r dist/ server:/path/
       │
       ├─► 3. Subir scripts
       │   scp *.js server:/path/
       │
       └─► 4. Actualizar .env
           ssh server
           │
           ├─► DYNAMIAERP_BASE_URL=api.pos.dynamiaerp.co
           ├─► DYNAMIAERP_TOKEN=tk...
           ├─► DYNAMIAERP_LLAVE_TECNICA=b4...
           └─► DYNAMIAERP_SUCURSAL=PRINCIPAL
               │
               └─► 5. Reiniciar PM2
                   pm2 restart backend
                   │
                   └─► 6. Verificar
                       ├─► pm2 logs backend
                       ├─► test-dynamiaerp-correct-endpoint.js
                       └─► resend-invoice-to-dynamiaerp.js
```

---

## 📈 Métricas de Éxito

```
┌──────────────────────────────────────────────────────────────────┐
│                    INDICADORES CLAVE                             │
└──────────────────────────────────────────────────────────────────┘

ANTES DE LA CORRECCIÓN:
───────────────────────
❌ Facturas con CUFE: 0%
❌ Tasa de error: 100%
❌ Tiempo de respuesta: N/A (timeout)
❌ Reintentos exitosos: 0%

DESPUÉS DE LA CORRECCIÓN (Esperado):
─────────────────────────────────────
✅ Facturas con CUFE: 100%
✅ Tasa de error: < 1%
✅ Tiempo de respuesta: < 5 segundos
✅ Reintentos exitosos: > 95%

MONITOREO:
──────────
📊 Facturas pagadas hoy: X
📊 Facturas con CUFE: Y
📊 Tasa de éxito: Y/X * 100%
📊 Errores: X - Y
📊 Tiempo promedio: Z segundos
```

---

## 🎯 Próximos Pasos

```
┌──────────────────────────────────────────────────────────────────┐
│                    ROADMAP DE MEJORAS                            │
└──────────────────────────────────────────────────────────────────┘

INMEDIATO (Hoy):
────────────────
1. ✅ Desplegar corrección
2. ✅ Reenviar factura de Aquiub
3. ✅ Verificar CUFE generado
4. ✅ Monitorear logs

CORTO PLAZO (Esta Semana):
──────────────────────────
1. 📊 Dashboard de facturas sin CUFE
2. 🔔 Alertas automáticas de error
3. 🔄 Endpoint de reenvío manual
4. 📝 Documentación de troubleshooting

MEDIANO PLAZO (Este Mes):
─────────────────────────
1. 🔁 Cola de reintentos automáticos
2. 📈 Reportes de facturación electrónica
3. 🌐 Integración con más campos de DynamiaERP
4. 🧪 Tests automatizados

LARGO PLAZO (Próximos Meses):
──────────────────────────────
1. 🤖 Monitoreo proactivo con IA
2. 📧 Notificaciones a clientes
3. 🔗 Integración con otros sistemas
4. 📱 App móvil para consultar facturas
```

---

**Documentado por**: Kiro AI  
**Fecha**: 20 de Abril de 2026  
**Versión**: v90
