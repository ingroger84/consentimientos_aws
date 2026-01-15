# 📚 Documentación del Sistema de Consentimientos

Esta carpeta contiene toda la documentación del sistema organizada por categorías.

## 📂 Estructura de Carpetas

### 01-inicio/
Guías de inicio rápido, instalación y acceso al sistema.
- Guías de inicio rápido
- Instalación y configuración inicial
- Estado actual del sistema
- Acceso y credenciales
- Mejores prácticas

### 02-multitenant/
Documentación sobre el sistema multi-tenant y subdominios.
- Implementación de subdominios
- Gestión de tenants
- Agrupación de recursos por tenant
- Pruebas de login multi-tenant
- Mejoras en la arquitectura multi-tenant

### 03-permisos/
Sistema de permisos y roles de usuario.
- Roles y permisos
- Configuración de permisos por rol
- Pruebas de permisos
- Mejoras en la interfaz de permisos

### 04-personalizacion/
Personalización del sistema y PDFs.
- Personalización de PDFs
- Plantillas y configuración
- Captura de foto del cliente
- Guías de personalización avanzada

### 05-limites/
Control de límites de recursos por tenant.
- Implementación de límites
- Notificaciones de límites
- Métricas de consumo
- Instrucciones de activación y prueba

### 06-impersonation/
Sistema de impersonación y acceso de Super Admin a tenants.
- Implementación de magic links
- Acceso de Super Admin a tenants
- Soluciones y correcciones
- Pruebas de impersonación

### 07-correos/
Configuración y gestión de correos electrónicos.
- Configuración de Gmail/Google Workspace
- Correos de bienvenida
- Reset de contraseña
- Solución de errores de correo

### 08-correcciones/
Historial de correcciones y fixes del sistema.
- Correcciones de aislamiento multi-tenant
- Fixes de permisos
- Correcciones de settings
- Resúmenes de correcciones

### 09-dashboard/
Dashboard y estadísticas del sistema.
- Dashboard de Super Admin
- Funcionalidades interactivas
- Estadísticas y métricas

### 10-scripts/
Scripts de utilidad y mantenimiento.
- Scripts de ejecución
- Reset a fábrica
- Docker compose
- Uso de terminales

## 🚀 Inicio Rápido

1. **Primera vez**: Lee `01-inicio/INICIO_RAPIDO.md`
2. **Instalación**: Consulta `01-inicio/INSTALACION_DOCKER.md` o `01-inicio/INSTALAR_POSTGRESQL.md`
3. **Acceso**: Revisa `01-inicio/ACCESO_SISTEMA.md`
4. **Multi-tenant**: Lee `02-multitenant/SISTEMA_MULTITENANT.md`

## 📖 Documentos Principales

- **Estado del Sistema**: `01-inicio/ESTADO_ACTUAL_SISTEMA.md`
- **Módulos Completados**: `01-inicio/MODULOS_COMPLETADOS.md`
- **Mejores Prácticas**: `01-inicio/MEJORES_PRACTICAS.md`
- **Índice de Documentación**: `01-inicio/INDICE_DOCUMENTACION.md`

## 🔍 Buscar Información

- **Permisos**: Busca en `03-permisos/`
- **Personalización**: Busca en `04-personalizacion/`
- **Problemas/Errores**: Busca en `08-correcciones/`
- **Configuración de correos**: Busca en `07-correos/`
- **Límites de recursos**: Busca en `05-limites/`

## 📝 Notas

- Todos los archivos están en formato Markdown (.md)
- Los nombres de archivo son descriptivos y autoexplicativos
- Cada carpeta contiene documentación relacionada con su tema específico
- Los archivos de correcciones están organizados cronológicamente en `08-correcciones/`

---

**Última actualización**: Enero 2026
