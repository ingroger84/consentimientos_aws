# 📚 Índice Completo de Documentación

**Última actualización:** 2026-01-24

---

## 🗂️ Organización de la Documentación

La documentación está organizada en 42 carpetas temáticas numeradas del 01 al 42.

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
- **Sistema Inteligente de Versionamiento Automático**
- Detección automática de tipo de cambio (MAJOR/MINOR/PATCH)
- Sincronización total de versiones
- Historial detallado de cambios
- Convenciones de commit (Conventional Commits)
- Scripts de gestión y verificación
- [Guía Rápida](./15-versionamiento/GUIA_RAPIDA.md)
- [Sistema Inteligente](./15-versionamiento/SISTEMA_INTELIGENTE.md)
- [Resumen](./15-versionamiento/RESUMEN_SISTEMA_INTELIGENTE.md)

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

- **Total de carpetas**: 42
- **Categorías principales**: 20
- **Última actualización**: 2026-01-24
- **Estado del sistema**: ✅ 100% Operativo en Producción
- **Versión actual**: 13.0.5

---

## 🔗 Enlaces Importantes

### Producción
- **URL Principal**: https://archivoenlinea.com
- **Panel Admin**: https://admin.archivoenlinea.com
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

**Generado:** 2026-01-24  
**Versión del sistema:** 13.0.5


---

### 📋 Gestión de Clientes

#### [32-gestion-clientes/](./32-gestion-clientes/)
- Sistema completo de gestión de clientes
- Integración con consentimientos
- Permisos por rol
- Guía de pruebas

---

### 📄 Plantillas de Consentimiento

#### [33-plantillas-consentimiento/](./33-plantillas-consentimiento/)
- Sistema de plantillas personalizables
- Plantillas predeterminadas
- Gestión por tenant
- Tipos de plantillas (consentimiento, tratamiento de datos, autorización)

---

### 🔐 Sesión Única

#### [34-sesion-unica/](./34-sesion-unica/)
- Sistema de sesión única por usuario
- Cierre automático de sesiones anteriores
- Verificación periódica de sesión
- Seguridad mejorada

---

### 📝 Actualizaciones GitHub

#### [35-actualizaciones-github/](./35-actualizaciones-github/)
- Historial de actualizaciones al repositorio
- Cambios por versión
- Commits y merges
- Documentación de releases

---

### 🚀 Despliegues

#### [36-despliegues/](./36-despliegues/)
- Historial de despliegues en producción
- Despliegues por versión
- Comandos ejecutados
- Verificaciones post-despliegue

---

### 🔧 Correcciones

#### [37-correcciones/](./37-correcciones/)
- Correcciones de bugs
- Fixes de frontend y backend
- Correcciones de dominio y enrutamiento
- Correcciones de facturación
- Correcciones de autenticación

---

### ⚙️ Implementaciones

#### [38-implementaciones/](./38-implementaciones/)
- Nuevas funcionalidades implementadas
- Documentación técnica de features
- Guías de implementación
- Especificaciones técnicas

---

### 🔒 SSL y Certificados

#### [39-ssl-certificados/](./39-ssl-certificados/)
- Configuración de certificados SSL
- Certificados wildcard
- Problemas y soluciones SSL
- Guías de configuración HTTPS

---

### ☁️ AWS e Infraestructura

#### [40-aws-infraestructura/](./40-aws-infraestructura/)
- Configuración de infraestructura AWS
- Seguridad y credenciales
- Optimizaciones de servidor
- Verificación de conexiones

---

### 📊 Análisis y Estados

#### [41-analisis-estados/](./41-analisis-estados/)
- Análisis técnicos del sistema
- Estados actuales
- Resúmenes ejecutivos
- Reportes de progreso

---

### 💡 Soluciones

#### [42-soluciones/](./42-soluciones/)
- Soluciones a problemas comunes
- Instrucciones de troubleshooting
- Workarounds y fixes
- Guías de resolución de problemas

---

### 🌐 Landing Page y Marketing

#### [27-landing-page-saas/](./27-landing-page-saas/)
- Landing page comercial completa
- Sección de planes y precios
- Registro de cuenta tenant desde la landing
- Modal de registro con validaciones
- Envío automático de correo de bienvenida
- Guía de inicio rápido
- Checklist de pruebas completo
- Configuración para dominio datagree.net

