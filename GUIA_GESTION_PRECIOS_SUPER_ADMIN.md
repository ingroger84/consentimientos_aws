# 📋 Guía de Gestión de Precios para Super Admin

## 🎯 Resumen Rápido

Existen **DOS páginas diferentes** para gestionar precios:

### 1️⃣ **Gestión de Planes** (Precios Base en COP)
- **Ubicación:** Menú → Administración → **Planes**
- **Ruta:** `/plans`
- **Función:** Modificar precios base, límites y características de los planes
- **Moneda:** Solo COP (Pesos Colombianos)
- **Uso:** Configuración general de planes

### 2️⃣ **Precios Multi-Región** (COP y USD) ⭐ NUEVO
- **Ubicación:** Menú → Administración → **Precios Multi-Región**
- **Ruta:** `/plan-pricing`
- **Función:** Modificar precios para diferentes regiones geográficas
- **Monedas:** COP (Colombia), USD (Estados Unidos), USD (Internacional)
- **Uso:** Gestión de precios por región

---

## 📍 Cómo Acceder a Cada Página

### Opción 1: Gestión de Planes (Solo COP)

```
1. Iniciar sesión como Super Admin
2. Menú lateral → "Administración"
3. Click en "Planes"
4. Verás los 5 planes con precios en COP
```

**Lo que puedes hacer aquí:**
- ✅ Modificar precio mensual en COP
- ✅ Modificar precio anual en COP
- ✅ Cambiar límites de recursos (usuarios, sedes, etc.)
- ✅ Editar nombre y descripción del plan
- ❌ NO puedes ver/modificar precios en USD

**Ejemplo de precios mostrados:**
```
Plan Básico:
- Mensual: $89,900 COP
- Anual: $895,404 COP
```

---

### Opción 2: Precios Multi-Región (COP y USD) ⭐

```
1. Iniciar sesión como Super Admin
2. Menú lateral → "Administración"
3. Click en "Precios Multi-Región"
4. Verás los 5 planes con precios para 3 regiones
```

**Lo que puedes hacer aquí:**
- ✅ Ver precios en COP (Colombia)
- ✅ Ver precios en USD (Estados Unidos)
- ✅ Ver precios en USD (Internacional)
- ✅ Modificar precios para cualquier región
- ✅ Modificar tasa de impuesto por región
- ✅ Modificar nombre del impuesto (IVA, Sales Tax, etc.)
- ❌ NO puedes modificar límites de recursos (usa Gestión de Planes)

**Ejemplo de precios mostrados:**

```
Plan Básico - Colombia (COP):
- Mensual: $89,900
- Anual: $895,404
- Impuesto: IVA 19%

Plan Básico - Estados Unidos (USD):
- Mensual: $79
- Anual: $790
- Impuesto: Sales Tax 8%

Plan Básico - Internacional (USD):
- Mensual: $79
- Anual: $790
- Impuesto: Tax 0%
```

---

## 🔄 Diferencias Clave

| Característica | Gestión de Planes | Precios Multi-Región |
|----------------|-------------------|----------------------|
| **Monedas** | Solo COP | COP, USD (US), USD (Internacional) |
| **Regiones** | Una sola | Tres regiones |
| **Precios** | ✅ Modificar | ✅ Modificar |
| **Límites** | ✅ Modificar | ❌ No disponible |
| **Impuestos** | ❌ No disponible | ✅ Modificar |
| **Características** | ✅ Modificar | ❌ No disponible |

---

## 💡 Casos de Uso

### Caso 1: Quiero cambiar el precio en COP
**Opción A:** Usa "Gestión de Planes" (más rápido)
**Opción B:** Usa "Precios Multi-Región" → Selecciona Colombia

### Caso 2: Quiero cambiar el precio en USD
**Única opción:** Usa "Precios Multi-Región" → Selecciona Estados Unidos o Internacional

### Caso 3: Quiero cambiar límites de usuarios/sedes
**Única opción:** Usa "Gestión de Planes"

### Caso 4: Quiero cambiar la tasa de IVA
**Única opción:** Usa "Precios Multi-Región"

---

## 📸 Capturas de Pantalla (Descripción)

### Página: Gestión de Planes
```
┌─────────────────────────────────────────┐
│ Gestión de Planes                       │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────┐  ┌─────────────┐      │
│ │ Plan Básico │  │ Plan Pro    │      │
│ │             │  │             │      │
│ │ Precios     │  │ Precios     │      │
│ │ Mensual: $89,900 COP         │      │
│ │ Anual: $895,404 COP          │      │
│ │             │  │             │      │
│ │ Límites     │  │ Límites     │      │
│ │ Usuarios: 2 │  │ Usuarios: 5 │      │
│ │ Sedes: 1    │  │ Sedes: 3    │      │
│ └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────┘
```

