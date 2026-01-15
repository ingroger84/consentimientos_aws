# Módulo de Gestión de Planes

## Descripción

Módulo completo para que el Super Admin pueda gestionar los planes de suscripción del sistema, permitiendo editar nombres, precios, límites de recursos y características de cada plan.

---

## Ubicación

**Menú lateral del Super Admin** → Debajo de "Tenants" → **"Planes"**

---

## Funcionalidades

### 1. Visualización de Planes
- Vista en grid (2 columnas en pantallas grandes)
- Cada plan muestra:
  - Nombre y descripción
  - Badge "Popular" si aplica
  - Precios (mensual y anual)
  - Límites de recursos (usuarios, sedes, consentimientos, servicios, preguntas, storage)
  - Características (marca de agua, personalización, reportes, API, soporte, etc.)

### 2. Edición de Planes
- Botón "Editar" en cada tarjeta de plan
- Modo de edición inline (sin modal)
- Campos editables:
  - **Nombre**: Texto libre
  - **Descripción**: Textarea
  - **Precio Mensual**: Número (COP)
  - **Precio Anual**: Número (COP)
  - **Límites**: Números para cada recurso
  - **Características**: Checkboxes para cada feature

### 3. Guardado de Cambios
- Botón "Guardar" (ícono de diskette verde)
- Botón "Cancelar" (ícono X gris)
- Los cambios se guardan en el archivo `plans.config.ts`
- Actualización automática en toda la aplicación

---

## Arquitectura

### Backend

#### 1. Módulo Plans (`backend/src/plans/`)

**Archivos creados**:
```
backend/src/plans/
├── plans.controller.ts    # Endpoints REST
├── plans.service.ts       # Lógica de negocio
├── plans.module.ts        # Módulo NestJS
└── dto/
    └── update-plan.dto.ts # Validación de datos
```

#### 2. Endpoints

```typescript
GET    /plans           # Obtener todos los planes
GET    /plans/:id       # Obtener un plan específico
PUT    /plans/:id       # Actualizar un plan
```

**Permisos**: Solo `super_admin` puede acceder

#### 3. Servicio

```typescript
class PlansService {
  findAll(): PlanConfig[]
  findOne(id: string): PlanConfig
  update(id: string, updateDto: UpdatePlanDto): PlanConfig
  private savePlansToFile(): void
  private generatePlansFileContent(): string
}
```

**Características**:
- Lee planes desde `PLANS` en memoria
- Actualiza planes en memoria
- Guarda cambios en `plans.config.ts`
- Regenera el archivo TypeScript completo

### Frontend

#### 1. Página de Gestión (`PlansManagementPage.tsx`)

**Componentes**:
- Grid de tarjetas de planes
- Modo vista/edición por tarjeta
- Formularios inline
- Iconos descriptivos por recurso

**Estado**:
```typescript
const [plans, setPlans] = useState<PlanConfig[]>([]);
const [editingPlan, setEditingPlan] = useState<string | null>(null);
const [formData, setFormData] = useState<Partial<PlanConfig>>({});
const [saving, setSaving] = useState(false);
```

#### 2. Servicio Actualizado (`plans.service.ts`)

**Nuevos métodos**:
```typescript
async getOne(id: string): Promise<PlanConfig>
async update(id: string, data: Partial<PlanConfig>): Promise<PlanConfig>
```

#### 3. Routing

**Ruta agregada**:
```typescript
<Route path="/plans" element={<PlansManagementPage />} />
```

**Menú lateral**:
```typescript
{
  name: 'Planes',
  href: '/plans',
  icon: CreditCard,
  permission: 'manage_tenants'
}
```

---

## Flujo de Uso

### Para el Super Admin

1. **Acceder al módulo**:
   - Iniciar sesión como Super Admin
   - Clic en "Planes" en el menú lateral

2. **Ver planes**:
   - Se muestran todos los planes en grid
   - Información completa de cada plan

