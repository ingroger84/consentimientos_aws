# Checklist de Despliegue - Landing Page SaaS

**Fecha:** 2026-01-21  
**Versión:** 1.1.28

---

## ✅ Pre-Despliegue

### Desarrollo Local

- [ ] Código funciona en desarrollo local
- [ ] Todas las pruebas pasan
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del backend
- [ ] Documentación está completa
- [ ] VERSION.md actualizado
- [ ] README.md actualizado

### Código

- [ ] Código commiteado en Git
- [ ] Branch principal actualizado
- [ ] Tags de versión creados
- [ ] No hay archivos sensibles en el repositorio
- [ ] .gitignore configurado correctamente

---

## 🌐 Configuración DNS

### Registros DNS

- [ ] Dominio datagree.net registrado
- [ ] Acceso al panel de DNS
- [ ] Registro A para @ (datagree.net)
- [ ] Registro A wildcard para * (*.datagree.net)
- [ ] Registro CNAME para www
- [ ] Registro A para api (opcional)
- [ ] TTL configurado (3600 recomendado)

### Verificación DNS

```bash
# Verificar cada registro:
nslookup datagree.net
nslookup www.datagree.net
nslookup test.datagree.net
nslookup api.datagree.net
```

- [ ] datagree.net resuelve a IP correcta
- [ ] *.datagree.net resuelve a IP correcta
- [ ] www.datagree.net resuelve correctamente
- [ ] DNS propagado (puede tardar hasta 48h)

---

## 🖥️ Servidor

### Acceso al Servidor

- [ ] Servidor AWS Lightsail configurado
- [ ] Clave SSH disponible (AWS-ISSABEL.pem)
- [ ] Acceso SSH funciona
- [ ] Usuario ubuntu tiene permisos necesarios

### Software Instalado

- [ ] Node.js v18+ instalado
- [ ] npm instalado
- [ ] PostgreSQL instalado y corriendo
- [ ] Nginx instalado
- [ ] PM2 instalado globalmente
- [ ] Certbot instalado
- [ ] Git instalado

### Verificación

```bash
node --version    # v18+
npm --version
psql --version    # 14+
nginx -v
pm2 --version
certbot --version
git --version
```

---

## 📦 Código en Servidor

### Clonar/Actualizar Repositorio

- [ ] Repositorio clonado en /home/ubuntu/consentimientos_aws
- [ ] Branch correcto (main/master)
- [ ] Última versión del código
- [ ] Permisos correctos en archivos

### Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

- [ ] Dependencias de backend instaladas
- [ ] Dependencias de frontend instaladas
- [ ] No hay errores de instalación
- [ ] node_modules creados

---

## ⚙️ Variables de Entorno

### Backend (.env)

- [ ] Archivo backend/.env existe
- [ ] BASE_DOMAIN=datagree.net
- [ ] FRONTEND_URL=https://datagree.net
- [ ] DB_HOST configurado
- [ ] DB_PORT configurado
- [ ] DB_USERNAME configurado
- [ ] DB_PASSWORD configurado
- [ ] DB_DATABASE configurado
- [ ] JWT_SECRET configurado (seguro)
- [ ] SMTP_HOST configurado
- [ ] SMTP_PORT configurado
- [ ] SMTP_USER configurado
- [ ] SMTP_PASS configurado (App Password)
- [ ] SMTP_FROM configurado
- [ ] SMTP_FROM_NAME configurado
- [ ] AWS_ACCESS_KEY_ID configurado
- [ ] AWS_SECRET_ACCESS_KEY configurado
- [ ] AWS_REGION configurado
- [ ] AWS_S3_BUCKET configurado

### Frontend (.env)

- [ ] Archivo frontend/.env existe
- [ ] VITE_API_URL=https://datagree.net/api
- [ ] VITE_BASE_DOMAIN=datagree.net

---

## 🗄️ Base de Datos

### PostgreSQL

- [ ] PostgreSQL corriendo
- [ ] Base de datos 'consentimientos' creada
- [ ] Usuario postgres configurado
- [ ] Contraseña configurada
- [ ] Conexión desde backend funciona

### Migraciones

```bash
cd backend
npm run migration:run
```

- [ ] Migraciones ejecutadas
- [ ] Tablas creadas
- [ ] Datos seed cargados (si aplica)
- [ ] Super Admin creado

### Verificación

```bash
psql -U postgres -d consentimientos -c "\dt"
```

- [ ] Tabla tenants existe
- [ ] Tabla users existe
- [ ] Tabla roles existe
- [ ] Tabla settings existe
- [ ] Otras tablas necesarias existen

---

## 🔧 Nginx

### Configuración

- [ ] Archivo /etc/nginx/sites-available/datagree.net creado
- [ ] Configuración para datagree.net
- [ ] Configuración para *.datagree.net
- [ ] Configuración para api.datagree.net (opcional)
- [ ] Proxy pass a backend configurado
- [ ] Archivos estáticos configurados
- [ ] Headers de seguridad configurados

### Habilitar Sitio

