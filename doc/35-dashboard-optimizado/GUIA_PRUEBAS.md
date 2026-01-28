# Guía de Pruebas - Dashboard Optimizado

## 🧪 Casos de Prueba

### 1. Pruebas de Backend

#### 1.1 Endpoint: Medical Records Statistics
```bash
# Test 1: Obtener estadísticas de HC
curl -X GET http://localhost:3000/medical-records/stats/overview \
  -H "Authorization: Bearer YOUR_TOKEN"

# Respuesta esperada:
{
  "total": 10,
  "active": 7,
  "closed": 3,
  "byDate": [...],
  "byBranch": [...],
  "totalConsents": 15,
  "recent": [...]
}
```

#### 1.2 Endpoint: Clients Statistics
```bash
# Test 2: Obtener estadísticas de clientes
curl -X GET http://localhost:3000/clients/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Respuesta esperada:
{
  "total": 50,
  "newThisMonth": 10,
  "newThisWeek": 3,
  "recent": [...]
}
```

#### 1.3 Endpoint: Consent Templates Statistics
```bash
# Test 3: Obtener estadísticas de plantillas CN
curl -X GET http://localhost:3000/consent-templates/stats/overview \
  -H "Authorization: Bearer YOUR_TOKEN"

# Respuesta esperada:
{
  "total": 25,
  "active": 20,
  "byCategory": [...]
}
```

#### 1.4 Endpoint: MR Consent Templates Statistics
```bash
# Test 4: Obtener estadísticas de plantillas HC
curl -X GET http://localhost:3000/medical-record-consent-templates/stats/overview \
  -H "Authorization: Bearer YOUR_TOKEN"

# Respuesta esperada:
{
  "total": 15,
  "active": 12,
  "byCategory": [...]
}
```

### 2. Pruebas de Frontend

#### 2.1 Carga Inicial del Dashboard


**Pasos:**
1. Iniciar sesión como Admin
2. Navegar al dashboard (/)
3. Observar el loading state
4. Verificar que todas las métricas cargan

**Resultado Esperado:**
- ✅ Mensaje "Cargando estadísticas..." aparece brevemente
- ✅ Todas las tarjetas de métricas muestran números
- ✅ Gráficos se renderizan correctamente
- ✅ Tablas muestran datos recientes

#### 2.2 Dashboard como Operador

**Pasos:**
1. Iniciar sesión como Operador
2. Navegar al dashboard (/)
3. Verificar orden de elementos

**Resultado Esperado:**
- ✅ Accesos rápidos aparecen PRIMERO
- ✅ Luego métricas principales
- ✅ Luego gráficos y tablas

#### 2.3 Dashboard como Admin

**Pasos:**
1. Iniciar sesión como Admin
2. Navegar al dashboard (/)
3. Verificar orden de elementos

**Resultado Esperado:**
- ✅ Métricas principales aparecen primero
- ✅ Gráficos y tablas en el medio
- ✅ Accesos rápidos al FINAL

#### 2.4 Dashboard sin Datos

**Pasos:**
1. Crear un tenant nuevo sin datos
2. Iniciar sesión
3. Navegar al dashboard

**Resultado Esperado:**
- ✅ Todas las métricas muestran 0
- ✅ No se muestran gráficos vacíos
- ✅ No se muestran tablas vacías
- ✅ Accesos rápidos siguen visibles

#### 2.5 Manejo de Errores

**Pasos:**
1. Detener el backend
2. Recargar el dashboard
3. Observar comportamiento

**Resultado Esperado:**
- ✅ Dashboard no se rompe
- ✅ Muestra loading indefinidamente o mensaje de error
- ✅ No hay errores en consola de JavaScript

#### 2.6 Responsividad

**Pasos:**
1. Abrir dashboard en desktop (> 1024px)
2. Redimensionar a tablet (768px - 1024px)
3. Redimensionar a móvil (< 768px)

**Resultado Esperado:**
- ✅ Desktop: 3-4 columnas en grids
- ✅ Tablet: 2 columnas en grids
- ✅ Móvil: 1 columna en grids
- ✅ Tablas tienen scroll horizontal en móvil

### 3. Pruebas de Interacción

#### 3.1 Click en Accesos Rápidos

**Pasos:**
1. Click en "Historias Clínicas"
2. Verificar navegación

**Resultado Esperado:**
- ✅ Navega a /medical-records
- ✅ Página carga correctamente

#### 3.2 Hover en Tarjetas

**Pasos:**
1. Pasar mouse sobre tarjeta de acceso rápido
2. Observar efecto visual

**Resultado Esperado:**
- ✅ Sombra aumenta (shadow-xl)
- ✅ Transición suave

#### 3.3 Tooltips en Gráficos

**Pasos:**
1. Pasar mouse sobre punto en gráfico de línea
2. Observar tooltip

**Resultado Esperado:**
- ✅ Tooltip aparece con información
- ✅ Muestra fecha y cantidad
- ✅ Formato correcto (español)

#### 3.4 Hover en Filas de Tabla

**Pasos:**
1. Pasar mouse sobre fila de tabla
2. Observar efecto visual

**Resultado Esperado:**
- ✅ Fondo cambia a gris claro
- ✅ Transición suave

### 4. Pruebas de Rendimiento

#### 4.1 Tiempo de Carga

