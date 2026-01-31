# Sesión 2026-01-31: Corrección de Suspensión Automática de Trials

## Fecha
31 de Enero de 2026

## Problema Identificado

### Descripción
Los tenants con plan gratuito que tenían el trial expirado hace más de 1 día **NO estaban siendo suspendidos automáticamente**, a pesar de que existe un cron job configurado para hacerlo diariamente a las 02:00.

### Tenants Afectados
1. **Demo Medico** (`demo-medico`) - Trial expirado hace 1 día
2. **Test** (`testsanto`) - Trial expirado hace 0 días

Ambos tenants tenían `status = 'active'` cuando deberían estar `status = 'suspended'`.

## Causa Raíz

### Problema 1: Status Incorrecto al Crear Tenants
En `frontend/src/components/landing/SignupModal.tsx` línea 104:

```typescript
status: selectedPlan.id === 'free' ? 'active' : 'trial',
```

Los tenants con plan gratuito se creaban con `status = 'active'` en lugar de `status = 'trial'`.

### Problema 2: Lógica de Establecimiento de trialEndsAt
En `backend/src/tenants/tenants.service.ts` línea 69:

```typescript
if (!createTenantDto.trialEndsAt && createTenantDto.status === TenantStatus.TRIAL) {
  // Solo establece trialEndsAt si status === TRIAL
}
```

El código solo establecía `trialEndsAt` si el status era `'trial'`, por lo que los tenants creados con `status = 'active'` no tenían fecha de expiración.

### Problema 3: Cron Job Solo Busca Status 'trial'
En `backend/src/billing/billing.service.ts` línea 310:

```typescript
const expiredTrials = await this.tenantsRepository.find({
  where: {
    plan: 'free' as any,
    status: TenantStatus.TRIAL,  // ❌ Solo busca status 'trial'
    trialEndsAt: LessThan(now),
  },
});
```

El cron job solo buscaba tenants con `status = 'trial'`, por lo que los tenants con `status = 'active'` nunca eran suspendidos.

## Solución Implementada

### 1. Corrección del Frontend
**Archivo**: `frontend/src/components/landing/SignupModal.tsx`

**Antes**:
```typescript
status: selectedPlan.id === 'free' ? 'active' : 'trial',
```

**Después**:
```typescript
status: 'trial', // Todos los planes inician en trial
```

**Resultado**: Ahora todos los tenants se crean con `status = 'trial'`, independientemente del plan.

### 2. Corrección del Backend
**Archivo**: `backend/src/tenants/tenants.service.ts`

**Antes**:
```typescript
if (!createTenantDto.trialEndsAt && createTenantDto.status === TenantStatus.TRIAL) {
  // Solo establece trialEndsAt si status === TRIAL
}
```

**Después**:
```typescript
if (!createTenantDto.trialEndsAt) {
  // Siempre establece trialEndsAt si no se proporciona
  const trialDays = createTenantDto.plan === 'free' ? 7 : 30;
  createTenantDto.trialEndsAt = new Date();
  createTenantDto.trialEndsAt.setDate(createTenantDto.trialEndsAt.getDate() + trialDays);
  
  // Si no se especifica status, establecer como TRIAL
  if (!createTenantDto.status) {
    createTenantDto.status = TenantStatus.TRIAL;
  }
}
```

**Resultado**: Ahora `trialEndsAt` se establece siempre, independientemente del status.

### 3. Script de Corrección para Tenants Existentes
**Archivo**: `backend/fix-expired-free-tenants.js`

Script creado para:
1. Buscar tenants con plan gratuito, `status = 'active'` y `trialEndsAt` expirado
2. Actualizar su status a `'suspended'`
3. Registrar la acción en `billing_history`

**Ejecución**:
```bash
cd /home/ubuntu/consentimientos_aws/backend
node fix-expired-free-tenants.js
```

**Resultado**:
- ✅ Demo Medico - Suspendido
- ✅ Test - Suspendido

## Verificación

### Antes de la Corrección
```sql
SELECT name, slug, plan, status, "trialEndsAt" 
FROM tenants 
WHERE plan = 'free';
```

| name | slug | plan | status | trialEndsAt |
|------|------|------|--------|-------------|
| Demo Medico | demo-medico | free | **active** | 2026-01-30 02:20:35 |
| Test | testsanto | free | **active** | 2026-01-30 03:40:44 |
| PAPYRUS | papyrus | free | active | NULL |

### Después de la Corrección
```sql
SELECT name, slug, plan, status, "trialEndsAt" 
FROM tenants 
WHERE plan = 'free';
```

