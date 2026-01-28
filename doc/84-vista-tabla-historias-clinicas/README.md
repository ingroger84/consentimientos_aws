# Vista de Tabla para Historias Clínicas

**Fecha:** 2026-01-27  
**Versión:** 15.0.15 (próxima)  
**Estado:** ✅ IMPLEMENTADO

---

## Descripción

Implementación de una vista de tabla para historias clínicas similar a la vista de clientes, con la opción de alternar entre vista de tabla y vista de tarjetas.

### Características

- ✅ Vista de tabla como predeterminada
- ✅ Toggle para alternar entre vista de tabla y tarjetas
- ✅ Diseño consistente con la página de clientes
- ✅ Información completa en formato tabular
- ✅ Iconos visuales para mejor UX
- ✅ Responsive y accesible

---

## Cambios Implementados

### Vista de Tabla (Predeterminada)

**Columnas:**
1. **Historia Clínica:** Número de HC + fecha de creación
2. **Paciente:** Nombre + tipo y número de documento
3. **Tipo:** Tipo de admisión (consulta, urgencia, etc.)
4. **Fecha Admisión:** Fecha de ingreso
5. **Sede:** Nombre de la sede
6. **Estado:** Badge con estado (activa, cerrada, archivada)
7. **Acciones:** Botón para ver detalles

**Características:**
- Filas clickeables para navegar a los detalles
- Hover effect en las filas
- Iconos visuales para cada tipo de información
- Formato de tabla responsive con scroll horizontal

### Vista de Tarjetas

**Mantiene el diseño original:**
- Grid de 3 columnas en desktop
- 2 columnas en tablet
- 1 columna en móvil
- Tarjetas con información resumida
- Hover effect con elevación de sombra

### Toggle de Vista

**Ubicación:** Barra de acciones, entre el buscador y el botón "Nueva Historia Clínica"

**Botones:**
- 📋 **Lista (Table):** Vista de tabla
- 🔲 **Tarjetas (Grid):** Vista de tarjetas

**Comportamiento:**
- Botón activo: Fondo blanco + texto azul + sombra
- Botón inactivo: Fondo transparente + texto gris
- Transición suave entre estados

---

## Código Implementado

### Imports Adicionales

```typescript
import { LayoutGrid, List, User, Calendar, Building2 } from 'lucide-react';

type ViewMode = 'table' | 'cards';
```

### Estado del Componente

```typescript
const [viewMode, setViewMode] = useState<ViewMode>('table'); // Vista de tabla por defecto
```

### Toggle de Vista

