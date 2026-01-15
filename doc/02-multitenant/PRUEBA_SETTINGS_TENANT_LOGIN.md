# Guía de Prueba: Settings por Tenant en Login

## 🎯 Objetivo de la Prueba

Verificar que cada tenant ve su propia personalización (nombre, colores, logos) en la página de login, y no los settings del Super Admin.

---

## ✅ Pre-requisitos

1. Sistema iniciado con `.\start-project.ps1`
2. Backend corriendo en `http://localhost:3000`
3. Frontend corriendo en `http://localhost:5173`
4. Al menos un tenant creado (ejemplo: "demo-medico")

---

## 🧪 Casos de Prueba

### Caso 1: Super Admin desde localhost

**URL a probar:** `http://localhost:5173/login`

**Resultado esperado:**
- ✅ Nombre de empresa: "CONSENTIMIENTOS"
- ✅ Colores del Super Admin
- ✅ Logo del Super Admin (si está configurado)

**Logs del backend esperados:**
```
[TenantMiddleware] Host: localhost:3000 -> Tenant Slug: null (Super Admin)
[SettingsController] GET /settings/public
[SettingsController] Tenant Slug: Super Admin
[SettingsService] Retornando companyName: CONSENTIMIENTOS
```

---

### Caso 2: Super Admin desde subdominio admin

**URL a probar:** `http://admin.localhost:5173/login`

**Resultado esperado:**
- ✅ Nombre de empresa: "CONSENTIMIENTOS"
- ✅ Colores del Super Admin
- ✅ Logo del Super Admin (si está configurado)

**Logs del backend esperados:**
```
[TenantMiddleware] Subdominio 'admin' detectado - Super Admin
[TenantMiddleware] Host: admin.localhost:3000 -> Tenant Slug: null (Super Admin)
[SettingsController] GET /settings/public
[SettingsController] Tenant Slug: Super Admin
[SettingsService] Retornando companyName: CONSENTIMIENTOS
```

---

### Caso 3: Tenant desde su subdominio

**URL a probar:** `http://demo-medico.localhost:5173/login`

**Resultado esperado:**
- ✅ Nombre de empresa: "Demo Consultorio Medico"
- ✅ Teléfono: "3000000000"
- ✅ Email: "demo-medico@demo.com"
- ✅ Colores del tenant (o defaults si no están configurados)

**Logs del backend esperados:**
```
[TenantMiddleware] Subdominio detectado en localhost: demo-medico
[TenantMiddleware] Host: demo-medico.localhost:3000 -> Tenant Slug: demo-medico
[SettingsController] GET /settings/public
[SettingsController] Tenant Slug: demo-medico
[SettingsController] Tenant encontrado: Demo Consultorio Medico ( b7b87a6e-591e-49d4-9a20-f2b308fac02a )
[SettingsService] Retornando companyName: Demo Consultorio Medico
```

---

## 🔍 Verificación Detallada

### 1. Verificar en el Navegador

1. Abrir DevTools (F12)
2. Ir a la pestaña "Network"
3. Acceder a la URL de prueba
4. Buscar la petición a `/api/settings/public`
5. Verificar la respuesta JSON:

**Para Super Admin:**
```json
{
  "companyName": "CONSENTIMIENTOS",
  "companyEmail": "info@innovasystems.com.co",
  "companyPhone": "3134806927",
  ...
}
```

**Para Tenant demo-medico:**
```json
{
  "companyName": "Demo Consultorio Medico",
  "companyEmail": "demo-medico@demo.com",
  "companyPhone": "3000000000",
  ...
}
```

### 2. Verificar en los Logs del Backend

Abrir la terminal donde corre el backend y buscar las líneas que comienzan con:
- `[TenantMiddleware]`
- `[SettingsController]`
- `[SettingsService]`

### 3. Verificar en la Base de Datos

Ejecutar el script de verificación:

```bash
cd backend
npx ts-node check-tenant-settings.ts
```