3. **Editar un plan**:
   - Clic en botón "Editar" (ícono lápiz azul)
   - La tarjeta entra en modo edición
   - Todos los campos se vuelven editables

4. **Modificar datos**:
   - **Nombre**: Cambiar texto
   - **Descripción**: Editar descripción
   - **Precios**: Ajustar valores en COP
   - **Límites**: Modificar números de recursos
   - **Características**: Marcar/desmarcar checkboxes

5. **Guardar cambios**:
   - Clic en botón "Guardar" (ícono diskette verde)
   - Confirmación de éxito
   - Cambios aplicados inmediatamente

6. **Cancelar edición**:
   - Clic en botón "Cancelar" (ícono X gris)
   - Vuelve al modo vista sin guardar

---

## Validaciones

### Backend (DTO)

```typescript
class UpdatePlanDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() @Min(0) priceMonthly?: number;
  @IsOptional() @IsNumber() @Min(0) priceAnnual?: number;
  @IsOptional() @IsObject() limits?: LimitsDto;
  @IsOptional() @IsObject() features?: FeaturesDto;
  @IsOptional() @IsBoolean() popular?: boolean;
}
```

**Límites**:
- Todos los números deben ser >= 1
- Precios deben ser >= 0

**Características**:
- Valores booleanos
- Backup: 'none' | 'weekly' | 'daily'

### Frontend

- Inputs numéricos con `min` attribute
- Validación de campos requeridos
- Mensajes de error claros

---

## Interfaz de Usuario

### Tarjeta de Plan (Modo Vista)

```
┌─────────────────────────────────────────────┐
│ Básico                          [Editar]    │
│ Popular                                     │
│ Para pequeñas clínicas                      │
├─────────────────────────────────────────────┤
│ 💰 Precios                                  │
│ Mensual: $89,900    Anual: $899,000        │
├─────────────────────────────────────────────┤
│ Límites de Recursos                         │
│ 👥 Usuarios: 5      🏢 Sedes: 2            │
│ 📄 Consents: 200    💼 Servicios: 10       │
│ ❓ Preguntas: 20    💾 Storage: 500 MB     │
├─────────────────────────────────────────────┤
│ Características                             │
│ Marca de agua           ✗ No               │
│ Personalización         ✓ Sí               │
│ Reportes avanzados      ✗ No               │
│ Acceso API              ✗ No               │
│ Soporte prioritario     ✗ No               │
└─────────────────────────────────────────────┘
```

### Tarjeta de Plan (Modo Edición)

```
┌─────────────────────────────────────────────┐
│ [Básico____________]    [💾] [✗]           │
│ Popular                                     │
│ [Para pequeñas clínicas_____________]      │
├─────────────────────────────────────────────┤
│ 💰 Precios                                  │
│ Mensual: [89900]    Anual: [899000]        │
├─────────────────────────────────────────────┤
│ Límites de Recursos                         │
│ 👥 Usuarios: [5]    🏢 Sedes: [2]          │
│ 📄 Consents: [200]  💼 Servicios: [10]     │
│ ❓ Preguntas: [20]  💾 Storage: [500]      │
├─────────────────────────────────────────────┤
│ Características                             │
│ Marca de agua           [☐]                │
│ Personalización         [☑]                │
│ Reportes avanzados      [☐]                │
│ Acceso API              [☐]                │
│ Soporte prioritario     [☐]                │
└─────────────────────────────────────────────┘
```

---

## Iconos Utilizados

| Recurso | Ícono | Componente |
|---------|-------|------------|
| Precios | 💰 | `DollarSign` |
| Usuarios | 👥 | `Users` |
| Sedes | 🏢 | `Building2` |
| Consentimientos | 📄 | `FileText` |
| Servicios | 💼 | `Briefcase` |
| Preguntas | ❓ | `HelpCircle` |
| Storage | 💾 | `HardDrive` |
| Editar | ✏️ | `Edit` |
| Guardar | 💾 | `Save` |
| Cancelar | ✗ | `X` |

