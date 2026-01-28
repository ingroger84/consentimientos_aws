# Actualización Landing Page y Planes Comerciales

**Fecha:** 2026-01-27  
**Versión:** 15.0.14

## 📋 Resumen Ejecutivo

Este documento presenta recomendaciones estratégicas para actualizar la landing page y los planes comerciales, integrando las nuevas funcionalidades implementadas en el sistema, especialmente el módulo de **Historias Clínicas Electrónicas (HCE)**.

## 🎯 Objetivo

Posicionar el sistema como una **plataforma integral de gestión clínica** que va más allá de los consentimientos, ofreciendo:
1. Gestión de Consentimientos Informados
2. Historias Clínicas Electrónicas (HCE)
3. Gestión de Pacientes/Clientes
4. Gestión Multi-Sede y Multi-Usuario

---

## 📊 ANÁLISIS DE FUNCIONALIDADES ACTUALES

### Módulos Implementados (v15.0.14)

#### 1. **Historias Clínicas Electrónicas** ⭐ NUEVO
- Creación y gestión de HC completas
- Anamnesis (antecedentes, motivo consulta)
- Exámenes físicos (signos vitales, antropometría)
- Diagnósticos (CIE-10)
- Evoluciones (formato SOAP)
- Generación de consentimientos desde HC
- Plantillas de consentimiento específicas para HC
- Logos separados para CN y HC
- Firma digital integrada
- PDFs profesionales con marca de agua
- Vista tabla/tarjetas
- Búsqueda avanzada de pacientes

#### 2. **Consentimientos Informados**
- Plantillas personalizables (CN y HC separadas)
- Firma digital
- Generación de PDF profesional
- Envío automático por email
- Almacenamiento seguro en S3
- Trazabilidad completa
- Múltiples plantillas por consentimiento

#### 3. **Gestión de Clientes/Pacientes**
- Registro completo de datos
- Búsqueda avanzada
- Historial de consentimientos
- Historial de historias clínicas

#### 4. **Gestión Multi-Sede**
- Múltiples sedes por cuenta
- Asignación de usuarios por sede
- Filtrado de HC y CN por sede
- Estadísticas por sede

#### 5. **Sistema de Roles y Permisos**
- Super Admin (gestión global)
- Administrador General (gestión completa)
- Operador (gestión operativa)
- Permisos granulares por funcionalidad

#### 6. **Personalización Avanzada**
- Logos personalizados (CN y HC)
- Colores corporativos
- Marca de agua en PDFs
- Favicon personalizado

#### 7. **Facturación y Planes**
- Sistema de planes con límites
- Facturación automática
- Integración con Bold/Wompi
- Gestión de impuestos
- Trial de 30 días

---

## 🚀 RECOMENDACIONES PARA LA LANDING PAGE

### 1. **Actualizar Propuesta de Valor Principal**

**ANTES:**
> "Gestiona Consentimientos Digitalmente"

**DESPUÉS:**
> "Plataforma Integral de Gestión Clínica Digital"
> "Historias Clínicas + Consentimientos + Gestión de Pacientes"

### 2. **Nueva Sección Hero**

Destacar los 3 pilares principales:
- 📋 **Historias Clínicas Electrónicas**
- ✍️ **Consentimientos Informados**
- 👥 **Gestión de Pacientes**

### 3. **Actualizar Features Section**

Agregar nuevas características:
- ⭐ **Historias Clínicas Completas** (NUEVO)
- ⭐ **Anamnesis y Exámenes Físicos** (NUEVO)
- ⭐ **Diagnósticos CIE-10** (NUEVO)
- ⭐ **Evoluciones SOAP** (NUEVO)
- ⭐ **Plantillas Separadas HC/CN** (NUEVO)
- ⭐ **Vista Tabla/Tarjetas** (NUEVO)
- ⭐ **Navegación Optimizada** (NUEVO)

### 4. **Nueva Sección: Casos de Uso Ampliados**

Actualizar casos de uso para reflejar HC:

**Clínicas y Consultorios Médicos:**
- ✅ Historias clínicas electrónicas completas
- ✅ Consentimientos informados quirúrgicos
- ✅ Gestión de pacientes y citas
- ✅ Diagnósticos y evoluciones

