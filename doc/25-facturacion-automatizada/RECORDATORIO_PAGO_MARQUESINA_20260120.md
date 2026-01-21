# Recordatorio de Pago - Marquesina Implementada

**Fecha:** 20 de enero de 2026, 8:15 PM  
**Estado:** ✅ Completo

## 📋 Resumen

Se ha implementado una marquesina de recordatorio de pago que aparece automáticamente cuando un usuario de tenant inicia sesión y tiene facturas pendientes próximas a vencer (5 días o menos) o vencidas.

## ✨ Características Implementadas

### 1. Recordatorio 5 Días Antes

La marquesina aparece automáticamente cuando:
- Faltan **5 días o menos** para la fecha de vencimiento de una factura
- La factura está en estado `pending` o `overdue`
- El usuario pertenece a un tenant (no super_admin)

### 2. Dos Tipos de Alertas

**🟡 Alerta Amarilla (Próximo a Vencer)**
- Aparece cuando faltan 5 días o menos
- Diseño con gradiente amarillo-naranja
- Animación suave
- Muestra:
  - Número de factura
  - Fecha de vencimiento
  - Días restantes
  - Monto a pagar
  - Botón "Pagar Ahora"
  - Botón "Ver Factura"

**🔴 Alerta Roja (Vencida)**
- Aparece cuando la factura está vencida
- Animación de pulso y rebote
- Mensaje de urgencia
- Muestra:
  - Número de factura
  - Días de retraso
  - Advertencia de suspensión
  - Botón "Pagar Ahora"
  - Botón "Ver Facturas"

### 3. Botón "Pagar Ahora"

**Funcionalidad:**
1. Al hacer clic, llama al endpoint `POST /api/invoices/:id/create-payment-link`
2. Genera un link de pago en Bold
3. Abre el link en una nueva ventana
4. Muestra estado de carga mientras genera el link

**Estados:**
- Normal: "Pagar Ahora"
- Cargando: "Generando link..."
- Deshabilitado mientras procesa

### 4. Diseño Tipo Marquesina

**Características visuales:**
- Gradiente de colores según urgencia
- Sombras y bordes destacados
- Animaciones CSS:
  - `animate-pulse` para facturas vencidas
  - `animate-bounce` para el ícono de alerta
  - `transform hover:scale-105` para el botón de pago
- Diseño responsivo
- Botón de cerrar (X) para descartar temporalmente

## 📁 Archivos Modificados

### `frontend/src/components/billing/PaymentReminderBanner.tsx`

**Cambios realizados:**

1. **Importaciones:**
```typescript
import { ExternalLink } from 'lucide-react';
import api from '@/services/api';
```

2. **Estado nuevo:**
```typescript
const [creatingPaymentLink, setCreatingPaymentLink] = useState(false);
```

3. **Función handlePayNow:**
```typescript
const handlePayNow = async (invoiceId: string) => {
  try {
    setCreatingPaymentLink(true);
    const response = await api.post(`/invoices/${invoiceId}/create-payment-link`);
    
    if (response.data.success && response.data.paymentLink) {
      window.open(response.data.paymentLink, '_blank');
    }
  } catch (error: any) {
    console.error('Error creating payment link:', error);
    alert(error.response?.data?.message || 'Error al crear el link de pago');
  } finally {
    setCreatingPaymentLink(false);
  }
};
```

4. **Cambio de umbral:**
- Antes: `if (daysUntilDue <= 7)`
- Ahora: `if (daysUntilDue <= 5)`

5. **Diseño mejorado:**
- Gradientes de color
- Animaciones CSS
- Botón "Pagar Ahora" destacado
- Información más detallada

## 🎨 Estilos y Animaciones

### Alerta Amarilla (Próximo a Vencer)

```tsx
<div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 mb-6 shadow-md">
  {/* Contenido */}
</div>
```

**Botón Pagar Ahora:**
```tsx
<button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
```

### Alerta Roja (Vencida)

```tsx
<div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 animate-pulse">
  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-bounce" />
  {/* Contenido */}
</div>
```

## 🔄 Flujo de Usuario

```
1. Usuario inicia sesión
   ↓
2. Layout carga PaymentReminderBanner
   ↓
3. Banner consulta facturas pendientes del tenant
   ↓
4. Si hay facturas próximas a vencer (≤5 días):
   ↓
5. Muestra marquesina amarilla con:
   - Información de la factura
   - Botón "Pagar Ahora"
   - Botón "Ver Factura"
   ↓
6. Usuario hace clic en "Pagar Ahora"
   ↓
7. Sistema genera link de pago Bold
   ↓
8. Abre link en nueva ventana
   ↓
9. Usuario completa el pago en Bold
```

