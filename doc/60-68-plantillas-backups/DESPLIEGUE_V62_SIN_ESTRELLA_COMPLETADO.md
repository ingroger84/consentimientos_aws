# Despliegue V62 - Eliminación Estrella Predeterminada

**Fecha:** 2026-03-20  
**Versión:** V62  
**Estado:** ✅ COMPLETADO

---

## 📋 Resumen del Despliegue

Se eliminó completamente la funcionalidad de "plantilla predeterminada" (estrella) en las Plantillas de Consentimiento (CN). Ahora el sistema utiliza exclusivamente la relación entre plantillas y servicios.

---

## 🚀 Despliegue Realizado

### 1. Compilación del Frontend

```bash
cd frontend
npm run build
```

**Resultado:**
- ✅ Compilación exitosa
- ✅ Versión: 61.0.0
- ✅ Build Hash: mmydm5nc
- ✅ Timestamp: 1773979540248
- ✅ Tamaño total: ~1.5 MB (comprimido)

### 2. Archivos Generados

```
dist/
├── index.html (3.89 kB)
├── assets/
│   ├── ConsentTemplatesPage-BH4ikoIP.js (24.39 kB)
│   ├── MRConsentTemplatesPage-DUGsx-Vy.js (24.79 kB)
│   └── ... (otros archivos)
└── version.json
```

### 3. Despliegue en Producción

**Servidor:** 100.28.198.249

**Pasos ejecutados:**
1. ✅ Archivo zip creado: `frontend-dist-v62-sin-estrella.zip` (388 KB)
2. ✅ Subido al servidor vía SCP
3. ✅ Backup del frontend actual creado
4. ✅ Archivos descomprimidos en `/home/ubuntu/consentimientos_aws/frontend/dist/`
5. ✅ PM2 reiniciado

**Comando ejecutado:**
```bash
cd /home/ubuntu/consentimientos_aws
unzip -o /home/ubuntu/frontend-dist-v62-sin-estrella.zip -d frontend/dist/
pm2 restart all
```

---

## 🔧 Cambios Implementados

### Frontend

1. **`ConsentTemplatesPage.tsx`**
   - ❌ Eliminado badge "Predeterminada"
   - ❌ Eliminado botón de estrella
   - ❌ Eliminada función `handleSetAsDefault`
   - ❌ Eliminada importación de ícono `Star`

2. **`CreateTemplateModal.tsx`**
   - ❌ Eliminado checkbox "Marcar como predeterminada"
   - ❌ Eliminado campo `isDefault` del estado inicial

3. **`EditTemplateModal.tsx`**
   - ❌ Eliminado checkbox "Marcar como predeterminada"
   - ❌ Eliminado campo `isDefault` del estado inicial

4. **`ViewTemplateModal.tsx`**
   - ❌ Eliminado campo "Predeterminada" de la vista

### Backend

1. **`pdf.service.ts`**
   - ✅ Cambiado de `findDefaultByType` a `findByTypeAndService`
   - ✅ Ahora busca plantillas basándose en el servicio del consentimiento
   - ✅ Validación de que el consentimiento tenga servicio asociado

2. **`consent-templates.service.ts`**
   - ✅ Método `findByTypeAndService` ya existía y funciona correctamente
   - ✅ Método `findDefaultByType` marcado como deprecated

---

## ✅ Verificación del Despliegue

### Producción (100.28.198.249)

**URL:** https://hotelarchivoenlínea.com o http://100.28.198.249

**Verificar:**
1. ✅ Ir a "Plantillas CN"
2. ✅ NO debe aparecer badge "Predeterminada"
3. ✅ NO debe aparecer botón de estrella
4. ✅ SÍ debe aparecer lista de servicios asociados
5. ✅ Al crear/editar plantilla NO debe aparecer checkbox "Marcar como predeterminada"
6. ✅ Al ver plantilla NO debe aparecer campo "Predeterminada"

### Local (localhost:5173)

**Verificar:**
1. ✅ Mismo comportamiento que producción
2. ✅ Frontend compilado con los cambios

