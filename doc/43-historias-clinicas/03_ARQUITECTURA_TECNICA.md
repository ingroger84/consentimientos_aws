# Arquitectura Técnica - Módulo de Historias Clínicas

## Stack Tecnológico

### Backend
- **Framework**: NestJS (ya implementado)
- **Base de datos**: PostgreSQL (ya implementado)
- **ORM**: TypeORM (ya implementado)
- **Almacenamiento**: AWS S3 (ya implementado)
- **Autenticación**: JWT (ya implementado)

### Frontend
- **Framework**: React + TypeScript (ya implementado)
- **Estado**: Zustand (ya implementado)
- **UI**: Tailwind CSS (ya implementado)
- **Formularios**: React Hook Form (ya implementado)

## Estructura de Módulos

### Backend Structure
```
backend/src/
├── medical-records/
│   ├── medical-records.module.ts
│   ├── medical-records.controller.ts
│   ├── medical-records.service.ts
│   ├── entities/
│   │   ├── medical-record.entity.ts
│   │   ├── anamnesis.entity.ts
│   │   ├── physical-exam.entity.ts
│   │   ├── diagnosis.entity.ts
│   │   ├── evolution.entity.ts
│   │   ├── prescription.entity.ts
│   │   └── medical-order.entity.ts
│   ├── dto/
│   │   ├── create-medical-record.dto.ts
│   │   ├── update-medical-record.dto.ts
│   │   └── ...
│   └── guards/
│       └── medical-record-access.guard.ts
```
