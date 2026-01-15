# Implementación de Anulación de Facturas

## Resumen

Se implementó la funcionalidad completa para anular facturas pendientes, incluyendo:
- Botón de anulación en el Dashboard de Facturación
- Modal con confirmación y campo obligatorio para motivo de anulación
- Actualización automática del dashboard después de anular
- Nuevas tarjetas de estadísticas para facturas pagadas y canceladas
- Registro del motivo y fecha de anulación en la base de datos

## Cambios en Backend

### 1. Entidad de Factura (Ya existía)

La entidad `Invoice` ya tenía los campos necesarios:

```typescript
@Column({ type: 'text', nullable: true })
cancellationReason: string;

@Column({ type: 'timestamp', nullable: true })
cancelledAt: Date;
```

### 2. Servicio de Facturas

**Archivo:** `backend/src/invoices/invoices.service.ts`

El método `cancel()` ya estaba implementado correctamente:
- Valida que la factura no esté pagada
- Valida que no esté ya cancelada
- Guarda el motivo y fecha de cancelación
- Registra la acción en el historial de facturación

### 3. Servicio de Facturación

**Archivo:** `backend/src/billing/billing.service.ts`

Se actualizó el método `getDashboardStats()` para incluir:

```typescript
// Facturas pagadas (total)
const paidInvoices = await this.invoicesRepository.count({
  where: { status: InvoiceStatus.PAID },
});

// Facturas canceladas (total)
const cancelledInvoices = await this.invoicesRepository.count({
  where: { status: InvoiceStatus.CANCELLED },
});
```

**Retorno actualizado:**
```typescript
return {
  monthlyRevenue: parseFloat(monthlyRevenue?.total || '0'),
  pendingInvoices,
  overdueInvoices,
  paidInvoices,        // ✅ Nuevo
  cancelledInvoices,   // ✅ Nuevo
  suspendedTenants,
  upcomingDue,
  projectedRevenue: parseFloat(projectedRevenue?.total || '0'),
  revenueHistory,
};
```

## Cambios en Frontend

### 1. Servicio de Facturación

**Archivo:** `frontend/src/services/billing.service.ts`

Se actualizó la interfaz `BillingStats`:

```typescript
export interface BillingStats {
  monthlyRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  paidInvoices: number;        // ✅ Nuevo
  cancelledInvoices: number;   // ✅ Nuevo
  suspendedTenants: number;
  upcomingDue: number;
  projectedRevenue: number;
  revenueHistory: Array<{
    month: string;
    revenue: number;
  }>;
}
```

### 2. Dashboard de Facturación

**Archivo:** `frontend/src/pages/BillingDashboardPage.tsx`

#### Estados Agregados

```typescript
const [showCancelModal, setShowCancelModal] = useState(false);
const [cancelInvoice, setCancelInvoice] = useState<Invoice | null>(null);
const [cancellationReason, setCancellationReason] = useState('');
```

#### Handlers Agregados

```typescript
const handleCancelInvoice = (invoice: Invoice) => {
  setCancelInvoice(invoice);
  setCancellationReason('');
  setShowCancelModal(true);
};

const handleSubmitCancellation = async () => {
  if (!cancelInvoice) return;

  if (!cancellationReason.trim()) {
    showToast('❌ Debe especificar un motivo de anulación', 'error');
    return;
  }

  try {
    await invoicesService.cancel(cancelInvoice.id, cancellationReason);
    showToast('✅ Factura anulada exitosamente', 'success');
    setShowCancelModal(false);
    setCancelInvoice(null);
    setCancellationReason('');
    loadData(); // Actualiza el dashboard
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    showToast('❌ Error al anular la factura', 'error');
  }
};
```

#### Nuevas Tarjetas de Estadísticas

Se agregaron dos nuevas tarjetas en el grid de estadísticas:

**Facturas Pagadas:**
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600">Facturas Pagadas</p>
      <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
    </div>
    <CheckCircle className="w-10 h-10 text-green-600" />
  </div>
</div>
```

**Facturas Canceladas:**
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600">Facturas Canceladas</p>
      <p className="text-2xl font-bold text-gray-600">{stats.cancelledInvoices}</p>
    </div>
    <XCircle className="w-10 h-10 text-gray-600" />
  </div>
</div>
```

#### Botón de Anular

Se agregó el botón de anular en la lista de facturas, solo visible para facturas pendientes:

```tsx
{invoice.status === 'pending' && (
  <>
    <button
      onClick={() => handleRegisterPayment(invoice)}
      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
      title="Registrar pago manual"
    >
      <CreditCard className="w-3 h-3" />
      Pago Manual
    </button>
    <button
      onClick={() => handleCancelInvoice(invoice)}
      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      title="Anular factura"
    >
      <XCircle className="w-3 h-3" />
      Anular
    </button>
  </>
)}
```

