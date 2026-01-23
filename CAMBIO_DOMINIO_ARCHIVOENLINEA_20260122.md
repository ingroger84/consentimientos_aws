# Cambio de Dominio y Rebranding - Versión 2.2.1

**Fecha:** 2026-01-22  
**Versión:** 2.2.1  
**Tipo:** PATCH  
**Estado:** ✅ Completado

---

## 🎯 Cambios Implementados

### 1. Cambio de Dominio

**Antes:** `datagree.net`  
**Ahora:** `archivoenlinea.com`

### 2. Rebranding

**Antes:** DatAgree / DataGree  
**Ahora:** Archivo en Línea

---

## 📝 Archivos Modificados

### Frontend (7 archivos)
- ✅ `frontend/src/App.tsx` - Lógica de detección de dominio
- ✅ `frontend/src/utils/api-url.ts` - URLs de API
- ✅ `frontend/src/pages/PublicLandingPage.tsx` - Landing page pública
- ✅ `frontend/src/pages/LandingPage.tsx` - Landing page interna
- ✅ `frontend/src/pages/SuspendedAccountPage.tsx` - Página de cuenta suspendida
- ✅ `frontend/src/components/landing/SignupModal.tsx` - Modal de registro
- ✅ `frontend/src/components/landing/PricingSection.tsx` - Sección de precios

### Backend (1 archivo)
- ✅ `backend/src/mail/mail.service.ts` - Servicio de correos

### Scripts (2 archivos)
- ✅ `scripts/deploy-auto.ps1` - Script de despliegue automático
- ✅ `scripts/utils/cambio-dominio.ps1` - Script de cambio de dominio (nuevo)

### Documentación (1 archivo)
- ✅ `README.md` - Documentación principal

---

## 🔄 Cambios Específicos

### Dominios Actualizados

| Antes | Ahora |
|-------|-------|
| `datagree.net` | `archivoenlinea.com` |
| `admin.datagree.net` | `admin.archivoenlinea.com` |
| `[tenant].datagree.net` | `[tenant].archivoenlinea.com` |
| `www.datagree.net` | `www.archivoenlinea.com` |

### Emails Actualizados

| Antes | Ahora |
|-------|-------|
| `soporte@datagree.net` | `soporte@archivoenlinea.com` |
| `ventas@datagree.net` | `ventas@archivoenlinea.com` |
| `admin@datagree.net` | `admin@archivoenlinea.com` |
| `noreply@datagree.net` | `noreply@archivoenlinea.com` |

### Marca Actualizada

| Antes | Ahora |
|-------|-------|
| DatAgree | Archivo en Línea |
| DataGree | Archivo en Línea |
| datagree-backend | archivoenlinea-backend |
| datagree-uploads | archivoenlinea-uploads |

---

## 📦 Build Completado

```bash
✓ Frontend compilado exitosamente
✓ Versión 2.2.1 aplicada automáticamente
✓ Commit y push a GitHub completados
```

---

## 🚀 Próximos Pasos para Despliegue

### 1. Configuración DNS

Configurar los siguientes registros DNS para `archivoenlinea.com`:

```
Tipo  Nombre  Valor
A     @       [IP_SERVIDOR]
A     *       [IP_SERVIDOR]  (wildcard para subdominios)
CNAME www     archivoenlinea.com
```

### 2. Configuración Nginx

Actualizar la configuración de Nginx en el servidor:

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@[IP_SERVIDOR]

# Editar configuración de Nginx
sudo nano /etc/nginx/sites-available/archivoenlinea.com

# Actualizar server_name de:
# server_name datagree.net www.datagree.net;
# server_name *.datagree.net;

# A:
# server_name archivoenlinea.com www.archivoenlinea.com;
# server_name *.archivoenlinea.com;

# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/archivoenlinea.com /etc/nginx/sites-enabled/

# Eliminar configuración antigua (opcional)
sudo rm /etc/nginx/sites-enabled/datagree.net

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### 3. Certificado SSL

Obtener certificado SSL para el nuevo dominio:

```bash
# Instalar certbot si no está instalado
sudo apt install certbot python3-certbot-nginx

# Obtener certificado wildcard
sudo certbot --nginx -d archivoenlinea.com -d *.archivoenlinea.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

### 4. Variables de Entorno

Actualizar variables de entorno en el servidor:

**Frontend (.env):**
```env
VITE_BASE_DOMAIN=archivoenlinea.com
```

**Backend (.env):**
```env
BASE_DOMAIN=archivoenlinea.com
SMTP_FROM=noreply@archivoenlinea.com
SMTP_FROM_NAME=Archivo en Línea
```

### 5. Renombrar Proceso PM2

```bash
# Detener proceso actual
pm2 stop datagree-backend