### Página: Precios Multi-Región
```
┌─────────────────────────────────────────┐
│ Gestión de Precios Multi-Región         │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Plan Básico                         ││
│ ├─────────────────────────────────────┤│
│ │                                     ││
│ │ ┌──────────┐ ┌──────────┐ ┌──────┐││
│ │ │Colombia  │ │Estados   │ │Inter-│││
│ │ │(COP)     │ │Unidos    │ │nacio-│││
│ │ │          │ │(USD)     │ │nal   │││
│ │ │Mensual:  │ │Mensual:  │ │(USD) │││
│ │ │$89,900   │ │$79       │ │$79   │││
│ │ │          │ │          │ │      │││
│ │ │Anual:    │ │Anual:    │ │Anual:│││
│ │ │$895,404  │ │$790      │ │$790  │││
│ │ │          │ │          │ │      │││
│ │ │IVA: 19%  │ │Tax: 8%   │ │Tax:0%│││
│ │ │          │ │          │ │      │││
│ │ │[Guardar] │ │[Guardar] │ │[Guar]│││
│ │ └──────────┘ └──────────┘ └──────┘││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## ✅ Pasos para Modificar Precios en COP y USD

### Modificar Precio en COP (Colombia)

**Método 1: Gestión de Planes**
1. Menú → Administración → **Planes**
2. Buscar el plan que deseas modificar
3. Click en botón **Editar** (ícono de lápiz)
4. Modificar "Precio Mensual" o "Precio Anual"
5. Click en **Guardar** (ícono de check verde)

**Método 2: Precios Multi-Región**
1. Menú → Administración → **Precios Multi-Región**
2. Buscar el plan que deseas modificar
3. En la tarjeta de **Colombia (COP)**:
   - Modificar "Precio Mensual"
   - Modificar "Precio Anual"
   - (Opcional) Modificar "Tasa Impuesto" o "Nombre Impuesto"
4. Click en **Guardar Cambios**

---

### Modificar Precio en USD (Estados Unidos)

**Única opción: Precios Multi-Región**
1. Menú → Administración → **Precios Multi-Región**
2. Buscar el plan que deseas modificar
3. En la tarjeta de **United States (USD)**:
   - Modificar "Precio Mensual"
   - Modificar "Precio Anual"
   - (Opcional) Modificar "Tasa Impuesto" o "Nombre Impuesto"
4. Click en **Guardar Cambios**

---

### Modificar Precio en USD (Internacional)

**Única opción: Precios Multi-Región**
1. Menú → Administración → **Precios Multi-Región**
2. Buscar el plan que deseas modificar
3. En la tarjeta de **International (USD)**:
   - Modificar "Precio Mensual"
   - Modificar "Precio Anual"
   - (Opcional) Modificar "Tasa Impuesto" o "Nombre Impuesto"
4. Click en **Guardar Cambios**

---

## 🎨 Interfaz Visual de Precios Multi-Región

La página muestra cada plan con **3 tarjetas** lado a lado:

```
┌─────────────────────────────────────────────────────────────┐
│ Plan Básico                                                 │
│ Para pequeñas clínicas, consultorios, spa, estéticas etc   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ 🇨🇴 Colombia  │  │ 🇺🇸 Estados  │  │ 🌎 Inter-    │    │
│  │              │  │    Unidos    │  │    nacional  │    │
│  │ COP ($)      │  │ USD ($)      │  │ USD ($)      │    │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤    │
│  │ Precio       │  │ Precio       │  │ Precio       │    │
│  │ Mensual      │  │ Mensual      │  │ Mensual      │    │
│  │ $ 89,900     │  │ $ 79         │  │ $ 79         │    │
│  │              │  │              │  │              │    │
│  │ Precio Anual │  │ Precio Anual │  │ Precio Anual │    │
│  │ $ 895,404    │  │ $ 790        │  │ $ 790        │    │
│  │              │  │              │  │              │    │
│  │ Tasa         │  │ Tasa         │  │ Tasa         │    │
│  │ Impuesto     │  │ Impuesto     │  │ Impuesto     │    │
│  │ 0.19 (19%)   │  │ 0.08 (8%)    │  │ 0.00 (0%)    │    │
│  │              │  │              │  │              │    │
│  │ Nombre       │  │ Nombre       │  │ Nombre       │    │
│  │ Impuesto     │  │ Impuesto     │  │ Impuesto     │    │
│  │ IVA          │  │ Sales Tax    │  │ Tax          │    │
│  │              │  │              │  │              │    │
│  │ [Guardar]    │  │ [Guardar]    │  │ [Guardar]    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Notas Importantes

1. **Los cambios son independientes:**
   - Modificar precios en "Gestión de Planes" NO afecta "Precios Multi-Región"
   - Modificar precios en "Precios Multi-Región" NO afecta "Gestión de Planes"
   - Se recomienda usar **solo "Precios Multi-Región"** para consistencia

2. **Impacto de los cambios:**
   - Los cambios se reflejan **inmediatamente** en la landing page
   - Los usuarios ven precios según su ubicación geográfica
   - Los cambios **NO afectan** a tenants existentes
   - Solo aplican a **nuevas suscripciones**

3. **Formato de moneda:**
   - COP: Se muestra sin decimales ($89,900)
   - USD: Se muestra con 2 decimales ($79.00)
   - El formato se ajusta automáticamente

4. **Validación:**
   - Los precios deben ser números positivos
   - La tasa de impuesto debe estar entre 0 y 1 (0% a 100%)
   - Los cambios se guardan individualmente por región

---

## 🚀 Recomendación

**Para gestionar precios de forma completa y consistente:**

1. Usa **"Precios Multi-Región"** para modificar todos los precios (COP y USD)
2. Usa **"Gestión de Planes"** solo para modificar límites y características
3. Mantén sincronizados los precios entre ambas páginas si es necesario

---

## 📞 Soporte

Si tienes dudas sobre cómo usar estas funcionalidades:
- Revisa esta guía
- Consulta el documento `GESTION_PRECIOS_MULTI_REGION_COMPLETADA.md`
- Contacta al equipo de desarrollo

---

**Última actualización:** 2026-02-08  
**Versión del sistema:** 30.2.0
