# 📚 Guía de Documentación del Proyecto

## Convención de Ubicación de Archivos

**IMPORTANTE**: Toda la documentación debe guardarse en carpetas temáticas dentro de `doc/`, NO en la raíz del proyecto.

## Estructura de Carpetas

El proyecto tiene 42 carpetas de documentación organizadas por temas:

### 📁 Carpetas 01-34: Funcionalidades y Módulos
Documentación de funcionalidades específicas del sistema.

### 📁 Carpetas 35-42: Documentación de Proceso
Documentación de actualizaciones, despliegues, correcciones, etc.

## Dónde Guardar Nueva Documentación

### Actualizaciones de GitHub
**Ubicación**: `doc/35-actualizaciones-github/`
- Archivos de actualizaciones al repositorio
- Cambios por versión
- Commits importantes

**Ejemplo**: `ACTUALIZACION_GITHUB_20260124_v13.1.0.md`

### Despliegues
**Ubicación**: `doc/36-despliegues/`
- Documentación de despliegues en producción
- Comandos ejecutados
- Verificaciones realizadas

**Ejemplo**: `DESPLIEGUE_VERSION_13.1.0_20260124.md`

### Correcciones
**Ubicación**: `doc/37-correcciones/`
- Correcciones de bugs
- Fixes de problemas
- Soluciones a errores

**Ejemplo**: `CORRECCION_PROBLEMA_X_20260124.md`

### Implementaciones
**Ubicación**: `doc/38-implementaciones/`
- Nuevas funcionalidades
- Features implementadas
- Documentación técnica

**Ejemplo**: `IMPLEMENTACION_FEATURE_X_20260124.md`

### SSL y Certificados
**Ubicación**: `doc/39-ssl-certificados/`
- Configuración de SSL
- Certificados
- Problemas HTTPS

**Ejemplo**: `CONFIGURACION_SSL_X_20260124.md`

### AWS e Infraestructura
**Ubicación**: `doc/40-aws-infraestructura/`
- Configuración de servidor
- Infraestructura AWS
- Optimizaciones

**Ejemplo**: `CONFIGURACION_AWS_X_20260124.md`

### Análisis y Estados
**Ubicación**: `doc/41-analisis-estados/`
- Análisis técnicos
- Estados del sistema
- Resúmenes ejecutivos

**Ejemplo**: `ANALISIS_X_20260124.md`

### Soluciones
**Ubicación**: `doc/42-soluciones/`
- Soluciones a problemas comunes
- Instrucciones de troubleshooting
- Guías de resolución

**Ejemplo**: `SOLUCION_PROBLEMA_X_20260124.md`

## Convención de Nombres

### Formato de Nombres de Archivo
```
TIPO_DESCRIPCION_YYYYMMDD.md
```

**Ejemplos**:
- `IMPLEMENTACION_NOTIFICACIONES_20260124.md`
- `CORRECCION_LOGIN_20260124.md`
- `DESPLIEGUE_VERSION_14.0.0_20260124.md`
- `ACTUALIZACION_GITHUB_20260124_v14.0.0.md`

### Tipos Comunes
- `IMPLEMENTACION_` - Nueva funcionalidad
- `CORRECCION_` - Fix de bug
- `DESPLIEGUE_` - Despliegue en producción
- `ACTUALIZACION_` - Actualización de GitHub
- `CONFIGURACION_` - Configuración de sistema
- `SOLUCION_` - Solución a problema
- `ANALISIS_` - Análisis técnico
- `ESTADO_` - Estado del sistema
- `RESUMEN_` - Resumen ejecutivo
- `GUIA_` - Guía de uso

## Archivos que SÍ van en la Raíz

Solo estos archivos deben estar en la raíz del proyecto:

1. **README.md** - Documentación principal del proyecto
2. **VERSION.md** - Versión actual del sistema
3. **ESTRUCTURA_PROYECTO.md** - Estructura del proyecto
4. **CREDENCIALES.md** - Credenciales de acceso
5. **Estrategia_Versionamiento_SaaS.docx** - Documento de estrategia

## Proceso de Documentación

