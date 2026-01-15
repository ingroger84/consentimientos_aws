# Uso de Terminales de Kiro

## 📋 Resumen

Los scripts han sido actualizados para funcionar mejor con las terminales integradas de Kiro, permitiendo ver los logs en tiempo real y gestionar los procesos de forma más eficiente.

---

## 🚀 Cómo Iniciar el Proyecto

### Método Recomendado: Terminales de Kiro

**Paso 1: Abrir Terminal para Backend**

1. En Kiro, haz clic en el icono de terminal o presiona `` Ctrl+` ``
2. Se abrirá una nueva terminal
3. Ejecuta:
```bash
cd backend
npm run start:dev
```

**Paso 2: Abrir Terminal para Frontend**

1. Abre otra terminal en Kiro (botón `+` en el panel de terminales)
2. Ejecuta:
```bash
cd frontend
npm run dev
```

**Paso 3: Acceder al Sistema**

- Backend: `http://localhost:3000/api`
- Frontend Super Admin: `http://admin.localhost:5173`
- Frontend Tenant: `http://cliente-demo.localhost:5173`

---

## 🛑 Cómo Detener el Proyecto

### Método 1: Desde las Terminales

En cada terminal donde esté corriendo el proyecto:
- Presiona `Ctrl + C`
- Espera a que el proceso se detenga
- Cierra la terminal si lo deseas

### Método 2: Script de Detención

Si las terminales se cerraron pero los procesos siguen corriendo:

```powershell
.\stop.ps1
```

Este script busca y detiene todos los procesos en los puertos 3000 y 5173.

---

## 📊 Ventajas de Usar Terminales de Kiro

### 1. Logs en Tiempo Real
- ✅ Ves todos los logs del backend y frontend
- ✅ Puedes hacer scroll para revisar errores anteriores
- ✅ Los logs tienen colores y formato

### 2. Gestión Integrada
- ✅ Todo en un solo lugar (no necesitas ventanas externas)
- ✅ Puedes cambiar entre terminales fácilmente
- ✅ Las terminales persisten entre sesiones

### 3. Control Total
- ✅ Puedes detener procesos con Ctrl+C
- ✅ Puedes reiniciar procesos fácilmente
- ✅ Puedes ejecutar comandos adicionales en cualquier momento

### 4. Debugging
- ✅ Ves errores inmediatamente
- ✅ Puedes copiar logs para análisis
- ✅ Puedes ejecutar comandos de diagnóstico

---

## 🔧 Scripts Disponibles

### `start.ps1` - Script de Ayuda

**Uso:**
```powershell
.\start.ps1
```

**Funciones:**
- Muestra instrucciones paso a paso
- Muestra URLs de acceso
- Muestra credenciales
- Opción para abrir el navegador automáticamente

**Ejemplo de salida:**
```
========================================
 Iniciando Sistema de Consentimientos
========================================

INSTRUCCIONES:

1. Abre una terminal en Kiro y ejecuta:
   cd backend
   npm run start:dev

2. Abre otra terminal en Kiro y ejecuta:
   cd frontend
   npm run dev

========================================

Informacion de Acceso:

  Super Admin:
    URL:      http://admin.localhost:5173
    Email:    superadmin@sistema.com
    Password: superadmin123

  Tenant (Cliente Demo):
    URL:      http://cliente-demo.localhost:5173
    Email:    clientedemo@demo.com

  Backend API:
    URL:      http://localhost:3000/api

========================================

Deseas abrir el navegador? (s/n):
```

### `stop.ps1` - Detener Proyecto

**Uso:**
```powershell
.\stop.ps1
```

**Funciones:**
- Busca procesos en puerto 3000 (Backend)
- Busca procesos en puerto 5173 (Frontend)
- Detiene todos los procesos encontrados
- Libera los puertos

**Ejemplo de salida:**
```
========================================
 Deteniendo Sistema de Consentimientos
========================================

Verificando puerto 3000 (Backend)...
  Deteniendo: node (PID: 12345)
  [OK] Puerto 3000 liberado

Verificando puerto 5173 (Frontend)...
  Deteniendo: node (PID: 67890)
  [OK] Puerto 5173 liberado

========================================
 [OK] Proyecto Detenido
========================================
```

---

## 📝 Flujo de Trabajo Típico

### Inicio del Día

1. Abrir Kiro
2. Abrir terminal 1: `cd backend && npm run start:dev`
3. Abrir terminal 2: `cd frontend && npm run dev`
4. Esperar a que ambos inicien (ver logs)
5. Abrir navegador en `http://admin.localhost:5173`

