# Documentación: Flujo de Historias Clínicas

## 📚 Índice de Documentos

### 1. [Flujo Completo de HC](./00_FLUJO_COMPLETO_HC.md)
Descripción detallada de cómo funciona el módulo de historias clínicas desde la apertura hasta el cierre, incluyendo:
- Arquitectura y modelo de datos
- Fases del flujo (Apertura, Registro, Cierre)
- Seguridad y auditoría
- Implementación actual

### 2. [Integración con Consentimientos](./01_INTEGRACION_CONSENTIMIENTOS.md)
Guía completa para integrar consentimientos informados con historias clínicas:
- Casos de uso
- Arquitectura de integración
- Implementación backend y frontend
- Flujo de usuario completo

### 3. [Implementación Completada](./02_IMPLEMENTACION_COMPLETADA.md) ✅ NUEVO
Documentación técnica completa de la implementación realizada:
- Resumen ejecutivo
- Funcionalidades implementadas (Backend y Frontend)
- Código completo con explicaciones
- Flujo de usuario
- Auditoría y trazabilidad
- Próximos pasos

### 4. [Instrucciones de Prueba](./03_INSTRUCCIONES_PRUEBA.md) ✅ NUEVO
Guía paso a paso para probar la funcionalidad implementada:
- Pre-requisitos
- Casos de prueba detallados
- Verificación en base de datos
- Problemas comunes y soluciones
- Checklist de pruebas

### 5. [Resumen Visual](./04_RESUMEN_VISUAL_IMPLEMENTACION.md) ✅ NUEVO
Diagramas y visualizaciones de la arquitectura implementada:
- Arquitectura completa
- Flujos de datos
- Modelo relacional
- Estados y transiciones
- Estructura de archivos

### 6. [Changelog](./CHANGELOG.md) ✅ NUEVO
Registro detallado de todos los cambios realizados:
- Versión 1.0.0 (actual)
- Archivos creados/modificados
- Estadísticas
- Versiones futuras planificadas

### 7. [Resumen Ejecutivo](./RESUMEN_EJECUTIVO.md) ⭐ RECOMENDADO
Visión general de la implementación, logros y próximos pasos:
- Objetivo alcanzado
- Funcionalidades implementadas
- Impacto y beneficios
- Arquitectura
- Estado del proyecto
- Recomendaciones

---

## 🎯 Resumen Ejecutivo

### ¿Cómo Funciona Actualmente?

El módulo de historias clínicas implementado sigue este flujo:

```
APERTURA → REGISTRO CLÍNICO → CIERRE
   ↓            ↓                ↓
  HC         Anamnesis        Bloqueo
Activa       Exámenes         Auditoría
           Diagnósticos
           Evoluciones
```

### Componentes Principales

1. **Historia Clínica Principal** (`medical_records`)
   - Número único
   - Estado (activa, cerrada, archivada)
   - Vinculada a cliente y sede

2. **Anamnesis** (`anamnesis`)
   - Motivo de consulta
   - Antecedentes personales y familiares
   - Hábitos y revisión por sistemas

3. **Exámenes Físicos** (`physical_exams`)
   - Signos vitales
   - Examen por sistemas
   - IMC calculado automáticamente

4. **Diagnósticos** (`diagnoses`)
   - Códigos CIE-10
   - Tipo y estado del diagnóstico

5. **Evoluciones** (`evolutions`)
   - Notas en formato SOAP
   - Firma digital opcional

6. **Auditoría** (`medical_record_audit`)
   - Registro completo de todas las acciones
   - Trazabilidad total

### Normativa Cumplida

✅ **Resolución 1995 de 1999** - Historia Clínica
- Registro completo de atención
- Fecha, hora, motivo, diagnóstico, tratamiento

✅ **Ley 1438 de 2011** - Reforma al Sistema de Salud
- Información organizada y accesible

✅ **Ley 1581 de 2012** - Protección de Datos
- Auditoría de accesos
- Seguridad multi-tenant

---

## 🔗 Integración con Consentimientos (Propuesta)

### ¿Por Qué Integrar?

Durante la atención médica, es común necesitar consentimientos informados:
- Antes de procedimientos
- Para tratamiento de datos
- Para uso de imágenes
- Consentimiento general

### Flujo Propuesto

```
HC Abierta → Identificar Necesidad → Generar Consentimiento
                                              ↓
                                    Pre-llenar Datos
                                              ↓
                                    Paciente Firma
                                              ↓
                                    Vincular a HC
                                              ↓
                                    Generar PDF
```

### Beneficios

1. **Flujo Natural**: Sin salir de la HC
2. **Datos Automáticos**: Menos errores
3. **Trazabilidad**: Vínculo directo
4. **Cumplimiento**: Documentación completa
5. **Facilidad**: Todo en un lugar

---

## 📊 Estado Actual

### ✅ Implementado

- [x] Modelo de datos completo
- [x] CRUD de historias clínicas
- [x] Anamnesis
- [x] Exámenes físicos
- [x] Diagnósticos
- [x] Evoluciones
- [x] Auditoría completa
- [x] Seguridad multi-tenant
- [x] Frontend con tabs
- [x] Búsqueda y filtros

### 🔄 Por Implementar

- [x] Integración con consentimientos ✅ COMPLETADO
- [ ] Integración completa con ConsentsService (crear consentimientos reales)
- [ ] Selector de plantillas en modal
- [ ] Firma digital desde HC
- [ ] Búsqueda de códigos CIE-10
- [ ] Prescripción de medicamentos
- [ ] Órdenes médicas
- [ ] Archivos adjuntos
- [ ] Exportación a PDF
- [ ] Firma digital avanzada

---

## 🚀 Cómo Usar

### Para Profesionales de Salud

1. **Crear HC**: Click en "Nueva Historia Clínica"
2. **Registrar Datos**: Agregar anamnesis, exámenes, diagnósticos
3. **Evolucionar**: Agregar notas de evolución
4. **Cerrar**: Cuando la atención finalice

### Para Administradores

1. **Gestionar Permisos**: Asignar permisos por rol
2. **Revisar Auditoría**: Ver quién accedió a qué HC
3. **Generar Reportes**: Estadísticas de atención

---

## 📞 Soporte

Para más información, consulta:
- [Flujo Completo](./00_FLUJO_COMPLETO_HC.md)
- [Integración Consentimientos](./01_INTEGRACION_CONSENTIMIENTOS.md)
- Documentación técnica en `doc/43-historias-clinicas/`

**Fecha**: 2026-01-25  
**Versión**: 15.0.9
