# 🐳 Guía de Instalación de Docker Desktop en Windows

## Requisitos del Sistema

- Windows 10 64-bit: Pro, Enterprise, o Education (Build 19041 o superior)
- O Windows 11 64-bit
- Virtualización habilitada en BIOS
- Mínimo 4GB de RAM (recomendado 8GB)

## Paso 1: Descargar Docker Desktop

1. Ve a: https://www.docker.com/products/docker-desktop/
2. Haz clic en "Download for Windows"
3. O descarga directamente: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

## Paso 2: Instalar Docker Desktop

1. Ejecuta el archivo `Docker Desktop Installer.exe`
2. En la configuración, asegúrate de marcar:
   - ✅ **Use WSL 2 instead of Hyper-V** (recomendado)
   - ✅ **Add shortcut to desktop**
3. Haz clic en "Ok" para continuar
4. Espera a que termine la instalación
5. Haz clic en "Close and restart" cuando termine

## Paso 3: Configurar Docker Desktop

1. Después de reiniciar, abre Docker Desktop
2. Acepta los términos de servicio
3. Puedes omitir el tutorial inicial
4. Espera a que Docker Desktop inicie completamente (el ícono en la barra de tareas debe estar verde)

## Paso 4: Verificar la Instalación

Abre PowerShell o CMD y ejecuta:

```powershell
docker --version
docker-compose --version
```

Deberías ver algo como:
```
Docker version 24.0.x, build xxxxx
Docker Compose version v2.x.x
```

## Paso 5: Probar Docker

Ejecuta un contenedor de prueba:

```powershell
docker run hello-world
```

Si ves un mensaje de "Hello from Docker!", la instalación fue exitosa.

## Paso 6: Iniciar el Proyecto

Ahora puedes volver a la carpeta del proyecto y ejecutar:

```powershell
cd E:\PROJECTS\CONSENTIMIENTOS_2025
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en puerto 5432
- MinIO en puertos 9000 y 9001
- MailHog en puertos 1025 y 8025

## Verificar que los Servicios Están Corriendo

```powershell
docker-compose ps
```

Deberías ver 3 contenedores corriendo:
- consentimientos-db (postgres)
- consentimientos-storage (minio)
- consentimientos-mail (mailhog)

## Paso 7: Ejecutar el Seed

```powershell
cd backend
npm install
npm run seed
```

## Solución de Problemas

### Error: "WSL 2 installation is incomplete"

1. Abre PowerShell como Administrador
2. Ejecuta:
```powershell
wsl --install
```
3. Reinicia tu computadora

### Error: "Hardware assisted virtualization and data execution protection must be enabled in the BIOS"

1. Reinicia tu PC y entra al BIOS (generalmente F2, F10, o DEL al iniciar)
2. Busca la opción de "Virtualization Technology" o "Intel VT-x" o "AMD-V"
3. Habilítala
4. Guarda y reinicia

### Docker Desktop no inicia

1. Abre "Services" (services.msc)
2. Busca "Docker Desktop Service"
3. Haz clic derecho → Start
4. Si no existe, reinstala Docker Desktop

### Los contenedores no inician

```powershell
# Detener todos los contenedores
docker-compose down

# Limpiar volúmenes
docker-compose down -v

# Iniciar de nuevo
docker-compose up -d
```

## Comandos Útiles de Docker

```powershell
# Ver contenedores corriendo
docker ps

# Ver todos los contenedores
docker ps -a

# Ver logs de un contenedor
docker logs consentimientos-db

# Detener todos los servicios
docker-compose down

# Iniciar servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar un servicio específico
docker-compose restart postgres

# Eliminar todo (contenedores, volúmenes, imágenes)
docker-compose down -v --rmi all
```

## Recursos Adicionales

- Documentación oficial: https://docs.docker.com/desktop/install/windows-install/
- WSL 2: https://docs.microsoft.com/en-us/windows/wsl/install
- Troubleshooting: https://docs.docker.com/desktop/troubleshoot/overview/

## Siguiente Paso

Una vez que Docker esté instalado y funcionando, continúa con la GUIA_INICIO.md para configurar el proyecto completo.
