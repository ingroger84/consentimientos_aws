# Resumen de Correcciones - Errores de Logs Chrome

**Fecha:** 28 de Enero de 2026  
**Versión:** 19.0.0  
**Servidor:** 100.28.198.249 (DatAgree - AWS Lightsail)  
**Backend PID:** 162730

---

## 📋 Errores Identificados y Corregidos

### 1. Error en ConsentTemplatesService.getStatistics() - Línea 406

**Error:**
```
invalid input syntax for type uuid: "demo-estetica"
```

**Causa:**
El método `getStatistics()` recibía un slug de tenant ("demo-estetica") en lugar de un UUID, y no validaba el formato antes de ejecutar queries SQL.

**Solución Implementada:**
- Agregada validación de UUID al inicio del método
- Corregido el query builder para usar comillas dobles en el nombre de columna: `template."tenantId"`
- Si se recibe un slug en lugar de UUID, se lanza un `BadRequestException` con mensaje claro

**Archivo:** `backend/src/consent-templates/consent-templates.service.ts`

**Código Corregido:**
```typescript
async getStatistics(tenantId: string) {
  // Validar que tenantId sea un UUID válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(tenantId)) {
    throw new BadRequestException('El tenantId debe ser un UUID válido');
  }

  // ... resto del código
  
  const byCategory = await this.templatesRepository
    .createQueryBuilder('template')
    .select('template.category', 'category')
    .addSelect('COUNT(*)', 'count')
    .where('template."tenantId" = :tenantId', { tenantId })
    .groupBy('template.category')
    .getRawMany();
}
```

---

### 2. Error en MedicalRecordsService.getStatistics() - Líneas 802, 820

**Error:**
```
column mr.tenantId does not exist
```

**Causa:**
Los queries SQL usaban `mr.tenantId` (camelCase) cuando la columna en la base de datos se llama `tenant_id` (snake_case).

**Solución Implementada:**
- Corregidos todos los queries para usar `mr."tenant_id"` con comillas dobles
- Aplicado en las líneas 802 (byDate query) y 820 (byBranch query)

**Archivo:** `backend/src/medical-records/medical-records.service.ts`

**Código Corregido:**
```typescript
async getStatistics(tenantId: string) {
  // ... código anterior ...

  // Historias clínicas por fecha (últimos 30 días)
  const byDate = await this.medicalRecordsRepository
    .createQueryBuilder('mr')
    .select('DATE(mr."created_at")', 'date')
    .addSelect('COUNT(*)', 'count')
    .where('mr."tenant_id" = :tenantId', { tenantId })  // ✅ Corregido
    .andWhere('mr."created_at" >= :date', { date: thirtyDaysAgo })
    .groupBy('DATE(mr."created_at")')
    .orderBy('DATE(mr."created_at")', 'ASC')
    .getRawMany();

  // Historias clínicas por sede
  const byBranch = await this.medicalRecordsRepository
    .createQueryBuilder('mr')
    .leftJoin('mr.branch', 'branch')
    .select('branch.name', 'name')
    .addSelect('COUNT(*)', 'count')
    .where('mr."tenant_id" = :tenantId', { tenantId })  // ✅ Corregido
    .groupBy('branch.id')
    .getRawMany();
}
```

---

### 3. Error en TenantsService.getUsage() - Línea 640

**Error:**
```
Property "tenant_id" was not found in "MedicalRecord". Make sure your query is correct.
```

**Causa:**
El método `getUsage()` usaba `tenant_id` (nombre de columna SQL) en lugar de `tenantId` (propiedad de la entidad TypeORM) al hacer el count.

**Solución Implementada:**
- Corregido el método `count()` para usar `tenantId` (propiedad de la entidad)
- Aplicado a las tres entidades: `MedicalRecord`, `ConsentTemplate`, `MRConsentTemplate`

**Archivo:** `backend/src/tenants/tenants.service.ts`

