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
    medicalRecords: number;           // Límite de Historias Clínicas
    mrConsentTemplates: number;       // Límite de Plantillas de HC
    consentTemplates: number;         // Límite de Plantillas de CN
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
    apiAccess: boolean;               // Acceso a API
    backup: 'none' | 'weekly' | 'daily';
    supportResponseTime: string;
  };
  popular?: boolean;
}

export const PLANS: Record<string, PlanConfig> = {
  "free": {
    "id": "free",
    "name": "Gratuito",
    "description": "Prueba gratis por 7 días",
    "priceMonthly": 0,
    "priceAnnual": 0,
    "limits": {
      "users": 1,
      "branches": 1,
      "consents": 20,
      "medicalRecords": 5,
      "mrConsentTemplates": 2,
      "consentTemplates": 3,
      "services": 3,
      "questions": 6,
      "storageMb": 200
    },
    "features": {
      "customization": false,
      "advancedReports": false,
      "prioritySupport": false,
      "customDomain": false,
      "whiteLabel": false,
      "apiAccess": false,
      "backup": "none",
      "supportResponseTime": "48h"
    }
  },
  "basic": {
    "id": "basic",
    "name": "Básico",
    "description": "Para pequeñas clínicas, consultorios, spa, estéticas etc",
    "priceMonthly": 89900,
    "priceAnnual": 895404,
    "limits": {
      "users": 2,
      "branches": 1,
      "consents": 100,
      "medicalRecords": 30,
      "mrConsentTemplates": 5,
      "consentTemplates": 10,
      "services": 5,
      "questions": 10,
      "storageMb": 500
    },
    "features": {
      "customization": true,
      "advancedReports": false,
      "prioritySupport": false,
      "customDomain": false,
      "whiteLabel": false,
      "apiAccess": false,
      "backup": "none",
      "supportResponseTime": "24h"
    }
  },
  "professional": {
    "id": "professional",
    "name": "Emprendedor",
    "description": "Para clínicas medianas y centros médicos",
    "priceMonthly": 119900,
    "priceAnnual": 1194202,
    "limits": {
      "users": 5,
      "branches": 3,
      "consents": 300,
      "medicalRecords": 100,
      "mrConsentTemplates": 10,
      "consentTemplates": 20,
      "services": 15,
      "questions": 30,
      "storageMb": 2000
    },
    "features": {
      "customization": true,
      "advancedReports": true,
      "prioritySupport": true,
      "customDomain": false,
      "whiteLabel": false,
      "apiAccess": false,
      "backup": "weekly",
      "supportResponseTime": "12h"
    },
    "popular": true
  },
  "enterprise": {
    "id": "enterprise",
    "name": "Plus",
    "description": "Para grandes clínicas y hospitales",
    "priceMonthly": 149900,
    "priceAnnual": 1493004,
    "limits": {
      "users": 10,
      "branches": 5,
      "consents": 500,
      "medicalRecords": 300,
      "mrConsentTemplates": 20,
      "consentTemplates": 30,
      "services": 30,
      "questions": 50,
      "storageMb": 5000
    },
    "features": {
      "customization": true,
      "advancedReports": true,
      "prioritySupport": true,
      "customDomain": true,
      "whiteLabel": false,
      "apiAccess": false,
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
      "users": -1,
      "branches": -1,
      "consents": -1,
      "medicalRecords": -1,
      "mrConsentTemplates": -1,
      "consentTemplates": -1,
      "services": -1,
      "questions": -1,
      "storageMb": 10000
    },
    "features": {
      "customization": true,
      "advancedReports": true,
      "prioritySupport": true,
      "customDomain": true,
      "whiteLabel": true,
      "apiAccess": true,
      "backup": "daily",
      "supportResponseTime": "24/7"
    }
  }
};

/**
 * Carga los planes desde el archivo JSON si existe, sino usa la configuración estática
 */
function loadPlansFromJson(): Record<string, PlanConfig> | null {
  try {
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(__dirname, './plans.json');
    
    if (fs.existsSync(jsonPath)) {
      const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
      const plans = JSON.parse(jsonContent);
      console.log('[PlansConfig] Planes cargados desde plans.json');
      return plans;
    }
  } catch (error) {
    console.error('[PlansConfig] Error al cargar plans.json:', error.message);
  }
  
  return null;
}

export function getPlanConfig(planId: string): PlanConfig | null {
  // Intentar cargar desde JSON primero
  const dynamicPlans = loadPlansFromJson();
  const plansSource = dynamicPlans || PLANS;
  
  return plansSource[planId] || null;
}

export function getAllPlans(): PlanConfig[] {
  // Intentar cargar desde JSON primero
  const dynamicPlans = loadPlansFromJson();
  const plansSource = dynamicPlans || PLANS;
  
  return Object.values(plansSource);
}

export function calculatePrice(planId: string, billingCycle: 'monthly' | 'annual'): number {
  const plan = getPlanConfig(planId);
  if (!plan) return 0;
  return billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
}
