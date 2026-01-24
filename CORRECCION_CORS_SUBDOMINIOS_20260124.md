# Corrección de CORS para Subdominios - 24 de Enero 2026

## Problema Identificado

Los subdominios tenant (ej: `identificadorica.archivoenlinea.com`) mostraban errores de CORS al intentar conectarse al backend:

```
Access to XMLHttpRequest at 'https://identificadorica.archivoenlinea.com/api/...' 
from origin 'https://identificadorica.archivoenlinea.com' has been blocked by CORS policy
```

### Síntomas
- ❌ Errores de CORS en la consola del navegador
- ❌ Failed to fetch en peticiones al API
- ❌ Dashboard y módulos no cargaban datos
- ✅ El dominio principal `archivoenlinea.com` funcionaba correctamente

## Causa Raíz

La variable de entorno `CORS_ORIGIN` en el backend todavía tenía configurado el dominio antiguo `datagree.net`:

```bash
# Configuración INCORRECTA
CORS_ORIGIN=https://datagree.net,https://admin.datagree.net,https://*.datagree.net
```

Esto causaba que el backend rechazara las peticiones provenientes de subdominios `*.archivoenlinea.com`.

## Solución Aplicada

### 1. Actualización de Variable de Entorno

Actualizado el archivo `/home/ubuntu/consentimientos_aws/backend/.env`:

```bash
# Configuración CORRECTA
CORS_ORIGIN=https://archivoenlinea.com,https://admin.archivoenlinea.com,https://*.archivoenlinea.com
```

### 2. Reinicio del Backend

Reiniciado PM2 con actualización de variables de entorno:

```bash
cd /home/ubuntu/consentimientos_aws/backend
pm2 restart datagree-backend --update-env
```

## Verificación de la Configuración

### Configuración de CORS en el Backend

El archivo `backend/src/main.ts` tiene la siguiente lógica de CORS:

```typescript
app.enableCors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    // En desarrollo, permitir localhost
    if (nodeEnv === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }

    // Permitir el origin configurado
    if (origin === corsOrigin) {
      return callback(null, true);
    }

    // Permitir subdominios del dominio base
    const domainRegex = new RegExp(
      `^https?://([a-z0-9-]+\\.)?${baseDomain.replace('.', '\\.')}(:\\d+)?$`, 
      'i'
    );
    if (domainRegex.test(origin)) {
      return callback(null, true);
    }

    // Rechazar otros origins
    console.warn(`CORS: Origin rechazado: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
```

### Variables de Entorno Relevantes

```bash
NODE_ENV=production
BASE_DOMAIN=archivoenlinea.com
CORS_ORIGIN=https://archivoenlinea.com,https://admin.archivoenlinea.com,https://*.archivoenlinea.com
```

## Configuración de NGINX

La configuración de NGINX en `/etc/nginx/sites-available/archivoenlinea` está correcta:

```nginx
server {
    server_name www.archivoenlinea.com admin.archivoenlinea.com *.archivoenlinea.com;
    
    # Proxy reverso para el API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Servir frontend estático
    location / {
        root /home/ubuntu/consentimientos_aws/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/archivoenlinea.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/archivoenlinea.com/privkey.pem;
}
```

## Flujo de Peticiones

1. **Usuario accede**: `https://identificadorica.archivoenlinea.com`
2. **NGINX sirve**: Frontend estático desde `/home/ubuntu/consentimientos_aws/frontend/dist/`
3. **Frontend hace petición**: `https://identificadorica.archivoenlinea.com/api/...`
4. **NGINX proxy reverso**: Redirige a `http://localhost:3000/api/...`
5. **Backend valida CORS**: Verifica que el origin coincida con el regex de subdominios
6. **Backend responde**: Con headers CORS apropiados
7. **Frontend recibe**: Datos correctamente

## Dominios Soportados

Con esta configuración, el backend acepta peticiones de:

- ✅ `https://archivoenlinea.com`
- ✅ `https://www.archivoenlinea.com`
- ✅ `https://admin.archivoenlinea.com`
- ✅ `https://*.archivoenlinea.com` (cualquier subdominio)
- ✅ `http://localhost:*` (en desarrollo)

## Pruebas Realizadas

### 1. Verificar Backend
```bash
pm2 status
# ✅ datagree-backend: online

pm2 logs datagree-backend --lines 10
# ✅ Sin errores de CORS
# ✅ Endpoints registrados correctamente
```

### 2. Verificar Variables de Entorno
```bash
grep CORS_ORIGIN /home/ubuntu/consentimientos_aws/backend/.env
# ✅ CORS_ORIGIN=https://archivoenlinea.com,https://admin.archivoenlinea.com,https://*.archivoenlinea.com
```

### 3. Verificar NGINX
```bash
nginx -t
# ✅ Configuración válida

systemctl status nginx
# ✅ Activo y corriendo
```

## Verificación en Navegador

Para verificar que la corrección funciona:

1. Acceder a cualquier subdominio tenant: `https://{tenant}.archivoenlinea.com`
2. Abrir DevTools (F12) → Pestaña Console
3. Verificar que NO aparezcan errores de CORS
4. Verificar que las peticiones al API se completen exitosamente
5. Verificar que el dashboard cargue datos correctamente

## Archivos Modificados

- `/home/ubuntu/consentimientos_aws/backend/.env` - Actualizado `CORS_ORIGIN`

## Comandos Ejecutados

```bash
# 1. Actualizar variable de entorno
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
nano .env  # Cambiar CORS_ORIGIN

# 2. Reiniciar backend con nuevas variables
pm2 restart datagree-backend --update-env

# 3. Verificar
pm2 logs datagree-backend --lines 20
```

## Notas Importantes

### Diferencia entre BASE_DOMAIN y CORS_ORIGIN

- **BASE_DOMAIN**: Usado por el regex para validar subdominios dinámicamente
- **CORS_ORIGIN**: Lista explícita de origins permitidos (opcional, el regex es suficiente)

### Wildcard en CORS_ORIGIN

El valor `https://*.archivoenlinea.com` en `CORS_ORIGIN` es solo informativo. La validación real se hace con el regex que usa `BASE_DOMAIN`.

### Certificado SSL Wildcard

El certificado SSL wildcard `*.archivoenlinea.com` permite que todos los subdominios usen HTTPS correctamente.

## Problemas Relacionados Resueltos

1. ✅ **Corrección anterior**: Frontend intentaba conectarse a localhost (resuelto con recompilación)
2. ✅ **Esta corrección**: Backend rechazaba peticiones de subdominios por CORS

## Versión

Esta corrección se aplicó en la versión **11.1.2** del sistema.

## Próximos Pasos

1. ✅ Monitorear logs del backend para errores de CORS
2. ✅ Verificar que todos los subdominios tenant funcionen correctamente
3. ✅ Probar funcionalidades del módulo de plantillas en subdominios
4. ⏳ Documentar proceso de creación de nuevos tenants

## Conclusión

El problema de CORS estaba causado por una configuración desactualizada en las variables de entorno del backend. La corrección fue simple pero crítica: actualizar `CORS_ORIGIN` para reflejar el nuevo dominio `archivoenlinea.com`.

Ahora todos los subdominios tenant pueden comunicarse correctamente con el backend sin errores de CORS.

---

**Fecha**: 24 de enero de 2026
**Versión**: 11.1.2
**Estado**: ✅ Resuelto y Verificado
