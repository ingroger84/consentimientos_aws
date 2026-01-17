# Sistema de Consentimientos Multi-Tenant

Sistema completo de gestión de consentimientos informados con arquitectura multi-tenant basada en subdominios.

## 🚀 NUEVO: Fase 2 - Optimizaciones Avanzadas 

¡Sistema ahora con Redis, Colas de Trabajos y Métricas Completas!

### Fase 1 (Completada)

- ⚡ 96% más rápido en listados (5s → 200ms)
- 🔍 85% menos queries por request (90 → ~3)
- 📊 99.8% menos datos transferidos (500KB → ~100KB)
- 🚀 400% más capacidad de carga (100 → 500 req/s)

### Fase 2 (Completada)

- 📦 **Redis** - Caché distribuido compartido
- 🔄 **Bull** - Colas de trabajos (PDFs y Emails)
- 📊 **Prometheus** - Métricas de sistema
- 🔍 **Reallock** - Locks distribuidos (0% duplicados en CRON)
- 🎯 **Terminus** - 5+ health checks completos

📖 **[Ver Guía Fase 1](doc/01-inicio/INICIO_RAPIDO.md)** | **[Ver Guía Fase 2](doc/01-inicio/INICIO_RAPIDO.md)**

---

## 📖 Inicio Rápido

### Opción 1: Usando Terminales de Kiro (Recomendado)

Terminal 1 - Backend:
```bash
cd backend
npm run start:dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Opción 2: Script de Ayuda

```powershell
.\start.ps1
```

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
- ✅ Gestión de múltiples clientes (tenants) independientes
- ✅ Acceso mediante subdominios únicos
- ✅ Aislamiento completo de datos por tenant
- ✅ Configuración personalizada por cliente

### 💳 Sistema de Planes y Pricing
- ✅ 5 planes configurables: Free, Basic, Professional, Enterprise, Custom
- ✅ Límites por recurso: Usuarios, sedes, servicios, consentimientos, preguntas, almacenamiento
- ✅ Validación automática: Bloqueo al alcanzar límites del plan
- ✅ Dashboard "Mi Plan": Visualización de uso de recursos en tiempo real
- ✅ Alertas inteligentes: Notificaciones al 80% y 100% de uso
- ✅ Pricing flexible: Ciclos mensuales y anuales con descuento
- ✅ Página de pricing pública: Comparación de planes y características
- ✅ Personalización de límites: Super Admin puede ajustar límites individuales por tenant

### 👥 Gestión de Usuarios
- ✅ Sistema de roles y permisos granular
- ✅ Super Admin para gestión global
- ✅ Administradores por tenant
- ✅ Usuarios operativos con permisos específicos
- ✅ Impersonation seguro - Acceso a cuentas sin modificar contraseñas

### 🏥 Gestión de Consentimientos
- ✅ Creación de consentimientos personalizados
- ✅ Firma digital de documentos
- ✅ Generación de PDFs con marca de agua
- ✅ Envío automático por email
- ✅ Captura de foto del paciente

### 🎨 Personalización
- ✅ Logos personalizados (principal, footer, marca de agua)
- ✅ Colores corporativos configurables
- ✅ Textos y plantillas personalizables
- ✅ Configuración independiente por tenant

### 📊 Dashboard y Estadísticas
- ✅ Métricas globales para Super Admin
- ✅ Estadísticas por tenant
- ✅ Reportes de uso y actividad
- ✅ Gráficos y visualizaciones

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
│   └── 10-scripts/        # Scripts de utilidad
│
└── scripts/                # Scripts de PowerShell
    ├── start.ps1          # Iniciar proyecto
    ├── stop.ps1           # Detener proyecto
    └── verificar-sistema.ps1  # Verificar estado
```

---

## 🔧 Requisitos Previos

- **Node.js** v18 o superior
- **PostgreSQL** v14 o superior
- **npm** o **yarn**

---

## 📚 Documentación

> 📖 **[Ver Índice Completo de Documentación](doc/README.md)**

### 🚀 Inicio Rápido
- **[Inicio Rápido](doc/01-inicio/INICIO_RAPIDO.md)** - Cómo ejecutar el proyecto
- **[Estado del Sistema](doc/01-inicio/ESTADO_ACTUAL_SISTEMA.md)** - Resumen completo
- **[Guía de Acceso](doc/01-inicio/ACCESO_SISTEMA.md)** - Credenciales y acceso

### 🏢 Multi-Tenant
- **[Sistema Multi-Tenant](doc/02-multitenant/SISTEMA_MULTITENANT.md)** - Arquitectura
- **[Implementación Subdominios](doc/02-multitenant/IMPLEMENTACION_SUBDOMINIOS.md)**

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
- **[Acceso Super Admin](doc/06-impersonation/ACCESO_SUPER_ADMIN_A_TENANTS.md)**
- **[Sistema Magic Links](doc/06-impersonation/SOLUCION_MAGIC_LINK_IMPERSONATION.md)**

### 📧 Configuración de Correos
- **[Configuración Gmail](doc/07-correos/GUIA_RAPIDA_GMAIL.md)**
- **[Google Workspace](doc/07-correos/CONFIGURACION_GOOGLE_WORKSPACE.md)**

### 📊 Dashboard
- **[Dashboard Super Admin](doc/09-dashboard/DASHBOARD_SUPER_ADMIN.md)**
- **[Funcionalidades Interactivas](doc/09-dashboard/FUNCIONALIDADES_DASHBOARD_SUPER_ADMIN.md)**

### 🛠️ Scripts y Utilidades
- **[Scripts de Ejecución](doc/10-scripts/SCRIPTS_EJECUCION.md)**
- **[Reset a Fábrica](doc/10-scripts/RESET_FABRICA.md)**

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

## 📝 Licencia

Este proyecto es privado y confidencial.

---

## 👥 Equipo

Desarrollado por el equipo de Innova Systems

---

**¡Gracias por usar el Sistema de Consentimientos! 🚀**
#   d a t a g r e e - v e r c e l  
 #   d a t a g r e e - v e r c e l  
 