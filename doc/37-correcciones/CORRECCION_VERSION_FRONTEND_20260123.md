# Corrección de Versión en Frontend - 23 de enero de 2026

## Problema Identificado

El usuario reportó que veía "Versión 10.1.0 - 2026-01-23" en la pantalla de login, cuando la versión actual debería ser 11.1.1.

## Causa Raíz

Los archivos del frontend NO se habían copiado correctamente al servidor en el despliegue anterior. El servidor tenía archivos antiguos:
- ❌ Archivo antiguo: `index-BVNLXQc7.js` (versión 10.1.0)
- ✅ Archivo nuevo: `index-Lx5ZOXx6.js` (versión 11.1.1)

## Solución Aplicada

### 1. Eliminación de Archivos Antiguos
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "rm -rf /var/www/html/assets/*"
```

### 2. Copia Correcta de Archivos Nuevos
```bash
# Copiar assets
scp -i AWS-ISSABEL.pem -r frontend/dist/assets/* ubuntu@100.28.198.249:/var/www/html/assets/

# Copiar index.html
scp -i AWS-ISSABEL.pem frontend/dist/index.html ubuntu@100.28.198.249:/var/www/html/
```

### 3. Verificación
```bash
# Verificar archivo correcto
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "ls -lh /var/www/html/assets/index-*.js"
# Resultado: index-Lx5ZOXx6.js (86K) - ✅ CORRECTO

# Verificar versión en el archivo
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "grep -o '11\.1\.1' /var/www/html/assets/index-Lx5ZOXx6.js | head -1"
# Resultado: 11.1.1 - ✅ CORRECTO
```

## Estado Final

### Backend ✅
- Versión: 11.1.1
- Estado: Online (PID 109019)
- Endpoint: `curl http://localhost:3000/api/auth/version` → `{"version":"11.1.1"}`

### Frontend ✅
- Versión: 11.1.1
- Archivo principal: `/var/www/html/assets/index-Lx5ZOXx6.js`
- Tamaño: 86K
- Contenido verificado: Contiene "11.1.1"

### Base de Datos ✅
- Tabla `consent_templates`: 12 plantillas
- Permisos configurados en todos los roles

## Instrucciones para el Usuario

### Opción 1: Recarga Forzada (Más Rápido)
Presiona **Ctrl + F5** en tu navegador para forzar la recarga sin caché.

### Opción 2: Limpiar Caché Manualmente
1. Presiona **Ctrl + Shift + Delete**
2. Selecciona "Imágenes y archivos en caché"
3. Haz clic en "Borrar datos"
4. Recarga la página

### Opción 3: Modo Incógnito (Para Verificar)
Abre una ventana de incógnito y accede a la URL para verificar que la versión correcta está desplegada.

## Verificación Esperada

Después de limpiar la caché, deberías ver en la pantalla de login:
```
Versión 11.1.1 - 2026-01-23
```

## Archivos Desplegados

### Assets Principales
- `index-Lx5ZOXx6.js` (86K) - Código principal con versión 11.1.1
- `index-DaFJhc44.css` (50K) - Estilos
- `vendor-ui-C0lmsYs6.js` (377K) - Librerías UI
- `vendor-react-Dc0L5a4_.js` (156K) - React
- `vendor-forms-Lldb2kFe.js` (61K) - Formularios
- `vendor-state-DDn1g-MJ.js` (40K) - Estado

### Páginas
- `ConsentTemplatesPage-AGtrmXY4.js` (18K) - Nueva página de plantillas
- `ClientsPage-D81lfOQt.js` (20K) - Página de clientes
- `DashboardPage-BFYIqI1B.js` (38K) - Dashboard
- Y 20+ páginas más

## Lección Aprendida

**Problema**: El comando `scp -r frontend/dist/* ubuntu@...:/var/www/html/` no elimina archivos antiguos, solo agrega nuevos.

**Solución**: Siempre eliminar archivos antiguos antes de copiar:
```bash
# 1. Eliminar archivos antiguos
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "rm -rf /var/www/html/assets/*"

# 2. Copiar archivos nuevos
scp -i AWS-ISSABEL.pem -r frontend/dist/assets/* ubuntu@100.28.198.249:/var/www/html/assets/
```

## Comandos de Verificación

```bash
# Verificar versión del backend
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "curl -s http://localhost:3000/api/auth/version"

# Verificar archivos del frontend
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "ls -lh /var/www/html/assets/index-*.js"

# Verificar versión en el archivo JS
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "grep -o '11\.1\.1' /var/www/html/assets/index-Lx5ZOXx6.js | head -1"

# Verificar estado del backend
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 status datagree-backend"
```

## Resumen

✅ **PROBLEMA RESUELTO**

El frontend ahora está correctamente desplegado con la versión 11.1.1. El usuario solo necesita limpiar la caché de su navegador para ver la versión actualizada.

**Tiempo de resolución**: ~5 minutos
**Causa**: Archivos antiguos no eliminados en despliegue anterior
**Solución**: Eliminación de archivos antiguos + copia correcta de archivos nuevos

---

**Fecha de corrección**: 24 de enero de 2026, 04:15 AM
**Versión desplegada**: 11.1.1
**Estado**: ✅ OPERATIVO
