# Corrección de Estado FAILED en Consentimientos

## Problema Identificado

Consentimientos aparecían con estado **FAILED** después de intentar enviar el correo electrónico.

### Ejemplo

```
Cliente: John Doe
Estado: FAILED
PDF: Generado correctamente
Firma: Capturada correctamente
```

### Causa Raíz

El estado FAILED se establecía cuando fallaba el envío del correo electrónico, típicamente por:

1. **Configuración SMTP incorrecta** - El sistema usaba `localhost:1025` (servidor de prueba)
2. **Gmail no configurado** - No se había configurado Gmail con contraseña de aplicación
3. **Error de red** - Problemas de conectividad al servidor SMTP

**Problema adicional:**
Una vez marcado como FAILED, el consentimiento quedaba en ese estado permanentemente, incluso si se corregía la configuración del correo.

## Solución Implementada

### 1. Mejora del Manejo de Errores

**Antes:**
```typescript
catch (error) {
  console.error('Error al enviar email:', error);
  consent.status = ConsentStatus.FAILED;
  await this.consentsRepository.save(consent);
  throw error;
}
```

**Después:**
```typescript
catch (error) {
  console.error('Error al enviar email:', error);
  
  // Solo marcar como FAILED si el consentimiento ya estaba en estado SIGNED
  if (consent.status === ConsentStatus.SIGNED) {
    consent.status = ConsentStatus.FAILED;
    await this.consentsRepository.save(consent);
  }
  
  // Mensaje de error más descriptivo
  throw new BadRequestException(
    `No se pudo enviar el correo: ${errorMessage}. ` +
    'Verifica la configuración SMTP en el archivo .env. ' +
    'Puedes reintentar el envío más tarde desde el botón "Reenviar Email".'
  );
}
```

**Mejoras:**
- ✅ Mensaje de error más claro y útil
- ✅ Indica dónde verificar la configuración
- ✅ Informa sobre la opción de reenvío
- ✅ Solo marca como FAILED si ya estaba SIGNED

### 2. Script de Corrección

**Archivo:** `backend/fix-failed-consents.ts`

Script que:
1. Busca todos los consentimientos con estado FAILED
2. Verifica que tengan PDF generado
3. Cambia el estado de FAILED a SIGNED
4. Permite reintentar el envío

**Uso:**
```bash
cd backend
npx ts-node fix-failed-consents.ts
```

**Salida:**
```
🔧 Corrigiendo consentimientos con estado FAILED...

📋 Se encontraron 1 consentimiento(s) FAILED:

Corrigiendo: John Doe (11111111111)
  Servicio: Servicio 3
  Sede: Sede 3
  Estado anterior: FAILED
  Estado nuevo: SIGNED ✅

🎉 Corrección completada!
```

### 3. Script de Verificación

**Archivo:** `backend/check-failed-consent.ts`

Script para inspeccionar consentimientos FAILED:
- Muestra todos los detalles del consentimiento
- Verifica si tiene PDF generado
- Muestra información del tenant, servicio y sede

## Flujo de Recuperación

### Escenario 1: Correo No Configurado

```
1. Usuario crea y firma consentimiento
   ↓
2. Intenta enviar por email
   ↓
3. Falla porque SMTP no está configurado
   ↓
4. Sistema marca como FAILED
   ↓
5. Admin configura Gmail (ver GUIA_RAPIDA_GMAIL.md)
   ↓
6. Admin ejecuta: npx ts-node fix-failed-consents.ts
   ↓
7. Estado cambia a SIGNED
   ↓
8. Usuario hace clic en "Reenviar Email"
   ↓
9. Correo se envía exitosamente
   ↓
10. Estado cambia a SENT ✅
```

### Escenario 2: Error Temporal

