export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  limits: {
    users: number;
    branches: number;
    consents: number;
    services: number;
    questions: number;
    storageMb: number;
  };
  features: {
    customization: boolean;
    advancedReports: boolean;
    prioritySupport: boolean;
    customDomain: boolean;
    whiteLabel: boolean;
    backup: 'none' | 'weekly' | 'daily';
    supportResponseTime: string;
  };
  popular?: boolean;
}

export const PLANS: Record<string, PlanConfig> = {
  "free": {
    "id": "free",
    "name": "Gratuito",
    "description": "Ideal para probar el sistema",
    "priceMonthly": 0,
    "priceAnnual": 0,
    "limits": {
      "users": 1,
      "branches": 1,
      "consents": 50,
      "services": 3,
      "questions": 6,
      "storageMb": 100
    },
    "features": {
      "customization": false,
      "advancedReports": false,
      "prioritySupport": false,
      "customDomain": false,
      "whiteLabel": false,
      "backup": "none",
      "supportResponseTime": "48h"
    }
  },
  "basic": {
    "id": "basic",
    "name": "Básico",
    "description": "Para pequeñas clínicas, consultorios, spa, espeticas etc",
    "priceMonthly": 89900,
    "priceAnnual": 895404,
    "limits": {
      "users": 1,
      "branches": 1,
      "consents": 50,
      "services": 5,
      "questions": 10,
      "storageMb": 100
    },
    "features": {
      "customization": true,
      "advancedReports": false,
      "prioritySupport": false,
      "customDomain": false,
      "whiteLabel": false,
      "backup": "none",
      "supportResponseTime": "24h"
    },
    "popular": true
  },
  "professional": {
    "id": "professional",
    "name": "Emprendedor",
    "description": "Para clínicas medianas y centros médicos",
    "priceMonthly": 119900,
    "priceAnnual": 1194202,
    "limits": {
      "users": 3,
      "branches": 2,
      "consents": 80,
      "services": 10,
      "questions": 20,
      "storageMb": 200
    },
    "features": {
      "customization": true,
      "advancedReports": true,
      "prioritySupport": true,
      "customDomain": false,
      "whiteLabel": false,
      "backup": "weekly",
      "supportResponseTime": "12h"
    }
  },
  "enterprise": {
    "id": "enterprise",
    "name": "Plus",
    "description": "Para grandes clínicas y hospitales",
    "priceMonthly": 149900,
    "priceAnnual": 1493004,
    "limits": {
      "users": 5,
      "branches": 4,
      "consents": 100,
      "services": 20,
      "questions": 40,
      "storageMb": 300
    },
    "features": {
      "customization": true,
      "advancedReports": true,
      "prioritySupport": true,
      "customDomain": true,
      "whiteLabel": false,
      "backup": "daily",
      "supportResponseTime": "4h"
    }
  },
  "custom": {
    "id": "custom",
    "name": "Empresarial",
    "description": "Solución personalizada para grandes organizaciones",
    "priceMonthly": 189900,
    "priceAnnual": 1891404,
    "limits": {
      "users": 11,
      "branches": 10,
      "consents": 500,
      "services": 50,
      "questions": 100,
      "storageMb": 600
    },
    "features": {
      "customization": true,
      "advancedReports": true,
      "prioritySupport": true,
      "customDomain": true,
      "whiteLabel": true,
      "backup": "daily",
      "supportResponseTime": "24/7"
    }
  }
};

export function getPlanConfig(planId: string): PlanConfig | null {
  return PLANS[planId] || null;
}

export function getAllPlans(): PlanConfig[] {
  return Object.values(PLANS);
}

export function calculatePrice(planId: string, billingCycle: 'monthly' | 'annual'): number {
  const plan = getPlanConfig(planId);
  if (!plan) return 0;
  return billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
}
