# 🌍 Plantillas Globales de HC

## 📋 Resumen

Las plantillas de Historias Clínicas creadas por el Super Admin (plantillas globales) se copian automáticamente a los nuevos tenants como plantillas iniciales. Los tenants pueden editarlas según sus necesidades sin afectar las plantillas globales.

## 🎯 Funcionamiento

### 1. Plantillas Globales (Super Admin)

El Super Admin puede crear plantillas HC que sirven como base para todos los tenants:

- **Ubicación**: `tenantId = NULL` en la base de datos
- **Acceso**: Solo el Super Admin puede crear/editar/eliminar
- **Propósito**: Servir como plantillas iniciales para nuevos tenants

### 2. Copia Automática a Nuevos Tenants

Cuando se crea un nuevo tenant:

1. El sistema busca todas las plantillas globales activas
2. Copia cada plantilla al nuevo tenant
3. El tenant recibe copias independientes que puede modificar
4. Los cambios del tenant NO afectan las plantillas globales

### 3. Plantillas del Tenant

Cada tenant tiene sus propias plantillas:

- **Ubicación**: `tenantId = [ID del tenant]` en la base de datos
- **Acceso**: Administradores del tenant
- **Independencia**: Los cambios no afectan a otros tenants ni a las globales

## 🔧 Implementación Técnica

### Backend

#### Servicio de Plantillas HC

**Archivo**: `backend/src/medical-record-consent-templates/mr-consent-templates.service.ts`

```typescript
/**
 * Copiar plantillas globales a un nuevo tenant
 */
async copyGlobalTemplatesToTenant(tenantId: string): Promise<number> {
  // Obtener plantillas globales activas
  const globalTemplates = await this.templatesRepository.find({
    where: {
      tenantId: IsNull(),
      isActive: true,
    },
  });

  // Copiar cada plantilla al tenant
  const copiedTemplates = [];
  for (const globalTemplate of globalTemplates) {
    const newTemplate = this.templatesRepository.create({
      ...globalTemplate,
      id: undefined, // Generar nuevo ID
      tenantId: tenantId,
      createdBy: null,
    });
    copiedTemplates.push(newTemplate);
  }

  await this.templatesRepository.save(copiedTemplates);
  return copiedTemplates.length;
}
```

#### Servicio de Tenants

**Archivo**: `backend/src/tenants/tenants.service.ts`

```typescript
async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
  // ... código de creación del tenant ...

  // COPIAR PLANTILLAS GLOBALES DE HC AL TENANT
  try {
    const copiedCount = await this.mrConsentTemplatesService
      .copyGlobalTemplatesToTenant(savedTenant.id);
    console.log(`${copiedCount} plantillas HC copiadas al tenant`);
  } catch (templatesError) {
    console.error('Error al copiar plantillas HC:', templatesError.message);
  }

  // ... resto del código ...
}
```

### Base de Datos

#### Estructura de Plantillas

```sql
CREATE TABLE medical_record_consent_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  content TEXT NOT NULL,
  available_variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  requires_signature BOOLEAN DEFAULT true,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  -- tenant_id = NULL para plantillas globales
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  created_by UUID REFERENCES users(id)
);
```

#### Plantillas Globales por Defecto

El sistema incluye 3 plantillas globales por defecto:

1. **Consentimiento Informado General HC**
   - Categoría: `general`
   - Uso: Atención médica general

2. **Consentimiento para Procedimiento Médico**
   - Categoría: `procedure`
   - Uso: Procedimientos específicos

3. **Consentimiento para Tratamiento**
   - Categoría: `treatment`
   - Uso: Tratamientos médicos

## 📝 Flujo de Trabajo

### Para el Super Admin

1. **Crear Plantillas Globales**
   ```
   1. Iniciar sesión como Super Admin
   2. Ir a "Plantillas HC"
   3. Crear plantillas que servirán como base
   4. Activar las plantillas que se deben copiar
   ```

2. **Gestionar Plantillas Globales**
   - Editar plantillas existentes
   - Desactivar plantillas que no se deben copiar
   - Crear nuevas plantillas según necesidades

