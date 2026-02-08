# 🔒 Problema: Certificados SSL para Nuevos Tenants

**Fecha:** 2026-01-22  
**Estado:** 🟡 SOLUCIÓN TEMPORAL APLICADA  
**Prioridad:** 🔴 ALTA

---

## 🎯 PROBLEMA IDENTIFICADO

Cuando se crea un nuevo tenant desde la landing page, el subdominio NO tiene certificado SSL configurado automáticamente.

### Ejemplo:
1. Usuario crea cuenta "testsanto" desde https://archivoenlinea.com
2. Sistema crea tenant con slug `testsanto`
3. URL del tenant: `testsanto.archivoenlinea.com`
4. ❌ **PROBLEMA:** Al acceder, Chrome muestra error "Your connection is not private"
5. ✅ **SOLUCIÓN TEMPORAL:** Ejecutar manualmente `certbot` para ese subdominio

---

## 🔍 ANÁLISIS TÉCNICO

### Certificados SSL Actuales:

```bash
# Certificados individuales por subdominio:
✅ archivoenlinea.com
✅ www.archivoenlinea.com
✅ admin.archivoenlinea.com
✅ clinica-demo.archivoenlinea.com
✅ demo-estetica.archivoenlinea.com
✅ testsanto.archivoenlinea.com (agregado manualmente)

# Certificado wildcard (solo para dominio antiguo):
✅ *.datagree.net (wildcard)
❌ *.archivoenlinea.com (NO EXISTE)
```

### Problema:
- Cada nuevo tenant requiere ejecutar `certbot` manualmente
- No es escalable para un SaaS
- Mala experiencia de usuario

---

## ✅ SOLUCIÓN TEMPORAL APLICADA

### Script Manual: `scripts/add-tenant-ssl.ps1`

```powershell
# Uso:
.\scripts\add-tenant-ssl.ps1 -TenantSlug "nombre-tenant"

# Ejemplo:
.\scripts\add-tenant-ssl.ps1 -TenantSlug "testsanto"
```

**Lo que hace:**
1. Verifica que el tenant existe en la base de datos
2. Ejecuta `certbot --nginx` para el subdominio
3. Configura HTTPS automáticamente
4. Verifica que funciona

**Tiempo:** ~30 segundos por tenant

---

## 🎯 SOLUCIONES PERMANENTES

### Opción 1: Certificado Wildcard (RECOMENDADO)

**Ventajas:**
- ✅ Cubre TODOS los subdominios automáticamente
- ✅ No requiere acción manual por cada tenant
- ✅ Escalable
- ✅ Mejor experiencia de usuario

**Desventajas:**
- ❌ Requiere validación DNS (más complejo)
- ❌ Necesita acceso a Route 53 API
- ❌ Configuración inicial más compleja

**Pasos para implementar:**

1. **Instalar plugin de Route 53 para Certbot:**
   ```bash
   sudo apt-get install python3-certbot-dns-route53
   ```

2. **Configurar credenciales AWS:**
   ```bash
   # Crear archivo de credenciales
   sudo mkdir -p /root/.aws
   sudo nano /root/.aws/credentials
   
   # Agregar:
   [default]
   aws_access_key_id = YOUR_ACCESS_KEY
   aws_secret_access_key = YOUR_SECRET_KEY
   ```

3. **Obtener certificado wildcard:**
   ```bash
   sudo certbot certonly \
     --dns-route53 \
     -d archivoenlinea.com \
     -d *.archivoenlinea.com \
     --non-interactive \
     --agree-tos \
     --email rcaraballo@innovasystems.com.co
   ```

4. **Configurar Nginx para usar el certificado wildcard:**
   ```nginx
   # /etc/nginx/sites-available/archivoenlinea
   server {
       listen 443 ssl http2;
       server_name *.archivoenlinea.com archivoenlinea.com;
       
       ssl_certificate /etc/letsencrypt/live/archivoenlinea.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/archivoenlinea.com/privkey.pem;
       
       # ... resto de configuración
   }
   ```

5. **Recargar Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

**Resultado:**
- ✅ Todos los subdominios tendrán HTTPS automáticamente
- ✅ No se requiere acción manual por cada tenant
- ✅ Renovación automática cada 90 días

---

### Opción 2: Webhook Automático

**Ventajas:**
- ✅ Automatizado
- ✅ No requiere certificado wildcard

**Desventajas:**
- ❌ Requiere acceso SSH desde el backend (riesgo de seguridad)
- ❌ Más complejo de mantener
- ❌ Puede fallar si el servidor está ocupado

**Implementación:**

