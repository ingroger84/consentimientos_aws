# Frontend - Sistema de Consentimientos Digitales

Aplicación web construida con React, TypeScript, Vite y TailwindCSS.

## 🚀 Instalación

```bash
npm install
```

## ⚙️ Configuración

1. Copiar el archivo de ejemplo:
```bash
copy .env.example .env
```

2. Configurar la URL del API en `.env`

## 🏃 Ejecución

Desarrollo:
```bash
npm run dev
```

Build:
```bash
npm run build
```

Preview:
```bash
npm run preview
```

## 📱 Características

- **Autenticación**: Login con JWT
- **Dashboard**: Vista general del sistema
- **Consentimientos**: Crear y gestionar consentimientos digitales
- **Firma Digital**: Captura de firma táctil con signature_pad
- **Responsive**: Optimizado para tablets y móviles
- **Gestión**: Usuarios, sedes y servicios

## 🎨 Tecnologías

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- React Query
- Zustand (state management)
- React Hook Form
- Signature Pad
- Lucide Icons

## 📂 Estructura

```
src/
├── components/     # Componentes reutilizables
├── pages/          # Páginas de la aplicación
├── services/       # Servicios API
├── store/          # Estado global (Zustand)
├── types/          # Tipos TypeScript
├── hooks/          # Custom hooks
└── utils/          # Utilidades
```
