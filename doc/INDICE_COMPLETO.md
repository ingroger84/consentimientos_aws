# 📚 Índice Completo de Documentación

**Última actualización:** 2026-01-21

---

## 🗂️ Organización de la Documentación

La documentación está organizada en 28 carpetas temáticas numeradas del 01 al 28.

---

## 📑 Índice por Categorías

### 🚀 Inicio y Configuración Básica

#### [01-inicio/](./01-inicio/)
- Guías de inicio rápido
- Instalación y configuración inicial
- Estado actual del sistema
- Acceso y credenciales
- Mejores prácticas

#### [10-scripts/](./10-scripts/)
- Scripts de utilidad
- Reset a fábrica
- Docker compose
- Uso de terminales

---

### 🏢 Arquitectura Multi-Tenant

#### [02-multitenant/](./02-multitenant/)
- Implementación de subdominios
- Gestión de tenants
- Agrupación de recursos por tenant
- Pruebas de login multi-tenant

#### [03-permisos/](./03-permisos/)
- Roles y permisos
- Configuración de permisos por rol
- Pruebas de permisos

#### [05-limites/](./05-limites/)
- Control de límites de recursos
- Notificaciones de límites
- Métricas de consumo

#### [06-impersonation/](./06-impersonation/)
- Magic links
- Acceso de Super Admin a tenants
- Pruebas de impersonación

---

### 🎨 Personalización y UI

#### [04-personalizacion/](./04-personalizacion/)
- Personalización de PDFs
- Plantillas y configuración
- Captura de foto del cliente

#### [20-favicon-personalizado/](./20-favicon-personalizado/)
- Favicon dinámico por tenant
- Carga desde S3
- Guía de pruebas

#### [26-mejoras-ui/](./26-mejoras-ui/)
- Favicon implementado
- Branding en emails
- Footer personalizado

---

### 💰 Sistema de Facturación

#### [14-impuestos/](./14-impuestos/)
- Configuración de IVA
- Retención en la fuente
- Impuestos adicionales
- Exención de impuestos

#### [16-nombres-planes/](./16-nombres-planes/)
- Corrección de nombres de planes
- Actualización de dashboard

#### [17-facturacion-manual/](./17-facturacion-manual/)
- Creación de facturas manuales
- Impuestos dinámicos
- Ejemplos de uso

#### [18-pago-facturas-tenant/](./18-pago-facturas-tenant/)
- Sistema de pago de facturas
- Integración con Bold
- Botón "Pagar Ahora"

#### [25-facturacion-automatizada/](./25-facturacion-automatizada/)
- Mejoras del módulo de facturación
- Dashboard optimizado
- Marquesina de recordatorio de pago
- Fechas de facturación
- Sistema de impuestos completo

---

### 💳 Integración de Pagos (Bold)

#### [22-integracion-bold/](./22-integracion-bold/)
- Configuración técnica de Bold
- Webhooks
- Guía de pruebas
- Configuración localhost

#### [24-integracion-bold-completa/](./24-integracion-bold-completa/)
- Estado final de Bold
- Configuración completa
- Integración con facturas de tenants
- Resúmenes de implementación

---

### 📧 Correos Electrónicos

#### [07-correos/](./07-correos/)
- Configuración de Gmail/Google Workspace
- Correos de bienvenida
- Reset de contraseña
- Solución de errores

#### [21-correccion-email-s3/](./21-correccion-email-s3/)
- URLs correctas en correos
- Visualización de archivos adjuntos

---

### ☁️ AWS y Almacenamiento

#### [19-aws-s3-storage/](./19-aws-s3-storage/)
- Configuración de S3
- Migración de archivos
- Corrección de ACL
- Verificación completa

#### [23-despliegue-aws/](./23-despliegue-aws/)
- Guía de despliegue en AWS Lightsail
- Configuración de servidor Ubuntu
- Certificado SSL wildcard
- CRON jobs habilitados
- Verificación completa del sistema

---

### 🔧 Configuración y Mantenimiento

#### [15-versionamiento/](./15-versionamiento/)
- Versionamiento automático
- Configuración de hooks
- Ejemplos de uso

#### [27-configuracion-sistema/](./27-configuracion-sistema/)
- Correcciones de S3
- Configuración de correo
- Versionamiento automático
- Configuraciones técnicas

---

### 📊 Dashboard y Estadísticas

#### [09-dashboard/](./09-dashboard/)
- Dashboard de Super Admin
- Funcionalidades interactivas
- Estadísticas y métricas

---

### 🔨 Correcciones y Fixes

#### [08-correcciones/](./08-correcciones/)
- Correcciones de aislamiento multi-tenant
- Fixes de permisos
- Correcciones de settings
- Historial de correcciones

