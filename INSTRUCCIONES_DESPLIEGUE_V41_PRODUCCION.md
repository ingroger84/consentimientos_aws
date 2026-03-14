# 🚀 INSTRUCCIONES PARA DESPLEGAR V41.1.0 EN PRODUCCIÓN

**IMPORTANTE:** Lee TODAS las instrucciones antes de ejecutar cualquier comando.

---

## ✅ ESTADO ACTUAL

### Localhost (Tu Computadora)
- ✅ Código restaurado a v41.1.0
- ✅ Backend compilado y listo
- ✅ GitHub actualizado
- ✅ Sin sistema de perfiles
- ✅ HC y admisiones funcionando perfectamente

### Producción (AWS DatAgree)
- ⚠️ Todavía tiene código v42.2.1
- ⚠️ Puede tener tablas de perfiles en BD (si se crearon)
- ⏳ Necesita actualización

---

## 🎯 OBJETIVO

Actualizar el servidor de producción (AWS DatAgree) con el código v41.1.0 limpio, eliminando COMPLETAMENTE el sistema de perfiles.

---

## 📋 PASOS PARA DESPLEGAR

### PASO 1: Abrir PowerShell en tu computadora

```powershell
# Navegar al directorio del proyecto
cd E:\PROJECTS\CONSENTIMIENTOS_2025_1.3_FUNCIONAL_LOCAL

# Verificar que estás en el directorio correcto
pwd
# Debe mostrar: E:\PROJECTS\CONSENTIMIENTOS_2025_1.3_FUNCIONAL_LOCAL
```

---

### PASO 2: Ejecutar el script de despliegue

```powershell
cd deploy
.\deploy-v41-production-clean.ps1
```

**¿Qué hará el script?**
1. ✅ Crear backup del código actual en producción
2. ✅ Subir backend compilado v41.1.0
3. ✅ Subir script SQL de limpieza
4. ⚠️ **PREGUNTARÁ SI DESEAS CONTINUAR** (antes de limpiar BD)
5. ✅ Limpiar base de datos (eliminar tablas de perfiles)
6. ✅ Reiniciar PM2
7. ✅ Mostrar logs y versión

**IMPORTANTE:** El script te pedirá confirmación antes de limpiar la base de datos. Escribe `S` y presiona Enter para continuar.

---

### PASO 3: Verificar que el despliegue fue exitoso

El script mostrará al final:

```
============================================================================
✅ DESPLIEGUE V41.0.0 COMPLETADO
============================================================================
```

Si ves este mensaje, el despliegue fue exitoso.

---

### PASO 4: Probar el sistema en producción

#### 4.1. Probar Login
1. Abrir navegador
2. Ir a: https://admin.archivoenlinea.com
3. Iniciar sesión con tu usuario Super Admin
4. **Verificar:** NO debe aparecer el menú "Perfiles"

#### 4.2. Probar Historias Clínicas
1. Ir a "Historias Clínicas"
2. Hacer clic en "Nueva Historia Clínica"
3. Buscar un cliente
4. Llenar el formulario
5. Seleccionar tipo de admisión
6. Guardar
7. **Verificar:** La HC se crea correctamente y se abre sin errores

#### 4.3. Probar Admisiones
1. Abrir una HC existente
2. Ir a la pestaña "Admisiones"
3. Hacer clic en "Nueva Admisión"
4. Seleccionar tipo de admisión
5. Ingresar motivo
6. Guardar
7. **Verificar:** La admisión se crea correctamente

---

## ⚠️ SI ALGO SALE MAL

### Opción 1: Ver logs del servidor

```powershell
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree --lines 100"
```

### Opción 2: Restaurar backup

Si el sistema no funciona después del despliegue:

```powershell
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ver backups disponibles
ls -la /home/ubuntu/consentimientos_aws | grep backend-backup

# Restaurar el backup más reciente (reemplazar YYYYMMDD-HHMMSS)
cd /home/ubuntu/consentimientos_aws
rm -rf backend/dist
cp -r backend-backup-v41-YYYYMMDD-HHMMSS/dist backend/

# Reiniciar PM2
pm2 restart datagree

# Verificar logs
pm2 logs datagree --lines 50

# Salir
exit
```

---

## 🔍 VERIFICACIÓN ADICIONAL (Opcional)

Si quieres verificar que las tablas de perfiles fueron eliminadas:

```powershell
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Conectar a PostgreSQL
PGPASSWORD='DataGree2026!Secure' psql -h localhost -U datagree_admin -d consentimientos

# Verificar que NO existen tablas de perfiles
\dt profiles
\dt system_modules
\dt module_actions
\dt permission_audit

# Debe mostrar: "Did not find any relation named..."

# Salir de PostgreSQL
\q

# Salir del servidor
exit
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

Después del despliegue, verifica:

- [ ] Backend corriendo en PM2 (status: online)
- [ ] Versión en package.json: 41.1.0
- [ ] Login funciona correctamente
- [ ] NO aparece menú "Perfiles"
- [ ] Puedes crear historias clínicas
- [ ] Puedes crear admisiones
- [ ] Puedes abrir HC existentes
- [ ] Super Admin puede ver datos de todos los tenants
- [ ] Usuarios de tenant solo ven datos de su tenant

---

## 💡 PREGUNTAS FRECUENTES

### ¿Perderé datos al ejecutar el script?
NO. El script:
- ✅ Crea backup del código antes de hacer cambios
- ✅ Solo elimina tablas de perfiles (que no contienen datos importantes)
- ✅ NO toca las tablas de HC, admisiones, clientes, usuarios, etc.

### ¿Qué pasa si el script falla?
- El script se detiene inmediatamente
- El backup ya fue creado
- Puedes restaurar el backup manualmente
- El sistema sigue funcionando con la versión anterior

### ¿Cuánto tiempo toma el despliegue?
- Aproximadamente 2-3 minutos
- La mayor parte del tiempo es subir archivos

### ¿Necesito detener el servidor?
NO. El script:
- Sube los archivos mientras el servidor está corriendo
- Solo reinicia PM2 al final (downtime de ~3 segundos)

### ¿Puedo revertir el despliegue?
SÍ. Puedes restaurar el backup en cualquier momento siguiendo las instrucciones de "SI ALGO SALE MAL".

---

## 📞 SOPORTE

Si tienes problemas durante el despliegue:

1. **NO entres en pánico** - El backup está creado
2. **Copia los mensajes de error** completos
3. **Verifica los logs** de PM2
4. **Reporta el problema** con toda la información

---

## ✅ RESUMEN

1. Abrir PowerShell
2. Ir a la carpeta `deploy`
3. Ejecutar `.\deploy-v41-production-clean.ps1`
4. Confirmar cuando pregunte (escribir `S`)
5. Esperar a que termine
6. Probar el sistema en https://admin.archivoenlinea.com

**¡Eso es todo!** El script hace todo el trabajo por ti.

---

**Última actualización:** 2026-03-14  
**Versión:** 1.0  
**Estado:** ✅ LISTO PARA EJECUTAR

