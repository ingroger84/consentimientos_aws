# Estructura Visual del Sidebar Reorganizado

**Fecha:** 2026-01-27

---

## Vista General

```
┌─────────────────────────────────────┐
│  [LOGO] Clinica Demo                │ ← Header con logo
├─────────────────────────────────────┤
│                                     │
│  PRINCIPAL                          │ ← Sección no colapsable
│  📊 Dashboard                       │
│                                     │
│  ─────────────────────────────────  │ ← Separador
│                                     │
│  GESTIÓN CLÍNICA ▼                  │ ← Sección colapsable (abierta)
│  📋 Historias Clínicas              │
│  📄 Consentimientos                 │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  PLANTILLAS ▶                       │ ← Sección colapsable (cerrada)
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  GESTIÓN DE DATOS ▶                 │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ORGANIZACIÓN ▶                     │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  FACTURACIÓN ▶                      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  CONFIGURACIÓN                      │
│  ⚙️ Configuración                   │
│                                     │
├─────────────────────────────────────┤
│  👤 Juan Pérez                      │ ← User info
│     Administrador General           │
│     🏢 Sede Principal               │
│  [🔄] [🚪]                          │ ← Acciones
│  ─────────────────────────────────  │
│  v15.0.15 - 2026-01-27              │ ← Versión
└─────────────────────────────────────┘
```

---

## Sección Expandida vs Colapsada

### Expandida (▼)
```
PLANTILLAS ▼
📚 Plantillas HC
📄 Plantillas CN
```

### Colapsada (▶)
```
PLANTILLAS ▶
```

---

## Estados de Items

### Item Normal
```
📋 Historias Clínicas
```

### Item Activo (Página actual)
```
📋 Historias Clínicas  ← Fondo azul claro, texto azul
```

### Item con Badge
```
🔔 Notificaciones  [5]  ← Badge con contador
```

---

## Vistas por Rol

### Operador

```
PRINCIPAL
  📊 Dashboard

GESTIÓN CLÍNICA ▼
  📋 Historias Clínicas
  📄 Consentimientos

PLANTILLAS ▶
  (si tiene permisos)

CONFIGURACIÓN
  ⚙️ Configuración
```

### Administrador General

```
PRINCIPAL
  📊 Dashboard

GESTIÓN CLÍNICA ▼
  📋 Historias Clínicas
  📄 Consentimientos

PLANTILLAS ▶
  📚 Plantillas HC
  📄 Plantillas CN

GESTIÓN DE DATOS ▶
  👤 Clientes
  👥 Usuarios

ORGANIZACIÓN ▶
  🏢 Sedes
  💼 Servicios
  ❓ Preguntas
  🛡️ Roles y Permisos

FACTURACIÓN ▶
  💳 Mi Plan
  🧾 Mis Facturas

CONFIGURACIÓN
  ⚙️ Configuración
```

### Super Admin

```
PRINCIPAL
  📊 Dashboard

GESTIÓN CLÍNICA ▼
  📋 Historias Clínicas (Todas)
  📄 Consentimientos

ADMINISTRACIÓN ▶
  🏛️ Tenants
  💳 Planes
  💰 Facturación
  📊 Impuestos

CONFIGURACIÓN
  ⚙️ Configuración
```

---

## Flujo de Interacción

### 1. Usuario Abre la Aplicación
```
Estado Inicial:
- Principal: Abierto (no colapsable)
- Gestión Clínica: Abierto (defaultOpen: true)
- Plantillas: Cerrado (defaultOpen: false)
- Gestión de Datos: Cerrado
- Organización: Cerrado
- Facturación: Cerrado
- Configuración: Abierto (no colapsable)
```

### 2. Usuario Click en "PLANTILLAS ▶"
```
Acción: toggleSection('Plantillas')
Resultado:
- PLANTILLAS ▼
  📚 Plantillas HC
  📄 Plantillas CN
```

### 3. Usuario Click en "Plantillas HC"
```
Acción: navigate('/mr-consent-templates')
Resultado:
- Item se marca como activo (fondo azul)
- Menú móvil se cierra (si está abierto)
- Navegación a la página
```

### 4. Usuario Click en "PLANTILLAS ▼"
```
Acción: toggleSection('Plantillas')
Resultado:
- PLANTILLAS ▶
  (items ocultos)
```

---

## Responsive Behavior

### Desktop (>1024px)
```
┌────────────┬──────────────────────────┐
│            │                          │
│  Sidebar   │  Main Content            │
│  (fijo)    │  (scroll independiente)  │
│            │                          │
│  264px     │  Resto del ancho         │
└────────────┴──────────────────────────┘
```

