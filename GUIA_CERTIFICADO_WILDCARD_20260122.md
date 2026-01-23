# 🔒 Guía: Configurar Certificado Wildcard SSL

**Fecha:** 2026-01-22  
**Objetivo:** Configurar certificado wildcard para `*.archivoenlinea.com`  
**Resultado:** Todos los subdominios tendrán HTTPS automáticamente

---

## 🎯 RESUMEN

Esta guía te ayudará a configurar un certificado SSL wildcard que cubrirá automáticamente TODOS los subdominios de `archivoenlinea.com`. Una vez configurado, cada nuevo tenant tendrá HTTPS automáticamente sin necesidad de configuración adicional.

**Tiempo estimado:** 15-20 minutos

---

## 📋 PASO 1: CREAR USUARIO IAM CON PERMISOS DE ROUTE 53

### 1.1 Ir a AWS IAM Console

```
https://console.aws.amazon.com/iam/
```

### 1.2 Crear nuevo usuario

1. Click en **"Users"** en el menú lateral
2. Click en **"Create user"**
3. Nombre del usuario: `archivoenlinea-certbot-route53`
4. Click en **"Next"**

### 1.3 Configurar permisos

**Opción A: Usar política administrada (más simple)**

1. Seleccionar **"Attach policies directly"**
2. Buscar y seleccionar: **`AmazonRoute53FullAccess`**
3. Click en **"Next"**
4. Click en **"Create user"**

**Opción B: Crear política personalizada (más segura - solo permisos necesarios)**

1. Seleccionar **"Attach policies directly"**
2. Click en **"Create policy"**
3. Seleccionar pestaña **"JSON"**
4. Pegar el siguiente JSON:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "route53:ListHostedZones",
                "route53:GetChange"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "route53:ChangeResourceRecordSets"
            ],
            "Resource": "arn:aws:route53:::hostedzone/*"
        }
    ]
}
```

5. Click en **"Next"**
6. Nombre de la política: `CertbotRoute53Access`
7. Click en **"Create policy"**
8. Volver a la creación del usuario y seleccionar la política recién creada
9. Click en **"Next"** y luego **"Create user"**

### 1.4 Crear credenciales de acceso

1. Click en el usuario recién creado: `archivoenlinea-certbot-route53`
2. Ir a la pestaña **"Security credentials"**
3. Scroll down hasta **"Access keys"**
4. Click en **"Create access key"**
5. Seleccionar: **"Application running outside AWS"**
6. Click en **"Next"**
7. (Opcional) Agregar descripción: "Certbot para certificados wildcard"
8. Click en **"Create access key"**

### 1.5 GUARDAR CREDENCIALES

**⚠️ IMPORTANTE:** Estas credenciales solo se mostrarán UNA VEZ.

```
Access Key ID: AKIA...
Secret Access Key: ...
```

**Guárdalas en un lugar seguro** (NO en GitHub). Las necesitarás en el siguiente paso.

---

## 📋 PASO 2: EJECUTAR SCRIPT DE CONFIGURACIÓN

### 2.1 Abrir PowerShell en tu máquina local

```powershell
cd E:\PROJECTS\CONSENTIMIENTOS_2025_1.3_FUNCIONAL_LOCAL
```

### 2.2 Ejecutar script

```powershell
.\scripts\setup-wildcard-simple.ps1
```

### 2.3 Ingresar credenciales cuando se soliciten

El script te pedirá:
- **Access Key ID:** (pegar el Access Key ID del paso 1.5)
- **Secret Access Key:** (pegar el Secret Access Key del paso 1.5)

### 2.4 Esperar a que termine

El script hará lo siguiente automáticamente:
1. Instalar Certbot con plugin de Route 53
2. Configurar credenciales AWS en el servidor
3. Obtener certificado wildcard para `*.archivoenlinea.com`
4. Actualizar configuración de Nginx
5. Recargar Nginx

**Tiempo:** 2-3 minutos

---

## ✅ PASO 3: VERIFICAR QUE FUNCIONA

### 3.1 Probar con subdominios existentes

```powershell
# Probar admin
curl -I https://admin.archivoenlinea.com

# Probar testsanto
curl -I https://testsanto.archivoenlinea.com

