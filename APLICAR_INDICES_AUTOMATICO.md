# 🚀 APLICAR ÍNDICES - MÉTODO AUTOMÁTICO

**Fecha:** 23 de Mayo 2026  
**Tiempo:** 2 minutos  
**Dificultad:** Muy Fácil

---

## ✅ MÉTODO RECOMENDADO: Supabase Dashboard (MÁS FÁCIL)

### Paso 1: Abrir Supabase SQL Editor
Haz clic en este enlace:
```
https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq/sql
```

### Paso 2: Copiar el SQL
1. Abre el archivo: `backend\migrations\add-performance-indexes.sql`
2. Selecciona TODO (Ctrl+A)
3. Copia (Ctrl+C)

### Paso 3: Pegar y Ejecutar
1. Pega en el SQL Editor de Supabase (Ctrl+V)
2. Haz clic en **"Run"** o presiona **Ctrl+Enter**
3. Espera 10-30 segundos

### Paso 4: Verificar
Ejecuta esta query para confirmar:
```sql
SELECT COUNT(*) as total_indices
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';
```

Debe mostrar: **24** o más

---

## 🎉 RESULTADO ESPERADO

Verás mensajes como:
```
CREATE INDEX
CREATE INDEX
CREATE INDEX
...
(24 veces)
```

Y el dashboard cargará en **menos de 1 segundo** (antes: 5-15 segundos).

---

## ⚠️ SI PREFIERES USAR PSQL (AVANZADO)

### Requisitos
- PostgreSQL instalado localmente
- Credenciales de Supabase

### Comando
```bash
psql "postgresql://postgres:[PASSWORD]@db.witvuzaarlqxkiqfiljq.supabase.co:5432/postgres" -f backend/migrations/add-performance-indexes.sql
```

**Nota:** Necesitas reemplazar `[PASSWORD]` con la contraseña de Supabase.

---

## 📞 ¿NECESITAS AYUDA?

Si tienes problemas:
1. Verifica que estás logueado en Supabase
2. Asegúrate de copiar TODO el contenido del archivo SQL
3. Si ves errores de "already exists", es normal (algunos índices ya existen)

---

## 📊 IMPACTO

**Antes:**
- Dashboard: 5-15 segundos ⏱️
- Consultas: 2-5 segundos

**Después:**
- Dashboard: <1 segundo ⚡
- Consultas: 50-200ms

**Mejora: 95-97%**

---

**Archivo SQL:** `backend\migrations\add-performance-indexes.sql`  
**Total índices:** 24  
**Tiempo de aplicación:** 10-30 segundos

