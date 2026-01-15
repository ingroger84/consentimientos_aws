# 🚀 Inicio Rápido - Sistema de Consentimientos

## Ejecutar el Proyecto

### Método 1: Terminales de Kiro (Recomendado)

La forma más sencilla es usar las terminales integradas de Kiro:

**1. Abrir Terminal para Backend:**
- En Kiro, abre una nueva terminal
- Ejecuta:
```bash
cd backend
npm run start:dev
```

**2. Abrir Terminal para Frontend:**
- En Kiro, abre otra terminal
- Ejecuta:
```bash
cd frontend
npm run dev
```

**3. Acceder al Sistema:**
- El backend estará en: `http://localhost:3000`
- El frontend estará en: `http://localhost:5173`
- Abre: `http://admin.localhost:5173`

### Método 2: Script de Ayuda

Si prefieres ver las instrucciones y URLs:

```powershell
.\start.ps1
```

Este script muestra:
- ✅ Instrucciones paso a paso
- ✅ URLs de acceso
- ✅ Credenciales
- ✅ Opción para abrir el navegador

---

## Detener el Proyecto

### Método 1: Desde las Terminales

En cada terminal de Kiro donde esté corriendo el proyecto:
- Presiona `Ctrl + C`

### Método 2: Script de Detención

```powershell
.\stop.ps1
```

Este script:
- 🔴 Detiene el backend (puerto 3000)
- 🔴 Detiene el frontend (puerto 5173)
- 🔴 Libera los puertos

---

## 🔐 Credenciales de Acceso

### Super Admin (Administrador del Sistema)

**URL:** http://admin.localhost:5173

```
Email:    superadmin@sistema.com
Password: superadmin123
```

**Funciones:**
- Crear y gestionar tenants
- Ver estadísticas globales
- Configuración independiente del sistema

### Tenant: Cliente Demo

**URL:** http://cliente-demo.localhost:5173

```
Email:    clientedemo@demo.com
Password: (la que configuraste al crear el tenant)
```

**Funciones:**
- Gestionar usuarios del tenant
- Crear sedes y servicios
- Generar consentimientos
- Configuración personalizada del tenant

---

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- ✅ **Node.js** (v18 o superior)
- ✅ **PostgreSQL** (v14 o superior)
- ✅ **npm** o **yarn**

### Verificar Instalación

```powershell
node --version    # Debe mostrar v18.x.x o superior
npm --version     # Debe mostrar 9.x.x o superior
psql --version    # Debe mostrar PostgreSQL 14.x o superior
```

---

## ⚙️ Configuración Inicial

### 1. Base de Datos

Asegúrate de que PostgreSQL esté corriendo y crea la base de datos:

```sql
CREATE DATABASE consentimientos;
```

### 2. Variables de Entorno

El proyecto ya incluye archivos `.env` configurados:

**Backend:** `backend/.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin123
DB_DATABASE=consentimientos
```

**Frontend:** `frontend/.env`
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Migraciones

Las migraciones se ejecutan automáticamente al iniciar el backend.

Si necesitas ejecutarlas manualmente:

```powershell
cd backend
npm run migration:run
```

---

## 🧪 Verificar que Todo Funciona

### 1. Backend

Abre: http://localhost:3000/api

Deberías ver un mensaje de bienvenida o la documentación de la API.

### 2. Frontend - Super Admin

Abre: http://admin.localhost:5173

Inicia sesión con las credenciales del Super Admin.

### 3. Frontend - Tenant

Abre: http://cliente-demo.localhost:5173

Inicia sesión con las credenciales del tenant.

---

## 🔧 Scripts Disponibles

### Proyecto Completo

```powershell
# Iniciar todo el proyecto
.\start-project.ps1

# Detener todo el proyecto
.\stop-project.ps1
```

### Backend

```powershell
cd backend

# Desarrollo (con hot-reload)
npm run start:dev

# Producción
npm run build
npm run start:prod

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert

# Verificar datos de tenant
npx ts-node check-tenant-user.ts
```

### Frontend

```powershell
cd frontend

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## 📚 Documentación Adicional

- **[Estado Actual del Sistema](doc/ESTADO_ACTUAL_SISTEMA.md)** - Resumen completo del sistema
- **[Implementación Subdominios](doc/IMPLEMENTACION_SUBDOMINIOS.md)** - Cómo funciona el sistema multi-tenant
- **[Prueba Login Tenant](doc/PRUEBA_LOGIN_TENANT.md)** - Guía de pruebas de login
- **[Guía de Acceso Multi-Tenant](doc/GUIA_ACCESO_MULTITENANT.md)** - Acceso por subdominios

---

## 🚨 Solución de Problemas

### Error: "Puerto 3000 ya está en uso"

**Solución:**
```powershell
.\stop-project.ps1
```

O manualmente:
```powershell
# Encontrar el proceso
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F
```

### Error: "Cannot connect to database"

**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Verifica las credenciales en `backend/.env`
3. Verifica que la base de datos exista

```powershell
# Conectar a PostgreSQL
psql -U admin -d consentimientos
```

### Error: "Module not found"

**Solución:**
```powershell
# Backend
cd backend
rm -r node_modules
npm install

# Frontend
cd frontend
rm -r node_modules
npm install
```

### El frontend no carga

**Solución:**
1. Limpia el caché del navegador (Ctrl + Shift + Delete)
2. Usa modo incógnito
3. Verifica que el puerto 5173 esté libre

### Error de CORS

**Solución:**
1. Verifica que accedas desde el subdominio correcto
2. Recarga la página (F5)
3. Verifica `backend/.env` → `CORS_ORIGIN=http://localhost:5173`

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los logs en las ventanas del backend y frontend
2. Consulta la documentación en la carpeta `doc/`
3. Verifica que todos los requisitos estén instalados
4. Ejecuta `.\stop-project.ps1` y luego `.\start-project.ps1`

---

## ✅ Checklist de Inicio

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `consentimientos` creada
- [ ] Node.js v18+ instalado
- [ ] Dependencias instaladas (`npm install` en backend y frontend)
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Ejecutar `.\start-project.ps1`
- [ ] Abrir http://admin.localhost:5173
- [ ] Login exitoso con Super Admin
- [ ] Crear un tenant de prueba
- [ ] Acceder al tenant desde su subdominio

---

## 🎯 Próximos Pasos

Una vez que el proyecto esté corriendo:

1. **Explorar el Dashboard** - Ver estadísticas y métricas
2. **Crear Tenants** - Agregar nuevas cuentas cliente
3. **Gestionar Usuarios** - Crear usuarios con diferentes roles
4. **Configurar Sedes** - Agregar sucursales
5. **Crear Servicios** - Definir servicios médicos
6. **Generar Consentimientos** - Crear y firmar documentos
7. **Personalizar** - Ajustar colores, logos y textos

---

**¡Listo para empezar! 🚀**
