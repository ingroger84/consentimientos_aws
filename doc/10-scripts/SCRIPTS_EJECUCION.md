# Scripts de Ejecución del Proyecto

## 📋 Resumen

Se han creado scripts PowerShell para facilitar la ejecución del proyecto completo con un solo comando.

---

## 🚀 Scripts Disponibles

### 1. `start-project.ps1` - Iniciar Proyecto

**Ubicación:** Raíz del proyecto

**Uso:**
```powershell
.\start-project.ps1
```

**Funcionalidades:**
- ✅ Verifica que los puertos 3000 y 5173 estén disponibles
- ✅ Detecta si el proyecto ya está corriendo
- ✅ Instala dependencias automáticamente si no existen
- ✅ Inicia el backend en una nueva ventana de PowerShell
- ✅ Inicia el frontend en otra ventana de PowerShell
- ✅ Muestra información de acceso (URLs y credenciales)
- ✅ Abre el navegador automáticamente en la página del Super Admin
- ✅ Mantiene las ventanas abiertas para ver los logs

**Ventanas que se abren:**
1. **Ventana Backend** - Muestra logs del servidor NestJS (puerto 3000)
2. **Ventana Frontend** - Muestra logs del servidor Vite (puerto 5173)
3. **Ventana Principal** - Muestra resumen e información de acceso

**Información mostrada:**
```
📋 Información de Acceso:

  🔐 Super Admin:
     URL:        http://admin.localhost:5173
     Email:      superadmin@sistema.com
     Password:   superadmin123

  👥 Tenant (Cliente Demo):
     URL:        http://cliente-demo.localhost:5173
     Email:      clientedemo@demo.com
     Password:   (la que configuraste)

  🔧 Backend API:
     URL:        http://localhost:3000/api
```

---

### 2. `stop-project.ps1` - Detener Proyecto

**Ubicación:** Raíz del proyecto

**Uso:**
```powershell
.\stop-project.ps1
```

**Funcionalidades:**
- 🔴 Busca y detiene procesos en puerto 3000 (Backend)
- 🔴 Busca y detiene procesos en puerto 5173 (Frontend)
- 🔴 Busca y detiene todos los procesos de Node.js relacionados
- 🔴 Libera los puertos para futuros usos
- ✅ Muestra confirmación de cada proceso detenido

**Procesos que detiene:**
- Servidor backend (NestJS)
- Servidor frontend (Vite)
- Procesos de Node.js relacionados
- Ventanas de PowerShell con npm

---

## 📖 Documentación Creada

### 1. `INICIO_RAPIDO.md`

Guía completa de inicio rápido que incluye:
- Instrucciones de uso de los scripts
- Credenciales de acceso
- Requisitos previos
- Configuración inicial
- Verificación del sistema
- Scripts disponibles
- Solución de problemas completa
- Checklist de inicio

### 2. `README.md`

README principal del proyecto que incluye:
- Descripción del sistema
- Características principales
- Tecnologías utilizadas
- Estructura del proyecto
- Guía de instalación
- Documentación disponible
- Scripts útiles
- Arquitectura multi-tenant
- Seguridad
- Base de datos

### 3. `doc/SCRIPTS_EJECUCION.md`

Este documento que explica:
- Resumen de scripts
- Funcionalidades detalladas
- Ejemplos de uso
- Casos de uso
- Ventajas

---

## 💡 Casos de Uso

### Caso 1: Desarrollo Diario

**Inicio del día:**
```powershell
.\start-project.ps1
```

**Fin del día:**
```powershell
.\stop-project.ps1
```

### Caso 2: Reiniciar el Proyecto

```powershell
.\stop-project.ps1
.\start-project.ps1
```

### Caso 3: Verificar si está Corriendo

El script `start-project.ps1` detecta automáticamente si el proyecto ya está corriendo y pregunta si deseas reiniciar.

### Caso 4: Limpiar Puertos Ocupados

Si los puertos están ocupados por otros procesos:

```powershell
.\stop-project.ps1
```

Esto liberará los puertos 3000 y 5173.

---

## 🔍 Detalles Técnicos

### Verificación de Puertos

El script usa `Test-NetConnection` para verificar si los puertos están ocupados:

```powershell
Test-NetConnection -ComputerName localhost -Port 3000
Test-NetConnection -ComputerName localhost -Port 5173
```

### Instalación de Dependencias

Si no existen las carpetas `node_modules`, el script ejecuta automáticamente:

```powershell
npm install
```

### Inicio de Servidores

Los servidores se inician en nuevas ventanas de PowerShell:

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$path'; npm run dev"
```

**Parámetros:**
- `-NoExit`: Mantiene la ventana abierta después de ejecutar el comando
- `-Command`: Comando a ejecutar

### Detención de Procesos

El script de detención usa:

```powershell
Get-NetTCPConnection -LocalPort $Port
Get-Process -Id $ProcessId
Stop-Process -Id $ProcessId -Force
```

---

## ⚙️ Configuración de los Scripts

### Variables Configurables

**Backend:**
- Puerto: 3000
- Comando: `npm run start:dev`
- Path: `./backend`

**Frontend:**
- Puerto: 5173
- Comando: `npm run dev`
- Path: `./frontend`

### Personalización

Si necesitas cambiar puertos o comandos, edita los scripts:

**`start-project.ps1`:**
```powershell
# Línea 15-16: Verificación de puertos
$backendRunning = Test-Port -Port 3000
$frontendRunning = Test-Port -Port 5173

# Línea 60: Comando del backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run start:dev"