### Tablet/Mobile (<1024px)
```
┌──────────────────────────────────────┐
│  [☰] Logo                            │ ← Header móvil
└──────────────────────────────────────┘

Click en [☰]:

┌──────────────────────────────────────┐
│  [✕] Logo                            │
├──────────────────────────────────────┤
│                                      │
│  Sidebar (overlay)                   │
│  - Mismo contenido                   │
│  - Sobre el contenido                │
│  - Cierra al click fuera             │
│                                      │
└──────────────────────────────────────┘
```

---

## Animaciones

### Colapsar/Expandir Sección
```
Duración: 200ms
Easing: ease-in-out
Efecto: Altura de 0 a auto (smooth)
```

### Hover en Item
```
Duración: 150ms
Easing: ease
Efecto: Cambio de color de fondo
```

### Navegación Activa
```
Duración: 0ms (instantáneo)
Efecto: Cambio de color y fondo
```

---

## Colores y Estilos

### Headers de Sección
```
Color: text-gray-500
Tamaño: text-xs
Peso: font-semibold
Transform: uppercase
Tracking: tracking-wider
```

### Items Normales
```
Color: text-gray-700
Fondo: transparent
Hover: bg-gray-100
```

### Items Activos
```
Color: primaryColor (dinámico)
Fondo: primaryColor con 15% opacidad
```

### Separadores
```
Color: border-gray-200
Grosor: 1px
Margen: 12px vertical
```

---

## Accesibilidad

### Navegación por Teclado
```
Tab: Navegar entre items
Enter/Space: Activar item o toggle
Escape: Cerrar menú móvil
```

### Screen Readers
```
- Botones de sección tienen aria-label
- Items tienen texto descriptivo
- Estados se anuncian correctamente
```

### Contraste
```
- Texto normal: 4.5:1 mínimo
- Texto activo: 7:1 mínimo
- Iconos: 3:1 mínimo
```

---

## Métricas de Espacio

### Alturas
```
Header: 64px (16 en Tailwind)
Item: 40px (py-2.5 + contenido)
Section Header: 36px (py-2 + contenido)
Separador: 1px + 12px margen
User Info: ~120px
```

### Anchos
```
Sidebar: 256px (w-64)
Icono: 20px (w-5 h-5)
Margen icono: 12px (mr-3)
Padding horizontal: 16px (px-4)
```

### Espaciado
```
Entre items: 4px (space-y-1)
Entre secciones: 16px (space-y-4)
Padding interno: 12px (px-3)
```

---

## Ejemplo de Código HTML Generado

```html
<nav class="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
  <!-- Sección Principal -->
  <div class="space-y-1">
    <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
      Principal
    </div>
    <div class="space-y-1">
      <a href="/dashboard" class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-primary/10 text-primary">
        <svg class="w-5 h-5 mr-3">...</svg>
        <span>Dashboard</span>
      </a>
    </div>
    <div class="pt-3">
      <div class="border-t border-gray-200"></div>
    </div>
  </div>

  <!-- Sección Gestión Clínica -->
  <div class="space-y-1">
    <button class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
      <span>Gestión Clínica</span>
      <svg class="w-4 h-4">...</svg> <!-- ChevronDown -->
    </button>
    <div class="space-y-1">
      <a href="/medical-records" class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100">
        <svg class="w-5 h-5 mr-3">...</svg>
        <span>Historias Clínicas</span>
      </a>
      <a href="/consents" class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100">
        <svg class="w-5 h-5 mr-3">...</svg>
        <span>Consentimientos</span>
      </a>
    </div>
    <div class="pt-3">
      <div class="border-t border-gray-200"></div>
    </div>
  </div>

  <!-- Más secciones... -->
</nav>
```

---

## Comparación Visual

### Antes
```
┌─────────────────────┐
│ Dashboard           │
│ Consentimientos     │
│ Clientes            │
│ Plantillas          │
│ Plantillas HC       │
│ Historias Clínicas  │
│ Usuarios            │
│ Roles y Permisos    │
│ Sedes               │
│ Servicios           │
│ Preguntas           │
│ Configuración       │
│ Mi Plan             │
│ Mis Facturas        │
└─────────────────────┘
14 items visibles
~800px de altura
```

### Después
```
┌─────────────────────┐
│ PRINCIPAL           │
│ Dashboard           │
│ ─────────────────── │
│ GESTIÓN CLÍNICA ▼   │
│ Historias Clínicas  │
│ Consentimientos     │
│ ─────────────────── │
│ PLANTILLAS ▶        │
│ ─────────────────── │
│ GESTIÓN DE DATOS ▶  │
│ ─────────────────── │
│ ORGANIZACIÓN ▶      │
│ ─────────────────── │
│ FACTURACIÓN ▶       │
│ ─────────────────── │
│ CONFIGURACIÓN       │
│ Configuración       │
└─────────────────────┘
9 items visibles
~400px de altura
```

**Mejora:** 50% menos altura, mejor organización visual
