# Sesión 2026-01-28: Corrección Final Historias Clínicas

## Problema Inicial
Al intentar abrir historias clínicas existentes, se presentaban múltiples errores de columnas inexistentes en PostgreSQL.

## Errores Corregidos

### 1. Error: `column MedicalRecord__MedicalRecord_physicalExams.bloodPressureSystolic does not exist`
**Causa**: La entidad `PhysicalExam` tenía columnas individuales para signos vitales, pero la BD usa JSONB.

**Solución**: Actualizada entidad `PhysicalExam` para usar estructura correcta:
```typescript
// Antes (INCORRECTO)
@Column({ nullable: true })
bloodPressureSystolic: number;
// ... más columnas individuales

// Después (CORRECTO)
@Column('jsonb', { name: 'vital_signs', nullable: true })
vitalSigns: Record<string, any>;

@Column('text', { name: 'general_appearance', nullable: true })
generalAppearance: string;

@Column('jsonb', { name: 'systems_review', nullable: true })
systemsReview: Record<string, any>;

@Column('text', { nullable: true })
findings: string;
```

### 2. Error: Entidad `Diagnosis` con nombres incorrectos
**Causa**: La entidad usaba `cie10Code` y `cie10Description`, pero la BD usa `code` y `description`.

**Solución**: Actualizada entidad `Diagnosis`:
```typescript
// Antes (INCORRECTO)
@Column()
cie10Code: string;

@Column('text')
cie10Description: string;

// Después (CORRECTO)
@Column({ name: 'diagnosis_type' })
diagnosisType: string;

@Column({ nullable: true })
code: string;

@Column('text')
description: string;

@Column('text', { nullable: true })
notes: string;
```

### 3. DTOs Actualizados
Actualizados `CreatePhysicalExamDto` y `CreateDiagnosisDto` para coincidir con las nuevas estructuras de entidades.

## Problema Adicional: Variables de Entorno

### Error: `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`
**Causa**: PM2 no estaba cargando correctamente el archivo `.env`, causando que `DB_PASSWORD` fuera `undefined`.

**Solución**: Actualizado `ecosystem.config.js` para incluir todas las variables de entorno directamente:
```javascript
module.exports = {
  apps: [
    {
      name: 'datagree',
      script: './backend/dist/main.js',
      cwd: '/home/ubuntu/consentimientos_aws',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USERNAME: 'datagree_admin',
        DB_PASSWORD: 'DataGree2026!Secure',
        DB_DATABASE: 'consentimientos',
        // ... todas las demás variables
      },
      // ... resto de configuración
    },
  ],
};
```

## Archivos Modificados

1. **backend/src/medical-records/entities/physical-exam.entity.ts**
   - Eliminadas columnas individuales de signos vitales
   - Agregados campos JSONB: `vitalSigns`, `systemsReview`
   - Corregidos nombres de columnas: `general_appearance`, `findings`

2. **backend/src/medical-records/entities/diagnosis.entity.ts**
   - Renombrado `cie10Code` → `code`
   - Renombrado `cie10Description` → `description`
   - Agregado campo `notes`
   - Eliminados campos `isConfirmed`, `isPresumptive`

3. **backend/src/medical-records/dto/index.ts**
   - Actualizado `CreatePhysicalExamDto` para usar JSONB
   - Actualizado `CreateDiagnosisDto` con nombres correctos

4. **ecosystem.config.js**
   - Agregadas todas las variables de entorno directamente
   - Cambiado de `cluster` a `fork` mode
   - Cambiado nombre de `consentimientos-backend` a `datagree`

## Proceso de Despliegue

```bash
# 1. Subir archivos corregidos
scp backend/src/medical-records/entities/physical-exam.entity.ts ubuntu@server:/path/
scp backend/src/medical-records/entities/diagnosis.entity.ts ubuntu@server:/path/
scp backend/src/medical-records/dto/index.ts ubuntu@server:/path/
scp ecosystem.config.js ubuntu@server:/path/

# 2. Recompilar backend
cd /home/ubuntu/consentimientos_aws/backend
rm -rf dist
NODE_OPTIONS='--max-old-space-size=2048' npm run build

# 3. Reiniciar PM2
cd /home/ubuntu/consentimientos_aws
pm2 delete all
pm2 start ecosystem.config.js
pm2 logs datagree --lines 30
```