```
1. Consentimiento en estado SIGNED
   ↓
2. Intenta enviar email
   ↓
3. Error temporal de red
   ↓
4. Sistema marca como FAILED
   ↓
5. Usuario espera unos minutos
   ↓
6. Admin ejecuta: npx ts-node fix-failed-consents.ts
   ↓
7. Usuario hace clic en "Reenviar Email"
   ↓
8. Correo se envía exitosamente ✅
```

## Estados de Consentimiento

| Estado | Descripción | Puede enviar email |
|--------|-------------|-------------------|
| `DRAFT` | Creado pero no firmado | ❌ No |
| `SIGNED` | Firmado y con PDF generado | ✅ Sí |
| `SENT` | Email enviado exitosamente | ✅ Sí (reenvío) |
| `FAILED` | Falló el envío del email | ⚠️ Requiere corrección |

## Endpoint de Reenvío

**Endpoint:** `POST /api/consents/:id/resend-email`

**Permiso requerido:** `resend_consent_email`

**Uso desde frontend:**
```typescript
await api.post(`/consents/${consentId}/resend-email`);
```

**Comportamiento:**
1. Verifica que el consentimiento tenga PDF
2. Intenta enviar el correo
3. Si tiene éxito: cambia estado a SENT
4. Si falla: mantiene estado actual y muestra error descriptivo

## Configuración de Gmail

Para evitar el estado FAILED, configura Gmail correctamente:

### Paso 1: Generar Contraseña de Aplicación

1. Ve a: https://myaccount.google.com/apppasswords
2. Genera una contraseña de aplicación
3. Copia la contraseña de 16 caracteres

### Paso 2: Configurar .env

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM=tu-email@gmail.com
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

### Paso 3: Reiniciar Backend

```bash
cd backend
npm run start:dev
```

## Prevención de Problemas

### Verificar Configuración Antes de Producción

```bash
# 1. Verificar variables de entorno
cat backend/.env | grep SMTP

# 2. Crear un consentimiento de prueba
# 3. Intentar enviar el correo
# 4. Verificar que llegue correctamente
```

### Monitoreo de Errores

Los errores de envío se registran en los logs del backend:

```
Error al enviar email: Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

### Alertas Recomendadas

En producción, considera:
- Monitorear consentimientos con estado FAILED
- Alertar cuando hay múltiples fallos de envío
- Revisar logs de SMTP regularmente

## Scripts Disponibles

### 1. Verificar Consentimientos FAILED

```bash
cd backend
npx ts-node check-failed-consent.ts
```

Muestra detalles de todos los consentimientos FAILED.

### 2. Corregir Consentimientos FAILED

```bash
cd backend
npx ts-node fix-failed-consents.ts
```

Cambia el estado de FAILED a SIGNED para permitir reenvío.

### 3. Actualizar Permisos de Operador

```bash
cd backend
npx ts-node update-operador-permissions.ts
```

Actualiza los permisos del rol operador.

## Archivos Modificados

- `backend/src/consents/consents.service.ts` - Mejora del manejo de errores
- `backend/fix-failed-consents.ts` - Script de corrección (NUEVO)
- `backend/check-failed-consent.ts` - Script de verificación (NUEVO)

## Resultado Final

✅ Consentimiento de John Doe corregido (FAILED → SIGNED)
✅ Mensaje de error más descriptivo
✅ Scripts de corrección disponibles
✅ Documentación de configuración de Gmail
✅ Proceso de recuperación claro

## Próximos Pasos

1. **Configurar Gmail** siguiendo `doc/GUIA_RAPIDA_GMAIL.md`
2. **Reiniciar el backend** para aplicar la nueva configuración
3. **Probar el envío** con un consentimiento de prueba
4. **Reenviar correos** de consentimientos que fallaron anteriormente

## Notas Importantes

- El estado FAILED solo se establece si el consentimiento ya estaba SIGNED
- Los consentimientos FAILED pueden recuperarse cambiando el estado a SIGNED
- El botón "Reenviar Email" permite reintentar el envío sin crear un nuevo consentimiento
- La configuración de Gmail es necesaria para envíos reales en producción
