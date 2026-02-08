# 🌎 Estrategia de Precios Multi-Mercado (Colombia y USA)

**Fecha:** 2026-02-07  
**Versión:** 1.0  
**Autor:** Análisis Estratégico

## 📊 Análisis de Mercado

### Precios Actuales (Colombia - COP)
- **Básico:** $89,900 COP/mes (~$22 USD)
- **Emprendedor:** $119,900 COP/mes (~$30 USD)
- **Plus:** $149,900 COP/mes (~$37 USD)
- **Empresarial:** $189,900 COP/mes (~$47 USD)

### Precios Competitivos USA (USD)
- **Básico:** $70-90 USD/mes
- **Profesional:** $100-130 USD/mes
- **Empresarial:** $150-200 USD/mes

### 🎯 Diferencia de Poder Adquisitivo
- **Colombia:** Mercado emergente, precios ajustados al poder adquisitivo local
- **USA:** Mercado maduro, mayor poder adquisitivo, precios premium esperados
- **Ratio:** Aproximadamente 3-4x de diferencia en precios

---

## 🏆 RECOMENDACIÓN ESTRATÉGICA

### ✅ Opción Recomendada: **Landing Page Única con Detección Geográfica**

**Ventajas:**
1. ✅ Mejor SEO (un solo dominio, más autoridad)
2. ✅ Mantenimiento simplificado (un solo código base)
3. ✅ Experiencia de usuario fluida
4. ✅ Fácil expansión a otros países
5. ✅ Gestión centralizada de contenido
6. ✅ Análisis unificado de métricas

**Desventajas:**
- ⚠️ Requiere implementar detección geográfica
- ⚠️ Necesita gestión de múltiples monedas

---

## 🛠️ IMPLEMENTACIÓN TÉCNICA RECOMENDADA

### 1. Arquitectura de Precios Multi-Región

```typescript
// backend/src/tenants/pricing-regions.config.ts

export interface RegionPricing {
  region: string;
  currency: string;
  symbol: string;
  taxRate: number; // IVA o Sales Tax
  plans: {
    [planId: string]: {
      priceMonthly: number;
      priceAnnual: number;
    };
  };
}

export const REGION_PRICING: Record<string, RegionPricing> = {
  'CO': {
    region: 'Colombia',
    currency: 'COP',
    symbol: '$',
    taxRate: 0.19, // IVA 19%
    plans: {
      free: { priceMonthly: 0, priceAnnual: 0 },
      basic: { priceMonthly: 89900, priceAnnual: 895404 },
      professional: { priceMonthly: 119900, priceAnnual: 1194202 },
      enterprise: { priceMonthly: 149900, priceAnnual: 1493004 },
      custom: { priceMonthly: 189900, priceAnnual: 1891404 }
    }
  },
  'US': {
    region: 'United States',
    currency: 'USD',
    symbol: '$',
    taxRate: 0.08, // Sales Tax promedio (varía por estado)
    plans: {
      free: { priceMonthly: 0, priceAnnual: 0 },
      basic: { priceMonthly: 79, priceAnnual: 790 },
      professional: { priceMonthly: 119, priceAnnual: 1190 },
      enterprise: { priceMonthly: 169, priceAnnual: 1690 },
      custom: { priceMonthly: 249, priceAnnual: 2490 }
    }
  },
  'DEFAULT': {
    region: 'International',
    currency: 'USD',
    symbol: '$',
    taxRate: 0,
    plans: {
      free: { priceMonthly: 0, priceAnnual: 0 },
      basic: { priceMonthly: 79, priceAnnual: 790 },
      professional: { priceMonthly: 119, priceAnnual: 1190 },
      enterprise: { priceMonthly: 169, priceAnnual: 1690 },
      custom: { priceMonthly: 249, priceAnnual: 2490 }
    }
  }
};
```

### 2. Detección Geográfica

