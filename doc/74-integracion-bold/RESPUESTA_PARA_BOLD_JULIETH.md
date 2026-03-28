# 📧 Respuesta para Julieth - Bold Colombia

**Para**: Julieth (Soporte Técnico Bold)  
**Fecha**: 25 de Marzo 2026  
**Asunto**: Re: Solicitud de información - Link de pago no funciona correctamente

---

## Email para Copiar y Pegar

```
Hola Julieth 👋

Gracias por tu respuesta.

Te comparto la información que solicitas:

═══════════════════════════════════════════════════════════════

📸 CAPTURA DE PANTALLA DEL LINK GENERADO:

La URL del link que se está generando es:
https://checkout.bold.co/payment/INV-NNN-202603-5324-1774448375687

(Ver captura adjunta en el navegador)

═══════════════════════════════════════════════════════════════

🌐 PÁGINA WEB / ECOMMERCE:

Nombre: Archivo en Línea
URL: https://demo-estetica.archivoenlinea.com
Tipo: Plataforma SaaS de gestión de consentimientos informados médicos

Descripción:
Nuestra plataforma permite a clínicas y centros médicos gestionar consentimientos informados digitales. Los clientes pagan planes mensuales/anuales a través de facturas que generamos en el sistema.

═══════════════════════════════════════════════════════════════

📧 CORREO ELECTRÓNICO REGISTRADO EN BOLD:

info@innovasystems.com.co

(Este es el correo que usamos para registrarnos en Bold)

═══════════════════════════════════════════════════════════════

🔑 CREDENCIALES ACTUALES:

Merchant ID: 2M0MTRAD37
API Key (Llave de Identidad): 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
Secret Key (Llave Secreta): KVwpsp4WlWny3apOYoGWvg

═══════════════════════════════════════════════════════════════

🔧 IMPLEMENTACIÓN TÉCNICA ACTUAL:

Endpoint que estamos usando:
POST https://api.online.payments.bold.co/v1/payment-intent

Header de autenticación:
Authorization: x-api-key 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68

Ejemplo de request que enviamos:
```json
{
  "reference_id": "INV-202603-5324-1774448375687",
  "amount": {
    "currency": "COP",
    "total_amount": 100000
  },
  "description": "Factura INV-202603-5324 - Demo Estetica",
  "callback_url": "https://demo-estetica.archivoenlinea.com/invoices/abc123/payment-success",
  "customer": {
    "name": "Cliente Demo",
    "email": "cliente@email.com"
  }
}
```

Tecnologías:
- Backend: Node.js + NestJS + TypeScript
- Base de datos: PostgreSQL (Supabase)
- Servidor: AWS Lightsail
- Frontend: React + TypeScript

═══════════════════════════════════════════════════════════════

❌ PROBLEMA ACTUAL:

Cuando el usuario hace clic en "Pagar Factura":

1. ✅ Nuestro backend crea el link de pago en Bold (request exitoso)
2. ✅ Bold responde con datos (status 200)
3. ✅ Guardamos la URL: https://checkout.bold.co/payment/INV-NNN-202603-5324-1774448375687
4. ✅ Redirigimos al usuario a esa URL
5. ❌ El usuario ve la página de Bold con el mensaje "¡Con Bold pagas rápido y disfrutas tu compra sin esperas!" pero NO se muestra el formulario de pago
6. ❌ La página se queda en estado de carga pero nunca muestra las opciones de pago

═══════════════════════════════════════════════════════════════

🔍 INFORMACIÓN ADICIONAL:

Respuesta que recibimos de Bold al crear el link:
```json
{
  "payload": {
    "reference_id": "INV-202603-5324-1774448375687",
    "status": "ACTIVE",
    "amount": {
      "currency": "COP",
      "total_amount": 100000
    },
    "creation_date": "2026-03-25T09:17:17-05:00"
  }
}
```

Nota: Bold NO devuelve una URL de checkout en la respuesta, por lo que estamos construyendo la URL manualmente:
`https://checkout.bold.co/payment/${reference_id}`

═══════════════════════════════════════════════════════════════

❓ PREGUNTAS:

1. ¿La URL que estamos construyendo es correcta?
   `https://checkout.bold.co/payment/${reference_id}`

2. ¿Bold devuelve una URL de checkout en la respuesta? Si es así, ¿en qué campo?

3. ¿Hay algún paso adicional que debamos hacer después de crear el payment-intent?

4. ¿Necesitamos activar algo en el dashboard de Bold para que los links funcionen?

5. ¿Las credenciales actuales tienen acceso completo a la API de pagos en línea?

═══════════════════════════════════════════════════════════════

📎 ARCHIVOS ADJUNTOS:

1. Captura de pantalla de la URL del link generado (ver navegador)
2. Captura de pantalla del email de Gmail (este email)

═══════════════════════════════════════════════════════════════

Quedamos atentos a tu respuesta para poder resolver este inconveniente y activar los pagos en línea para nuestros clientes.

Muchas gracias por tu ayuda.

Saludos,

[TU NOMBRE]
[TU CARGO]
Archivo en Línea
https://archivoenlinea.com
info@innovasystems.com.co
```

---

## 📋 Checklist Antes de Enviar

- [ ] Reemplazar [TU NOMBRE] con tu nombre
- [ ] Reemplazar [TU CARGO] con tu cargo
- [ ] Adjuntar captura de pantalla del navegador mostrando la URL del link
- [ ] Adjuntar captura de pantalla de este email de Gmail
- [ ] Copiar y pegar el email en Gmail
- [ ] Hacer clic en "Responder" al email de Julieth
- [ ] Enviar

---

## 📸 Capturas de Pantalla a Adjuntar

### 1. Captura del Navegador (Ya la tienes)
La captura que muestra:
```
URL: https://checkout.bold.co/payment/INV-NNN-202603-5324-1774448375687
Página: "¡Con Bold pagas rápido y disfrutas tu compra sin esperas!"
```

### 2. Captura del Email de Gmail (Ya la tienes)
La captura que muestra el email de Julieth pidiendo la información.

---

## 🎯 Información Clave para Bold

### Tu Cuenta:
- **Merchant ID**: 2M0MTRAD37
- **Email registrado**: info@innovasystems.com.co
- **Sitio web**: https://demo-estetica.archivoenlinea.com

### Tu Implementación:
- **Endpoint**: `POST /v1/payment-intent`
- **URL Base**: `https://api.online.payments.bold.co`
- **Autenticación**: `Authorization: x-api-key <llave>`

### El Problema:
- ✅ La API responde correctamente (status 200)
- ✅ Bold devuelve `reference_id` y `status: ACTIVE`
- ❌ La URL construida no muestra el formulario de pago
- ❌ La página se queda en estado de carga

---

## 💡 Lo Que Bold Necesita Saber

1. **La URL del link**: `https://checkout.bold.co/payment/INV-NNN-202603-5324-1774448375687`
2. **Tu página web**: https://demo-estetica.archivoenlinea.com
3. **Tu email**: info@innovasystems.com.co
4. **El problema**: La página de Bold no muestra el formulario de pago

Con esta información, Bold podrá:
- Verificar si el link está activo en su sistema
- Verificar si hay algún problema con tu cuenta
- Verificar si la URL que estás construyendo es correcta
- Darte la solución correcta

---

## ⏰ Tiempo de Respuesta Esperado

- **Respuesta de Julieth**: 24-48 horas
- **Solución**: 1-3 días

---

**Preparado por**: Kiro AI Assistant  
**Fecha**: 25 de Marzo 2026  
**Estado**: Listo para enviar a Julieth
