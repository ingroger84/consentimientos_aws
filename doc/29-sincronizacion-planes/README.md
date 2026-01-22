# Sincronización Dinámica de Planes

## Versión: 1.1.36
**Fecha:** 2026-01-21

---

## Descripción

Sistema de sincronización dinámica de planes entre el Super Admin y la Landing Page. Los cambios realizados en los planes desde el panel de administración se reflejan automáticamente en la landing page sin necesidad de reiniciar el backend.

---

## Arquitectura

### Flujo de Datos

```
Super Admin Panel
      ↓
PUT /tenants/plans/:id
      ↓
TenantsService.updatePlan()
      ↓
Guarda en plans.json
      ↓
Landing Page
      ↓
GET /tenants/plans (público)
      ↓
getAllPlans() lee desde plans.json
      ↓
Muestra planes actualizados
```

### Archivos Modificados

1. **backend/src/tenants/plans.config.ts**
   - Función `loadPlansFromJson()`: Carga planes desde JSON si existe
   - Función `getAllPlans()`: Prioriza JSON sobre configuración estática
   - Función `getPlanConfig()`: Usa JSON dinámico

2. **backend/src/tenants/plans.json**
   - Archivo JSON con la configuración actual de planes
   - Se actualiza automáticamente cuando se modifica un plan desde el admin
   - Sirve como fuente de verdad para los planes

3. **backend/src/tenants/tenants.service.ts**
   - Método `updatePlan()`: Actualiza tanto el archivo TypeScript como el JSON
   - Limpia el caché de Node.js después de actualizar

4. **backend/src/tenants/tenants.controller.ts**
   - Endpoint `PUT /tenants/plans/:id`: Actualiza un plan específico
   - Endpoint `GET /tenants/plans`: Obtiene todos los planes (público)

5. **frontend/src/components/landing/PricingSection.tsx**
   - Consume el endpoint público `/tenants/plans`
   - Muestra los planes actualizados en tiempo real

---

## Cómo Funciona

### 1. Carga de Planes

Cuando se solicitan los planes:

```typescript
export function getAllPlans(): PlanConfig[] {
  // Intentar cargar desde JSON primero
  const dynamicPlans = loadPlansFromJson();
  const plansSource = dynamicPlans || PLANS;
  
  return Object.values(plansSource);
}
```

- Si existe `plans.json`, se carga desde ahí
- Si no existe, usa la configuración estática de `PLANS`
- Esto permite actualizar planes sin recompilar

### 2. Actualización de Planes

Cuando el Super Admin actualiza un plan:

```typescript
async updatePlan(planId: string, updateData: any): Promise<any> {
  // 1. Cargar planes actuales
  const { PLANS } = require('./plans.config');
  
  // 2. Actualizar el plan específico
  updatedPlans[planId] = { ...updatedPlans[planId], ...updateData };
  
  // 3. Guardar en plans.json
  fs.writeFileSync(jsonPath, JSON.stringify(updatedPlans, null, 2));
  
  // 4. Limpiar caché de Node.js
  delete require.cache[resolvedPath];
  
  return updatedPlans[planId];
}
```

### 3. Visualización en Landing Page

La landing page obtiene los planes del endpoint público:

```typescript
const fetchPlans = async () => {
  try {
    const response = await api.get('/tenants/plans');
    setPlans(response.data);
  } catch (error) {
    console.error('Error fetching plans:', error);
  }
};
```

---

## Guía de Pruebas

### Prueba 1: Modificar Plan desde Super Admin

1. Iniciar sesión como Super Admin
2. Ir a "Gestión de Planes"
3. Seleccionar un plan (ej: "Básico")
4. Modificar algún campo:
   - Cambiar precio mensual
   - Cambiar límite de usuarios
   - Cambiar descripción
5. Guardar cambios
6. **Verificar**: El plan se actualiza en la base de datos

### Prueba 2: Verificar Sincronización en Landing Page

1. Abrir la landing page en modo incógnito: `https://datagree.net`
2. Ir a la sección de "Planes"
3. **Verificar**: Los cambios realizados en el paso anterior se reflejan inmediatamente
4. **No es necesario**: Reiniciar el backend ni limpiar caché del navegador

### Prueba 3: Verificar Archivo JSON

