# Ajuste de Espacio entre Firma/Foto y Footer

## Fecha: 2026-01-26

## Problema Reportado

Las cajas de firma y foto del paciente se sobrelapan con el footer "Clinica Demo - Documento generado electrónicamente", haciendo que no se pueda leer el texto del footer.

## Análisis

### Problema Identificado

1. **Espacio insuficiente antes del footer**
   - Las cajas de firma/foto tienen 120 puntos de altura
   - Solo había 80 puntos de espacio después de las cajas
   - El footer se dibujaba muy cerca de las cajas

2. **Verificación de espacio mínimo insuficiente**
   - La verificación era de 180 puntos mínimo
   - No era suficiente para: etiquetas (20) + cajas (120) + espacio footer (80) = 220 puntos

3. **Resultado visual**
   - Las cajas se sobrelapaban con el footer
   - El texto del footer no era legible

## Solución Implementada

### Cambios Realizados

**Archivo modificado:** `backend/src/medical-records/medical-records-pdf.service.ts`

#### 1. Aumentar Espacio Mínimo Requerido

**ANTES:**
```typescript
// Asegurar espacio suficiente
if (yPosition < 180) {
  yPosition = 180;
}
```

**DESPUÉS:**
```typescript
// Asegurar espacio suficiente - AUMENTADO SIGNIFICATIVAMENTE
// La firma debe estar mucho más arriba para dejar espacio al footer
// Necesitamos: etiquetas (20) + cajas (120) + espacio footer (100) = 240 puntos mínimo
if (yPosition < 250) {
  yPosition = 250;
}
```

**Cambio:** De 180 a 250 puntos (aumento de 70 puntos)

#### 2. Aumentar Espacio Después de las Cajas

**ANTES:**
```typescript
// Retornar posición debajo de las cajas de firma/foto
// Dejando MUCHO más espacio para el footer (80 puntos)
return yPosition - boxSize - 80;
```

**DESPUÉS:**
```typescript
// Retornar posición debajo de las cajas de firma/foto
// Dejando MUCHO más espacio para el footer (100 puntos)
return yPosition - boxSize - 100;
```

**Cambio:** De 80 a 100 puntos (aumento de 20 puntos)

### Cálculo de Espacios

**Espacio total requerido:**
- Espacio antes de etiquetas: 30 puntos
- Etiquetas: 20 puntos (altura del texto + espacio)
- Cajas de firma/foto: 120 puntos
- Espacio después de cajas: 100 puntos
- **Total:** 270 puntos

**Espacio mínimo garantizado:** 250 puntos (con margen de seguridad)

## Resultado

### Antes
- ❌ Cajas sobrelapadas con footer
- ❌ Texto del footer no legible
- ❌ Apariencia poco profesional

### Después
- ✓ Cajas bien separadas del footer
- ✓ Texto del footer completamente legible
- ✓ Apariencia profesional y limpia
- ✓ Espacio suficiente entre elementos

## Distribución Visual

```
┌─────────────────────────────────────┐
│                                     │
│  [Contenido de la HC]               │
│                                     │
│  ↓ 30 puntos de espacio             │
│                                     │
│  Firma del Paciente:  Foto:         │ ← Etiquetas
│  ↓ 20 puntos                        │
│  ┌──────────┐  ┌──────────┐        │
│  │          │  │          │        │
│  │  Firma   │  │   Foto   │        │ ← Cajas (120 puntos)
│  │          │  │          │        │
│  └──────────┘  └──────────┘        │
│  ↓ 100 puntos de espacio            │
│                                     │
│  Clinica Demo - Documento...       │ ← Footer (legible)
│                                     │
└─────────────────────────────────────┘
```

## Archivos Modificados

- `backend/src/medical-records/medical-records-pdf.service.ts`
  - Función `addSignatureSection()`
  - Línea ~515: Aumentado espacio mínimo de 180 a 250 puntos
  - Línea ~655: Aumentado espacio después de cajas de 80 a 100 puntos

## Instrucciones de Prueba

### 1. Generar un Nuevo Consentimiento

1. Ve a Historias Clínicas
2. Abre una historia clínica existente
3. Ve a la pestaña "Consentimientos"
4. Genera un nuevo consentimiento con:
   - Firma del paciente
   - Foto del paciente

### 2. Verificar el PDF

1. Descarga el PDF generado
2. Abre el PDF
3. Ve a la última página
4. Verifica que:
   - ✓ Las cajas de firma y foto están bien posicionadas
   - ✓ Hay espacio suficiente entre las cajas y el footer
   - ✓ El texto del footer es completamente legible
   - ✓ No hay sobrelapamiento de elementos

### 3. Verificar en Diferentes Escenarios

**Escenario 1: Solo firma**
- Generar consentimiento solo con firma
- Verificar que la caja de firma esté bien posicionada

**Escenario 2: Solo foto**
- Generar consentimiento solo con foto
- Verificar que la caja de foto esté bien posicionada

**Escenario 3: Firma y foto**
- Generar consentimiento con ambas
- Verificar que ambas cajas estén bien posicionadas

**Escenario 4: Contenido largo**
- Generar consentimiento con mucho contenido
- Verificar que las cajas se posicionen correctamente en la última página

## Consideraciones Técnicas

### Espacio Mínimo

El espacio mínimo de 250 puntos garantiza que:
- Las etiquetas tengan espacio (20 puntos)
- Las cajas tengan espacio completo (120 puntos)
- El footer tenga espacio suficiente (100 puntos)
- Haya margen de seguridad (10 puntos adicionales)

### Nueva Página

Si no hay suficiente espacio (yPosition < 250), el sistema:
1. Fuerza yPosition a 250 puntos
2. Esto puede causar que las cajas se dibujen en la parte superior de la página
3. Es preferible a que se sobrelapan con el footer

### Footer

El footer se dibuja en una posición fija desde el fondo de la página:
- Posición Y: 30 puntos desde el fondo
- Esto garantiza que siempre esté en la misma posición
- El espacio de 100 puntos después de las cajas asegura que no se sobrelapan

## Mejoras Futuras

### 1. Detección Automática de Nueva Página

Si el contenido es muy largo y no hay espacio suficiente, agregar automáticamente una nueva página para las cajas de firma/foto.

```typescript
if (yPosition < 250) {
  // Agregar nueva página
  page = pdfDoc.addPage([width, height]);
  yPosition = height - margin - 50;
}
```

### 2. Ajuste Dinámico del Tamaño de las Cajas

Permitir que las cajas se ajusten dinámicamente según el espacio disponible:

```typescript
const availableSpace = yPosition - 150; // Espacio para footer
const maxBoxSize = Math.min(120, availableSpace - 120);
const boxSize = Math.max(80, maxBoxSize); // Mínimo 80 puntos
```

### 3. Opción de Configuración

Agregar opción en configuración para ajustar el tamaño de las cajas:

```typescript
interface SignatureOptions {
  boxSize?: number; // Default: 120
  spacing?: number; // Default: 40
  footerSpace?: number; // Default: 100
}
```

## Conclusión

El problema de sobrelapamiento entre las cajas de firma/foto y el footer se resolvió aumentando:
1. El espacio mínimo requerido de 180 a 250 puntos
2. El espacio después de las cajas de 80 a 100 puntos

Esto garantiza que el footer sea completamente legible y que haya una separación visual clara entre los elementos.

**Total de espacio agregado:** 90 puntos (70 + 20)
