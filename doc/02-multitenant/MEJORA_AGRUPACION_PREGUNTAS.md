# Mejora: Agrupación Eficiente de Preguntas por Servicio

## 🎯 Objetivo

Mejorar la visualización y gestión de preguntas implementando una vista agrupada por servicio que facilite la organización y navegación.

---

## ✨ Mejoras Implementadas

### 1. Vista Agrupada por Servicio (Nueva)

**Características:**
- ✅ Preguntas organizadas por servicio en secciones expandibles/colapsables
- ✅ Header de servicio con estadísticas resumidas
- ✅ Contador de preguntas totales, obligatorias y críticas
- ✅ Orden visual de preguntas con números circulares
- ✅ Botón para expandir/colapsar todos los servicios
- ✅ Diseño limpio y profesional

**Beneficios:**
- Fácil identificación de preguntas por servicio
- Navegación más rápida y eficiente
- Mejor comprensión de la estructura de preguntas
- Reducción de scroll innecesario

### 2. Vista de Lista (Mejorada)

**Características:**
- ✅ Vista tradicional con todas las preguntas
- ✅ Filtro por servicio para búsqueda específica
- ✅ Diseño de tarjetas mejorado
- ✅ Iconos y badges más claros

### 3. Alternador de Vistas

**Características:**
- ✅ Botones de alternancia entre "Agrupada" y "Lista"
- ✅ Diseño tipo toggle moderno
- ✅ Iconos intuitivos (Grid/List)
- ✅ Estado visual claro de la vista activa

---

## 🎨 Diseño Visual

### Vista Agrupada

```
┌─────────────────────────────────────────────────────┐
│ [▼] Servicio 1                                      │
│     3 preguntas • 2 obligatorias • 1 crítica        │
├─────────────────────────────────────────────────────┤
│  [1] ¿Pregunta 1?                          [✏️] [🗑️] │
│      [Sí/No] [Obligatoria]                          │
│                                                      │
│  [2] ¿Pregunta 2?                          [✏️] [🗑️] │
│      [Texto Libre] [Crítica]                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ [▶] Servicio 2                                      │
│     2 preguntas • 1 obligatoria                     │
└─────────────────────────────────────────────────────┘
```

### Header del Servicio

Cada servicio muestra:
- **Icono de expansión:** Chevron Down/Right
- **Nombre del servicio:** Título destacado
- **Estadísticas:**
  - Número total de preguntas
  - Preguntas obligatorias (badge naranja)
  - Preguntas críticas (badge rojo con icono de alerta)

### Tarjeta de Pregunta

Cada pregunta muestra:
- **Número de orden:** Círculo con fondo azul
- **Texto de la pregunta:** Título claro
- **Badges informativos:**
  - Tipo de respuesta (Sí/No o Texto Libre)
  - Obligatoria (si aplica)
  - Crítica (si aplica, con icono de alerta)
- **Acciones:** Botones de editar y eliminar

---

## 🔧 Implementación Técnica

### Componentes Modificados

**Archivo:** `frontend/src/pages/QuestionsPage.tsx`

### Nuevos Estados

```typescript
const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
```

### Lógica de Agrupación

```typescript
const groupedQuestions = useMemo(() => {
  if (!questions || !services) return {};
  
  const groups: Record<string, { service: any; questions: any[] }> = {};
  
  questions.forEach((question) => {
    const serviceId = question.service?.id;
    if (!serviceId) return;
    
    if (!groups[serviceId]) {
      const service = services.find((s) => s.id === serviceId);
      groups[serviceId] = {
        service: service || { id: serviceId, name: 'Servicio Desconocido' },
        questions: [],
      };
    }
    
    groups[serviceId].questions.push(question);
  });
  
  // Ordenar preguntas dentro de cada grupo
  Object.values(groups).forEach((group) => {
    group.questions.sort((a, b) => a.order - b.order);
  });
  
  return groups;
}, [questions, services]);
```

### Funciones de Control

```typescript
// Expandir/colapsar un servicio específico
const toggleService = (serviceId: string) => {
  const newExpanded = new Set(expandedServices);
  if (newExpanded.has(serviceId)) {
    newExpanded.delete(serviceId);
  } else {
    newExpanded.add(serviceId);
  }
  setExpandedServices(newExpanded);
};

// Expandir/colapsar todos los servicios
const toggleAllServices = () => {
  if (expandedServices.size === Object.keys(groupedQuestions).length) {
    setExpandedServices(new Set());
  } else {
    setExpandedServices(new Set(Object.keys(groupedQuestions)));
  }
};
```

### Nuevos Iconos Importados

```typescript
import { 
  ChevronDown, 
  ChevronRight, 
  List, 
  Grid 
} from 'lucide-react';
```

---

## 📊 Estadísticas por Servicio

Cada header de servicio calcula y muestra:

```typescript
const questionCount = group.questions.length;
const criticalCount = group.questions.filter((q) => q.isCritical).length;
const requiredCount = group.questions.filter((q) => q.isRequired).length;
```

**Visualización:**
- Total de preguntas: Texto simple
- Obligatorias: Badge naranja con contador
- Críticas: Badge rojo con icono de alerta y contador