**Centros de Estética:**
- ✅ Historias clínicas estéticas
- ✅ Consentimientos de procedimientos
- ✅ Seguimiento de tratamientos
- ✅ Fotografías de evolución

### 5. **Sección de Comparación**

Agregar tabla comparativa:
| Característica | Papel | Otros Sistemas | Archivo en Línea |
|---|---|---|---|
| Historias Clínicas | ❌ | ⚠️ Limitado | ✅ Completas |
| Consentimientos | ❌ | ✅ | ✅ |
| Firma Digital | ❌ | ✅ | ✅ |
| Multi-Sede | ❌ | ⚠️ | ✅ |
| Personalización | ❌ | ⚠️ | ✅ Total |
| Precio | - | 💰💰💰 | 💰💰 |

---

## 💰 RECOMENDACIONES PARA PLANES COMERCIALES

### Estrategia de Precios por Funcionalidad

#### Opción A: Mantener Planes Actuales + Agregar Límites HC

**Ventajas:**
- No requiere cambios drásticos
- Clientes actuales no se ven afectados
- Fácil de implementar

**Propuesta:**


```typescript
// Agregar a limits en cada plan:
limits: {
  users: number;
  branches: number;
  consents: number;
  medicalRecords: number;  // ⭐ NUEVO
  services: number;
  questions: number;
  storageMb: number;
}
```

**Plan Gratuito (Trial 7 días):**
- Consentimientos: 50
- Historias Clínicas: 10 ⭐ NUEVO
- Usuarios: 1
- Sedes: 1

**Plan Básico ($89,900/mes):**
- Consentimientos: 50
- Historias Clínicas: 50 ⭐ NUEVO
- Usuarios: 1
- Sedes: 1

**Plan Emprendedor ($119,900/mes):**
- Consentimientos: 80
- Historias Clínicas: 100 ⭐ NUEVO
- Usuarios: 3
- Sedes: 2

**Plan Plus ($149,900/mes):**
- Consentimientos: 100
- Historias Clínicas: 200 ⭐ NUEVO
- Usuarios: 5
- Sedes: 4

**Plan Empresarial ($189,900/mes):**
- Consentimientos: 500
- Historias Clínicas: 1000 ⭐ NUEVO
- Usuarios: 11
- Sedes: 10

---

#### Opción B: Crear Planes Diferenciados por Módulo

**Ventajas:**
- Mayor flexibilidad comercial
- Permite vender módulos por separado
- Mejor segmentación de mercado

**Propuesta:**

**1. Plan "Consentimientos" (Actual)**
- Solo módulo de consentimientos
- Precios actuales
- Para negocios que solo necesitan CN

**2. Plan "Clínica Básica" (NUEVO)**
- Consentimientos + Historias Clínicas
- Precio: $139,900/mes
- Para clínicas pequeñas

**3. Plan "Clínica Profesional" (NUEVO)**
- Todo lo anterior + Reportes avanzados
- Precio: $179,900/mes
- Para clínicas medianas

**4. Plan "Clínica Empresarial" (NUEVO)**
- Todo lo anterior + White label + API
- Precio: $249,900/mes
- Para grandes organizaciones

---

#### Opción C: Modelo Freemium Mejorado (RECOMENDADO) ⭐

**Ventajas:**
- Atrae más usuarios con plan gratuito robusto
- Conversión natural a planes pagos
- Competitivo en el mercado

**Propuesta:**

**Plan GRATUITO (Permanente):**
- ✅ Consentimientos: 20/mes
- ✅ Historias Clínicas: 10/mes
- ✅ 1 Usuario
- ✅ 1 Sede
- ✅ Almacenamiento: 100MB
- ✅ Soporte: Email (48h)
- ❌ Sin personalización de marca
- ❌ Sin reportes avanzados

**Plan STARTER ($79,900/mes):**
- ✅ Consentimientos: 100/mes
- ✅ Historias Clínicas: 50/mes
- ✅ 2 Usuarios
- ✅ 1 Sede
- ✅ Almacenamiento: 500MB
- ✅ Personalización básica
- ✅ Soporte: Email (24h)

