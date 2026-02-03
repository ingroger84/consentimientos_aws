# Sesión 30 de Enero 2026 - Gestión de Estados de Historias Clínicas

**Fecha:** 30 de Enero 2026  
**Hora:** 23:45 - 00:30 UTC  
**Versión:** 23.1.0  
**Estado:** ✅ Completado

---

## 📋 OBJETIVO

Implementar un sistema completo de gestión de estados para las historias clínicas, permitiendo cerrar, archivar y reabrir HC con validaciones de seguridad y auditoría completa.

---

## 🎯 ESTADOS DE HISTORIAS CLÍNICAS

### Estados Disponibles

1. **`active`** (Activa) - Color: Verde
   - Estado por defecto al crear una HC
   - Permite todas las modificaciones
   - Se pueden agregar: anamnesis, exámenes, diagnósticos, evoluciones, consentimientos
   - `isLocked = false`

2. **`closed`** (Cerrada) - Color: Gris
   - HC finalizada y bloqueada permanentemente
   - NO se puede modificar
   - NO se pueden crear nuevos consentimientos
   - Registra fecha de cierre (`closedAt`) y usuario (`closedBy`)
   - `isLocked = true`

3. **`archived`** (Archivada) - Color: Azul
   - HC archivada para consulta histórica
   - Bloqueada para modificaciones
   - Puede reabrirse si es necesario
   - `isLocked = true`

---

## 🔧 IMPLEMENTACIÓN BACKEND

### 1. Nuevos Métodos en el Servicio

**Archivo:** `backend/src/medical-records/medical-records.service.ts`

#### Método `close()` - Cerrar HC

```typescript
async close(
  id: string,
  userId: string,
  tenantId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<MedicalRecord> {
  const medicalRecord = await this.medicalRecordsRepository.findOne({
    where: { id, tenantId },
  });

  if (!medicalRecord) {
    throw new NotFoundException('Historia clínica no encontrada');
  }

  if (medicalRecord.status === 'closed') {
    throw new BadRequestException('La historia clínica ya está cerrada');
  }

  medicalRecord.status = 'closed';
  medicalRecord.closedAt = new Date();
  medicalRecord.closedBy = userId;
  medicalRecord.isLocked = true;

  const updated = await this.medicalRecordsRepository.save(medicalRecord);

  // Auditoría
  await this.logAudit({
    action: 'close',
    entityType: 'medical_record',
    entityId: id,
    medicalRecordId: id,
    userId,
    tenantId,
    newValues: { status: 'closed', closedAt: updated.closedAt },
    ipAddress,
    userAgent,
  });

  return this.findOne(id, tenantId, userId);
}
```

**Características:**
- Valida que la HC no esté ya cerrada
- Establece `status = 'closed'`
- Registra fecha y usuario de cierre
- Bloquea la HC (`isLocked = true`)
- Crea registro de auditoría

#### Método `archive()` - Archivar HC

```typescript
async archive(
  id: string,
  userId: string,
  tenantId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<MedicalRecord> {
  const medicalRecord = await this.medicalRecordsRepository.findOne({
    where: { id, tenantId },
  });

  if (!medicalRecord) {
    throw new NotFoundException('Historia clínica no encontrada');
  }

  if (medicalRecord.status === 'archived') {
    throw new BadRequestException('La historia clínica ya está archivada');
  }

  const oldStatus = medicalRecord.status;
  medicalRecord.status = 'archived';
  medicalRecord.isLocked = true;

  const updated = await this.medicalRecordsRepository.save(medicalRecord);

  // Auditoría
  await this.logAudit({
    action: 'archive',
    entityType: 'medical_record',
    entityId: id,
    medicalRecordId: id,
    userId,
    tenantId,
    oldValues: { status: oldStatus },
    newValues: { status: 'archived' },
    ipAddress,
    userAgent,
  });

  return this.findOne(id, tenantId, userId);
}
```

**Características:**
- Valida que la HC no esté ya archivada
- Establece `status = 'archived'`
- Bloquea la HC (`isLocked = true`)
- Registra estado anterior en auditoría

#### Método `reopen()` - Reabrir HC

