# ⚡ Prueba Rápida - Corrección de Sobreposición

## 🎯 Objetivo

Verificar que el texto del contenido NO se sobrepone con "FIRMA Y CONSENTIMIENTO" en el PDF.

---

## ✅ Estado

- ✅ Código implementado
- ✅ Backend corriendo (puerto 3000)
- ✅ Frontend corriendo (puerto 5174)
- ✅ Sin errores de compilación

---

## 🚀 Pasos Rápidos (5 minutos)

### 1. Acceder
```
URL: http://demo-medico.localhost:5174
Email: admin@clinicademo.com
Password: Demo123!
```

### 2. Ir a HC
- Menú → **Historias Clínicas**
- Abrir cualquier HC **Activa** (badge verde)

### 3. Generar Consentimiento
- Botón verde **"Generar Consentimiento"**
- Seleccionar **1 o más plantillas**
- **Capturar firma** en el canvas
- **Tomar foto** con la cámara
- Clic en **"Generar Consentimiento"**

### 4. Ver PDF
- Pestaña **"Consentimientos"**
- Clic en ícono **"Ver PDF"** (documento)
- Se abre modal con el PDF

### 5. Verificar ✅

En el PDF, debe verse así:

```
Historia Clínica: HC-2026-000001
Fecha de admisión: 26/1/2026
                              ← ESPACIO VISIBLE
                              ← ESPACIO VISIBLE
FIRMA Y CONSENTIMIENTO        ← BIEN SEPARADO
┌────────┐  ┌────────┐
│ Firma  │  │  Foto  │
└────────┘  └────────┘
                              ← ESPACIO VISIBLE
Clinica Demo - Documento...
```

**Checklist:**
- [ ] Hay espacio visible entre contenido y título
- [ ] El título NO está encima del contenido
- [ ] La firma y foto están bien posicionadas
- [ ] El footer está bien separado
- [ ] NO hay sobreposición de textos

---

## ❌ Si Todavía Hay Sobreposición

1. Asegúrate de generar un **NUEVO** consentimiento
2. Los PDFs viejos NO se modifican
3. Verifica la fecha/hora del consentimiento

---

## ✅ Si Todo Está Bien

¡Perfecto! La corrección funciona correctamente.

Puedes marcar la tarea como completada.

---

**Tiempo estimado:** 5 minutos
**Dificultad:** Fácil
**Resultado esperado:** Sin sobreposición de textos
