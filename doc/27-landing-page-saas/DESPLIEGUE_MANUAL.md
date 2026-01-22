# Guía de Despliegue Manual - Landing Page SaaS

**Fecha:** 2026-01-21  
**Versión:** 1.1.27

---

## ✅ Estado Actual

- ✅ **Código subido a GitHub** (commit 3eac912)
- ⏳ **Pendiente: Despliegue en servidor**

---

## 📋 Pasos para Despliegue Manual

### 1. Conectarse al Servidor

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
```

### 2. Navegar al Proyecto

```bash
cd /home/ubuntu/consentimientos_aws
```

### 3. Hacer Backup de la Base de Datos

```bash
# Crear backup con timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
sudo -u postgres pg_dump consentimientos > backup_$TIMESTAMP.sql

# Verificar que el backup se creó
ls -lh backup_*.sql
```

### 4. Actualizar Código desde GitHub

```bash
# Pull de los últimos cambios
git pull origin main

# Verificar que se descargaron los cambios
git log -1
```

### 5. Instalar Dependencias del Backend

```bash
cd backend
npm install

# Verificar que no hay errores
echo $?
```

### 6. Crear Tabla de Notificaciones

```bash
# Conectarse a PostgreSQL
sudo -u postgres psql consentimientos

# Ejecutar el siguiente SQL:
```

```sql
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    read BOOLEAN DEFAULT FALSE,
    "userId" UUID,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications("createdAt" DESC);

-- Verificar que la tabla se creó
\dt notifications

-- Salir de psql
\q
```

### 7. Configurar Variable de Entorno

```bash
# Editar el archivo .env del backend
nano backend/.env

# Agregar o verificar esta línea:
SUPER_ADMIN_EMAIL=rcaraballo@innovasystems.com.co

# Guardar y salir (Ctrl+X, Y, Enter)
```

### 8. Reiniciar Backend con PM2

```bash
# Reiniciar el proceso
pm2 restart datagree-backend

# Verificar que está corriendo
pm2 status

# Ver logs para verificar que no hay errores
pm2 logs datagree-backend --lines 50
```

### 9. Compilar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Compilar para producción
npm run build

# Verificar que la carpeta dist se creó
ls -lh dist/
```

### 10. Verificar Estado Final

```bash
# Ver estado de PM2
pm2 status

# Ver logs del backend
pm2 logs datagree-backend --lines 20

# Verificar que el backend responde
curl http://localhost:3000/api/tenants/plans
```

---

## 🧪 Pruebas Post-Despliegue

### 1. Verificar Landing Page

```bash
# Desde tu computadora local
curl -I https://datagree.net
```

**Verificar en navegador:**
- Abrir: https://datagree.net
- Verificar que todas las secciones cargan
- Verificar que los planes se muestran
- Verificar que el modal de registro se abre

### 2. Probar Registro de Cuenta

1. Ir a https://datagree.net
2. Hacer clic en "Comenzar Gratis"
3. Seleccionar un plan (ej: Gratuito)
4. Llenar el formulario:
   - **Empresa:** Test Landing
   - **Subdominio:** testlanding
   - **Contacto:** Tu Nombre
   - **Email:** tu-email@test.com
   - **Teléfono:** 3001234567
   - **Admin Nombre:** Admin Test
   - **Admin Email:** admin@test.com
   - **Contraseña:** Test123456
5. Enviar formulario
6. Verificar mensaje de éxito

### 3. Verificar Correos

**Correo al Usuario:**
- Revisar bandeja de entrada de admin@test.com
- Verificar que llegó el correo de bienvenida
- Verificar que contiene las credenciales

**Correo al Super Admin:**
- Revisar bandeja de entrada de rcaraballo@innovasystems.com.co
- Verificar que llegó la notificación de nueva cuenta
- Verificar que contiene los datos de la empresa

### 4. Verificar Notificación en Sistema

1. Ir a https://admin.datagree.net/login
2. Iniciar sesión como Super Admin
3. Ir al dashboard
4. Verificar que aparece una notificación de nueva cuenta
5. Hacer clic en la notificación
6. Verificar que muestra los detalles correctos

### 5. Verificar Login del Nuevo Tenant

1. Ir a https://testlanding.datagree.net/login
2. Iniciar sesión con:
   - Email: admin@test.com
   - Contraseña: Test123456
3. Verificar que redirige al dashboard
4. Verificar que el nombre de la empresa aparece
5. Verificar que el plan es "Gratuito"
6. Verificar que el trial expira en 7 días

---

## 🔍 Verificación de Logs

### Backend Logs

