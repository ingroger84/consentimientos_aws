# Sistema de Plantillas CN Asociadas a Servicios - V61

## 📋 Resumen Ejecutivo

Se implementó un sistema completo para asociar plantillas de consentimiento convencional (CN) a servicios específicos, permitiendo que cada cliente reciba solo los consentimientos de los servicios que contrata.

**Fecha**: 17 de marzo de 2026  
**Versión**: v61.0.0  
**Estado**: ✅ Implementado y listo para despliegue

---

## 🎯 Objetivo

Permitir que las plantillas de consentimiento convencional estén asociadas a uno o varios servicios, de manera que:
- Los clientes reciban consentimientos específicos según los servicios contratados
- Se elimine el enfoque de "una plantilla para todos"
- Se mejore la experiencia del usuario con consentimientos relevantes

---

## 🏗️ Arquitectura Implementada

### 1. Base de Datos

#### Nueva Tabla: `consent_template_services`
```sql
CREATE TABLE consent_template_services (
  id UUID PRIMARY KEY,
  consentTemplateId UUID NOT NULL,
  serviceId UUID NOT NULL,
  createdAt TIMESTAMP,
  UNIQUE(consentTemplateId, serviceId)
);
```

**Características**:
- Relación muchos a muchos entre plantillas y servicios
- Constraint único para evitar duplicados
- Cascada en eliminación (si se elimina plantilla o servicio, se elimina la relación)
- Índices optimizados para consultas rápidas

### 2. Backend (NestJS + TypeORM)

#### Entidad Actualizada: `ConsentTemplate`
```typescript
@Entity('consent_templates')
export class ConsentTemplate {
  // ... campos existentes
  
  @ManyToMany(() => Service, { eager: true })
  @JoinTable({
    name: 'consent_template_services',
    joinColumn: { name: 'consentTemplateId' },
    inverseJoinColumn: { name: 'serviceId' },
  })
  services: Service[];
}
```

#### DTOs Actualizados
```typescript
export interface CreateTemplateDto {
  name: string;
  type: TemplateType;
  content: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  serviceIds: string[]; // ✨ NUEVO
}

export interface UpdateTemplateDto {
  // ... campos existentes
  serviceIds?: string[]; // ✨ NUEVO
}
```

#### Nuevos Métodos en Service

**`validateServices(serviceIds, tenantId)`**
- Valida que los servicios existan
- Verifica que pertenezcan al tenant
- Retorna error si algún servicio no es válido

**`findByService(serviceId, tenantSlug)`**
- Obtiene todas las plantillas asociadas a un servicio
- Útil para envío de consentimientos por servicio

**`create()` y `update()` actualizados**
- Ahora manejan la asociación de servicios
- Validación obligatoria: al menos 1 servicio

#### Nuevo Endpoint
```
GET /consent-templates/by-service/:serviceId
```
Retorna todas las plantillas activas asociadas a un servicio específico.

### 3. Frontend (React + TypeScript)

#### Componentes Actualizados

**`CreateTemplateModal`**
- Selector múltiple de servicios con checkboxes
- Carga dinámica de servicios activos
- Validación: al menos 1 servicio seleccionado
- Contador de servicios seleccionados

**`EditTemplateModal`**
- Mismas funcionalidades que crear
- Pre-selecciona servicios ya asociados
- Permite modificar asociaciones

**`ConsentTemplatesPage`**
- Muestra badges con servicios asociados
- Vista mejorada con información de servicios
- Compatible con vista de Super Admin

#### Interfaz de Usuario

```tsx
// Selector de servicios
<div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
  {services.map(service => (
    <label className="flex items-center gap-2 p-2 hover:bg-gray-50">
      <input type="checkbox" />
      <Tag className="w-4 h-4" />
      <span>{service.name}</span>
    </label>
  ))}
</div>
```

---

## 🔄 Migración de Datos

### Script: `migrate-existing-templates-to-services.js`

**Funcionalidad**:
1. Obtiene todas las plantillas existentes con sus tenants
2. Para cada plantilla, busca todos los servicios activos del tenant
3. Asocia la plantilla a todos los servicios (mantiene comportamiento anterior)
4. Genera reporte detallado de asociaciones creadas

**Ejecución**:
```bash
node backend/migrate-existing-templates-to-services.js
```

**Salida esperada**:
```
✅ Conectado a la base de datos
📋 Encontradas 15 plantillas para migrar
🔄 Procesando: Consentimiento Quirúrgico (Glamping La Polka)
   📌 Encontrados 3 servicios
   ✅ Asociada a: Alojamiento
   ✅ Asociada a: Spa
   ✅ Asociada a: Restaurante
...
📊 RESUMEN DE MIGRACIÓN
✅ Total de asociaciones creadas: 45
❌ Errores: 0
```

