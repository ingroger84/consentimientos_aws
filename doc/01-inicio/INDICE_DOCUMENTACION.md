# Índice de Documentación - Sistema de Consentimientos

**Última actualización:** 6 de enero de 2026

---

## 📋 Documentación Principal

### Estado del Sistema
- **[ESTADO_ACTUAL_SISTEMA.md](./ESTADO_ACTUAL_SISTEMA.md)** ⭐
  - Resumen completo del sistema
  - Todas las correcciones implementadas
  - Estado actual de funcionalidades
  - Referencias a documentación detallada

### Inicio Rápido
- **[../INICIO_RAPIDO.md](../INICIO_RAPIDO.md)**
  - Cómo ejecutar el proyecto
  - Requisitos previos
  - Configuración inicial
  - Solución de problemas

- **[../README.md](../README.md)**
  - Descripción general del proyecto
  - Características principales
  - Tecnologías utilizadas
  - Estructura del proyecto

---

## 🏗️ Arquitectura y Diseño

### Multi-Tenant
- **[IMPLEMENTACION_SUBDOMINIOS.md](./IMPLEMENTACION_SUBDOMINIOS.md)**
  - Arquitectura de subdominios
  - Componentes implementados
  - Flujo de autenticación
  - Reglas de acceso

- **[RESUMEN_SUBDOMINIOS.md](./RESUMEN_SUBDOMINIOS.md)**
  - Resumen ejecutivo de subdominios
  - Componentes clave
  - Ejemplos de uso

- **[SISTEMA_MULTITENANT.md](./SISTEMA_MULTITENANT.md)**
  - Diseño multi-tenant
  - Aislamiento de datos
  - Gestión de tenants

### Permisos y Roles
- **[SISTEMA_PERMISOS_ROLES.md](./SISTEMA_PERMISOS_ROLES.md)**
  - Sistema de roles
  - Permisos granulares
  - Validaciones de acceso

- **[PERMISOS_ROLES.md](./PERMISOS_ROLES.md)**
  - Definición de roles
  - Matriz de permisos
  - Casos de uso

---

## 🔧 Correcciones y Mejoras

### Correcciones Críticas
- **[CORRECCION_FINAL_LOGIN_SUBDOMINIOS.md](./CORRECCION_FINAL_LOGIN_SUBDOMINIOS.md)** ⭐ **NUEVO**
  - Corrección completa del login con subdominios
  - Diagnóstico detallado
  - Soluciones aplicadas
  - Verificación y troubleshooting

- **[CORRECCION_CRITICA_AISLAMIENTO_TENANT.md](./CORRECCION_CRITICA_AISLAMIENTO_TENANT.md)**
  - Aislamiento de usuarios y roles
  - Filtrado por tenantId
  - Validaciones de seguridad

- **[CORRECCION_INICIALIZACION_SETTINGS_TENANT.md](./CORRECCION_INICIALIZACION_SETTINGS_TENANT.md)**
  - Inicialización automática de configuración
  - Migración de app_settings
  - Índices únicos parciales

### Correcciones Adicionales
- **[CORRECCION_SETTINGS_TENANT_LOGIN.md](./CORRECCION_SETTINGS_TENANT_LOGIN.md)** ⭐ **NUEVO**
  - Settings por tenant en página de login
  - Detección automática de subdominio
  - Personalización por tenant

- **[CORRECCION_SLUG_TENANT.md](./CORRECCION_SLUG_TENANT.md)**
  - Slug único con soft delete
  - Reutilización de slugs
  - Migración de constraint

- **[CORRECCION_AISLAMIENTO_TENANT.md](./CORRECCION_AISLAMIENTO_TENANT.md)**
  - Primera versión de aislamiento
  - Filtrado básico por tenant

- **[CORRECCION_MULTITENANT.md](./CORRECCION_MULTITENANT.md)**
  - Correcciones generales multi-tenant
  - Ajustes de validaciones

### Solución de Problemas
- **[SOLUCION_ERROR_SUBDOMINIO.md](./SOLUCION_ERROR_SUBDOMINIO.md)**
  - Error de BASE_DOMAIN
  - Verificación de tenants
  - Scripts de diagnóstico

- **[SOLUCION_ERROR_TENANT.md](./SOLUCION_ERROR_TENANT.md)**
  - Errores comunes de tenants
  - Soluciones rápidas

---

## 🚀 Guías de Uso

### Acceso y Autenticación
- **[GUIA_ACCESO_MULTITENANT.md](./GUIA_ACCESO_MULTITENANT.md)**
  - Cómo acceder al sistema
  - URLs por rol
  - Credenciales de ejemplo

- **[ACCESO_RAPIDO_MULTITENANT.md](./ACCESO_RAPIDO_MULTITENANT.md)**
  - Acceso rápido por subdominio
  - Ejemplos prácticos

- **[ACCESO_SISTEMA.md](./ACCESO_SISTEMA.md)**
  - Guía general de acceso
  - Roles y permisos

### Gestión de Tenants
- **[CREAR_TENANT_CON_ADMIN.md](./CREAR_TENANT_CON_ADMIN.md)**
  - Cómo crear un tenant
  - Configuración inicial
  - Usuario administrador

