# Corrección de Conexión API en Frontend - 24 de Enero 2026

## Problema Identificado

El frontend en producción estaba intentando conectarse a `localhost:3000` en lugar de usar el dominio del servidor de producción (`archivoenlinea.com`). Esto causaba errores de conexión al intentar usar el módulo de plantillas de consentimiento.

### Síntomas
- Error: "Failed to load resource: net::ERR_CONNECTION_REFUSED" en `http://localhost:3000/api/consent-templates`
- El frontend no podía comunicarse con el backend
- Las funcionalidades del módulo de plantillas no funcionaban

## Causa Raíz

El frontend compilado que estaba desplegado en el servidor fue construido con una configuración incorrecta o estaba usando archivos cacheados antiguos. Aunque el código de detección automática de URL (`frontend/src/utils/api-url.ts`) estaba correcto, los archivos compilados no reflejaban esta lógica.

## Solución Aplicada

### 1. Verificación de Configuración
- ✅ Revisado `frontend/.env` - configuración correcta (sin `VITE_API_URL` hardcodeado)
- ✅ Revisado `frontend/.env.production` - configuración correcta
- ✅ Verificado `frontend/src/utils/api-url.ts` - lógica de detección automática correcta

### 2. Recompilación del Frontend
```bash
cd frontend
npm run build
```

La compilación generó archivos optimizados con la configuración correcta.

### 3. Despliegue en Ambas Ubicaciones

**Ubicación 1: Dominio principal (archivoenlinea.com)**
```bash
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/var/www/html/
```

**Ubicación 2: Subdominios tenant (tenant.archivoenlinea.com)**
```bash
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/
```

## Lógica de Detección de URL del API

El archivo `frontend/src/utils/api-url.ts` implementa la siguiente lógica:

1. **Variable de entorno**: Si existe `VITE_API_URL`, la usa
2. **Localhost puro**: Si el hostname es exactamente `localhost` o `127.0.0.1`, usa `http://localhost:3000`
3. **Producción**: Si el dominio NO contiene `localhost`, usa el mismo protocolo y hostname (sin puerto)
4. **Desarrollo con subdominios**: Para subdominios locales, usa `http://{hostname}:3000`

```typescript
export function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace('/api', '');
  }

  const currentHost = window.location.hostname;
  const protocol = window.location.protocol;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  
  if (!currentHost.includes('localhost') && !currentHost.includes('127.0.0.1')) {
    return `${protocol}//${currentHost}`;
  }
  
  return `http://${currentHost}:3000`;
}
```

## Archivos Modificados

Ningún archivo de código fue modificado. Solo se recompiló y redesplego el frontend.

## Verificación

Para verificar que la corrección funciona:

1. Acceder a cualquier subdominio tenant: `https://tenant.archivoenlinea.com`
2. Iniciar sesión
3. Ir al módulo de "Plantillas de Consentimiento"
4. Verificar que no aparezcan errores de conexión en la consola del navegador
5. Verificar que las funcionalidades del módulo funcionen correctamente

## Notas Importantes

- **Siempre compilar localmente**: El servidor no tiene suficiente RAM para compilar
- **Desplegar en ambas ubicaciones**: El dominio principal y los subdominios usan ubicaciones diferentes
- **Limpiar caché del navegador**: Los usuarios pueden necesitar limpiar el caché para ver los cambios

## Versión

Esta corrección se aplicó en la versión **11.1.2** del sistema.

## Próximos Pasos

1. Monitorear que no aparezcan más errores de conexión
2. Verificar que todas las funcionalidades del módulo de plantillas funcionen correctamente
3. Probar la inicialización de plantillas predeterminadas