```bash
sudo ln -s /etc/nginx/sites-available/datagree.net /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

- [ ] Enlace simbólico creado
- [ ] Configuración válida (nginx -t)
- [ ] Nginx recargado sin errores
- [ ] Nginx corriendo

---

## 🔒 SSL/TLS

### Certificado Let's Encrypt

```bash
sudo certbot --nginx -d datagree.net -d www.datagree.net
```

- [ ] Certbot ejecutado
- [ ] Certificado obtenido
- [ ] Certificado instalado
- [ ] Nginx configurado para HTTPS
- [ ] Redirección HTTP → HTTPS configurada

### Certificado Wildcard (Opcional)

```bash
sudo certbot certonly --dns-route53 -d datagree.net -d *.datagree.net
```

- [ ] Plugin DNS instalado
- [ ] Certificado wildcard obtenido
- [ ] Nginx configurado para usar certificado

### Renovación Automática

```bash
sudo certbot renew --dry-run
```

- [ ] Renovación automática funciona
- [ ] Cron job configurado
- [ ] Notificaciones de expiración configuradas

### Verificación

```bash
openssl s_client -connect datagree.net:443
```

- [ ] Certificado válido
- [ ] Certificado no expirado
- [ ] Cadena de certificados completa
- [ ] HTTPS funciona en navegador

---

## 🚀 Compilación y Despliegue

### Frontend

```bash
cd frontend
npm run build
```

- [ ] Build ejecutado sin errores
- [ ] Carpeta dist/ creada
- [ ] Archivos estáticos generados
- [ ] index.html existe
- [ ] Assets optimizados

### Backend

```bash
cd backend
npm run build
```

- [ ] Build ejecutado sin errores (opcional)
- [ ] Carpeta dist/ creada (opcional)
- [ ] TypeScript compilado (opcional)

### PM2

```bash
cd backend
pm2 start ecosystem.config.js
# O
pm2 start npm --name "datagree-backend" -- run start:prod
```

- [ ] Backend iniciado con PM2
- [ ] Proceso corriendo
- [ ] No hay errores en logs
- [ ] Auto-restart configurado
- [ ] PM2 startup configurado

### Verificación

```bash
pm2 list
pm2 logs datagree-backend
```

- [ ] Proceso en estado "online"
- [ ] Sin errores en logs
- [ ] Backend responde en puerto 3000

---

## 🧪 Pruebas Post-Despliegue

### Landing Page

- [ ] https://datagree.net carga correctamente
- [ ] Todas las secciones se muestran
- [ ] Imágenes se cargan
- [ ] Estilos se aplican correctamente
- [ ] No hay errores en consola
- [ ] Responsive funciona (móvil, tablet, desktop)

### Planes

- [ ] Sección de planes se carga
- [ ] Planes se obtienen del backend
- [ ] Toggle mensual/anual funciona
- [ ] Precios se muestran correctamente
- [ ] Botones "Seleccionar Plan" funcionan

### Registro

- [ ] Modal de registro se abre
- [ ] Formulario se muestra completo
- [ ] Validaciones frontend funcionan
- [ ] Slug se genera automáticamente
- [ ] Formulario se envía correctamente

### Creación de Cuenta

```bash
# Crear cuenta de prueba desde la landing
```

- [ ] Cuenta se crea en base de datos
- [ ] Tenant se crea correctamente
- [ ] Usuario administrador se crea
- [ ] Settings se inicializan
- [ ] Mensaje de éxito se muestra

### Correo de Bienvenida

- [ ] Correo se envía automáticamente
- [ ] Correo llega a bandeja de entrada
- [ ] Contenido del correo es correcto
- [ ] Credenciales son visibles
- [ ] URL de acceso es correcta
- [ ] Diseño HTML se ve bien

### Login

```bash
# Acceder a https://[slug].datagree.net/login
```

- [ ] Subdominio funciona
- [ ] Página de login se carga
- [ ] Login con credenciales funciona
- [ ] JWT token se genera
- [ ] Redirección a dashboard funciona

### Dashboard

- [ ] Dashboard se carga correctamente
- [ ] Nombre del tenant aparece
- [ ] Menú lateral funciona
- [ ] Estadísticas se muestran
- [ ] Navegación funciona

### API

```bash
curl https://datagree.net/api/tenants/plans
```

- [ ] Endpoint público funciona
- [ ] Retorna JSON válido
- [ ] Planes se listan correctamente
- [ ] CORS configurado correctamente

---

## 🔍 Monitoreo

### Logs

```bash
# Nginx
sudo tail -f /var/log/nginx/datagree-access.log
sudo tail -f /var/log/nginx/datagree-error.log

# Backend
pm2 logs datagree-backend

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

- [ ] Logs de Nginx sin errores críticos
- [ ] Logs de backend sin errores
- [ ] Logs de PostgreSQL sin errores
- [ ] Requests se loguean correctamente

### Métricas

```bash
pm2 monit
```

