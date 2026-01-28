# Plantillas de Consentimiento para Historias Clínicas

## 📚 Índice de Documentación

Este directorio contiene toda la documentación relacionada con la implementación del sistema de plantillas de consentimiento específicas para Historias Clínicas, completamente separadas de las plantillas tradicionales.

### Documentos Disponibles

1. **[00_PROPUESTA_ARQUITECTURA.md](./00_PROPUESTA_ARQUITECTURA.md)**
   - Propuesta arquitectónica completa
   - Modelo de datos
   - Estructura de código
   - Variables disponibles
   - Plan de implementación

2. **[01_IMPLEMENTACION_BACKEND.md](./01_IMPLEMENTACION_BACKEND.md)**
   - Implementación del backend
   - Migración de base de datos
   - Entidades, servicios y controladores
   - Endpoints API
   - Permisos

3. **[02_IMPLEMENTACION_FRONTEND.md](./02_IMPLEMENTACION_FRONTEND.md)**
   - Implementación del frontend
   - Componentes React
   - Página de gestión
   - Integración con HC
   - Navegación

4. **[03_INSTRUCCIONES_PRUEBA.md](./03_INSTRUCCIONES_PRUEBA.md)**
   - Casos de prueba detallados
   - Checklist de verificación
   - Flujos de usuario
   - Validación de permisos

5. **[04_PERMISOS_COMPLETADOS.md](./04_PERMISOS_COMPLETADOS.md)**
   - Integración completa de permisos
   - Configuración de roles
   - Scripts de utilidad
   - Verificación exitosa

6. **[05_PLANTILLAS_GLOBALES.md](./05_PLANTILLAS_GLOBALES.md)**
   - Sistema de plantillas globales
   - Copia automática a nuevos tenants
   - Personalización por tenant
   - Scripts de migración

7. **[RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md)**
   - Resumen general del proyecto
   - Estado actual
   - Métricas
   - Características principales

## 🎯 Resumen Rápido

### ¿Qué es?

Un sistema completo de plantillas de consentimiento específicas para Historias Clínicas, con 38 variables disponibles (vs 14 de plantillas tradicionales), completamente separado del sistema de consentimientos tradicionales.

### ¿Por qué?

- **Separación de contextos**: HC requieren variables específicas del contexto médico
- **Más variables**: 38 variables vs 14 tradicionales
- **Mejor organización**: Categorización por tipo de consentimiento
- **Sin interferencias**: Ambos sistemas coexisten sin conflictos

### ¿Cómo funciona?

1. **Gestión de Plantillas**: Página dedicada para crear/editar plantillas HC
2. **Helper de Variables**: 38 variables agrupadas en 9 categorías
3. **Generación desde HC**: Modal usa automáticamente plantillas HC
4. **PDF Compuesto**: Múltiples plantillas en un solo PDF

## ✅ Estado del Proyecto

| Fase | Estado | Progreso |
|------|--------|----------|
| Fase 1: Backend | ✅ Completado | 100% |
| Fase 2: Frontend | ✅ Completado | 100% |
| Fase 3: Testing | ⏳ Pendiente | 0% |
| Fase 4: Documentación | ⏳ Pendiente | 0% |

**Progreso Total**: 50% (2/4 fases completadas)

## 📊 Métricas

- **Archivos creados**: 22
- **Endpoints API**: 9
- **Componentes React**: 4
- **Páginas React**: 1
- **Permisos nuevos**: 6
- **Plantillas por defecto**: 3
- **Variables disponibles**: 38
- **Categorías**: 4

## 🚀 Inicio Rápido

### 1. Aplicar Migración

```bash
cd backend
node apply-mr-consent-templates-migration.js
node apply-mr-permissions.js
```

### 2. Reiniciar Backend

```bash
npm run start:dev
```

### 3. Acceder al Sistema

```
URL: http://demo-medico.localhost:5173
Usuario: admin@clinicademo.com
Contraseña: Demo123!
```

### 4. Navegar a Plantillas HC

```
Menú lateral → Plantillas HC
```

## 🎨 Características Principales

### Backend

- ✅ Tabla `medical_record_consent_templates`
- ✅ 9 endpoints REST
- ✅ 6 permisos nuevos
- ✅ 3 plantillas por defecto
- ✅ Multi-tenancy
- ✅ Soft delete
- ✅ Auditoría completa

### Frontend

- ✅ Página de gestión completa
- ✅ Filtros múltiples (búsqueda, categoría, estado)
- ✅ Modales de creación/edición
- ✅ Helper de variables con 38 variables
- ✅ Estadísticas en tiempo real
- ✅ Badges de categoría
- ✅ Integración con HC

### Variables

**9 Categorías**:
1. Datos del Paciente (8 variables)
2. Historia Clínica (3 variables)
3. Anamnesis (6 variables)
4. Examen Físico (3 variables)
5. Diagnóstico (3 variables)
6. Procedimiento/Tratamiento (6 variables)
7. Profesional (3 variables)
8. Sede y Empresa (5 variables)
9. Fechas (4 variables)

**Total**: 38 variables

### Categorías de Plantillas