**Archivos principales:**
- `README.md` - Documentación completa
- `INICIO_RAPIDO.md` - Guía de inicio rápido
- `GUIA_PRUEBAS.md` - Checklist de pruebas

**Características:**
- ✅ Diseño responsive y moderno
- ✅ 8 secciones informativas
- ✅ 5 planes configurables
- ✅ Toggle mensual/anual
- ✅ Formulario de registro completo
- ✅ Validaciones frontend y backend
- ✅ Correo de bienvenida automático
- ✅ Integración con backend

---

### 🏥 Historias Clínicas

#### [43-historias-clinicas/](./43-historias-clinicas/)
- Módulo completo de historias clínicas
- Gestión de anamnesis y evoluciones
- Firmas digitales
- Exportación a PDF
- Sistema de permisos granular
- Integración con clientes y sedes

**Archivos principales:**
- `00_INDICE_VISUAL.md` - Índice visual del módulo
- `RESUMEN_FINAL.md` - Resumen ejecutivo
- `INSTRUCCIONES_USUARIO.md` - Guía de uso
- `ACTIVACION_EXITOSA.md` - Verificación de activación

**Características:**
- ✅ 7 tablas con auditoría completa
- ✅ 9 endpoints REST
- ✅ 3 páginas frontend (listado, crear, ver)
- ✅ 7 permisos configurables
- ✅ Cierre y firma de historias
- ✅ Exportación a PDF

#### [44-correccion-login-tenant/](./44-correccion-login-tenant/)
- Corrección del login de tenant con logo personalizado
- Implementación de header X-Tenant-Slug
- Configuración de CORS
- Middleware de tenant mejorado

**Problema resuelto:**
- Login mostraba logo genérico en lugar del logo del tenant
- Frontend en subdominio no enviaba información del tenant

**Solución:**
- Header X-Tenant-Slug en todas las peticiones
- Middleware lee header además de subdominio
- CORS configurado para permitir header personalizado

#### [45-categoria-historias-clinicas-permisos/](./45-categoria-historias-clinicas-permisos/)
- Categoría "Historias Clínicas" en Roles y Permisos
- Definición de 7 permisos en constantes del backend
- Configuración de permisos por rol
- Visualización en página de Roles y Permisos

**Archivos principales:**
- `README.md` - Documentación completa
- `RESUMEN_VISUAL.md` - Guía visual
- `INSTRUCCIONES_USUARIO.md` - Instrucciones de uso

**Permisos incluidos:**
- ✅ Ver historias clínicas
- ✅ Crear historias clínicas
- ✅ Editar historias clínicas
- ✅ Eliminar historias clínicas
- ✅ Cerrar historias clínicas
- ✅ Firmar historias clínicas
- ✅ Exportar historias clínicas

---

## 📊 Estadísticas de Documentación

- **Total de carpetas:** 45
- **Última actualización:** 2026-01-24
- **Versión del sistema:** 15.0.3
- **Estado:** ✅ Actualizado

---

## 🔍 Cómo Usar Este Índice

1. **Buscar por categoría:** Usa las secciones temáticas
2. **Buscar por número:** Usa Ctrl+F para buscar "XX-nombre"
3. **Leer README:** Cada carpeta tiene un README.md principal
4. **Seguir enlaces:** Los enlaces te llevan directamente a las carpetas

---

## 📝 Convenciones

- **[XX-nombre/]** - Enlace a carpeta de documentación
- **✅** - Característica implementada y verificada
- **⚠️** - Advertencia o consideración importante
- **📌** - Nota destacada
- **🔧** - Configuración técnica
- **🎯** - Objetivo o resultado esperado

---

#### [46-busqueda-clientes-historias-clinicas/](./46-busqueda-clientes-historias-clinicas/)
- Búsqueda y creación de clientes en historias clínicas
- Integración del componente ClientSearchForm
- Validación automática de duplicados
- Clientes compartidos entre módulos

**Archivos principales:**
- `README.md` - Documentación completa
- `RESUMEN_VISUAL.md` - Guía visual con diagramas
- `GUIA_PRUEBAS.md` - 18 casos de prueba detallados
- `RESUMEN_FINAL.md` - Resumen ejecutivo

