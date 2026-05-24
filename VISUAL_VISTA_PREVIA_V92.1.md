# 📸 Vista Previa de Consentimientos - Guía Visual

## 🎨 Componente de Vista Previa

### Diseño General

```
┌────────────────────────────────────────────────────────────┐
│ 👁️ Vista Previa del Consentimiento                        │
│ Revisa la información antes de continuar con la firma      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ℹ️ INFORMACIÓN IMPORTANTE                                  │
│ Por favor, revisa cuidadosamente toda la información      │
│ antes de proceder con la firma digital. Una vez firmado,  │
│ el consentimiento será generado y no podrá ser modificado.│
│                                                            │
├────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📄 Consentimiento Informado                            │ │
│ │ Para: Juan Pérez Gómez                                 │ │
│ ├────────────────────────────────────────────────────────┤ │
│ │ Información Básica                                     │ │
│ │ • Paciente: Juan Pérez Gómez                           │ │
│ │ • Servicio: Masaje Terapéutico                         │ │
│ │ • Sede: Sede Principal                                 │ │
│ ├────────────────────────────────────────────────────────┤ │
│ │ Preguntas de Restricciones (5)                         │ │
│ │                                                        │ │
│ │ ✓ ¿Tiene alergias conocidas?                          │ │
│ │   Respuesta: No                                        │ │
│ │                                                        │ │
│ │ ⚠️ ¿Está embarazada? (Crítica)                         │ │
│ │   Respuesta: Sí                                        │ │
│ │                                                        │ │
│ │ ✓ ¿Tiene problemas cardíacos?                         │ │
│ │   Respuesta: No                                        │ │
│ │                                                        │ │
│ │ [Ver todas las preguntas (2 más)]                     │ │
│ ├────────────────────────────────────────────────────────┤ │
│ │ ⚠️ ATENCIÓN: Respuestas Críticas Detectadas            │ │
│ │ El paciente ha respondido afirmativamente a una o más  │ │
│ │ preguntas críticas. Por favor, revisa cuidadosamente.  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ ☑️ He revisado toda la información y confirmo que es      │
│    correcta                                                │
│                                                            │
│    Al marcar esta casilla, confirmas que has leído y      │
│    verificado todos los datos antes de proceder con la    │
│    firma digital.                                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│              [Volver a Editar]  [Continuar a Firma ✓]     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 📋 Flujo Completo - Consentimientos Normales (CN)

### Paso 1: Datos del Cliente
```
┌─────────────────────────────────┐
│ Nuevo Consentimiento            │
├─────────────────────────────────┤
│ ████ ░░░░ ░░░░ ░░░░             │
│ Paso 1 de 4: Datos del Cliente │
├─────────────────────────────────┤
│ Servicio: [Seleccionar ▼]      │
│ Sede: [Seleccionar ▼]          │
│ Nombre: [____________]          │
│ Documento: [____________]       │
│ Email: [____________]           │
│ Teléfono: [____________]        │
│                                 │
│ 📷 [Tomar Foto del Cliente]     │
│                                 │
│         [Continuar →]           │
└─────────────────────────────────┘
```

### Paso 2: Preguntas
```
┌─────────────────────────────────┐
│ Nuevo Consentimiento            │
├─────────────────────────────────┤
│ ████ ████ ░░░░ ░░░░             │
│ Paso 2 de 4: Preguntas          │
├─────────────────────────────────┤
│ ¿Tiene alergias? *              │
│ ( ) Sí  (•) No                  │
│                                 │
│ ¿Está embarazada? (Crítica) *   │
│ (•) Sí  ( ) No                  │
│                                 │
│ Observaciones:                  │
│ [_________________________]     │
│ [_________________________]     │
│                                 │
│    [← Atrás]  [Continuar →]    │
└─────────────────────────────────┘
```

### Paso 3: Vista Previa (NUEVO)
```
┌─────────────────────────────────┐
│ Nuevo Consentimiento            │
├─────────────────────────────────┤
│ ████ ████ ████ ░░░░             │
│ Paso 3 de 4: Vista Previa       │
├─────────────────────────────────┤
│ 👁️ Vista Previa                 │
│                                 │
│ [Ver diseño completo arriba]    │
│                                 │
│ ☑️ He revisado la información   │
│                                 │
│ [Volver] [Continuar a Firma →]  │
└─────────────────────────────────┘
```

### Paso 4: Firma
```
┌─────────────────────────────────┐
│ Nuevo Consentimiento            │
├─────────────────────────────────┤
│ ████ ████ ████ ████             │
│ Paso 4 de 4: Firma              │
├─────────────────────────────────┤
│ Firma del Cliente               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │   [Área de firma]           │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│    [Limpiar]  [Guardar Firma]  │
└─────────────────────────────────┘
```

## 🏥 Flujo Completo - Consentimientos HC

### Formulario Inicial
```
┌─────────────────────────────────────────┐
│ Generar Consentimiento                  │
│ Para: María González                    │
├─────────────────────────────────────────┤
│ Tipo: [Procedimiento ▼]                 │
│                                         │
│ Plantillas HC *                         │
│ ┌─────────────────────────────────────┐ │
│ │ ☑️ Consentimiento General           │ │
│ │ ☑️ Procedimiento Quirúrgico         │ │
│ │ ☐ Tratamiento de Datos              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Procedimiento: [____________]           │
│ Notas: [____________________]           │
│                                         │
│ 📷 Foto (Opcional)                      │
│ ✍️ Firma (Obligatoria)                  │
│                                         │
│     [Cancelar]  [Ver Vista Previa →]   │
└─────────────────────────────────────────┘
```

### Vista Previa HC
```
┌─────────────────────────────────────────┐
│ 👁️ Vista Previa del Consentimiento HC   │
├─────────────────────────────────────────┤
│ ℹ️ Revisa la información...             │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 📄 Consentimiento Informado         │ │
│ │ Para: María González                │ │
│ ├─────────────────────────────────────┤ │
│ │ Información Básica                  │ │
│ │ • Paciente: María González          │ │
│ │ • Tipo: Procedimiento               │ │
│ │ • Procedimiento: Apendicectomía     │ │
│ ├─────────────────────────────────────┤ │
│ │ Plantillas Incluidas (2)            │ │
│ │ ✓ Consentimiento General            │ │
│ │ ✓ Procedimiento Quirúrgico          │ │
│ ├─────────────────────────────────────┤ │
│ │ Notas Adicionales                   │ │
│ │ Paciente en ayunas desde las 8am    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ☑️ He revisado toda la información      │
│                                         │
│   [Volver a Editar]  [Continuar →]     │
└─────────────────────────────────────────┘
```

### Captura de Firma
```
┌─────────────────────────────────────────┐
│ Firma del Paciente                      │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │   [Área de firma digital]           │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│      [Limpiar]  [Guardar Firma]        │
└─────────────────────────────────────────┘
```

## 🎨 Colores y Estilos

### Estados de Preguntas
- ✅ **Normal:** Fondo gris claro (`bg-gray-50`)
- ⚠️ **Crítica con "Sí":** Fondo rojo claro (`bg-red-50 border-red-200`)

### Alertas
- ℹ️ **Información:** Azul (`bg-blue-50 border-blue-200`)
- ⚠️ **Advertencia:** Rojo (`bg-red-50 border-red-200`)

### Botones
- **Volver:** Gris con borde (`border-gray-300 hover:bg-gray-50`)
- **Continuar:** Azul (`bg-blue-600 hover:bg-blue-700`)
- **Deshabilitado:** Opacidad 50% (`opacity-50 cursor-not-allowed`)

## 📱 Responsive

La vista previa es completamente responsive:
- **Desktop:** Diseño de 2 columnas para información básica
- **Tablet:** Diseño de 1 columna
- **Mobile:** Diseño optimizado con scroll vertical

---

**Versión:** 92.1.0  
**Fecha:** 2026-05-01