### Para Nuevos Tenants

1. **Creación Automática**
   ```
   Cuando se crea un tenant:
   ✓ Se copian automáticamente las plantillas globales activas
   ✓ El tenant recibe copias independientes
   ✓ Puede empezar a usar las plantillas inmediatamente
   ```

2. **Personalización**
   ```
   El administrador del tenant puede:
   - Editar las plantillas copiadas
   - Crear nuevas plantillas
   - Desactivar plantillas que no necesita
   - Eliminar plantillas que no usa
   ```

### Para Tenants Existentes

Si un tenant ya existe y no tiene plantillas:

```bash
cd backend
node copy-global-templates-to-existing-tenants.js
```

Este script:
- Busca plantillas globales activas
- Identifica tenants sin plantillas
- Copia las plantillas a esos tenants
- Muestra un resumen del proceso

## 🔍 Casos de Uso

### Caso 1: Nuevo Tenant

```
Escenario: Se crea un nuevo tenant "Clínica ABC"

Proceso:
1. Super Admin crea el tenant desde el panel
2. Sistema crea el tenant y usuario administrador
3. Sistema copia automáticamente 3 plantillas globales
4. Admin de "Clínica ABC" recibe email de bienvenida
5. Admin inicia sesión y ve 3 plantillas HC listas para usar
6. Admin puede editar las plantillas según sus necesidades

Resultado:
✓ Tenant tiene plantillas iniciales funcionales
✓ Puede empezar a generar consentimientos inmediatamente
✓ Puede personalizar las plantillas sin afectar a otros
```

### Caso 2: Actualizar Plantillas Globales

```
Escenario: Super Admin mejora una plantilla global

Proceso:
1. Super Admin edita "Consentimiento General HC"
2. Mejora el contenido y agrega más variables
3. Guarda los cambios

Resultado:
✓ La plantilla global se actualiza
✓ Los nuevos tenants recibirán la versión mejorada
✓ Los tenants existentes mantienen su versión
✓ Los tenants existentes pueden actualizar manualmente si desean
```

### Caso 3: Tenant Personaliza Plantilla

```
Escenario: "Clínica ABC" quiere personalizar una plantilla

Proceso:
1. Admin de "Clínica ABC" va a "Plantillas HC"
2. Edita "Consentimiento General HC"
3. Agrega logo de la clínica
4. Modifica el texto según sus políticas
5. Guarda los cambios

Resultado:
✓ La plantilla del tenant se actualiza
✓ La plantilla global NO se afecta
✓ Otros tenants NO se afectan
✓ Solo "Clínica ABC" ve los cambios
```

## 🛠️ Scripts de Utilidad

### 1. Copiar Plantillas a Tenants Existentes

**Archivo**: `backend/copy-global-templates-to-existing-tenants.js`

```bash
cd backend
node copy-global-templates-to-existing-tenants.js
```

**Funcionalidad**:
- Busca plantillas globales activas
- Identifica tenants sin plantillas HC
- Copia las plantillas a esos tenants
- Muestra resumen del proceso

**Salida Ejemplo**:
```
✓ Encontradas 3 plantillas globales:
   1. Consentimiento Informado General HC (general)
   2. Consentimiento para Procedimiento Médico (procedure)
   3. Consentimiento para Tratamiento (treatment)

✓ Encontrados 2 tenants:
   📋 Clinica Demo (demo-medico): Copiando plantillas...
      ✅ 3 plantillas copiadas
   ⏭️  Clinica Test (test-clinic): Ya tiene 5 plantillas, omitiendo...

============================================================
✅ PROCESO COMPLETADO

📊 Resumen:
   - Tenants actualizados: 1
   - Total plantillas copiadas: 3
   - Plantillas por tenant: 3
============================================================
```

### 2. Verificar Plantillas de un Tenant

```bash
cd backend
node check-tenant-templates.js [tenant-slug]
```

## 📊 Ventajas del Sistema

### Para el Super Admin

✅ **Control Centralizado**
- Crea plantillas base una sola vez
- Todos los nuevos tenants las reciben automáticamente
- Puede mejorar las plantillas globales sin afectar a los existentes