```typescript
// backend/src/common/services/geo-detection.service.ts

import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class GeoDetectionService {
  /**
   * Detecta el país del usuario basado en:
   * 1. Header X-Country (si viene del frontend)
   * 2. IP del usuario (usando servicio de geolocalización)
   * 3. Accept-Language header
   */
  async detectCountry(req: Request): Promise<string> {
    // 1. Verificar header explícito
    const countryHeader = req.headers['x-country'] as string;
    if (countryHeader) {
      return countryHeader.toUpperCase();
    }

    // 2. Detectar por IP (usar servicio como MaxMind, ipapi.co, etc.)
    const ip = this.getClientIp(req);
    const country = await this.getCountryFromIp(ip);
    if (country) {
      return country;
    }

    // 3. Fallback a Accept-Language
    const language = req.headers['accept-language'];
    if (language?.includes('es-CO')) return 'CO';
    if (language?.includes('en-US')) return 'US';

    // 4. Default
    return 'DEFAULT';
  }

  private getClientIp(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      ''
    ).split(',')[0].trim();
  }

  private async getCountryFromIp(ip: string): Promise<string | null> {
    try {
      // Opción 1: Usar servicio gratuito ipapi.co
      const response = await fetch(`https://ipapi.co/${ip}/country/`);
      const country = await response.text();
      return country.trim().toUpperCase();
    } catch (error) {
      console.error('Error detecting country from IP:', error);
      return null;
    }
  }
}
```

### 3. Endpoint de Precios Dinámicos

```typescript
// backend/src/plans/plans.controller.ts

@Controller('plans')
export class PlansController {
  constructor(
    private plansService: PlansService,
    private geoDetectionService: GeoDetectionService,
  ) {}

  @Get()
  async findAll(@Req() req: Request) {
    // Detectar país del usuario
    const country = await this.geoDetectionService.detectCountry(req);
    
    // Obtener precios para ese país
    const plans = this.plansService.findAllForRegion(country);
    
    return {
      region: REGION_PRICING[country]?.region || 'International',
      currency: REGION_PRICING[country]?.currency || 'USD',
      symbol: REGION_PRICING[country]?.symbol || '$',
      plans,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const country = await this.geoDetectionService.detectCountry(req);
    const plan = this.plansService.findOneForRegion(id, country);
    
    return {
      region: REGION_PRICING[country]?.region || 'International',
      currency: REGION_PRICING[country]?.currency || 'USD',
      symbol: REGION_PRICING[country]?.symbol || '$',
      plan,
    };
  }
}
```

### 4. Frontend - Componente de Precios Dinámico

```typescript
// frontend/src/components/landing/PricingSection.tsx

interface PricingData {
  region: string;
  currency: string;
  symbol: string;
  plans: PlanConfig[];
}

export default function PricingSection() {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar precios según la región del usuario
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        setPricingData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading pricing:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Cargando precios...</div>;
  }

  return (
    <div>
      <div className="text-center mb-8">
        <p className="text-sm text-gray-600">
          Precios en {pricingData?.currency} para {pricingData?.region}
        </p>
      </div>
      
      {/* Renderizar planes con precios dinámicos */}
      {pricingData?.plans.map(plan => (
        <PlanCard 
          key={plan.id}
          plan={plan}
          currency={pricingData.currency}
          symbol={pricingData.symbol}
        />
      ))}
    </div>
  );
}
```

---

## 💰 PROPUESTA DE PRECIOS USA

### Precios Sugeridos (USD)

| Plan | Colombia (COP) | USA (USD) | Ratio |
|------|----------------|-----------|-------|
| **Gratuito** | $0 | $0 | - |
| **Básico** | $89,900 (~$22) | $79 | 3.6x |
| **Emprendedor** | $119,900 (~$30) | $119 | 4.0x |
| **Plus** | $149,900 (~$37) | $169 | 4.6x |
| **Empresarial** | $189,900 (~$47) | $249 | 5.3x |

### Justificación de Precios USA

1. **$79 USD (Básico):**
   - Competitivo para pequeñas clínicas
   - Dentro del rango de mercado ($70-90)
   - Atractivo para startups médicas

2. **$119 USD (Emprendedor):**
   - Precio medio del mercado
   - Ideal para clínicas medianas
   - Incluye HC completas

3. **$169 USD (Plus):**
   - Premium pero competitivo
   - Para clínicas grandes
   - Justificado por features avanzadas

4. **$249 USD (Empresarial):**
   - Enterprise pricing
   - Ilimitado + API + White Label
   - Competitivo vs. $150-200 del mercado

---

## 🔄 GESTIÓN DE PLANES ACTUALES

### ¿Qué pasa con los tenants existentes?

**✅ NO SE AFECTAN** - Los tenants actuales mantienen:
- Sus precios actuales en COP
- Sus límites de recursos
- Su ciclo de facturación
- Su plan asignado

### Estrategia de Migración

```typescript
// backend/src/tenants/entities/tenant.entity.ts

