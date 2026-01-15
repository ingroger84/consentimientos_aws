# 🏥 Sistema de Consentimientos Multi-Tenant

Sistema completo de gestión de consentimientos informados con arquitectura multi-tenant basada en subdominios.

## 🚀 Inicio Rápido

### Opción 1: Usando Terminales de Kiro (Recomendado)

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Opción 2: Script de Ayuda

```powershell
.\start.ps1
```

Este script muestra las instrucciones y URLs de acceso.

### Detener el Proyecto

**Opción 1:** Presiona `Ctrl+C` en cada terminal

**Opción 2:** Ejecuta el script:
```powershell
.\stop.ps1
```

📖 **[Ver Guía Completa de Inicio](INICIO_RAPIDO.md)**

---

## 🔐 Acceso al Sistema

### Super Admin (Administrador del Sistema)

```
URL:      http://admin.localhost:5173
Email:    superadmin@sistema.com
Password: superadmin123
```

### Tenant de Ejemplo

```
URL:      http://cliente-demo.localhost:5173
Email:    clientedemo@demo.com
Password: (configurada al crear el tenant)
```

---

## 📋 Características Principales

### 🏢 Multi-Tenant
- Gestión de múltiples clientes (tenants) independientes
- Acceso mediante subdominios únicos
- Aislamiento completo de datos por tenant
- Configuración personalizada por cliente

### 💳 Sistema de Planes y Pricing ⭐ NUEVO
- **5 planes configurables**: Free, Basic, Professional, Enterprise, Custom
- **Límites por recurso**: Usuarios, sedes, servicios, consentimientos, preguntas, almacenamiento
- **Validación automática**: Bloqueo al alcanzar límites del plan
- **Dashboard "Mi Plan"**: Visualización de uso de recursos en tiempo real
- **Alertas inteligentes**: Notificaciones al 80% y 100% de uso
- **Pricing flexible**: Ciclos mensuales y anuales con descuento
- **Página de pricing pública**: Comparación de planes y características
- **Personalización de límites** ⭐ NUEVO: Super Admin puede ajustar límites individuales por tenant
  - Toggle para habilitar/deshabilitar personalización
  - Indicadores visuales de límites base vs personalizados
  - Función de restauración a límites del plan
  - Detección automática de personalizaciones
  - Script de auditoría incluido

### 👥 Gestión de Usuarios
- Sistema de roles y permisos granular
- Super Admin para gestión global
- Administradores por tenant
- Usuarios operativos con permisos específicos
- **Impersonation seguro** ⭐ - Acceso a cuentas sin modificar contraseñas

### 🏥 Gestión de Consentimientos
- Creación de consentimientos personalizados
- Firma digital de documentos
- Generación de PDFs con marca de agua
- Envío automático por email
- Captura de foto del paciente

### 🎨 Personalización
- Logos personalizados (principal, footer, marca de agua)
- Colores corporativos configurables
- Textos y plantillas personalizables
- Configuración independiente por tenant

### 📊 Dashboard y Estadísticas
- Métricas globales para Super Admin
- Estadísticas por tenant
- Reportes de uso y actividad
- Gráficos y visualizaciones

---

## 🛠️ Tecnologías

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **PDFKit** - Generación de PDFs
- **Nodemailer** - Envío de emails

### Frontend
- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **React Router** - Navegación
- **Zustand** - Estado global
- **React Hook Form** - Formularios
- **Axios** - Cliente HTTP

---

## 📁 Estructura del Proyecto

```
consentimientos/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Autenticación y autorización
│   │   ├── users/          # Gestión de usuarios
│   │   ├── tenants/        # Gestión de tenants
│   │   ├── settings/       # Configuración
│   │   ├── consents/       # Consentimientos
│   │   ├── branches/       # Sedes/Sucursales
│   │   ├── services/       # Servicios médicos
│   │   ├── roles/          # Roles y permisos
│   │   └── common/         # Middleware, guards, decorators
│   └── uploads/            # Archivos subidos
│
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── services/      # Servicios API
│   │   ├── store/         # Estado global (Zustand)
│   │   ├── contexts/      # Contextos de React
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilidades
│   └── public/            # Archivos estáticos
│
├── doc/                    # Documentación (organizada por categorías)
│   ├── 01-inicio/         # Guías de inicio y configuración
│   ├── 02-multitenant/    # Sistema multi-tenant
│   ├── 03-permisos/       # Roles y permisos
│   ├── 04-personalizacion/# Personalización y PDFs
│   ├── 05-limites/        # Control de límites
│   ├── 06-impersonation/  # Acceso Super Admin
│   ├── 07-correos/        # Configuración de emails
│   ├── 08-correcciones/   # Historial de fixes
│   ├── 09-dashboard/      # Dashboard y estadísticas
│   ├── 10-scripts/        # Scripts de utilidad
│   └── README.md          # Índice de documentación
│
├── start-project.ps1       # Script para iniciar proyecto
├── stop-project.ps1        # Script para detener proyecto
├── INICIO_RAPIDO.md        # Guía de inicio rápido
└── README.md               # Este archivo
```