---

### 📝 Resúmenes y Estado

#### [28-resumen-sesiones/](./28-resumen-sesiones/)
- Resumen de sesión 20260120
- Estado del sistema
- Documentación de progreso

---

## 🔍 Búsqueda Rápida por Tema

### Despliegue y Producción
- **Despliegue AWS**: `23-despliegue-aws/`
- **Verificación del sistema**: `23-despliegue-aws/VERIFICACION_SISTEMA_COMPLETA_20260121.md`
- **SSL/HTTPS**: `23-despliegue-aws/CERTIFICADO_WILDCARD_CONFIGURADO.md`
- **CRON Jobs**: `23-despliegue-aws/CRON_JOBS_HABILITADOS.md`

### Facturación y Pagos
- **Facturación automatizada**: `25-facturacion-automatizada/`
- **Marquesina de pago**: `25-facturacion-automatizada/RECORDATORIO_PAGO_MARQUESINA_20260120.md`
- **Integración Bold**: `24-integracion-bold-completa/`
- **Impuestos**: `14-impuestos/`

### Multi-Tenant
- **Sistema multi-tenant**: `02-multitenant/`
- **Permisos**: `03-permisos/`
- **Límites de recursos**: `05-limites/`
- **Impersonación**: `06-impersonation/`

### Personalización
- **PDFs personalizados**: `04-personalizacion/`
- **Favicon**: `20-favicon-personalizado/`
- **Branding**: `26-mejoras-ui/`

### Almacenamiento
- **AWS S3**: `19-aws-s3-storage/`
- **Correcciones S3**: `27-configuracion-sistema/`

### Correos
- **Configuración SMTP**: `07-correos/`
- **Correos con S3**: `21-correccion-email-s3/`

---

## 📈 Documentación Reciente (Enero 2026)

### 21/01/2026 - Despliegue en Producción
- ✅ Sistema desplegado en AWS Lightsail (datagree.net)
- ✅ SSL wildcard configurado
- ✅ CRON jobs habilitados
- ✅ Sistema 100% operativo

**Ver:** `23-despliegue-aws/`

### 20/01/2026 - Facturación Automatizada
- ✅ Marquesina de recordatorio (5 días antes)
- ✅ Botón "Pagar Ahora" con Bold
- ✅ Dashboard optimizado
- ✅ Sistema de impuestos completo

**Ver:** `25-facturacion-automatizada/`

### 20/01/2026 - Integración Bold Completa
- ✅ Links de pago automáticos
- ✅ Webhooks configurados
- ✅ Pagos desde facturas

**Ver:** `24-integracion-bold-completa/`

---

## 🎯 Guías de Inicio Rápido

### Para Desarrolladores Nuevos
1. Lee `01-inicio/INICIO_RAPIDO.md`
2. Revisa `01-inicio/ESTADO_ACTUAL_SISTEMA.md`
3. Consulta `01-inicio/MEJORES_PRACTICAS.md`

### Para Configurar el Sistema
1. Instalación: `01-inicio/INSTALACION_DOCKER.md`
2. Multi-tenant: `02-multitenant/SISTEMA_MULTITENANT.md`
3. Permisos: `03-permisos/`
4. Correos: `07-correos/`

### Para Desplegar en Producción
1. Guía completa: `23-despliegue-aws/DESPLIEGUE_AWS_DATAGREE.md`
2. Verificación: `23-despliegue-aws/VERIFICACION_SISTEMA_COMPLETA_20260121.md`

### Para Configurar Facturación
1. Impuestos: `14-impuestos/`
2. Facturación manual: `17-facturacion-manual/`
3. Pagos Bold: `22-integracion-bold/`
4. Automatización: `25-facturacion-automatizada/`

---

## 📊 Estadísticas de Documentación

- **Total de carpetas**: 28
- **Categorías principales**: 10
- **Última actualización**: 2026-01-21
- **Estado del sistema**: ✅ 100% Operativo en Producción

---

## 🔗 Enlaces Importantes

### Producción
- **URL Principal**: https://datagree.net
- **Panel Admin**: https://admin.datagree.net
- **Servidor**: 100.28.198.249

### Repositorio
- **GitHub**: git@github.com:ingroger84/consentimientos_aws.git

### Servicios Externos
- **AWS S3**: datagree-uploads
- **Bold API**: https://sandbox-api.bold.co/v1
- **SMTP**: Gmail (info@innovasystems.com.co)

---

## 📞 Soporte

Para más información, consulta:
- `README.md` en la raíz del proyecto
- `doc/README.md` para navegación de carpetas
- `01-inicio/INDICE_DOCUMENTACION.md` para índice detallado

---

**Generado:** 2026-01-21  
**Versión del sistema:** 1.1.2
