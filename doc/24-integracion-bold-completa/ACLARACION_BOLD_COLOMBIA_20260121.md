# Aclaración: Bold Colombia vs Wompi - 21 Enero 2026

## 🎯 La Situación Real

Tienes razón en que estás usando **Bold Colombia**, pero hay un detalle técnico importante:

### Bold Colombia y Wompi

**Bold Colombia** es una empresa colombiana de pagos que:
- Ofrece datáfonos físicos
- Ofrece "Botón de Pagos" para pagos online
- **Usa Wompi como su procesador de pagos subyacente**

**Wompi** es:
- El procesador de pagos que Bold Colombia usa internamente
- Tiene una API pública documentada
- Es propiedad del mismo grupo empresarial que Bold

### ¿Por qué usamos la API de Wompi?

Bold Colombia **NO tiene API pública** para crear payment links programáticamente.

Las únicas opciones con Bold Colombia son:
1. **Crear links manualmente** desde panel.bold.co (no escalable)
2. **Usar la API de Wompi** directamente (recomendado)
3. **Usar Bold API Integrations** para datáfonos físicos (no es tu caso)

## 🔍 Análisis de tus Credenciales

### Credenciales Actuales:
```env
BOLD_API_KEY=g7zLcQ8RisN-5hJRFfGdUQU-2aJz5VsJkeAJN4dQUE
BOLD_SECRET_KEY=IKi1koNT7pUK1uTRf4vYOQ
BOLD_API_URL=https://api.online.peyments.bold.co
```

### Problema:
Estas credenciales tienen el formato de Bold API Integrations (para datáfonos), pero:
- No funcionan con la API de datáfonos (recibimos "Unauthorized")
- No funcionan con la API de Wompi (recibimos "ambiente incorrecto")
- La URL tiene un typo: "peyments" en lugar de "payments"



## 💡 Solución Recomendada

### Opción 1: Usar Wompi API (RECOMENDADO)

Aunque Bold Colombia es tu proveedor, necesitas usar la API de Wompi para crear payment links programáticamente.

**Pasos**:
1. En panel.bold.co, ve a **Integraciones** → **Botón de Pagos**
2. Copia las credenciales que empiecen con `pub_test_` y `prv_test_`
3. Usa la URL: `https://sandbox.wompi.co/v1`

**Por qué esto funciona**:
- Bold Colombia usa Wompi internamente
- Los pagos se procesan a través de Wompi
- El dinero llega a tu cuenta de Bold
- Es la forma oficial de crear payment links programáticamente

### Opción 2: Contactar a Bold Colombia

Si prefieres usar una API "Bold" directamente:

1. Contacta a soporte: soporte@bold.co
2. Pregunta por la **API del Botón de Pagos**
3. Solicita documentación oficial

**Probable respuesta**:
Te dirán que uses la API de Wompi, ya que Bold no tiene API pública para payment links.

## 🔧 Configuración Correcta

### Para Wompi API (Recomendado):

```env
# Credenciales de Wompi (obtenidas desde panel.bold.co)
BOLD_API_KEY=pub_test_XXXXXXXXXXXXXXXX
BOLD_SECRET_KEY=prv_test_XXXXXXXXXXXXXXXX
BOLD_API_URL=https://sandbox.wompi.co/v1
BOLD_WEBHOOK_SECRET=tu_webhook_secret
```

### Para Bold API Integrations (Solo si tienes datáfonos):

```env
# Credenciales de Bold API Integrations
BOLD_API_KEY=tu_api_key_larga
BOLD_API_URL=https://integrations.api.bold.co
```

**Nota**: Esta opción requiere datáfonos físicos y no sirve para pagos online.



## 📊 Comparación de Opciones

| Característica | Wompi API | Bold API Integrations | Bold Manual |
|---|---|---|---|
| **Crear links programáticamente** | ✅ Sí | ❌ No | ❌ No |
| **Pagos online** | ✅ Sí | ❌ No | ✅ Sí |
| **Requiere datáfono físico** | ❌ No | ✅ Sí | ❌ No |
| **Tarjetas de prueba** | ✅ Sí | ⚠️ Limitado | ❌ No |
| **Escalable** | ✅ Sí | ⚠️ Limitado | ❌ No |
| **Documentación pública** | ✅ Sí | ⚠️ Limitada | ❌ No |
| **Dinero llega a Bold** | ✅ Sí | ✅ Sí | ✅ Sí |

## 🎯 Recomendación Final

**Para tu caso de uso** (crear payment links para facturas):

1. ✅ **Usa Wompi API** con credenciales de panel.bold.co
2. ✅ El dinero llegará a tu cuenta de Bold Colombia
3. ✅ Podrás usar tarjetas de prueba
4. ✅ Es la forma oficial y documentada

**No uses**:
- ❌ Bold API Integrations (es para datáfonos)
- ❌ Creación manual de links (no es escalable)

## 📞 Contacto

Si tienes dudas sobre esto:
- **Bold Colombia**: soporte@bold.co
- **Wompi**: soporte@wompi.co
- **Panel Bold**: https://panel.bold.co

**Pregunta sugerida**:
> "Necesito crear payment links programáticamente para mi aplicación. 
> ¿Debo usar la API de Wompi o Bold tiene una API propia para esto?"

**Respuesta esperada**:
> "Debes usar la API de Wompi. Las credenciales las obtienes desde 
> panel.bold.co en la sección Botón de Pagos."

---

**Conclusión**: Bold Colombia y Wompi son del mismo ecosistema. 
Usar Wompi API es la forma correcta y oficial de crear payment links 
para Bold Colombia.
