# PROBLEMA: Backend No Inicia en Producción - V41.1.5

**Fecha:** 2026-03-15  
**Estado:** 🔴 CRÍTICO - Backend no responde

---

## 🔴 PROBLEMA ACTUAL

El backend en producción AWS DatAgree NO está respondiendo en el puerto 3000. PM2 muestra que el proceso está "online" pero reinicia constantemente (18 reinicios).

### Error Principal

```
ReferenceError: crypto is not defined
    at SchedulerOrchestrator.addCron (/home/ubuntu/consentimientos_aws/backend/node_modules/@nestjs/schedule/dist/scheduler.orchestrator.js:90:38)
```

### Síntomas

1. ✅ PM2 muestra proceso "online"
2. ❌ Backend NO responde en puerto 3000
3. ❌ curl http://localhost:3000/api/health falla
4. ❌ Frontend muestra error de CORS (porque backend no responde)
5. ❌ No se pueden crear historias clínicas

---

## 🔍 CAUSA RAÍZ

El módulo `@nestjs/schedule` está intentando usar el módulo nativo `crypto` de Node.js, pero no lo encuentra. Esto puede deberse a:

1. **Versión de Node.js incompatible** en producción
2. **Problema con el código compilado** que no importa correctamente `crypto`
3. **Configuración incorrecta de PM2** que no expone los módulos nativos

---

## 📊 ESTADO DEL SISTEMA

### Producción (AWS DatAgree)
- **Servidor:** 100.28.198.249
- **PM2 Status:** Online (PID: 1001606)
- **Reinicios:** 18 veces
- **Puerto 3000:** NO responde
- **Base de Datos:** ✅ Constraints corregidos
- **Versión:** 41.1.2 (ecosystem.config.js)

### Localhost
- **Versión:** 41.1.5
- **Estado:** ✅ Compilado correctamente
- **Entidad:** ✅ Corregida (sin `unique: true`)

---

## ✅ CORRECCIONES YA APLICADAS

1. ✅ Constraint de `record_number` corregido en BD
2. ✅ Entidad `medical-record.entity.ts` corregida
3. ✅ `ecosystem.config.js` actualizado para usar `.env`
4. ✅ Código compilado subido a producción

---

## 🔧 SOLUCIONES POSIBLES

### Solución 1: Verificar Versión de Node.js

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "node --version"
```

Si la versión es < 18, actualizar Node.js.

### Solución 2: Deshabilitar Módulo de Schedule Temporalmente

Comentar el `ScheduleModule` en `app.module.ts` para que el backend inicie sin el scheduler:

```typescript
// ScheduleModule.forRoot(), // Comentar temporalmente
```

### Solución 3: Importar crypto Explícitamente

Agregar al inicio de `main.ts`:

```typescript
import * as crypto from 'crypto';
global.crypto = crypto;
```

### Solución 4: Usar Versión Anterior del Backend

Restaurar el backup anterior que funcionaba:

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws
# Listar backups
ls -la | grep backend-backup
# Restaurar backup
rm -rf backend/dist
cp -r backend-backup-XXXXX backend/dist
pm2 restart ecosystem.config.js
```

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### Opción A: Solución Rápida (Restaurar Backup)

1. Restaurar el último backup funcional
2. Aplicar solo la corrección del constraint en la entidad
3. Recompilar y redesplegar

### Opción B: Solución Completa (Arreglar crypto)

1. Verificar versión de Node.js en producción
2. Actualizar Node.js si es necesario
3. Agregar importación explícita de crypto
4. Recompilar y redesplegar

### Opción C: Solución Temporal (Sin Schedule)

1. Deshabilitar `ScheduleModule` temporalmente
2. Recompilar y redesplegar
3. Backend funcionará sin tareas programadas
4. Arreglar el problema de crypto después

---

## 📝 COMANDOS ÚTILES

### Verificar Estado
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 status && pm2 logs --lines 20 --nostream"
```

### Verificar Node.js
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "node --version && npm --version"
```

### Reiniciar PM2
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cd /home/ubuntu/consentimientos_aws && pm2 restart ecosystem.config.js"
```

### Ver Logs en Tiempo Real
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs"
```

---

## 🚨 IMPACTO

- ❌ Sistema completamente inoperativo
- ❌ No se pueden crear historias clínicas
- ❌ Frontend muestra errores de CORS
- ❌ Usuarios no pueden acceder al sistema

---

## 📌 NOTA IMPORTANTE

El problema del constraint de `record_number` YA ESTÁ SOLUCIONADO en la base de datos. El problema actual es DIFERENTE y está relacionado con el módulo `crypto` de Node.js.

Una vez que el backend inicie correctamente, el problema original de "duplicate key" debería estar resuelto.

---

**Autor:** Kiro AI  
**Última actualización:** 2026-03-15 19:00 UTC
