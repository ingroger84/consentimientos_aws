# Acciones Críticas Antes de Desplegar a Producción

**Fecha:** 2026-01-27  
**Versión:** 15.1.0  
**Prioridad:** 🚨 CRÍTICO

---

## ⚠️ ADVERTENCIA

**NO DESPLEGAR A PRODUCCIÓN** hasta completar TODAS las acciones críticas listadas abajo.

---

## 🔴 ACCIONES CRÍTICAS (Completar HOY)

### 1. 🔐 Rotar Credenciales AWS Expuestas

**PROBLEMA:** Credenciales AWS están expuestas en el archivo `.env`

**PASOS:**
1. Ir a AWS Console → IAM → Users
2. Eliminar o desactivar las claves actuales (ver CREDENCIALES.md)
3. Generar nuevas claves de acceso
4. Actualizar `.env` con las nuevas claves
5. Verificar que `.env` esté en `.gitignore`

**VERIFICACIÓN:**
```bash
# Verificar que .env no está trackeado
git status backend/.env
# Debe mostrar: "nothing to commit"
```

### 2. 🔑 Generar JWT Secret Fuerte

**PROBLEMA:** JWT_SECRET usa valor por defecto inseguro

**PASOS:**
```bash
# Generar secret fuerte
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copiar el resultado y actualizar en .env
JWT_SECRET=<resultado_del_comando_anterior>
```

### 3. 📧 Cambiar Contraseña de Gmail

**PROBLEMA:** Contraseña de aplicación de Gmail está expuesta

**PASOS:**
1. Ir a https://myaccount.google.com/apppasswords
2. Revocar la contraseña actual: `tifk jmqh nvbn zaqa`
3. Generar nueva contraseña de aplicación
4. Actualizar en `.env`:
```env
SMTP_PASSWORD=<nueva_contraseña>
```

### 4. 🔒 Mover Archivo PEM

**PROBLEMA:** `AWS-ISSABEL.pem` está en la raíz del proyecto

**PASOS:**
```bash
# Crear carpeta keys si no existe
mkdir -p keys

# Mover archivo PEM
mv AWS-ISSABEL.pem keys/

# Verificar que keys/ está en .gitignore
grep "keys/" .gitignore
```

### 5. 📝 Crear .env.example

**PASOS:**
```bash
# Ya creado en: backend/.env.example
# Verificar que NO contiene valores reales
cat backend/.env.example
```

### 6. 🗑️ Limpiar Historial de Git (Si .env fue commiteado)

**VERIFICAR:**
```bash
# Buscar .env en historial
git log --all --full-history -- backend/.env

# Si aparece, ejecutar:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push (CUIDADO: reescribe historial)
git push origin --force --all
```

---

## 🟡 ACCIONES IMPORTANTES (Completar ESTA SEMANA)

### 7. 🔧 Configurar Variables de Producción

**Actualizar en `.env`:**
```env
NODE_ENV=production
RATE_LIMIT_MAX=30
CORS_ORIGIN=https://archivoenlinea.com
BASE_DOMAIN=archivoenlinea.com
```

### 8. 🗄️ Ejecutar Migración de Límites HC

**PASOS:**
```bash
cd backend
.\apply-hc-limits-migration.ps1
```

**VERIFICAR:**
```sql
SELECT 
  id,
  name,
  medical_records_limit,
  mr_consent_templates_limit,
  consent_templates_limit
FROM plans;
```

### 9. 📊 Configurar Logs de Producción

**Instalar Winston:**
```bash
cd backend
npm install winston
```

**Crear `backend/src/config/logger.ts`:**
```typescript
import * as winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### 10. 🏥 Agregar Health Check

**Crear `backend/src/health/health.controller.ts`:**
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version,
    };
  }
}
```

---

## 🟢 ACCIONES RECOMENDADAS (Completar ESTE MES)

### 11. 📈 Configurar Monitoreo

**Opciones:**
- Sentry para error tracking
- New Relic para APM
- CloudWatch para logs

### 12. 🔄 Configurar Backups Automáticos

**Crear cron job:**
```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 2 AM
0 2 * * * /usr/bin/pg_dump -h localhost -U admin consentimientos > /backups/db_$(date +\%Y\%m\%d).sql
```

### 13. 🧪 Ejecutar Tests

**Backend:**
```bash
cd backend
npm test
npm run test:e2e
```

**Frontend:**
```bash
cd frontend
npm test
```

### 14. 🚀 Configurar PM2

**Instalar PM2:**
```bash
npm install -g pm2
```

**Iniciar aplicación:**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 15. 🌐 Configurar Nginx

**Instalar Nginx:**
```bash
sudo apt-get install nginx
```

**Configurar:**
```bash
sudo nano /etc/nginx/sites-available/consentimientos
# Copiar configuración de CHECKLIST_PRODUCCION.md

sudo ln -s /etc/nginx/sites-available/consentimientos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de desplegar, verificar:

### Seguridad
- [ ] Credenciales AWS rotadas
- [ ] JWT_SECRET generado y actualizado
- [ ] Contraseña Gmail cambiada
- [ ] Archivo PEM movido a keys/
- [ ] .env no está en Git
- [ ] .env.example creado sin valores reales

### Configuración
- [ ] NODE_ENV=production
- [ ] CORS_ORIGIN actualizado
- [ ] BASE_DOMAIN actualizado
- [ ] RATE_LIMIT_MAX ajustado
- [ ] Todas las variables de entorno configuradas

### Base de Datos
- [ ] Migración de límites HC ejecutada
- [ ] Índices optimizados
- [ ] Backup manual creado
- [ ] Backup automático configurado

### Aplicación
- [ ] Backend compila sin errores
- [ ] Frontend compila sin errores
- [ ] Tests pasando
- [ ] Health check funcionando

### Infraestructura
- [ ] PM2 configurado
- [ ] Nginx configurado
- [ ] SSL/TLS configurado
- [ ] Logs configurados

---

## 📞 CONTACTOS DE EMERGENCIA

**En caso de problemas durante el despliegue:**

- **Desarrollador Principal:** [Tu nombre]
- **DevOps:** [Nombre]
- **DBA:** [Nombre]
- **Soporte AWS:** https://console.aws.amazon.com/support/

---

## 🔄 ROLLBACK PLAN

Si algo sale mal durante el despliegue:

### 1. Detener Servicios
```bash
pm2 stop all
```

### 2. Restaurar Base de Datos
```bash
psql -h localhost -U admin consentimientos < backups/backup_YYYYMMDD_HHMMSS.sql
```

### 3. Revertir Código
```bash
git reset --hard HEAD~1
```

### 4. Reiniciar Servicios
```bash
pm2 restart all
```

---

## 📝 NOTAS FINALES

1. **Hacer backup completo** antes de cualquier cambio
2. **Probar en staging** antes de producción
3. **Desplegar en horario de bajo tráfico** (madrugada)
4. **Tener plan de rollback listo**
5. **Monitorear logs** durante y después del despliegue
6. **Comunicar a usuarios** sobre mantenimiento programado

---

**Documento creado:** 2026-01-27  
**Estado:** 🚨 ACCIÓN REQUERIDA  
**Próxima revisión:** Después de completar acciones críticas
