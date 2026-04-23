# FAQ - Integración DynamiaERP

## Preguntas Frecuentes sobre la Integración de Facturación Electrónica

---

## 🤔 Preguntas Generales

### ¿Qué es DynamiaERP?
DynamiaERP es un sistema de facturación electrónica que permite generar facturas válidas ante la DIAN (Dirección de Impuestos y Aduanas Nacionales de Colombia).

### ¿Por qué necesitamos esta integración?
Para cumplir con la normativa colombiana de facturación electrónica. Todas las empresas deben emitir facturas electrónicas válidas ante la DIAN.

### ¿Cuándo se genera la factura electrónica?
Automáticamente cuando un tenant paga su factura de Archivo en Línea. No requiere intervención manual.

### ¿Qué es el CUFE?
El CUFE (Código Único de Factura Electrónica) es un código único que identifica cada factura electrónica ante la DIAN. Es como una "huella digital" de la factura.

---

## 🔧 Preguntas Técnicas

### ¿Qué pasa si DynamiaERP está caído?
El pago se procesa normalmente. El error se registra en la base de datos y se puede reintentar manualmente más tarde.

### ¿Se pueden generar facturas duplicadas?
No. El sistema verifica que la factura no haya sido enviada antes (verifica si existe CUFE). Si ya existe, no se reenvía.

### ¿Qué datos del tenant se necesitan?
- Documento (NIT, CC, etc.)
- Tipo de documento
- Nombre/Razón Social
- Email de contacto
- Teléfono (opcional)
- Dirección (opcional)
- Ciudad (opcional)

### ¿Qué pasa si faltan datos del tenant?
DynamiaERP puede rechazar la factura. El error se registra y se puede corregir manualmente.

### ¿Cómo se mapean los tipos de documento?
```
CC  → 13 (Cédula de Ciudadanía)
CE  → 22 (Cédula de Extranjería)
NIT → 31 (NIT)
TI  → 12 (Tarjeta de Identidad)
PP  → 41 (Pasaporte)
RC  → 11 (Registro Civil)
```

---

## 💰 Preguntas sobre Facturación

### ¿Se cobra por cada factura electrónica?
Depende del contrato con DynamiaERP. Consultar con ellos.

### ¿Qué pasa con el IVA?
El sistema calcula automáticamente el IVA (19%) y lo envía a DynamiaERP. Si la factura es exenta, se envía con IVA 0%.

### ¿Se pueden anular facturas electrónicas?
Sí, pero debe hacerse directamente en DynamiaERP. El sistema de Archivo en Línea solo genera las facturas.

### ¿Qué pasa con las facturas de prueba?
Las facturas de prueba NO se envían a DynamiaERP. Solo se envían facturas reales pagadas.

---

## 🐛 Preguntas sobre Errores

### ¿Cómo sé si una factura falló?
1. Verificar logs: `pm2 logs datagree | grep -i dynamiaerp`
2. Verificar en base de datos:
   ```sql
   SELECT * FROM invoices WHERE "dynamiaerpError" IS NOT NULL;
   ```

### ¿Cómo reenvío una factura que falló?
```sql
-- Eliminar CUFE y error
UPDATE invoices 
SET "dynamiaerpCufe" = NULL,
    "dynamiaerpSentAt" = NULL,
    "dynamiaerpError" = NULL
WHERE id = '[invoice-id]';

-- Marcar como pagada nuevamente (se reenviará automáticamente)
UPDATE invoices 
SET status = 'pending'
WHERE id = '[invoice-id]';

UPDATE invoices 
SET status = 'paid',
    "paidAt" = NOW()
WHERE id = '[invoice-id]';
```

### ¿Qué significa "Token inválido"?
El token de autenticación con DynamiaERP no es válido o expiró. Contactar a DynamiaERP para renovarlo.

### ¿Qué significa "Campo X es requerido"?
Faltan datos del tenant. Completar los datos en la base de datos y reintentar.

---

## 🔍 Preguntas sobre Monitoreo

### ¿Cómo verifico que la integración está funcionando?
```sql
-- Ver facturas enviadas exitosamente
SELECT 
  "invoiceNumber",
  "dynamiaerpCufe",
  "dynamiaerpStatus",
  "dynamiaerpSentAt"
FROM invoices
WHERE "dynamiaerpCufe" IS NOT NULL
ORDER BY "dynamiaerpSentAt" DESC
LIMIT 10;
```

### ¿Cómo veo los logs en tiempo real?
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 logs datagree
```

### ¿Cómo busco logs específicos de DynamiaERP?
```bash
pm2 logs datagree | grep -i dynamiaerp
```

### ¿Cómo veo estadísticas de facturas enviadas?
```sql
-- Total de facturas enviadas
SELECT COUNT(*) as total_enviadas
FROM invoices
WHERE "dynamiaerpCufe" IS NOT NULL;

-- Total de facturas con errores
SELECT COUNT(*) as total_errores
FROM invoices
WHERE "dynamiaerpError" IS NOT NULL;

