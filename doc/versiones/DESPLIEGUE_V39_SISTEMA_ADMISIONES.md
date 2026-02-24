# Despliegue v39.0.0 - Sistema de Admisiones
## Fecha: 2026-02-18

---

## ✅ IMPLEMENTACIÓN COMPLETADA

Se ha implementado completamente el **Sistema de Admisiones Múltiples** para Historias Clínicas.

---

## 📦 ARCHIVOS CREADOS/MODIFICADOS

### Backend

**Nuevos:**
- ✅ `backend/migrations/add-admissions-system.sql` - Migración SQL completa
- ✅ `backend/src/medical-records/entities/admission.entity.ts` - Entidad Admission
- ✅ `backend/src/medical-records/dto/admission.dto.ts` - DTOs de admisiones
- ✅ `backend/src/medical-records/admissions.service.ts` - Servicio de admisiones
- ✅ `backend/src/medical-records/admissions.controller.ts` - Controlador REST

**Modificados:**
- ✅ `backend/src/medical-records/entities/medical-record.entity.ts` - Agregada relación admissions
- ✅ `backend/src/medical-records/entities/anamnesis.entity.ts` - Agregada relación admission
- ✅ `backend/src/medical-records/entities/physical-exam.entity.ts` - Agregada relación admission
- ✅ `backend/src/medical-records/entities/diagnosis.entity.ts` - Agregada relación admission
- ✅ `backend/src/medical-records/entities/evolution.entity.ts` - Agregada relación admission
- ✅ `backend/src/medical-records/entities/medical-record-consent.entity.ts` - Agregada relación admission
- ✅ `backend/src/medical-records/dto/index.ts` - Agregado admissionId a DTOs
- ✅ `backend/src/medical-records/medical-records.module.ts` - Agregado AdmissionsService y Controller
- ✅ `backend/src/config/version.ts` - Actualizado a 39.0.0
- ✅ `backend/package.json` - Actualizado a 39.0.0

### Frontend

**Nuevos:**
- ✅ `frontend/src/services/admissions.service.ts` - Servicio de admisiones
- ✅ `frontend/src/components/AdmissionTypeModal.tsx` - Modal de selección de tipo
- ✅ `frontend/src/components/medical-records/AdmissionsSection.tsx` - Componente de vista de admisiones

**Modificados:**
- ✅ `frontend/src/pages/CreateMedicalRecordPage.tsx` - Lógica de detección de HC existente
- ✅ `frontend/src/services/medical-records.service.ts` - Agregado método getByClient
- ✅ `frontend/src/config/version.ts` - Actualizado a 39.0.0
- ✅ `frontend/package.json` - Actualizado a 39.0.0

### Scripts y Documentación

- ✅ `scripts/deploy-admissions-v39.ps1` - Script de despliegue automatizado
- ✅ `IMPLEMENTACION_SISTEMA_ADMISIONES_V39.md` - Documentación completa
- ✅ `DESPLIEGUE_V39_SISTEMA_ADMISIONES.md` - Este documento

---

## 🚀 PASOS PARA DESPLEGAR

### Opción 1: Script Automatizado (Recomendado)

```powershell
# Ejecutar desde la raíz del proyecto
.\scripts\deploy-admissions-v39.ps1
```

El script realiza automáticamente:
1. Compilación de frontend
2. Compilación de backend
3. Aplicación de migración SQL
4. Despliegue de backend
5. Despliegue de frontend
6. Verificación del despliegue

### Opción 2: Manual

#### 1. Compilar Frontend
```bash
cd frontend
npm run build
cd ..
```

#### 2. Compilar Backend
```bash
cd backend
npm run build
cd ..
```

#### 3. Aplicar Migración SQL
```bash
# Subir archivo al servidor
scp -i AWS-ISSABEL.pem backend/migrations/add-admissions-system.sql ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/migrations/

# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ejecutar migración
cd /home/ubuntu/consentimientos_aws
PGPASSWORD=$(cat backend/.env | grep DB_PASSWORD | cut -d '=' -f2) psql -h localhost -U postgres -d consentimientos_db -f backend/migrations/add-admissions-system.sql
```

#### 4. Desplegar Backend
```bash
# Desde local
scp -i AWS-ISSABEL.pem -r backend/dist ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/
scp -i AWS-ISSABEL.pem -r backend/src/medical-records ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/src/

# En servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
pm2 restart datagree
```

#### 5. Desplegar Frontend
```bash
# Desde local
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "rm -rf /home/ubuntu/consentimientos_aws/frontend/dist/*"
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/

# Reiniciar nginx
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo systemctl restart nginx"
```

---

## ✅ VERIFICACIÓN POST-DESPLIEGUE

### 1. Verificar Versiones

**Backend:**
```bash
curl https://archivoenlinea.com/api/version
# Debe mostrar: "version": "39.0.0"
```

**Frontend:**
```bash
curl https://archivoenlinea.com/version.json
# Debe mostrar: "version": "39.0.0"
```

### 2. Verificar Base de Datos

```sql
-- Verificar tabla admissions
SELECT COUNT(*) FROM admissions;

-- Verificar columnas admission_id
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE column_name = 'admission_id';

-- Verificar migración de datos
SELECT 
  mr.record_number,
  COUNT(a.id) as admissions_count
FROM medical_records mr
LEFT JOIN admissions a ON a.medical_record_id = mr.id
GROUP BY mr.id, mr.record_number
LIMIT 10;
```

### 3. Verificar Endpoints

```bash
# Listar admisiones de una HC
curl -X GET https://archivoenlinea.com/api/admissions/medical-record/{hc-id} \
  -H "Authorization: Bearer {token}"

# Crear nueva admisión
curl -X POST https://archivoenlinea.com/api/admissions \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "medicalRecordId": "hc-uuid",
    "admissionType": "control",
    "reason": "Control de seguimiento"
  }'
```