@Entity('tenants')
export class Tenant {
  // ... campos existentes ...

  @Column({ type: 'varchar', length: 2, default: 'CO', name: 'region' })
  region: string; // 'CO', 'US', 'DEFAULT'

  @Column({ type: 'varchar', length: 3, default: 'COP', name: 'currency' })
  currency: string; // 'COP', 'USD'

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'plan_price_original' })
  planPriceOriginal: number; // Precio original al momento de suscripción

  @Column({ type: 'boolean', default: false, name: 'price_locked' })
  priceLocked: boolean; // Si true, no se actualiza con cambios de plan
}
```

### Reglas de Facturación

1. **Tenants Existentes (Colombia):**
   - Mantienen precios en COP
   - Facturación con Bold (Colombia)
   - No se afectan por cambios de precios

2. **Nuevos Tenants USA:**
   - Precios en USD
   - Facturación con Stripe (USA)
   - Precios según región USA

3. **Cambio de Plan:**
   - Se aplica el precio actual del plan en su región
   - Se respeta la moneda del tenant
   - Se puede bloquear precio con `priceLocked`

---

## 🌐 ALTERNATIVA: Dos Landing Pages Separadas

### Opción B: Landing Pages Independientes

**Estructura:**
- `archivoenlinea.com` → Colombia (COP)
- `archivoenlinea.com/us` → USA (USD)
- O: `archivoenlinea.co` (Colombia) + `archiveonline.com` (USA)

**Ventajas:**
- ✅ Contenido 100% localizado
- ✅ SEO específico por país
- ✅ Mensajes de marketing adaptados
- ✅ Sin complejidad de detección geográfica

**Desventajas:**
- ❌ Doble mantenimiento
- ❌ Contenido duplicado (penalización SEO)
- ❌ Más complejo de escalar a otros países
- ❌ Dos códigos base a mantener

### Implementación Landing Separada

```typescript
// frontend/src/pages/PublicLandingPageUS.tsx
// Copia de PublicLandingPage.tsx con:
// - Precios en USD
// - Contenido en inglés
// - Testimonios de clientes USA
// - Casos de uso adaptados al mercado USA