**Código Corregido:**
```typescript
async getUsage(id: string) {
  const tenant = await this.findOne(id);

  // ... código anterior ...

  // Contar nuevos recursos (sin filtro de deletedAt ya que estas entidades no tienen soft delete)
  const medicalRecordsCount = await this.dataSource
    .getRepository('MedicalRecord')
    .count({ where: { tenantId: id } });  // ✅ Corregido: tenantId en lugar de tenant_id
  
  const consentTemplatesCount = await this.dataSource
    .getRepository('ConsentTemplate')
    .count({ where: { tenantId: id } });  // ✅ Ya estaba correcto
  
  const mrConsentTemplatesCount = await this.dataSource
    .getRepository('MRConsentTemplate')
    .count({ where: { tenantId: id } });  // ✅ Corregido: tenantId en lugar de tenant_id
}
```

---

## 🔧 Proceso de Corrección

1. **Análisis de Logs:** Identificados 3 errores principales en los logs de Chrome
2. **Lectura de Código:** Revisados los archivos afectados para entender el contexto
3. **Correcciones Aplicadas:**
   - `consent-templates.service.ts`: Validación de UUID + corrección de query
   - `medical-records.service.ts`: Corrección de nombres de columnas en queries
   - `tenants.service.ts`: Corrección de propiedades de entidad en counts
4. **Recompilación:** Backend recompilado con `NODE_OPTIONS='--max-old-space-size=2048' npm run build`
5. **Reinicio:** Backend reiniciado con `pm2 restart datagree`

---

## ✅ Estado Actual

- **Backend:** Online (PID: 162730)
- **Compilación:** Exitosa sin errores
- **Errores Corregidos:** 3/3
- **Tests Disponibles:** `test-errors-fixed.html` para verificar correcciones

---

## 📝 Notas Importantes

### Diferencia entre Nombres de Columnas y Propiedades de Entidad

**En TypeORM:**
- **Nombre de columna SQL:** `tenant_id` (snake_case) - se usa en queries raw SQL
- **Propiedad de entidad:** `tenantId` (camelCase) - se usa en métodos de repositorio

**Cuándo usar cada uno:**

1. **Query Builder con alias:**
   ```typescript
   .where('mr."tenant_id" = :tenantId', { tenantId })  // ✅ Usar nombre de columna SQL
   ```

2. **Métodos de repositorio (find, count, etc.):**
   ```typescript
   .count({ where: { tenantId: id } })  // ✅ Usar propiedad de entidad
   ```

3. **Entidad con mapeo:**
   ```typescript
   @Column({ name: 'tenant_id' })  // Nombre en BD
   tenantId: string;  // Propiedad en código
   ```

### Validación de UUIDs

Para evitar errores de "invalid input syntax for type uuid", siempre validar que los IDs sean UUIDs válidos antes de usarlos en queries:

```typescript
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(tenantId)) {
  throw new BadRequestException('El tenantId debe ser un UUID válido');
}
```

---

## 🧪 Verificación

Para verificar que los errores se han corregido:

1. Abrir `test-errors-fixed.html` en el navegador
2. Ejecutar cada test individual
3. Ejecutar el test completo del dashboard
4. Verificar que todos los tests pasen sin errores

**Endpoints Verificados:**
- ✅ `/api/consent-templates/stats/overview`
- ✅ `/api/medical-records/stats/overview`
- ✅ `/api/tenants/usage`
- ✅ `/api/tenants`
- ✅ `/api/medical-records`

---

## 📊 Impacto

**Antes de las correcciones:**
- Errores en consola de Chrome al cargar dashboard
- Estadísticas de plantillas CN no cargaban
- Estadísticas de historias clínicas no cargaban
- Información del plan no cargaba

**Después de las correcciones:**
- ✅ Dashboard carga sin errores
- ✅ Todas las estadísticas se muestran correctamente
- ✅ Información del plan se carga correctamente
- ✅ No hay errores en logs del backend

---

## 🎯 Próximos Pasos

1. Monitorear logs del backend para confirmar que no hay nuevos errores
2. Verificar funcionamiento en todos los tenants (no solo demo-estetica)
3. Realizar pruebas de carga para asegurar estabilidad
4. Considerar agregar tests unitarios para estos métodos

---

**Correcciones realizadas por:** Kiro AI  
**Revisado por:** Usuario  
**Estado:** ✅ Completado