# Deberías ver: HTTP/2 200
```

### 3.2 Crear un nuevo tenant de prueba

1. Ir a: https://archivoenlinea.com
2. Click en **"Comenzar Gratis"**
3. Crear una cuenta de prueba (ejemplo: `prueba-ssl`)
4. Al terminar, click en **"Ir a Iniciar Sesión"**
5. **Verificar que NO aparece el error de certificado SSL**
6. Deberías ver el candado verde en la barra de direcciones

### 3.3 Verificar certificado

En el navegador:
1. Click en el candado verde
2. Click en **"Connection is secure"**
3. Click en **"Certificate is valid"**
4. Verificar que dice: **"*.archivoenlinea.com"**

---

## 🎉 RESULTADO ESPERADO

### Antes (sin wildcard):
```
❌ Crear tenant "nuevo" → https://nuevo.archivoenlinea.com
❌ Error: "Your connection is not private"
❌ Requiere ejecutar: certbot --nginx -d nuevo.archivoenlinea.com
```

### Después (con wildcard):
```
✅ Crear tenant "nuevo" → https://nuevo.archivoenlinea.com
✅ HTTPS funciona automáticamente
✅ No requiere configuración adicional
```

---

## 📊 INFORMACIÓN DEL CERTIFICADO

### Detalles:
- **Dominio:** `*.archivoenlinea.com` y `archivoenlinea.com`
- **Emisor:** Let's Encrypt
- **Validez:** 90 días
- **Renovación:** Automática (certbot renueva cada 60 días)
- **Ubicación:** `/etc/letsencrypt/live/archivoenlinea.com/`

### Subdominios cubiertos:
- ✅ `admin.archivoenlinea.com`
- ✅ `testsanto.archivoenlinea.com`
- ✅ `clinica-demo.archivoenlinea.com`
- ✅ `cualquier-nuevo-tenant.archivoenlinea.com`
- ✅ **TODOS los subdominios presentes y futuros**

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema 1: Error al obtener certificado

**Error:** `Failed to create the challenge`

**Solución:**
1. Verificar que las credenciales AWS son correctas
2. Verificar que el usuario IAM tiene permisos de Route 53
3. Verificar que la zona hosteada de `archivoenlinea.com` existe en Route 53

### Problema 2: Nginx no recarga

**Error:** `nginx: configuration file /etc/nginx/nginx.conf test failed`

**Solución:**
```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ver el error específico
sudo nginx -t

# Restaurar backup si es necesario
sudo cp /etc/nginx/sites-available/archivoenlinea.backup.YYYYMMDD_HHMMSS /etc/nginx/sites-available/archivoenlinea
sudo systemctl reload nginx
```

### Problema 3: Certificado no se aplica a subdominios

**Verificar configuración de Nginx:**
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
sudo cat /etc/nginx/sites-available/archivoenlinea | grep ssl_certificate
```

**Debería mostrar:**
```
ssl_certificate /etc/letsencrypt/live/archivoenlinea.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/archivoenlinea.com/privkey.pem;
```

---

## 📞 SOPORTE

### Si algo no funciona:

1. **Revisar logs del servidor:**
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
   sudo tail -f /var/log/letsencrypt/letsencrypt.log
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Verificar certificado:**
   ```bash
   sudo certbot certificates
   ```

3. **Contactar soporte:**
   - Email: rcaraballo@innovasystems.com.co

---

## 🔄 RENOVACIÓN AUTOMÁTICA

El certificado se renovará automáticamente cada 60 días (antes de que expire a los 90 días).

### Verificar renovación automática:
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
sudo systemctl status certbot.timer
```

### Probar renovación manualmente:
```bash
sudo certbot renew --dry-run
```

---

## 📚 RECURSOS ADICIONALES

- [Certbot DNS Route 53 Plugin](https://certbot-dns-route53.readthedocs.io/)
- [Let's Encrypt Wildcard Certificates](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge)
- [AWS Route 53 Documentation](https://docs.aws.amazon.com/route53/)

---

## ✅ CHECKLIST

- [ ] Crear usuario IAM con permisos de Route 53
- [ ] Crear credenciales de acceso (Access Key)
- [ ] Ejecutar script `setup-wildcard-simple.ps1`
- [ ] Ingresar credenciales cuando se soliciten
- [ ] Esperar a que termine (2-3 minutos)
- [ ] Verificar con subdominios existentes
- [ ] Crear tenant de prueba
- [ ] Verificar que HTTPS funciona automáticamente
- [ ] Celebrar 🎉

---

**Creado por:** Kiro AI  
**Fecha:** 2026-01-22  
**Versión del Sistema:** 4.0.0  
**Estado:** Listo para implementar

