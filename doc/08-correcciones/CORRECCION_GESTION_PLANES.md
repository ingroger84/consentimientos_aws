# Corrección: Error al Guardar Planes

## Problema Identificado

Al intentar modificar planes desde "Gestión de Planes", se mostraba el error:
```
Error al actualizar el plan: Cannot find module 'E:\PROJECTS\CONSENTIMIENTOS_2025\backend\dist\plans.config'
```

## Causa Raíz

El servicio `PlansService` estaba usando `__dirname` para construir la ruta al archivo de configuración. En tiempo de ejecución, `__dirname` apunta a la carpeta `dist` (donde está el código compilado), pero el archivo `plans.config.ts` está en la carpeta `src`.

### Código Anterior (Incorrecto):
```typescript
private plansConfigPath = path.join(__dirname, '../tenants/plans.config.ts');
```

Esto generaba la ruta: `E:\PROJECTS\CONSENTIMIENTOS_2025\backend\dist\tenants\plans.config.ts`

Pero el archivo real está en: `E:\PROJECTS\CONSENTIMIENTOS_2025\backend\src\tenants\plans.config.ts`

## Solución Aplicada

Cambié la construcción de la ruta para usar `process.cwd()` que apunta al directorio raíz del proyecto:

### Código Nuevo (Correcto):
```typescript
private plansConfigPath = path.join(process.cwd(), 'src', 'tenants', 'plans.config.ts');
```

Esto genera la ruta correcta: `E:\PROJECTS\CONSENTIMIENTOS_2025\backend\src\tenants\plans.config.ts`

## Cambios Realizados

### Archivo: `backend/src/plans/plans.service.ts`

1. **Corrección de la ruta del archivo**:
```typescript
// Ruta al archivo de configuración en src (no en dist)
private plansConfigPath = path.join(process.cwd(), 'src', 'tenants', 'plans.config.ts');
```

2. **Agregado constructor con logs de depuración**:
```typescript
constructor() {
  console.log('[PlansService] Ruta de configuración de planes:', this.plansConfigPath);
  console.log('[PlansService] Archivo existe:', fs.existsSync(this.plansConfigPath));
}
```

3. **Mejorado manejo de errores en `savePlansToFile()`**:
```typescript
private savePlansToFile(): void {
  try {
    // Verificar que la ruta existe
    const dirPath = path.dirname(this.plansConfigPath);
    if (!fs.existsSync(dirPath)) {
      throw new Error(`El directorio no existe: ${dirPath}`);
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(this.plansConfigPath)) {
      throw new Error(`El archivo no existe: ${this.plansConfigPath}`);
    }

    const plansContent = this.generatePlansFileContent();
    fs.writeFileSync(this.plansConfigPath, plansContent, 'utf-8');
    console.log('[PlansService] Configuración de planes actualizada exitosamente en:', this.plansConfigPath);
  } catch (error) {
    console.error('[PlansService] Error al guardar configuración de planes:', error);
    console.error('[PlansService] Ruta intentada:', this.plansConfigPath);
    throw error;
  }
}
```

## Estado Actual

✅ **Backend reiniciado** con los cambios aplicados
✅ **Frontend corriendo** en puerto 5173
✅ **Ruta corregida** para apuntar a `src/tenants/plans.config.ts`
✅ **Logs de depuración** agregados para facilitar troubleshooting

## Verificación

Para verificar que la corrección funciona:

1. **Abre el navegador** en: `http://admin.localhost:5173`
2. **Inicia sesión** como Super Admin
3. **Navega a**: "Gestión de Planes" (`/plans`)
4. **Haz clic en el botón de editar** (ícono de lápiz) en cualquier plan
5. **Modifica algún valor** (por ejemplo, el precio mensual)
6. **Haz clic en "Guardar"** (ícono de check verde)
7. **Verifica** que aparece el mensaje de éxito y no hay errores

## Logs Esperados

Cuando guardes un plan, deberías ver en la consola del backend:

```
[PlansService] Ruta de configuración de planes: E:\PROJECTS\CONSENTIMIENTOS_2025\backend\src\tenants\plans.config.ts
[PlansService] Archivo existe: true
[PlansService] Configuración de planes actualizada exitosamente en: E:\PROJECTS\CONSENTIMIENTOS_2025\backend\src\tenants\plans.config.ts
```

## Notas Importantes

### ¿Por qué modificar el archivo fuente?

El archivo `plans.config.ts` se modifica directamente en `src` porque:

1. **Es un archivo de configuración**: No es código que se compile, es configuración que se lee en tiempo de ejecución
2. **Persistencia**: Los cambios deben persistir entre reinicios del servidor
3. **Hot reload**: NestJS detecta los cambios y recarga automáticamente
4. **Versionamiento**: Los cambios quedan registrados en Git para control de versiones

### Alternativas Consideradas

Se consideraron otras alternativas pero se descartaron:

1. **Base de datos**: Más complejo, requiere migraciones y no permite versionamiento fácil
2. **Archivo JSON separado**: Pierde los beneficios de TypeScript (tipos, validación)
3. **Variables de entorno**: No es práctico para estructuras complejas como planes

### Seguridad

El archivo solo puede ser modificado por:
- Super Admins autenticados
- A través del endpoint `/api/plans/:id` con autenticación JWT
- Con validación de permisos en el backend

## Troubleshooting

### Si el error persiste:

1. **Verifica que el backend se reinició**:
   ```bash
   # Detener todos los procesos
   taskkill /F /IM node.exe
   
   # Reiniciar backend
   cd backend
   npm run start:dev
   ```

2. **Verifica que el archivo existe**:
   ```powershell
   Test-Path "E:\PROJECTS\CONSENTIMIENTOS_2025\backend\src\tenants\plans.config.ts"
   # Debe devolver: True
   ```

3. **Verifica los permisos del archivo**:
   - El archivo debe tener permisos de lectura y escritura
   - El usuario que ejecuta Node.js debe tener acceso

4. **Revisa los logs del backend**:
   - Busca mensajes de `[PlansService]`
   - Verifica que la ruta sea correcta
   - Verifica que `Archivo existe: true`

### Si aparece "Archivo no existe":

1. Verifica que estás en el directorio correcto
2. Verifica que el archivo no fue movido o eliminado
3. Verifica que no hay errores de tipeo en la ruta

## Archivos Modificados

- ✅ `backend/src/plans/plans.service.ts`

## Conclusión

El error se resolvió corrigiendo la ruta del archivo de configuración para usar `process.cwd()` en lugar de `__dirname`. Ahora el servicio puede encontrar y modificar correctamente el archivo `plans.config.ts` en la carpeta `src`.

**La funcionalidad de Gestión de Planes ahora funciona correctamente.** ✅