---

## 🔧 Requisitos Previos

- **Node.js** v18 o superior
- **PostgreSQL** v14 o superior
- **npm** o **yarn**

### Verificar Instalación

```powershell
node --version    # v18.x.x o superior
npm --version     # 9.x.x o superior
psql --version    # PostgreSQL 14.x o superior
```

---

## ⚙️ Instalación Manual

Si prefieres instalar manualmente en lugar de usar el script:

### 1. Clonar el Repositorio

```powershell
git clone <repository-url>
cd consentimientos
```

### 2. Configurar Base de Datos

```sql
CREATE DATABASE consentimientos;
```

### 3. Configurar Variables de Entorno

**Backend:** Edita `backend/.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin123
DB_DATABASE=consentimientos
```

**Frontend:** Edita `frontend/.env`
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Instalar Dependencias

```powershell
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 5. Ejecutar Migraciones

```powershell
cd backend
npm run migration:run
```

### 6. Iniciar el Proyecto

```powershell
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 📚 Documentación

> 📖 **[Ver Índice Completo de Documentación](doc/README.md)**

La documentación está organizada en 10 categorías dentro de la carpeta `doc/`:

### 🚀 Inicio Rápido
- **[Inicio Rápido](doc/01-inicio/INICIO_RAPIDO.md)** - Cómo ejecutar el proyecto
- **[Estado del Sistema](doc/01-inicio/ESTADO_ACTUAL_SISTEMA.md)** - Resumen completo
- **[Guía de Acceso](doc/01-inicio/ACCESO_SISTEMA.md)** - Credenciales y acceso

### 🏢 Multi-Tenant
- **[Sistema Multi-Tenant](doc/02-multitenant/SISTEMA_MULTITENANT.md)** - Arquitectura
- **[Implementación Subdominios](doc/02-multitenant/IMPLEMENTACION_SUBDOMINIOS.md)**
- **[Agrupación por Tenant](doc/02-multitenant/AGRUPACION_SEDES_POR_TENANT.md)**

### 👥 Permisos y Roles
- **[Sistema de Permisos](doc/03-permisos/SISTEMA_PERMISOS_ROLES.md)**
- **[Roles y Permisos](doc/03-permisos/PERMISOS_ROLES.md)**

### 🎨 Personalización
- **[Personalización del Sistema](doc/04-personalizacion/PERSONALIZACION_SISTEMA.md)**
- **[Personalización de PDFs](doc/04-personalizacion/PERSONALIZACION_PDF_COMPLETA.md)**

### 🎯 Control de Límites
- **[Control de Límites](doc/05-limites/CONTROL_LIMITES_RECURSOS.md)**
- **[Sistema Completo](doc/05-limites/SISTEMA_COMPLETO_LIMITES.md)**

### 👤 Impersonation
- **[Acceso Super Admin](doc/06-impersonation/ACCESO_SUPER_ADMIN_A_TENANTS.md)** ⭐
- **[Sistema Magic Links](doc/06-impersonation/SOLUCION_MAGIC_LINK_IMPERSONATION.md)**
- **[Instrucciones de Uso](doc/06-impersonation/INSTRUCCIONES_IMPERSONATION.md)**

### 📧 Configuración de Correos
- **[Configuración Gmail](doc/07-correos/GUIA_RAPIDA_GMAIL.md)**
- **[Google Workspace](doc/07-correos/CONFIGURACION_GOOGLE_WORKSPACE.md)**