### Durante el Desarrollo

- Los cambios en el código se reflejan automáticamente (hot-reload)
- Revisa los logs en las terminales si hay errores
- Puedes ejecutar comandos adicionales en nuevas terminales

### Fin del Día

1. En terminal 1: `Ctrl + C` (detener backend)
2. En terminal 2: `Ctrl + C` (detener frontend)
3. Cerrar Kiro o dejar las terminales abiertas para mañana

---

## 🚨 Solución de Problemas

### Problema: "Puerto ya está en uso"

**Causa:** El proceso anterior no se detuvo correctamente

**Solución:**
```powershell
.\stop.ps1
```

Luego vuelve a iniciar el proyecto.

### Problema: "No puedo ver los logs"

**Causa:** La terminal se cerró o se perdió

**Solución:**
1. Detén el proceso con `.\stop.ps1`
2. Abre nuevas terminales en Kiro
3. Inicia el proyecto nuevamente

### Problema: "El proyecto no inicia"

**Causa:** Dependencias no instaladas o desactualizadas

**Solución:**
```bash
# Backend
cd backend
rm -r node_modules
npm install

# Frontend
cd frontend
rm -r node_modules
npm install
```

### Problema: "Error de compilación"

**Causa:** Error en el código

**Solución:**
1. Revisa los logs en la terminal
2. Busca el archivo y línea del error
3. Corrige el error
4. El hot-reload reiniciará automáticamente

---

## 💡 Consejos y Trucos

### 1. Nombres de Terminales

Puedes renombrar las terminales en Kiro para identificarlas fácilmente:
- Terminal 1: "Backend - Puerto 3000"
- Terminal 2: "Frontend - Puerto 5173"

### 2. Atajos de Teclado

- `` Ctrl+` `` - Abrir/cerrar panel de terminales
- `Ctrl+Shift+5` - Dividir terminal
- `Ctrl+C` - Detener proceso actual

### 3. Comandos Útiles

**Ver procesos corriendo:**
```powershell
Get-NetTCPConnection -LocalPort 3000
Get-NetTCPConnection -LocalPort 5173
```

**Ver logs del backend:**
Los logs aparecen automáticamente en la terminal

**Limpiar terminal:**
```bash
clear  # o cls en Windows
```

### 4. Múltiples Proyectos

Si trabajas en varios proyectos:
- Usa diferentes puertos para cada proyecto
- Mantén terminales separadas para cada proyecto
- Usa el script `stop.ps1` para limpiar puertos

---

## 📚 Comandos Adicionales

### Backend

```bash
cd backend

# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Migraciones
npm run migration:run
npm run migration:revert

# Verificar tenant
npx ts-node check-tenant-user.ts

# Limpiar datos
npx ts-node cleanup-orphan-users.ts
```

### Frontend

```bash
cd frontend

# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Linting
npm run lint
```

---

## ✅ Checklist de Uso Diario

### Inicio
- [ ] Abrir Kiro
- [ ] Abrir terminal para backend
- [ ] Ejecutar `cd backend && npm run start:dev`
- [ ] Esperar a ver "Application is running on: http://localhost:3000"
- [ ] Abrir terminal para frontend
- [ ] Ejecutar `cd frontend && npm run dev`
- [ ] Esperar a ver "Local: http://localhost:5173"
- [ ] Abrir navegador en `http://admin.localhost:5173`
- [ ] Verificar login exitoso

### Durante el Desarrollo
- [ ] Revisar logs en terminales
- [ ] Hacer cambios en el código
- [ ] Verificar que hot-reload funcione
- [ ] Probar funcionalidades
- [ ] Revisar errores en terminales

### Cierre
- [ ] Guardar todos los cambios
- [ ] Commit de cambios (si aplica)
- [ ] Presionar Ctrl+C en terminal backend
- [ ] Presionar Ctrl+C en terminal frontend
- [ ] Cerrar Kiro o dejar terminales para mañana

---

## 🔗 Referencias

- **[README.md](../README.md)** - Documentación principal
- **[INICIO_RAPIDO.md](../INICIO_RAPIDO.md)** - Guía de inicio rápido
- **[ESTADO_ACTUAL_SISTEMA.md](./ESTADO_ACTUAL_SISTEMA.md)** - Estado del sistema

---

**¡Disfruta desarrollando con Kiro! 🚀**
