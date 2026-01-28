# Quick Start: Integración HC-Consentimientos

**Versión:** 15.0.9  
**Fecha:** 2026-01-25

---

## ⚡ Inicio Rápido (5 minutos)

### 1. Ejecutar Migración
```bash
cd backend
node run-consent-integration-migration.js
```

### 2. Iniciar Servicios
```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 3. Probar Funcionalidad
1. Ir a http://demo-medico.localhost:5173
2. Login: `admin@clinicademo.com` / `Demo123!`
3. Navegar a "Historias Clínicas"
4. Abrir una HC activa
5. Click en "Generar Consentimiento"
6. Completar formulario
7. Ver resultado en tab "Consentimientos"

---

## 📋 Checklist Rápido

- [ ] Migración ejecutada
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] Login exitoso
- [ ] Botón "Generar Consentimiento" visible
- [ ] Modal se abre correctamente
- [ ] Formulario se envía sin errores
- [ ] Consentimiento aparece en tab

---

## 🔍 Verificación Rápida

### Base de Datos
```sql
SELECT COUNT(*) FROM medical_record_consents;
```

### Backend
```bash
curl http://localhost:3000/api/medical-records
```

### Frontend
Abrir consola del navegador, no debe haber errores.

---

## 🐛 Problemas Comunes

**Botón no aparece:**
- Verificar que la HC está en estado "active"
- Limpiar caché del navegador (Ctrl + Shift + R)

**Error al crear:**
- Verificar que la migración se ejecutó
- Revisar logs del backend
- Verificar conexión a base de datos

**No aparece en la lista:**
- Recargar la página
- Verificar en base de datos que se creó
- Revisar consola del navegador

---

## 📚 Documentación Completa

Para más detalles, ver:
- [Resumen Ejecutivo](./RESUMEN_EJECUTIVO.md)
- [Implementación Completada](./02_IMPLEMENTACION_COMPLETADA.md)
- [Instrucciones de Prueba](./03_INSTRUCCIONES_PRUEBA.md)

---

## 🎯 Próximos Pasos

1. Probar todos los casos de prueba
2. Reportar bugs encontrados
3. Implementar integración completa con ConsentsService
4. Agregar selector de plantillas
5. Implementar firma digital desde HC

---

**¿Listo?** ¡Comienza con el paso 1! 🚀