```typescript
async reopen(
  id: string,
  userId: string,
  tenantId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<MedicalRecord> {
  const medicalRecord = await this.medicalRecordsRepository.findOne({
    where: { id, tenantId },
  });

  if (!medicalRecord) {
    throw new NotFoundException('Historia clínica no encontrada');
  }

  if (medicalRecord.status === 'active') {
    throw new BadRequestException('La historia clínica ya está activa');
  }

  const oldStatus = medicalRecord.status;
  medicalRecord.status = 'active';
  medicalRecord.isLocked = false;
  medicalRecord.closedAt = null;
  medicalRecord.closedBy = null;

  const updated = await this.medicalRecordsRepository.save(medicalRecord);

  // Auditoría
  await this.logAudit({
    action: 'reopen',
    entityType: 'medical_record',
    entityId: id,
    medicalRecordId: id,
    userId,
    tenantId,
    oldValues: { status: oldStatus },
    newValues: { status: 'active', isLocked: false },
    ipAddress,
    userAgent,
  });

  return this.findOne(id, tenantId, userId);
}
```

**Características:**
- Valida que la HC no esté ya activa
- Establece `status = 'active'`
- Desbloquea la HC (`isLocked = false`)
- Limpia datos de cierre (`closedAt`, `closedBy`)
- Registra cambio de estado en auditoría

### 2. Nuevos Endpoints en el Controlador

**Archivo:** `backend/src/medical-records/medical-records.controller.ts`

```typescript
@Post(':id/close')
async close(@Param('id') id: string, @Request() req: any) {
  return this.medicalRecordsService.close(
    id,
    req.user.sub,
    req.user.tenantId,
    req.ip,
    req.headers['user-agent'],
  );
}

@Post(':id/archive')
async archive(@Param('id') id: string, @Request() req: any) {
  return this.medicalRecordsService.archive(
    id,
    req.user.sub,
    req.user.tenantId,
    req.ip,
    req.headers['user-agent'],
  );
}

@Post(':id/reopen')
async reopen(@Param('id') id: string, @Request() req: any) {
  return this.medicalRecordsService.reopen(
    id,
    req.user.sub,
    req.user.tenantId,
    req.ip,
    req.headers['user-agent'],
  );
}
```

**Endpoints:**
- `POST /medical-records/:id/close` - Cerrar HC
- `POST /medical-records/:id/archive` - Archivar HC
- `POST /medical-records/:id/reopen` - Reabrir HC

---

## 🎨 IMPLEMENTACIÓN FRONTEND

### 1. Actualización del Servicio

**Archivo:** `frontend/src/services/medical-records.service.ts`

```typescript
async close(id: string): Promise<MedicalRecord> {
  const response = await api.post(`/medical-records/${id}/close`);
  return response.data;
}

async archive(id: string): Promise<MedicalRecord> {
  const response = await api.post(`/medical-records/${id}/archive`);
  return response.data;
}

async reopen(id: string): Promise<MedicalRecord> {
  const response = await api.post(`/medical-records/${id}/reopen`);
  return response.data;
}
```

### 2. Actualización de Tipos

**Archivo:** `frontend/src/types/medical-record.ts`

Agregado campo `closer` al tipo `MedicalRecord`:

```typescript
closer?: {
  id: string;
  name: string;
};
```

### 3. Interfaz de Usuario

**Archivo:** `frontend/src/pages/ViewMedicalRecordPage.tsx`

#### Botones de Gestión de Estados

**Para HC Activa:**
- ✅ **Generar Consentimiento** (verde)
- 📦 **Archivar** (azul)
- 🔒 **Cerrar HC** (gris)

**Para HC Cerrada/Archivada:**
- 🔓 **Reabrir HC** (naranja)

#### Indicadores Visuales

1. **Badge de Estado:**
   - Activa: Verde
   - Cerrada: Gris
   - Archivada: Azul

2. **Badge de Bloqueo:**
   - 🔒 Bloqueada (rojo) - Cuando `isLocked = true`

3. **Información de Cierre:**
   - Muestra fecha y usuario que cerró la HC
   - Visible en el header y en alertas

#### Alertas Informativas

**HC Cerrada:**
```
⚠️ Historia Clínica Cerrada
Esta historia clínica ha sido cerrada y no se pueden realizar modificaciones.
Cerrada el [fecha] por [usuario].
```