1. Conectarse al servidor:
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
   ```

2. Ver el contenido del archivo JSON:
   ```bash
   cat /home/ubuntu/consentimientos_aws/backend/dist/tenants/plans.json
   ```

3. **Verificar**: El archivo contiene los cambios realizados

### Prueba 4: Verificar Logs del Backend

1. Ver logs de PM2:
   ```bash
   pm2 logs datagree-backend --lines 50
   ```

2. **Buscar**: Mensajes como:
   ```
   [PlansConfig] Planes cargados desde plans.json
   [TenantsService] Plan basic actualizado exitosamente
   ```

---

## Endpoints

### GET /tenants/plans (Público)

Obtiene todos los planes disponibles.

**Respuesta:**
```json
[
  {
    "id": "free",
    "name": "Gratuito",
    "description": "Prueba gratis por 7 días",
    "priceMonthly": 0,
    "priceAnnual": 0,
    "limits": {
      "users": 1,
      "branches": 1,
      "consents": 50,
      "services": 3,
      "questions": 6,
      "storageMb": 100
    },
    "features": {
      "customization": false,
      "advancedReports": false,
      "prioritySupport": false,
      "customDomain": false,
      "whiteLabel": false,
      "backup": "none",
      "supportResponseTime": "48h"
    }
  },
  // ... más planes
]
```

### PUT /tenants/plans/:id (Requiere permisos de Super Admin)

Actualiza un plan específico.

**Request Body:**
```json
{
  "name": "Básico Plus",
  "priceMonthly": 99900,
  "limits": {
    "users": 2
  }
}
```

**Respuesta:**
```json
{
  "id": "basic",
  "name": "Básico Plus",
  "priceMonthly": 99900,
  "priceAnnual": 895404,
  "limits": {
    "users": 2,
    "branches": 1,
    "consents": 50,
    "services": 5,
    "questions": 10,
    "storageMb": 100
  },
  // ... resto de la configuración
}
```

---

## Ventajas

1. **Sin Reinicio**: Los cambios se aplican sin reiniciar el backend
2. **Tiempo Real**: La landing page muestra los cambios inmediatamente
3. **Persistencia**: Los cambios se guardan en JSON y sobreviven reinicios
4. **Fallback**: Si el JSON no existe, usa la configuración estática
5. **Seguridad**: Solo el Super Admin puede modificar planes

---

## Limitaciones

1. **Caché del Navegador**: Los usuarios que ya tienen la página cargada necesitan refrescar
2. **Validación**: No hay validación exhaustiva de los datos en el frontend
3. **Historial**: No se guarda historial de cambios en los planes

---

## Mejoras Futuras

1. **WebSockets**: Notificar a los clientes conectados cuando cambian los planes
2. **Historial**: Guardar historial de cambios en los planes
3. **Validación**: Agregar validación más robusta en el frontend
4. **Rollback**: Permitir revertir cambios en los planes
5. **Preview**: Vista previa de cómo se verá el plan antes de guardar

---

## Troubleshooting

### Los cambios no se reflejan en la landing page

1. Verificar que el archivo `plans.json` existe:
   ```bash
   ls -la /home/ubuntu/consentimientos_aws/backend/dist/tenants/plans.json
   ```

2. Verificar el contenido del archivo:
   ```bash
   cat /home/ubuntu/consentimientos_aws/backend/dist/tenants/plans.json
   ```

3. Verificar logs del backend:
   ```bash
   pm2 logs datagree-backend --lines 50
   ```

4. Reiniciar el backend si es necesario:
   ```bash
   pm2 restart datagree-backend
   ```

### Error al actualizar planes

1. Verificar permisos del archivo:
   ```bash
   ls -la /home/ubuntu/consentimientos_aws/backend/dist/tenants/
   ```

2. Verificar que el usuario tiene permisos de escritura:
   ```bash
   chmod 644 /home/ubuntu/consentimientos_aws/backend/dist/tenants/plans.json
   ```

3. Verificar logs de errores:
   ```bash
   pm2 logs datagree-backend --err --lines 50
   ```

---

## Conclusión

El sistema de sincronización dinámica de planes permite actualizar la configuración de planes desde el Super Admin y ver los cambios reflejados inmediatamente en la landing page, sin necesidad de reiniciar el backend ni recompilar el código. Esto facilita la gestión de planes y mejora la experiencia del administrador.
