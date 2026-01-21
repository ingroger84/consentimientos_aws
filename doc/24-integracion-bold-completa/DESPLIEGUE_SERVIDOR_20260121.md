# Despliegue en Servidor - Bold Colombia API
**Fecha**: 21 de Enero de 2026  
**Estado**: ✅ Completado

## Resumen

Se completó exitosamente la configuración de Bold Colombia API en el servidor de producción (100.28.198.249).

## Cambios Realizados

### 1. Actualización de Variables de Entorno

Se actualizaron las credenciales de Bold en `/home/ubuntu/consentimientos_aws/backend/.env`:

```env
BOLD_API_KEY=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE
BOLD_SECRET_KEY=IKi1koNT7pUK1uTRf4vYOQ
BOLD_MERCHANT_ID=2M0MTRAD37
BOLD_API_URL=https://api.online.payments.bold.co
BOLD_WEBHOOK_SECRET=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE
```

### 2. Compilación Local y Despliegue

Debido a limitaciones de memoria en el servidor (914 MB RAM), se compiló el proyecto localmente y se subió la carpeta `dist/` al servidor:

```bash
# Local
npm run build
scp -i AWS-ISSABEL.pem -r backend/dist ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/

# Servidor
pm2 start dist/main.js --name datagree-backend --node-args='--max-old-space-size=512'
pm2 save
```

### 3. Verificación de Inicialización

El backend se inicializó correctamente con las credenciales de Bold:

```
[Nest] 45272  - 01/21/2026, 4:30:07 PM     LOG [BoldService] ✅ Bold Service inicializado
[Nest] 45272  - 01/21/2026, 4:30:07 PM     LOG [BoldService]    API URL: https://api.online.payments.bold.co
[Nest] 45272  - 01/21/2026, 4:30:07 PM     LOG [BoldService]    API Key: g72LcD8iISN-PjURFfTq...
[Nest] 45272  - 01/21/2026, 4:30:07 PM     LOG [BoldService]    Merchant ID: 2M0MTRAD37
```

## Estado del Servidor

- **Servidor**: 100.28.198.249 (Ubuntu 24.04)
- **Backend**: Ejecutándose con PM2 (PID: 45272)
- **Versión**: 1.1.17
- **Memoria**: 512 MB asignados a Node.js
- **Estado**: ✅ Online

## Próximos Pasos para Pruebas

### 1. Acceder a la Aplicación

```
https://datagree.net
```

### 2. Crear una Factura de Prueba

1. Inicia sesión como administrador
2. Ve a "Mis Facturas"
3. Crea una nueva factura
4. Haz clic en "Pagar Ahora"

### 3. Verificar Link de Pago

El sistema debería:
- Crear una intención de pago en Bold
- Generar un link de pago
- Redirigir al checkout de Bold

### 4. Probar con Tarjetas de Prueba

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

### 5. Verificar Logs en Tiempo Real

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 logs datagree-backend --lines 50
```

Buscar mensajes como:
- `Creando intención de pago en Bold para: INV-XXXXX`
- `Intención de pago creada: INV-XXXXX`
- `URL de pago: https://checkout.bold.co/payment/...`

## Troubleshooting

### Si el backend no responde

```bash
pm2 restart datagree-backend
pm2 logs datagree-backend --lines 100
```

### Si hay errores de memoria

El servidor tiene poca RAM. Si el proceso se cae por falta de memoria:

```bash
pm2 stop datagree-backend
pm2 delete datagree-backend
pm2 start dist/main.js --name datagree-backend --node-args='--max-old-space-size=512'
pm2 save
```

### Si necesitas recompilar

```bash
# En tu máquina local
cd backend
npm run build
scp -i AWS-ISSABEL.pem -r dist ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/

# En el servidor
pm2 restart datagree-backend
```

## Notas Importantes

1. **Ambiente de Pruebas**: Las credenciales actuales son del ambiente de pruebas de Bold
2. **Producción**: Para producción, necesitarás obtener credenciales del ambiente de producción desde panel.bold.co
3. **Webhook**: El webhook está configurado pero necesita una URL pública (ngrok o dominio)
4. **Memoria**: El servidor tiene poca RAM (914 MB), considera actualizar el plan si hay problemas de rendimiento

## Documentación Relacionada

- [Configuración Final Bold](./CONFIGURACION_FINAL_BOLD_20260121.md)
- [Guía de Obtención de Credenciales](./GUIA_OBTENCION_CREDENCIALES_20260121.md)
- [Análisis Bold Colombia](./ANALISIS_BOLD_COLOMBIA_20260121.md)

---

**Última actualización**: 21 de Enero de 2026, 4:30 PM  
**Estado**: ✅ Listo para pruebas
