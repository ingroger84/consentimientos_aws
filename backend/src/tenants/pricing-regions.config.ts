/**
 * Configuración de Precios por Región
 * 
 * Este archivo define los precios de los planes para diferentes regiones geográficas.
 * Permite mostrar precios dinámicos según el país del usuario.
 * 
 * @author Sistema Multi-Mercado
 * @date 2026-02-07
 */

export interface RegionPricing {
  region: string;
  currency: string;
  symbol: string;
  taxRate: number; // IVA o Sales Tax
  taxName: string; // Nombre del impuesto
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
    taxName: 'IVA',
    plans: {
      free: { 
        priceMonthly: 0, 
        priceAnnual: 0 
      },
      basic: { 
        priceMonthly: 89900, 
        priceAnnual: 895404 
      },
      professional: { 
        priceMonthly: 119900, 
        priceAnnual: 1194202 
      },
      enterprise: { 
        priceMonthly: 149900, 
        priceAnnual: 1493004 
      },
      custom: { 
        priceMonthly: 189900, 
        priceAnnual: 1891404 
      }
    }
  },
  'US': {
    region: 'United States',
    currency: 'USD',
    symbol: '$',
    taxRate: 0.08,
    taxName: 'Sales Tax',
    plans: {
      free: { 
        priceMonthly: 0, 
        priceAnnual: 0 
      },
      basic: { 
        priceMonthly: 79, 
        priceAnnual: 790 
      },
      professional: { 
        priceMonthly: 119, 
        priceAnnual: 1190 
      },
      enterprise: { 
        priceMonthly: 169, 
        priceAnnual: 1690 
      },
      custom: { 
        priceMonthly: 249, 
        priceAnnual: 2490 
      }
    }
  },
  'DEFAULT': {
    region: 'International',
    currency: 'USD',
    symbol: '$',
    taxRate: 0,
    taxName: 'Tax',
    plans: {
      free: { 
        priceMonthly: 0, 
        priceAnnual: 0 
      },
      basic: { 
        priceMonthly: 79, 
        priceAnnual: 790 
      },
      professional: { 
        priceMonthly: 119, 
        priceAnnual: 1190 
      },
      enterprise: { 
        priceMonthly: 169, 
        priceAnnual: 1690 
      },
      custom: { 
        priceMonthly: 249, 
        priceAnnual: 2490 
      }
    }
  }
};

/**
 * Obtiene la configuración de precios para una región específica
 */
export function getRegionPricing(countryCode: string): RegionPricing {
  return REGION_PRICING[countryCode] || REGION_PRICING['DEFAULT'];
}

/**
 * Obtiene el precio de un plan para una región específica
 */
export function getPlanPrice(
  planId: string, 
  countryCode: string, 
  billingCycle: 'monthly' | 'annual'
): number {
  const regionPricing = getRegionPricing(countryCode);
  const planPricing = regionPricing.plans[planId];
  
  if (!planPricing) {
    return 0;
  }
  
  return billingCycle === 'annual' ? planPricing.priceAnnual : planPricing.priceMonthly;
}

/**
 * Calcula el precio con impuestos incluidos
 */
export function calculatePriceWithTax(
  price: number,
  countryCode: string
): { subtotal: number; tax: number; total: number } {
  const regionPricing = getRegionPricing(countryCode);
  const tax = price * regionPricing.taxRate;
  const total = price + tax;
  
  return {
    subtotal: price,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}
