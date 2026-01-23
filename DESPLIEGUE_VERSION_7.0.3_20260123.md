# Despliegue Versión 7.0.3 - 23 de Enero 2026

## ✅ DESPLIEGUE COMPLETADO

### Versión Desplegada: 7.0.3 - 2026-01-23

## Cambios Implementados

### 1. Corrección del Período de Prueba Gratuito
- **Antes**: Tenants con plan gratuito se creaban con 1 mes de vencimiento
- **Ahora**: Tenants con plan gratuito tienen **7 días de prueba**
- **Archivo modificado**: `backend/src/tenants/tenants-plan.helper.ts`

### 2. Corrección de Fechas de Tenants Existentes
- Tenants `testsanto` y `demo-medico` actualizados con fechas correctas
- Script SQL aplicado: `backend/fix-trial-dates.sql`

### 3. Configuración de Caché de Nginx
- **Problema**: Nginx cacheaba archivos JavaScript por 1 año
- **Solución**: Configuración actualizada para forzar revalidación
- Archivos JS/CSS ahora se revalidan en cada carga

### 4. Sistema de Versionamiento
- Versión incrementada automáticamente: 7.0.2 → 7.0.3
- Sincronización en todos los archivos:
  - `VERSION.md`
  - `frontend/package.json`
  - `backend/package.json`
  - `frontend/src/config/version.ts`
  - `backend/src/config/version.ts`

## Estado del Despliegue

### Backend ✅
- **Versión**: 7.0.3
- **Estado**: Online
- **PM2**: datagree-backend running
- **Ubicación**: `/home/ubuntu/consentimientos_aws/backend`

### Frontend ✅
- **Versión**: 7.0.3
- **Archivo principal**: `index-BwZoQJhP.js`
- **Ubicación**: `/var/www/html/dist/`
- **Nginx**: Configurado y reiniciado

### Base de Datos ✅
- **Script SQL aplicado**: `fix-trial-dates.sql`
- **Tenants actualizados**:
  - `testsanto`: 7 días de prueba (30 ene 2026)
  - `demo-medico`: 7 días de prueba (30 ene 2026)
- **Tenants con otros planes**:
  - `demo-estetica`: Plan Professional (31 días) ✅ Correcto
  - `clinica-demo`: Plan Professional ✅ Correcto
- **Nuevos tenants**: Automáticamente tendrán 7 días de prueba

## 🔴 ACCIÓN REQUERIDA DEL USUARIO

Para ver la versión correcta (7.0.3 - 2026-01-23) y los cambios, **DEBES** limpiar la caché del navegador:

### Opción 1: Modo Incógnito (Recomendado - Más Rápido)
1. Abre una ventana de incógnito:
   - **Chrome/Edge**: `Ctrl + Shift + N`
   - **Firefox**: `Ctrl + Shift + P`
2. Ve a: `https://archivoenlinea.com`
3. Inicia sesión como Super Admin
4. Deberías ver: **Versión 7.0.3 - 2026-01-23** en el footer

### Opción 2: Limpiar Caché del Navegador

#### Google Chrome:
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Imágenes y archivos en caché"
3. Clic en "Borrar datos"
4. Recarga la página con `Ctrl + F5`

#### Mozilla Firefox:
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Caché"
3. Clic en "Limpiar ahora"
4. Recarga la página con `Ctrl + F5`

#### Microsoft Edge:
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Imágenes y archivos en caché"
3. Clic en "Borrar ahora"
4. Recarga la página con `Ctrl + F5`