**Plan PROFESIONAL ($129,900/mes):** ⭐ MÁS POPULAR
- ✅ Consentimientos: 300/mes
- ✅ Historias Clínicas: 200/mes
- ✅ 5 Usuarios
- ✅ 3 Sedes
- ✅ Almacenamiento: 2GB
- ✅ Personalización completa
- ✅ Reportes avanzados
- ✅ Soporte: Chat (12h)

**Plan EMPRESARIAL ($199,900/mes):**
- ✅ Consentimientos: Ilimitados
- ✅ Historias Clínicas: Ilimitadas
- ✅ Usuarios: Ilimitados
- ✅ Sedes: Ilimitadas
- ✅ Almacenamiento: 10GB
- ✅ White Label
- ✅ API Access
- ✅ Soporte: Prioritario 24/7
- ✅ Capacitación incluida

---

## 🎨 ACTUALIZACIONES VISUALES RECOMENDADAS

### 1. **Nuevo Hero Section**

```jsx
<section className="hero">
  <h1>
    La Plataforma Integral para
    <span className="gradient">Gestión Clínica Digital</span>
  </h1>
  <p>
    Historias Clínicas Electrónicas + Consentimientos Informados + 
    Gestión de Pacientes. Todo en una sola plataforma.
  </p>
  
  <div className="features-pills">
    <span>📋 Historias Clínicas</span>
    <span>✍️ Consentimientos</span>
    <span>👥 Gestión de Pacientes</span>
    <span>🏥 Multi-Sede</span>
  </div>
</section>
```

### 2. **Nueva Sección de Módulos**

Crear sección destacando los 3 módulos principales:

**Módulo 1: Historias Clínicas Electrónicas**
- Anamnesis completa
- Exámenes físicos
- Diagnósticos CIE-10
- Evoluciones SOAP
- Firma digital

**Módulo 2: Consentimientos Informados**
- Plantillas personalizables
- Firma digital
- PDFs profesionales
- Envío automático

**Módulo 3: Gestión de Pacientes**
- Base de datos centralizada
- Búsqueda avanzada
- Historial completo
- Multi-sede

### 3. **Sección de Screenshots**

Agregar capturas de pantalla reales:
- Dashboard con estadísticas
- Vista de historias clínicas (tabla)
- Formulario de anamnesis
- PDF generado con logos
- Vista de consentimientos

### 4. **Testimonios Actualizados**

Actualizar testimonios para reflejar HC:

> "Antes usábamos papel para todo. Ahora con Archivo en Línea tenemos las historias clínicas y consentimientos digitalizados. Ahorramos 15 horas semanales."
> - Dr. Carlos Méndez, Clínica Salud Total

---

## 📈 ESTRATEGIA DE MARKETING

### 1. **Mensajes Clave**

**Mensaje Principal:**
> "La única plataforma que necesitas para gestionar tu clínica"

**Mensajes Secundarios:**
- "Historias clínicas y consentimientos en un solo lugar"
- "Cumple con normativas de salud digital"
- "Ahorra hasta 20 horas semanales en administración"
- "Desde $79,900/mes - Prueba gratis 14 días"

### 2. **Segmentación de Mercado**

**Mercado Primario:**
- Clínicas médicas pequeñas y medianas
- Consultorios médicos
- Centros de especialidades

**Mercado Secundario:**
- Centros de estética y belleza
- Clínicas dentales
- Centros de fisioterapia
- Spas médicos

**Mercado Terciario:**
- Gimnasios con servicios médicos
- Centros de bienestar
- Cualquier negocio que requiera HC

### 3. **Propuesta de Valor por Segmento**

**Para Clínicas Médicas:**
- ✅ Cumplimiento normativo (Resolución 1995 de 1999)
- ✅ Historia clínica electrónica completa
- ✅ Firma digital con validez legal
- ✅ Almacenamiento seguro 10 años

**Para Centros Estéticos:**
- ✅ Historias clínicas estéticas
- ✅ Consentimientos de procedimientos
- ✅ Fotografías de evolución
- ✅ Seguimiento de tratamientos

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Cambios en Backend

**1. Actualizar `plans.config.ts`:**

```typescript
limits: {
  users: number;
  branches: number;
  consents: number;
  medicalRecords: number;  // ⭐ AGREGAR
  services: number;
  questions: number;
  storageMb: number;
}
```