# Eliminar proceso
pm2 delete datagree-backend

# Iniciar con nuevo nombre
cd /home/ubuntu/archivoenlinea_aws/backend
pm2 start dist/main.js --name archivoenlinea-backend

# Guardar configuración
pm2 save

# Configurar inicio automático
pm2 startup
```

### 6. Actualizar Bucket S3 (Opcional)

Si deseas cambiar el nombre del bucket S3:

```bash
# Crear nuevo bucket
aws s3 mb s3://archivoenlinea-uploads --region us-east-1

# Copiar archivos del bucket anterior
aws s3 sync s3://datagree-uploads s3://archivoenlinea-uploads

# Actualizar variable de entorno
AWS_S3_BUCKET=archivoenlinea-uploads
```

### 7. Desplegar Código

```bash
# Desde tu máquina local
.\scripts\deploy-auto.ps1 -SkipBackup -SkipTests
```

---

## ✅ Verificación Post-Despliegue

### URLs a Verificar

- [ ] Landing Page: https://archivoenlinea.com
- [ ] Admin Panel: https://admin.archivoenlinea.com
- [ ] API: https://archivoenlinea.com/api/tenants/plans
- [ ] Tenant de prueba: https://[slug].archivoenlinea.com

### Funcionalidades a Probar

- [ ] Registro de nueva cuenta desde landing
- [ ] Recepción de correo de bienvenida
- [ ] Login en admin panel
- [ ] Login en tenant
- [ ] Creación de consentimiento
- [ ] Envío de correo con PDF

---

## 📊 Resumen de Cambios

### Estadísticas
- **Archivos modificados:** 11
- **Líneas cambiadas:** ~150
- **Dominios actualizados:** 4
- **Emails actualizados:** 4
- **Referencias de marca:** ~30

### Impacto
- ✅ **Frontend:** Completamente actualizado
- ✅ **Backend:** Completamente actualizado
- ✅ **Scripts:** Completamente actualizados
- ✅ **Documentación:** Actualizada
- ⏳ **Servidor:** Pendiente de configuración
- ⏳ **DNS:** Pendiente de configuración
- ⏳ **SSL:** Pendiente de configuración

---

## 🔧 Comandos Útiles

### Ver Logs del Backend
```bash
ssh -i AWS-ISSABEL.pem ubuntu@[IP_SERVIDOR] 'pm2 logs archivoenlinea-backend'
```

### Reiniciar Backend
```bash
ssh -i AWS-ISSABEL.pem ubuntu@[IP_SERVIDOR] 'pm2 restart archivoenlinea-backend'
```

### Ver Estado de Nginx
```bash
ssh -i AWS-ISSABEL.pem ubuntu@[IP_SERVIDOR] 'sudo systemctl status nginx'
```

### Ver Logs de Nginx
```bash
ssh -i AWS-ISSABEL.pem ubuntu@[IP_SERVIDOR] 'sudo tail -f /var/log/nginx/access.log'
```

---

## 📝 Notas Importantes

### Compatibilidad con Dominio Anterior

Si deseas mantener compatibilidad con el dominio anterior temporalmente:

1. Mantener ambas configuraciones de Nginx
2. Agregar redirecciones 301 de datagree.net a archivoenlinea.com
3. Mantener ambos certificados SSL activos

### Migración de Datos

No se requiere migración de datos ya que:
- La base de datos permanece igual
- Los archivos en S3 permanecen igual
- Solo cambian las URLs de acceso

### Comunicación a Usuarios

Notificar a los usuarios existentes sobre:
- Nuevo dominio: archivoenlinea.com
- Nuevas URLs de acceso: [slug].archivoenlinea.com
- Nuevos emails de contacto
- Actualizar marcadores/favoritos

---

## ✨ Conclusión

El cambio de dominio y rebranding ha sido implementado exitosamente en el código. Los cambios están listos para ser desplegados una vez que:

1. ✅ El dominio archivoenlinea.com esté registrado
2. ✅ Los registros DNS estén configurados
3. ✅ El certificado SSL esté instalado
4. ✅ La configuración de Nginx esté actualizada

**El código está listo. Solo falta la configuración del servidor.**

---

**Implementado por:** Kiro AI  
**Fecha:** 2026-01-22  
**Versión:** 2.2.1  
**Estado:** ✅ Código Actualizado - Pendiente Configuración Servidor