```bash
# Ver logs en tiempo real
pm2 logs datagree-backend

# Ver últimas 100 líneas
pm2 logs datagree-backend --lines 100

# Ver solo errores
pm2 logs datagree-backend --err
```

### Nginx Logs

```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log
```

### PostgreSQL Logs

```bash
# Ver logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## 🐛 Troubleshooting

### Problema: Backend no inicia

```bash
# Ver logs detallados
pm2 logs datagree-backend --lines 200

# Verificar que el puerto 3000 está libre
sudo netstat -tulpn | grep 3000

# Reiniciar PM2
pm2 restart datagree-backend
```

### Problema: Frontend no carga

```bash
# Verificar que Nginx está corriendo
sudo systemctl status nginx

# Verificar configuración de Nginx
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### Problema: No se envían correos

```bash
# Verificar variables de entorno SMTP
cat backend/.env | grep SMTP

# Probar conexión SMTP desde el servidor
telnet smtp.gmail.com 587
```

### Problema: Base de datos no conecta

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Verificar conexión
sudo -u postgres psql -c "SELECT version();"

# Ver configuración de conexión
cat backend/.env | grep DB_
```

---

## 📊 Verificación de Métricas

### CPU y Memoria

```bash
# Ver uso de recursos
pm2 monit

# Ver uso del sistema
htop
```

### Espacio en Disco

```bash
# Ver espacio disponible
df -h

# Ver tamaño de backups
du -sh backup_*.sql
```

### Conexiones de Base de Datos

```bash
# Ver conexiones activas
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 🔄 Rollback (Si es necesario)

### 1. Revertir Código

```bash
cd /home/ubuntu/consentimientos_aws

# Ver commits recientes
git log --oneline -5

# Revertir al commit anterior
git checkout 22ebff0

# Reinstalar dependencias
cd backend && npm install
cd ../frontend && npm install && npm run build

# Reiniciar backend
pm2 restart datagree-backend
```

### 2. Restaurar Base de Datos

```bash
# Listar backups disponibles
ls -lh backup_*.sql

# Restaurar backup (reemplazar TIMESTAMP)
sudo -u postgres psql consentimientos < backup_TIMESTAMP.sql
```

---

## ✅ Checklist Final

Antes de dar por completado el despliegue:

- [ ] Código actualizado desde GitHub
- [ ] Dependencias instaladas (backend y frontend)
- [ ] Tabla de notificaciones creada
- [ ] Variable SUPER_ADMIN_EMAIL configurada
- [ ] Backend reiniciado con PM2
- [ ] Frontend compilado
- [ ] Landing page carga correctamente
- [ ] Registro de cuenta funciona
- [ ] Correo de bienvenida se envía
- [ ] Correo al Super Admin se envía
- [ ] Notificación en sistema se crea
- [ ] Login del nuevo tenant funciona
- [ ] Dashboard del nuevo tenant accesible
- [ ] Logs sin errores críticos
- [ ] Backup de base de datos creado

---

## 📞 Contacto

Si encuentras algún problema durante el despliegue:

- **Email:** rcaraballo@innovasystems.com.co
- **Documentación:** Ver este archivo y CHECKLIST_DESPLIEGUE.md

---

## 📝 Notas Adicionales

### Archivos Nuevos Desplegados

```
backend/src/notifications/
├── entities/notification.entity.ts
├── notifications.controller.ts
├── notifications.module.ts
└── notifications.service.ts

frontend/src/components/landing/
├── PricingSection.tsx
└── SignupModal.tsx

frontend/src/pages/
├── PublicLandingPage.tsx
├── LandingPage.tsx
└── RegisterPage.tsx

doc/27-landing-page-saas/
├── README.md
├── CHECKLIST_DESPLIEGUE.md
├── ARQUITECTURA.md
├── CONFIGURACION_DOMINIO.md
├── GUIA_PRUEBAS.md
├── INICIO_RAPIDO.md
└── RESUMEN_EJECUTIVO.md
```

### Cambios en Archivos Existentes

- `backend/src/app.module.ts` - Registro de NotificationsModule
- `backend/src/tenants/tenants.service.ts` - Integración de notificaciones
- `backend/src/tenants/tenants.module.ts` - Import de NotificationsModule
- `backend/src/tenants/tenants.controller.ts` - Endpoint público para crear tenant
- `backend/src/mail/mail.service.ts` - Método sendNewAccountNotification
- `frontend/src/App.tsx` - Ruta raíz apunta a PublicLandingPage
- `VERSION.md` - Actualizado a 1.1.27

---

**Desarrollado con ❤️ por Innova Systems**  
**© 2026 DatAgree - Todos los derechos reservados**
