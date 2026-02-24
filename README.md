# Archivo en Línea - Sistema de Consentimientos Multi-Tenant

> Sistema completo de gestión de consentimientos informados con arquitectura multi-tenant basada en subdominios.

[![Version](https://img.shields.io/badge/version-42.0.0-blue.svg)](VERSION.md)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D14.0-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-Private-red.svg)](#)
[![Status](https://img.shields.io/badge/status-Production-success.svg)](https://archivoenlinea.com)

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Inicio Rápido](#-inicio-rápido)
- [Acceso al Sistema](#-acceso-al-sistema)
- [Tecnologías](#️-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación](#-documentación)
- [Requisitos](#-requisitos)
- [Seguridad](#-seguridad)

---

## ✨ Características Principales

### 🌐 Landing Page SaaS
- Landing page comercial completa con información del producto
- Visualización de planes y precios con toggle mensual/anual
- Registro de cuenta tenant desde la landing page
- Envío automático de correo de bienvenida
- Diseño responsive y moderno

### 🏢 Multi-Tenant
- Gestión de múltiples clientes (tenants) independientes
- Acceso mediante subdominios únicos
- Aislamiento completo de datos por tenant
- Configuración personalizada por cliente

### 💳 Sistema de Planes y Facturación
- 5 planes configurables: Free, Basic, Professional, Enterprise, Custom
- Límites por recurso: usuarios, sedes, servicios, consentimientos
- Validación automática y bloqueo al alcanzar límites
- Dashboard "Mi Plan" con visualización de uso en tiempo real
- Alertas inteligentes al 80% y 100% de uso
- Pricing flexible con ciclos mensuales y anuales
- Integración con Bold Colombia (Wompi) para pagos online

### 👥 Gestión de Usuarios
- Sistema de roles y permisos granular
- Super Admin para gestión global
- Administradores por tenant
- Usuarios operativos con permisos específicos
- Impersonation seguro para acceso sin modificar contraseñas

### 🏥 Gestión de Consentimientos
- Creación de consentimientos personalizados
- Firma digital de documentos
- Generación de PDFs con marca de agua
- Envío automático por email
- Captura de foto del paciente
- Almacenamiento en AWS S3

### 🎨 Personalización
- Logos personalizados (principal, footer, marca de agua, favicon)
- Colores corporativos configurables
- Textos y plantillas personalizables
- Configuración independiente por tenant

### 📊 Dashboard y Estadísticas
- Métricas globales para Super Admin
- Estadísticas por tenant
- Reportes de uso y actividad
- Gráficos y visualizaciones

### 💰 Sistema de Impuestos
- Configuración flexible de impuestos (IVA, otros)
- Facturas con o sin impuestos
- Tenants exentos de impuestos
- Cálculos automáticos en facturación

---

## 🚀 Inicio Rápido

### Opción 1: Usando Terminales (Recomendado)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Opción 2: Script de PowerShell

```powershell
.\scripts\start.ps1
```

El sistema estará disponible en:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- API Docs: `http://localhost:3000/api`

---

## 🔐 Acceso al Sistema

### Landing Page Pública

```
URL:      http://localhost:5173
Función:  Información comercial y registro de nuevas cuentas
```

### Super Admin (Administrador del Sistema)

```
URL:      http://admin.localhost:5173
Email:    Ver archivo CREDENCIALES.md
Password: Ver archivo CREDENCIALES.md
```

### Tenant de Ejemplo

```
URL:      http://cliente-demo.localhost:5173
Email:    Ver archivo CREDENCIALES.md
Password: Ver archivo CREDENCIALES.md
```

> ⚠️ **Nota:** Las credenciales reales están en el archivo `CREDENCIALES.md` (no incluido en el repositorio por seguridad)

---

## 🛠️ Tecnologías

### Backend
- **NestJS** - Framework Node.js moderno y escalable
- **TypeORM** - ORM para PostgreSQL con soporte TypeScript
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación y autorización
- **PDFKit** - Generación de PDFs personalizados
- **Nodemailer** - Envío de correos electrónicos
- **AWS SDK** - Integración con S3 para almacenamiento
- **Bull** - Colas de trabajos para tareas asíncronas

### Frontend
- **React 18** - Librería UI moderna
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Build tool ultra rápido
- **TailwindCSS** - Framework CSS utility-first
- **React Router** - Navegación SPA
- **Zustand** - Estado global ligero
- **React Hook Form** - Manejo de formularios
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos modernos

---

## 📁 Estructura del Proyecto

```
/
├── backend/                    # API NestJS
│   ├── src/                   # Código fuente
│   ├── uploads/               # Archivos subidos (local)
│   └── dist/                  # Build de producción
│
├── frontend/                   # Aplicación React
│   ├── src/                   # Código fuente
│   ├── public/                # Archivos estáticos
│   └── dist/                  # Build de producción
│
├── config/                     # ⚙️ Configuración del proyecto
│   ├── nginx/                 # Configuraciones de Nginx (5 archivos)
│   ├── ecosystem/             # Configuraciones de PM2 (3 archivos)
│   ├── package.json           # Dependencias del proyecto
│   └── README.md              # Documentación de configuración
│
├── database/                   # 🗄️ Scripts y datos de BD
│   ├── scripts/               # Scripts de utilidad (15 archivos)
│   ├── seeds/                 # Datos iniciales y plantillas
│   ├── migrations/            # Migraciones adicionales
│   └── README.md              # Documentación de base de datos
│
├── deploy/                     # 🚀 Scripts de despliegue
│   ├── archives/              # Archivos comprimidos (.tar.gz, .zip)
│   ├── deploy-*.ps1           # Scripts de despliegue PowerShell
│   ├── install.sh             # Script de instalación
│   └── README.md              # Guía de despliegue
│
├── credentials/                # 🔐 Credenciales (NO en Git)
│   ├── AWS-ISSABEL.pem        # Clave SSH AWS (protegida)
│   ├── credentials*.txt       # Archivos de credenciales
│   ├── CREDENCIALES.md        # Documentación de credenciales
│   └── README.md              # Guía de seguridad
│
├── tests/                      # 🧪 Tests adicionales
│   ├── test-*.js              # Scripts de prueba
│   └── README.md              # Documentación de tests
│
├── scripts/                    # 📜 Scripts organizados por categoría
│   ├── deployment/            # Scripts de despliegue (27 archivos)
│   ├── setup/                 # Scripts de configuración (7 archivos)
│   ├── maintenance/           # Scripts de mantenimiento (18 archivos)
│   ├── utils/                 # Utilidades y herramientas (19 archivos)
│   └── README.md              # Documentación completa de scripts
│
├── doc/                        # 📚 Documentación completa (200+ archivos)
│   ├── 01-inicio/             # Guías de inicio rápido
│   ├── 02-multitenant/        # Arquitectura multi-tenant
│   ├── 03-permisos/           # Sistema de permisos
│   ├── 04-personalizacion/    # Personalización
│   ├── 05-consentimientos/    # Gestión de consentimientos
│   ├── 06-historias-clinicas/ # Historias clínicas
│   ├── 07-planes-facturacion/ # Planes y facturación
│   ├── 27-landing-page-saas/  # Landing page comercial
│   ├── 90-auditoria-produccion/ # Auditoría y seguridad
│   ├── 98-estrategia-multi-mercado/ # Estrategia de mercado
│   ├── versiones/             # Documentación por versión (40+ archivos)
│   ├── despliegues/           # Guías de despliegue (15+ archivos)
│   ├── correcciones/          # Soluciones aplicadas (50+ archivos)
│   ├── verificaciones/        # Scripts de verificación (20+ archivos)
│   ├── instrucciones/         # Procedimientos (25+ archivos)
│   ├── implementaciones/      # Features implementadas (15+ archivos)
│   ├── resumen-sesiones/      # Resúmenes de trabajo (30+ archivos)
│   ├── herramientas-html/     # Herramientas de diagnóstico (50+ archivos)
│   └── README.md              # Índice completo de documentación
│
├── .gitignore                  # Archivos ignorados por Git
├── VERSION.md                  # Historial de versiones
└── README.md                   # Este archivo
```

> 📝 **Nota:** Solo los archivos esenciales permanecen en la raíz. Todo está organizado en carpetas temáticas.

---

## 📚 Documentación

> 📖 **[Ver Índice Completo de Documentación](doc/INDICE_COMPLETO.md)**

### 🚀 Guías de Inicio
- [Inicio Rápido](doc/01-inicio/INICIO_RAPIDO.md) - Cómo ejecutar el proyecto
- [Estado del Sistema](doc/01-inicio/ESTADO_ACTUAL_SISTEMA.md) - Resumen completo
- [Acceso al Sistema](doc/01-inicio/ACCESO_SISTEMA.md) - Credenciales y acceso

### 🏢 Multi-Tenant
- [Sistema Multi-Tenant](doc/02-multitenant/SISTEMA_MULTITENANT.md) - Arquitectura
- [Implementación Subdominios](doc/02-multitenant/IMPLEMENTACION_SUBDOMINIOS.md)

### 👥 Permisos y Roles
- [Sistema de Permisos](doc/03-permisos/SISTEMA_PERMISOS_ROLES.md)
- [Roles y Permisos](doc/03-permisos/PERMISOS_ROLES.md)

### 🎨 Personalización
- [Personalización del Sistema](doc/04-personalizacion/PERSONALIZACION_SISTEMA.md)
- [Personalización de PDFs](doc/04-personalizacion/PERSONALIZACION_PDF_COMPLETA.md)

### 🌐 Landing Page y Registro
- [Landing Page SaaS](doc/27-landing-page-saas/README.md) - Landing comercial completa
- [Inicio Rápido](doc/27-landing-page-saas/INICIO_RAPIDO.md) - Guía de inicio rápido
- [Guía de Pruebas](doc/27-landing-page-saas/GUIA_PRUEBAS.md) - Checklist de pruebas

### 💰 Facturación y Pagos
- [Sistema de Impuestos](doc/14-impuestos/README.md)
- [Facturación Manual](doc/17-facturacion-manual/README.md)
- [Pago de Facturas](doc/18-pago-facturas-tenant/README.md)
- [Integración Bold Colombia](doc/24-integracion-bold-completa/ANALISIS_BOLD_COLOMBIA_20260121.md)

### ☁️ Infraestructura
- [Almacenamiento AWS S3](doc/19-aws-s3-storage/README.md)
- [Despliegue en AWS](doc/23-despliegue-aws/DESPLIEGUE_AWS_DATAGREE.md)

---

## 📋 Requisitos

### Software Requerido
- **Node.js** v18 o superior
- **PostgreSQL** v14 o superior
- **npm** o **yarn**

### Servicios Externos (Opcional)
- **AWS S3** - Para almacenamiento de archivos
- **Gmail/SMTP** - Para envío de correos
- **Bold Colombia** - Para procesamiento de pagos

---

## 🔒 Seguridad

- ✅ Autenticación JWT con tokens seguros
- ✅ Bcrypt para hash de contraseñas
- ✅ Validación de subdominios por tenant
- ✅ Aislamiento completo de datos por tenant
- ✅ Guards y middleware de seguridad
- ✅ Validación de permisos por rol
- ✅ CORS configurado correctamente
- ✅ Helmet para headers de seguridad HTTP
- ✅ Variables de entorno para credenciales
- ✅ .gitignore configurado para archivos sensibles

---

## 📝 Versionamiento

El sistema utiliza versionamiento automático mediante Git Hooks.

**Versión Actual:** 41.1.0 - 2026-02-24

Ver [VERSION.md](VERSION.md) para el historial completo de cambios.

---

## 🌐 Despliegue en Producción

El sistema está desplegado en:
- **Dominio:** https://datagree.net
- **Servidor:** AWS Lightsail (Ubuntu 24.04)
- **Base de Datos:** PostgreSQL en AWS RDS
- **Almacenamiento:** AWS S3

Ver [Guía de Despliegue](doc/23-despliegue-aws/DESPLIEGUE_AWS_DATAGREE.md) para más detalles.

---

## 👥 Soporte

Para soporte técnico o consultas:
- **Email:** soporte@datagree.net
- **Documentación:** [doc/INDICE_COMPLETO.md](doc/INDICE_COMPLETO.md)

---

## 📄 Licencia

Este proyecto es privado y confidencial.

© 2026 Innova Systems - Todos los derechos reservados.

---

**Desarrollado con ❤️ por Innova Systems**