1. **Crear endpoint en el backend:**
   ```typescript
   // backend/src/tenants/tenants.controller.ts
   @Post(':id/setup-ssl')
   async setupSSL(@Param('id') id: string) {
     const tenant = await this.tenantsService.findOne(id);
     
     // Ejecutar script SSH para configurar SSL
     const result = await this.sslService.setupCertificate(tenant.slug);
     
     return result;
   }
   ```

2. **Llamar al endpoint después de crear tenant:**
   ```typescript
   // En tenants.service.ts, método create()
   const savedTenant = await queryRunner.manager.save(tenant);
   
   // Configurar SSL automáticamente
   try {
     await this.sslService.setupCertificate(savedTenant.slug);
   } catch (error) {
     console.error('Error al configurar SSL:', error);
     // No fallar la creación del tenant
   }
   ```

**Problema:** Requiere que el backend tenga acceso SSH al servidor, lo cual es un riesgo de seguridad.

---

### Opción 3: Servicio Externo (Cloudflare, etc.)

**Ventajas:**
- ✅ Muy fácil de configurar
- ✅ SSL automático para todos los subdominios
- ✅ CDN incluido
- ✅ Protección DDoS

**Desventajas:**
- ❌ Costo adicional (puede ser gratis en plan básico)
- ❌ Dependencia de terceros

**Implementación:**

1. **Configurar Cloudflare:**
   - Agregar dominio a Cloudflare
   - Cambiar nameservers en Route 53
   - Activar "Full (strict)" SSL mode
   - Activar "Always Use HTTPS"

2. **Resultado:**
   - ✅ SSL automático para todos los subdominios
   - ✅ CDN global
   - ✅ Protección DDoS

---

## 📋 RECOMENDACIÓN

### Corto Plazo (HOY):
- ✅ Usar script manual `add-tenant-ssl.ps1` para nuevos tenants
- ✅ Documentar el proceso

### Mediano Plazo (Esta Semana):
- 🎯 **IMPLEMENTAR CERTIFICADO WILDCARD** (Opción 1)
- Esto resolverá el problema permanentemente
- Tiempo estimado: 1-2 horas

### Largo Plazo (Este Mes):
- Considerar migrar a Cloudflare para mejor rendimiento
- Implementar monitoreo de certificados
- Configurar alertas de expiración

---

## 🚀 PASOS PARA IMPLEMENTAR WILDCARD

### 1. Crear usuario IAM con permisos de Route 53

```bash
# En AWS Console:
# IAM → Users → Create user
# Nombre: archivoenlinea-certbot
# Permisos: AmazonRoute53FullAccess (o política personalizada más restrictiva)
```

### 2. Instalar plugin de Route 53

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

sudo apt-get update
sudo apt-get install -y python3-certbot-dns-route53
```

### 3. Configurar credenciales AWS

```bash
sudo mkdir -p /root/.aws
sudo nano /root/.aws/credentials

# Agregar:
[default]
aws_access_key_id = NUEVA_ACCESS_KEY_AQUI
aws_secret_access_key = NUEVA_SECRET_KEY_AQUI
region = us-east-1
```

### 4. Obtener certificado wildcard

```bash
sudo certbot certonly \
  --dns-route53 \
  -d archivoenlinea.com \
  -d *.archivoenlinea.com \
  --non-interactive \
  --agree-tos \
  --email rcaraballo@innovasystems.com.co
```

### 5. Actualizar configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/archivoenlinea

# Cambiar las líneas de certificado a:
ssl_certificate /etc/letsencrypt/live/archivoenlinea.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/archivoenlinea.com/privkey.pem;

# Guardar y recargar
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Verificar

```bash
# Probar con un nuevo subdominio
curl -I https://nuevo-tenant.archivoenlinea.com

# Debería funcionar sin configuración adicional
```

---

## ✅ SOLUCIÓN INMEDIATA PARA TESTSANTO

El tenant `testsanto` ya tiene SSL configurado:

```bash
# Verificado:
✅ Certificado instalado: testsanto.archivoenlinea.com
✅ Expira: 2026-04-23 (90 días)
✅ HTTPS funcionando correctamente
```

**URL:** https://testsanto.archivoenlinea.com

---

## 📞 CONTACTOS

**AWS Support:**
- https://console.aws.amazon.com/support/

**Let's Encrypt:**
- https://letsencrypt.org/docs/

**Certbot Route 53:**
- https://certbot-dns-route53.readthedocs.io/

---

## 📚 RECURSOS

- [Certbot DNS Route 53 Plugin](https://certbot-dns-route53.readthedocs.io/)
- [Let's Encrypt Wildcard Certificates](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)

---

**Creado por:** Kiro AI  
**Fecha:** 2026-01-22  
**Versión del Sistema:** 3.0.1  
**Estado:** 🟡 Solución temporal aplicada - Wildcard recomendado