-- Tasa de éxito
SELECT 
  COUNT(CASE WHEN "dynamiaerpCufe" IS NOT NULL THEN 1 END) as exitosas,
  COUNT(CASE WHEN "dynamiaerpError" IS NOT NULL THEN 1 END) as fallidas,
  ROUND(
    COUNT(CASE WHEN "dynamiaerpCufe" IS NOT NULL THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as tasa_exito_porcentaje
FROM invoices
WHERE "dynamiaerpSentAt" IS NOT NULL;
```

---

## 🚀 Preguntas sobre Despliegue

### ¿Cómo despliego la integración?
```powershell
.\scripts\deploy-v87-dynamiaerp.ps1
```

### ¿Qué hace el script de despliegue?
1. Compila backend
2. Aplica migración SQL
3. Sube archivos al servidor
4. Agrega variables de entorno
5. Reinicia PM2
6. Verifica estado

### ¿Puedo desplegar manualmente?
Sí, consultar `doc/87-integracion-dynamiaerp/RESUMEN_INTEGRACION.md` sección "Opción 2: Manual".

### ¿Necesito reiniciar el servidor?
No, solo reiniciar PM2: `pm2 restart datagree`

---

## 🔐 Preguntas sobre Seguridad

### ¿Dónde se almacena el token de DynamiaERP?
En el archivo `.env` del servidor. NO se expone en logs ni respuestas.

### ¿Es segura la conexión con DynamiaERP?
Sí, usa HTTPS con autenticación Bearer Token.

### ¿Quién puede ver las facturas electrónicas?
Solo el tenant propietario y los administradores de Archivo en Línea.

### ¿Se almacenan datos sensibles?
Solo el CUFE y la respuesta de DynamiaERP. No se almacenan datos de pago.

---

## 📊 Preguntas sobre Datos

### ¿Qué datos se envían a DynamiaERP?
- Datos del cliente (tenant)
- Datos de la factura (número, fecha, total)
- Items de la factura (descripción, cantidad, precio)
- Totales (subtotal, IVA, total)

### ¿Se pueden modificar los datos después de enviar?
No. Una vez enviada a DynamiaERP, la factura es inmutable. Para corregir, se debe anular y crear una nueva.

### ¿Cuánto tiempo se almacenan los datos?
Indefinidamente. Las facturas electrónicas deben conservarse por ley.

### ¿Se pueden exportar las facturas?
Sí, desde DynamiaERP se pueden exportar en formato XML y PDF.

---

## 🧪 Preguntas sobre Pruebas

### ¿Cómo pruebo la integración sin enviar datos reales?
```bash
node backend/test-dynamiaerp-integration.js
```

### ¿Puedo crear facturas de prueba?
Sí, pero NO se enviarán a DynamiaERP automáticamente. Solo se envían facturas reales pagadas.

### ¿Cómo pruebo con una factura real?
1. Crear factura de prueba
2. Marcarla como pagada manualmente
3. Verificar logs y base de datos

---

## 🔄 Preguntas sobre Mantenimiento

### ¿Necesita mantenimiento regular?
No. La integración es automática y no requiere intervención manual.

### ¿Qué pasa si el token expira?
Contactar a DynamiaERP para renovarlo y actualizar en `.env`.

### ¿Cómo actualizo la configuración?
1. Editar `backend/.env`
2. Reiniciar PM2: `pm2 restart datagree`

### ¿Cómo desactivo la integración temporalmente?
Comentar las líneas de integración en `invoices.service.ts` y recompilar. NO recomendado.

---

## 📞 Preguntas sobre Soporte

### ¿A quién contacto si hay problemas?
1. Revisar logs: `pm2 logs datagree`
2. Revisar documentación: `doc/87-integracion-dynamiaerp/`
3. Contactar a DynamiaERP si es problema de su API

### ¿Dónde encuentro más documentación?
- `doc/87-integracion-dynamiaerp/INTEGRACION_DYNAMIAERP_FACTURACION.md` - Documentación completa
- `doc/87-integracion-dynamiaerp/RESUMEN_INTEGRACION.md` - Resumen ejecutivo
- `doc/87-integracion-dynamiaerp/FAQ.md` - Este archivo

### ¿Cómo reporto un bug?
1. Capturar logs: `pm2 logs datagree > logs.txt`
2. Capturar consulta SQL de la factura afectada
3. Documentar pasos para reproducir
4. Enviar a soporte técnico

---

## 🎯 Preguntas sobre Funcionalidad

### ¿Se envían todas las facturas a DynamiaERP?
Solo las facturas pagadas. Las facturas pendientes, vencidas o anuladas NO se envían.

### ¿Qué pasa con las facturas antiguas?
Las facturas pagadas antes de la integración NO se envían automáticamente. Se pueden enviar manualmente si es necesario.

### ¿Se puede personalizar la factura electrónica?
Sí, modificando el método `sendToDynamiaErp()` en `invoices.service.ts`.

### ¿Se pueden agregar más campos?
Sí, agregando columnas a la tabla `invoices` y modificando el servicio.

---

## 💡 Preguntas sobre Mejoras Futuras

### ¿Se puede agregar webhook de DynamiaERP?
Sí, para recibir notificaciones cuando la DIAN apruebe/rechace la factura.

### ¿Se puede generar PDF de la factura electrónica?
Sí, DynamiaERP proporciona el PDF. Se puede descargar y almacenar.

### ¿Se puede enviar la factura por email automáticamente?
Sí, DynamiaERP puede enviar el email automáticamente al cliente.

### ¿Se puede integrar con otros sistemas de facturación?
Sí, creando un servicio similar para cada sistema.

---

## 📋 Checklist de Verificación

Antes de reportar un problema, verificar:

- [ ] PM2 está corriendo: `pm2 status`
- [ ] Variables de entorno están configuradas: `cat backend/.env | grep DYNAMIAERP`
- [ ] Migración SQL fue aplicada: `SELECT column_name FROM information_schema.columns WHERE table_name = 'invoices' AND column_name LIKE 'dynamiaerp%';`
- [ ] Factura está en estado `paid`
- [ ] Tenant tiene datos completos (documento, email, nombre)
- [ ] No hay errores en logs: `pm2 logs datagree --err`
- [ ] Conexión con DynamiaERP funciona: `node backend/test-dynamiaerp-connection.js`

---

**Última actualización**: 18 de abril de 2026  
**Versión**: v87.0.0