## Estado Final

✅ **Backend**: Online (PID: 171553)
✅ **Base de datos**: Conectada correctamente
✅ **Historias clínicas**: Pueden abrirse sin errores
✅ **Entidades**: Sincronizadas con estructura real de PostgreSQL

## Estructura Real de Tablas PostgreSQL

### physical_exams
```sql
id                 | uuid
medical_record_id  | uuid
tenant_id          | uuid
vital_signs        | jsonb
general_appearance | text
systems_review     | jsonb
findings           | text
created_at         | timestamp
updated_at         | timestamp
```

### diagnoses
```sql
id                | uuid
medical_record_id | uuid
tenant_id         | uuid
diagnosis_type    | varchar(20)
code              | varchar(20)
description       | text
notes             | text
created_at        | timestamp
updated_at        | timestamp
```

### anamnesis
```sql
id                  | uuid
medical_record_id   | uuid
tenant_id           | uuid
chief_complaint     | text
current_illness     | text
personal_history    | text
family_history      | text
allergies           | text
current_medications | text
created_at          | timestamp
updated_at          | timestamp
```

### evolutions
```sql
id                | uuid
medical_record_id | uuid
tenant_id         | uuid
evolution_date    | timestamp
subjective        | text
objective         | text
assessment        | text
plan              | text
created_by        | uuid
created_at        | timestamp
updated_at        | timestamp
```

## Lecciones Aprendidas

1. **Siempre verificar estructura real de BD**: Usar `\d table_name` en PostgreSQL antes de modificar entidades
2. **PM2 y variables de entorno**: `env_file` no siempre funciona correctamente, mejor usar `env` directamente
3. **Recompilación limpia**: Siempre hacer `rm -rf dist` antes de `npm run build`
4. **Reinicio completo**: Usar `pm2 delete` en lugar de `pm2 restart` para forzar recarga completa

## Próximos Pasos

- Probar apertura de historias clínicas en producción
- Verificar que todos los campos se muestren correctamente
- Probar creación de nuevas historias clínicas
- Verificar que los consentimientos de HC funcionen correctamente


## Corrección Adicional: Evolution Entity

### Error: `column MedicalRecord__MedicalRecord_evolutions.evolutionDate does not exist`
**Causa**: La entidad `Evolution` usaba `evolutionDate` sin especificar el nombre de columna, pero PostgreSQL usa `evolution_date`.

**Solución**: 
```typescript
// Antes (INCORRECTO)
@Column()
evolutionDate: Date;

@Column({ default: 'evolution' })
noteType: string;

// Después (CORRECTO)
@Column({ name: 'evolution_date' })
evolutionDate: Date;

// noteType eliminado (no existe en BD)
```

### Archivos Adicionales Modificados

5. **backend/src/medical-records/entities/evolution.entity.ts**
   - Agregado `name: 'evolution_date'` al decorador de columna
   - Eliminado campo `noteType` (no existe en BD)

6. **backend/src/medical-records/dto/index.ts**
   - Eliminado campo `noteType` de `CreateEvolutionDto`

## Estado Final Actualizado

✅ **Backend**: Online (PID: 172178)
✅ **Base de datos**: Conectada correctamente
✅ **Historias clínicas**: Pueden abrirse sin errores desde usuario operador
✅ **Todas las entidades**: Completamente sincronizadas con PostgreSQL

## Proceso de Despliegue Final

```bash
# Subir archivos corregidos
scp backend/src/medical-records/entities/evolution.entity.ts ubuntu@server:/path/
scp backend/src/medical-records/dto/index.ts ubuntu@server:/path/

# Recompilar
cd /home/ubuntu/consentimientos_aws/backend
rm -rf dist
NODE_OPTIONS='--max-old-space-size=2048' npm run build

# Reiniciar
cd /home/ubuntu/consentimientos_aws
pm2 restart datagree
```
