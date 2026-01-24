# Corrección de Dominio en URLs de Tenants

**Fecha:** 2026-01-22  
**Versión:** 2.4.0  
**Tipo:** MINOR (nueva funcionalidad)  
**Estado:** ✅ Completado

---

## 🐛 Problema Identificado

Los tenants en el panel de Super Admin mostraban URLs con el dominio antiguo:
- ❌ `https://demo-estetica.datagree.net`
- ❌ `https://clinica-demo.datagree.net`

En lugar del nuevo dominio:
- ✅ `https://demo-estetica.archivoenlinea.com`
- ✅ `https://clinica-demo.archivoenlinea.com`

---

## 🔍 Causa Raíz

El componente `TenantCard.tsx` usaba la variable de entorno `VITE_BASE_DOMAIN` para construir las URLs de los tenants, pero esta variable:

1. **No estaba definida** en los archivos `.env` del frontend
2. **No tenía valor por defecto** en el código
3. Las variables de Vite se compilan en tiempo de build, por lo que el frontend compilado tenía el valor antiguo o `undefined`

---

## ✅ Solución Implementada

### 1. Agregar Variable de Entorno

**Archivo:** `frontend/.env`
```env
# Dominio base para construcción de URLs de tenants
VITE_BASE_DOMAIN=archivoenlinea.com
```

**Archivo:** `frontend/.env.production`
```env
# Variables de entorno para producción
VITE_BASE_DOMAIN=archivoenlinea.com
```

### 2. Agregar Fallback en el Código

**Archivo:** `frontend/src/components/TenantCard.tsx`

**Antes:**
```tsx
href={`https://${tenant.slug}.${import.meta.env.VITE_BASE_DOMAIN}`}
```

**Después:**
```tsx
href={`https://${tenant.slug}.${import.meta.env.VITE_BASE_DOMAIN || 'archivoenlinea.com'}`}
```

Esto asegura que incluso si la variable no está definida, se use el dominio correcto.

---

## 📦 Archivos Modificados

1. ✅ `frontend/.env` - Agregada variable VITE_BASE_DOMAIN
2. ✅ `frontend/.env.production` - Creado con variable para producción
3. ✅ `frontend/src/components/TenantCard.tsx` - Agregado fallback

---

## 🚀 Despliegue

### Pasos Ejecutados:

1. ✅ Commit de cambios a GitHub
2. ✅ Pull en servidor de producción
3. ✅ Recompilación del frontend (npm run build)
4. ✅ Reinicio del backend (PM2)
5. ✅ Verificación de funcionamiento

### Versión Desplegada:
- **Frontend:** 2.4.0
- **Backend:** 2.4.0

---

## ✅ Verificación

### URLs Correctas Ahora:

| Tenant | URL Anterior (❌) | URL Nueva (✅) |
|--------|------------------|----------------|
| demo-estetica | demo-estetica.datagree.net | demo-estetica.archivoenlinea.com |
| clinica-demo | clinica-demo.datagree.net | clinica-demo.archivoenlinea.com |

### Verificar en el Panel:

1. Ir a https://admin.archivoenlinea.com
2. Iniciar sesión como Super Admin
3. Ir a la sección "Tenants"
4. Verificar que las URLs muestren `archivoenlinea.com`
5. Hacer clic en el link para verificar que funcione

---

## 🔧 Comandos de Verificación

### Ver variables de entorno compiladas:

```bash
# En el servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/frontend/dist
grep -r "archivoenlinea.com" assets/*.js | head -5
```

### Verificar que los tenants cargan:

```bash
curl -I https://demo-estetica.archivoenlinea.com
curl -I https://clinica-demo.archivoenlinea.com
```

---

## 📝 Notas Importantes

### Variables de Entorno en Vite

Las variables de entorno en Vite:
- Se compilan en tiempo de build
- Solo las que empiezan con `VITE_` son accesibles en el código
- Se reemplazan por su valor literal en el bundle final
- Requieren recompilación para actualizar

### Diferencia con Backend

En el backend (NestJS):
- Las variables se leen en tiempo de ejecución
- Se pueden cambiar sin recompilar
- Solo requieren reiniciar el proceso

---

## 🎯 Mejoras Futuras

### Centralizar Configuración de Dominio

Considerar crear un archivo de configuración centralizado:

```typescript
// frontend/src/config/domain.ts
export const BASE_DOMAIN = import.meta.env.VITE_BASE_DOMAIN || 'archivoenlinea.com';

export const getTenantUrl = (slug: string) => {
  return `https://${slug}.${BASE_DOMAIN}`;
};
```

Esto facilitaría:
- Cambios futuros de dominio
- Mantenimiento del código
- Testing y desarrollo

---

## ✨ Resumen

**Problema:** URLs de tenants mostraban dominio antiguo (datagree.net)

**Solución:** 
- Agregada variable de entorno `VITE_BASE_DOMAIN=archivoenlinea.com`
- Agregado fallback en el código
- Recompilado y desplegado frontend

**Resultado:**
- ✅ URLs de tenants ahora muestran archivoenlinea.com
- ✅ Links funcionan correctamente
- ✅ SSL activo en todos los subdominios
- ✅ Versión 2.4.0 desplegada

---

**Implementado por:** Kiro AI  
**Fecha:** 2026-01-22  
**Versión:** 2.4.0  
**Estado:** ✅ Completado y Verificado