### Opción 3: Hard Refresh
- **Windows**: `Ctrl + F5` o `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

## Verificación de Cambios

Después de limpiar la caché, verifica:

### 1. Versión en el Footer
- ✅ Debe mostrar: **v7.0.3 - 2026-01-23**
- Ubicación: Parte inferior de la barra lateral izquierda

### 2. Tenants con Plan Gratuito
- ✅ Nuevos tenants: 7 días de prueba desde la creación
- ✅ Tenants existentes: Fechas corregidas

### 3. Página de Tenants (Super Admin)
- ✅ `testsanto`: Fecha de vencimiento correcta
- ✅ `demo-medico`: Fecha de vencimiento correcta
- ✅ `demo-estetica`: Fecha de vencimiento correcta

## Archivos Desplegados

### Backend
```
/home/ubuntu/consentimientos_aws/backend/
├── dist/                    # Código compilado v7.0.3
├── package.json             # v7.0.3
└── node_modules/            # Dependencias
```

### Frontend
```
/var/www/html/dist/
├── index.html               # Apunta a index-BwZoQJhP.js
├── assets/
│   ├── index-BwZoQJhP.js   # Versión 7.0.3
│   ├── index-Dc2dmKlr.css
│   └── [otros archivos]
```

### Nginx
```
/etc/nginx/sites-available/default
- Configuración de caché actualizada
- JS/CSS: max-age=0, must-revalidate
- index.html: no-cache
```

## Comandos de Verificación

### Verificar versión del backend:
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 describe datagree-backend | grep version"
```

### Verificar versión en frontend:
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "grep -o '7\.0\.3' /var/www/html/dist/assets/index-BwZoQJhP.js | head -1"
```

### Verificar estado de PM2:
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 status"
```

### Verificar logs del backend:
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree-backend --lines 50"
```

## Prevención de Problemas Futuros

### 1. Caché del Navegador
Con la nueva configuración de Nginx, los navegadores siempre validarán con el servidor antes de usar archivos JS/CSS cacheados. Los futuros despliegues se reflejarán inmediatamente después de un refresh.

### 2. Sistema de Versionamiento
El sistema de versionamiento automático funciona correctamente:
- Se ejecuta en cada commit mediante Git Hook
- Sincroniza versiones en todos los archivos
- Incrementa automáticamente según el tipo de cambio

### 3. Despliegues Futuros
Para futuros despliegues, usar el script:
```powershell
./scripts/deploy-fix-complete.ps1
```

## Problemas Conocidos y Soluciones

### Problema: "Sigo viendo la versión antigua"
**Causa**: Caché del navegador
**Solución**: Limpiar caché o usar modo incógnito (ver instrucciones arriba)

### Problema: "No veo la versión en el footer"
**Causa**: Caché del navegador o archivo JavaScript antiguo
**Solución**: 
1. Limpiar caché completamente
2. Hard refresh (Ctrl + F5)
3. Verificar en modo incógnito

### Problema: "Tenants siguen con fechas incorrectas"
**Causa**: Base de datos no actualizada
**Solución**: Ejecutar script SQL:
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
psql -U admin -d consentimientos -f fix-trial-dates.sql
```

## Resumen Técnico

| Componente | Versión Anterior | Versión Nueva | Estado |
|------------|------------------|---------------|--------|
| Backend | 7.0.2 | 7.0.3 | ✅ Desplegado |
| Frontend | 7.0.2 | 7.0.3 | ✅ Desplegado |
| Base de Datos | - | Actualizada | ✅ Migrada |
| Nginx | Cache 1 año | Cache revalidación | ✅ Configurado |
| PM2 | Running | Running | ✅ Online |

## Próximos Pasos

1. **Usuario**: Limpiar caché del navegador (ver instrucciones arriba)
2. **Verificar**: Versión 7.0.3 visible en el footer
3. **Probar**: Crear un nuevo tenant con plan gratuito
4. **Confirmar**: Fecha de vencimiento es 7 días desde la creación

## Contacto y Soporte

Si después de limpiar la caché sigues sin ver la versión correcta:
1. Toma un screenshot de lo que ves
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña "Network"
4. Recarga la página (F5)
5. Busca el archivo `index-*.js` y verifica su contenido

---

**Fecha de despliegue**: 23 de Enero 2026, 05:30 AM
**Versión desplegada**: 7.0.3
**Estado**: ✅ Completado (requiere limpieza de caché del usuario)
**Tiempo de despliegue**: ~10 minutos
**Downtime**: < 5 segundos (restart de PM2)
