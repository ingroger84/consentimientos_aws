# 💻 Código de Ejemplo - Multi-Región

## 1. Configuración de Precios por Región

```typescript
// backend/src/tenants/pricing-regions.config.ts

export interface RegionPricing {
  region: string;
  currency: string;
  symbol: string;
  taxRate: number;
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
    taxRate: 0.19,
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
    taxRate: 0.08,
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

## 2. Servicio de Detección Geográfica

```typescript
// backend/src/common/services/geo-detection.service.ts

import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class GeoDetectionService {
  async detectCountry(req: Request): Promise<string> {
    // 1. Header explícito
    const countryHeader = req.headers['x-country'] as string;
    if (countryHeader) {
      return countryHeader.toUpperCase();
    }

    // 2. Detectar por IP
    const ip = this.getClientIp(req);
    const country = await this.getCountryFromIp(ip);
    if (country) {
      return country;
    }

    // 3. Fallback a Accept-Language
    const language = req.headers['accept-language'];
    if (language?.includes('es-CO')) return 'CO';
    if (language?.includes('en-US')) return 'US';

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
      const response = await fetch(`https://ipapi.co/${ip}/country/`);
      const country = await response.text();
      return country.trim().toUpperCase();
    } catch (error) {
      return null;
    }
  }
}
```

## 3. Controller de Planes con Detección

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
    const country = await this.geoDetectionService.detectCountry(req);
    const regionPricing = REGION_PRICING[country] || REGION_PRICING['DEFAULT'];
    
    const plans = this.plansService.findAll().map(plan => ({
      ...plan,
      priceMonthly: regionPricing.plans[plan.id]?.priceMonthly || 0,
      priceAnnual: regionPricing.plans[plan.id]?.priceAnnual || 0,
    }));
    
    return {
      region: regionPricing.region,
      currency: regionPricing.currency,
      symbol: regionPricing.symbol,
      plans,
    };
  }
}
```

## 4. Frontend - Componente de Precios

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

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => setPricingData(data));
  }, []);

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Precios en {pricingData?.currency} para {pricingData?.region}
      </p>
      
      {pricingData?.plans.map(plan => (
        <div key={plan.id}>
          <h3>{plan.name}</h3>
          <p>
            {pricingData.symbol}
            {plan.priceMonthly.toLocaleString()}
            /{pricingData.currency}/mes
          </p>
        </div>
      ))}
    </div>
  );
}
```

## 5. Migración de Base de Datos

```sql
-- backend/migrations/add-region-fields-to-tenant.sql

ALTER TABLE tenants 
ADD COLUMN region VARCHAR(2) DEFAULT 'CO',
ADD COLUMN currency VARCHAR(3) DEFAULT 'COP',
ADD COLUMN plan_price_original DECIMAL(10,2),
ADD COLUMN price_locked BOOLEAN DEFAULT false;

-- Actualizar tenants existentes
UPDATE tenants 
SET 
  region = 'CO',
  currency = 'COP',
  plan_price_original = plan_price,
  price_locked = true
WHERE region IS NULL;
```

---

Ver documentación completa para más ejemplos.