# Línea 90: Comando del frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"
```

**`stop-project.ps1`:**
```powershell
# Línea 30-34: Puertos a liberar
Stop-ProcessOnPort -Port 3000 -Name "Backend"
Stop-ProcessOnPort -Port 5173 -Name "Frontend"
```

---

## 🎯 Ventajas de Usar los Scripts

### 1. Simplicidad
- Un solo comando para iniciar todo
- No necesitas recordar múltiples comandos
- No necesitas abrir múltiples terminales manualmente

### 2. Automatización
- Instalación automática de dependencias
- Verificación de puertos
- Detección de procesos corriendo

### 3. Información Clara
- Muestra URLs de acceso
- Muestra credenciales
- Muestra estado de cada servicio

### 4. Gestión de Errores
- Detecta puertos ocupados
- Pregunta antes de reiniciar
- Muestra mensajes claros de error

### 5. Productividad
- Ahorra tiempo en el inicio del proyecto
- Facilita el desarrollo diario
- Reduce errores humanos

---

## 🚨 Solución de Problemas

### Error: "No se puede ejecutar scripts en este sistema"

**Causa:** Política de ejecución de PowerShell

**Solución:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Puerto ya está en uso"

**Causa:** Otro proceso está usando el puerto

**Solución:**
```powershell
.\stop-project.ps1
```

### Las ventanas se cierran inmediatamente

**Causa:** Error en la instalación de dependencias

**Solución:**
1. Abre PowerShell manualmente
2. Navega a `backend` o `frontend`
3. Ejecuta `npm install`
4. Revisa los errores

### El navegador no se abre automáticamente

**Causa:** Configuración del sistema

**Solución:**
Abre manualmente: http://admin.localhost:5173

---

## 📝 Notas Importantes

1. **Permisos:** Los scripts requieren permisos de administrador para detener procesos

2. **Ventanas:** Las ventanas de backend y frontend deben permanecer abiertas mientras trabajas

3. **Logs:** Los logs se muestran en tiempo real en cada ventana

4. **Cierre:** Para detener el proyecto, usa `.\stop-project.ps1` o cierra las ventanas manualmente

5. **Desarrollo:** Los servidores tienen hot-reload, los cambios se reflejan automáticamente

---

## ✅ Checklist de Uso

### Primera Vez

- [ ] Instalar Node.js v18+
- [ ] Instalar PostgreSQL v14+
- [ ] Crear base de datos `consentimientos`
- [ ] Configurar `.env` en backend y frontend
- [ ] Ejecutar `.\start-project.ps1`
- [ ] Verificar que ambos servidores inicien correctamente
- [ ] Abrir http://admin.localhost:5173
- [ ] Login con Super Admin

### Uso Diario

- [ ] Ejecutar `.\start-project.ps1`
- [ ] Esperar a que ambos servidores inicien
- [ ] Desarrollar normalmente
- [ ] Al terminar, ejecutar `.\stop-project.ps1`

---

## 🎓 Ejemplos de Uso

### Ejemplo 1: Inicio Normal

```powershell
PS E:\PROJECTS\CONSENTIMIENTOS_2025> .\start-project.ps1

========================================
  Sistema de Consentimientos
  Iniciando proyecto completo...
========================================

Verificando puertos...
  ✅ Puerto 3000 (Backend) disponible
  ✅ Puerto 5173 (Frontend) disponible

========================================
  Iniciando Backend (Puerto 3000)
========================================
  🚀 Iniciando servidor backend...
  ✅ Backend iniciado en nueva ventana

  ⏳ Esperando 5 segundos para que el backend inicie...

========================================
  Iniciando Frontend (Puerto 5173)
========================================
  🚀 Iniciando servidor frontend...
  ✅ Frontend iniciado en nueva ventana

  ⏳ Esperando 8 segundos para que el frontend inicie...

========================================
  ✅ Proyecto Iniciado Exitosamente
========================================

📋 Información de Acceso:
...
```

### Ejemplo 2: Proyecto Ya Corriendo

```powershell
PS E:\PROJECTS\CONSENTIMIENTOS_2025> .\start-project.ps1

========================================
  Sistema de Consentimientos
  Iniciando proyecto completo...
========================================

Verificando puertos...
  ⚠️  Puerto 3000 (Backend) ya está en uso
  ⚠️  Puerto 5173 (Frontend) ya está en uso

El proyecto ya está corriendo.
¿Deseas reiniciar? (s/n): n
Operación cancelada.
```

### Ejemplo 3: Detener Proyecto

```powershell
PS E:\PROJECTS\CONSENTIMIENTOS_2025> .\stop-project.ps1

========================================
  Sistema de Consentimientos
  Deteniendo proyecto...
========================================

Buscando procesos en puerto 3000 (Backend)...
  🔴 Deteniendo: node (PID: 12345)
  ✅ Puerto 3000 liberado

Buscando procesos en puerto 5173 (Frontend)...
  🔴 Deteniendo: node (PID: 67890)
  ✅ Puerto 5173 liberado

Buscando ventanas de PowerShell con npm...
  🔴 Deteniendo procesos de Node.js...
    • Proceso detenido: PID 12345
    • Proceso detenido: PID 67890
  ✅ Procesos de Node.js detenidos

========================================
  ✅ Proyecto Detenido
========================================
```

---

## 🔗 Referencias

- **[INICIO_RAPIDO.md](../INICIO_RAPIDO.md)** - Guía completa de inicio
- **[README.md](../README.md)** - Documentación principal
- **[ESTADO_ACTUAL_SISTEMA.md](./ESTADO_ACTUAL_SISTEMA.md)** - Estado del sistema

---

**¡Los scripts están listos para usar! 🚀**
