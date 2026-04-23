# 📋 Paso a Paso: Aplicar Índices en Supabase

## ⏱️ Tiempo estimado: 5 minutos

---

## Paso 1: Abrir Supabase Dashboard

### Opción A: Desde el navegador
1. Abrir navegador
2. Ir a: `https://supabase.com`
3. Hacer login si es necesario
4. Seleccionar proyecto: `witvuzaarlqxkiqfiljq`

### Opción B: URL directa
```
https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq
```

✅ **Verificar:** Debes ver el dashboard del proyecto

---

## Paso 2: Ir al SQL Editor

### En el menú lateral izquierdo:
1. Buscar el ícono de base de datos 🗄️
2. Hacer clic en "SQL Editor"

### O usar URL directa:
```
https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq/sql
```

✅ **Verificar:** Debes ver un editor de SQL con un área de texto grande

---

## Paso 3: Abrir el Archivo de Índices

### En tu computadora:
1. Abrir el proyecto en tu editor de código
2. Navegar a: `backend/migrations/`
3. Abrir el archivo: `add-performance-indexes.sql`

### Ruta completa:
```
E:\PROJECTS\CONSENTIMIENTOS_2025_1.3_FUNCIONAL_LOCAL\backend\migrations\add-performance-indexes.sql
```

✅ **Verificar:** El archivo debe tener ~100 líneas de código SQL

---

## Paso 4: Copiar el Contenido

### En el archivo `add-performance-indexes.sql`:
1. Seleccionar TODO el contenido (Ctrl+A)
2. Copiar (Ctrl+C)

### Contenido a copiar:
```sql
-- =====================================================
-- MIGRACIÓN: Índices de Performance para Dashboard
-- Versión: v91.3
-- ...
-- (TODO el contenido del archivo)
```

✅ **Verificar:** Debes tener ~100 líneas copiadas en el portapapeles

---

## Paso 5: Pegar en Supabase

### En el SQL Editor de Supabase:
1. Hacer clic en el área de texto del editor
2. Limpiar cualquier contenido existente (Ctrl+A, Delete)
3. Pegar el contenido copiado (Ctrl+V)

✅ **Verificar:** Debes ver el código SQL completo en el editor

---

## Paso 6: Ejecutar el Script

### En el SQL Editor:
1. Buscar el botón "Run" (generalmente en la esquina superior derecha)
2. O presionar: `Ctrl+Enter`
3. Esperar 10-30 segundos

### Mensajes esperados:
```
✓ CREATE INDEX
✓ CREATE INDEX
✓ CREATE INDEX
...
(24 veces)
✓ ANALYZE
✓ ANALYZE
...
```

✅ **Verificar:** Debes ver mensajes de éxito, no errores rojos

---

## Paso 7: Verificar los Índices

