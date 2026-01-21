# 📂 Estructura del Proyecto

**Última actualización:** 2026-01-21

---

## 🗂️ Estructura de Carpetas

```
consentimientos_aws/
│
├── 📁 backend/              # Backend NestJS
│   ├── src/                # Código fuente
│   ├── .env               # Variables de entorno
│   └── package.json       # Dependencias backend
│
├── 📁 frontend/             # Frontend React + Vite
│   ├── src/               # Código fuente
│   ├── dist/              # Build de producción
│   └── package.json       # Dependencias frontend
│
├── 📁 doc/                  # Documentación completa
│   ├── 01-inicio/         # Guías de inicio
│   ├── 02-multitenant/    # Sistema multi-tenant
│   ├── 14-impuestos/      # Sistema de impuestos
│   ├── 22-integracion-bold/ # Integración Bold
│   ├── 23-despliegue-aws/ # Despliegue AWS
│   ├── 25-facturacion-automatizada/ # Facturación
│   └── ... (28 carpetas totales)
│
├── 📁 scripts/              # Scripts del proyecto
│   ├── setup/             # Configuración inicial
│   ├── deployment/        # Despliegue
│   ├── maintenance/       # Mantenimiento
│   └── utils/             # Utilidades
│
├── 📁 temp/                 # Archivos temporales
│   └── temp-*.js/conf     # Configuraciones de respaldo
│
├── 📁 keys/                 # Claves SSH (protegidas)
│   └── AWS-ISSABEL.pem    # Clave AWS (copia)
│
├── 📁 node_modules/         # Dependencias npm
├── 📁 .git/                 # Control de versiones
├── 📁 .husky/               # Git hooks
├── 📁 .vscode/              # Configuración VS Code
│
├── 📄 .gitignore           # Archivos ignorados por Git
├── 📄 package.json         # Configuración npm raíz
├── 📄 package-lock.json    # Lock de dependencias
├── 📄 README.md            # README principal
├── 📄 VERSION.md           # Versión del proyecto
└── 🔑 AWS-ISSABEL.pem      # Clave SSH AWS
```

---

## 🚀 Comandos Rápidos

### Desarrollo Local

```powershell
# Iniciar proyecto completo
.\scripts\deployment\start-project.ps1

# Detener proyecto
.\scripts\deployment\stop-project.ps1

# Iniciar con ngrok (para pruebas externas)
.\scripts\deployment\start-dev-with-ngrok.ps1
```

### Mantenimiento

```powershell
# Verificar estado del sistema
.\scripts\maintenance\verificar-sistema.ps1

# Reiniciar todo
.\scripts\maintenance\REINICIAR_TODO.ps1

# Reiniciar solo frontend
.\scripts\maintenance\REINICIAR_FRONTEND_LIMPIO.ps1
```

### Configuración

```powershell
# Configurar versionamiento automático
.\scripts\setup\setup-auto-version.ps1

# Actualizar versión manualmente
.\scripts\utils\update-version.ps1
```

### Producción (AWS)

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ver logs del backend
pm2 logs datagree-backend

# Reiniciar backend
pm2 restart datagree-backend
```

---

## 📚 Documentación Principal

### Inicio Rápido
- **Guía de inicio:** `doc/01-inicio/INICIO_RAPIDO.md`
- **Instalación:** `doc/01-inicio/INSTALACION_DOCKER.md`
- **Estado del sistema:** `doc/01-inicio/ESTADO_ACTUAL_SISTEMA.md`

### Despliegue
- **Despliegue AWS:** `doc/23-despliegue-aws/DESPLIEGUE_AWS_DATAGREE.md`
- **Verificación:** `doc/23-despliegue-aws/VERIFICACION_SISTEMA_COMPLETA_20260121.md`

### Facturación
- **Sistema automatizado:** `doc/25-facturacion-automatizada/`
- **Integración Bold:** `doc/24-integracion-bold-completa/`
- **Impuestos:** `doc/14-impuestos/`

### Scripts
- **Guía de scripts:** `scripts/README.md`
- **Organización:** `doc/ORGANIZACION_ARCHIVOS_RAIZ_20260121.md`

---

## 🔗 URLs Importantes

### Producción
- **Aplicación:** https://datagree.net
- **Panel Admin:** https://admin.datagree.net
- **API:** https://datagree.net/api

### Desarrollo Local
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **API Docs:** http://localhost:3000/api

---

## 🔐 Credenciales

### Aplicación (Producción)
- **Super Admin:** [ADMIN_EMAIL] / [ADMIN_PASSWORD]
- **Admin Demo:** [DEMO_EMAIL] / [DEMO_PASSWORD]

### Servidor AWS
- **Host:** [AWS_SERVER_IP]
- **Usuario:** ubuntu
- **Clave:** AWS-ISSABEL.pem

### Base de Datos
- **Host:** localhost:5432
- **Database:** consentimientos
- **Usuario:** [DB_USERNAME]
- **Password:** [DB_PASSWORD]

---

## 📊 Tecnologías

### Backend
- **Framework:** NestJS
- **Base de datos:** PostgreSQL
- **ORM:** TypeORM
- **Autenticación:** JWT
- **Almacenamiento:** AWS S3
- **Pagos:** Bold Payment Gateway

### Frontend
- **Framework:** React 18
- **Build:** Vite
- **Estilos:** TailwindCSS
- **Estado:** Zustand
- **Routing:** React Router
- **Iconos:** Lucide React

### Infraestructura
- **Servidor:** AWS Lightsail (Ubuntu 24.04)
- **Web Server:** Nginx
- **Process Manager:** PM2
- **SSL:** Let's Encrypt (wildcard)
- **DNS:** AWS Route 53

---

## 🎯 Características Principales

- ✅ Sistema multi-tenant con subdominios
- ✅ Gestión de consentimientos digitales
- ✅ Facturación automatizada con CRON jobs
- ✅ Integración de pagos con Bold
- ✅ Sistema de impuestos configurable
- ✅ Almacenamiento en AWS S3
- ✅ Emails transaccionales
- ✅ Dashboard de administración
- ✅ Control de límites por tenant
- ✅ Sistema de permisos y roles

---

## 📝 Notas Importantes

### Seguridad
- La carpeta `keys/` está excluida de Git
- Nunca subir archivos `.pem` al repositorio
- Mantener `.env` actualizado pero no versionado

### Desarrollo
- Usar `start-project.ps1` para desarrollo local
- Backend en puerto 3000, Frontend en puerto 5173
- Hot reload habilitado en ambos

### Producción
- Backend ejecutado con PM2 y ts-node
- Frontend compilado y servido por Nginx
- SSL wildcard para todos los subdominios
- CRON jobs habilitados para facturación

---

## 🔄 Flujo de Trabajo

### Desarrollo
1. Clonar repositorio
2. Instalar dependencias: `npm install` (en backend y frontend)
3. Configurar `.env` en backend
4. Iniciar: `.\scripts\deployment\start-project.ps1`

### Despliegue
1. Conectar al servidor: `ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249`
2. Pull cambios: `git pull`
3. Instalar dependencias si es necesario
4. Compilar frontend: `npm run build`
5. Reiniciar backend: `pm2 restart datagree-backend`

---

## 📞 Soporte

- **Documentación completa:** `doc/`
- **Índice maestro:** `doc/INDICE_COMPLETO.md`
- **Organización:** `doc/ORGANIZACION_DOCUMENTACION_20260121.md`
- **Scripts:** `scripts/README.md`

---

**Versión:** 1.1.2  
**Última actualización:** 2026-01-21