### 1. Crear Nuevo Documento
```bash
# Crear en la carpeta correspondiente
touch doc/37-correcciones/CORRECCION_X_20260124.md
```

### 2. Estructura del Documento
```markdown
# Título del Documento
**Fecha**: YYYY-MM-DD
**Versión**: X.X.X

## Descripción
Breve descripción del contenido

## Problema/Objetivo
Descripción del problema o objetivo

## Solución/Implementación
Detalles de la solución o implementación

## Archivos Modificados
- archivo1.ts
- archivo2.tsx

## Pruebas Realizadas
- Prueba 1
- Prueba 2

## Resultado
Resultado final y conclusiones
```

### 3. Actualizar Índices
Después de crear documentación importante, actualizar:
- `doc/README.md` - Si es una nueva categoría
- `doc/INDICE_COMPLETO.md` - Si es un cambio mayor

## Búsqueda de Documentación

### Por Tema
Consulta el `doc/README.md` para ver todas las carpetas disponibles.

### Por Fecha
Los archivos están nombrados con fecha YYYYMMDD al final.

### Por Tipo
Usa el prefijo del nombre del archivo (IMPLEMENTACION_, CORRECCION_, etc.)

## Mantenimiento

### Limpieza Periódica
- Revisar documentación obsoleta cada 3 meses
- Archivar documentación antigua si es necesario
- Mantener solo documentación relevante

### Actualización de Índices
- Actualizar `doc/INDICE_COMPLETO.md` mensualmente
- Actualizar `doc/README.md` cuando se agreguen carpetas nuevas

## Ejemplos de Uso

### Ejemplo 1: Documentar una Corrección
```bash
# 1. Crear archivo en carpeta de correcciones
touch doc/37-correcciones/CORRECCION_CACHE_NAVEGADOR_20260124.md

# 2. Escribir documentación
# 3. Commit con mensaje descriptivo
git add doc/37-correcciones/CORRECCION_CACHE_NAVEGADOR_20260124.md
git commit -m "docs: Corrección de cache del navegador"
```

### Ejemplo 2: Documentar una Implementación
```bash
# 1. Crear archivo en carpeta de implementaciones
touch doc/38-implementaciones/IMPLEMENTACION_CHAT_TIEMPO_REAL_20260124.md

# 2. Escribir documentación técnica completa
# 3. Commit con mensaje descriptivo
git add doc/38-implementaciones/IMPLEMENTACION_CHAT_TIEMPO_REAL_20260124.md
git commit -m "docs: Implementación de chat en tiempo real"
```

### Ejemplo 3: Documentar un Despliegue
```bash
# 1. Crear archivo en carpeta de despliegues
touch doc/36-despliegues/DESPLIEGUE_VERSION_14.0.0_20260124.md

# 2. Documentar proceso de despliegue
# 3. Commit con mensaje descriptivo
git add doc/36-despliegues/DESPLIEGUE_VERSION_14.0.0_20260124.md
git commit -m "docs: Despliegue versión 14.0.0"
```

## Beneficios de Esta Estructura

1. ✅ **Organización clara**: Fácil encontrar documentación
2. ✅ **Raíz limpia**: Solo archivos esenciales en la raíz
3. ✅ **Búsqueda rápida**: Carpetas temáticas
4. ✅ **Mantenibilidad**: Fácil de mantener y actualizar
5. ✅ **Escalabilidad**: Puede crecer sin desorganizarse
6. ✅ **Historial**: Nombres con fecha para tracking

## Preguntas Frecuentes

### ¿Dónde documento una nueva feature?
En `doc/38-implementaciones/`

### ¿Dónde documento un bug fix?
En `doc/37-correcciones/`

### ¿Dónde documento un despliegue?
En `doc/36-despliegues/`

### ¿Dónde documento cambios de infraestructura?
En `doc/40-aws-infraestructura/`

### ¿Puedo crear una carpeta nueva?
Sí, pero consulta primero si alguna carpeta existente es apropiada. Si creas una nueva, actualiza los índices.

---

**Última actualización**: 2026-01-24  
**Versión del sistema**: 13.1.0