---

## 📦 Archivos Modificados/Creados

### Backend
```
✨ NUEVOS:
backend/src/consent-templates/entities/consent-template-service.entity.ts
backend/migrations/add-consent-template-services-relation.sql
backend/migrate-existing-templates-to-services.js

📝 MODIFICADOS:
backend/src/consent-templates/entities/consent-template.entity.ts
backend/src/consent-templates/consent-templates.service.ts
backend/src/consent-templates/consent-templates.controller.ts
backend/src/consent-templates/consent-templates.module.ts
backend/src/consent-templates/dto/create-consent-template.dto.ts
backend/src/consent-templates/dto/update-consent-template.dto.ts
```

### Frontend
```
📝 MODIFICADOS:
frontend/src/types/template.ts
frontend/src/components/templates/CreateTemplateModal.tsx
frontend/src/components/templates/EditTemplateModal.tsx
frontend/src/pages/ConsentTemplatesPage.tsx
```

### Scripts
```
✨ NUEVOS:
scripts/deploy-consent-templates-services-v61.ps1
SISTEMA_PLANTILLAS_CN_POR_SERVICIO_V61.md
```

---

## 🚀 Proceso de Despliegue

### Paso 1: Preparación Local
```powershell
# Compilar backend
cd backend
npm install
npm run build

# Compilar frontend
cd ../frontend
npm install
npm run build
```

### Paso 2: Ejecutar Script de Despliegue
```powershell
.\scripts\deploy-consent-templates-services-v61.ps1
```

El script ejecuta automáticamente:
1. ✅ Migración de base de datos (crear tabla)
2. ✅ Migración de datos (asociar plantillas existentes)
3. ✅ Compilación de backend y frontend
4. ✅ Backup de versión anterior
5. ✅ Subida de archivos al servidor
6. ✅ Reinicio de servicios
7. ✅ Verificación de estado

### Paso 3: Verificación Post-Despliegue

**En la aplicación web**:
1. Ir a "Gestión de Plantillas" → "Plantillas de CN"
2. Verificar que las plantillas existentes muestran servicios asociados
3. Crear una nueva plantilla y seleccionar servicios específicos
4. Editar una plantilla y modificar servicios asociados
5. Verificar que los badges de servicios se muestran correctamente

**En la base de datos**:
```sql
-- Verificar asociaciones
SELECT 
  ct.name as plantilla,
  s.name as servicio,
  t.name as tenant
FROM consent_template_services cts
JOIN consent_templates ct ON cts."consentTemplateId" = ct.id
JOIN services s ON cts."serviceId" = s.id
JOIN tenants t ON ct."tenantId" = t.id
ORDER BY t.name, ct.name;
```

---

## 🎨 Interfaz de Usuario

### Vista de Plantilla con Servicios
```
┌─────────────────────────────────────────────────────────┐
│ 📄 Consentimiento de Procedimiento Estándar            │
│    ⭐ Predeterminada  ✅ Activa                         │
│                                                         │
│    Plantilla para procedimientos médicos generales     │
│                                                         │
│    Servicios: [Alojamiento] [Spa] [Restaurante]       │
│                                                         │
│    Tipo: Consentimiento de Procedimiento               │
│    Actualizada: 17/03/2026                             │
│                                                         │
│    [👁️ Ver] [⭐ Default] [✏️ Editar] [🗑️ Eliminar]    │
└─────────────────────────────────────────────────────────┘
```

