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

### 14-impuestos/
Sistema de impuestos y configuración fiscal.
- Configuración de IVA
- Retención en la fuente
- Impuestos adicionales
- Exención de impuestos
- Ejemplos de uso

### 15-versionamiento/
Sistema de versionamiento automático.
- Versionamiento automático en commits
- Configuración de hooks
- Ejemplos de uso

### 16-nombres-planes/
Corrección de nombres de planes de suscripción.
- Corrección de dashboard
- Actualización de nombres

### 17-facturacion-manual/
Sistema de facturación manual.
- Creación de facturas manuales
- Impuestos dinámicos
- Correcciones y mejoras
- Ejemplos de uso

### 18-pago-facturas-tenant/
Sistema de pago de facturas para tenants.
- Integración con Bold
- Botón "Pagar Ahora"
- Flujo de pagos

### 19-aws-s3-storage/
Migración a AWS S3 para almacenamiento.
- Configuración de S3
- Migración de archivos
- Corrección de ACL
- Verificación completa

### 20-favicon-personalizado/
Favicon personalizado por tenant.
- Implementación de favicon dinámico
- Carga desde S3
- Guía de pruebas

### 21-correccion-email-s3/
Corrección de URLs S3 en emails.
- URLs correctas en correos
- Visualización de archivos adjuntos

### 22-integracion-bold/
Integración técnica con Bold Payment Gateway.
- Configuración de Bold
- Webhooks
- Guía de pruebas
- Configuración localhost

### 23-despliegue-aws/
Despliegue completo en AWS Lightsail.
- Guía de despliegue paso a paso
- Configuración de servidor
- Certificado SSL wildcard
- CRON jobs habilitados
- Verificación del sistema

### 24-integracion-bold-completa/
Integración completa con Bold (resúmenes).
- Estado final de Bold
- Configuración completa
- Integración con facturas de tenants

### 25-facturacion-automatizada/
Sistema completo de facturación automatizada.
- Mejoras del módulo de facturación
- Dashboard optimizado
- Marquesina de recordatorio de pago
- Fechas de facturación
- Sistema de impuestos

### 26-mejoras-ui/
Mejoras de interfaz de usuario.
- Favicon implementado
- Branding en emails
- Footer personalizado

### 27-configuracion-sistema/
Configuraciones técnicas del sistema.
- Correcciones de S3
- Configuración de correo
- Versionamiento automático

### 28-resumen-sesiones/
Resúmenes de sesiones de trabajo.
- Resumen de sesión 20260120
- Estado del sistema

### 29-sincronizacion-planes/
Sincronización de planes de facturación.
- Guías de pruebas
- Documentación técnica

### 30-responsive-mobile/
Optimización responsive y mobile.
- Diseño adaptativo
- Mejoras de UI móvil

### 31-visualizacion-sede-operador/
Visualización de sede para operadores.
- Implementación de sede en UI
- Permisos por sede

### 32-gestion-clientes/
Sistema completo de gestión de clientes.
- CRUD de clientes
- Integración con consentimientos
- Permisos por rol

### 33-plantillas-consentimiento/
Sistema de plantillas personalizables.
- Plantillas predeterminadas
- Gestión por tenant
- Tipos de plantillas

### 34-sesion-unica/
Sistema de sesión única por usuario.
- Cierre automático de sesiones
- Verificación periódica
- Seguridad mejorada

### 35-actualizaciones-github/
Historial de actualizaciones al repositorio.
- Cambios por versión
- Commits y releases
- Documentación de actualizaciones

### 36-despliegues/
Historial de despliegues en producción.
- Despliegues por versión
- Comandos ejecutados
- Verificaciones post-despliegue

### 37-correcciones/
Correcciones de bugs y problemas.
- Fixes de frontend y backend
- Correcciones de dominio
- Correcciones de facturación
- Correcciones de autenticación

### 38-implementaciones/
Nuevas funcionalidades implementadas.
- Documentación técnica de features
- Guías de implementación
- Especificaciones técnicas

### 39-ssl-certificados/
Configuración de certificados SSL.
- Certificados wildcard
- Problemas y soluciones SSL
- Guías de configuración HTTPS

### 40-aws-infraestructura/
Configuración de infraestructura AWS.
- Seguridad y credenciales
- Optimizaciones de servidor
- Verificación de conexiones

### 41-analisis-estados/
Análisis técnicos del sistema.
- Estados actuales
- Resúmenes ejecutivos
- Reportes de progreso

### 42-soluciones/
Soluciones a problemas comunes.
- Instrucciones de troubleshooting
- Workarounds y fixes
- Guías de resolución

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
- **Facturación**: Busca en `17-facturacion-manual/` y `25-facturacion-automatizada/`
- **Pagos con Bold**: Busca en `22-integracion-bold/` y `24-integracion-bold-completa/`
- **Despliegue AWS**: Busca en `23-despliegue-aws/` y `36-despliegues/`
- **Impuestos**: Busca en `14-impuestos/`
- **AWS S3**: Busca en `19-aws-s3-storage/` y `27-configuracion-sistema/`
- **SSL/Certificados**: Busca en `39-ssl-certificados/`
- **Clientes**: Busca en `32-gestion-clientes/`
- **Plantillas**: Busca en `33-plantillas-consentimiento/`
- **Sesión Única**: Busca en `34-sesion-unica/`
- **Soluciones**: Busca en `42-soluciones/`

## 📝 Notas

- Todos los archivos están en formato Markdown (.md)
- Los nombres de archivo son descriptivos y autoexplicativos
- Cada carpeta contiene documentación relacionada con su tema específico
- Los archivos de correcciones están organizados cronológicamente en `08-correcciones/`

---

**Última actualización**: Enero 2026 (24/01/2026)

## 🎯 Documentación Reciente

### Sistema de Sesión Única (24/01/2026)
- ✅ Sesión única por usuario implementada
- ✅ Verificación periódica cada 30 segundos
- ✅ Cierre automático de sesiones anteriores
- ✅ Limpieza de localStorage por subdominio

Ver: `34-sesion-unica/` y `38-implementaciones/`

### Gestión de Clientes y Plantillas (23/01/2026)
- ✅ Sistema completo de gestión de clientes
- ✅ Plantillas de consentimiento personalizables
- ✅ Plantillas predeterminadas por tenant
- ✅ Integración con consentimientos

Ver: `32-gestion-clientes/` y `33-plantillas-consentimiento/`

### Despliegue en Producción (22/01/2026)
- ✅ Sistema desplegado en archivoenlinea.com
- ✅ SSL wildcard configurado
- ✅ Múltiples versiones desplegadas
- ✅ Sistema 100% operativo

Ver: `36-despliegues/` y `40-aws-infraestructura/`
