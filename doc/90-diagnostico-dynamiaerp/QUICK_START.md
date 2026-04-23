# Quick Start: Despliegue Corrección DynamiaERP

**Versión**: v90  
**Tiempo estimado**: 10-15 minutos

---

## 🚀 Despliegue Rápido

### Opción 1: Script Automatizado (Recomendado)

```powershell
# Ejecutar desde la raíz del proyecto
.\scripts\deploy-v90-dynamiaerp-fix.ps1
```

El script hace todo automáticamente:
- ✅ Compila el backend
- ✅ Sube archivos al servidor
- ✅ Actualiza .env
- ✅ Reinicia PM2
- ✅ Prueba la conexión
- ✅ Opción de reenviar factura

---

## 📋 Checklist Rápido

### Antes de Desplegar:
- [ ] Tienes acceso SSH al servidor (100.28.198.249)
- [ ] Tienes las credenciales de DynamiaERP
- [ ] El backend compila sin errores (`npm run build`)

### Durante el Despliegue:
- [ ] Script ejecutado sin errores
- [ ] Backend reiniciado correctamente
- [ ] Conexión a DynamiaERP exitosa

### Después del Despliegue:
- [ ] Factura de Aquiub reenviada
- [ ] CUFE generado correctamente
- [ ] Logs sin errores

---

## 🧪 Pruebas Rápidas

### 1. Probar Conexión (30 segundos)
```bash
ssh ubuntu@100.28.198.249
cd /home/ubuntu/archivo-en-linea
node backend/test-dynamiaerp-correct-endpoint.js
```

**Resultado esperado**: Conexión exitosa, servidor responde

### 2. Reenviar Factura (1 minuto)
```bash
node backend/resend-invoice-to-dynamiaerp.js INV-202604-3740
```

**Resultado esperado**: CUFE generado, factura actualizada

### 3. Verificar Logs (30 segundos)
```bash
pm2 logs backend --lines 50
```

**Resultado esperado**: Sin errores, logs normales

---

## ❌ Troubleshooting Rápido

### Error: "Cannot connect to server"
```bash
# Verificar que el servidor esté corriendo
pm2 status

# Si está detenido, reiniciar
pm2 restart backend
```

### Error: "CUFE not generated"
```bash
# Verificar configuración de DynamiaERP
cat backend/.env | grep DYNAMIAERP

# Debe mostrar:
# DYNAMIAERP_BASE_URL=api.pos.dynamiaerp.co
# DYNAMIAERP_TOKEN=tk...
# DYNAMIAERP_LLAVE_TECNICA=b4...
```

### Error: "Invalid credentials"
```bash
# Verificar token en .env
nano backend/.env

# Actualizar si es necesario
DYNAMIAERP_TOKEN=tk60188bfb066427ba846544a563212d9f70e1acb8a4d52fa22b3cacf2018f90e6
```

---

## 📞 Comandos Útiles

### Ver Logs en Tiempo Real:
```bash
pm2 logs backend
```

### Reiniciar Backend:
```bash
pm2 restart backend
```

### Diagnosticar Facturas:
```bash
node backend/diagnose-dynamiaerp-invoice.js
```

### Reenviar Factura:
```bash
node backend/resend-invoice-to-dynamiaerp.js INV-XXXXXX-XXXX
```

---

## ✅ Verificación Final

### 1. Backend Corriendo
```bash
pm2 status
# backend debe estar "online"
```

### 2. Configuración Correcta
```bash
cat backend/.env | grep DYNAMIAERP_BASE_URL
# Debe mostrar: api.pos.dynamiaerp.co
```

### 3. Factura con CUFE
```bash
node backend/diagnose-dynamiaerp-invoice.js
# Debe mostrar INV-202604-3740 con CUFE
```

---

## 🎯 Resultado Esperado

Después del despliegue exitoso:

1. ✅ Backend corriendo sin errores
2. ✅ Conexión a DynamiaERP funcionando
3. ✅ Factura INV-202604-3740 con CUFE generado
4. ✅ Próximas facturas se envían automáticamente

---

## 📚 Documentación Completa

Para más detalles, ver:
- `README.md` - Índice completo
- `RESUMEN_CORRECCION_FINAL.md` - Resumen ejecutivo
- `CORRECCION_ESTRUCTURA_BODY_SWAGGER.md` - Estructura del API
- `MAPA_VISUAL.md` - Diagramas y flujos

---

**Tiempo total**: 10-15 minutos  
**Dificultad**: Baja (script automatizado)  
**Riesgo**: Bajo (no afecta funcionalidad existente)