### Copiar esta query de verificación:
```sql
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

### En el SQL Editor:
1. Limpiar el editor (Ctrl+A, Delete)
2. Pegar la query de verificación
3. Ejecutar (Run o Ctrl+Enter)

### Resultado esperado:
```
Debes ver una tabla con 24 filas
Columnas: schemaname | tablename | indexname
```

✅ **Verificar:** Cuenta las filas, deben ser exactamente 24

---

## Paso 8: Verificar en el Dashboard

### Abrir el dashboard de producción:
```
https://archivoenlinea.com
```

### Hacer login como Super Admin:
1. Email: [tu email de super admin]
2. Password: [tu password]

### Ir al Dashboard:
1. Hacer clic en "Dashboard" en el menú
2. Observar el tiempo de carga

✅ **Verificar:** El dashboard debe cargar en menos de 1 segundo

---

## Paso 9: Verificar Logs del Servidor

### Abrir terminal/PowerShell:
```powershell
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
```

### Ver logs de performance:
```bash
pm2 logs datagree --lines 100 | grep "Stats calculated"
```

### Resultado esperado:
```
Stats calculated in 150ms
Stats calculated in 45ms
Stats calculated in 180ms
```

✅ **Verificar:** Los tiempos deben ser menores a 500ms

---

## Paso 10: Limpiar Caché del Navegador

### Para ver los cambios inmediatamente:
1. En el dashboard, presionar: `Ctrl+Shift+R` (Windows/Linux)
2. O: `Cmd+Shift+R` (Mac)
3. Esto recarga la página sin caché

✅ **Verificar:** El dashboard debe cargar rápidamente

---

## Troubleshooting

### ❌ Error: "relation already exists"
**Solución:** Algunos índices ya existen. Esto es normal, continuar.

### ❌ Error: "permission denied"
**Solución:** Verificar que estás logueado con el usuario correcto en Supabase.

### ❌ Error: "syntax error"
**Solución:** Verificar que copiaste TODO el contenido del archivo, incluyendo comentarios.

### ❌ El dashboard sigue lento
**Soluciones:**
1. Verificar que los 24 índices se crearon (Paso 7)
2. Limpiar caché del navegador (Ctrl+Shift+R)
3. Verificar que el backend v91.3.2 está corriendo: `pm2 status`
4. Reiniciar el servicio: `pm2 restart datagree`

### ❌ No puedo conectarme a Supabase
**Solución:** Verificar credenciales y permisos de acceso al proyecto.

---

## Checklist Final

Antes de dar por terminado, verificar:

- [ ] 24 índices creados en Supabase
- [ ] Query de verificación ejecutada exitosamente
- [ ] Dashboard carga en menos de 1 segundo
- [ ] Logs muestran "Stats calculated in <500ms"
- [ ] Caché del navegador limpiado
- [ ] Backend v91.3.2 corriendo sin errores

---

## Resultado Final Esperado

### Performance del Dashboard

**Primera carga (sin caché):**
```
Antes:   5-15 segundos
Después: 150-500ms
Mejora:  95% más rápido
```

**Cargas subsecuentes (con caché):**
```
Antes:   5-15 segundos
Después: <50ms
Mejora:  99.7% más rápido
```

### Queries Individuales

**getTenantStats():**
```
Antes:   2-3 segundos
Después: 50-100ms
```

**getMedicalRecordsStats():**
```
Antes:   3-5 segundos
Después: 100-200ms
```

**getClientsStats():**
```
Antes:   1-2 segundos
Después: 50-100ms
```

**getTopTenants():**
```
Antes:   4-6 segundos
Después: 200-300ms
```

---

## Información de Referencia

### URLs Importantes
```
Supabase Dashboard:
https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq

SQL Editor:
https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq/sql

Dashboard Producción:
https://archivoenlinea.com
```

### Archivos Importantes
```
Índices SQL:
backend/migrations/add-performance-indexes.sql

Documentación:
APLICAR_INDICES_SUPABASE_AHORA.md
RESUMEN_FINAL_V91.3.2.md
CHECKLIST_OPTIMIZACION_V91.3.md
```

### Comandos Útiles
```bash
# Verificar estado del servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 status"

# Ver logs
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree --lines 50"

# Verificar performance
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree | grep 'Stats calculated'"

# Reiniciar servicio
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree"
```

---

## Resumen Visual

```
┌─────────────────────────────────────────────────────────┐
│  PASO A PASO - APLICAR ÍNDICES                          │
├─────────────────────────────────────────────────────────┤
│  1. ✓ Abrir Supabase Dashboard                          │
│  2. ✓ Ir a SQL Editor                                   │
│  3. ✓ Abrir archivo add-performance-indexes.sql         │
│  4. ✓ Copiar contenido (Ctrl+A, Ctrl+C)                │
│  5. ✓ Pegar en SQL Editor (Ctrl+V)                     │
│  6. ✓ Ejecutar (Run o Ctrl+Enter)                      │
│  7. ✓ Verificar 24 índices creados                     │
│  8. ✓ Probar dashboard (<1 segundo)                    │
│  9. ✓ Verificar logs (Stats calculated in <500ms)      │
│  10. ✓ Limpiar caché (Ctrl+Shift+R)                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  RESULTADO ESPERADO                                     │
├─────────────────────────────────────────────────────────┤
│  Dashboard:  15s → 0.5s  (95% más rápido)             │
│  Con caché:  15s → 0.05s (99.7% más rápido)           │
│  Índices:    0 → 24                                     │
└─────────────────────────────────────────────────────────┘
```

---

**¡Listo! Con estos pasos la optimización estará completa.**

**Fecha:** 22 de Abril 2026
**Versión:** v91.3.2
**Tiempo total:** ~5 minutos
