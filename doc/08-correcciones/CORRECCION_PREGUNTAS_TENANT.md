# Corrección: Aislamiento de Preguntas por Tenant

**Fecha:** 6 de enero de 2026  
**Estado:** ✅ Completado

---

## 🎯 Problema Identificado

Los usuarios operadores con permiso `view_questions` no podían ver las preguntas configuradas. La página mostraba "No hay preguntas configuradas" aunque existían preguntas en el sistema.

### Síntomas
- Usuario operador tiene permiso "Ver preguntas" asignado
- Página de preguntas muestra mensaje vacío
- Backend retorna array vacío `[]`
- Preguntas existen en la base de datos

---

## 🔍 Causa Raíz

La entidad `Question` NO tenía la relación con `Tenant`, por lo que:

1. **Filtrado incorrecto:** El servicio filtraba por `tenantId` pero la columna no existía
2. **Preguntas sin tenant:** Las preguntas existentes no tenían `tenantId` asignado
3. **Query fallaba:** La consulta SQL no encontraba preguntas del tenant

**Código Problemático:**

```typescript
// ❌ Entidad sin relación Tenant
@Entity('questions')
export class Question extends BaseEntity {
  // ... otros campos
  @ManyToOne(() => Service)
  service: Service;
  // ❌ Falta relación con Tenant
}

// ❌ Service intentaba filtrar por tenantId inexistente
async findAll(tenantId?: string): Promise<Question[]> {
  query.andWhere('question.tenantId = :tenantId', { tenantId });
  // ❌ Columna tenantId no existe en la tabla
}
```

---

## ✨ Solución Implementada

### 1. Agregar Relación Tenant a la Entidad

**Archivo:** `backend/src/questions/entities/question.entity.ts`

```typescript
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('questions')
export class Question extends BaseEntity {
  // ... otros campos
  
  @ManyToOne(() => Service, (service) => service.questions)
  service: Service;

  // ✅ Agregada relación con Tenant
  @ManyToOne(() => Tenant, { nullable: true })
  tenant: Tenant;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}
```

### 2. Crear Migración

**Archivo:** `backend/src/database/migrations/1736180000000-AddTenantToQuestions.ts`

```typescript
export class AddTenantToQuestions1736180000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna tenantId
    await queryRunner.addColumn(
      'questions',
      new TableColumn({
        name: 'tenantId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Agregar foreign key
    await queryRunner.createForeignKey(
      'questions',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    // Crear índice para rendimiento
    await queryRunner.query(`
      CREATE INDEX "IDX_questions_tenantId" ON "questions" ("tenantId")
    `);
  }
}
```

### 3. Script de Migración de Datos

**Archivo:** `backend/fix-questions-tenant.ts`

Script para asignar `tenantId` a preguntas existentes basándose en el servicio al que pertenecen:

```typescript
// Asignar tenantId a preguntas desde sus servicios
UPDATE questions q
SET "tenantId" = s."tenantId"
FROM services s
WHERE q."serviceId" = s.id
AND q."tenantId" IS NULL
AND s."tenantId" IS NOT NULL
```

**Resultado:**
```
✅ Actualizadas 16 preguntas con tenantId desde servicios

📊 Resumen de preguntas por tenant:
  - Demo Consultorio Medico: 16 preguntas
```

### 4. Servicio Ya Estaba Preparado

El servicio `questions.service.ts` ya tenía el filtrado por tenant implementado, solo faltaba la columna en la base de datos:

```typescript
async findAll(tenantId?: string): Promise<Question[]> {
  const query = this.questionsRepository
    .createQueryBuilder('question')
    .leftJoinAndSelect('question.service', 'service')
    .orderBy('question.order', 'ASC');

  // ✅ Filtrado por tenant (ahora funciona)
  if (tenantId) {
    query.andWhere('question.tenantId = :tenantId', { tenantId });
  } else {
    query.andWhere('question.tenantId IS NULL');
  }

  return query.getMany();
}
```

---

## 🔄 Flujo Completo Corregido

### Antes (No Funcionaba)

```
1. Usuario operador accede a /questions
2. Frontend llama GET /api/questions
3. Backend filtra por tenantId
4. Query: WHERE question.tenantId = 'xxx'
5. ❌ Error: columna "tenantId" no existe
6. Retorna []
7. Frontend muestra "No hay preguntas"
```

### Después (Funciona)

```
1. Usuario operador accede a /questions
2. Frontend llama GET /api/questions
3. Backend filtra por tenantId
4. Query: WHERE question.tenantId = 'xxx'
5. ✅ Encuentra preguntas del tenant
6. Retorna [pregunta1, pregunta2, ...]
7. Frontend muestra las preguntas
```

---

## 📊 Estructura de Datos

### Tabla questions (Después)

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  questionText TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'YES_NO',
  isRequired BOOLEAN DEFAULT true,
  isCritical BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  serviceId UUID REFERENCES services(id),
  tenantId UUID REFERENCES tenants(id),  -- ✅ NUEVO
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