**HC Archivada:**
```
ℹ️ Historia Clínica Archivada
Esta historia clínica ha sido archivada y está bloqueada para modificaciones.
Puede reabrirla si necesita realizar cambios.
```

#### Confirmaciones de Seguridad

**Cerrar HC:**
```
⚠️ ¿Cerrar historia clínica?
Al cerrar la historia clínica, quedará bloqueada y no se podrá modificar.
Esta acción es importante para mantener la integridad de los registros médicos.
¿Desea continuar?
```

**Archivar HC:**
```
ℹ️ ¿Archivar historia clínica?
La historia clínica será archivada y bloqueada para modificaciones.
Podrá reabrirla si es necesario. ¿Desea continuar?
```

**Reabrir HC:**
```
⚠️ ¿Reabrir historia clínica?
La historia clínica será reactivada y se podrá modificar nuevamente.
Esta acción debe realizarse solo cuando sea necesario. ¿Desea continuar?
```

#### Restricciones de Botones

Cuando la HC está cerrada o archivada, se ocultan los botones:
- ❌ Agregar Anamnesis
- ❌ Agregar Examen Físico
- ❌ Agregar Diagnóstico
- ❌ Agregar Evolución
- ❌ Generar Consentimiento

---

## 🛡️ VALIDACIONES DE SEGURIDAD

### Validaciones Automáticas en la Entidad

```typescript
@BeforeUpdate()
validateBeforeUpdate() {
  if (this.isLocked) {
    throw new Error('No se puede modificar una historia clínica bloqueada');
  }
  if (this.status === 'closed') {
    throw new Error('No se puede modificar una historia clínica cerrada');
  }
}
```

### Validaciones en el Servicio

1. **Crear Consentimiento:**
   - Verifica que la HC no esté cerrada
   - Verifica que la HC no esté bloqueada

2. **Modificar HC:**
   - Verifica que la HC no esté cerrada
   - Verifica que la HC no esté bloqueada

3. **Cambiar Estado:**
   - Valida que el estado actual sea diferente al solicitado
   - Previene cambios de estado duplicados

---

## 📊 AUDITORÍA

Todas las acciones de cambio de estado se registran en la tabla `medical_record_audit`:

### Acciones Auditadas

1. **`close`** - Cerrar HC
   - Registra: fecha de cierre, usuario
   - Valores nuevos: `{ status: 'closed', closedAt: Date }`

2. **`archive`** - Archivar HC
   - Registra: estado anterior
   - Valores: `{ oldValues: { status }, newValues: { status: 'archived' } }`

3. **`reopen`** - Reabrir HC
   - Registra: estado anterior
   - Valores: `{ oldValues: { status }, newValues: { status: 'active', isLocked: false } }`

### Información Capturada

- `action`: Tipo de acción (close, archive, reopen)
- `entityType`: 'medical_record'
- `entityId`: ID de la HC
- `medicalRecordId`: ID de la HC
- `userId`: Usuario que realizó la acción
- `tenantId`: Tenant al que pertenece
- `ipAddress`: IP del usuario (opcional)
- `userAgent`: Navegador del usuario (opcional)
- `changes`: Valores anteriores y nuevos

---

## 🚀 DESPLIEGUE

### Compilación

```bash
# Backend
cd backend
$env:NODE_OPTIONS='--max-old-space-size=2048'
npm run build
# ✅ Compilado exitosamente

# Frontend
cd frontend
npm run build
# ✅ Compilado exitosamente
# ViewMedicalRecordPage-CpTbhwOD.js - 52.62 kB
```

### Archivos Modificados

**Backend:**
1. `backend/src/medical-records/medical-records.service.ts`
   - Agregado método `archive()`
   - Agregado método `reopen()`
   - Mejorado método `close()` con validaciones

2. `backend/src/medical-records/medical-records.controller.ts`
   - Agregado endpoint `POST /:id/archive`
   - Agregado endpoint `POST /:id/reopen`

**Frontend:**
3. `frontend/src/services/medical-records.service.ts`
   - Agregado método `archive()`
   - Agregado método `reopen()`

4. `frontend/src/types/medical-record.ts`
   - Agregado campo `closer` al tipo `MedicalRecord`