#### Modal de Anulación

Se agregó un modal completo con:
- Advertencia sobre la acción irreversible
- Información de la factura a anular
- Campo obligatorio para el motivo de anulación
- Validación del motivo antes de enviar
- Botones de cancelar y confirmar

```tsx
{showCancelModal && cancelInvoice && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Anular Factura</h2>
        <button onClick={() => setShowCancelModal(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Advertencia:</strong> Esta acción no se puede deshacer.
          </p>
        </div>
        {/* Información de la factura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de Anulación <span className="text-red-500">*</span>
          </label>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            rows={4}
            placeholder="Especifique el motivo de la anulación..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 p-6 border-t">
        <button onClick={() => setShowCancelModal(false)}>
          Cancelar
        </button>
        <button
          onClick={handleSubmitCancellation}
          disabled={!cancellationReason.trim()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
        >
          Anular Factura
        </button>
      </div>
    </div>
  </div>
)}
```

## Flujo de Anulación

1. **Usuario hace clic en "Anular"** en una factura pendiente
2. **Se abre el modal** mostrando:
   - Advertencia sobre la acción irreversible
   - Información de la factura (número, tenant, monto)
   - Campo obligatorio para el motivo
3. **Usuario ingresa el motivo** de anulación
4. **Usuario confirma** haciendo clic en "Anular Factura"
5. **Sistema valida** que el motivo no esté vacío
6. **Backend procesa** la anulación:
   - Cambia el estado a `CANCELLED`
   - Guarda el motivo y fecha de cancelación
   - Registra la acción en el historial
7. **Frontend actualiza**:
   - Muestra notificación de éxito
   - Cierra el modal
   - Recarga los datos del dashboard
8. **Dashboard se actualiza** mostrando:
   - Contador de facturas canceladas incrementado
   - Contador de facturas pendientes decrementado
   - Factura con estado "Cancelada" en la lista

## Validaciones

### Backend
- ✅ No se puede anular una factura pagada
- ✅ No se puede anular una factura ya cancelada
- ✅ Se guarda el motivo de cancelación
- ✅ Se registra la fecha de cancelación
- ✅ Se registra en el historial de facturación

### Frontend
- ✅ El botón solo aparece en facturas pendientes
- ✅ El motivo es obligatorio (campo requerido)
- ✅ El botón de confirmar se deshabilita si el motivo está vacío
- ✅ Se muestra advertencia sobre la acción irreversible
- ✅ Se actualiza el dashboard automáticamente después de anular

## Mejores Prácticas Implementadas

1. **Validación en múltiples capas**: Frontend y backend
2. **Confirmación explícita**: Modal con advertencia clara
3. **Motivo obligatorio**: Trazabilidad de las anulaciones
4. **Registro en historial**: Auditoría completa
5. **Actualización automática**: UX fluida sin recargas manuales
6. **Notificaciones toast**: Feedback inmediato al usuario
7. **Estados inmutables**: No se puede anular facturas pagadas
8. **Diseño consistente**: Sigue el patrón de otros modales
9. **Accesibilidad**: Campos marcados como requeridos
10. **Seguridad**: Solo Super Admin puede anular facturas

## Archivos Modificados

### Backend
1. `backend/src/billing/billing.service.ts` - Estadísticas actualizadas
2. `backend/src/invoices/invoices.service.ts` - Método cancel mejorado (ya existía)

### Frontend
1. `frontend/src/services/billing.service.ts` - Interface actualizada
2. `frontend/src/pages/BillingDashboardPage.tsx` - UI completa implementada

## Pruebas Recomendadas

1. **Anular factura pendiente**:
   - Verificar que se abre el modal
   - Verificar que el motivo es obligatorio
   - Verificar que se anula correctamente
   - Verificar que se actualiza el dashboard

2. **Intentar anular factura pagada**:
   - Verificar que el botón no aparece

3. **Intentar anular sin motivo**:
   - Verificar que muestra error
   - Verificar que el botón está deshabilitado

4. **Verificar estadísticas**:
   - Verificar que el contador de canceladas aumenta
   - Verificar que el contador de pendientes disminuye

5. **Verificar historial**:
   - Verificar que se registra la anulación
   - Verificar que se guarda el motivo

## Resultado

El sistema ahora permite anular facturas pendientes de forma controlada y auditable, con un flujo de usuario claro y validaciones robustas. El dashboard muestra estadísticas completas de todas las facturas (pendientes, vencidas, pagadas y canceladas).