**2. Agregar validación de límites HC:**

```typescript
// En medical-records.service.ts
async checkMedicalRecordsLimit(tenantId: string) {
  const tenant = await this.tenantsService.findOne(tenantId);
  const plan = getPlanConfig(tenant.planId);
  const count = await this.medicalRecordsRepository.count({
    where: { tenantId }
  });
  
  if (count >= plan.limits.medicalRecords) {
    throw new BadRequestException(
      `Has alcanzado el límite de ${plan.limits.medicalRecords} historias clínicas de tu plan`
    );
  }
}
```

### Cambios en Frontend

**1. Actualizar `PublicLandingPage.tsx`:**
- Agregar sección de módulos
- Actualizar features con HC
- Agregar screenshots
- Actualizar testimonios

**2. Actualizar `PricingSection.tsx`:**
- Mostrar límite de HC en cada plan
- Agregar badge "NUEVO" en características HC
- Destacar plan más popular

**3. Crear componente `ModulesSection.tsx`:**
- Mostrar los 3 módulos principales
- Con iconos y descripciones
- Links a demos o videos

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs a Monitorear

**Conversión:**
- Tasa de registro (landing → signup)
- Tasa de activación (signup → primer uso)
- Tasa de conversión (trial → pago)

**Engagement:**
- HC creadas por usuario
- Consentimientos generados por usuario
- Tiempo promedio en plataforma
- Funcionalidades más usadas

**Retención:**
- Churn rate mensual
- Lifetime value (LTV)
- Net Promoter Score (NPS)

**Financieros:**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- CAC (Customer Acquisition Cost)
- LTV/CAC ratio

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Actualización Inmediata (Semana 1)

1. ✅ Actualizar `plans.config.ts` con límites de HC
2. ✅ Implementar validación de límites en backend
3. ✅ Actualizar features en landing page
4. ✅ Agregar sección de módulos
5. ✅ Actualizar pricing section

### Fase 2: Mejoras de Contenido (Semana 2)

1. ✅ Tomar screenshots de calidad
2. ✅ Actualizar testimonios
3. ✅ Crear videos demostrativos
4. ✅ Escribir casos de uso detallados
5. ✅ Optimizar SEO

### Fase 3: Marketing y Lanzamiento (Semana 3-4)

1. ✅ Campaña de email a usuarios actuales
2. ✅ Anuncio en redes sociales
3. ✅ Blog post sobre nuevas funcionalidades
4. ✅ Webinar demostrativo
5. ✅ Promoción de lanzamiento

---

## 💡 RECOMENDACIONES ADICIONALES

### 1. **Crear Plan "Clínica Completa"**

Un plan específico para clínicas que incluya:
- Historias clínicas ilimitadas
- Consentimientos ilimitados
- Módulo de citas (futuro)
- Módulo de facturación (futuro)
- Precio: $249,900/mes

### 2. **Ofrecer Add-ons**

Módulos adicionales que se pueden agregar a cualquier plan:
- 📅 **Módulo de Citas:** +$29,900/mes
- 💰 **Módulo de Facturación:** +$39,900/mes
- 📊 **Reportes Avanzados:** +$19,900/mes
- 🔌 **API Access:** +$49,900/mes

### 3. **Programa de Referidos**

- 20% de descuento por cada referido
- Hasta 3 meses gratis por 5 referidos
- Badge de "Partner" en la plataforma

### 4. **Descuentos por Volumen**

- 10% descuento: 3-5 sedes
- 15% descuento: 6-10 sedes
- 20% descuento: +10 sedes

### 5. **Garantía de Satisfacción**

- 30 días de garantía de devolución
- Migración gratuita desde otro sistema
- Capacitación incluida en planes Pro+

---

## 📞 PRÓXIMOS PASOS

1. **Revisar y aprobar** estas recomendaciones
2. **Priorizar** qué opción de planes implementar
3. **Asignar recursos** para implementación
4. **Definir timeline** de lanzamiento
5. **Preparar materiales** de marketing

---

**Documento creado:** 2026-01-27  
**Versión:** 1.0  
**Autor:** Kiro AI Assistant  
**Estado:** Propuesta para revisión
