# Configuración Final Bold Colombia - 21 Enero 2026

## ✅ CONFIGURACIÓN COMPLETA

### 1. Credenciales (del Panel Bold)

```env
# Llave de identidad (de la sección "Botón de Pagos" > "Pruebas")
BOLD_API_KEY=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE

# Llave secreta
BOLD_SECRET_KEY=IKi1koNT7pUK1uTRf4vYOQ

# Merchant ID
BOLD_MERCHANT_ID=2M0MTRAD37

# URL Base (según documentación oficial)
BOLD_API_URL=https://api.online.payments.bold.co

# Webhook Secret (usar la llave de identidad)
BOLD_WEBHOOK_SECRET=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE
```

### 2. Header de Autenticación

Según la documentación oficial de Bold:

```
Authorization: x-api-key <llave_de_identidad>
```

Ejemplo:
```
Authorization: x-api-key g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE
```

### 3. Endpoint para Crear Intención de Pago

```
POST https://api.online.payments.bold.co/payment-intent
```

### 4. Estructura del Payload

```json
{
  "reference_id": "INV-202601-001",
  "amount": {
    "currency": "COP",
    "total_amount": 119900
  },
  "description": "Pago de factura mensual",
  "callback_url": "https://datagree.net/payment/success",
  "customer": {
    "name": "Juan Pérez",
    "email": "juan.perez@example.com"
  }
}
```

### 5. Respuesta Esperada

```json
{
  "reference_id": "INV-202601-001",
  "amount": {
    "currency": "COP",
    "total_amount": 119900
  },
  "description": "Pago de factura mensual",
  "creation_date": "192345678900",
  "status": "ACTIVE",
  "callback_url": "https://datagree.net/payment/success",
  "test": true,
  "customer": {
    "name": "Juan Pérez",
    "email": "juan.perez@example.com"
  }
}
```



## 🧪 TARJETAS DE PRUEBA

### Tarjeta de Crédito - Transacción Aprobada ✅

```
Número: 4111111111111111
Nombre: APPROVED
Mes: 12
Año: 2035
CVV: 123
Cuotas: 1
```

### Tarjeta de Crédito - Transacción Rechazada ❌

```
Número: 4111111111111111
Nombre: REJECTED
Mes: 12
Año: 2035
CVV: 123
Cuotas: 1
```

### Montos Especiales para Pruebas 3DS

Según la documentación de Bold, puedes usar estos montos para simular diferentes escenarios:

- **Monto específico 1**: Simula flujo 3DS exitoso
- **Monto específico 2**: Simula flujo 3DS fallido
- **Monto específico 3**: Simula rechazo por motor de fraude

(Consultar documentación de Bold para montos exactos)

## 📋 PRÓXIMOS PASOS

### 1. Actualizar el Servidor

```bash
# Conectarse al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Actualizar .env
nano /home/ubuntu/consentimientos_aws/backend/.env

# Actualizar las variables con las credenciales correctas
# Guardar: Ctrl+O, Enter, Ctrl+X

# Reiniciar backend
pm2 restart datagree-backend
```

### 2. Probar Localmente

```bash
# En tu máquina local
cd backend
npm run start:dev
```

### 3. Crear una Factura de Prueba

1. Inicia sesión en el sistema
2. Ve a "Mis Facturas"
3. Crea una factura de prueba
4. Haz clic en "Pagar Ahora"
5. Deberías ver un link de pago de Bold
6. Usa las tarjetas de prueba para completar el pago

### 4. Verificar Logs

```bash
# Ver logs del backend
pm2 logs datagree-backend --lines 50
```

Buscar mensajes como:
- ✅ `Creando intención de pago en Bold para: INV-XXXXX`
- ✅ `Intención de pago creada: INV-XXXXX`
- ✅ `URL de pago: https://checkout.bold.co/payment/...`

## 🔧 TROUBLESHOOTING

### Error: "Missing Authentication Token"

**Causa**: El header de autenticación no está correcto

**Solución**: Verificar que el header sea exactamente:
```
Authorization: x-api-key <llave_de_identidad>
```

### Error: "Invalid key=value pair"

**Causa**: El formato del header tiene espacios o caracteres incorrectos

**Solución**: Asegurarse de que sea un string continuo sin saltos de línea

### Error: 401 Unauthorized

**Causa**: La llave de identidad es incorrecta o está vencida

**Solución**: Verificar en panel.bold.co que la llave sea correcta

## 📞 SOPORTE

Si tienes problemas:
- **Bold Colombia**: soporte@bold.co
- **Documentación**: https://developers.bold.co
- **Panel**: https://panel.bold.co

---

**Fecha**: 21 de Enero de 2026  
**Estado**: Configuración completa según documentación oficial  
**Listo para**: Pruebas con tarjetas de prueba