```tsx
{/* View Toggle */}
<div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
  <button
    onClick={() => setViewMode('table')}
    className={`p-2 rounded transition-colors ${
      viewMode === 'table'
        ? 'bg-white text-blue-600 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    }`}
    title="Vista de tabla"
  >
    <List className="w-5 h-5" />
  </button>
  <button
    onClick={() => setViewMode('cards')}
    className={`p-2 rounded transition-colors ${
      viewMode === 'cards'
        ? 'bg-white text-blue-600 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    }`}
    title="Vista de tarjetas"
  >
    <LayoutGrid className="w-5 h-5" />
  </button>
</div>
```

### Vista de Tabla

```tsx
{viewMode === 'table' ? (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th>Historia Clínica</th>
            <th>Paciente</th>
            <th>Tipo</th>
            <th>Fecha Admisión</th>
            <th>Sede</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {/* Filas de datos */}
        </tbody>
      </table>
    </div>
  </div>
) : (
  /* Vista de tarjetas */
)}
```

---

## Comparación de Vistas

### Vista de Tabla

**Ventajas:**
- ✅ Más información visible de un vistazo
- ✅ Fácil comparación entre registros
- ✅ Mejor para listas largas
- ✅ Ordenamiento visual por columnas
- ✅ Escaneo rápido de información

**Ideal para:**
- Búsqueda y filtrado de registros
- Análisis comparativo
- Gestión administrativa
- Usuarios que prefieren densidad de información

### Vista de Tarjetas

**Ventajas:**
- ✅ Diseño más visual y atractivo
- ✅ Mejor en dispositivos móviles
- ✅ Información agrupada por contexto
- ✅ Menos abrumador para listas cortas

**Ideal para:**
- Navegación casual
- Dispositivos móviles
- Usuarios que prefieren diseño visual
- Listas pequeñas de registros

---

## Archivos Modificados

1. **`frontend/src/pages/MedicalRecordsPage.tsx`**
   - Agregado estado `viewMode`
   - Agregado toggle de vista
   - Implementada vista de tabla
   - Mantenida vista de tarjetas existente
   - Agregados iconos adicionales (User, Calendar, Building2)

---

## Instrucciones de Uso

### Para el Usuario

1. **Acceder a Historias Clínicas:**
   - Navegar a "Historias Clínicas" en el menú

2. **Vista Predeterminada:**
   - La página se abre en vista de tabla automáticamente

3. **Cambiar de Vista:**
   - Click en el icono 📋 (Lista) para vista de tabla
   - Click en el icono 🔲 (Tarjetas) para vista de tarjetas

4. **Interactuar con los Registros:**
   - **Vista de Tabla:** Click en cualquier fila para ver detalles
   - **Vista de Tarjetas:** Click en cualquier tarjeta para ver detalles
   - Botón "Ver" (👁️) para navegación directa

5. **Buscar:**
   - Usar el buscador para filtrar por número de HC, nombre o documento
   - La búsqueda funciona en ambas vistas

---

## Responsive Design

### Desktop (>1024px)
- **Tabla:** Todas las columnas visibles
- **Tarjetas:** Grid de 3 columnas

### Tablet (768px - 1024px)
- **Tabla:** Scroll horizontal si es necesario
- **Tarjetas:** Grid de 2 columnas

### Móvil (<768px)
- **Tabla:** Scroll horizontal
- **Tarjetas:** 1 columna (recomendado)

---

## Accesibilidad

- ✅ Títulos descriptivos en botones (title attribute)
- ✅ Contraste adecuado en todos los elementos
- ✅ Navegación por teclado funcional
- ✅ Iconos con significado semántico
- ✅ Estados visuales claros (hover, active)

---

## Mejoras Futuras (Opcionales)

### Persistencia de Preferencia
```typescript
// Guardar preferencia en localStorage
useEffect(() => {
  const savedView = localStorage.getItem('medicalRecordsView');
  if (savedView) setViewMode(savedView as ViewMode);
}, []);

useEffect(() => {
  localStorage.setItem('medicalRecordsView', viewMode);
}, [viewMode]);
```

### Ordenamiento de Columnas
- Click en headers para ordenar
- Indicador visual de columna ordenada
- Orden ascendente/descendente

### Filtros Avanzados
- Filtro por estado
- Filtro por tipo de admisión
- Filtro por sede
- Filtro por rango de fechas

### Paginación
- Mostrar 20/50/100 registros por página
- Navegación entre páginas
- Contador de registros totales

### Exportación
- Exportar a Excel/CSV
- Exportar a PDF
- Incluir filtros aplicados

---

## Testing

### Casos de Prueba

1. **Vista Predeterminada:**
   - ✅ La página se abre en vista de tabla
   - ✅ Todos los registros se muestran correctamente

2. **Toggle de Vista:**
   - ✅ Click en "Tarjetas" cambia a vista de tarjetas
   - ✅ Click en "Tabla" cambia a vista de tabla
   - ✅ Estado visual del botón activo es correcto

3. **Navegación:**
   - ✅ Click en fila navega a detalles (tabla)
   - ✅ Click en tarjeta navega a detalles (tarjetas)
   - ✅ Botón "Ver" funciona en ambas vistas

4. **Búsqueda:**
   - ✅ Búsqueda funciona en vista de tabla
   - ✅ Búsqueda funciona en vista de tarjetas
   - ✅ Resultados se actualizan en tiempo real

5. **Responsive:**
   - ✅ Vista de tabla tiene scroll horizontal en móvil
   - ✅ Vista de tarjetas se adapta a diferentes tamaños

---

## Estado Final

✅ **IMPLEMENTACIÓN COMPLETA**

- Vista de tabla: ✅ Implementada
- Vista de tarjetas: ✅ Mantenida
- Toggle de vista: ✅ Funcional
- Diseño responsive: ✅ Implementado
- Iconos visuales: ✅ Agregados
- Consistencia con clientes: ✅ Lograda

**Archivo Modificado:** `frontend/src/pages/MedicalRecordsPage.tsx`  
**Fecha de Implementación:** 2026-01-27  
**Tiempo de Implementación:** ~15 minutos
