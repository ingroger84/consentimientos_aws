# 🚀 EJECUTAR DESPLIEGUE v90 - INSTRUCCIONES INMEDIATAS

**IMPORTANTE**: Todo el código está listo. Solo necesitas ejecutar estos comandos.

---

## ⚡ Opción Rápida (Recomendada)

### Paso 1: Abrir PowerShell en la raíz del proyecto

```powershell
# Verificar que estás en la raíz del proyecto
pwd
# Debe mostrar: E:\PROJECTS\CONSENTIMIENTOS_2025_1.3_FUNCIONAL_LOCAL
```

### Paso 2: Ejecutar comandos de subida

```powershell
# Subir dist compilado
scp -i AWS-ISSABEL.pem -r backend/dist ubuntu@100.28.198.249:/home/ubuntu/archivo-en-linea/backend/

# Subir scripts actualizados
scp -i AWS-ISSABEL.pem backend/resend-invoice-to-dynamiaerp.js ubuntu@100.28.198.249:/home/ubuntu/archivo-en-linea/backend/

scp -i AWS-ISSABEL.pem backend/test-dynamiaerp-correct-endpoint.js ubuntu@100.28.198.249:/home/ubuntu/archivo-en-linea/backend/

scp -i AWS-ISSABEL.pem backend/diagnose-dynamiaerp-invoice.js ubuntu@100.28.198.249:/home/ubuntu/archivo-en-linea/backend/

# Subir script de despliegue
scp -i AWS-ISSABEL.pem scripts/deploy-v90-server-side.sh ubuntu@100.28.198.249:/home/ubuntu/archivo-en-linea/
```

### Paso 3: Conectar al servidor y ejecutar

```powershell
# Conectar
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Una vez conectado, ejecutar:
cd /home/ubuntu/archivo-en-linea
chmod +x deploy-v90-server-side.sh
./deploy-v90-server-side.sh
```

El script automáticamente:
- ✅ Hace backup del .env
- ✅ Actualiza la URL de DynamiaERP
- ✅ Reinicia PM2
- ✅ Verifica logs
- ✅ Prueba la conexión

### Paso 4: Reenviar factura de Aquiub

```bash
# Aún conectado al servidor
node backend/resend-invoice-to-dynamiaerp.js INV-202604-3740
```

### Paso 5: Verificar CUFE generado

```bash
node backend/diagnose-dynamiaerp-invoice.js
```

---

## 📋 Comandos Completos (Copiar y Pegar)

### En PowerShell Local:

```powershell
# Subir todos los archivos (ejecutar uno por uno)
scp -i AWS-ISSABEL.pem -r backend/dist ubuntu@100.28.198.249:/home/ubuntu/archivo-en-linea/backend/
scp -i AWS-ISSABEL.pem backend/resend-invoice-to-dynamiaerp.js ubuntu@100.28.198.249:/home/ubuntu/archivo-en-linea/backend/
scp -i AWS-ISSABEL.pem backend/test-dynamiaerp-correct-endpoint.js ubuntu@100.28.198.249:/home/ubuntu/archivo-en-linea/backend/
scp -i AWS-ISSABEL.pem backend/diagnose-dynamiaerp-invoice.js ubuntu@100.28.198.249:/home/ubuntu/archivo-en-linea/backend/
scp -i AWS-ISSABEL.pem scripts/deploy-v90-server-side.sh ubuntu@100.28.198.249:/home/ubuntu/archivo-en-linea/
```

### En SSH (Servidor):

```bash
# Conectar
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ejecutar despliegue
cd /home/ubuntu/archivo-en-linea
chmod +x deploy-v90-server-side.sh
./deploy-v90-server-side.sh

# Reenviar factura
node backend/resend-invoice-to-dynamiaerp.js INV-202604-3740

# Verificar
node backend/diagnose-dynamiaerp-invoice.js

# Ver logs
pm2 logs backend --lines 50
```

---

## ✅ Resultado Esperado

Después de ejecutar todo:

1. ✅ Backend reiniciado sin errores
2. ✅ URL de DynamiaERP actualizada a `api.pos.dynamiaerp.co`
3. ✅ Factura INV-202604-3740 con CUFE generado
4. ✅ Sistema funcionando correctamente

---

## ❌ Si Algo Falla

### Error al subir archivos:
```powershell
# Verificar que AWS-ISSABEL.pem existe
ls AWS-ISSABEL.pem

# Si no existe, buscar en credentials/
ls credentials/AWS-ISSABEL.pem

# Usar la ruta correcta
scp -i credentials/AWS-ISSABEL.pem -r backend/dist ubuntu@100.28.198.249:/home/ubuntu/archivo-en-linea/backend/
```

### Error de permisos SSH:
```powershell
# Ajustar permisos del archivo .pem (si es necesario)
icacls AWS-ISSABEL.pem /inheritance:r
icacls AWS-ISSABEL.pem /grant:r "$($env:USERNAME):(R)"
```

### Backend no reinicia:
```bash
# Ver estado
pm2 status

# Reiniciar manualmente
pm2 restart backend

# Ver logs de error
pm2 logs backend --err --lines 50
```

---

## 📞 Verificación Final

```bash
# 1. Verificar que backend está corriendo
pm2 status
# Debe mostrar: backend | online

# 2. Verificar configuración
cat backend/.env | grep DYNAMIAERP_BASE_URL
# Debe mostrar: DYNAMIAERP_BASE_URL=api.pos.dynamiaerp.co

# 3. Verificar factura con CUFE
node backend/diagnose-dynamiaerp-invoice.js | grep INV-202604-3740
# Debe mostrar la factura con CUFE
```

---

## 🎯 Tiempo Estimado

- Subir archivos: 2 minutos
- Ejecutar script: 1 minuto
- Reenviar factura: 30 segundos
- Verificar: 30 segundos

**Total: ~5 minutos**

---

## 📚 Documentación Completa

Si necesitas más detalles:
- `RESUMEN_TRABAJO_V90.md` - Resumen completo
- `doc/90-diagnostico-dynamiaerp/DESPLIEGUE_COMPLETADO.md` - Instrucciones detalladas
- `doc/90-diagnostico-dynamiaerp/QUICK_START.md` - Guía rápida

---

**TODO ESTÁ LISTO. SOLO EJECUTA LOS COMANDOS ARRIBA.** 🚀