**Pasos:**
1. Abrir DevTools → Network
2. Recargar dashboard
3. Medir tiempo total

**Resultado Esperado:**
- ✅ Carga completa < 2 segundos
- ✅ Todas las peticiones en paralelo
- ✅ No hay peticiones bloqueantes

#### 4.2 Uso de Memoria

**Pasos:**
1. Abrir DevTools → Performance
2. Grabar mientras se carga dashboard
3. Analizar uso de memoria

**Resultado Esperado:**
- ✅ Uso de memoria < 50MB
- ✅ No hay memory leaks
- ✅ Gráficos se renderizan eficientemente

### 5. Pruebas de Seguridad

#### 5.1 Acceso sin Autenticación

**Pasos:**
1. Cerrar sesión
2. Intentar acceder a /

**Resultado Esperado:**
- ✅ Redirige a /login
- ✅ No muestra datos

#### 5.2 Acceso sin Permisos

**Pasos:**
1. Crear usuario sin permiso VIEW_DASHBOARD
2. Intentar acceder a /

**Resultado Esperado:**
- ✅ Muestra error 403 o redirige
- ✅ No carga estadísticas

#### 5.3 Filtrado por Tenant

**Pasos:**
1. Crear 2 tenants con datos diferentes
2. Iniciar sesión en tenant A
3. Verificar que solo ve datos de tenant A

**Resultado Esperado:**
- ✅ Solo muestra datos del tenant actual
- ✅ No hay filtración de datos entre tenants

### 6. Pruebas de Datos

#### 6.1 Precisión de Métricas

**Pasos:**
1. Contar manualmente registros en BD
2. Comparar con dashboard

**Resultado Esperado:**
- ✅ Total CN coincide
- ✅ Total HC coincide
- ✅ Total clientes coincide
- ✅ Distribuciones son correctas

#### 6.2 Fechas Correctas

**Pasos:**
1. Verificar "Nuevos esta semana"
2. Verificar "Nuevos este mes"
3. Verificar "Últimos 30 días"

**Resultado Esperado:**
- ✅ Cálculos de fechas son correctos
- ✅ Zona horaria correcta
- ✅ Formato de fecha en español

#### 6.3 Estados Correctos

**Pasos:**
1. Verificar badges de estado en tablas
2. Verificar colores de badges

**Resultado Esperado:**
- ✅ Estados traducidos correctamente
- ✅ Colores apropiados para cada estado
- ✅ Badges legibles

## 📋 Checklist de Pruebas

### Backend
- [ ] Endpoint de Medical Records funciona
- [ ] Endpoint de Clients funciona
- [ ] Endpoint de Consent Templates funciona
- [ ] Endpoint de MR Consent Templates funciona
- [ ] Todos los endpoints requieren autenticación
- [ ] Todos los endpoints filtran por tenant
- [ ] Queries son eficientes (< 500ms)

### Frontend
- [ ] Dashboard carga correctamente
- [ ] Loading state funciona
- [ ] Todas las métricas se muestran
- [ ] Gráficos se renderizan
- [ ] Tablas se muestran
- [ ] Accesos rápidos funcionan
- [ ] Orden correcto para Operador
- [ ] Orden correcto para Admin
- [ ] Responsivo en móvil
- [ ] Responsivo en tablet
- [ ] Responsivo en desktop

### Interacción
- [ ] Hover effects funcionan
- [ ] Tooltips en gráficos funcionan
- [ ] Navegación desde accesos rápidos funciona
- [ ] No hay errores en consola

### Seguridad
- [ ] Requiere autenticación
- [ ] Requiere permisos
- [ ] Filtra por tenant correctamente
- [ ] No hay filtración de datos

### Rendimiento
- [ ] Carga < 2 segundos
- [ ] Uso de memoria < 50MB
- [ ] No hay memory leaks
- [ ] Peticiones en paralelo

## 🐛 Bugs Conocidos

Ninguno reportado hasta el momento.

## 📝 Notas de Prueba

### Datos de Prueba Recomendados

Para probar completamente el dashboard, se recomienda tener:

- **Consentimientos CN:** Al menos 20, con diferentes estados y fechas
- **Historias Clínicas:** Al menos 10, algunas abiertas y algunas cerradas
- **Clientes:** Al menos 30, con algunos creados recientemente
- **Plantillas CN:** Al menos 5 activas
- **Plantillas HC:** Al menos 3 activas
- **Sedes:** Al menos 3 diferentes
- **Servicios:** Al menos 4 diferentes

### Herramientas de Prueba

- **Backend:** Postman o curl
- **Frontend:** Chrome DevTools
- **Rendimiento:** Lighthouse
- **Responsividad:** Chrome DevTools Device Mode
- **Accesibilidad:** axe DevTools

## ✅ Criterios de Aceptación

El dashboard se considera completamente funcional cuando:

1. ✅ Todas las métricas cargan correctamente
2. ✅ Gráficos se renderizan sin errores
3. ✅ Tablas muestran datos recientes
4. ✅ Accesos rápidos funcionan
5. ✅ Orden correcto según rol de usuario
6. ✅ Responsivo en todos los dispositivos
7. ✅ Tiempo de carga < 2 segundos
8. ✅ No hay errores en consola
9. ✅ Seguridad implementada correctamente
10. ✅ Datos filtrados por tenant correctamente