### 📊 Dashboard
- **[Dashboard Super Admin](doc/09-dashboard/DASHBOARD_SUPER_ADMIN.md)**
- **[Funcionalidades Interactivas](doc/09-dashboard/FUNCIONALIDADES_DASHBOARD_SUPER_ADMIN.md)**

### 🛠️ Scripts y Utilidades
- **[Scripts de Ejecución](doc/10-scripts/SCRIPTS_EJECUCION.md)**
- **[Reset a Fábrica](doc/10-scripts/RESET_FABRICA.md)**

### 🔧 Correcciones
- **[Historial de Correcciones](doc/08-correcciones/)** - Más de 30 documentos de fixes

---

## 🧪 Scripts Útiles

### Proyecto Completo

```powershell
# Ver instrucciones de inicio
.\start.ps1

# Detener todos los procesos
.\stop.ps1

# Verificar estado del sistema
.\verificar-sistema.ps1

# Limpiar caché y reiniciar frontend
.\restart-frontend-clean.ps1

# Iniciar frontend en modo producción
.\start-frontend-production.ps1
```

**Inicio manual en terminales de Kiro:**
```bash
# Terminal 1
cd backend
npm run start:dev

# Terminal 2
cd frontend
npm run dev
```

### Backend

```powershell
cd backend

npm run start:dev           # Desarrollo con hot-reload
npm run build               # Build para producción
npm run start:prod          # Ejecutar en producción
npm run migration:run       # Ejecutar migraciones
npm run migration:revert    # Revertir última migración

# Scripts de utilidad
npx ts-node check-tenant-user.ts        # Verificar datos de tenant
npx ts-node cleanup-orphan-users.ts     # Limpiar usuarios huérfanos
npx ts-node reset-to-factory.ts         # Reset a estado inicial
```

### Frontend

```powershell
cd frontend

npm run dev         # Desarrollo
npm run build       # Build para producción
npm run preview     # Preview del build
```

---

## 🚨 Solución de Problemas

### Puerto ocupado

```powershell
.\stop-project.ps1
```

### Error de base de datos

1. Verifica que PostgreSQL esté corriendo
2. Verifica credenciales en `backend/.env`
3. Verifica que la base de datos exista

### Error de módulos

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

📖 **[Ver Guía Completa de Solución de Problemas](INICIO_RAPIDO.md#-solución-de-problemas)**

---

## 🏗️ Arquitectura Multi-Tenant

### Flujo de Autenticación

```
1. Usuario accede a: cliente1.tudominio.com
2. TenantMiddleware detecta: tenantSlug = 'cliente1'
3. AuthService valida: usuario pertenece a 'cliente1'
4. TenantGuard verifica: cada request es del tenant correcto
5. Servicios filtran: datos solo del tenant 'cliente1'
```

### Reglas de Acceso

- **Super Admin:** `admin.localhost:5173` o `localhost:5173`
  - Gestiona todos los tenants
  - Configuración independiente
  - No puede acceder a subdominios de tenants

- **Usuarios de Tenant:** `{slug}.localhost:5173`
  - Solo ven datos de su tenant
  - Configuración personalizada
  - No pueden ver otros tenants ni Super Admin

---

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Bcrypt para contraseñas
- ✅ Validación de subdominios
- ✅ Aislamiento de datos por tenant
- ✅ Guards y middleware de seguridad
- ✅ Validación de permisos por rol
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad

---

## 📊 Base de Datos

### Tablas Principales

- `tenants` - Información de clientes
- `users` - Usuarios del sistema
- `roles` - Roles y permisos
- `app_settings` - Configuración por tenant
- `branches` - Sedes/Sucursales
- `services` - Servicios médicos
- `consents` - Consentimientos generados
- `questions` - Preguntas personalizadas

### Migraciones

Las migraciones se ejecutan automáticamente al iniciar el backend.

```powershell
cd backend
npm run migration:run      # Ejecutar migraciones pendientes
npm run migration:revert   # Revertir última migración
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es privado y confidencial.

---

## 👥 Equipo

Desarrollado por el equipo de Innova Systems

---

## 📞 Soporte

Para soporte técnico:
- Revisa la [documentación](doc/)
- Consulta la [guía de solución de problemas](INICIO_RAPIDO.md#-solución-de-problemas)
- Contacta al equipo de desarrollo

---

**¡Gracias por usar el Sistema de Consentimientos! 🚀**
#   c o n s e n t i m i e n t o s _ a w s  
 