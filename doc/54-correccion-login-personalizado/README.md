# Corrección: Login Personalizado No Se Muestra

**Fecha:** 2026-01-25  
**Problema:** El login personalizado del tenant no se muestra, aparece el diseño genérico  
**Causa:** Backend no está corriendo o no es accesible

---

## 🔍 Diagnóstico del Problema

### Síntomas
- Login muestra diseño genérico (azul) en lugar del personalizado del tenant
- Consola del navegador muestra errores:
  ```
  GET http://localhost:3000/api/settings WELCOME_CONNECTION_REFUSED
  GET http://localhost:3000/api/settings/public WELCOME_CONNECTION_REFUSED
  ```

### Causa Raíz
El frontend no puede conectarse con el backend para obtener los settings personalizados del tenant.

---

## ✅ Solución Paso a Paso

### 1. Verificar que el Backend Esté Corriendo

```bash
# Terminal 1: Iniciar backend
cd backend
npm run start:dev
```

**Verificar que aparezca:**
```
[Nest] 12345  - 25/01/2026, 10:30:00     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 12345  - 25/01/2026, 10:30:00     LOG [NestApplication] Application is running on: http://localhost:3000
```

### 2. Probar Conectividad con el Backend

Abrir en el navegador:
```
http://localhost:3000/api/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

### 3. Probar Endpoint de Settings Públicos

#### Para Super Admin (admin.localhost:5173)
```bash
curl http://localhost:3000/api/settings/public
```

#### Para Tenant (demo-medico.localhost:5173)
```bash
curl -H "X-Tenant-Slug: demo-medico" http://localhost:3000/api/settings/public
```

**Respuesta esperada:**
```json
{
  "logoUrl": "/uploads/...",
  "primaryColor": "#...",
  "companyName": "...",
  ...
}
```

### 4. Usar Herramienta de Diagnóstico

Abrir en el navegador:
```
http://demo-medico.localhost:5173/diagnostico-login.html
```

O para Super Admin:
```
http://admin.localhost:5173/diagnostico-login.html
```

Esta herramienta:
- ✅ Detecta el tenant automáticamente
- ✅ Prueba la conexión con el backend
- ✅ Prueba el endpoint de settings públicos
- ✅ Muestra información detallada de errores
- ✅ Proporciona soluciones específicas

### 5. Verificar Archivo Hosts (Opcional)

Si usas subdominios locales, verifica que el archivo hosts esté configurado:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`  
**Mac/Linux:** `/etc/hosts`

Debe contener:
```
127.0.0.1 localhost
127.0.0.1 admin.localhost
127.0.0.1 demo-medico.localhost
```

### 6. Limpiar Caché del Navegador

Presionar:
- **Windows:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

---

## 🔧 Problemas Comunes

### Problema 1: Backend no inicia

**Síntoma:**
```
Error: Cannot find module '@nestjs/core'
```

**Solución:**
```bash
cd backend
npm install
npm run start:dev
```

### Problema 2: Puerto 3000 ocupado

**Síntoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Problema 3: Base de datos no conecta

**Síntoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
# Windows: Servicios -> PostgreSQL
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Problema 4: Tenant no existe

**Síntoma:**
Settings públicos retorna error 404 o datos genéricos

**Solución:**
```sql
-- Verificar que el tenant exista
SELECT * FROM tenants WHERE slug = 'demo-medico';

-- Si no existe, crearlo (contactar al administrador)
```

---

## 📊 Flujo de Carga de Settings

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario accede a demo-medico.localhost:5173            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Frontend detecta tenant: "demo-medico"                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  3. ThemeContext intenta cargar settings                    │
│     GET http://localhost:3000/api/settings/public           │
│     Header: X-Tenant-Slug: demo-medico                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Backend busca settings del tenant                       │
│     SELECT * FROM settings WHERE tenant_id = ...            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Backend retorna settings personalizados                 │
│     { logoUrl, primaryColor, companyName, ... }             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Frontend aplica settings al login                       │
│     - Logo personalizado                                    │
│     - Colores del tenant                                    │
│     - Nombre de la empresa                                  │
└─────────────────────────────────────────────────────────────┘
```

**Si el backend no está corriendo, el flujo se detiene en el paso 3.**

---

## ✅ Checklist de Verificación

- [ ] Backend corriendo en puerto 3000
- [ ] Endpoint `/api/health` responde
- [ ] Endpoint `/api/settings/public` responde
- [ ] Tenant existe en base de datos
- [ ] Header `X-Tenant-Slug` se envía correctamente
- [ ] Navegador puede acceder a `localhost:3000`
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del backend
- [ ] Caché del navegador limpiado

---

## 🎯 Resultado Esperado

Después de seguir estos pasos, el login debe mostrar:
- ✅ Logo personalizado del tenant
- ✅ Colores personalizados
- ✅ Nombre de la empresa correcto
- ✅ Sin errores en consola

---

## 📞 Soporte Adicional

Si el problema persiste después de seguir todos los pasos:

1. Ejecutar herramienta de diagnóstico: `/diagnostico-login.html`
2. Capturar pantalla de los resultados
3. Capturar logs del backend
4. Capturar consola del navegador (F12)
5. Contactar al equipo de desarrollo con esta información

---

**Última actualización:** 2026-01-25  
**Versión:** 15.0.9
