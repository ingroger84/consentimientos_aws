#!/bin/bash

# Script para actualizar controllers al nuevo sistema de perfiles
# Fecha: 2026-03-02
# Versión: 53.0.0

echo "🚀 Actualizando controllers al sistema de perfiles..."
echo ""

# Lista de controllers a actualizar
CONTROLLERS=(
  "src/plans/plans.controller.ts"
  "src/invoices/invoices.controller.ts"
)

# Contador
UPDATED=0
FAILED=0

for CONTROLLER in "${CONTROLLERS[@]}"; do
  echo "📝 Procesando: $CONTROLLER"
  
  if [ ! -f "$CONTROLLER" ]; then
    echo "   ❌ Archivo no encontrado"
    ((FAILED++))
    continue
  fi
  
  # Crear backup
  cp "$CONTROLLER" "$CONTROLLER.backup"
  echo "   ✅ Backup creado: $CONTROLLER.backup"
  
  # Actualizar imports (eliminar legacy)
  sed -i "s/import { RolesGuard } from '..\/auth\/guards\/roles.guard';/\/\/ Legacy: import { RolesGuard } from '..\/auth\/guards\/roles.guard';/g" "$CONTROLLER"
  sed -i "s/import { Roles } from '..\/auth\/decorators\/roles.decorator';/\/\/ Legacy: import { Roles } from '..\/auth\/decorators\/roles.decorator';/g" "$CONTROLLER"
  sed -i "s/import { RoleType } from '..\/roles\/entities\/role.entity';/\/\/ Legacy: import { RoleType } from '..\/roles\/entities\/role.entity';/g" "$CONTROLLER"
  
  echo "   ✅ Imports legacy comentados"
  
  # Agregar nuevos imports (si no existen)
  if ! grep -q "PermissionsGuard" "$CONTROLLER"; then
    # Encontrar la línea del último import y agregar después
    sed -i "/^import.*from.*;$/a import { PermissionsGuard } from '../profiles/guards/permissions.guard';\nimport { RequirePermission } from '../profiles/decorators/require-permission.decorator';\nimport { RequireSuperAdmin } from '../profiles/decorators/require-super-admin.decorator';\nimport { ProfilesService } from '../profiles/profiles.service';" "$CONTROLLER"
    echo "   ✅ Nuevos imports agregados"
  else
    echo "   ℹ️  Imports ya existen"
  fi
  
  # Reemplazar RolesGuard por PermissionsGuard
  sed -i "s/RolesGuard/PermissionsGuard/g" "$CONTROLLER"
  echo "   ✅ RolesGuard reemplazado por PermissionsGuard"
  
  # Reemplazar @Roles(RoleType.SUPER_ADMIN) por @RequireSuperAdmin()
  sed -i "s/@Roles(RoleType.SUPER_ADMIN)/@RequireSuperAdmin()/g" "$CONTROLLER"
  echo "   ✅ @Roles decorators reemplazados"
  
  ((UPDATED++))
  echo "   ✅ Controller actualizado"
  echo ""
done

echo "============================================"
echo "📊 RESUMEN"
echo "============================================"
echo "✅ Controllers actualizados: $UPDATED"
echo "❌ Errores: $FAILED"
echo "============================================"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   1. Revisar manualmente los cambios"
echo "   2. Agregar ProfilesService al constructor"
echo "   3. Actualizar módulos para importar ProfilesModule"
echo "   4. Compilar y probar: npm run build"
echo ""
echo "💡 Los backups están en: *.backup"
echo ""