CREATE INDEX IDX_questions_tenantId ON questions(tenantId);  -- ✅ NUEVO
```

### Relaciones

```
Tenant (1) ----< (N) Question
Service (1) ----< (N) Question
Question (1) ----< (N) Answer
```

---

## 🧪 Testing

### Verificar Aislamiento

1. **Crear pregunta como Admin General del Tenant A:**
   ```
   POST /api/questions
   {
     "questionText": "¿Pregunta del Tenant A?",
     "serviceId": "service-tenant-a-id"
   }
   ```
   - ✅ Se crea con `tenantId` del Tenant A

2. **Listar preguntas como Operador del Tenant A:**
   ```
   GET /api/questions
   ```
   - ✅ Ve solo preguntas del Tenant A

3. **Listar preguntas como Operador del Tenant B:**
   ```
   GET /api/questions
   ```
   - ✅ Ve solo preguntas del Tenant B
   - ❌ NO ve preguntas del Tenant A

4. **Listar preguntas como Super Admin:**
   ```
   GET /api/questions
   ```
   - ✅ Ve solo preguntas sin tenant (globales)

---

## 🔒 Seguridad Multi-Tenant

### Validaciones Implementadas

1. **Creación de Pregunta:**
   - ✅ `tenantId` se inyecta automáticamente desde el usuario
   - ✅ Usuario no puede especificar `tenantId` manualmente

2. **Listado de Preguntas:**
   - ✅ Filtrado automático por `tenantId` del usuario
   - ✅ Super Admin ve solo preguntas globales

3. **Edición de Pregunta:**
   - ✅ Solo puede editar preguntas de su tenant
   - ✅ Validación en `findOne(id, tenantId)`

4. **Eliminación de Pregunta:**
   - ✅ Solo puede eliminar preguntas de su tenant
   - ✅ Soft delete con validación de tenant

---

## 📋 Checklist de Corrección

- [x] Agregada relación `Tenant` a entidad `Question`
- [x] Creada migración para agregar columna `tenantId`
- [x] Creado índice para rendimiento
- [x] Script de migración de datos ejecutado
- [x] 16 preguntas asignadas a tenant correcto
- [x] Backend reiniciado sin errores
- [x] Servicio ya tenía filtrado implementado
- [x] Controller ya tenía protección de permisos
- [x] Aislamiento multi-tenant verificado

---

## 🚀 Resultado Final

### Para el Usuario Operador

**Antes:**
- ❌ No veía preguntas
- ❌ Mensaje "No hay preguntas configuradas"
- ❌ Confusión sobre permisos

**Después:**
- ✅ Ve las 16 preguntas del tenant
- ✅ Puede navegar por las preguntas
- ✅ Interfaz funcional

### Para el Sistema

**Antes:**
- ❌ Preguntas sin aislamiento
- ❌ Query SQL fallaba
- ❌ Datos inconsistentes

**Después:**
- ✅ Aislamiento completo por tenant
- ✅ Queries optimizadas con índice
- ✅ Datos consistentes
- ✅ Seguridad multi-tenant

---

## 📚 Archivos Modificados

### Backend

1. **`backend/src/questions/entities/question.entity.ts`** (ACTUALIZADO)
   - Agregada relación `@ManyToOne(() => Tenant)`

2. **`backend/src/database/migrations/1736180000000-AddTenantToQuestions.ts`** (NUEVO)
   - Migración para agregar columna `tenantId`
   - Foreign key a tabla `tenants`
   - Índice para rendimiento

3. **`backend/fix-questions-tenant.ts`** (NUEVO)
   - Script para migrar datos existentes
   - Asigna `tenantId` desde servicios

4. **`backend/src/questions/questions.service.ts`** (CORRECCIÓN MENOR)
   - Corregido tipo de retorno en `create()`

---

## 🎓 Lecciones Aprendidas

### 1. Consistencia en Entidades Multi-Tenant

**Todas las entidades que pertenecen a un tenant deben tener:**
- ✅ Relación `@ManyToOne(() => Tenant)`
- ✅ Columna `tenantId` en la base de datos
- ✅ Índice en `tenantId` para rendimiento
- ✅ Foreign key con `ON DELETE CASCADE`

### 2. Migración de Datos Existentes

**Al agregar multi-tenancy a entidades existentes:**
- ✅ Crear migración de esquema
- ✅ Crear script de migración de datos
- ✅ Verificar integridad referencial
- ✅ Probar con datos reales

### 3. Filtrado Automático

**El servicio debe:**
- ✅ Recibir `tenantId` del controller
- ✅ Filtrar automáticamente por tenant
- ✅ Super Admin ve solo datos globales
- ✅ Validar acceso en operaciones individuales

---

## 🔄 Próximos Pasos

### Verificar Otras Entidades

Revisar que todas las entidades tengan aislamiento por tenant:
- [x] Users
- [x] Branches
- [x] Services
- [x] Questions ✅ (Recién corregido)
- [x] Consents
- [x] Settings

### Optimizaciones

1. **Índices Compuestos:**
   ```sql
   CREATE INDEX IDX_questions_tenant_service 
   ON questions(tenantId, serviceId);
   ```

2. **Caché de Preguntas:**
   - Cachear preguntas por servicio
   - Invalidar al crear/editar/eliminar

3. **Paginación:**
   - Implementar paginación en listado
   - Mejorar rendimiento con muchas preguntas

---

**Desarrollado por:** Kiro AI  
**Fecha:** 6 de enero de 2026  
**Versión:** 1.0
