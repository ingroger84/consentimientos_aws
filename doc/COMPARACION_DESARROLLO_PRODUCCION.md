# 📊 COMPARACIÓN: DESARROLLO vs PRODUCCIÓN

**Fecha de Verificación**: 02 de Febrero 2026  
**Hora**: 05:10 UTC

---

## 🎯 RESUMEN EJECUTIVO

### Estado Actual
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  DESARROLLO (Localhost):                              │
│  • Frontend: 23.2.0 ✅                                │
│  • Backend:  23.2.0 ✅                                │
│                                                        │
│  PRODUCCIÓN (AWS):                                    │
│  • Frontend: 23.2.0 ✅ (Desplegado)                   │
│  • Backend:  23.1.0 ⚠️  (Desactualizado)              │
│                                                        │
│  DIFERENCIA: Backend desactualizado en producción    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📦 VERSIONES

### Desarrollo (Local)
| Componente | Versión | Fecha | Estado |
|------------|---------|-------|--------|
| Frontend | 23.2.0 | 2026-02-01 | ✅ Actualizado |
| Backend | 23.2.0 | 2026-02-01 | ✅ Actualizado |
| VERSION.md | 23.2.0 | 2026-02-01 | ✅ Actualizado |

### Producción (AWS)
| Componente | Versión | Fecha | Estado |
|------------|---------|-------|--------|
| Frontend | 23.2.0 | 2026-02-01 | ✅ Desplegado |
| Backend | 23.1.0 | 2026-01-30 | ⚠️ Desactualizado |
| VERSION.md | 23.1.0 | 2026-01-30 | ⚠️ Desactualizado |
| PM2 | 23.1.0 | - | ⚠️ Desactualizado |

---

## 🔍 CAMBIOS PENDIENTES DE DESPLIEGUE

### Backend (9 archivos modificados)

#### 1. Permisos y Autenticación
```
✓ backend/src/auth/constants/permissions.ts
  - Nuevos permisos para gestión de estados de HC
  - close_medical_records
  - archive_medical_records
  - reopen_medical_records
```

#### 2. Servicios de Facturación
```
✓ backend/src/billing/billing.service.ts
  - Corrección de suspensión de trials
  - Verificación de plan FREE antes de suspender
  - Sistema de notificaciones por email
```

#### 3. Servicios de Facturas
```
✓ backend/src/invoices/invoices.service.ts
  - Corrección de lógica de suspensión
  - Mejoras en manejo de planes FREE
```

#### 4. Servicio de Correo
```
✓ backend/src/mail/mail.service.ts
  - Cambio de nombre de remitente: "DatAgree" → "Archivo en Línea"
  - Nuevos métodos de notificación
  - sendTrialExpiredEmail()
  - sendTrialExpiredNotificationToAdmin()
```

#### 5. Controlador de Historias Clínicas
```
✓ backend/src/medical-records/medical-records.controller.ts
  - Guards de permisos implementados
  - @UseGuards(PermissionsGuard)
  - @RequirePermissions() en endpoints de gestión de estados
```

#### 6. Servicio de Historias Clínicas
```
✓ backend/src/medical-records/medical-records.service.ts
  - Corrección de estados inconsistentes
  - Agregada relación 'closer' en findOne()
  - Agregada relación 'closer' en getAllGroupedByTenant()
```

#### 7. Controlador de Consentimientos
```
✓ backend/src/consents/consents.controller.ts
  - Mejoras en manejo de consentimientos
```

#### 8. Servicio de Consentimientos
```
✓ backend/src/consents/consents.service.ts
  - Mejoras en lógica de consentimientos
```

#### 9. Servicio de Bold
```
✓ backend/src/payments/bold.service.ts
  - Mejoras en integración con Bold
  - Actualización de formato de autenticación
```

#### 10. Servicio de Tenants
```
✓ backend/src/tenants/tenants.service.ts
  - Mejoras en gestión de tenants
  - Estadísticas de HC por tenant
```

### Frontend (8 archivos modificados)

#### Ya Desplegados en Producción ✅
```
✓ frontend/src/App.tsx
✓ frontend/src/components/Layout.tsx
✓ frontend/src/components/TenantStatsModal.tsx
✓ frontend/src/hooks/useResourceLimitNotifications.ts
✓ frontend/src/pages/ClientsPage_new.tsx
✓ frontend/src/pages/SuperAdminMedicalRecordsPage.tsx
✓ frontend/src/pages/ViewMedicalRecordPage.tsx
✓ frontend/src/services/medical-records.service.ts
✓ frontend/src/types/medical-record.ts
✓ frontend/src/types/tenant.ts
```

---

## ⚠️ FUNCIONALIDADES FALTANTES EN PRODUCCIÓN

### 1. Permisos de Gestión de Estados de HC
**Estado**: ❌ NO DISPONIBLE en producción

**Impacto**:
- Los usuarios no pueden cerrar historias clínicas
- Los usuarios no pueden archivar historias clínicas
- Los usuarios no pueden reabrir historias clínicas
- Los botones aparecen en el frontend pero el backend rechaza las peticiones

**Solución**: Desplegar backend actualizado

---

### 2. Corrección de Estados de HC
**Estado**: ❌ NO DISPONIBLE en producción

**Impacto**:
- Estados pueden no coincidir entre lista y detalles
- Relación 'closer' no se carga correctamente
- Puede haber inconsistencias en la visualización

