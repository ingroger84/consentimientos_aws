# Certificados SSL para Tenants - Completado

**Fecha:** 2026-01-22  
**Estado:** ✅ Completado

---

## ✅ Certificados SSL Instalados

### Tenants Actuales

| Tenant | Subdominio | Estado SSL | Expira |
|--------|-----------|------------|--------|
| clinica-demo | https://clinica-demo.archivoenlinea.com | ✅ Activo | 2026-04-23 |
| demo-estetica | https://demo-estetica.archivoenlinea.com | ✅ Activo | 2026-04-23 |

### Dominios Principales

| Dominio | Estado SSL | Expira |
|---------|------------|--------|
| https://archivoenlinea.com | ✅ Activo | 2026-04-22 |
| https://www.archivoenlinea.com | ✅ Activo | 2026-04-22 |
| https://admin.archivoenlinea.com | ✅ Activo | 2026-04-22 |

---

## 🔧 Agregar SSL a Nuevos Tenants

### Método 1: Script Automatizado (Recomendado)

Usa el script `add-tenant-ssl.ps1` para agregar certificados SSL automáticamente:

```powershell
.\scripts\add-tenant-ssl.ps1 -TenantSlug "nombre-del-tenant"
```

**Ejemplo:**
```powershell
.\scripts\add-tenant-ssl.ps1 -TenantSlug "clinica-nueva"
```

El script:
1. Verifica que el tenant existe en la base de datos
2. Obtiene el certificado SSL de Let's Encrypt
3. Configura Nginx automáticamente
4. Verifica que HTTPS funcione correctamente

### Método 2: Manual

Si prefieres hacerlo manualmente:

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Obtener certificado para el nuevo tenant
sudo certbot --nginx -d nombre-tenant.archivoenlinea.com \
  --non-interactive \
  --agree-tos \
  --email rcaraballo@innovasystems.com.co \
  --redirect

# Verificar que funciona
curl -I https://nombre-tenant.archivoenlinea.com
```

---

## 📋 Verificación de Certificados

### Ver todos los certificados instalados

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'sudo certbot certificates'
```

### Verificar un dominio específico

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'curl -I https://tenant.archivoenlinea.com'
```

### Verificar fecha de expiración

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'sudo certbot certificates | grep -A 5 "tenant.archivoenlinea.com"'
```

---

## 🔄 Renovación Automática

Los certificados SSL se renuevan automáticamente gracias a certbot:

- **Frecuencia:** Cada 60 días (los certificados duran 90 días)
- **Proceso:** Automático vía cron job
- **Verificación:** `sudo certbot renew --dry-run`

### Verificar renovación automática

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'sudo certbot renew --dry-run'
```

---

## ⚠️ Solución de Problemas

### Problema: "Another instance of Certbot is already running"

**Solución:**
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'sudo pkill -9 certbot'
```

### Problema: "Certificate not yet due for renewal"

**Explicación:** El certificado ya existe y está activo. No es necesario hacer nada.

### Problema: "DNS resolution failed"

**Solución:**
1. Verifica que el registro DNS A wildcard (*.archivoenlinea.com) esté configurado
2. Espera 5-10 minutos para propagación DNS
3. Verifica con: `nslookup tenant.archivoenlinea.com`

### Problema: Certificado expirado

**Solución:**
```bash
# Forzar renovación
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'sudo certbot renew --force-renewal'
```

---

## 📊 Estadísticas Actuales

### Certificados Instalados
- **Total:** 5 certificados
- **Dominios principales:** 3
- **Tenants:** 2
- **Estado:** Todos activos ✅

### Próximas Expiraciones
- **2026-04-22:** archivoenlinea.com, www, admin
- **2026-04-23:** clinica-demo, demo-estetica

### Renovación Automática
- ✅ Configurada
- ✅ Funcionando
- ✅ Notificaciones por email

---

## 🎯 Mejores Prácticas

### Al crear un nuevo tenant:

1. **Crear el tenant en la base de datos** (desde el panel de Super Admin)
2. **Esperar 2-3 minutos** para que el DNS se propague
3. **Ejecutar el script de SSL:**
   ```powershell
   .\scripts\add-tenant-ssl.ps1 -TenantSlug "nuevo-tenant"
   ```
4. **Verificar que funcione:**
   - Abrir https://nuevo-tenant.archivoenlinea.com
   - Verificar que el candado SSL esté verde
   - Probar el login

### Monitoreo:

- Revisar certificados cada mes: `sudo certbot certificates`
- Verificar logs de renovación: `sudo cat /var/log/letsencrypt/letsencrypt.log`
- Probar renovación: `sudo certbot renew --dry-run`

---

## 📝 Notas Importantes

### Límites de Let's Encrypt

- **Certificados por dominio:** 50 por semana
- **Renovaciones:** Ilimitadas
- **Subdominios:** Ilimitados con wildcard o individuales

### Alternativa: Certificado Wildcard

Si planeas tener muchos tenants (más de 20), considera obtener un certificado wildcard:

**Ventaja:** Un solo certificado cubre todos los subdominios (*.archivoenlinea.com)

**Desventaja:** Requiere validación DNS manual (agregar registro TXT)

**Proceso:**
1. Agregar registro TXT en Route 53: `_acme-challenge.archivoenlinea.com`
2. Ejecutar: `sudo certbot certonly --manual --preferred-challenges dns -d *.archivoenlinea.com`
3. Seguir instrucciones de certbot

---

## ✅ Checklist de Verificación

Después de agregar SSL a un tenant:

- [ ] Certificado instalado sin errores
- [ ] HTTPS funciona (https://tenant.archivoenlinea.com)
- [ ] HTTP redirige a HTTPS (301)
- [ ] Candado SSL verde en el navegador
- [ ] Login funciona correctamente
- [ ] No hay errores de "mixed content"

---

## 🔗 URLs de Verificación

### Herramientas Online

- **SSL Labs:** https://www.ssllabs.com/ssltest/analyze.html?d=archivoenlinea.com
- **SSL Checker:** https://www.sslshopper.com/ssl-checker.html
- **DNS Checker:** https://dnschecker.org/#A/archivoenlinea.com

### Comandos Útiles

```bash
# Ver configuración de Nginx
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'cat /etc/nginx/sites-available/archivoenlinea'

# Ver logs de Nginx
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'sudo tail -f /var/log/nginx/archivoenlinea-access.log'

# Ver logs de certbot
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'sudo tail -f /var/log/letsencrypt/letsencrypt.log'

# Recargar Nginx
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 'sudo systemctl reload nginx'
```

---

## ✨ Resumen

**Estado actual:**
- ✅ SSL configurado para todos los dominios principales
- ✅ SSL configurado para todos los tenants existentes
- ✅ Renovación automática funcionando
- ✅ Script automatizado para nuevos tenants
- ✅ Documentación completa

**Próximos pasos:**
- Agregar SSL automáticamente al crear nuevos tenants
- Monitorear expiraciones de certificados
- Considerar certificado wildcard si hay muchos tenants

---

**Configurado por:** Kiro AI  
**Fecha:** 2026-01-22  
**Estado:** ✅ Completamente Operativo