---

## 🎯 Casos de Uso

### Caso 1: Administrador Revisa Preguntas por Servicio

**Antes:**
- Scroll largo por todas las preguntas
- Difícil identificar qué preguntas pertenecen a cada servicio
- Necesidad de usar filtro constantemente

**Después:**
- Vista clara de servicios con sus preguntas
- Expandir solo el servicio de interés
- Estadísticas rápidas sin abrir

### Caso 2: Configuración de Nuevo Servicio

**Antes:**
- Crear preguntas y buscarlas en la lista
- Verificar manualmente el orden

**Después:**
- Ver todas las preguntas del servicio agrupadas
- Orden visual claro con números
- Fácil identificación de gaps en el orden

### Caso 3: Auditoría de Preguntas Críticas

**Antes:**
- Revisar pregunta por pregunta
- Buscar manualmente las críticas

**Después:**
- Ver contador de críticas en cada servicio
- Identificar rápidamente servicios con preguntas críticas
- Expandir solo los servicios relevantes

---

## 🚀 Mejores Prácticas Aplicadas

### 1. Optimización de Rendimiento

- **useMemo:** Agrupación de preguntas solo cuando cambian datos
- **Renderizado condicional:** Solo se renderizan preguntas de servicios expandidos
- **Set para expandidos:** Operaciones O(1) para verificar estado

### 2. Experiencia de Usuario

- **Vista por defecto:** Agrupada (más útil para la mayoría de casos)
- **Estado persistente:** Los servicios expandidos se mantienen al cambiar de vista
- **Feedback visual:** Hover states en todos los elementos interactivos
- **Iconos intuitivos:** Chevron indica estado expandido/colapsado

### 3. Diseño Responsivo

- **Flexbox:** Layout adaptable
- **Espaciado consistente:** Padding y margins uniformes
- **Colores semánticos:** 
  - Azul: Información general
  - Naranja: Advertencia (obligatoria)
  - Rojo: Crítico
  - Gris: Neutral

### 4. Accesibilidad

- **Botones semánticos:** Uso correcto de elementos button
- **Títulos descriptivos:** title attributes en botones de acción
- **Contraste adecuado:** Colores que cumplen WCAG
- **Navegación por teclado:** Todos los elementos son accesibles

---

## 🔍 Comparación de Vistas

| Característica | Vista Agrupada | Vista de Lista |
|----------------|----------------|----------------|
| Organización | Por servicio | Lineal |
| Filtrado | Expandir/colapsar | Dropdown de servicio |
| Estadísticas | Visibles en header | No disponibles |
| Orden visual | Números circulares | Badge de orden |
| Mejor para | Navegación general | Búsqueda específica |
| Scroll | Mínimo | Más extenso |

---

## 📝 Elementos Visuales

### Badges de Estado

```typescript
// Tipo de pregunta
<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
  {question.type === 'YES_NO' ? 'Sí/No' : 'Texto Libre'}
</span>

// Obligatoria
<span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
  Obligatoria
</span>

// Crítica
<span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs flex items-center gap-1">
  <AlertTriangle className="w-3 h-3" />
  Crítica
</span>
```

### Número de Orden

```typescript
<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-semibold text-sm">
  {question.order}
</div>
```

---

## ✅ Checklist de Funcionalidades

- [x] Vista agrupada por servicio
- [x] Vista de lista tradicional
- [x] Alternador de vistas
- [x] Expandir/colapsar servicios individuales
- [x] Expandir/colapsar todos los servicios
- [x] Estadísticas por servicio
- [x] Orden visual de preguntas
- [x] Badges informativos
- [x] Hover states
- [x] Transiciones suaves
- [x] Diseño responsivo
- [x] Sin errores de TypeScript
- [x] Optimización con useMemo

---

## 🎓 Beneficios de la Mejora

### Para Administradores
- ✅ Gestión más eficiente de preguntas
- ✅ Identificación rápida de problemas
- ✅ Mejor comprensión de la estructura

### Para el Sistema
- ✅ Código más organizado y mantenible
- ✅ Mejor rendimiento con useMemo
- ✅ Componente reutilizable

### Para Usuarios Finales
- ✅ Interfaz más intuitiva
- ✅ Navegación más rápida
- ✅ Menos errores de configuración

---

## 📚 Documentación Relacionada

- **[CAMBIOS_PREGUNTAS.md](./CAMBIOS_PREGUNTAS.md)** - Cambios en sistema de preguntas
- **[ESTADO_ACTUAL_SISTEMA.md](./ESTADO_ACTUAL_SISTEMA.md)** - Estado general del sistema

---

## 🚀 Próximas Mejoras Sugeridas

1. **Drag & Drop:** Reordenar preguntas arrastrando
2. **Búsqueda:** Filtro de texto para buscar preguntas específicas
3. **Duplicar pregunta:** Copiar pregunta a otro servicio
4. **Importar/Exportar:** Plantillas de preguntas
5. **Historial:** Ver cambios en preguntas

---

**Fecha de implementación:** 6 de enero de 2026  
**Estado:** ✅ Completado y funcional
