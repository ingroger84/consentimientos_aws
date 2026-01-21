# ✅ Certificado Wildcard SSL Configurado

**Fecha:** 2026-01-21 05:10 UTC  
**Estado:** Completado

---

## 🎉 RESUMEN

Se ha instalado exitosamente un certificado SSL wildcard para cubrir todos los subdominios de tenants en datagree.net.

### Certificados Instalados:

1. **Certificado Wildcard (Principal)**
   - Dominios: `*.datagree.net` + `datagree.net`
   - Ubicación: `/etc/letsencrypt/live/datagree.net-0001/`
   - Válido hasta: 2026-04-21
   - Método: DNS-01 (Route 53)

2. **Certificado admin.datagree.net**
   - Dominio: `admin.datagree.net`
   - Ubicación: `/etc/letsencrypt/live/admin.datagree.net/`
   - Válido hasta: 2026-04-21
   - Método: HTTP-01

3. **Certificado datagree.net + www**
   - Dominios: `datagree.net` + `www.datagree.net`
   - Ubicación: `/etc/letsencrypt/live/datagree.net/`
   - Válido hasta: 2026-04-21
   - Método: HTTP-01

---

## 🔧 CONFIGURACIÓN APLICADA

### Nginx
El servidor Nginx ahora usa el certificado wildcard para todos los subdominios:

```nginx
server {
    server_name datagree.net *.datagree.net;
    
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/datagree.net-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/datagree.net-0001/privkey.pem;
    
    # ... resto de la configuración
}
```

### AWS Route 53 Credentials
Las credenciales de Route 53 están configuradas en `/root/.aws/credentials`:

```ini
[default]
aws_access_key_id = AKIA42IJAAWUI3LTPJKP
aws_secret_access_key = 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
region = us-east-1
```

**IMPORTANTE:** Estas credenciales son necesarias para la renovación automática del certificado wildcard.

---

## ✅ SUBDOMINIOS FUNCIONANDO

Todos los subdominios ahora funcionan con HTTPS:

- ✅ https://datagree.net
- ✅ https://www.datagree.net
- ✅ https://admin.datagree.net
- ✅ https://clinica-demo.datagree.net
- ✅ https://cualquier-tenant.datagree.net

---

## 🔄 RENOVACIÓN AUTOMÁTICA

### Certbot Timer
El certificado se renovará automáticamente 30 días antes de expirar:

```bash
# Ver estado del timer
systemctl status certbot.timer

# Ver próxima ejecución
systemctl list-timers certbot.timer
```

### Probar Renovación
Para verificar que la renovación funcionará correctamente:

```bash
# Dry run (simulación)
sudo certbot renew --dry-run

# Renovación manual (si es necesario)
sudo certbot renew
```

### Proceso de Renovación Wildcard
1. Certbot se conecta a AWS Route 53 usando las credenciales configuradas
2. Crea un registro TXT temporal para validación DNS
3. Let's Encrypt valida el dominio
4. Se emite el nuevo certificado
5. Nginx se recarga automáticamente

---

## 📋 COMANDOS ÚTILES

### Ver Certificados
```bash
sudo certbot certificates
```

### Renovar Manualmente
```bash
sudo certbot renew
```

### Verificar Configuración Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Ver Logs de Certbot
```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Verificar SSL de un Subdominio
```bash
curl -I https://cualquier-subdominio.datagree.net
```

---

## ⚠️ NOTAS IMPORTANTES

### Credenciales AWS
- Las credenciales de Route 53 deben mantenerse válidas para la renovación automática
- Si las credenciales expiran o se revocan, la renovación fallará
- Ubicación: `/root/.aws/credentials`

### Límites de Let's Encrypt
- Máximo 50 certificados por dominio registrado por semana
- Máximo 5 certificados duplicados por semana
- El certificado wildcard cubre todos los subdominios, no hay límite de subdominios

### Backup de Certificados
Los certificados se almacenan en:
```
/etc/letsencrypt/live/datagree.net-0001/
├── fullchain.pem
├── privkey.pem
├── cert.pem
└── chain.pem
```

Para hacer backup:
```bash
sudo tar -czf letsencrypt-backup-$(date +%Y%m%d).tar.gz /etc/letsencrypt/
```

---

## 🎯 RESULTADO FINAL

✅ **Certificado wildcard instalado y funcionando**  
✅ **Todos los subdominios de tenants soportados**  
✅ **Renovación automática configurada**  
✅ **HTTPS habilitado en toda la aplicación**  

**La aplicación está completamente lista para producción con SSL en todos los subdominios.**

---

## 📞 SOPORTE

Si hay problemas con la renovación del certificado:

1. Verificar que las credenciales de AWS Route 53 sean válidas
2. Revisar logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`
3. Probar renovación manual: `sudo certbot renew --dry-run`
4. Verificar conectividad con Route 53: `aws route53 list-hosted-zones`

---

**Configurado por:** Kiro AI Assistant  
**Fecha:** 2026-01-21 05:10 UTC
