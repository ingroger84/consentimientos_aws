# Seguridad y Mejores Prácticas

## Seguridad de Datos

### 1. Encriptación

**Datos en tránsito:**
- ✅ HTTPS obligatorio (ya implementado)
- ✅ TLS 1.2 o superior
- ✅ Certificados SSL válidos

**Datos en reposo:**
```typescript
// Encriptar campos sensibles en la base de datos
import { createCipheriv, createDecipheriv } from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key = process.env.ENCRYPTION_KEY;

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encrypted: string): string {
    const [ivHex, authTagHex, encryptedText] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

### 2. Control de Acceso

**Niveles de acceso:**
```typescript
// Guard para verificar acceso a HC
@Injectable()
export class MedicalRecordAccessGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const recordId = request.params.id;

    // 1. Verificar que pertenece al mismo tenant
    const record = await this.medicalRecordsService.findOne(recordId);
    if (record.tenantId !== user.tenantId) {
      throw new ForbiddenException('Acceso denegado');
    }

    // 2. Verificar permisos
    if (!user.permissions.includes('view_medical_records')) {
      throw new ForbiddenException('Sin permisos');
    }

    // 3. Si es operador, verificar que sea de su sede
    if (user.role.type === 'operador' && user.branches) {
      if (!user.branches.some(b => b.id === record.branchId)) {
        throw new ForbiddenException('Solo puede ver HC de su sede');
      }
    }

    // 4. Auditar acceso
    await this.auditService.log({
      action: 'access_attempt',
      entityType: 'medical_record',
      entityId: recordId,
      userId: user.id,
      success: true,
    });

    return true;
  }
}
```


### 3. Auditoría Completa

**Registrar todas las acciones:**
```typescript
interface AuditLog {
  action: string; // create, read, update, delete, sign, export
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  tenantId: string;
  ipAddress: string;
  userAgent: string;
  oldValues?: any;
  newValues?: any;
  timestamp: Date;
}

// Middleware de auditoría
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (data) => {
        await this.auditService.log({
          action: request.method,
          entityType: this.getEntityType(request.url),
          userId: request.user.id,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          duration: Date.now() - startTime,
          success: true,
        });
      }),
      catchError(async (error) => {
        await this.auditService.log({
          action: request.method,
          entityType: this.getEntityType(request.url),
          userId: request.user?.id,
          ipAddress: request.ip,
          error: error.message,
          success: false,
        });
        throw error;
      }),
    );
  }
}
```

### 4. Backup y Recuperación

**Estrategia de backup:**
```bash
# Backup diario automático
0 2 * * * pg_dump -U postgres -d consentimientos -t medical_records* > /backup/medical_records_$(date +\%Y\%m\%d).sql

# Backup incremental cada 6 horas
0 */6 * * * pg_dump -U postgres -d consentimientos --schema-only > /backup/schema_$(date +\%Y\%m\%d_\%H).sql

# Retención: 30 días
find /backup -name "medical_records_*.sql" -mtime +30 -delete
```

## Mejores Prácticas

### 1. Validaciones Médicas

```typescript
// Validar signos vitales
class VitalSignsValidator {
  static validate(vitals: VitalSigns): ValidationResult {
    const errors = [];

    // Presión arterial
    if (vitals.systolic < 70 || vitals.systolic > 200) {
      errors.push('Presión sistólica fuera de rango normal');
    }
    if (vitals.diastolic < 40 || vitals.diastolic > 130) {
      errors.push('Presión diastólica fuera de rango normal');
    }

    // Frecuencia cardíaca
    if (vitals.heartRate < 40 || vitals.heartRate > 200) {
      errors.push('Frecuencia cardíaca fuera de rango normal');
    }

    // Temperatura
    if (vitals.temperature < 35 || vitals.temperature > 42) {
      errors.push('Temperatura fuera de rango normal');
    }

    // Saturación de oxígeno
    if (vitals.oxygenSaturation < 70 || vitals.oxygenSaturation > 100) {
      errors.push('Saturación de oxígeno fuera de rango');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: this.getWarnings(vitals),
    };
  }