### 4. Pruebas Funcionales

1. **Crear HC para paciente nuevo:**
   - Ir a "Historias Clínicas" → "Nueva HC"
   - Buscar/crear paciente
   - Completar formulario
   - Verificar que se crea correctamente

2. **Crear admisión para paciente existente:**
   - Ir a "Historias Clínicas" → "Nueva HC"
   - Buscar paciente que ya tiene HC
   - Debe aparecer modal de selección de tipo de admisión
   - Seleccionar tipo (ej: "Control")
   - Ingresar motivo
   - Verificar que se crea la admisión

3. **Agregar registros a admisión:**
   - Abrir HC con admisión activa
   - Agregar anamnesis → Verificar que se vincula a la admisión
   - Agregar examen físico → Verificar que se vincula a la admisión
   - Agregar diagnóstico → Verificar que se vincula a la admisión
   - Agregar evolución → Verificar que se vincula a la admisión

4. **Ver admisiones:**
   - Abrir HC
   - Verificar que se muestran todas las admisiones
   - Expandir admisión → Ver estadísticas
   - Verificar que muestra correctamente los registros

5. **Cerrar admisión:**
   - Abrir HC con admisión activa
   - Clic en "Cerrar Admisión"
   - Ingresar notas de cierre
   - Verificar que cambia a estado "Cerrada"

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### Backend

✅ Tabla `admissions` con todos los campos necesarios
✅ Relaciones con anamnesis, exámenes, diagnósticos, evoluciones, consentimientos
✅ Migración automática de datos existentes
✅ Endpoints REST completos:
  - POST /admissions - Crear admisión
  - GET /admissions/medical-record/:id - Listar admisiones
  - GET /admissions/:id - Obtener admisión
  - PUT /admissions/:id - Actualizar admisión
  - PATCH /admissions/:id/close - Cerrar admisión
  - PATCH /admissions/:id/reopen - Reabrir admisión
  - PATCH /admissions/:id/cancel - Cancelar admisión
  - GET /admissions/medical-record/:id/active - Obtener admisión activa

✅ Validaciones y permisos
✅ Auditoría completa
✅ Documentación Swagger

### Frontend

✅ Servicio de admisiones con todos los métodos
✅ Modal de selección de tipo de admisión
✅ Detección automática de HC existente
✅ Componente de visualización de admisiones
✅ Integración con página de crear HC
✅ Actualización de versiones

---

## 📊 TIPOS DE ADMISIÓN

- 🆕 **Primera Vez**: Primera consulta del paciente
- 📋 **Control**: Consulta de control/seguimiento
- 🚨 **Urgencia**: Atención de urgencia
- 🏥 **Hospitalización**: Ingreso hospitalario
- ⚕️ **Cirugía**: Procedimiento quirúrgico
- 💉 **Procedimiento**: Procedimiento ambulatorio
- 💻 **Telemedicina**: Consulta virtual
- 🏠 **Domiciliaria**: Atención domiciliaria
- 👨‍⚕️ **Interconsulta**: Interconsulta con especialista
- 📝 **Otro**: Otro tipo de admisión

---

## 🔄 FLUJO DE TRABAJO

### Paciente Nuevo
1. Usuario crea nueva HC
2. Sistema crea HC con admisión inicial automática
3. Usuario agrega registros (anamnesis, exámenes, etc.)
4. Todos los registros se vinculan a la admisión inicial

### Paciente Existente
1. Usuario intenta crear nueva HC
2. Sistema detecta HC existente
3. Muestra modal de selección de tipo de admisión
4. Usuario selecciona tipo y motivo
5. Sistema crea nueva admisión en la HC existente
6. Usuario agrega registros a la nueva admisión

---

## 📝 NOTAS IMPORTANTES

1. **Compatibilidad**: Los datos existentes se migran automáticamente. Cada HC existente tendrá una admisión inicial.

2. **Validación**: No se puede crear una nueva HC si el paciente ya tiene una HC activa. En su lugar, se debe crear una nueva admisión.

3. **Permisos**: Los permisos existentes de `medical_records.*` se aplican también a las admisiones.

4. **Auditoría**: Todas las operaciones de admisiones se registran en la auditoría.

5. **Cierre**: Las admisiones se pueden cerrar independientemente de la HC.

---

## 🐛 TROUBLESHOOTING

### Error: "Tabla admissions no existe"
**Solución**: Ejecutar la migración SQL manualmente

### Error: "Column admission_id does not exist"
**Solución**: Verificar que la migración se aplicó correctamente en todas las tablas

### Modal no aparece al seleccionar paciente existente
**Solución**: Verificar que el servicio `getByClient` está funcionando correctamente

### Registros no se vinculan a admisión
**Solución**: Verificar que los DTOs incluyen el campo `admissionId`

---

## 📞 SOPORTE

Para cualquier problema:

1. Revisar logs del backend: `pm2 logs datagree`
2. Revisar logs de nginx: `sudo tail -f /var/log/nginx/error.log`
3. Verificar base de datos: Conectar con psql y revisar tablas
4. Consultar documentación: `IMPLEMENTACION_SISTEMA_ADMISIONES_V39.md`

---

## ✨ PRÓXIMAS MEJORAS

- [ ] Agregar filtros por tipo de admisión
- [ ] Estadísticas de admisiones por período
- [ ] Exportar admisiones a PDF
- [ ] Notificaciones de admisiones pendientes
- [ ] Dashboard de admisiones

---

**Versión**: 39.0.0  
**Fecha**: 2026-02-18  
**Estado**: ✅ LISTO PARA DESPLEGAR