- **[PRUEBA_LOGIN_TENANT.md](./PRUEBA_LOGIN_TENANT.md)**
  - Pruebas de login
  - Verificación de acceso
  - Troubleshooting

### Personalización
- **[PERSONALIZACION_SISTEMA.md](./PERSONALIZACION_SISTEMA.md)**
  - Configuración avanzada
  - Logos y colores
  - Textos personalizables

- **[PERSONALIZACION_PDF_COMPLETA.md](./PERSONALIZACION_PDF_COMPLETA.md)**
  - Personalización de PDFs
  - Plantillas
  - Marca de agua

- **[PERSONALIZACION_AVANZADA_PDF.md](./PERSONALIZACION_AVANZADA_PDF.md)**
  - Opciones avanzadas de PDF
  - Configuración detallada

---

## 🛠️ Desarrollo

### Scripts y Herramientas
- **[USO_TERMINALES_KIRO.md](./USO_TERMINALES_KIRO.md)**
  - Cómo usar terminales de Kiro
  - Iniciar y detener proyecto
  - Comandos útiles

- **[SCRIPTS_EJECUCION.md](./SCRIPTS_EJECUCION.md)**
  - Scripts de inicio/detención
  - Funcionalidades
  - Casos de uso

### Utilidades
- **Scripts de Backend:**
  - `list-tenants.ts` - Listar todos los tenants
  - `check-tenant-user.ts` - Verificar usuarios de un tenant
  - `cleanup-orphan-users.ts` - Limpiar usuarios huérfanos
  - `cleanup-deleted-tenants.ts` - Limpiar datos de tenants eliminados
  - `reset-to-factory.ts` - Reset a estado inicial

### Mantenimiento
- **[RESET_FABRICA.md](./RESET_FABRICA.md)**
  - Cómo resetear el sistema
  - Estado de fábrica
  - Precauciones

---

## 📊 Implementaciones Completadas

### Módulos
- **[MODULOS_COMPLETADOS.md](./MODULOS_COMPLETADOS.md)**
  - Lista de módulos implementados
  - Estado de cada módulo
  - Funcionalidades

### Implementaciones Específicas
- **[IMPLEMENTACION_MULTITENANT_COMPLETADA.md](./IMPLEMENTACION_MULTITENANT_COMPLETADA.md)**
  - Implementación completa multi-tenant
  - Componentes
  - Verificación

- **[IMPLEMENTACION_COMPLETA_FINAL.md](./IMPLEMENTACION_COMPLETA_FINAL.md)**
  - Estado final de implementación
  - Todas las funcionalidades
  - Pruebas realizadas

---

## 🎨 Funcionalidades Específicas

### PDFs y Documentos
- **[PLANTILLAS_PDF.md](./PLANTILLAS_PDF.md)**
  - Plantillas disponibles
  - Personalización
  - Generación

- **[CAMBIOS_3_PDFS.md](./CAMBIOS_3_PDFS.md)**
  - Sistema de 3 PDFs
  - Cambios implementados

- **[CAMBIO_PDF_UNIFICADO.md](./CAMBIO_PDF_UNIFICADO.md)**
  - PDF unificado
  - Ventajas y desventajas

### Captura de Fotos
- **[CAPTURA_FOTO_CLIENTE.md](./CAPTURA_FOTO_CLIENTE.md)**
  - Implementación de cámara
  - Captura de foto del paciente
  - Almacenamiento

- **[RESUMEN_FOTO_CLIENTE.md](./RESUMEN_FOTO_CLIENTE.md)**
  - Resumen de funcionalidad
  - Casos de uso

- **[INICIO_RAPIDO_FOTO.md](./INICIO_RAPIDO_FOTO.md)**
  - Guía rápida de uso
  - Ejemplos

### Sedes y Sucursales
- **[MEJORA_ASIGNACION_SEDES.md](./MEJORA_ASIGNACION_SEDES.md)**
  - Asignación de sedes a usuarios
  - Filtrado por sedes
  - Mejoras implementadas

- **[RESUMEN_MEJORA_SEDES.md](./RESUMEN_MEJORA_SEDES.md)**
  - Resumen de mejoras
  - Beneficios

---

## 📧 Comunicaciones

### Email
- **[EMAILS_MAILHOG.md](./EMAILS_MAILHOG.md)**
  - Configuración de MailHog
  - Pruebas de email
  - Desarrollo local

- **[SOLUCION_PDF_EMAIL.md](./SOLUCION_PDF_EMAIL.md)**
  - Envío de PDFs por email
  - Configuración SMTP
  - Troubleshooting

---

## 🔍 Pruebas y Verificación

### Guías de Prueba
- **[PRUEBA_CORRECCIONES.md](./PRUEBA_CORRECCIONES.md)**
  - Cómo probar correcciones
  - Casos de prueba
  - Resultados esperados

- **[PRUEBA_PERMISOS.md](./PRUEBA_PERMISOS.md)**
  - Pruebas de permisos
  - Validación de roles
  - Casos de prueba

