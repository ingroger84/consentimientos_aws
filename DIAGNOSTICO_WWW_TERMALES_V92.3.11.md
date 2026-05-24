# Diagnóstico: Redirección www.termales.archivoenlinea.com - v92.3.11

**Fecha:** Mayo 10, 2026  
**Versión:** 92.3.11  
**Problema:** www.termales.archivoenlinea.com redirige al login del super admin

---

## 🔍 DIAGNÓSTICO

### Problema Identificado

Cuando el usuario accede a `www.termales.archivoenlinea.com`, el sistema lo redirige al login del super admin en lugar de mostrar el login del tenant.

### Causas Raíz

Hay **DOS problemas** combinados:

#### 1. Slug Incorrecto
- **URL usada:** www.**termales**.archivoenlinea.com
- **Slug correcto:** **termaleses** (no "termales")
- **URL correcta:** termaleses.archivoenlinea.com

#### 2. Subdominio "www" Reservado
El middleware de tenant (`backend/src/common/middleware/tenant.middleware.ts`) tiene "www" en la lista de subdominios reservados:

```typescript
private isReservedSubdomain(subdomain: string): boolean {
  const reserved = ['www', 'api', 'app', 'mail', 'ftp', 'cdn'];
  return reserved.includes(subdomain.toLowerCase());
}
```

**Comportamiento actual:**
- Cuando se accede a `www.termaleses.archivoenlinea.com`
- El middleware detecta "www" como subdominio reservado
- Ignora "www" y no detecta ningún tenant
- Redirige al super admin (comportamiento por defecto)

---

## 📊 VERIFICACIÓN EN BASE DE DATOS

```bash
✅ Conectado a la base de datos

🔍 TENANTS RELACIONADOS CON "TERMAL":

Tenant: Termales Espiritu Santo
  Slug: termaleses
  URL correcta: https://termaleses.archivoenlinea.com
  Estado: active
```

**Confirmado:** El slug correcto es `termaleses`, no `termales`.

---

## 🌐 URLs ACTUALES

### ✅ URLs que SÍ funcionan:
- `termaleses.archivoenlinea.com` (sin www) - **CORRECTO**
- `archivoenlinea.com` (landing page)
- `admin.archivoenlinea.com` (super admin)

### ❌ URLs que NO funcionan:
- `www.termaleses.archivoenlinea.com` (www es reservado)
- `www.termales.archivoenlinea.com` (www es reservado + slug incorrecto)
- `www.archivoenlinea.com` (www es reservado)

---

## 💡 OPCIONES DE SOLUCIÓN

### Opción A: Remover "www" de Subdominios Reservados ⚠️

**Ventaja:**
- Permitiría usar `www.termaleses.archivoenlinea.com`
- Más flexible para usuarios acostumbrados a usar "www"

**Desventaja:**
- Podría crear confusión: ¿cuál es la URL oficial?
- Duplicaría contenido (SEO negativo)
- Requiere cambio en el código del middleware

**Implementación:**
```typescript
// backend/src/common/middleware/tenant.middleware.ts
private isReservedSubdomain(subdomain: string): boolean {
  const reserved = ['api', 'app', 'mail', 'ftp', 'cdn']; // Removido 'www'
  return reserved.includes(subdomain.toLowerCase());
}
```

---

### Opción B: Redirección en Nginx (RECOMENDADA) ✅

**Ventaja:**
- No requiere cambios en el código
- Redirige automáticamente de www a sin www
- Mantiene una URL canónica
- Mejor para SEO

**Desventaja:**
- Requiere configuración en nginx

**Implementación:**
```nginx
# Redirigir www.*.archivoenlinea.com a *.archivoenlinea.com
server {
    listen 80;
    listen 443 ssl;
    server_name ~^www\.(?<subdomain>.+)\.archivoenlinea\.com$;
    
    # Redirigir a la versión sin www
    return 301 $scheme://$subdomain.archivoenlinea.com$request_uri;
}

# Redirigir www.archivoenlinea.com a archivoenlinea.com
server {
    listen 80;
    listen 443 ssl;
    server_name www.archivoenlinea.com;
    
    # Redirigir a la versión sin www
    return 301 $scheme://archivoenlinea.com$request_uri;
}
```

**Resultado:**
- `www.termaleses.archivoenlinea.com` → `termaleses.archivoenlinea.com`
- `www.archivoenlinea.com` → `archivoenlinea.com`
- `www.admin.archivoenlinea.com` → `admin.archivoenlinea.com`

---

### Opción C: Documentar Comportamiento Actual

**Ventaja:**
- No requiere cambios
- Mantiene arquitectura simple

**Desventaja:**
- Usuarios pueden confundirse al usar "www"
- Requiere comunicación clara

**Implementación:**
- Documentar en la página de ayuda
- Informar a los clientes sobre las URLs correctas
- Agregar mensaje de error amigable cuando se detecta "www"

---

## 🎯 RECOMENDACIÓN

**Opción B: Redirección en Nginx** es la mejor solución porque:

