# Implementación Pago en Registro de Tenants - V76.3.0
**Fecha:** 2026-03-28  
**Estado:** ✅ Completado y Desplegado

## Resumen
Se implementó la generación automática de factura y link de pago al momento del registro de nuevos tenants, aplicando solo para planes con precio mayor a cero.

## Cambios Implementados

### Backend

#### 1. TenantsService (`backend/src/tenants/tenants.service.ts`)
- **Nuevo método privado:** `generateFirstInvoice()`
  - Genera factura automáticamente al crear tenant
  - Solo para planes con `planPrice > 0`
  - Calcula período según ciclo de facturación (mensual/anual)
  - Fecha de vencimiento: 5 días después del registro
  - Genera link de pago de Bold automáticamente
  - Factura exenta de IVA (primera suscripción)

- **Modificación en método `create()`:**
  - Llama a `generateFirstInvoice()` después de crear el tenant
  - Retorna el tenant con la propiedad `firstInvoice` si aplica
  - No falla la creación si hay error en factura (solo log)

#### 2. TenantsModule (`backend/src/tenants/tenants.module.ts`)
- Agregado `forwardRef(() => InvoicesModule)` para evitar dependencia circular
- Inyección de `InvoicesService` en `TenantsService`

#### 3. Imports Actualizados
- `BillingCycle` desde `tenant.entity`
- `InvoiceStatus` desde `invoice.entity`
- `InvoicesService` desde `invoices.service`

### Frontend

#### 1. Nueva Página: SignupPaymentPage (`frontend/src/pages/SignupPaymentPage.tsx`)
- Página intermedia después del registro exitoso
- Muestra información de la factura generada
- Botón "Pagar Ahora" → Redirige a Bold
- Botón "Pagar Después" → Redirige al login del tenant
- Diseño responsive y amigable
- Validación de datos requeridos

#### 2. SignupModal Modificado (`frontend/src/components/landing/SignupModal.tsx`)
- Detecta si la respuesta incluye `firstInvoice`
- Redirige a `/signup-payment` con parámetros de factura
- Plan gratuito mantiene flujo normal (sin pago)

#### 3. Router Actualizado (`frontend/src/App.tsx`)
- Nueva ruta pública: `/signup-payment`
- Carga eager (no lazy) para mejor UX

## Flujo de Usuario

### Plan con Precio > 0 (Básico, Emprendedor, Plus, Empresarial)
1. Usuario completa formulario de registro
2. Sistema crea tenant y usuario administrador
3. Sistema genera primera factura automáticamente
4. Sistema crea link de pago en Bold
5. Usuario es redirigido a página de pago intermedia
6. Usuario puede:
   - **Pagar Ahora:** Redirige a Bold para completar pago
   - **Pagar Después:** Redirige al login (puede pagar desde panel)

### Plan Gratuito
1. Usuario completa formulario de registro
2. Sistema crea tenant y usuario administrador
3. NO se genera factura
4. Usuario ve mensaje de éxito normal
5. Usuario puede ir directo al login

## Detalles Técnicos

### Factura Generada
```typescript
{
  amount: planPrice,
  tax: 0,
  total: planPrice,
  currency: 'COP',
  status: 'pending',
  dueDate: now + 5 días,
  periodStart: now,
  periodEnd: now + 1 mes/año (según ciclo),
  taxExempt: true,
  taxExemptReason: 'Primera factura de suscripción - Sin IVA',
  items: [{
    description: 'Suscripción Plan {nombre} - {ciclo}',
    quantity: 1,
    unitPrice: planPrice,
    total: planPrice
  }]
}
```

### Link de Pago Bold
- Generado automáticamente usando `InvoicesService.createPaymentLink()`
- URL de redirección dinámica por tenant
- Formato: `https://{tenant-slug}.archivoenlinea.com/invoices/{id}/payment-success`

### Parámetros URL Página de Pago
```
/signup-payment?
  tenantName={nombre}
  &tenantSlug={slug}
  &invoiceId={id}
  &invoiceNumber={número}
  &total={monto}
  &dueDate={fecha}
  &paymentLink={url-bold}
```

## Mejores Prácticas Aplicadas

1. **Transaccionalidad:** Creación de tenant en transacción, factura después del commit
2. **Manejo de Errores:** No falla registro si falla generación de factura
3. **Logging:** Logs detallados de cada paso del proceso
4. **Validación:** Solo genera factura si `planPrice > 0`
5. **UX:** Página intermedia clara con opciones de pago inmediato o posterior
6. **Dependencias:** Uso de `forwardRef()` para evitar ciclos
7. **Seguridad:** Endpoint de creación de tenant sigue siendo público
8. **Flexibilidad:** Usuario puede pagar después desde el panel

## Versiones Actualizadas
- Backend: `76.3.0`
- Frontend: `76.3.0`
- Fecha: `2026-03-28`

## Archivos Modificados
- `backend/src/tenants/tenants.service.ts`
- `backend/src/tenants/tenants.module.ts`
- `backend/package.json`
- `frontend/src/pages/SignupPaymentPage.tsx` (nuevo)
- `frontend/src/components/landing/SignupModal.tsx`
- `frontend/src/App.tsx`
- `frontend/src/config/version.ts`
- `frontend/package.json`

## Despliegue
- ✅ Backend compilado y desplegado
- ✅ Frontend compilado y desplegado
- ✅ PM2 reiniciado (proceso: datagree)
- ✅ Nginx recargado
- ✅ Versión 76.3.0 activa en producción

## Pruebas Recomendadas

1. **Plan Gratuito:**
   - Crear cuenta con plan gratuito
   - Verificar que NO muestre página de pago
   - Verificar redirección directa al login

2. **Plan Básico:**
   - Crear cuenta con plan básico
   - Verificar que muestre página de pago
   - Verificar datos de factura correctos
   - Probar botón "Pagar Ahora" (debe ir a Bold)
   - Probar botón "Pagar Después" (debe ir al login)

3. **Verificar Factura:**
   - Iniciar sesión como administrador del tenant
   - Ir a "Mis Facturas"
   - Verificar que existe la primera factura
   - Verificar que tiene link de pago de Bold

4. **Verificar Redirección:**
   - Completar pago en Bold
   - Verificar redirección correcta al tenant
   - Verificar actualización de estado de factura

## Notas Importantes

- La factura se genera DESPUÉS del commit de la transacción
- Si falla la generación de factura, el tenant se crea igual
- El usuario puede pagar después desde el panel de facturas
- Links de pago existentes siguen funcionando normalmente
- La primera factura siempre es exenta de IVA
- Fecha de vencimiento: 5 días después del registro