## 📊 Lógica de Visualización

```typescript
// Prioridad de alertas:
1. Facturas vencidas (rojo) - Máxima prioridad
2. Facturas próximas a vencer ≤5 días (amarillo)
3. No mostrar si no hay facturas pendientes
4. No mostrar si el usuario es super_admin
5. No mostrar si el usuario cerró la alerta
```

## 🧪 Casos de Prueba

### Caso 1: Factura Vence en 5 Días
- ✅ Debe mostrar alerta amarilla
- ✅ Debe mostrar "5 días restantes"
- ✅ Botón "Pagar Ahora" debe funcionar

### Caso 2: Factura Vence en 6 Días
- ✅ NO debe mostrar alerta (fuera del umbral)

### Caso 3: Factura Vence en 1 Día
- ✅ Debe mostrar alerta amarilla
- ✅ Debe mostrar "1 día restante"

### Caso 4: Factura Vencida
- ✅ Debe mostrar alerta roja
- ✅ Debe mostrar días de retraso
- ✅ Debe tener animación de pulso

### Caso 5: Usuario Super Admin
- ✅ NO debe mostrar alerta (no tiene tenant)

### Caso 6: Sin Facturas Pendientes
- ✅ NO debe mostrar alerta

### Caso 7: Click en "Pagar Ahora"
- ✅ Debe generar link de pago
- ✅ Debe abrir en nueva ventana
- ✅ Debe mostrar estado de carga

### Caso 8: Click en "X" (Cerrar)
- ✅ Debe ocultar la alerta
- ✅ No debe volver a aparecer hasta recargar

## 🎯 Mejores Prácticas Aplicadas

1. **UX/UI:**
   - Colores según urgencia (amarillo → rojo)
   - Animaciones sutiles pero efectivas
   - Información clara y concisa
   - Botones de acción destacados

2. **Código:**
   - Componente reutilizable
   - Estado manejado con hooks
   - Manejo de errores
   - Loading states
   - TypeScript para type safety

3. **Accesibilidad:**
   - Colores con buen contraste
   - Iconos descriptivos
   - Mensajes claros
   - Botones con estados visuales

4. **Performance:**
   - Carga solo cuando es necesario
   - No re-renderiza innecesariamente
   - Consulta API una sola vez al cargar

## 📝 Notas Técnicas

### Integración con Bold

El botón "Pagar Ahora" utiliza el endpoint implementado anteriormente:
```typescript
POST /api/invoices/:id/create-payment-link
```

Este endpoint:
1. Crea un link de pago en Bold
2. Guarda el link en la factura
3. Retorna la URL del link
4. El frontend abre el link en nueva ventana

### Persistencia del Estado

El estado `dismissed` se mantiene en memoria durante la sesión:
- Si el usuario cierra la alerta, no vuelve a aparecer
- Al recargar la página, la alerta vuelve a aparecer
- Esto evita que sea molesto pero mantiene la visibilidad

### Cálculo de Días

Utiliza la función `getDaysUntilDue` del servicio de facturas:
```typescript
const daysUntilDue = invoicesService.getDaysUntilDue(invoice.dueDate);
```

## 🚀 Próximos Pasos Opcionales

1. **Persistir estado dismissed:**
   - Guardar en localStorage
   - No mostrar por 24 horas después de cerrar

2. **Notificaciones push:**
   - Enviar notificación del navegador
   - Recordatorio diario

3. **Email automático:**
   - Enviar email 5 días antes
   - Incluir link de pago directo

4. **Múltiples facturas:**
   - Mostrar contador de facturas pendientes
   - Carrusel de facturas

5. **Historial de pagos:**
   - Link a historial de pagos
   - Mostrar último pago realizado

## ✅ Checklist de Implementación

- [x] Cambiar umbral de 7 a 5 días
- [x] Agregar botón "Pagar Ahora"
- [x] Integrar con endpoint de Bold
- [x] Agregar animaciones tipo marquesina
- [x] Mejorar diseño visual
- [x] Agregar estados de carga
- [x] Manejo de errores
- [x] Mostrar fecha de vencimiento completa
- [x] Mostrar días restantes en badge
- [x] Diseño responsivo
- [x] Documentación completa

---

**Última actualización:** 20 de enero de 2026, 8:15 PM
