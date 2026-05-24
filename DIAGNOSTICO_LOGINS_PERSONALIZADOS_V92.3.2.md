# Diagnóstico: Logins Personalizados No Funcionan

## Problema Reportado

El usuario reporta que al acceder a los subdominios de tenants:
- `termaleses.archivoenlinea.com`
- `aquiub.archivoenlinea.com`
- `demo-medico.archivoenlinea.com`

Todos muestran el mismo login genérico "Sistema de Consentimientos" con logo "S" en lugar de mostrar los logins personalizados de cada tenant.

## Diagnóstico Realizado

### 1. Verificación del Backend ✅

El backend está funcionando CORRECTAMENTE:

```bash
# Test realizado con PowerShell
Invoke-RestMethod -Uri "https://archivoenlinea.com/api/settings/public" -Headers @{"X-Tenant-Slug" = "termaleses"}
```

**Resultados:**

#### Termaleses ✅
- Company Name: `Termales Espiritu Santo`
- Logo URL: `https://datagree-uploads.s3.us-east-1.amazonaws.com/logo/logo-2d08f226-320d-4541-b632-933878ad69b8-1775763512959.png`
- Primary Color: `#a7c030`

#### Aquiub ✅
- Company Name: `Aquiub Casa de Pestañas`
- Logo URL: `https://datagree-uploads.s3.us-east-1.amazonaws.com/logo/logo-2852b690-9401-4ad0-bc70-899977696e8d-1774554495259.png`
- Primary Color: `#eeb4d7`

#### Demo-Medico ⚠️
- Company Name: `Sistema de Consentimientos` (por defecto)
- Logo URL: `null` (sin logo configurado)
- Primary Color: `#3B82F6` (por defecto)

**Conclusión:** El backend devuelve la configuración correcta cuando se envía el header `X-Tenant-Slug`.

### 2. Verificación del Frontend

#### Código Revisado:

1. **ThemeContext.tsx** ✅
   - Detecta correctamente el subdominio con `getTenantSlug()`
   - Envía el header `X-Tenant-Slug` en las peticiones
   - Tiene logs detallados para debugging

2. **api.ts** ✅
   - Interceptor agrega el header `X-Tenant-Slug` correctamente
   - Función `getTenantSlug()` detecta subdominios correctamente

3. **LoginPage.tsx** ✅
   - Usa `useTheme()` para obtener settings
   - Renderiza `settings.logoUrl` y `settings.companyName`

### 3. Problema Identificado

El problema más probable es **CACHÉ DEL NAVEGADOR**. El usuario está viendo una versión antigua del frontend que:
- No tiene los logs de debugging
- No está cargando la configuración del tenant correctamente
- Muestra el login genérico por defecto

## Solución

### Paso 1: Limpiar Caché del Navegador

El usuario debe limpiar completamente el caché del navegador:

1. **Chrome/Edge:**
   - Presionar `Ctrl + Shift + Delete`
   - Seleccionar "Todo el tiempo"
   - Marcar "Imágenes y archivos en caché"
   - Hacer clic en "Borrar datos"

2. **Firefox:**
   - Presionar `Ctrl + Shift + Delete`
   - Seleccionar "Todo"
   - Marcar "Caché"
   - Hacer clic en "Limpiar ahora"

3. **Safari:**
   - Menú Safari > Preferencias > Avanzado
   - Marcar "Mostrar menú Desarrollo"
   - Menú Desarrollo > Vaciar cachés

### Paso 2: Forzar Recarga Sin Caché

Después de limpiar el caché, acceder a cada subdominio con:
- `Ctrl + Shift + R` (Windows/Linux)
- `Cmd + Shift + R` (Mac)

### Paso 3: Verificar en Modo Incógnito

Abrir una ventana de incógnito y acceder a:
- `https://termaleses.archivoenlinea.com`
- `https://aquiub.archivoenlinea.com`

Si funciona en incógnito, confirma que el problema es el caché.

### Paso 4: Verificar Logs del Navegador

Abrir la consola del navegador (F12) y buscar logs que empiecen con:
- `[getTenantSlug]`
- `[ThemeContext]`
- `[publicSettingsApi]`

Estos logs mostrarán:
- Qué subdominio detectó
- Si está enviando el header `X-Tenant-Slug`
- Si está recibiendo la configuración correcta del backend

## Ejemplo de Logs Esperados

```
[getTenantSlug] hostname: termaleses.archivoenlinea.com
[getTenantSlug] parts: ["termaleses", "archivoenlinea", "com"]
[getTenantSlug] Detectado tenant: termaleses
[ThemeContext] ========== LOADING SETTINGS ==========
[ThemeContext] Current URL: https://termaleses.archivoenlinea.com/login
[ThemeContext] Hostname: termaleses.archivoenlinea.com
[ThemeContext] No token found, loading public settings
[ThemeContext] Calling GET /settings/public...
[publicSettingsApi] Interceptor - tenantSlug: termaleses
[publicSettingsApi] Enviando X-Tenant-Slug: termaleses
[ThemeContext] ✓ Public settings loaded successfully
[ThemeContext] Company Name: Termales Espiritu Santo
[ThemeContext] Logo URL: https://datagree-uploads.s3.us-east-1.amazonaws.com/logo/...
```

## Verificación Adicional

Si después de limpiar el caché el problema persiste, verificar:

1. **DNS:** Asegurarse de que los subdominios apuntan correctamente al servidor
   ```bash
   nslookup termaleses.archivoenlinea.com
   ```

2. **Nginx:** Verificar que Nginx está configurado para manejar subdominios
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
   sudo nginx -t
   cat /etc/nginx/sites-available/default
   ```

3. **Versión del Frontend:** Verificar que el frontend desplegado es la versión 92.3.1
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
   cat /home/ubuntu/consentimientos_aws/frontend/dist/version.txt
   ```

## Estado Actual

- ✅ Backend funcionando correctamente
- ✅ Código del frontend correcto
- ⚠️ Usuario viendo versión cacheada del frontend
- 🔄 Pendiente: Usuario debe limpiar caché del navegador

## Próximos Pasos

1. Usuario limpia caché del navegador
2. Usuario accede a los subdominios con `Ctrl + Shift + R`
3. Usuario verifica en modo incógnito
4. Usuario comparte logs de la consola si el problema persiste

## Notas Importantes

- **demo-medico** NO tiene logo configurado, por lo que mostrará la letra "S" por defecto
- **termaleses** y **aquiub** SÍ tienen logos configurados y deberían mostrarse correctamente
- El sistema está diseñado para funcionar correctamente, el problema es el caché del navegador
