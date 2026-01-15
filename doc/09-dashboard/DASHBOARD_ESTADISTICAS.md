# Dashboard con Estadísticas y Gráficos

## ✅ Implementación Completada

Se ha agregado un dashboard completo con gráficos estadísticos que muestran información detallada sobre los consentimientos.

## 📊 Gráficos Implementados

### 1. Total de Consentimientos
- Tarjeta destacada con el número total de consentimientos
- Diseño visual atractivo con gradiente azul

### 2. Consentimientos por Fecha
- **Tipo**: Gráfico de líneas
- **Período**: Últimos 30 días
- **Muestra**: Tendencia temporal de creación de consentimientos

### 3. Consentimientos por Tipo de Servicio
- **Tipo**: Gráfico circular (pie chart)
- **Muestra**: Distribución porcentual por tipo de servicio
- **Colores**: Diferentes colores para cada servicio

### 4. Consentimientos por Sede
- **Tipo**: Gráfico de barras
- **Muestra**: Cantidad de consentimientos por cada sede
- **Color**: Verde

### 5. Consentimientos por Estado
- **Tipo**: Gráfico de barras
- **Muestra**: Distribución por estado (Borrador, Firmado, Enviado, Fallido)
- **Color**: Naranja

### 6. Tabla de Consentimientos Recientes
- Muestra los últimos 5 consentimientos creados
- Información: Cliente, Servicio, Sede, Estado, Fecha
- Estados con colores distintivos

## 🔧 Cambios Técnicos

### Backend

#### Nuevo Endpoint
```
GET /api/consents/stats/overview
```

**Respuesta**:
```json
{
  "total": 10,
  "byStatus": [
    { "status": "SENT", "count": 5 },
    { "status": "SIGNED", "count": 3 },
    { "status": "DRAFT", "count": 2 }
  ],
  "byService": [
    { "name": "Tratamiento Médico", "count": 6 },
    { "name": "Cirugía", "count": 4 }
  ],
  "byBranch": [
    { "name": "Sede Norte", "count": 7 },
    { "name": "Sede Sur", "count": 3 }
  ],
  "byDate": [
    { "date": "2026-01-01", "count": 2 },
    { "date": "2026-01-02", "count": 3 }
  ],
  "recent": [
    {
      "id": "uuid",
      "clientName": "John Doe",
      "service": "Tratamiento Médico",
      "branch": "Sede Norte",
      "status": "SENT",
      "createdAt": "2026-01-03T..."
    }
  ]
}
```

#### Archivos Modificados
- `backend/src/consents/consents.controller.ts` - Agregado endpoint de estadísticas
- `backend/src/consents/consents.service.ts` - Agregado método `getStatistics()`

### Frontend

#### Librería Instalada
```bash
npm install recharts
```

**Recharts** es una librería de gráficos para React basada en D3.js, fácil de usar y altamente personalizable.

#### Archivos Modificados
- `frontend/src/pages/DashboardPage.tsx` - Dashboard completamente rediseñado con gráficos

## 🎨 Características Visuales

- **Responsive**: Los gráficos se adaptan a diferentes tamaños de pantalla
- **Interactivos**: Tooltips al pasar el mouse sobre los gráficos
- **Colores**: Paleta de colores consistente y profesional
- **Animaciones**: Transiciones suaves en los gráficos

## 📱 Diseño Responsive

- **Desktop**: Grid de 2 columnas para los gráficos
- **Tablet**: Grid de 1-2 columnas según el espacio
- **Mobile**: Grid de 1 columna, gráficos apilados

## 🔐 Seguridad

- El endpoint de estadísticas requiere autenticación JWT
- Solo usuarios autenticados pueden ver las estadísticas

## 🚀 Cómo Usar

1. Inicia sesión en el sistema
2. El dashboard se carga automáticamente en la página principal
3. Los gráficos se actualizan en tiempo real al cargar la página
4. Usa los accesos rápidos en la parte inferior para navegar

## 📊 Estadísticas Calculadas

### Total
- Cuenta todos los consentimientos en la base de datos

### Por Estado
- Agrupa por: DRAFT, SIGNED, SENT, FAILED

### Por Servicio
- Agrupa por el tipo de servicio asociado al consentimiento

### Por Sede
- Agrupa por la sede donde se creó el consentimiento

### Por Fecha
- Muestra los últimos 30 días
- Agrupa por fecha de creación

### Recientes
- Muestra los últimos 5 consentimientos
- Ordenados por fecha de creación descendente

## 🎯 Beneficios

1. **Visibilidad**: Vista rápida del estado del sistema
2. **Análisis**: Identificar tendencias y patrones
3. **Toma de decisiones**: Datos para decisiones informadas
4. **Monitoreo**: Seguimiento del rendimiento por sede y servicio
5. **Accesibilidad**: Información clara y visual

## 🔄 Actualización

Las estadísticas se cargan automáticamente al abrir el dashboard. Para actualizar:
- Recarga la página (F5)
- O navega a otra sección y regresa al dashboard

## 📝 Notas

- Los gráficos muestran datos reales de la base de datos
- Si no hay datos, los gráficos estarán vacíos
- Los colores son consistentes en toda la aplicación
- Las fechas se muestran en formato español (dd/mm/yyyy)

---

**Implementado**: 3 de enero de 2026
**Estado**: ✅ Funcionando correctamente