**Solución**: Desplegar backend actualizado

---

### 3. Sistema de Notificaciones por Email
**Estado**: ❌ NO DISPONIBLE en producción

**Impacto**:
- No se envían emails cuando expiran trials
- No se notifica al Super Admin
- Usuarios no reciben avisos de suspensión

**Solución**: Desplegar backend actualizado

---

### 4. Nombre de Remitente Actualizado
**Estado**: ❌ NO DISPONIBLE en producción

**Impacto**:
- Los correos se envían como "DatAgree"
- Debería ser "Archivo en Línea"

**Solución**: Desplegar backend actualizado

---

### 5. Corrección de Suspensión de Trials
**Estado**: ❌ NO DISPONIBLE en producción

**Impacto**:
- Planes FREE pueden ser suspendidos incorrectamente
- Lógica de suspensión no verifica el tipo de plan

**Solución**: Desplegar backend actualizado

---

## 🚀 PLAN DE DESPLIEGUE

### Paso 1: Compilar Backend
```bash
cd backend
NODE_OPTIONS='--max-old-space-size=2048' npm run build
```

### Paso 2: Subir Backend al Servidor
```bash
# Crear backup
ssh -i "keys/AWS-ISSABEL.pem" ubuntu@100.28.198.249 \
  "cd /home/ubuntu/consentimientos_aws/backend && \
   cp -r dist dist_backup_$(date +%Y%m%d_%H%M%S)"

# Subir archivos compilados
scp -i "keys/AWS-ISSABEL.pem" -r backend/dist/* \
  ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/
```

### Paso 3: Actualizar Archivos de Versión
```bash
# Subir VERSION.md
scp -i "keys/AWS-ISSABEL.pem" VERSION.md \
  ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/

# Subir package.json del backend
scp -i "keys/AWS-ISSABEL.pem" backend/package.json \
  ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/
```

### Paso 4: Reiniciar PM2
```bash
ssh -i "keys/AWS-ISSABEL.pem" ubuntu@100.28.198.249 \
  "pm2 restart datagree --update-env"
```

### Paso 5: Verificar
```bash
# Verificar versión de PM2
ssh -i "keys/AWS-ISSABEL.pem" ubuntu@100.28.198.249 "pm2 list"

# Verificar logs
ssh -i "keys/AWS-ISSABEL.pem" ubuntu@100.28.198.249 \
  "pm2 logs datagree --lines 50"
```

---

## 📊 IMPACTO DEL DESPLIEGUE

### Funcionalidades que se Activarán

#### 1. Gestión de Estados de HC ✅
- Cerrar historias clínicas
- Archivar historias clínicas
- Reabrir historias clínicas
- Permisos por rol

#### 2. Notificaciones por Email ✅
- Email al tenant cuando expira trial
- Email al Super Admin cuando expira trial
- Nombre de remitente correcto

#### 3. Correcciones de Lógica ✅
- Planes FREE no se suspenden
- Estados de HC consistentes
- Relación 'closer' cargada correctamente

---

## ⚠️ RIESGOS Y MITIGACIONES

### Riesgo 1: Downtime Durante Reinicio
**Probabilidad**: Baja  
**Impacto**: Bajo (< 5 segundos)  
**Mitigación**: PM2 reinicia rápidamente

### Riesgo 2: Errores en Código Nuevo
**Probabilidad**: Baja  
**Impacto**: Medio  
**Mitigación**: Backup de dist anterior creado

### Riesgo 3: Incompatibilidad con Base de Datos
**Probabilidad**: Muy Baja  
**Impacto**: Alto  
**Mitigación**: No hay cambios en esquema de BD

---

## ✅ CHECKLIST DE DESPLIEGUE

### Pre-Despliegue
- [ ] Verificar que backend compila sin errores
- [ ] Verificar que no hay cambios en esquema de BD
- [ ] Crear backup del dist actual en servidor
- [ ] Notificar a usuarios (si aplica)

### Despliegue
- [ ] Compilar backend localmente
- [ ] Subir archivos al servidor
- [ ] Actualizar VERSION.md
- [ ] Actualizar package.json
- [ ] Reiniciar PM2

### Post-Despliegue
- [ ] Verificar que PM2 muestra versión 23.2.0
- [ ] Verificar logs sin errores
- [ ] Probar login
- [ ] Probar gestión de estados de HC
- [ ] Verificar envío de emails

---

## 📝 RESUMEN

### Estado Actual
```
Frontend:  ✅ Sincronizado (23.2.0)
Backend:   ⚠️  Desactualizado (23.1.0 en prod, 23.2.0 en dev)
Diferencia: 1 versión MINOR
```

### Cambios Pendientes
```
Backend:   9 archivos modificados
Frontend:  0 archivos (ya desplegado)
Docs:      3 archivos modificados
```

### Funcionalidades Faltantes
```
1. Permisos de gestión de estados de HC
2. Corrección de estados inconsistentes
3. Sistema de notificaciones por email
4. Nombre de remitente actualizado
5. Corrección de suspensión de trials
```

### Acción Requerida
```
🚀 DESPLEGAR BACKEND 23.2.0 EN PRODUCCIÓN
```

---

**Verificado por**: Kiro AI  
**Fecha**: 02 de Febrero 2026  
**Hora**: 05:10 UTC  
**Estado**: ⚠️ BACKEND REQUIERE DESPLIEGUE