// frontend/src/App.tsx
<Route path="/" element={<PublicLandingPage />} /> {/* Colombia */}
<Route path="/us" element={<PublicLandingPageUS />} /> {/* USA */}
```

---

## 📊 COMPARACIÓN DE OPCIONES

| Criterio | Landing Única + Geo | Dos Landing Pages |
|----------|---------------------|-------------------|
| **Mantenimiento** | ⭐⭐⭐⭐⭐ Fácil | ⭐⭐⭐ Medio |
| **SEO** | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐ Bueno |
| **Localización** | ⭐⭐⭐⭐ Buena | ⭐⭐⭐⭐⭐ Excelente |
| **Escalabilidad** | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐ Limitada |
| **Complejidad** | ⭐⭐⭐ Media | ⭐⭐⭐⭐ Baja |
| **Costo desarrollo** | ⭐⭐⭐⭐ Bajo | ⭐⭐ Alto |
| **UX** | ⭐⭐⭐⭐⭐ Fluida | ⭐⭐⭐⭐ Buena |

---

## 🎯 RECOMENDACIÓN FINAL

### ✅ Implementar: **Landing Única con Detección Geográfica**

**Razones:**
1. **Escalabilidad:** Fácil agregar más países (México, España, etc.)
2. **Mantenimiento:** Un solo código base
3. **SEO:** Mejor posicionamiento global
4. **UX:** Experiencia fluida sin redirecciones
5. **Costo:** Menor inversión de desarrollo

### 📋 Plan de Implementación

**Fase 1: Backend (1-2 semanas)**
- ✅ Crear `pricing-regions.config.ts`
- ✅ Implementar `GeoDetectionService`
- ✅ Actualizar `PlansController` con detección de región
- ✅ Agregar campos `region` y `currency` a `Tenant`
- ✅ Migración de datos para tenants existentes

**Fase 2: Frontend (1 semana)**
- ✅ Actualizar `PricingSection` para cargar precios dinámicos
- ✅ Mostrar moneda y región detectada
- ✅ Agregar selector manual de región (opcional)
- ✅ Actualizar formulario de registro con región

**Fase 3: Facturación (2-3 semanas)**
- ✅ Integrar Stripe para pagos en USD
- ✅ Mantener Bold para pagos en COP
- ✅ Lógica de selección de gateway según región
- ✅ Webhooks para ambos gateways

**Fase 4: Testing y Lanzamiento (1 semana)**
- ✅ Testing con VPN desde USA
- ✅ Verificar precios correctos por región
- ✅ Testing de facturación en ambas monedas
- ✅ Documentación y capacitación

---

## 💡 CONSIDERACIONES ADICIONALES

### 1. Pasarela de Pagos
- **Colombia:** Bold (ya implementado)
- **USA:** Stripe (recomendado)
- **Internacional:** Stripe

### 2. Impuestos
- **Colombia:** IVA 19%
- **USA:** Sales Tax (varía por estado, 0-10%)
- Implementar cálculo automático de impuestos

### 3. Soporte
- **Colombia:** Soporte en español
- **USA:** Soporte en inglés
- Considerar horarios de atención por zona horaria

### 4. Cumplimiento Legal
- **Colombia:** Normativa colombiana de datos
- **USA:** HIPAA para datos médicos
- Términos y condiciones por región

### 5. Marketing
- **Colombia:** Enfoque en precio accesible
- **USA:** Enfoque en features y cumplimiento HIPAA
- Testimonios localizados por región

---

## 📈 PROYECCIÓN DE INGRESOS

### Escenario Conservador (Año 1)

**Colombia:**
- 50 tenants × $119,900 COP/mes = $5,995,000 COP/mes
- Anual: ~$72M COP (~$18,000 USD)

**USA:**
- 20 tenants × $119 USD/mes = $2,380 USD/mes
- Anual: ~$28,560 USD

**Total Año 1:** ~$46,560 USD

### Escenario Optimista (Año 2)

**Colombia:**
- 150 tenants × promedio $130,000 COP/mes = $19.5M COP/mes
- Anual: ~$234M COP (~$58,500 USD)

**USA:**
- 80 tenants × promedio $150 USD/mes = $12,000 USD/mes
- Anual: ~$144,000 USD

**Total Año 2:** ~$202,500 USD

---

## ✅ CONCLUSIÓN

La estrategia recomendada es implementar una **landing page única con detección geográfica y precios dinámicos**. Esto permite:

1. ✅ Mantener tenants actuales sin cambios
2. ✅ Expandirse a USA con precios competitivos
3. ✅ Escalar fácilmente a otros países
4. ✅ Gestión centralizada y eficiente
5. ✅ Mejor experiencia de usuario
6. ✅ Menor costo de mantenimiento

Los tenants existentes en Colombia no se verán afectados y continuarán con sus planes y precios actuales. Los nuevos tenants en USA tendrán precios en USD ajustados al mercado americano.

---

**Próximos Pasos:**
1. Aprobar estrategia de precios USA
2. Iniciar desarrollo de detección geográfica
3. Integrar Stripe para pagos en USD
4. Testing con usuarios piloto en USA
5. Lanzamiento gradual del mercado USA