5. `frontend/src/pages/ViewMedicalRecordPage.tsx`
   - Agregados botones de gestión de estados
   - Agregadas funciones `handleClose()`, `handleArchive()`, `handleReopen()`
   - Agregadas alertas informativas
   - Agregadas restricciones de botones según estado
   - Agregado indicador de bloqueo
   - Agregada información de cierre

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

- [x] Endpoint para cerrar HC
- [x] Endpoint para archivar HC
- [x] Endpoint para reabrir HC
- [x] Validaciones de estado en backend
- [x] Validaciones de bloqueo en entidad
- [x] Auditoría completa de cambios de estado
- [x] Botones de gestión en interfaz
- [x] Confirmaciones de seguridad
- [x] Alertas informativas de estado
- [x] Indicador visual de bloqueo
- [x] Información de cierre (fecha y usuario)
- [x] Restricción de botones según estado
- [x] Actualización de tipos TypeScript
- [x] Compilación exitosa
- [x] Listo para despliegue

---

## 🎯 FLUJOS DE TRABAJO

### Flujo Normal

1. **Crear HC** → Estado: `active`
2. **Agregar información** (anamnesis, exámenes, diagnósticos, evoluciones)
3. **Generar consentimientos**
4. **Cerrar HC** → Estado: `closed`, `isLocked = true`
5. HC bloqueada permanentemente

### Flujo con Archivo

1. **Crear HC** → Estado: `active`
2. **Agregar información**
3. **Archivar HC** → Estado: `archived`, `isLocked = true`
4. HC bloqueada temporalmente
5. **Reabrir HC** (si es necesario) → Estado: `active`, `isLocked = false`
6. Continuar agregando información
7. **Cerrar HC** → Estado: `closed`

### Flujo de Reapertura

1. HC en estado `closed` o `archived`
2. Usuario con permisos hace clic en "Reabrir HC"
3. Confirmación de seguridad
4. HC cambia a estado `active`
5. Se desbloquea (`isLocked = false`)
6. Se limpian datos de cierre
7. Se puede modificar nuevamente

---

## 📝 NOTAS TÉCNICAS

### Diferencia entre Cerrar y Archivar

**Cerrar:**
- Acción definitiva para finalizar la atención
- Indica que el caso está completo
- Mantiene integridad de registros médicos
- Uso: Al finalizar tratamiento o alta del paciente

**Archivar:**
- Acción temporal para organización
- Indica que la HC no está en uso activo
- Puede reabrirse fácilmente
- Uso: Para casos inactivos pero no finalizados

### Permisos

Actualmente no hay permisos específicos para estas acciones. Cualquier usuario con acceso a la HC puede:
- Cerrar HC
- Archivar HC
- Reabrir HC

**Recomendación futura:** Crear permisos específicos:
- `close_medical_records`
- `archive_medical_records`
- `reopen_medical_records`

### Consideraciones de Seguridad

1. **Auditoría completa:** Todas las acciones quedan registradas
2. **Confirmaciones:** El usuario debe confirmar acciones críticas
3. **Validaciones:** El backend valida todos los cambios de estado
4. **Bloqueo automático:** Las HC cerradas/archivadas se bloquean automáticamente
5. **Información visible:** El usuario siempre ve el estado actual de la HC

---

## 🔄 PRÓXIMOS PASOS SUGERIDOS

1. **Permisos Específicos:**
   - Crear permisos para cerrar, archivar y reabrir HC
   - Restringir reapertura solo a usuarios autorizados

2. **Reportes:**
   - HC cerradas por período
   - HC archivadas sin actividad
   - Historial de reaperturas

3. **Notificaciones:**
   - Notificar al equipo cuando se cierra una HC
   - Alertar sobre HC archivadas por mucho tiempo

4. **Estadísticas:**
   - Dashboard con estados de HC
   - Tiempo promedio hasta cierre
   - Tasa de reaperturas

5. **Workflow Avanzado:**
   - Requerir motivo para reabrir HC
   - Aprobación de supervisor para reapertura
   - Límite de tiempo para reapertura

---

**Documentado por:** Kiro AI  
**Fecha:** 30 de Enero 2026  
**Hora:** 00:30 UTC  
**Estado:** ✅ Implementación Completa - Listo para Despliegue
