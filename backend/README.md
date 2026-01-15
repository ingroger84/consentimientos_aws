# Backend - Sistema de Consentimientos Digitales

API REST construida con NestJS, TypeScript y PostgreSQL.

## 🚀 Instalación

```bash
npm install
```

## ⚙️ Configuración

1. Copiar el archivo de ejemplo:
```bash
copy .env.example .env
```

2. Configurar las variables de entorno en `.env`

## 🗄️ Base de Datos

Iniciar PostgreSQL con Docker:
```bash
cd ..
docker-compose up -d postgres
```

Ejecutar migraciones:
```bash
npm run migration:run
```

## 🏃 Ejecución

Desarrollo:
```bash
npm run start:dev
```

Producción:
```bash
npm run build
npm run start:prod
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/validate` - Validar token

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/:id` - Obtener usuario
- `PATCH /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Sedes
- `GET /api/branches` - Listar sedes
- `POST /api/branches` - Crear sede
- `GET /api/branches/:id` - Obtener sede
- `PATCH /api/branches/:id` - Actualizar sede
- `DELETE /api/branches/:id` - Eliminar sede

### Servicios
- `GET /api/services` - Listar servicios
- `POST /api/services` - Crear servicio
- `GET /api/services/:id` - Obtener servicio
- `PATCH /api/services/:id` - Actualizar servicio
- `DELETE /api/services/:id` - Eliminar servicio

### Consentimientos
- `GET /api/consents` - Listar consentimientos
- `POST /api/consents` - Crear consentimiento
- `GET /api/consents/:id` - Obtener consentimiento
- `PATCH /api/consents/:id/sign` - Firmar consentimiento
- `POST /api/consents/:id/resend-email` - Reenviar email
- `DELETE /api/consents/:id` - Eliminar consentimiento

## 🔐 Autenticación

Todas las rutas (excepto login) requieren token JWT en el header:
```
Authorization: Bearer <token>
```

## 👥 Roles

- `ADMIN_GENERAL`: Acceso completo
- `ADMIN_SEDE`: Gestión de su sede
- `OPERADOR`: Crear consentimientos

## 🧪 Testing

```bash
npm run test
npm run test:e2e
npm run test:cov
```
