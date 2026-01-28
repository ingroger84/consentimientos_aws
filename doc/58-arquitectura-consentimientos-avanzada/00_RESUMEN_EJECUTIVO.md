# 🎯 Arquitectura Avanzada de Consentimientos - Resumen Ejecutivo

**Fecha:** 25 de enero de 2026  
**Versión:** 1.0  
**Estado:** 📋 Propuesta

## 🎯 Objetivo

Diseñar e implementar un sistema robusto, flexible y escalable de consentimientos informados que permita:

1. **Múltiples consentimientos en un solo PDF**
2. **Personalización completa por tenant**
3. **Gestión de preguntas, respuestas y firmas**
4. **Captura de foto del cliente**
5. **Vinculación con servicios e historias clínicas**
6. **Cumplimiento normativo colombiano**

## 📊 Arquitectura Propuesta

### Modelo de Datos (3 Capas)

```
┌─────────────────────────────────────────────────────┐
│  CAPA 1: PLANTILLAS (Templates)                    │
│  - Contenido reutilizable                          │
│  - Variables dinámicas                             │
│  - Tipos de consentimiento                         │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  CAPA 2: CONFIGURACIÓN (Consent Configs)           │
│  - Composición de plantillas                       │
│  - Preguntas personalizadas                        │
│  - Orden y estructura                              │
│  - Vinculación con servicios                       │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  CAPA 3: INSTANCIAS (Consents)                     │
│  - Consentimiento firmado                          │
│  - Respuestas del cliente                          │
│  - Firmas digitales                                │
│  - PDF generado                                    │
└─────────────────────────────────────────────────────┘
```

## 🗂️ Estructura de Base de Datos

### Tablas Principales

1. **consent_templates** (Ya existe)
   - Plantillas de texto reutilizables
   - Variables dinámicas
   - Tipos de consentimiento

2. **consent_configs** (Nueva)
   - Configuración de consentimientos compuestos
   - Orden de plantillas
   - Preguntas personalizadas
   - Vinculación con servicios

3. **consent_questions** (Nueva)
   - Preguntas configurables
   - Tipos de respuesta
   - Validaciones

4. **consents** (Ya existe, mejorar)
   - Instancia de consentimiento firmado
   - Estado del consentimiento
   - PDF generado

5. **consent_responses** (Nueva)
   - Respuestas del cliente
   - Vinculación con preguntas

6. **consent_signatures** (Nueva)
   - Firmas digitales
   - Metadata de firma
   - Imágenes de firma

7. **consent_photos** (Nueva)
   - Fotos del cliente
   - Metadata de captura

## 🎨 Flujo de Usuario

### Fase 1: Configuración (Admin/Operador)

```
1. Crear/Editar Plantillas
   ↓
2. Crear Configuración de Consentimiento
   - Seleccionar plantillas
   - Definir orden
   - Agregar preguntas
   - Configurar opciones
   ↓
3. Vincular con Servicios/HC
```

### Fase 2: Generación (Operador)

```
1. Seleccionar Cliente
   ↓
2. Seleccionar Configuración de Consentimiento
   ↓
3. Pre-visualizar PDF
   ↓
4. Enviar al Cliente
```

### Fase 3: Firma (Cliente)

```
1. Cliente recibe link/QR
   ↓
2. Lee consentimiento
   ↓
3. Responde preguntas
   ↓
4. Captura foto (opcional)
   ↓
5. Firma digitalmente
   ↓
6. PDF final generado
```

## 📋 Documentos en Esta Carpeta

1. **00_RESUMEN_EJECUTIVO.md** (este archivo)
2. **01_MODELO_DATOS.md** - Estructura de base de datos
3. **02_ARQUITECTURA_BACKEND.md** - Servicios y controladores
4. **03_ARQUITECTURA_FRONTEND.md** - Componentes y flujos
5. **04_GENERACION_PDF.md** - Sistema de PDFs compuestos
6. **05_FIRMAS_DIGITALES.md** - Implementación de firmas
7. **06_PLAN_IMPLEMENTACION.md** - Fases y tareas
8. **07_EJEMPLOS_USO.md** - Casos de uso prácticos

## 🚀 Beneficios Clave

### Para el Tenant
- ✅ Personalización completa
- ✅ Múltiples consentimientos en un PDF
- ✅ Preguntas personalizadas
- ✅ Cumplimiento normativo

### Para el Operador
- ✅ Proceso simplificado
- ✅ Reutilización de plantillas
- ✅ Generación rápida
- ✅ Trazabilidad completa

### Para el Cliente
- ✅ Proceso digital
- ✅ Firma desde cualquier dispositivo
- ✅ Copia automática por email
- ✅ Experiencia moderna

## 📊 Comparación con Sistema Actual

| Característica | Actual | Propuesto |
|----------------|--------|-----------|
| Plantillas | ✅ Básico | ✅ Avanzado |
| Múltiples en PDF | ❌ No | ✅ Sí |
| Preguntas | ❌ No | ✅ Sí |
| Firmas | ✅ Básico | ✅ Avanzado |
| Fotos | ❌ No | ✅ Sí |
| Vinculación HC | ⚠️ Parcial | ✅ Completo |
| Vinculación Servicios | ❌ No | ✅ Sí |
| PDF Compuesto | ❌ No | ✅ Sí |

## ⏱️ Estimación de Implementación

### Fase 1: Base (2-3 semanas)
- Modelo de datos
- Backend básico
- Frontend básico

### Fase 2: Avanzado (2-3 semanas)
- PDF compuesto
- Preguntas dinámicas
- Firmas avanzadas

### Fase 3: Integración (1-2 semanas)
- Vinculación con HC
- Vinculación con Servicios
- Pruebas completas

**Total: 5-8 semanas**

## 🎯 Próximos Pasos

1. Revisar y aprobar arquitectura propuesta
2. Priorizar funcionalidades
3. Definir MVP (Producto Mínimo Viable)
4. Iniciar implementación por fases

---

**Nota:** Esta es una propuesta completa. Se puede implementar por fases según prioridades y recursos disponibles.
