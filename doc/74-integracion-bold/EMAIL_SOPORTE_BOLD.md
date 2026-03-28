# 📧 Email para Soporte Bold Colombia

**Para**: soporte@bold.co  
**Asunto**: Solicitud Urgente - Documentación API y Nuevas Credenciales  
**Prioridad**: Alta

---

## Email (Copiar y Pegar)

```
Asunto: Solicitud Urgente - Documentación API y Nuevas Credenciales - Merchant ID: 2M0MTRAD37

Estimado equipo de Bold Colombia,

Mi nombre es [TU NOMBRE] y soy [TU CARGO] en Archivo en Línea (https://archivoenlinea.com).

Estamos integrando Bold Payment Gateway en nuestra plataforma para permitir que nuestros usuarios paguen sus planes y facturas mensuales. La integración está completamente implementada en nuestro código, pero estamos experimentando problemas de autenticación con la API.

═══════════════════════════════════════════════════════════════

INFORMACIÓN DE NUESTRA CUENTA:

- Merchant ID: 2M0MTRAD37
- API Key: 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
- Plataforma: Archivo en Línea
- URL: https://archivoenlinea.com
- Servidor: AWS Lightsail (100.28.198.249)

═══════════════════════════════════════════════════════════════

PROBLEMA ACTUAL:

Estamos recibiendo errores 403 al intentar crear intenciones de pago en el endpoint:
POST https://api.online.payments.bold.co/payment-intents

ERRORES RECIBIDOS:

1. "Invalid key=value pair (missing equal-sign) in Authorization header (hashed with SHA-256 and encoded with Base64)"

2. "Authorization header requires 'Credential' parameter. Authorization header requires 'Signature' parameter"

3. "Authorization header must begin with the algorithm name, which cannot include an equal-sign"

═══════════════════════════════════════════════════════════════

FORMATOS DE AUTENTICACIÓN PROBADOS:

Hemos probado 12 formatos diferentes de autenticación, incluyendo:

✗ Authorization: x-api-key <key>
✗ Authorization: x-api-key=<key>
✗ X-API-Key: <key>
✗ Authorization: Bearer <key>
✗ Authorization: Basic <base64(key:secret)>
✗ x-api-key + X-Signature (HMAC SHA-256)
✗ x-api-key + X-Signature (HMAC Base64)
✗ x-api-key <SHA256(key)>
✗ x-api-key <SHA256-Base64(key)>
✗ x-api-key + X-Merchant-ID
✗ Query string ?api_key=<key>
✗ Authorization: <key>

Ninguno de estos formatos funcionó.

═══════════════════════════════════════════════════════════════

OBSERVACIÓN IMPORTANTE:

Los errores que mencionan "Credential parameter" y "Signature parameter" sugieren que Bold puede estar usando AWS Signature Version 4 para autenticación. ¿Es esto correcto?

═══════════════════════════════════════════════════════════════

SOLICITUDES URGENTES:

1. DOCUMENTACIÓN TÉCNICA DE LA API
   - ¿Pueden proporcionar la documentación completa de la API?
   - ¿Cuál es el formato EXACTO del header Authorization?
   - ¿Qué algoritmo de firma se debe usar?
   - ¿Hay ejemplos de código en Node.js/JavaScript?

2. VERIFICACIÓN DE CREDENCIALES
   - ¿Pueden verificar que nuestras credenciales estén activas?
   - ¿Las credenciales actuales son para producción o sandbox?
   - ¿Tienen los permisos necesarios para crear intenciones de pago?

3. NUEVAS CREDENCIALES (IMPORTANTE)
   - Las credenciales actuales fueron expuestas accidentalmente en nuestro repositorio Git
   - Necesitamos rotar las credenciales por seguridad
   - ¿Pueden generar nuevas credenciales para nuestra cuenta?

4. ENDPOINTS DISPONIBLES
   - ¿El endpoint /payment-intents es correcto?
   - ¿Qué otros endpoints están disponibles?
   - ¿Hay un endpoint de prueba o sandbox?

5. WEBHOOKS
   - ¿Cuál es la URL correcta para configurar webhooks?
   - ¿Qué eventos están disponibles?
   - ¿Cómo se validan las firmas de los webhooks?

═══════════════════════════════════════════════════════════════

CONTEXTO TÉCNICO:

Tecnologías que usamos:
- Backend: Node.js + NestJS + TypeScript
- Base de datos: PostgreSQL (Supabase)
- Servidor: AWS Lightsail
- Frontend: React + TypeScript

Nuestra integración incluye:
✓ Servicio Bold completo (BoldService)
✓ Gestión de pagos (PaymentsService)
✓ Procesamiento de webhooks (WebhooksController)
✓ Integración con facturas
✓ Base de datos configurada
✓ Emails automáticos
✓ Frontend con botones de pago

Solo nos falta el formato correcto de autenticación para que todo funcione.

═══════════════════════════════════════════════════════════════

URGENCIA:

Esta integración es crítica para nuestro negocio. Nuestros usuarios necesitan poder pagar sus planes y facturas online. La integración está 100% implementada en el código, solo necesitamos:

1. El formato correcto de autenticación
2. Nuevas credenciales (por seguridad)
3. Documentación técnica de la API

═══════════════════════════════════════════════════════════════

INFORMACIÓN DE CONTACTO:

Nombre: [TU NOMBRE]
Cargo: [TU CARGO]
Empresa: Archivo en Línea
Email: [TU EMAIL]
Teléfono: [TU TELÉFONO]
Sitio web: https://archivoenlinea.com

═══════════════════════════════════════════════════════════════

Agradecemos su pronta respuesta. Estamos disponibles para una llamada o reunión virtual si es necesario para resolver esto más rápido.

Quedamos atentos a su respuesta.

Saludos cordiales,

[TU NOMBRE]
[TU CARGO]
Archivo en Línea
https://archivoenlinea.com
[TU EMAIL]
[TU TELÉFONO]
```