### Modal de Creación/Edición
```
┌─────────────────────────────────────────────────────────┐
│ Nueva Plantilla                                    [✕]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Tipo de Plantilla *                                    │
│ [Consentimiento de Procedimiento ▼]                    │
│                                                         │
│ Nombre de la Plantilla *                               │
│ [Consentimiento Quirúrgico                    ]        │
│                                                         │
│ Servicios Asociados *                                  │
│ ┌─────────────────────────────────────────────┐       │
│ │ ☑ 🏷️ Alojamiento                            │       │
│ │ ☑ 🏷️ Spa                                    │       │
│ │ ☐ 🏷️ Restaurante                            │       │
│ │ ☑ 🏷️ Tours                                  │       │
│ └─────────────────────────────────────────────┘       │
│ 3 servicios seleccionados                             │
│                                                         │
│ Contenido de la Plantilla *                            │
│ [                                              ]        │
│                                                         │
│              [Cancelar]  [Crear Plantilla]             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Validaciones Implementadas

### Backend
1. ✅ Al menos 1 servicio debe estar asociado
2. ✅ Los servicios deben existir en la base de datos
3. ✅ Los servicios deben pertenecer al mismo tenant
4. ✅ Los servicios deben estar activos
5. ✅ No se permiten duplicados en la asociación

### Frontend
1. ✅ Validación visual: al menos 1 servicio seleccionado
2. ✅ Mensaje de error si no hay servicios disponibles
3. ✅ Contador de servicios seleccionados
4. ✅ Carga dinámica de servicios activos
5. ✅ Feedback visual de servicios asociados

---

## 📊 Casos de Uso

### Caso 1: Glamping con Múltiples Servicios
**Escenario**: Un glamping ofrece alojamiento, spa, restaurante y tours.

**Plantillas**:
- "Consentimiento de Alojamiento" → Asociada a: Alojamiento
- "Consentimiento de Spa" → Asociada a: Spa
- "Consentimiento de Restaurante" → Asociada a: Restaurante
- "Consentimiento de Tours" → Asociada a: Tours
- "Tratamiento de Datos" → Asociada a: Todos los servicios

**Resultado**: Cliente que contrata solo "Alojamiento + Spa" recibe únicamente 3 consentimientos (Alojamiento, Spa, Tratamiento de Datos).

### Caso 2: Clínica con Servicios Especializados
**Escenario**: Clínica con consulta general, cirugía, laboratorio.

**Plantillas**:
- "Consentimiento Consulta" → Asociada a: Consulta General
- "Consentimiento Quirúrgico" → Asociada a: Cirugía
- "Consentimiento Laboratorio" → Asociada a: Laboratorio
- "Derechos de Imagen" → Asociada a: Cirugía, Laboratorio

**Resultado**: Paciente de consulta general solo firma 1 consentimiento, paciente de cirugía firma 2 (Quirúrgico + Imagen).

---

## 🔐 Seguridad y Permisos

**Permisos requeridos**:
- `create_templates`: Crear plantillas y asociar servicios
- `edit_templates`: Editar plantillas y modificar servicios asociados
- `delete_templates`: Eliminar plantillas (elimina automáticamente asociaciones)
- `view_templates`: Ver plantillas y sus servicios asociados

**Aislamiento de datos**:
- Cada tenant solo ve sus propios servicios
- No se pueden asociar servicios de otros tenants
- Super Admin puede ver todas las asociaciones

---

## 📈 Mejoras Futuras

### Fase 2 (Opcional)
1. **Plantillas compartidas entre servicios**
   - Crear plantillas "globales" que apliquen a múltiples servicios automáticamente

2. **Orden de presentación**
   - Permitir definir el orden en que se presentan los consentimientos

3. **Consentimientos condicionales**
   - Mostrar consentimientos adicionales según respuestas previas

4. **Estadísticas por servicio**
   - Dashboard con métricas de consentimientos por servicio

5. **Plantillas por categoría de servicio**
   - Agrupar servicios en categorías y asociar plantillas a categorías

---

## 🐛 Troubleshooting

### Problema: "Debe asociar al menos un servicio"
**Causa**: No hay servicios seleccionados al crear/editar plantilla  
**Solución**: Seleccionar al menos un servicio de la lista

### Problema: "No hay servicios disponibles"
**Causa**: El tenant no tiene servicios creados  
**Solución**: Crear servicios primero en el módulo de servicios

### Problema: Plantillas existentes sin servicios
**Causa**: Migración no ejecutada  
**Solución**: Ejecutar `node migrate-existing-templates-to-services.js`

### Problema: Error al cargar servicios en modal
**Causa**: Problema de permisos o conexión  
**Solución**: Verificar permisos `view_services` y conexión a API

---

## ✅ Checklist de Verificación

### Pre-Despliegue
- [x] Migración SQL creada y probada
- [x] Script de migración de datos creado
- [x] Backend compilado sin errores
- [x] Frontend compilado sin errores
- [x] Tipos TypeScript actualizados
- [x] Validaciones implementadas

### Post-Despliegue
- [ ] Tabla `consent_template_services` creada
- [ ] Plantillas existentes asociadas a servicios
- [ ] Crear nueva plantilla funciona
- [ ] Editar plantilla funciona
- [ ] Servicios se muestran en listado
- [ ] Validaciones funcionan correctamente
- [ ] Super Admin puede ver todas las asociaciones

---

## 📞 Soporte

**Desarrollador**: Kiro AI Assistant  
**Fecha de implementación**: 17 de marzo de 2026  
**Versión**: v61.0.0  
**Documentación**: Este archivo

---

## 🎉 Conclusión

El sistema de asociación de plantillas CN a servicios está completamente implementado y listo para despliegue. Proporciona una solución flexible y escalable para gestionar consentimientos específicos por servicio, mejorando significativamente la experiencia del usuario y la relevancia de los documentos legales.

**Próximo paso**: Ejecutar `.\scripts\deploy-consent-templates-services-v61.ps1` para desplegar en producción.