**Salida esperada:**
```
✅ Conectado a la base de datos

👤 Tenant encontrado:
  ID: b7b87a6e-591e-49d4-9a20-f2b308fac02a
  Nombre: Demo Consultorio Medico
  Slug: demo-medico
  Email: demo-medico@demo.com

📋 Settings del tenant:
  ✅ Encontrados 5 settings:
    - companyName: Demo Consultorio Medico
    - companyAddress:
    - companyPhone: 3000000000
    - companyEmail: demo-medico@demo.com
    - companyWebsite:

📋 Settings del Super Admin (tenantId = NULL):
  ✅ Encontrados 45 settings:
    - companyName: CONSENTIMIENTOS
    ...
```

---

## 🐛 Troubleshooting

### Problema: Tenant ve settings del Super Admin

**Síntomas:**
- Accediendo a `demo-medico.localhost:5173/login` muestra "CONSENTIMIENTOS"

**Verificar:**
1. Logs del backend muestran detección correcta del subdominio
2. Tenant existe en la base de datos con el slug correcto
3. Settings del tenant existen en la tabla `app_settings`

**Solución:**
```bash
# Verificar que el tenant existe
cd backend
npx ts-node list-tenants.ts

# Verificar settings del tenant
npx ts-node check-tenant-settings.ts
```

### Problema: Error 404 en /api/settings/public

**Síntomas:**
- Petición a `/api/settings/public` retorna 404

**Verificar:**
1. Backend está corriendo en puerto 3000
2. Endpoint está registrado en el controller

**Solución:**
```bash
# Reiniciar backend
.\stop-project.ps1
.\start-project.ps1
```

### Problema: Logs no muestran detección de subdominio

**Síntomas:**
- No aparecen logs de `[TenantMiddleware]`

**Verificar:**
1. Middleware está registrado en `app.module.ts`
2. Variable de entorno `BASE_DOMAIN=localhost` está configurada

**Solución:**
```bash
# Verificar .env del backend
cd backend
type .env | findstr BASE_DOMAIN

# Debe mostrar: BASE_DOMAIN=localhost
```

---

## 📊 Checklist de Prueba

- [ ] Caso 1: Super Admin desde localhost funciona
- [ ] Caso 2: Super Admin desde admin.localhost funciona
- [ ] Caso 3: Tenant desde su subdominio funciona
- [ ] Logs del backend muestran detección correcta
- [ ] Respuesta JSON contiene datos correctos
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del backend
- [ ] Script de verificación confirma datos en BD

---

## 🎓 Notas Adicionales

### Cómo Funciona

1. **Usuario accede:** `http://demo-medico.localhost:5173/login`
2. **Frontend carga:** `ThemeContext` se inicializa
3. **Petición HTTP:** `GET http://localhost:3000/api/settings/public`
4. **Header Host:** `demo-medico.localhost:3000`
5. **Middleware detecta:** `tenantSlug = "demo-medico"`
6. **Controller busca:** Tenant con slug "demo-medico"
7. **Service retorna:** Settings del tenant encontrado
8. **Frontend aplica:** Nombre, colores, logos del tenant

### Subdominios Especiales

- `localhost` → Super Admin
- `admin.localhost` → Super Admin
- `*.localhost` → Tenant (si existe)

### Variables de Entorno Clave

**Backend (.env):**
```env
BASE_DOMAIN=localhost
```

**Frontend (.env):**
```env
# VITE_API_URL debe estar comentado para detección automática
# VITE_API_URL=http://localhost:3000
```

---

## ✅ Resultado Esperado

Al completar todas las pruebas:
- ✅ Super Admin ve sus settings desde localhost y admin.localhost
- ✅ Cada tenant ve sus propios settings desde su subdominio
- ✅ No hay errores en consola ni logs
- ✅ La personalización se aplica correctamente
- ✅ El sistema está listo para producción

---

**Fecha de creación:** 6 de enero de 2026  
**Estado:** ✅ Pruebas exitosas
