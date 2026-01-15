# Changelog - Sistema de Pagos y Facturación

## [1.2.0] - 2025-01-07

### ✨ Nuevas Funcionalidades

#### Vista Previa de PDF Integrada
- Modal de pantalla completa con iframe
- Visualización sin abrir nuevas pestañas
- Gestión automática de memoria (URL.revokeObjectURL)
- Botón de cierre elegante

#### Notificaciones Toast
- Sistema de notificaciones visuales
- Tipos: éxito (verde) y error (rojo)
- Animación suave de entrada (slide-in)
- Auto-cierre después de 5 segundos
- Iconos visuales (CheckCircle/XCircle)

#### Registro de Pago Manual
- Modal de registro para pagos offline
- Campos: monto, método, referencia, notas
- Prellenado automático con datos de factura
- Validación y actualización inmediata
- Solo visible para facturas pendientes

### 🔧 Mejoras

#### Experiencia de Usuario
- Feedback visual claro en todas las acciones
- Confirmación de envío de emails
- Interfaz más intuitiva y profesional
- Mejor gestión de estados de carga

#### Interfaz de Facturas
- 4 botones de acción por factura:
  - Vista Previa (morado)
  - Descargar PDF (verde)
  - Reenviar Email (azul)
  - Pago Manual (naranja)

### 📝 Archivos Modificados

#### Frontend
- `frontend/src/pages/InvoicesPage.tsx` - Componente principal actualizado
- `frontend/src/services/invoices.service.ts` - Método `getPdfUrl()` agregado
- `frontend/src/index.css` - Animación `slide-in` para toast

#### Documentación
- `doc/06-pagos/MEJORAS_GESTION_FACTURAS.md` - Documentación completa
- `doc/06-pagos/RESUMEN_MEJORAS_FACTURAS.md` - Resumen ejecutivo
- `doc/RESUMEN_FINAL_SISTEMA_PAGOS.md` - Actualizado con nuevas funcionalidades

### 🐛 Correcciones
- Limpieza de variables no utilizadas
- Optimización de gestión de memoria con blobs
- Mejora en manejo de errores

---

## [1.1.0] - 2025-01-07

### ✨ Nuevas Funcionalidades

#### Generación de PDF de Facturas
- Servicio completo `InvoicePdfService`
- Diseño profesional con PDFKit
- 3 endpoints: preview, download, resend-email
- Templates HTML para emails

#### Fecha de Corte de Facturación
- Campo `billingDay` en entidad Tenant
- Configuración automática al crear tenant
- Editable por Super Admin
- Lógica de facturación con tolerancia ±1 día

### 🔧 Mejoras

#### Templates de Email
- Corrección de caracteres UTF-8
- Emojis y tildes correctos
- 8 templates actualizados

---

## [1.0.0] - 2025-01-06

### ✨ Lanzamiento Inicial

#### Backend
- 4 entidades: Payment, Invoice, PaymentReminder, BillingHistory
- 3 módulos: PaymentsModule, InvoicesModule, BillingModule
- 15 endpoints REST
- 5 CRON jobs automáticos
- 5 templates de email

#### Frontend
- 3 servicios: payments, invoices, billing
- 3 páginas: PaymentsPage, InvoicesPage, BillingDashboardPage
- 2 componentes: PaymentReminderBanner, RegisterPaymentModal
- 3 rutas agregadas

#### Funcionalidades Core
- Recordatorios automáticos de pago
- Suspensión automática de tenants morosos
- Generación automática de facturas
- Activación automática tras pago
- Dashboard financiero completo
- Historial de pagos y facturación

---

## Próximas Versiones

### [1.3.0] - Planificado
- Historial de envíos de email
- Adjuntar comprobantes de pago
- Exportación de reportes financieros

### [2.0.0] - Futuro
- Integración con pasarelas de pago (PSE, tarjetas)
- Notificaciones push
- Webhooks de confirmación
- Tests automatizados completos