---

## Persistencia de Datos

### Archivo de Configuración

**Ubicación**: `backend/src/tenants/plans.config.ts`

**Formato**:
```typescript
export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    description: 'Ideal para probar el sistema',
    priceMonthly: 0,
    priceAnnual: 0,
    limits: { ... },
    features: { ... }
  },
  // ... más planes
};
```

**Regeneración**:
- El servicio regenera el archivo completo
- Mantiene la estructura TypeScript
- Incluye interfaces y funciones helper
- Formato JSON con indentación de 2 espacios

---

## Impacto en el Sistema

### Cambios Inmediatos

Cuando se actualiza un plan:

1. **Archivo `plans.config.ts`** se actualiza
2. **Nuevos tenants** usan los nuevos valores
3. **Tenants existentes** mantienen sus valores actuales
4. **Modal de creación/edición** muestra nuevos valores
5. **Página de pricing** muestra nuevos precios

### Tenants Existentes

Los tenants existentes **NO** se actualizan automáticamente porque:
- Pueden tener límites personalizados
- Pueden tener características personalizadas
- Cambios automáticos podrían afectar su operación

Para actualizar tenants existentes:
- Editar manualmente desde "Tenants"
- O crear script de migración si es necesario

---

## Seguridad

### Autenticación y Autorización

- Solo usuarios con rol `super_admin` pueden acceder
- Guard `RolesGuard` en todos los endpoints
- Decorador `@Roles(RoleType.SUPER_ADMIN)`

### Validación de Datos

- DTO con class-validator
- Validación de tipos y rangos
- Sanitización de inputs

### Manejo de Errores

- Try-catch en todas las operaciones
- Mensajes de error descriptivos
- Logs en consola para debugging

---

## Testing

### Checklist de Pruebas

- [ ] Acceso solo para Super Admin
- [ ] Carga correcta de todos los planes
- [ ] Edición de nombre y descripción
- [ ] Edición de precios (mensual y anual)
- [ ] Edición de límites de recursos
- [ ] Edición de características
- [ ] Guardado exitoso de cambios
- [ ] Cancelación sin guardar
- [ ] Validación de campos numéricos
- [ ] Actualización del archivo plans.config.ts
- [ ] Nuevos tenants usan valores actualizados
- [ ] Responsive en móvil

### Casos de Prueba

1. **Editar precio**:
   - Cambiar precio mensual de $89,900 a $99,900
   - Guardar
   - Verificar en archivo y en modal de tenant

2. **Editar límites**:
   - Cambiar usuarios de 5 a 10
   - Guardar
   - Crear nuevo tenant con ese plan
   - Verificar que tiene 10 usuarios

3. **Editar características**:
   - Activar "Reportes avanzados"
   - Guardar
   - Verificar en página "Mi Plan" de tenant

---

## Futuras Mejoras

### Corto Plazo
- [ ] Historial de cambios en planes
- [ ] Confirmación antes de guardar
- [ ] Preview de cambios

### Mediano Plazo
- [ ] Crear nuevos planes
- [ ] Eliminar planes (soft delete)
- [ ] Duplicar planes
- [ ] Importar/exportar configuración

### Largo Plazo
- [ ] Migración masiva de tenants
- [ ] A/B testing de precios
- [ ] Analytics de conversión por plan
- [ ] Recomendaciones automáticas de upgrade

---

## Conclusión

El módulo de gestión de planes proporciona:

- ✅ **Control Total**: Editar todos los aspectos de los planes
- ✅ **Interfaz Intuitiva**: Edición inline sin modales
- ✅ **Persistencia**: Cambios guardados en archivo de configuración
- ✅ **Seguridad**: Solo Super Admin puede acceder
- ✅ **Validación**: Datos validados en backend y frontend
- ✅ **Impacto Inmediato**: Nuevos tenants usan valores actualizados

**Estado**: ✅ Completamente implementado y funcional

**Fecha**: 7 de enero de 2026
