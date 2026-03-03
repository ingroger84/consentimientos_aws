# Despliegue Backend v52.2.0 - Sistema de Perfiles y Permisos

**Fecha:** 2026-03-02  
**Servidor:** admin.archivoenlinea.com (100.28.198.249)  
**Estado:** ✅ COMPLETADO EXITOSAMENTE

---

## Resumen

Se desplegó exitosamente el backend v52.2.0 con el nuevo sistema de perfiles y permisos en el servidor de producción AWS.

---

## Cambios Desplegados

### 1. Sistema de Perfiles y Permisos

#### Entidades Creadas (4)
- `Profile` - Perfiles con permisos personalizables
- `SystemModule` - Catálogo de 64 módulos del sistema
- `ModuleAction` - 45 acciones disponibles (view, create, edit, delete, assign, etc.)
- `PermissionAudit` - Auditoría completa de cambios en permisos

#### Controllers (2)
- `ProfilesController` - 10 endpoints para gestión de perfiles
- `ModulesController` - 3 endpoints para consulta de módulos y acciones

#### Endpoints Disponibles

**Perfiles:**
- `POST /api/profiles` - Crear perfil
- `GET /api/profiles` - Listar perfiles
- `GET /api/profiles/:id` - Obtener perfil
- `PATCH /api/profiles/:id` - Actualizar perfil
- `DELETE /api/profiles/:id` - Eliminar perfil
- `POST /api/profiles/assign` - Asignar perfil a usuario
- `DELETE /api/profiles/revoke/:userId` - Revocar perfil
- `GET /api/profiles/:id/audit` - Auditoría del perfil
- `POST /api/profiles/check-permission` - Verificar permiso
- `GET /api/profiles/user/:userId/permissions` - Permisos de usuario

**Módulos:**
- `GET /api/modules` - Listar módulos
- `GET /api/modules/by-category` - Módulos por categoría
- `GET /api/modules/:id/actions` - Acciones de un módulo

---

## Proceso de Despliegue

### 1. Compilación Local
```bash
cd backend
npm run build
```

### 2. Creación del Paquete
```bash
tar -czf backend-dist-v52.2.0.tar.gz dist/ package.json package-lock.json
```

### 3. Subida al Servidor
```bash
scp -i credentials/AWS-ISSABEL.pem backend-dist-v52.2.0.tar.gz ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/
```

### 4. Instalación en Servidor
```bash
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
tar -xzf backend-dist-v52.2.0.tar.gz
npm ci --only=production --legacy-peer-deps
npm install axios --legacy-peer-deps
```

### 5. Solución del Problema de Crypto

Se encontró un problema con el módulo `crypto` en Node.js 18. El módulo `@nestjs/schedule` requiere `crypto.randomUUID()` pero no estaba disponible globalmente.

**Solución Implementada:**

Creado archivo `polyfill.js`:
```javascript
// Polyfill para crypto en Node.js 18
const crypto = require('crypto');
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => crypto.randomUUID(),
    getRandomValues: (arr) => crypto.getRandomValues(arr),
    subtle: crypto.webcrypto?.subtle
  };
}
```