  static getWarnings(vitals: VitalSigns): string[] {
    const warnings = [];

    if (vitals.systolic > 140 || vitals.diastolic > 90) {
      warnings.push('Posible hipertensión');
    }

    if (vitals.oxygenSaturation < 95) {
      warnings.push('Saturación de oxígeno baja');
    }

    return warnings;
  }
}
```


### 2. Integridad de Datos

```typescript
// Prevenir modificación de HC cerradas
@BeforeUpdate()
validateBeforeUpdate() {
  if (this.isLocked) {
    throw new Error('No se puede modificar una historia clínica bloqueada');
  }
  
  if (this.status === 'closed') {
    throw new Error('No se puede modificar una historia clínica cerrada');
  }
}

// Firma digital para integridad
class DigitalSignatureService {
  async signEvolution(evolution: Evolution, userId: string): Promise<void> {
    const content = JSON.stringify({
      id: evolution.id,
      content: evolution.content,
      date: evolution.evolutionDate,
      userId,
    });

    const signature = crypto
      .createHmac('sha256', process.env.SIGNATURE_SECRET)
      .update(content)
      .digest('hex');

    evolution.signedBy = userId;
    evolution.signedAt = new Date();
    evolution.signatureHash = signature;
    
    await this.evolutionsRepository.save(evolution);
  }

  async verifySignature(evolution: Evolution): Promise<boolean> {
    const content = JSON.stringify({
      id: evolution.id,
      content: evolution.content,
      date: evolution.evolutionDate,
      userId: evolution.signedBy,
    });

    const expectedSignature = crypto
      .createHmac('sha256', process.env.SIGNATURE_SECRET)
      .update(content)
      .digest('hex');

    return evolution.signatureHash === expectedSignature;
  }
}
```

### 3. Performance

```typescript
// Paginación eficiente
async findAllPaginated(
  tenantId: string,
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResult<MedicalRecord>> {
  const [records, total] = await this.medicalRecordsRepository.findAndCount({
    where: { tenantId },
    relations: ['client', 'branch'],
    order: { admissionDate: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: records,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Caching de búsquedas frecuentes
@Injectable()
export class CIE10Service {
  private cache = new Map<string, any>();

  async search(term: string): Promise<CIE10Code[]> {
    const cacheKey = `cie10:${term}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const results = await this.cie10Repository
      .createQueryBuilder('cie10')
      .where('cie10.code ILIKE :term', { term: `%${term}%` })
      .orWhere('cie10.description ILIKE :term', { term: `%${term}%` })
      .limit(20)
      .getMany();

    this.cache.set(cacheKey, results);
    
    // Limpiar cache después de 5 minutos
    setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);

    return results;
  }
}
```

### 4. Exportación Segura

```typescript
// Exportar HC completa en PDF
class MedicalRecordExportService {
  async exportToPDF(
    recordId: string,
    userId: string,
    tenantId: string,
  ): Promise<Buffer> {
    // Verificar permisos
    if (!await this.hasExportPermission(userId)) {
      throw new ForbiddenException('Sin permisos para exportar');
    }

    // Obtener HC completa
    const record = await this.medicalRecordsService.findOne(
      recordId,
      tenantId,
      userId,
    );

    // Generar PDF
    const pdf = await this.pdfService.generate({
      template: 'medical-record',
      data: record,
      watermark: 'CONFIDENCIAL',
    });

    // Auditar exportación
    await this.auditService.log({
      action: 'export',
      entityType: 'medical_record',
      entityId: recordId,
      userId,
      tenantId,
      format: 'pdf',
    });

    return pdf;
  }
}
```

## Cumplimiento Normativo

### Checklist de Cumplimiento

- ✅ Historia clínica única por paciente
- ✅ Identificación completa del paciente
- ✅ Fecha y hora en cada registro
- ✅ Firma del profesional responsable
- ✅ Conservación mínima 20 años
- ✅ Auditoría de accesos
- ✅ Protección de datos personales (HABEAS DATA)
- ✅ Backup automático
- ✅ Encriptación de datos sensibles
- ✅ Control de acceso por roles
- ✅ Trazabilidad completa
- ✅ Integridad de datos (firma digital)
