# Inicio Rápido - Landing Page SaaS

**Fecha:** 2026-01-21

## 🚀 Iniciar el Sistema

### Opción 1: Terminales Separadas (Recomendado)

**Terminal 1 - Backend:**
```powershell
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Opción 2: Script PowerShell

```powershell
.\scripts\start.ps1
```

## 🌐 URLs de Acceso

### Desarrollo Local

- **Landing Page**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api

### Después de Crear Cuenta

- **Login Tenant**: http://[tu-slug].localhost:5173/login
- **Dashboard**: http://[tu-slug].localhost:5173/dashboard

## 📝 Flujo de Prueba Rápida

### 1. Acceder a la Landing Page

```
http://localhost:5173
```

### 2. Navegar por las Secciones

- Scroll hacia abajo para ver todas las secciones
- Click en los enlaces del menú para navegación rápida
- Probar el menú móvil (reducir ventana)

### 3. Ver Planes y Precios

- Scroll hasta la sección "Planes y Precios"
- Cambiar entre facturación mensual y anual
- Observar cómo cambian los precios

### 4. Crear Cuenta de Prueba

**Datos de ejemplo:**

```
=== DATOS DE LA EMPRESA ===
Nombre de la Empresa: Clínica Test
Subdominio: clinica-test
Nombre de Contacto: Juan Pérez
Email de Contacto: contacto@clinicatest.com
Teléfono: +57 300 123 4567

=== DATOS DEL ADMINISTRADOR ===
Nombre Completo: Admin Test
Email: admin@clinicatest.com
Contraseña: test123456
Confirmar Contraseña: test123456
```

### 5. Verificar Correo de Bienvenida

1. Revisar la consola del backend para ver el log del correo
2. Si tienes SMTP configurado, revisar tu bandeja de entrada
3. El correo debe incluir:
   - Credenciales de acceso
   - URL del subdominio
   - Contraseña temporal

### 6. Iniciar Sesión

```
URL: http://clinica-test.localhost:5173/login
Email: admin@clinicatest.com
Contraseña: test123456
```

### 7. Explorar el Dashboard

- Verificar que el nombre del tenant aparece en el header
- Navegar por las diferentes secciones
- Verificar que el plan seleccionado está activo

## 🔧 Configuración Rápida

### Variables de Entorno Mínimas

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:3000
```

**Backend (`backend/.env`):**
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=consentimientos

# JWT
JWT_SECRET=tu_secret_key_super_seguro

# SMTP (opcional para desarrollo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=noreply@datagree.net
SMTP_FROM_NAME=DataGree

# Dominio base
BASE_DOMAIN=localhost
```

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to database"

**Solución:**
```powershell
# Verificar que PostgreSQL está corriendo
# Verificar credenciales en backend/.env
```

### Error: "Port 3000 already in use"

**Solución:**
```powershell
# Matar proceso en puerto 3000
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

### Error: "Port 5173 already in use"

**Solución:**
```powershell
# Matar proceso en puerto 5173
netstat -ano | findstr :5173
taskkill /PID [PID] /F
```

### Error: "Plans not loading"

**Solución:**
1. Verificar que el backend está corriendo
2. Abrir consola del navegador (F12)
3. Verificar errores de red
4. Verificar que `VITE_API_URL` está configurado

### Error: "Email not sent"

**Solución:**
1. Verificar configuración SMTP en backend/.env
2. Si usas Gmail, habilitar "App Passwords"
3. Verificar logs del backend para ver el error específico
4. La cuenta se crea igual, solo falla el envío del correo

### Error: "Slug already exists"

**Solución:**
1. Usar un slug diferente
2. O eliminar el tenant existente desde el panel de Super Admin

## 📊 Verificación de Funcionalidad

### Checklist Rápido:

- [ ] Landing page carga sin errores
- [ ] Planes se muestran correctamente
- [ ] Modal de registro se abre
- [ ] Formulario valida datos
- [ ] Cuenta se crea exitosamente
- [ ] Correo se envía (o se loguea en consola)
- [ ] Login funciona con credenciales
- [ ] Dashboard se carga correctamente

## 🎯 Próximos Pasos

Después de verificar que todo funciona:

1. **Personalizar Contenido:**
   - Editar textos en `PublicLandingPage.tsx`
   - Agregar imágenes reales
   - Actualizar testimonios

2. **Configurar Dominio:**
   - Seguir guía en `README.md`
   - Configurar DNS
   - Configurar SSL

3. **Configurar SMTP:**
   - Obtener credenciales de email
   - Actualizar backend/.env
   - Probar envío de correos

4. **Personalizar Planes:**
   - Editar `backend/src/tenants/plans.config.ts`
   - Ajustar precios y límites
   - Reiniciar backend

## 📞 Soporte

Si tienes problemas:

1. Revisar logs del backend (consola)
2. Revisar consola del navegador (F12)
3. Verificar variables de entorno
4. Consultar `GUIA_PRUEBAS.md`
5. Consultar `README.md`

## 🎉 ¡Listo!

Si llegaste hasta aquí y todo funciona, ¡felicidades! 🎊

Tu landing page SaaS está lista para recibir clientes.

---

**Tiempo estimado de configuración:** 10-15 minutos  
**Dificultad:** ⭐⭐☆☆☆ (Fácil)

**Última actualización:** 2026-01-21