---

## 📋 Checklist Antes de Enviar

- [ ] Reemplazar [TU NOMBRE] con tu nombre
- [ ] Reemplazar [TU CARGO] con tu cargo
- [ ] Reemplazar [TU EMAIL] con tu email
- [ ] Reemplazar [TU TELÉFONO] con tu teléfono
- [ ] Verificar que el Merchant ID sea correcto: 2M0MTRAD37
- [ ] Adjuntar este documento si es necesario: `RESULTADO_DIAGNOSTICO_BOLD_FORMATOS.md`
- [ ] Copiar y pegar el email en tu cliente de correo
- [ ] Enviar con prioridad alta

---

## 📞 Información de Contacto Bold

- **Email**: soporte@bold.co
- **Portal**: https://bold.co
- **Sitio web**: https://bold.co/contacto

---

## ⏰ Tiempo de Respuesta Esperado

- **Respuesta inicial**: 24-48 horas
- **Documentación**: 1-3 días
- **Nuevas credenciales**: 1-3 días
- **Solución completa**: 3-5 días

---

## 📚 Documentos de Referencia

Si Bold solicita más información, puedes compartir:

1. `RESULTADO_DIAGNOSTICO_BOLD_FORMATOS.md` - Resultados de las pruebas
2. `INTEGRACION_BOLD_COMPLETA.md` - Documentación de la integración
3. `backend/test-bold-auth-formats.js` - Script de prueba

---

## 🎯 Seguimiento

### Después de Enviar el Email:

1. **Día 1**: Esperar respuesta inicial de Bold
2. **Día 2-3**: Recibir documentación y nuevas credenciales
3. **Día 3-4**: Implementar solución con formato correcto
4. **Día 4-5**: Probar y desplegar en producción

### Si No Hay Respuesta en 48 Horas:

- [ ] Enviar email de seguimiento
- [ ] Llamar por teléfono a Bold
- [ ] Buscar contacto alternativo en el portal de Bold
- [ ] Considerar usar el chat de soporte en bold.co

---

## 💡 Consejos para la Comunicación

1. **Ser claro y específico**: Proporciona toda la información técnica
2. **Ser cortés pero firme**: Enfatiza la urgencia sin ser agresivo
3. **Proporcionar contexto**: Explica que la integración está completa
4. **Solicitar múltiples cosas**: Documentación + credenciales + ejemplos
5. **Estar disponible**: Ofrece una llamada o reunión para resolver más rápido

---

**Preparado por**: Kiro AI Assistant  
**Fecha**: 22 de Marzo 2026  
**Estado**: Listo para enviar

