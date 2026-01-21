# Verificación de Configuración Bold/Wompi - 21 Enero 2026

## ❌ PROBLEMAS ENCONTRADOS

### 1. Credenciales Incorrectas

**Configuración Actual en `.env`:**
```env
BOLD_API_KEY=g7zLcQ8RisN-5hJRFfGdUQU-2aJz5VsJkeAJN4dQUE
BOLD_SECRET_KEY=IKRokPTPuUKuTr8kvVQQ
```

**Problema**: Estas credenciales son de **Bold API Integrations** (para datáfonos físicos), NO del **Botón de Pagos** (para pagos online).

**Formato Correcto que Necesitas**:
```env
BOLD_API_KEY=pub_test_XXXXXXXXXXXXXXXX  # Debe empezar con pub_test_ o pub_prod_
BOLD_SECRET_KEY=prv_test_XXXXXXXXXXXXXXXX  # Debe empezar con prv_test_ o prv_prod_
```

### 2. URL de API Incorrecta

**Configuración Actual:**
```env
BOLD_API_URL=https://api.online.peyments.bold.co
```

**Problemas**:
- Tiene un typo: "peyments" en lugar de "payments"
- Esta URL es para Bold API Integrations, no para Wompi

**URL Correcta**:
```env
BOLD_API_URL=https://sandbox.wompi.co/v1  # Para pruebas
# BOLD_API_URL=https://production.wompi.co/v1  # Para producción
```

### 3. Webhook Secret Actualizado

**Configuración Actual:**
```env
BOLD_WEBHOOK_SECRET=KVwpsp4WlWny3apOYoGWvg
```

✅ Este valor está actualizado correctamente.


## 🔧 SOLUCIÓN REQUERIDA

### Paso 1: Obtener Credenciales Correctas

Necesitas obtener las credenciales del **Botón de Pagos** (no API Integrations):

1. Ve a: **https://panel.bold.co**
2. Inicia sesión
3. Ve a **Integraciones** > **Botón de Pagos**
4. Selecciona el ambiente de **Pruebas**
5. Copia:
   - **Public Key** (empieza con `pub_test_`)
   - **Private Key** (empieza con `prv_test_`)

### Paso 2: Actualizar Variables de Entorno

**Archivo: `backend/.env`**

Reemplaza estas líneas:
```env
# ❌ INCORRECTO (Actual)
BOLD_API_KEY=g7zLcQ8RisN-5hJRFfGdUQU-2aJz5VsJkeAJN4dQUE
BOLD_SECRET_KEY=IKRokPTPuUKuTr8kvVQQ
BOLD_MERCHANT_ID=0fhPQYC
BOLD_API_URL=https://api.online.peyments.bold.co

# ✅ CORRECTO (Nuevo)
BOLD_API_KEY=pub_test_TU_PUBLIC_KEY_AQUI
BOLD_SECRET_KEY=prv_test_TU_PRIVATE_KEY_AQUI
BOLD_MERCHANT_ID=0fhPQYC  # Este puede quedarse igual
BOLD_API_URL=https://sandbox.wompi.co/v1
```

### Paso 3: Actualizar en el Servidor

```bash
# Conectarse al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Editar .env
nano /home/ubuntu/consentimientos_aws/backend/.env

# Actualizar las variables
# Guardar: Ctrl+O, Enter, Ctrl+X

# Reiniciar backend
pm2 restart datagree-backend
```


## 🧪 PRUEBAS CON TARJETAS DE PRUEBA

**⚠️ IMPORTANTE**: Solo podrás usar las tarjetas de prueba DESPUÉS de obtener las credenciales correctas.

### Tarjetas de Prueba de Wompi (Sandbox)

#### Transacción Aprobada ✅
```
Número de Tarjeta: 4242 4242 4242 4242
Fecha de Vencimiento: Cualquier fecha futura (ej: 12/25)
CVV: Cualquier 3 dígitos (ej: 123)
Nombre: Cualquier nombre
```

#### Transacción Declinada ❌
```
Número de Tarjeta: 4111 1111 1111 1111
Fecha de Vencimiento: Cualquier fecha futura
CVV: Cualquier 3 dígitos
Nombre: Cualquier nombre
```

#### Transacción Pendiente ⏳
```
Número de Tarjeta: 4000 0000 0000 0002
Fecha de Vencimiento: Cualquier fecha futura
CVV: Cualquier 3 dígitos
Nombre: Cualquier nombre
```

### Flujo de Prueba

1. **Crear una factura** en el sistema
2. **Hacer clic en "Pagar Ahora"**
3. **Se generará un link de pago** de Wompi
4. **Hacer clic en el link** para ir al checkout
5. **Usar una tarjeta de prueba** de las listadas arriba
6. **Completar el pago**
7. **Verificar que el webhook** actualice el estado de la factura


## 📋 CHECKLIST DE VERIFICACIÓN

### Antes de Probar

- [ ] Obtener credenciales correctas desde panel.bold.co
- [ ] Verificar que las llaves empiecen con `pub_test_` y `prv_test_`
- [ ] Actualizar `backend/.env` local
- [ ] Actualizar `backend/.env` en el servidor
- [ ] Reiniciar el backend en el servidor
- [ ] Verificar que `BOLD_API_URL=https://sandbox.wompi.co/v1`

### Durante las Pruebas

- [ ] Crear una factura de prueba
- [ ] Hacer clic en "Pagar Ahora"
- [ ] Verificar que se genere un link de Wompi
- [ ] Abrir el link en el navegador
- [ ] Usar tarjeta de prueba 4242 4242 4242 4242
- [ ] Completar el pago
- [ ] Verificar que la factura se marque como pagada

### Verificación de Logs

```bash
# Ver logs del backend
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 logs datagree-backend --lines 50
```

Buscar mensajes como:
- ✅ `Creando link de pago en Wompi para: INV-XXXXX`
- ✅ `Payment link creado exitosamente`
- ✅ `Webhook recibido de Bold/Wompi`


## 🚨 ESTADO ACTUAL

### ❌ NO PUEDES HACER PRUEBAS TODAVÍA

**Razón**: Las credenciales actuales son incorrectas.

**Qué necesitas hacer**:
1. Ir a https://panel.bold.co
2. Obtener las credenciales del **Botón de Pagos** (ambiente de Pruebas)
3. Actualizar las variables de entorno
4. Reiniciar el backend

### ✅ Una vez que tengas las credenciales correctas

Podrás:
- Crear links de pago programáticamente
- Usar las tarjetas de prueba de Wompi
- Recibir webhooks de confirmación
- Probar el flujo completo de pago

## 📞 Soporte

Si tienes problemas para obtener las credenciales:
- **Panel Bold**: https://panel.bold.co
- **Soporte Bold**: soporte@bold.co
- **Documentación Wompi**: https://docs.wompi.co

---

**Fecha**: 21 de Enero de 2026  
**Estado**: Configuración incorrecta - Requiere actualización de credenciales  
**Próximo paso**: Obtener credenciales correctas desde panel.bold.co
