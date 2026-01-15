# 🚀 Guía de Inicio Rápido

## Prerrequisitos

- Node.js 18 o superior
- Docker y Docker Compose
- Git

## 📦 Instalación Completa

### 1. Iniciar Servicios con Docker

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL (puerto 5432)
- MinIO (puertos 9000 y 9001)
- MailHog (puertos 1025 y 8025)

### 2. Configurar Backend

```bash
cd backend
npm install
copy .env.example .env
```

Editar `.env` si es necesario (los valores por defecto funcionan con Docker).

### 3. Inicializar Base de Datos

```bash
npm run seed
```

Esto creará:
- Roles del sistema
- 2 sedes de ejemplo
- 2 usuarios de prueba
- 2 servicios con preguntas

### 4. Iniciar Backend

```bash
npm run start:dev
```

El backend estará disponible en: http://localhost:3000

### 5. Configurar Frontend

En otra terminal:

```bash
cd frontend
npm install
copy .env.example .env
```

### 6. Iniciar Frontend

```bash
npm run dev
```

El frontend estará disponible en: http://localhost:5173

## 🔐 Credenciales de Prueba

**Administrador:**
- Email: admin@consentimientos.com
- Contraseña: admin123

**Operador:**
- Email: operador@consentimientos.com
- Contraseña: operador123

## 🎯 Flujo de Prueba

1. Ingresar con las credenciales de administrador
2. Ir a "Consentimientos" → "Nuevo Consentimiento"
3. Seleccionar un servicio y sede
4. Llenar datos del cliente
5. Responder preguntas de restricciones
6. Capturar firma digital
7. El sistema generará el PDF y enviará el email

## 📧 Ver Emails de Prueba

Abrir MailHog en: http://localhost:8025

Aquí verás todos los emails enviados por el sistema.

## 🗄️ Gestionar Archivos

Abrir MinIO Console en: http://localhost:9001
- Usuario: minioadmin
- Contraseña: minioadmin123

## 🛠️ Comandos Útiles

### Backend

```bash
# Desarrollo
npm run start:dev

# Build
npm run build

# Tests
npm run test

# Seed (reiniciar datos)
npm run seed
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview
```

### Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reiniciar todo
docker-compose down -v
docker-compose up -d
```

## 📚 Estructura del Proyecto

```
consentimientos-digitales/
├── backend/                 # API REST (NestJS)
│   ├── src/
│   │   ├── auth/           # Autenticación
│   │   ├── users/          # Usuarios
│   │   ├── roles/          # Roles
│   │   ├── branches/       # Sedes
│   │   ├── services/       # Servicios
│   │   ├── consents/       # Consentimientos
│   │   ├── questions/      # Preguntas
│   │   └── answers/        # Respuestas
│   └── package.json
├── frontend/               # App React
│   ├── src/
│   │   ├── components/    # Componentes
│   │   ├── pages/         # Páginas
│   │   ├── services/      # API services
│   │   └── store/         # Estado global
│   └── package.json
└── docker-compose.yml     # Servicios
```

## 🔧 Solución de Problemas

### El backend no inicia

1. Verificar que PostgreSQL esté corriendo:
```bash
docker-compose ps
```

2. Verificar las variables de entorno en `.env`

3. Reiniciar la base de datos:
```bash
docker-compose down -v
docker-compose up -d postgres
npm run seed
```

### El frontend no se conecta al backend

1. Verificar que el backend esté corriendo en puerto 3000
2. Verificar la variable `VITE_API_URL` en `frontend/.env`

### No se generan los PDFs

1. Verificar que la carpeta `backend/uploads` tenga permisos de escritura
2. Revisar los logs del backend

### No llegan los emails

1. Verificar que MailHog esté corriendo:
```bash
docker-compose ps mailhog
```

2. Abrir http://localhost:8025 para ver los emails

## 📖 Próximos Pasos

1. Personalizar los servicios y preguntas
2. Configurar SMTP real para producción
3. Configurar AWS S3 para almacenamiento de PDFs
4. Implementar módulos de usuarios, sedes y servicios completos
5. Agregar reportes y estadísticas
6. Implementar auditoría completa

## 🆘 Soporte

Para problemas o preguntas, revisar:
- README.md principal
- backend/README.md
- frontend/README.md