1. ✅ **No requiere cambios en el código** - Mantiene la arquitectura actual
2. ✅ **Mejor experiencia de usuario** - Redirige automáticamente
3. ✅ **Mejor para SEO** - URL canónica sin www
4. ✅ **Estándar de la industria** - Muchos sitios redirigen www a sin www
5. ✅ **Fácil de implementar** - Solo configuración de nginx

---

## 📝 IMPLEMENTACIÓN RECOMENDADA

### Paso 1: Crear Configuración de Nginx

Crear archivo: `/etc/nginx/sites-available/www-redirect.conf`

```nginx
# Redirigir www.*.archivoenlinea.com a *.archivoenlinea.com
server {
    listen 80;
    listen 443 ssl http2;
    server_name ~^www\.(?<subdomain>.+)\.archivoenlinea\.com$;
    
    # Certificado SSL (usar el mismo wildcard)
    ssl_certificate /etc/letsencrypt/live/archivoenlinea.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/archivoenlinea.com/privkey.pem;
    
    # Redirigir a la versión sin www
    return 301 $scheme://$subdomain.archivoenlinea.com$request_uri;
}

# Redirigir www.archivoenlinea.com a archivoenlinea.com
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.archivoenlinea.com;
    
    # Certificado SSL
    ssl_certificate /etc/letsencrypt/live/archivoenlinea.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/archivoenlinea.com/privkey.pem;
    
    # Redirigir a la versión sin www
    return 301 $scheme://archivoenlinea.com$request_uri;
}
```

### Paso 2: Habilitar Configuración

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/www-redirect.conf /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Recargar nginx
sudo nginx -s reload
```

### Paso 3: Verificar Certificado SSL

Si el certificado SSL no incluye `www.archivoenlinea.com` y `www.*.archivoenlinea.com`, necesitarás agregarlo:

```bash
# Verificar certificado actual
sudo certbot certificates

# Agregar www al certificado (si es necesario)
sudo certbot certonly --nginx -d archivoenlinea.com -d www.archivoenlinea.com -d *.archivoenlinea.com
```

### Paso 4: Probar Redirecciones

```bash
# Probar redirección de www.termaleses
curl -I http://www.termaleses.archivoenlinea.com
# Debería retornar: Location: http://termaleses.archivoenlinea.com

# Probar redirección de www.archivoenlinea.com
curl -I http://www.archivoenlinea.com
# Debería retornar: Location: http://archivoenlinea.com
```

---

## 🔧 ALTERNATIVA: Solución Rápida sin SSL

Si no tienes certificado SSL para www, puedes hacer solo redirección HTTP:

```nginx
# Solo HTTP (puerto 80)
server {
    listen 80;
    server_name ~^www\.(?<subdomain>.+)\.archivoenlinea\.com$;
    return 301 http://$subdomain.archivoenlinea.com$request_uri;
}

server {
    listen 80;
    server_name www.archivoenlinea.com;
    return 301 http://archivoenlinea.com$request_uri;
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear archivo de configuración nginx
- [ ] Verificar certificado SSL incluye www
- [ ] Habilitar configuración en sites-enabled
- [ ] Verificar sintaxis de nginx (`sudo nginx -t`)
- [ ] Recargar nginx (`sudo nginx -s reload`)
- [ ] Probar redirección: `www.termaleses.archivoenlinea.com`
- [ ] Probar redirección: `www.archivoenlinea.com`
- [ ] Verificar que HTTPS funciona correctamente
- [ ] Documentar cambio en documentación del sistema

---

## 📞 INFORMACIÓN PARA EL USUARIO

### URL Correcta del Tenant

**Termales Espiritu Santo:**
- ✅ **URL correcta:** https://termaleses.archivoenlinea.com
- ❌ **URL incorrecta:** www.termales.archivoenlinea.com

**Nota:** El slug del tenant es `termaleses`, no `termales`.

### Después de Implementar la Redirección

Una vez implementada la redirección en nginx:
- `www.termaleses.archivoenlinea.com` → redirigirá automáticamente a `termaleses.archivoenlinea.com`
- `www.archivoenlinea.com` → redirigirá automáticamente a `archivoenlinea.com`

---

## 🎯 RESUMEN EJECUTIVO

### Problema
- Usuario accede a `www.termales.archivoenlinea.com`
- Sistema redirige al login del super admin

### Causas
1. Slug incorrecto: "termales" en lugar de "termaleses"
2. Subdominio "www" está reservado en el middleware

### Solución Recomendada
- Implementar redirección en nginx de www a sin www
- Mantener el middleware sin cambios
- Informar al usuario sobre la URL correcta: `termaleses.archivoenlinea.com`

### Beneficios
- ✅ No requiere cambios en el código
- ✅ Mejor experiencia de usuario
- ✅ Mejor para SEO
- ✅ Estándar de la industria

---

## 📁 ARCHIVOS RELACIONADOS

- `backend/src/common/middleware/tenant.middleware.ts` - Middleware de detección de tenant
- `backend/check-termales-slug.js` - Script de diagnóstico
- `/etc/nginx/sites-available/www-redirect.conf` - Configuración nginx (a crear)

---

**Fecha de diagnóstico:** Mayo 10, 2026  
**Estado:** Diagnosticado - Pendiente implementación  
**Prioridad:** Media  
**Impacto:** Bajo (solo afecta a usuarios que usan www)
