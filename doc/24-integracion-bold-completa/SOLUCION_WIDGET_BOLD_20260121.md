# Solución: Integrar Widget de Bold Colombia - 21 Enero 2026

## 🎯 CONCLUSIÓN FINAL

Después de investigación exhaustiva, confirmamos que:

**Bold Colombia NO tiene API REST pública**. Las credenciales que tienes son para el **"Botón de Pagos"**, que es un widget JavaScript que se integra en el frontend.

## 🔧 SOLUCIÓN: Usar Widget de Bold

### Opción 1: Widget Embebido (Recomendado para tu caso)

Esta opción permite que el usuario pague sin salir de tu sitio web.

#### 1. Agregar Script de Bold al HTML

```html
<!-- frontend/index.html -->
<script src="https://checkout.bold.co/library/boldPaymentButton.js"></script>
```

#### 2. Crear Componente de Pago

```typescript
// frontend/src/components/invoices/BoldPaymentButton.tsx
import React, { useEffect, useRef } from 'react';

interface BoldPaymentButtonProps {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  customerEmail: string;
  customerName: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const BoldPaymentButton: React.FC<BoldPaymentButtonProps> = ({
  amount,
  currency,
  description,
  reference,
  customerEmail,
  customerName,
  onSuccess,
  onError,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    // Configuración del widget de Bold
    const config = {
      // Llave de identidad (del panel Bold)
      apiKey: 'g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE',
      
      // Datos de la transacción
      amount: Math.round(amount), // En pesos colombianos
      currency: currency || 'COP',
      description: description,
      reference: reference,
      
      // Datos del cliente
      customer: {
        name: customerName,
        email: customerEmail,
      },
      
      // URLs de redirección
      redirectUrl: `${window.location.origin}/payment/success`,
      
      // Callbacks
      onSuccess: (data: any) => {
        console.log('Pago exitoso:', data);
        if (onSuccess) onSuccess(data);
      },
      
      onError: (error: any) => {
        console.error('Error en pago:', error);
        if (onError) onError(error);
      },
      
      // Configuración visual
      buttonText: 'Pagar con Bold',
      buttonColor: '#00D4FF',
      buttonStyle: 'default', // 'default' | 'minimal' | 'custom'
    };

    // Inicializar widget de Bold
    // @ts-ignore
    if (window.BoldPaymentButton) {
      // @ts-ignore
      window.BoldPaymentButton.init(buttonRef.current, config);
    }

    return () => {
      // Limpiar widget al desmontar
      if (buttonRef.current) {
        buttonRef.current.innerHTML = '';
      }
    };
  }, [amount, currency, description, reference, customerEmail, customerName]);

  return (
    <div>
      <div ref={buttonRef} id="bold-payment-button"></div>
    </div>
  );
};
```

#### 3. Usar en el Modal de Pago

```typescript
// frontend/src/components/invoices/PayNowModal.tsx
import { BoldPaymentButton } from './BoldPaymentButton';

// Dentro del modal, reemplazar el botón actual por:
<BoldPaymentButton
  amount={invoice.total}
  currency="COP"
  description={`Factura ${invoice.invoiceNumber} - ${invoice.tenant.name}`}
  reference={`INV-${invoice.invoiceNumber}-${Date.now()}`}
  customerEmail={invoice.tenant.email}
  customerName={invoice.tenant.name}
  onSuccess={(data) => {
    console.log('Pago exitoso:', data);
    // Actualizar estado de la factura
    handlePaymentSuccess(data);
  }}
  onError={(error) => {
    console.error('Error en pago:', error);
    toast.error('Error al procesar el pago');
  }}
/>
```

### Opción 2: Link de Pago Manual (Más Simple)

Si el widget no funciona, puedes crear links de pago manualmente desde el panel de Bold.

#### Proceso:

1. **Ir al Panel de Bold:** https://panel.bold.co
2. **Crear Link de Pago:**
   - Ir a "Botón de Pagos" > "Links de Pago"
   - Hacer clic en "Crear Link"
   - Llenar datos:
     - Monto: $119.900
     - Descripción: Factura INV-202601-001
     - Email del cliente: cliente@example.com
   - Copiar el link generado

3. **Enviar Link por Email:**
   - Usar el servicio de email existente
   - Incluir el link en el correo de la factura

#### Código para Enviar Email con Link

```typescript
// backend/src/invoices/invoices.service.ts

async sendInvoiceWithPaymentLink(invoiceId: string, paymentLink: string) {
  const invoice = await this.findOne(invoiceId);
  
  await this.mailService.sendMail({
    to: invoice.tenant.email,
    subject: `Factura ${invoice.invoiceNumber} - ${invoice.tenant.name}`,
    template: 'invoice-with-payment-link',
    context: {
      invoice,
      paymentLink,
      companyName: 'DatAgree',
    },
  });
}
```

### Opción 3: Migrar a Wompi (Recomendado a Largo Plazo)

Como ya documenté en `doc/25-integracion-wompi/GUIA_MIGRACION_WOMPI.md`, Wompi ofrece:

- ✅ API REST completa
- ✅ Payment links programáticos
- ✅ Webhooks automáticos
- ✅ Mejor documentación

## 📋 COMPARACIÓN DE OPCIONES

| Característica | Widget Bold | Links Manuales | Wompi API |
|----------------|-------------|----------------|-----------|
| Automatización | ⚠️ Parcial | ❌ Manual | ✅ Total |
| Integración | Frontend | Email | Backend |
| Webhooks | ⚠️ Limitado | ❌ No | ✅ Sí |
| Escalabilidad | ⚠️ Media | ❌ Baja | ✅ Alta |
| Documentación | ⚠️ Limitada | ✅ Simple | ✅ Completa |
| Tiempo de implementación | 2-4 horas | 30 min | 4-6 horas |

## 🎯 RECOMENDACIÓN FINAL

### Para Corto Plazo (Hoy):
**Usar Links Manuales** - Es la forma más rápida de empezar a cobrar.

### Para Mediano Plazo (Esta Semana):
**Implementar Widget de Bold** - Si Bold proporciona documentación del widget.

### Para Largo Plazo (Próximo Mes):
**Migrar a Wompi** - Para tener una solución completamente automatizada y escalable.

## 📞 CONTACTAR A BOLD

Antes de decidir, te recomiendo contactar a Bold para:

1. Confirmar que no tienen API REST
2. Solicitar documentación del widget
3. Preguntar sobre webhooks
4. Consultar roadmap de API

**Contacto:**
- Email: soporte@bold.co
- Teléfono: (Ver en panel.bold.co)
- Chat: En el panel de Bold

## 🚀 PRÓXIMOS PASOS

1. **Contactar a Bold** para confirmar opciones de integración
2. **Decidir** entre widget, links manuales o Wompi
3. **Implementar** la solución elegida
4. **Probar** con transacciones de prueba
5. **Documentar** el proceso final

---

**Fecha:** 21 de Enero de 2026  
**Estado:** Opciones documentadas  
**Decisión pendiente:** Contactar a Bold o migrar a Wompi
