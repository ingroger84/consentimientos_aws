# 🔐 Credenciales del Sistema

**IMPORTANTE:** Este archivo contiene información sensible y NO debe ser compartido públicamente.

---

## ⚠️ Seguridad

Las credenciales reales del sistema se encuentran en:

1. **Archivos `.env`** (NO versionados en Git):
   - `backend/.env` - Variables de entorno del backend
   - `frontend/.env` - Variables de entorno del frontend

2. **Documentación privada** (fuera del repositorio):
   - Contactar al administrador del sistema para obtener acceso

3. **Gestores de contraseñas del equipo**:
   - Las credenciales de producción están almacenadas de forma segura

---

## 📝 Placeholders en la Documentación

En la documentación pública se utilizan los siguientes placeholders:

### Credenciales de Aplicación
- `[SUPER_ADMIN_EMAIL]` - Email del Super Administrador
- `[SUPER_ADMIN_PASSWORD]` - Contraseña del Super Administrador
- `[ADMIN_DEMO_EMAIL]` - Email del Admin Demo
- `[ADMIN_DEMO_PASSWORD]` - Contraseña del Admin Demo
- `[TENANT_EMAIL]` - Email de tenant de ejemplo
- `[TENANT_PASSWORD]` - Contraseña de tenant de ejemplo
- `[TENANT_SUBDOMAIN]` - Subdominio de tenant de ejemplo

### Infraestructura
- `[AWS_SERVER_IP]` - Dirección IP del servidor AWS
- `[AWS_INTERNAL_IP]` - IP interna del servidor
- `[DB_USERNAME]` - Usuario de base de datos
- `[DB_PASSWORD]` - Contraseña de base de datos

### AWS y Servicios
- `[AWS_ACCESS_KEY_ID]` - Access Key de AWS S3
- `[AWS_SECRET_ACCESS_KEY]` - Secret Key de AWS S3
- `[AWS_ROUTE53_ACCESS_KEY]` - Access Key de Route 53
- `[AWS_ROUTE53_SECRET_KEY]` - Secret Key de Route 53
- `[SMTP_USER]` - Usuario SMTP
- `[SMTP_FROM]` - Email remitente

---

## 🔒 Buenas Prácticas

1. **Nunca** subir archivos `.env` al repositorio
2. **Nunca** compartir credenciales por email o chat sin cifrar
3. **Siempre** usar gestores de contraseñas para almacenar credenciales
4. **Rotar** las contraseñas periódicamente
5. **Usar** autenticación de dos factores cuando sea posible
6. **Limitar** el acceso a credenciales solo al personal autorizado

---

## 📞 Contacto

Para obtener acceso a las credenciales reales:
- Contactar al administrador del sistema
- Email: [ADMIN_CONTACT_EMAIL]

---

**Última actualización:** 2026-01-21
