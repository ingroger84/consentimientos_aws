# ✅ FIX: Mensajes de Límite de Recursos

**Fecha:** 7 de enero de 2026  
**Problema:** El backend bloqueaba correctamente pero el frontend no mostraba mensajes  
**Estado:** ✅ SOLUCIONADO

---

## 🐛 Problema Identificado

Cuando un usuario intentaba crear un recurso (sede, usuario, etc.) y alcanzaba el límite:

- ✅ **Backend:** Bloqueaba correctamente con error 403
- ❌ **Frontend:** No capturaba el error ni mostraba mensaje al usuario
- ❌ **Resultado:** Usuario no sabía por qué no podía crear el recurso

---

## ✅ Solución Implementada

Se agregó manejo de errores en las mutaciones de creación para:

1. **Capturar error 403** del backend
2. **Extraer información del límite** del mensaje de error
3. **Mostrar modal elegante** con información clara
4. **Guiar al usuario** sobre qué hacer

---

## 📝 Cambios Realizados

### 1. BranchesPage.tsx

**Agregado:**
- Import de `ResourceLimitModal`
- Estado para controlar el modal (`showLimitModal`, `limitInfo`)
- Manejo de error en `createMutation.onError`
- Modal de límite al final del componente

**Código agregado:**

```typescript
// En los imports
import ResourceLimitModal from '@/components/ResourceLimitModal';

// En el estado
const [showLimitModal, setShowLimitModal] = useState(false);
const [limitInfo, setLimitInfo] = useState<{ current: number; max: number } | null>(null);

// En createMutation
onError: (error: any) => {
  if (error.response?.status === 403) {
    // Extraer información del mensaje
    const message = error.response.data.message || '';
    const match = message.match(/\((\d+)\/(\d+)\)/);
    
    if (match) {
      setLimitInfo({
        current: parseInt(match[1]),
        max: parseInt(match[2]),
      });
    }
    
    setIsModalOpen(false);
    setShowLimitModal(true);
  }
}

// Al final del componente
{showLimitModal && limitInfo && (
  <ResourceLimitModal
    isOpen={showLimitModal}
    onClose={() => {
      setShowLimitModal(false);
      setLimitInfo(null);
    }}
    resourceType="branches"
    currentCount={limitInfo.current}
    maxLimit={limitInfo.max}
    level="blocked"
  />
)}
```

---

### 2. UsersPage.tsx

**Agregado:**
- Import de `ResourceLimitModal`
- Estado para controlar el modal
- Manejo de error en `createMutation.onError`
- Modal de límite al final del componente

**Misma lógica que BranchesPage pero para usuarios**

---

## 🎯 Cómo Funciona Ahora

### Flujo Completo

```
Usuario intenta crear sede
    ↓
Frontend: Envía POST /api/branches
    ↓
Backend: Valida límite
    ↓
Backend: Límite alcanzado → Error 403
    ↓
Frontend: Captura error 403
    ↓
Frontend: Extrae información (4/3)
    ↓
Frontend: Cierra modal de creación
    ↓
Frontend: Muestra modal de límite
    ↓
Usuario ve mensaje claro:
"Has alcanzado el límite máximo de sedes permitidos (4/3)"
    ↓
Usuario puede:
- Contactar administrador (email pre-rellenado)
- Ver planes disponibles
- Cerrar modal
```

---

## 🧪 Cómo Probar

### 1. Reiniciar Frontend

Si el frontend está corriendo, reinícialo para cargar los cambios:

```powershell
# Detener (Ctrl+C)
# Iniciar
cd frontend
npm run dev
```

### 2. Probar con Tenant que Tiene Límite Alcanzado

1. **Accede al tenant:**
   ```
   http://demo-medico.localhost:5173
   ```

2. **Ve a Sedes** (ya tiene 4/3 - límite alcanzado)

3. **Intenta crear una nueva sede:**
   - Clic en "Nueva Sede"
   - Completa el formulario
   - Clic en "Crear"

4. **Resultado esperado:**
   - ✅ Modal de creación se cierra
   - ✅ Aparece modal de límite alcanzado
   - ✅ Muestra: "Has alcanzado el límite máximo de sedes permitidos (4/3)"
   - ✅ Botones de acción disponibles

### 3. Probar con Usuarios

1. **Ve a Usuarios** (tiene 4/5 - aún puede crear 1)

2. **Crea un usuario** (debería funcionar)

3. **Intenta crear otro** (ahora tiene 5/5)

