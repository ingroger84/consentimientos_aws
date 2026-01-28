# Corrección: Campo consentType Faltante

## Problema Identificado

Al intentar generar un consentimiento desde una historia clínica, el sistema fallaba porque:

1. **Campo `consentType` no estaba en el formulario**: El modal `GenerateConsentModal.tsx` usaba el campo `consentType` en la lógica condicional pero no lo incluía en el formulario HTML.

2. **DTO requiere el campo**: El `CreateConsentFromMedicalRecordDto` define `consentType` como campo obligatorio con validación `@IsEnum()`.

3. **TypeScript no detectaba el error**: El formulario usaba `any` como tipo, por lo que TypeScript no validaba los campos.

## Solución Implementada

### 1. Agregar Campo al Formulario

```tsx
{/* Tipo de Consentimiento */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Tipo de Consentimiento *
  </label>
  <select
    {...register('consentType', { required: 'El tipo de consentimiento es requerido' })}
    className="input"
  >
    <option value="general">General</option>
    <option value="procedure">Procedimiento</option>
    <option value="data_treatment">Tratamiento de Datos</option>
    <option value="image_rights">Derechos de Imagen</option>
  </select>
</div>
```

### 2. Definir Interfaz TypeScript

```tsx
interface ConsentFormData {
  consentType: 'general' | 'procedure' | 'data_treatment' | 'image_rights';
  procedureName?: string;
  diagnosisCode?: string;
  diagnosisDescription?: string;
  requiredForProcedure?: boolean;
  notes?: string;
}
```

### 3. Tipar el Formulario

```tsx
const {
  register,
  handleSubmit,
  watch,
  formState: { errors },
} = useForm<ConsentFormData>({
  defaultValues: {
    consentType: 'general',
  },
});
```

### 4. Tipar el Handler

```tsx
const onSubmit = async (data: ConsentFormData) => {
  // ...
};
```

## Beneficios

1. **Validación en tiempo de compilación**: TypeScript ahora detecta campos faltantes o incorrectos.

2. **Mejor UX**: El usuario puede seleccionar el tipo de consentimiento explícitamente.

3. **Lógica condicional funcional**: Los campos específicos para "procedimiento" ahora se muestran correctamente.

4. **Cumple con el DTO**: El request ahora incluye todos los campos requeridos por el backend.

## Tipos de Consentimiento Disponibles

| Valor | Etiqueta | Descripción |
|-------|----------|-------------|
| `general` | General | Consentimiento informado general |
| `procedure` | Procedimiento | Consentimiento para procedimientos específicos |
| `data_treatment` | Tratamiento de Datos | Autorización de tratamiento de datos personales |
| `image_rights` | Derechos de Imagen | Autorización de uso de imagen |

## Campos Condicionales

Cuando se selecciona `consentType: 'procedure'`, se muestran campos adicionales:

- **Nombre del Procedimiento** (obligatorio)
- **Código CIE-10** (opcional)
- **Descripción del Diagnóstico** (opcional)
- **Requerido para el procedimiento** (checkbox)

## Pruebas Recomendadas

1. ✅ Generar consentimiento tipo "General"
2. ✅ Generar consentimiento tipo "Procedimiento" con todos los campos
3. ✅ Verificar que los campos condicionales aparecen/desaparecen correctamente
4. ✅ Verificar que la validación funciona (firma obligatoria, plantillas requeridas)
5. ✅ Verificar que el PDF se genera con los datos correctos

## Estado

✅ **CORREGIDO** - El campo `consentType` ahora está incluido en el formulario y el sistema funciona correctamente.

---

**Fecha**: 2026-01-26  
**Archivo**: `frontend/src/components/medical-records/GenerateConsentModal.tsx`
