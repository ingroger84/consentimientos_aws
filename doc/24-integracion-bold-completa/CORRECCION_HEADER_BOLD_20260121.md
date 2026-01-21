# Corrección Header de Autenticación Bold Colombia - 21 Enero 2026

## 🎯 PROBLEMA IDENTIFICADO

Bold Colombia rechazaba las peticiones con el error:

```
Invalid key=value pair (missing equal-sign) in Authorization header
```

## 🔍 CAUSA RAÍZ

El código estaba enviando el header de autenticación de forma incorrecta:

```typescript
// ❌ INCORRECTO (lo que teníamos antes)
headers: {
  'Authorization': `x-api-key ${this.apiKey}`
}
```

Bold Colombia espera el header como un campo separado, NO dentro de Authorization:

```typescript
// ✅ CORRECTO (lo que implementamos)
headers: {
  'x-api-key': this.apiKey
}
```

## 🛠️ SOLUCIÓN IMPLEMENTADA

### 1. Modificación del Código

**Archivo:** `backend/src/payments/bold.service.ts`

**Línea 64 - Antes:**
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `x-api-key ${this.apiKey}`,
},
```

**Línea 64 - Después:**
```typescript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': this.apiKey, // Bold usa el header x-api-key directamente
},
```

### 2. Despliegue en Producción

```bash
# 1. Compilar backend localmente
cd backend
npm run build

# 2. Subir archivos compilados al servidor
scp -i AWS-ISSABEL.pem -r dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/

# 3. Reiniciar backend en servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 restart datagree-backend
```

### 3. Verificación

El backend se reinició correctamente con las credenciales correctas:

```
[BoldService] ✅ Bold Service inicializado
[BoldService]    API URL: https://api.online.payments.bold.co
[BoldService]    API Key: g72LcD8iISN-PjURFfTq...
[BoldService]    Merchant ID: 2M0MTRAD37
```

## 📋 CREDENCIALES CONFIGURADAS

```env
BOLD_API_KEY=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE
BOLD_SECRET_KEY=IKi1koNT7pUK1uTRf4vYOQ
BOLD_MERCHANT_ID=2M0MTRAD37
BOLD_API_URL=https://api.online.payments.bold.co
BOLD_WEBHOOK_SECRET=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE
```

## 🧪 PRÓXIMOS PASOS PARA PRUEBAS

### 1. Crear una Factura de Prueba

1. Inicia sesión en el sistema: https://datagree.net
2. Ve a "Mis Facturas"
3. Crea una factura de prueba
4. Haz clic en "Pagar Ahora"

### 2. Verificar el Link de Pago

Deberías ver un link de pago de Bold con formato:
```
https://checkout.bold.co/payment/INV-XXXXX
```

### 3. Probar con Tarjetas de Prueba

**Transacción Aprobada:**
```
Número: 4111111111111111
Nombre: APPROVED
Mes: 12
Año: 2035
CVV: 123
```

**Transacción Rechazada:**
```
Número: 4111111111111111
Nombre: REJECTED
Mes: 12
Año: 2035
CVV: 123
```

### 4. Verificar Logs

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 logs datagree-backend --lines 50
```

Buscar mensajes como:
- ✅ `Creando intención de pago en Bold para: INV-XXXXX`
- ✅ `Intención de pago creada: INV-XXXXX`
- ✅ `URL de pago: https://checkout.bold.co/payment/...`

## 📊 ESTADO ACTUAL

- ✅ Código corregido en repositorio
- ✅ Backend compilado y desplegado en producción
- ✅ Servicio Bold inicializado correctamente
- ✅ Credenciales configuradas
- ⏳ Pendiente: Pruebas con tarjetas de prueba

## 🔗 DOCUMENTACIÓN RELACIONADA

- [Configuración Final Bold](./CONFIGURACION_FINAL_BOLD_20260121.md)
- [Guía de Obtención de Credenciales](./GUIA_OBTENCION_CREDENCIALES_20260121.md)
- [Análisis Bold Colombia](./ANALISIS_BOLD_COLOMBIA_20260121.md)

---

**Versión:** 1.1.21  
**Fecha:** 21 de Enero de 2026  
**Estado:** Desplegado en producción  
**Listo para:** Pruebas con tarjetas de prueba