1. **General**: Consentimientos generales de atención
2. **Procedure**: Consentimientos para procedimientos específicos
3. **Treatment**: Consentimientos para tratamientos
4. **Anamnesis**: Consentimientos relacionados con anamnesis

## 🔐 Permisos

| Permiso | Descripción | Admin | Médico | Operador |
|---------|-------------|-------|--------|----------|
| `view_mr_consent_templates` | Ver plantillas HC | ✅ | ✅ | ✅ |
| `create_mr_consent_templates` | Crear plantillas HC | ✅ | ❌ | ❌ |
| `edit_mr_consent_templates` | Editar plantillas HC | ✅ | ❌ | ❌ |
| `delete_mr_consent_templates` | Eliminar plantillas HC | ✅ | ❌ | ❌ |
| `generate_mr_consents` | Generar consentimientos HC | ✅ | ✅ | ✅ |
| `view_mr_consents` | Ver consentimientos HC | ✅ | ✅ | ✅ |

## 📁 Estructura de Archivos

```
backend/
├── src/
│   ├── medical-record-consent-templates/
│   │   ├── entities/
│   │   │   └── mr-consent-template.entity.ts
│   │   ├── dto/
│   │   │   ├── create-mr-consent-template.dto.ts
│   │   │   ├── update-mr-consent-template.dto.ts
│   │   │   └── index.ts
│   │   ├── mr-consent-templates.service.ts
│   │   ├── mr-consent-templates.controller.ts
│   │   └── mr-consent-templates.module.ts
│   └── migrations/
│       └── create-medical-record-consent-templates.sql
├── apply-mr-consent-templates-migration.js
├── add-mr-consent-templates-permissions.sql
└── apply-mr-permissions.js

frontend/
├── src/
│   ├── services/
│   │   └── mr-consent-template.service.ts
│   ├── components/
│   │   └── mr-consent-templates/
│   │       ├── MRVariablesHelper.tsx
│   │       ├── CreateMRTemplateModal.tsx
│   │       └── EditMRTemplateModal.tsx
│   └── pages/
│       └── MRConsentTemplatesPage.tsx

doc/
└── 64-plantillas-hc-separadas/
    ├── 00_PROPUESTA_ARQUITECTURA.md
    ├── 01_IMPLEMENTACION_BACKEND.md
    ├── 02_IMPLEMENTACION_FRONTEND.md
    ├── 03_INSTRUCCIONES_PRUEBA.md
    ├── RESUMEN_EJECUTIVO.md
    └── README.md (este archivo)
```

## 🔄 Flujo de Usuario

### Crear Plantilla HC

```
1. Admin → Plantillas HC
2. Click "Nueva Plantilla HC"
3. Llenar formulario
4. Click "Ver Variables" (opcional)
5. Copiar variables al contenido
6. Click "Crear Plantilla HC"
7. ✅ Plantilla creada
```

### Generar Consentimiento desde HC

```
1. Usuario → Historias Clínicas
2. Abrir HC
3. Click "Generar Consentimiento"
4. Seleccionar plantilla(s) HC
5. Llenar datos adicionales
6. Click "Generar Consentimiento"
7. ✅ PDF generado y vinculado a HC
```

## 🎓 Ventajas

1. **Separación Clara**: Dos sistemas independientes
2. **Variables Específicas**: 38 variables vs 14 tradicionales
3. **Mejor Organización**: Categorización por tipo
4. **Escalabilidad**: Cada sistema evoluciona independientemente
5. **Compatibilidad**: No afecta funcionalidad existente
6. **Flexibilidad**: Diferentes flujos de trabajo
7. **Auditoría**: Trazabilidad completa

## 🐛 Solución de Problemas

### Error: "No hay plantillas HC disponibles"

**Causa**: Migración no aplicada o permisos faltantes

**Solución**:
```bash
cd backend
node apply-mr-consent-templates-migration.js
node apply-mr-permissions.js
```

### Error: "No tienes permiso para ver plantillas HC"

**Causa**: Permisos no asignados al rol

**Solución**:
1. Click en botón de refresh (🔄) en sidebar
2. O cerrar sesión y volver a iniciar

### Plantillas tradicionales aparecen en HC

**Causa**: Modal no actualizado

**Solución**: Verificar que `GenerateConsentModal.tsx` usa `mrConsentTemplateService`

## 📞 Soporte

Para preguntas o problemas:
1. Revisar documentación en este directorio
2. Verificar logs del backend
3. Verificar consola del navegador
4. Contactar al equipo de desarrollo

## 📝 Changelog

### Versión 15.0.10 (2026-01-25)

**Agregado**:
- Sistema completo de plantillas HC
- 38 variables específicas de HC
- Página de gestión con filtros
- Helper de variables
- Modales de creación/edición
- Integración con modal de generación
- 6 permisos nuevos
- 3 plantillas por defecto

**Modificado**:
- Modal de generación de consentimientos desde HC
- Menú de navegación
- Rutas de la aplicación

**Sin Cambios**:
- Sistema de plantillas tradicionales
- Sistema de consentimientos tradicionales
- Funcionalidad existente de HC

---

**Versión**: 15.0.10
**Fecha**: 2026-01-25
**Estado**: ✅ Backend y Frontend Completados
**Siguiente**: Testing y Documentación de Usuario
