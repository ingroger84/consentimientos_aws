# Estado Actual del Sistema

## ✅ Servicios Activos

### Docker Containers
- ✅ **PostgreSQL** - `consentimientos-db` - Puerto 5432
- ✅ **MinIO** - `consentimientos-storage` - Puertos 9000-9001
- ✅ **MailHog** - `consentimientos-mail` - Puertos 1025 (SMTP), 8025 (Web UI)

### Aplicaciones
- ✅ **Backend (NestJS)** - http://localhost:3000
  - API: http://localhost:3000/api
  - Proceso ID: 12
  - Estado: Running
  
- ✅ **Frontend (React + Vite)** - http://localhost:5173
  - Proceso ID: 11
  - Estado: Running

---

## 🎯 Funcionalidades Implementadas

### 1. Sistema de Autenticación
- Login con JWT
- Roles: Admin General, Admin Sede, Operador
- Guards de protección de rutas

### 2. Gestión de Usuarios
- CRUD completo
- Asignación de roles
- Asignación de sedes
- Activar/Desactivar usuarios

### 3. Gestión de Sedes
- CRUD completo
- Información de contacto
- Estado activo/inactivo

### 4. Gestión de Servicios
- CRUD completo
- Asociación con preguntas
- Estado activo/inactivo

### 5. Gestión de Preguntas
- CRUD completo
- Tipos: Sí/No, Texto libre
- Filtrado por servicio
- Orden personalizable
- Preguntas críticas y obligatorias

### 6. **Sistema de Consentimientos (NUEVO)**

#### Creación de Consentimientos
- Formulario de 3 pasos:
  1. Datos del cliente
  2. Preguntas del servicio
  3. Firma digital

#### Generación de 3 PDFs con Firma
Cada consentimiento genera automáticamente:
1. **PDF del Procedimiento**
   - Información del servicio
   - Preguntas y respuestas
   - Declaración de consentimiento
   - Firma digital

2. **PDF de Tratamiento de Datos Personales**
   - Ley 1581 de 2012
   - Derechos del titular
   - Información de contacto
   - Firma digital

3. **PDF de Utilización de Imágenes**
   - Autorización para uso de imágenes
   - Finalidades del tratamiento
   - Derechos del titular
   - Firma digital

#### Lista de Consentimientos
- **Búsqueda avanzada** por:
  - Nombre del cliente
  - Cédula/ID
  - Teléfono
  
- **Acciones disponibles:**
  - 📄 Ver PDF del Procedimiento (verde)
  - 📄 Ver PDF de Datos Personales (azul)
  - 📄 Ver PDF de Imágenes (morado)
  - 📧 Reenviar Email con los 3 PDFs
  - 🗑️ Eliminar consentimiento

#### Email Automático
- Se envía automáticamente al firmar
- Incluye los 3 PDFs adjuntos
- Template HTML profesional
- Verificable en MailHog

---

## 🔐 Credenciales de Acceso

### Usuario Administrador
- **Email:** admin@consentimientos.com
- **Password:** admin123

### Acceso a Servicios
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **MailHog Web UI:** http://localhost:8025
- **MinIO Console:** http://localhost:9001

---

## 📊 Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `roles` - Roles de usuario
- `branches` - Sedes
- `services` - Servicios ofrecidos
- `questions` - Preguntas por servicio
- `consents` - Consentimientos firmados
- `answers` - Respuestas a preguntas

### Última Migración
- `1704297600000-AddMultiplePdfUrls.ts`
- Agrega campos para las 3 URLs de PDFs

---

## 📁 Estructura de Archivos

### PDFs Generados
Los PDFs se guardan en: `backend/uploads/consents/`

Nomenclatura:
- `consent-{id}.pdf` - Procedimiento
- `consent-data-treatment-{id}.pdf` - Datos Personales
- `consent-image-rights-{id}.pdf` - Imágenes

---

## 🧪 Cómo Probar el Sistema

### 1. Acceder al Sistema
1. Abrir http://localhost:5173
2. Login con: admin@consentimientos.com / admin123

### 2. Crear un Consentimiento
1. Ir a "Consentimientos" → "Nuevo Consentimiento"
2. Llenar datos del cliente
3. Responder preguntas del servicio
4. Firmar digitalmente
5. Verificar que se generan los 3 PDFs

### 3. Verificar PDFs
1. En la lista de consentimientos
2. Click en cada botón de PDF (verde, azul, morado)
3. Verificar que cada PDF tiene:
   - Contenido correcto
   - Firma digital
   - Información de la sede

### 4. Verificar Email
1. Abrir http://localhost:8025 (MailHog)
2. Ver el email enviado
3. Verificar que tiene 3 archivos adjuntos
4. Descargar y revisar cada PDF

### 5. Probar Búsqueda
1. En la lista de consentimientos
2. Usar la barra de búsqueda
3. Buscar por nombre, cédula o teléfono

### 6. Reenviar Email
1. Click en el botón de email (📧)
2. Confirmar
3. Verificar en MailHog que llegan los 3 PDFs

---

## 🔧 Comandos Útiles

### Detener Todo
```bash
docker-compose down
```

### Iniciar Docker
```bash
docker-compose up -d
```

### Iniciar Backend
```bash
cd backend
npm run start:dev
```

### Iniciar Frontend
```bash
cd frontend
npm run dev
```

### Ver Logs de Docker
```bash
docker-compose logs -f
```

### Ejecutar Migraciones
```bash
cd backend
npm run migration:run
```

### Ejecutar Seed
```bash
cd backend
npm run seed
```

---

## 📋 Procesos en Ejecución

### Backend
- **Proceso ID:** 12
- **Puerto:** 3000
- **Estado:** Running
- **Comando:** `npm run start:dev`

### Frontend
- **Proceso ID:** 11
- **Puerto:** 5173
- **Estado:** Running
- **Comando:** `npm run dev`

---

## ⚠️ Notas Importantes

1. **Los 3 PDFs se generan simultáneamente** al firmar el consentimiento
2. **Cada PDF incluye la misma firma digital** del cliente
3. **El email incluye los 3 PDFs** como archivos adjuntos
4. **La búsqueda es case-insensitive** y busca en nombre, cédula y teléfono
5. **La eliminación es soft delete** - Los registros no se borran físicamente
6. **MailHog captura todos los emails** - No se envían emails reales

---

## 🚀 Todo Está Listo

El sistema está completamente funcional y listo para usar. Puedes:

1. ✅ Crear consentimientos con firma digital
2. ✅ Generar 3 PDFs automáticamente
3. ✅ Enviar emails con los 3 PDFs adjuntos
4. ✅ Buscar consentimientos por nombre, cédula o teléfono
5. ✅ Visualizar cada PDF individualmente
6. ✅ Reenviar emails cuando sea necesario
7. ✅ Eliminar consentimientos

**Accede al sistema en:** http://localhost:5173