Actualizado `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'datagree',
    script: './dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    node_args: '--dns-result-order=ipv4first --require ./polyfill.js',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 6. Reinicio del Servicio
```bash
pm2 delete datagree
pm2 start ecosystem.config.js
pm2 save
```

---

## Verificación del Despliegue

### 1. Estado del Proceso PM2
```bash
pm2 status datagree
```

**Resultado:**
- Status: ✅ online
- Uptime: estable
- Restarts: 0 (después de la corrección)
- Memory: ~138 MB

### 2. Verificación de Endpoints

**Health Check:**
```bash
curl https://archivoenlinea.com/api/health
```
**Respuesta:** ✅ 200 OK
```json
{
  "status": "operational",
  "timestamp": "2026-03-02T07:21:24.286Z",
  "uptime": "0m",
  "services": {
    "api": "operational",
    "database": "operational",
    "storage": "operational"
  }
}
```

**Profiles Endpoint:**
```bash
curl https://archivoenlinea.com/api/profiles
```
**Respuesta:** ✅ 401 Unauthorized (esperado, requiere autenticación)
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 3. Logs del Backend
```bash
pm2 logs datagree --lines 50
```

**Rutas Mapeadas Correctamente:**
```
[RouterExplorer] Mapped {/api/profiles, POST} route
[RouterExplorer] Mapped {/api/profiles, GET} route
[RouterExplorer] Mapped {/api/profiles/:id, GET} route
[RouterExplorer] Mapped {/api/profiles/:id, PATCH} route
[RouterExplorer] Mapped {/api/profiles/:id, DELETE} route
[RouterExplorer] Mapped {/api/profiles/assign, POST} route
[RouterExplorer] Mapped {/api/profiles/revoke/:userId, DELETE} route
[RouterExplorer] Mapped {/api/profiles/:id/audit, GET} route
[RouterExplorer] Mapped {/api/profiles/check-permission, POST} route
[RouterExplorer] Mapped {/api/profiles/user/:userId/permissions, GET} route
```

---

## Configuración del Servidor

### Ubicación de Archivos
- **Backend:** `/home/ubuntu/consentimientos_aws/backend`
- **Proceso PM2:** `datagree`
- **Puerto:** 3000 (interno)
- **Nginx:** Proxy inverso a puerto 3000

### Variables de Entorno
- `NODE_ENV=production`
- `PORT=3000`
- Base de datos: Supabase PostgreSQL

### Nginx
- Configuración: `/etc/nginx/sites-enabled/archivoenlinea`
- Dominio: `admin.archivoenlinea.com`
- SSL: Habilitado

---

## Seguridad Implementada

### Validaciones de Permisos

1. **Solo super admins pueden:**
   - Crear perfiles con permisos globales (*)
   - Asignar permisos del módulo `super_admin`
   - Asignar permisos de `create/delete` en módulo `profiles`

2. **Administrador General:**
   - ✅ Puede ver perfiles
   - ✅ Puede asignar perfiles existentes
   - ❌ NO puede crear perfiles
   - ❌ NO puede editar perfiles
   - ❌ NO puede eliminar perfiles
   - ❌ NO puede crear perfiles con permisos de super admin

### Guards y Decorators
- `JwtAuthGuard` - Autenticación JWT
- `PermissionsGuard` - Validación de permisos
- `@RequirePermission(module, action)` - Decorator para endpoints

---

## Base de Datos

### Migración Ejecutada
- Archivo: `backend/migrations/create-profiles-system.sql`
- Estado: ✅ Ejecutada en Supabase
- Tablas creadas: 4 (profiles, system_modules, module_actions, permission_audits)

### Datos Iniciales
- 5 perfiles predeterminados creados
- 64 módulos del sistema configurados
- 45 acciones disponibles

---

## Problemas Encontrados y Soluciones

### 1. Error: Cannot find module 'axios'
**Causa:** Dependencia faltante en producción  
**Solución:** `npm install axios --legacy-peer-deps`

### 2. Error: crypto is not defined
**Causa:** Node.js 18 requiere import explícito de crypto  
**Solución:** Creado polyfill.js y configurado en PM2 con `--require ./polyfill.js`

### 3. Conflictos de dependencias
**Causa:** Incompatibilidad entre @nestjs/config y @nestjs/common  
**Solución:** Usar flag `--legacy-peer-deps` en npm install

---

## Scripts Creados

### 1. deploy-backend-v52.2.0.sh
Script bash para despliegue automatizado desde Linux/Mac

### 2. deploy-backend-v52.2.0.ps1
Script PowerShell para despliegue desde Windows

### 3. polyfill.js
Polyfill para crypto en Node.js 18

---

## Comandos Útiles

### Ver logs en tiempo real
```bash
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree"
```

### Reiniciar backend
```bash
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree"
```

### Ver estado
```bash
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 status datagree"
```

### Verificar endpoint
```bash
curl https://archivoenlinea.com/api/health
curl https://archivoenlinea.com/api/profiles
```

---

## Próximos Pasos

1. ✅ Backend desplegado y funcionando
2. ⏳ Probar endpoints desde el frontend
3. ⏳ Verificar que la página de Perfiles cargue correctamente
4. ⏳ Probar creación y asignación de perfiles
5. ⏳ Verificar auditoría de cambios

---

## Notas Importantes

- El backend está corriendo en Node.js v18.20.8
- Se recomienda actualizar a Node.js 20+ en el futuro
- El polyfill de crypto es temporal hasta la actualización de Node.js
- Todos los endpoints de profiles requieren autenticación JWT
- Los permisos se validan automáticamente con el `PermissionsGuard`

---

## Contacto y Soporte

**Servidor:** 100.28.198.249  
**Usuario:** ubuntu  
**Clave SSH:** credentials/AWS-ISSABEL.pem  
**Dominio:** https://admin.archivoenlinea.com  
**API:** https://archivoenlinea.com/api

---

**Despliegue completado exitosamente el 2026-03-02 a las 07:21 AM UTC**