✅ **Consistencia**
- Todos los tenants empiezan con las mismas plantillas base
- Garantiza calidad mínima en los consentimientos
- Facilita el soporte y capacitación

✅ **Eficiencia**
- No necesita configurar plantillas para cada tenant
- Reduce tiempo de onboarding
- Simplifica la gestión

### Para los Tenants

✅ **Inicio Rápido**
- Reciben plantillas funcionales desde el día 1
- Pueden empezar a generar consentimientos inmediatamente
- No necesitan crear plantillas desde cero

✅ **Personalización**
- Pueden editar las plantillas según sus necesidades
- Agregar logos, políticas específicas, etc.
- Crear plantillas adicionales

✅ **Independencia**
- Los cambios no afectan a otros tenants
- Pueden experimentar sin riesgos
- Control total sobre sus plantillas

## 🔒 Seguridad y Aislamiento

### Separación de Datos

```sql
-- Plantillas globales (Super Admin)
SELECT * FROM medical_record_consent_templates
WHERE tenant_id IS NULL;

-- Plantillas de un tenant específico
SELECT * FROM medical_record_consent_templates
WHERE tenant_id = 'tenant-uuid';
```

### Permisos

| Rol | Plantillas Globales | Plantillas del Tenant |
|-----|--------------------|-----------------------|
| Super Admin | ✅ Crear/Editar/Eliminar | ✅ Ver todas |
| Admin Tenant | ❌ No puede ver | ✅ Crear/Editar/Eliminar |
| Operador | ❌ No puede ver | ✅ Ver/Usar |

### Validaciones

- Los tenants NO pueden acceder a plantillas globales
- Los tenants NO pueden ver plantillas de otros tenants
- Solo el Super Admin puede crear plantillas globales
- Las copias son independientes (no hay referencias)

## 📈 Métricas y Monitoreo

### Estadísticas Disponibles

```typescript
// Plantillas globales
const globalStats = await mrConsentTemplatesService.getStats(null);

// Plantillas de un tenant
const tenantStats = await mrConsentTemplatesService.getStats(tenantId);
```

### Información Útil

- Total de plantillas globales
- Total de plantillas por tenant
- Plantillas más usadas
- Plantillas personalizadas vs copiadas

## 🎓 Mejores Prácticas

### Para el Super Admin

1. **Crear Plantillas Completas**
   - Incluir todas las variables necesarias
   - Usar formato profesional
   - Revisar ortografía y gramática

2. **Mantener Actualizadas**
   - Revisar periódicamente las plantillas globales
   - Actualizar según cambios legales
   - Mejorar basándose en feedback

3. **Documentar Cambios**
   - Mantener registro de versiones
   - Comunicar cambios importantes
   - Proporcionar guías de uso

### Para los Tenants

1. **Revisar Plantillas Iniciales**
   - Verificar que se ajustan a sus necesidades
   - Personalizar según políticas internas
   - Agregar logos y branding

2. **Crear Plantillas Adicionales**
   - Para procedimientos específicos
   - Para especialidades médicas
   - Para casos especiales

3. **Mantener Organizadas**
   - Usar nombres descriptivos
   - Categorizar correctamente
   - Desactivar las que no se usan

## 🔄 Actualizaciones Futuras

### Posibles Mejoras

1. **Versionamiento de Plantillas**
   - Mantener historial de cambios
   - Permitir revertir a versiones anteriores
   - Comparar versiones

2. **Sincronización Opcional**
   - Permitir a tenants "suscribirse" a actualizaciones
   - Notificar cuando hay nuevas versiones globales
   - Opción de actualizar automáticamente

3. **Plantillas Compartidas**
   - Permitir a tenants compartir plantillas
   - Marketplace de plantillas
   - Calificaciones y comentarios

4. **Análisis de Uso**
   - Plantillas más usadas
   - Plantillas menos usadas
   - Sugerencias de mejora

---

**Fecha de Implementación**: 2026-01-26  
**Versión**: 15.0.10  
**Estado**: ✅ Completado y Funcional