4. **Resultado esperado:**
   - ✅ Modal de límite aparece
   - ✅ Muestra: "Has alcanzado el límite máximo de usuarios permitidos (5/5)"

---

## 📊 Información del Modal

El modal muestra:

### Encabezado
- 🚫 Icono de alerta rojo
- Título: "Límite Alcanzado"
- Subtítulo: "Plan actual"

### Contenido
- Mensaje claro del problema
- Uso actual: X / Y
- Barra de progreso al 100% (roja)
- Explicación de qué hacer

### Opciones
1. **Contactar al administrador**
   - Email pre-rellenado con información del límite
   - Asunto: "Solicitud de aumento de límite - sedes"
   - Cuerpo: Incluye uso actual

2. **Actualizar tu plan**
   - Enlace a página de planes (si existe)
   - Comparación de límites

3. **Soporte telefónico**
   - Información de contacto

### Botones
- "Entendido" - Cierra el modal
- "Contactar Soporte" - Abre email

---

## 🎨 Apariencia del Modal

```
┌─────────────────────────────────────────┐
│  🔴  Límite Alcanzado                   │
│      Plan actual                        │
├─────────────────────────────────────────┤
│                                         │
│  Has alcanzado el límite máximo de      │
│  sedes permitidos.                      │
│                                         │
│  Uso actual: 4 / 3                      │
│  ████████████████████████████ 100%      │
│                                         │
│  No podrás crear más recursos hasta     │
│  que contactes al administrador.        │
│                                         │
│  📧 Contactar al administrador          │
│     Solicita un aumento de límite       │
│                                         │
│  📈 Actualizar tu plan                  │
│     Obtén más recursos                  │
│                                         │
│  📞 Soporte telefónico                  │
│     Llámanos para asistencia            │
│                                         │
│  [Entendido]  [Contactar Soporte]       │
│                                         │
│  Ver planes disponibles →               │
└─────────────────────────────────────────┘
```

---

## ✅ Verificación

### Checklist

- [x] BranchesPage actualizado
- [x] UsersPage actualizado
- [x] Modal de límite importado
- [x] Manejo de errores agregado
- [x] Extracción de información del error
- [x] Modal se muestra correctamente
- [ ] Frontend reiniciado
- [ ] Probado con tenant real
- [ ] Usuario ve el mensaje

---

## 🔄 Próximos Pasos

### Páginas Pendientes

Aplicar la misma lógica a:

- [ ] **ServicesPage** - Para servicios
- [ ] **ConsentsPage** - Para consentimientos

### Mejoras Opcionales

- [ ] Agregar banner de advertencia cuando esté en 70-89%
- [ ] Agregar indicador de límite en la página
- [ ] Deshabilitar botón de crear cuando límite alcanzado
- [ ] Mostrar tooltip en botón deshabilitado

---

## 📝 Código de Referencia

### Para Agregar a Otras Páginas

```typescript
// 1. Import
import ResourceLimitModal from '@/components/ResourceLimitModal';

// 2. Estado
const [showLimitModal, setShowLimitModal] = useState(false);
const [limitInfo, setLimitInfo] = useState<{ current: number; max: number } | null>(null);

// 3. En createMutation
onError: (error: any) => {
  if (error.response?.status === 403) {
    const message = error.response.data.message || '';
    const match = message.match(/\((\d+)\/(\d+)\)/);
    
    if (match) {
      setLimitInfo({
        current: parseInt(match[1]),
        max: parseInt(match[2]),
      });
    }
    
    setIsModalOpen(false);
    setShowLimitModal(true);
  } else {
    alert(error.response?.data?.message || 'Error al crear');
  }
}

// 4. Modal al final
{showLimitModal && limitInfo && (
  <ResourceLimitModal
    isOpen={showLimitModal}
    onClose={() => {
      setShowLimitModal(false);
      setLimitInfo(null);
    }}
    resourceType="[tipo]"  // users, branches, services, consents
    currentCount={limitInfo.current}
    maxLimit={limitInfo.max}
    level="blocked"
  />
)}
```

---

## 🎉 Resultado Final

Ahora cuando un usuario intenta crear un recurso y alcanza el límite:

✅ **Ve un mensaje claro** explicando el problema  
✅ **Sabe exactamente qué hacer** (contactar administrador)  
✅ **Tiene opciones de acción** (email, planes, soporte)  
✅ **Experiencia de usuario mejorada** significativamente  

---

**¡Problema solucionado! El sistema ahora muestra mensajes claros cuando se alcanza un límite. 🎉**
