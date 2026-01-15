# 🚀 Inicio Rápido - Captura de Foto del Cliente

## ✅ Todo Está Listo

La funcionalidad de captura de foto del cliente está completamente implementada y funcionando.

## 🎯 Acceso Rápido

### Servicios Activos
- **Frontend**: http://localhost:5173 ✅
- **Backend**: http://localhost:3000 ✅
- **Base de Datos**: PostgreSQL (Docker) ✅

### Usuarios de Prueba
- **Admin**: admin@consentimientos.com / admin123
- **Operador**: operador@consentimientos.com / operador123

## 📸 Prueba Rápida (3 minutos)

### Paso 1: Crear Consentimiento (1 min)
```
1. Ir a http://localhost:5173
2. Login con admin o operador
3. Click en "Consentimientos" → "Nuevo Consentimiento"
4. Seleccionar servicio y sede
5. Llenar datos del cliente
```

### Paso 2: Capturar Foto (1 min)
```
1. Scroll hasta "Foto del Cliente (Opcional)"
2. Click en "Tomar Foto del Cliente"
3. Permitir acceso a la cámara (si se solicita)
4. Centrar el rostro en la guía punteada
5. Click en "Capturar Foto"
6. Revisar la foto capturada
7. Click en "Confirmar"
```

### Paso 3: Verificar en PDF (1 min)
```
1. Click en "Continuar"
2. Responder preguntas (si hay)
3. Click en "Continuar"
4. Firmar en el recuadro
5. Esperar generación del PDF
6. Ir a lista de consentimientos
7. Click en botón verde "PDF"
8. Verificar que la foto aparece al lado de la firma
```

## 🎨 Qué Esperar

### En el Formulario
- Botón azul "Tomar Foto del Cliente"
- Vista previa de la cámara en tiempo real
- Guía visual con borde punteado
- Preview de la foto capturada
- Botones para retomar o confirmar

### En el PDF
```
┌──────────────────────────────────────┐
│ Firma:          Foto del Cliente:   │
│ ┌──────┐       ┌──────┐             │
│ │      │       │      │             │
│ │ ✍️   │       │ 📷   │             │
│ │      │       │      │             │
│ └──────┘       └──────┘             │
└──────────────────────────────────────┘
```

La foto aparece en las **3 secciones** del PDF:
1. Consentimiento del Procedimiento
2. Tratamiento de Datos Personales
3. Utilización de Imágenes

## 💡 Consejos Rápidos

### Para Buenas Fotos
- ✅ Buena iluminación frontal
- ✅ Cliente mirando a la cámara
- ✅ Rostro centrado en la guía
- ✅ Fondo neutro si es posible

### Si Algo Falla
- **No se abre la cámara**: Verificar permisos del navegador
- **Foto borrosa**: Retomar con mejor iluminación
- **No aparece en PDF**: Verificar que se capturó antes de continuar

## 🔑 Características Clave

### Opcional
- No es obligatorio tomar foto
- Se puede continuar sin foto
- PDF mostrará "Sin foto" si no se captura

### Flexible
- Se puede retomar la foto
- Se puede eliminar y tomar otra
- Vista previa antes de confirmar

### Seguro
- Permisos explícitos del usuario
- Cámara se detiene automáticamente
- Foto almacenada de forma segura

## 📱 Compatibilidad

### Funciona en:
- ✅ Computadoras con webcam
- ✅ Laptops con cámara integrada
- ✅ Tablets
- ✅ Smartphones

### Navegadores:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## ⚠️ Importante

### En Desarrollo (localhost)
- ✅ Funciona sin problemas
- ✅ No requiere HTTPS

### En Producción
- ⚠️ **REQUIERE HTTPS**
- Los navegadores modernos bloquean acceso a cámara sin HTTPS
- Configurar certificado SSL válido

## 🆘 Ayuda Rápida

### Problema: No puedo acceder a la cámara
```
1. Verificar permisos del navegador
2. Cerrar otras apps que usen la cámara
3. Recargar la página
4. Intentar con otro navegador
```

### Problema: Foto no aparece en el PDF
```
1. Verificar que se capturó la foto
2. Verificar que se confirmó (no solo capturó)
3. Verificar que aparece en el formulario
4. Completar el consentimiento normalmente
```

### Problema: Cámara no se detiene
```
1. Recargar la página
2. Cerrar y abrir el navegador
3. Verificar que no hay otros tabs usando la cámara
```

## 📚 Documentación Completa

- **Técnica**: `CAPTURA_FOTO_CLIENTE.md`
- **Resumen**: `RESUMEN_FOTO_CLIENTE.md`
- **Inicio Rápido**: `INICIO_RAPIDO_FOTO.md` (este archivo)

## ✨ ¡Listo para Usar!

El sistema está completamente funcional. Puedes empezar a:
1. Crear consentimientos con foto del cliente
2. Generar PDFs con foto y firma
3. Enviar emails con documentos completos

---

**¿Necesitas más ayuda?** Consulta la documentación completa en `CAPTURA_FOTO_CLIENTE.md`

**Estado**: ✅ FUNCIONANDO
**Fecha**: 4 de enero de 2026