**Funcionalidades:**
- ✅ Búsqueda inteligente en tiempo real
- ✅ Creación de clientes inline
- ✅ Validación de duplicados automática
- ✅ Debounce de 500ms
- ✅ Máximo 50 resultados
- ✅ Componente reutilizable

**Beneficios:**
- ✅ 75% más rápido crear HC
- ✅ 100% reducción de duplicados
- ✅ Experiencia consistente
- ✅ Código DRY

---

#### [55-correccion-plantillas-consentimiento/](./55-correccion-plantillas-consentimiento/)
- Corrección de errores al cargar y crear plantillas
- Solución de SyntaxError en navegador
- Limpieza de caché del frontend
- Documentación completa de troubleshooting

**Archivos principales:**
- `README.md` - Análisis completo del problema y solución
- `RESUMEN_VISUAL.md` - Diagramas y flujos visuales
- `INSTRUCCIONES_USUARIO.md` - Guía paso a paso para el usuario
- `CHANGELOG.md` - Registro detallado de cambios

**Problema resuelto:**
- Error "SyntaxError: Unexpected token 'new'"
- Error al cargar plantillas
- Error al crear plantillas predeterminadas

**Solución:**
- Corrección de import path en template.service.ts
- Script de limpieza de caché (fix-frontend-cache.ps1)
- Instrucciones para limpiar caché del navegador

**Funcionalidades verificadas:**
- ✅ Listar plantillas
- ✅ Crear plantillas
- ✅ Editar plantillas
- ✅ Eliminar plantillas
- ✅ Inicializar plantillas predeterminadas
- ✅ Sistema de variables dinámicas

---

## 📊 Estadísticas de Documentación

- **Total de carpetas:** 55
- **Última actualización:** 2026-01-25
- **Versión del sistema:** 15.0.9
- **Estado:** ✅ Actualizado

---

### 🔧 Correcciones y Mejoras Recientes de HC (2026-01-26)

#### [66-logos-separados-cn-hc/](./66-logos-separados-cn-hc/)
- Separación de logos para Consentimientos Normales y Historias Clínicas
- Configuración independiente de logos HC
- Fallback automático a logos CN si no hay logos HC configurados

**Archivos principales:**
- `README.md` - Documentación completa
- `RESUMEN_VISUAL.md` - Guía visual
- `COMPLETADO.md` - Verificación final

**Funcionalidades:**
- ✅ Logo principal HC independiente
- ✅ Logo footer HC independiente
- ✅ Marca de agua HC independiente
- ✅ Fallback automático a logos CN

---

#### [67-firma-digital-hc/](./67-firma-digital-hc/)
- Implementación de firma digital en consentimientos HC
- Captura de firma con canvas
- Captura de foto del paciente con cámara
- Integración en PDF

**Archivos principales:**
- `README.md` - Documentación completa
- `RESUMEN_VISUAL.md` - Guía visual
- `INSTRUCCIONES_PRUEBA.md` - Guía de pruebas
- `COMPLETADO.md` - Verificación final

**Funcionalidades:**
- ✅ Canvas de firma con botón limpiar
- ✅ Captura de foto con cámara
- ✅ Vista previa de firma y foto
- ✅ Integración en PDF con cajas de 120x120

---

#### [71-mejoras-pdf-hc/](./71-mejoras-pdf-hc/)
- Mejoras en el diseño del PDF de consentimientos HC
- Header azul con logo circular
- Títulos con fondo naranja
- Uso de logos HC configurados

**Archivos principales:**
- `README.md` - Documentación completa
- `RESUMEN_VISUAL.md` - Guía visual
- `CORRECCION_FINAL.md` - Verificación final