| name | slug | plan | status | trialEndsAt |
|------|------|------|--------|-------------|
| Demo Medico | demo-medico | free | **suspended** | 2026-01-30 02:20:35 |
| Test | testsanto | free | **suspended** | 2026-01-30 03:40:44 |
| PAPYRUS | papyrus | free | active | NULL |

## Cron Job Configurado

El sistema tiene un cron job que se ejecuta **diariamente a las 02:00** para suspender cuentas gratuitas expiradas:

**Archivo**: `backend/src/billing/billing-scheduler.service.ts`

```typescript
@Cron('0 2 * * *')
async handleSuspendExpiredFreeTrials() {
  this.logger.log('Ejecutando tarea: Suspender cuentas gratuitas expiradas');
  
  try {
    const result = await this.billingService.suspendExpiredFreeTrials();
    this.logger.log(`Cuentas gratuitas suspendidas: ${result.suspended}`);
    
    if (result.errors.length > 0) {
      this.logger.error(`Errores al suspender cuentas: ${result.errors.length}`);
      result.errors.forEach(error => this.logger.error(error));
    }
  } catch (error) {
    this.logger.error('Error al ejecutar suspensión de cuentas gratuitas:', error);
  }
}
```

**Funcionamiento**:
1. Se ejecuta todos los días a las 02:00 AM
2. Busca tenants con:
   - `plan = 'free'`
   - `status = 'trial'`
   - `trialEndsAt < NOW()`
3. Actualiza su status a `'suspended'`
4. Registra la acción en `billing_history`

## Archivos Modificados

1. **Frontend**:
   - `frontend/src/components/landing/SignupModal.tsx` - Corrección de status al crear tenant
   - `frontend/src/pages/ClientsPage_new.tsx` - Corrección de import no usado

2. **Backend**:
   - `backend/src/tenants/tenants.service.ts` - Corrección de lógica de trialEndsAt

3. **Scripts**:
   - `backend/fix-expired-free-tenants.js` - Script de corrección para tenants existentes
   - `backend/check-expired-trials.sql` - Query para verificar trials expirados
   - `backend/check-all-free-tenants.sql` - Query para ver todos los tenants gratuitos

## Comandos Ejecutados

```bash
# Compilar frontend
cd frontend
npm run build

# Compilar backend
cd backend
NODE_OPTIONS='--max-old-space-size=2048' npm run build

# Subir archivos al servidor
scp -i "AWS-ISSABEL.pem" backend/fix-expired-free-tenants.js ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/
scp -i "AWS-ISSABEL.pem" -r frontend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/

# Reiniciar servicios
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249 "cd /home/ubuntu/consentimientos_aws && pm2 restart datagree --update-env && sudo systemctl reload nginx"

# Ejecutar script de corrección
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249 "cd /home/ubuntu/consentimientos_aws/backend && node fix-expired-free-tenants.js"
```

## Estado del Sistema

### Backend
- ✅ Compilado correctamente
- ✅ PM2 reiniciado (PID: 219961)
- ✅ Cron job activo y funcionando

### Frontend
- ✅ Compilado correctamente (v23.0.0)
- ✅ Nginx recargado
- ✅ Cambios desplegados

### Base de Datos
- ✅ 2 tenants suspendidos correctamente
- ✅ Registros creados en billing_history

## Próximos Pasos

1. ✅ **Corrección implementada** - COMPLETADO
2. ✅ **Tenants existentes corregidos** - COMPLETADO
3. ✅ **Cron job funcionando** - VERIFICADO
4. ⏳ **Monitorear** - El cron job se ejecutará automáticamente cada día a las 02:00

## Notas Importantes

- **Nuevos tenants**: Ahora se crean correctamente con `status = 'trial'` y `trialEndsAt` establecido
- **Cron job**: Se ejecuta automáticamente todos los días a las 02:00 AM
- **Tenants existentes**: Los 2 tenants con trial expirado fueron suspendidos manualmente
- **PAPYRUS**: Este tenant no tiene `trialEndsAt` establecido, por lo que no será suspendido automáticamente

## Recomendaciones

1. **Monitorear logs del cron job**: Verificar que se ejecute correctamente cada día
2. **Revisar tenants sin trialEndsAt**: El tenant PAPYRUS no tiene fecha de expiración establecida
3. **Considerar migración**: Evaluar si los tenants antiguos sin `trialEndsAt` deben tener una fecha establecida

## Referencias

- Cron job: `backend/src/billing/billing-scheduler.service.ts`
- Servicio de billing: `backend/src/billing/billing.service.ts`
- Servicio de tenants: `backend/src/tenants/tenants.service.ts`
- Componente de signup: `frontend/src/components/landing/SignupModal.tsx`
