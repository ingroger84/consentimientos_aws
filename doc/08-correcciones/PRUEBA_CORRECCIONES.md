# Prueba de Correcciones - Sedes y Cámara

## Estado Actual
- ✅ Backend reiniciado con cambios aplicados
- ✅ Frontend corriendo en http://localhost:5173
- ✅ Logs de debug agregados al backend

## Cambios Implementados

### 1. Corrección de Sedes Duplicadas

**Problema**: Usuarios mostraban sedes duplicadas en el frontend aunque la BD estaba correcta.

**Solución Aplicada**:
- Eliminado `eager: true` de las relaciones en `user.entity.ts`
- Todos los métodos de `users.service.ts` usan QueryBuilder
- Eliminación manual de duplicados con `Map` en `findAll()`, `findOne()`, `findByEmail()`
- Método `update()` elimina todas las sedes con DELETE directo antes de agregar nuevas
- Logs de debug agregados en el controlador para verificar datos

**Archivos Modificados**:
- `backend/src/users/entities/user.entity.ts`
- `backend/src/users/users.service.ts`
- `backend/src/users/users.controller.ts`

### 2. Mejora de Captura de Foto

**Problema**: Cámara no permitía tomar foto del cliente.

**Solución Aplicada**:
- Timeout de 10 segundos para iniciar cámara
- Logs detallados en consola del navegador
- Manejo robusto de errores con mensajes específicos
- Verificación de soporte del navegador
- Botón de reintentar en caso de error

**Archivos Modificados**:
- `frontend/src/components/CameraCapture.tsx`

## Pasos para Probar

### Prueba 1: Verificar Sedes Duplicadas

1. **Abrir la consola del backend** para ver los logs de debug

2. **Ir a la página de Usuarios**:
   - URL: http://localhost:5173/users
   - Login: admin@consentimientos.com / admin123

3. **Verificar en la consola del backend**:
   - Buscar el log `=== DEBUG USERS ===`
   - Verificar que cada usuario muestre el número correcto de sedes
   - Verificar que no haya IDs de sedes duplicados

4. **Crear un nuevo usuario con 1 sede**:
   - Click en "Nuevo Usuario"
   - Llenar datos básicos
   - Seleccionar UN SOLO checkbox de sede
   - Verificar el contador: "1 sede(s) seleccionada(s)"
   - Guardar

5. **Verificar el usuario creado**:
   - En la tabla, verificar que muestre solo 1 sede
   - Editar el usuario y verificar que solo 1 checkbox esté marcado
   - Revisar logs del backend

6. **Editar un usuario existente**:
   - Seleccionar un usuario con múltiples sedes
   - Desmarcar todas menos 1 sede
   - Guardar
   - Verificar que ahora muestre solo 1 sede

### Prueba 2: Verificar Captura de Foto

1. **Abrir la consola del navegador** (F12 → Console)

2. **Ir a Crear Consentimiento**:
   - URL: http://localhost:5173/consents/new
   - Login: admin@consentimientos.com / admin123

3. **Llenar datos básicos del cliente**:
   - Servicio: Cualquiera
   - Sede: Cualquiera
   - Nombre, ID, Email

4. **Click en "Tomar Foto del Cliente"**:
   - Verificar logs en consola:
     - "Solicitando acceso a la cámara..."
     - "Acceso a cámara concedido, configurando video..."
     - "Video metadata cargado"
     - "Video reproduciendo"
     - "Cámara lista para usar"

5. **Si aparece error de permisos**:
   - El navegador debe mostrar un mensaje específico
   - Click en "Reintentar"
   - Verificar que el navegador solicite permisos de cámara

6. **Capturar foto**:
   - Verificar que el video se muestre correctamente
   - Click en "Capturar Foto"
   - Verificar que la foto se capture
   - Click en "Confirmar"
   - Verificar que la foto aparezca en el formulario

7. **Continuar con el consentimiento**:
   - Completar preguntas
   - Firmar
   - Descargar PDF
   - Verificar que la foto aparezca al lado de la firma en las 3 secciones

## Verificación en Base de Datos

### Verificar Sedes de Usuario

```sql
-- Ver sedes de un usuario específico
SELECT 
  u.name as usuario,
  u.email,
  b.name as sede,
  b.id as sede_id
FROM users u
LEFT JOIN user_branches ub ON u.id = ub.user_id
LEFT JOIN branches b ON ub.branch_id = b.id
WHERE u.email = 'TU_EMAIL_AQUI'
ORDER BY u.name, b.name;

-- Verificar duplicados en user_branches
SELECT 
  user_id,
  branch_id,
  COUNT(*) as cantidad
FROM user_branches
GROUP BY user_id, branch_id
HAVING COUNT(*) > 1;
```

## Logs Esperados

### Backend (Consola del servidor)

```
=== DEBUG USERS ===
User: Admin General, Branches count: 2
  - Branch: Sede Principal (ID: xxx-xxx-xxx)
  - Branch: Sede Norte (ID: yyy-yyy-yyy)
User: Operador Test, Branches count: 1
  - Branch: Sede Principal (ID: xxx-xxx-xxx)
===================
```

### Frontend (Consola del navegador)

```
Solicitando acceso a la cámara...
Acceso a cámara concedido, configurando video...
Video metadata cargado
Video reproduciendo
Cámara lista para usar
```

## Problemas Comunes y Soluciones

### Problema: Sedes siguen duplicadas

**Verificar**:
1. ¿El backend se reinició correctamente?
2. ¿Los logs de debug aparecen en la consola?
3. ¿La base de datos tiene duplicados reales?

**Solución**:
```bash
# Reiniciar backend
cd backend
npm run start:dev

# Verificar en BD
psql -U postgres -d consentimientos
SELECT * FROM user_branches WHERE user_id = 'ID_DEL_USUARIO';
```

### Problema: Cámara no inicia

**Verificar**:
1. ¿El navegador tiene permisos de cámara?
2. ¿Hay otra aplicación usando la cámara?
3. ¿El navegador soporta getUserMedia?

**Solución**:
- Chrome: chrome://settings/content/camera
- Firefox: about:preferences#privacy
- Cerrar otras aplicaciones que usen la cámara
- Usar HTTPS o localhost (requerido por navegadores)

### Problema: Foto no aparece en PDF

**Verificar**:
1. ¿La foto se capturó correctamente?
2. ¿El backend recibió la foto en base64?
3. ¿Hay errores en la consola del backend?

**Solución**:
- Verificar que `clientPhoto` tenga valor en el formulario
- Revisar logs del backend al generar PDF
- Verificar que la foto sea JPEG o PNG válido

## Próximos Pasos

Si los problemas persisten después de estas pruebas:

1. **Compartir logs completos**:
   - Logs del backend (consola del servidor)
   - Logs del frontend (consola del navegador)
   - Errores específicos

2. **Compartir capturas de pantalla**:
   - Tabla de usuarios mostrando sedes
   - Modal de edición de usuario
   - Error de cámara (si aplica)

3. **Verificar versiones**:
   - Node.js: `node --version`
   - npm: `npm --version`
   - Navegador y versión

## Contacto

Si necesitas ayuda adicional, proporciona:
- Logs completos del backend y frontend
- Capturas de pantalla del problema
- Resultado de las queries SQL
- Versiones de software