**Mejoras:**
- ✅ Header azul mejorado
- ✅ Logo circular en header
- ✅ Títulos con fondo naranja (#F59E0B)
- ✅ Usa configuración de Logos HC

---

#### [73-correccion-permisos-operador-hc/](./73-correccion-permisos-operador-hc/)
- Corrección de permisos del rol Operador en plantillas HC
- Removido permiso de eliminar plantillas HC
- Permisos correctos: ver, crear, editar (NO eliminar)

**Archivos principales:**
- `README.md` - Documentación completa
- `SOLUCION_FINAL.md` - Solución implementada

**Corrección:**
- ✅ Removido `delete_mr_consent_templates` del Operador
- ✅ Permisos correctos aplicados
- ✅ Sesiones limpiadas para aplicar cambios

---

#### [74-remover-eliminar-consents-operador/](./74-remover-eliminar-consents-operador/)
- Removido permiso de eliminar consentimientos HC del Operador
- Solo Administradores pueden eliminar consentimientos
- Operador puede: ver vista previa y reenviar email

**Archivos principales:**
- `README.md` - Documentación completa

**Corrección:**
- ✅ Removido `delete:medical-record-consents` del Operador
- ✅ Solo Administradores pueden eliminar
- ✅ Sesiones limpiadas

---

#### [75-ajuste-footer-firma-pdf/](./75-ajuste-footer-firma-pdf/)
- Ajuste de espaciado entre firma y footer en PDF HC
- Firma y foto más separadas del footer
- Footer bien posicionado en la parte inferior

**Archivos principales:**
- `README.md` - Documentación completa

**Ajustes:**
- ✅ Espacio después de firma: 30 → 50 puntos
- ✅ Footer desde abajo: 30 → 40 puntos
- ✅ Tamaño de fuente footer: 8 → 9 puntos

---

#### [76-ajuste-firma-footer-final/](./76-ajuste-firma-footer-final/)
- Ajuste final de posicionamiento de firma y footer
- Firma y foto mucho más arriba
- Mayor separación del footer

**Archivos principales:**
- `README.md` - Documentación completa

**Ajustes:**
- ✅ Espacio mínimo: 200 → 280 puntos desde abajo (+80)
- ✅ Espacio después de firma: 50 → 80 puntos (+30)
- ✅ Footer: 40 → 50 puntos desde abajo (+10)
- ✅ Total: +120 puntos de espacio adicional

---

#### [77-correccion-sobreposicion-texto/](./77-correccion-sobreposicion-texto/) ⭐ NUEVO
- Corrección de sobreposición de texto en PDF HC
- Espacio adicional entre contenido y firma
- Título "FIRMA Y CONSENTIMIENTO" bien separado

**Archivos principales:**
- `README.md` - Documentación completa
- `RESUMEN_VISUAL.md` - Guía visual detallada
- `INSTRUCCIONES_PRUEBA.md` - Guía de pruebas paso a paso

**Problema resuelto:**
- El texto del contenido (Historia Clínica, Fecha de admisión) se sobreponía con el título "FIRMA Y CONSENTIMIENTO"

**Solución:**
- ✅ Espacio después del contenido: +40 puntos
- ✅ Espacio antes del título de firma: +50 puntos
- ✅ Total de espacio adicional: 90 puntos
- ✅ Sin sobreposición de textos
- ✅ Diseño profesional y legible

**Estado:**
- ✅ Código implementado
- ✅ Sin errores de compilación
- ✅ Backend corriendo
- ✅ Frontend corriendo
- ⏳ Pendiente de prueba por usuario

---

## 📊 Estadísticas de Documentación Actualizadas

- **Total de carpetas:** 77+
- **Última actualización:** 2026-01-26
- **Versión del sistema:** 15.0.10
- **Estado:** ✅ Actualizado

---

## 🎯 Resumen de Sesión 2026-01-26

### Correcciones Implementadas Hoy

1. ✅ **Permisos del Operador** - Corregidos permisos en plantillas y consentimientos HC
2. ✅ **Ajustes de PDF** - Múltiples ajustes de espaciado en firma y footer
3. ✅ **Corrección de Sobreposición** - Solución final para sobreposición de texto

### Archivos Modificados

- `backend/src/medical-records/medical-records-pdf.service.ts` - Ajustes de espaciado
- `backend/fix-operador-permissions.js` - Script de corrección de permisos
- `backend/remove-delete-consent-from-operador.js` - Script de remoción de permisos

### Documentación Creada

- 3 carpetas nuevas de documentación (75, 76, 77)
- 10+ archivos de documentación
- Guías visuales y de pruebas
- Resúmenes ejecutivos

---

## 📝 Próximos Pasos

1. ⏳ **Probar corrección de sobreposición** - Generar nuevo consentimiento HC
2. ⏳ **Verificar espaciado** - Confirmar que no hay sobreposición
3. ⏳ **Validar con usuario** - Obtener aprobación final

---