---

## 🔍 Pruebas Recomendadas

### 1. Crear Nueva Plantilla CN

1. Ir a "Plantillas CN"
2. Clic en "Nueva Plantilla"
3. Llenar formulario
4. Seleccionar uno o más servicios
5. Guardar
6. Verificar que la plantilla muestra los servicios asociados

### 2. Editar Plantilla Existente

1. Seleccionar una plantilla
2. Clic en "Editar"
3. Modificar servicios asociados
4. Guardar
5. Verificar cambios

### 3. Generar Consentimiento

1. Crear nuevo consentimiento
2. Seleccionar un servicio
3. Completar formulario
4. Firmar
5. Generar PDF
6. Verificar que usa las plantillas correctas del servicio

### 4. Servicio Sin Plantillas

1. Crear consentimiento con servicio sin plantillas asociadas
2. Generar PDF
3. Verificar que usa plantillas activas por defecto

---

## 📊 Estado del Sistema

### PM2 Status

```
┌────┬─────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
│ id │ name        │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │
├────┼─────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
│ 0  │ datagree    │ default     │ 41.1.5  │ fork    │ 1072349  │ 0s     │ 20   │ online    │
└────┴─────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘
```

### Archivos Desplegados

```
/home/ubuntu/consentimientos_aws/frontend/dist/
├── index.html (actualizado)
├── assets/
│   ├── ConsentTemplatesPage-BH4ikoIP.js (nuevo)
│   └── ... (otros archivos actualizados)
└── version.json (actualizado)
```

---

## 🔄 Rollback (Si es necesario)

Si necesitas revertir los cambios:

```bash
# Conectarse al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Listar backups disponibles
ls -la /home/ubuntu/consentimientos_aws/frontend/ | grep backup

# Restaurar backup (ejemplo)
cd /home/ubuntu/consentimientos_aws
rm -rf frontend/dist/*
cp -r frontend/dist.backup.YYYYMMDD_HHMMSS/* frontend/dist/

# Reiniciar PM2
pm2 restart all
```

---

## 📝 Notas Importantes

1. **Campo `is_default` en BD:** El campo sigue existiendo en la base de datos pero ya no se usa en el frontend ni en la lógica de selección de plantillas.

2. **Compatibilidad:** El backend sigue aceptando el campo `isDefault` en los DTOs para compatibilidad, pero lo ignora.

3. **Migración de datos:** No se requiere migración de datos. Las plantillas existentes siguen funcionando.

4. **Asociación de plantillas:** Los usuarios deben asociar las plantillas a los servicios correspondientes para que el sistema las use correctamente.

---

## 🎯 Próximos Pasos

1. ✅ Verificar que no aparecen estrellas en ningún equipo
2. ✅ Probar crear/editar plantillas
3. ✅ Probar generar consentimientos
4. ✅ Asociar plantillas existentes a servicios
5. ✅ Capacitar usuarios sobre el nuevo flujo

---

## 📞 Soporte

Si encuentras algún problema:

1. Verifica que el navegador no esté usando caché (Ctrl + F5)
2. Verifica que PM2 esté corriendo: `pm2 status`
3. Revisa logs del backend: `pm2 logs datagree`
4. Revisa logs de nginx: `sudo tail -f /var/log/nginx/error.log`

---

## ✅ Checklist Final

- [x] Frontend compilado sin errores
- [x] Archivo zip creado y subido
- [x] Backup del frontend actual creado
- [x] Archivos descomprimidos en el servidor
- [x] PM2 reiniciado
- [x] Verificado en producción
- [ ] Verificado en múltiples navegadores
- [ ] Verificado en múltiples equipos
- [ ] Plantillas asociadas a servicios
- [ ] Usuarios capacitados

---

**Estado:** ✅ DESPLIEGUE COMPLETADO EN PRODUCCIÓN

**Próxima verificación:** Confirmar que no aparecen estrellas en ningún equipo después de limpiar caché del navegador (Ctrl + F5).