- **[PRUEBA_PERSONALIZACION.md](./PRUEBA_PERSONALIZACION.md)**
  - Pruebas de personalización
  - Verificación de cambios
  - Casos de uso

### Inicio Rápido de Pruebas
- **[INICIO_RAPIDO_CORRECCIONES.md](./INICIO_RAPIDO_CORRECCIONES.md)**
  - Pruebas rápidas de correcciones
  - Verificación básica

- **[INICIO_RAPIDO_PERMISOS.md](./INICIO_RAPIDO_PERMISOS.md)**
  - Pruebas rápidas de permisos
  - Validación de acceso

---

## 📖 Resúmenes Ejecutivos

- **[RESUMEN_CORRECCIONES.md](./RESUMEN_CORRECCIONES.md)**
  - Resumen de todas las correcciones
  - Impacto y beneficios

- **[RESUMEN_EJECUTIVO_CORRECCIONES.md](./RESUMEN_EJECUTIVO_CORRECCIONES.md)**
  - Resumen ejecutivo para gerencia
  - Métricas y resultados

- **[RESUMEN_IMPLEMENTACION_PERMISOS.md](./RESUMEN_IMPLEMENTACION_PERMISOS.md)**
  - Resumen de sistema de permisos
  - Funcionalidades clave

---

## 🎯 Guías Rápidas

### Índices
- **[INDICE_CORRECCIONES.md](./INDICE_CORRECCIONES.md)**
  - Índice de correcciones
  - Orden cronológico
  - Referencias cruzadas

- **[INDICE_PERSONALIZACION_AVANZADA.md](./INDICE_PERSONALIZACION_AVANZADA.md)**
  - Índice de personalización
  - Opciones disponibles
  - Guías relacionadas

### Guías Generales
- **[GUIA_INICIO.md](./GUIA_INICIO.md)**
  - Guía de inicio general
  - Primeros pasos
  - Configuración básica

- **[GUIA_RAPIDA_PERSONALIZACION.md](./GUIA_RAPIDA_PERSONALIZACION.md)**
  - Personalización rápida
  - Opciones más usadas
  - Ejemplos

---

## 🏁 Estado Final

- **[SISTEMA_LISTO.md](./SISTEMA_LISTO.md)**
  - Sistema listo para producción
  - Checklist final
  - Próximos pasos

- **[ESTADO_FINAL_SISTEMA.md](./ESTADO_FINAL_SISTEMA.md)**
  - Estado final completo
  - Todas las funcionalidades
  - Verificación final

---

## 🔗 Enlaces Externos

### Instalación
- **[INSTALACION_DOCKER.md](./INSTALACION_DOCKER.md)**
  - Instalación con Docker
  - docker-compose.yml
  - Configuración

- **[INSTALAR_POSTGRESQL.md](./INSTALAR_POSTGRESQL.md)**
  - Instalación de PostgreSQL
  - Configuración inicial
  - Creación de base de datos

### Mejores Prácticas
- **[MEJORES_PRACTICAS.md](./MEJORES_PRACTICAS.md)**
  - Mejores prácticas de desarrollo
  - Convenciones de código
  - Seguridad

---

## 📝 Notas Importantes

### Documentos Especiales
- **[NOTA_IMPORTANTE_CONFIGURACION.md](./NOTA_IMPORTANTE_CONFIGURACION.md)**
  - Notas críticas de configuración
  - Advertencias
  - Recomendaciones

### Preguntas Frecuentes
- **[CAMBIOS_PREGUNTAS.md](./CAMBIOS_PREGUNTAS.md)**
  - Cambios en preguntas
  - Personalización de formularios

---

## 🎓 Para Nuevos Desarrolladores

### Lectura Recomendada (en orden)

1. **[../README.md](../README.md)** - Descripción general
2. **[../INICIO_RAPIDO.md](../INICIO_RAPIDO.md)** - Cómo ejecutar
3. **[ESTADO_ACTUAL_SISTEMA.md](./ESTADO_ACTUAL_SISTEMA.md)** - Estado actual
4. **[IMPLEMENTACION_SUBDOMINIOS.md](./IMPLEMENTACION_SUBDOMINIOS.md)** - Arquitectura
5. **[USO_TERMINALES_KIRO.md](./USO_TERMINALES_KIRO.md)** - Herramientas
6. **[GUIA_ACCESO_MULTITENANT.md](./GUIA_ACCESO_MULTITENANT.md)** - Cómo usar

### Para Troubleshooting

1. **[CORRECCION_FINAL_LOGIN_SUBDOMINIOS.md](./CORRECCION_FINAL_LOGIN_SUBDOMINIOS.md)** - Problemas de login
2. **[SOLUCION_ERROR_SUBDOMINIO.md](./SOLUCION_ERROR_SUBDOMINIO.md)** - Errores de subdominio
3. **[PRUEBA_CORRECCIONES.md](./PRUEBA_CORRECCIONES.md)** - Cómo probar

---

**Total de documentos:** 60+  
**Última actualización:** 6 de enero de 2026  
**Estado:** ✅ Sistema completamente funcional
