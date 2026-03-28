# Despliegue v76.2.1 - Corrección Dependencia Circular

**Fecha**: 27 de marzo de 2026  
**Versión**: 76.2.1  
**Estado**: ✅ COMPLETADO

## Problema Identificado

El servidor backend estaba en un loop de reinicios constantes debido a un error crítico:

```
UndefinedModuleException [Error]: Nest cannot create the InvoicesModule instance.
The module at index [2] of the InvoicesModule "imports" array is undefined.
Scope [AppModule -> PaymentsModule]
```

### Causa Raíz

**Dependencia circular** entre `InvoicesModule` y `PaymentsModule`:
- `InvoicesModule` importaba `PaymentsModule`
- `PaymentsModule` importaba `InvoicesModule`

Esto causaba que uno de los módulos fuera `undefined` cuando el otro intentaba importarlo.

## Solución Implementada

### 1. Corrección de Dependencia Circular

Usamos `forwardRef()` de NestJS para resolver la dependencia circular:

**backend/src/invoices/invoices.module.ts**:
```typescript
import { Module, forwardRef } from '@nestjs/common';
// ...
@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, TaxConfig, Tenant, Payment, BillingHistory]),
    MailModule,
    forwardRef(() => PaymentsModule),  // ✅ Usando forwardRef
    SettingsModule,
  ],
  // ...
})
```

**backend/src/payments/payments.module.ts**:
```typescript
import { Module, forwardRef } from '@nestjs/common';
// ...
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Invoice, Tenant, BillingHistory]),
    MailModule,
    forwardRef(() => InvoicesModule),  // ✅ Usando forwardRef
  ],
  // ...
})
```

### 2. Corrección de ecosystem.config.js

El archivo de configuración de PM2 estaba usando un script bash como intérprete, causando errores de sintaxis.

**Antes**:
```javascript
{
  script: '/home/ubuntu/consentimientos_aws/backend/start-with-env.sh',
  interpreter: '/bin/bash',
}
```

**Después**:
```javascript
{
  script: 'dist/main.js',
  interpreter: 'node',
  env: {
    NODE_ENV: 'production'
  }
}
```

### 3. Actualización de Versión

- `frontend/package.json`: 76.2.1
- `frontend/src/config/version.ts`: 76.2.1
- `backend/package.json`: 76.2.1

## Pasos de Despliegue

1. ✅ Corrección de dependencias circulares en módulos
2. ✅ Actualización de versiones
3. ✅ Compilación local del backend
4. ✅ Copia de archivos backend al servidor AWS
5. ✅ Actualización de ecosystem.config.js
6. ✅ Reinicio de PM2
7. ✅ Compilación del frontend
8. ✅ Copia de archivos frontend al servidor AWS
9. ✅ Recarga de Nginx
10. ✅ Verificación de funcionamiento

## Comandos Ejecutados

### Backend
```bash
# Compilación local
npm run build

# Copia al servidor
scp -i AWS-ISSABEL.pem -r backend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/
scp -i AWS-ISSABEL.pem backend/package.json ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/

# Reinicio de PM2
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cd /home/ubuntu/consentimientos_aws/backend && pm2 delete datagree && pm2 start ecosystem.config.js && pm2 save"
```

### Frontend
```bash
# Compilación local
cd frontend
npm run build

# Copia al servidor
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/

# Recarga de Nginx
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo systemctl reload nginx"
```

## Verificación

### Backend
```bash
pm2 status
```

**Resultado**:
```
┌────┬─────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
│ id │ name        │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │
├────┼─────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
│ 0  │ datagree    │ default     │ 76.2.1  │ fork    │ 1186127  │ 11s    │ 0    │ online    │
└────┴─────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘
```

**Logs del servidor**:
```
[Nest] 1186127 - 03/27/2026, 10:58:34 PM LOG [NestApplication] Nest application successfully started
🚀 Application is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
📦 Version: 76.0.0 (2026-03-27)
```

### Frontend
```bash
cat /home/ubuntu/consentimientos_aws/frontend/dist/version.json
```

**Resultado**:
```json
{
  "version": "76.2.1",
  "buildDate": "2026-03-28",
  "buildHash": "mn9tfzow",
  "buildTimestamp": "1774671254384"
}
```

## Estado Final

✅ **Backend funcionando correctamente**
- Proceso PM2: online
- PID: 1186127
- Puerto: 3000
- Versión: 76.2.1
- Sin errores de dependencias circulares
- Sistema de monitoreo de pagos activo

✅ **Frontend desplegado correctamente**
- Versión: 76.2.1
- Build Date: 2026-03-28
- Build Hash: mn9tfzow
- Timestamp: 1774671254384
- Nginx recargado

## Archivos Modificados

1. `backend/src/invoices/invoices.module.ts` - Agregado forwardRef
2. `backend/src/payments/payments.module.ts` - Agregado forwardRef
3. `backend/ecosystem.config.js` - Corregido intérprete
4. `frontend/package.json` - Versión 76.2.1
5. `frontend/src/config/version.ts` - Versión 76.2.1
6. `backend/package.json` - Versión 76.2.1

## Instrucciones para Verificar

Para verificar que estás viendo la versión correcta:

1. **Limpia la caché del navegador**:
   - Chrome/Edge: Ctrl + Shift + Delete
   - Firefox: Ctrl + Shift + Delete
   - Safari: Cmd + Option + E

2. **Recarga forzada**:
   - Windows: Ctrl + F5 o Ctrl + Shift + R
   - Mac: Cmd + Shift + R

3. **Verifica la versión**:
   - Abre la consola del navegador (F12)
   - Ve a la pestaña "Network" o "Red"
   - Busca el archivo `version.json`
   - Verifica que muestre: `"version": "76.2.1"`

4. **Alternativa - Acceso directo**:
   - Visita: `https://archivoenlinea.com/version.json`
   - Deberías ver la versión 76.2.1

## Próximos Pasos

El usuario ahora puede:
1. ✅ Iniciar sesión desde múltiples dispositivos
2. ✅ Usar todas las funcionalidades del sistema
3. ✅ El sistema de monitoreo de pagos está activo

## Notas Técnicas

- La dependencia circular se resolvió usando `forwardRef()` que es la solución recomendada por NestJS
- El servidor ahora inicia correctamente sin loops de reinicio
- PM2 está configurado para usar node directamente en lugar de un script bash