- [ ] CPU usage normal (< 50%)
- [ ] Memory usage normal (< 70%)
- [ ] No hay memory leaks
- [ ] Restart count = 0

### Alertas

- [ ] Configurar alertas de uptime
- [ ] Configurar alertas de SSL expiration
- [ ] Configurar alertas de disk space
- [ ] Configurar alertas de errores

---

## 📊 Performance

### Frontend

- [ ] Landing page carga en < 2 segundos
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 90

### Backend

- [ ] API responde en < 500ms
- [ ] Queries de DB optimizadas
- [ ] Índices creados en tablas
- [ ] Conexiones de DB pooling configurado

### Optimizaciones

- [ ] Imágenes optimizadas
- [ ] Assets minificados
- [ ] Gzip habilitado en Nginx
- [ ] Cache headers configurados
- [ ] CDN configurado (opcional)

---

## 🔒 Seguridad

### SSL/TLS

- [ ] HTTPS forzado (redirect HTTP → HTTPS)
- [ ] TLS 1.2+ habilitado
- [ ] Certificado válido
- [ ] HSTS header configurado

### Headers de Seguridad

- [ ] X-Frame-Options configurado
- [ ] X-Content-Type-Options configurado
- [ ] X-XSS-Protection configurado
- [ ] Content-Security-Policy configurado (opcional)

### Backend

- [ ] JWT secret seguro (> 32 caracteres)
- [ ] Contraseñas hasheadas con bcrypt
- [ ] Rate limiting configurado
- [ ] CORS configurado correctamente
- [ ] Helmet middleware habilitado

### Base de Datos

- [ ] Contraseña de DB segura
- [ ] Acceso a DB restringido
- [ ] Backups configurados
- [ ] Soft deletes habilitados

---

## 📝 Documentación

### Actualizada

- [ ] README.md actualizado
- [ ] VERSION.md actualizado
- [ ] INDICE_COMPLETO.md actualizado
- [ ] Documentación de landing page completa

### Accesible

- [ ] Documentación en repositorio
- [ ] Documentación en servidor (opcional)
- [ ] Wiki actualizada (opcional)

---

## 🎯 Post-Despliegue

### Comunicación

- [ ] Notificar al equipo del despliegue
- [ ] Actualizar status page
- [ ] Anunciar nueva funcionalidad
- [ ] Enviar email a usuarios (si aplica)

### Monitoreo Inicial

- [ ] Monitorear logs por 24 horas
- [ ] Verificar métricas cada hora
- [ ] Estar disponible para soporte
- [ ] Documentar issues encontrados

### Backup

- [ ] Crear backup de base de datos
- [ ] Crear backup de código
- [ ] Crear backup de configuraciones
- [ ] Documentar proceso de rollback

---

## 🔄 Rollback Plan

### Si algo sale mal:

1. **Identificar el problema**
   - Revisar logs
   - Identificar causa raíz

2. **Decidir acción**
   - Fix forward (corregir)
   - Rollback (revertir)

3. **Rollback**
   ```bash
   # Revertir código
   git checkout [version-anterior]
   
   # Recompilar frontend
   cd frontend
   npm run build
   
   # Reiniciar backend
   pm2 restart datagree-backend
   
   # Revertir DB (si necesario)
   psql -U postgres consentimientos < backup.sql
   ```

4. **Verificar**
   - Sistema funciona
   - Usuarios pueden acceder
   - No hay errores

5. **Comunicar**
   - Notificar al equipo
   - Actualizar status page
   - Documentar incidente

---

## ✅ Checklist Final

Antes de dar por completado el despliegue:

- [ ] Todas las secciones de este checklist completadas
- [ ] Landing page funciona en producción
- [ ] Registro de cuenta funciona
- [ ] Correos se envían correctamente
- [ ] Login funciona
- [ ] Dashboard accesible
- [ ] SSL configurado y válido
- [ ] DNS propagado
- [ ] Logs sin errores críticos
- [ ] Performance aceptable
- [ ] Seguridad verificada
- [ ] Documentación actualizada
- [ ] Equipo notificado
- [ ] Backup creado

---

## 📞 Contactos de Emergencia

### Equipo

- **Desarrollador Principal:** [Nombre]
- **DevOps:** [Nombre]
- **Soporte:** soporte@datagree.net

### Servicios

- **AWS Support:** [Link]
- **DNS Provider:** [Link]
- **SMTP Provider:** [Link]

---

## 📅 Próximos Pasos

Después del despliegue exitoso:

1. **Semana 1:**
   - Monitorear métricas diariamente
   - Recopilar feedback de usuarios
   - Corregir bugs menores

2. **Semana 2-4:**
   - Optimizar performance
   - Agregar analytics
   - Implementar mejoras UX

3. **Mes 2:**
   - Agregar nuevas funcionalidades
   - Implementar A/B testing
   - Optimizar conversión

---

**Fecha de despliegue:** _______________  
**Responsable:** _______________  
**Estado:** ⬜ Pendiente / ⬜ En Progreso / ⬜ Completado

**Desarrollado con ❤️ por Innova Systems**
