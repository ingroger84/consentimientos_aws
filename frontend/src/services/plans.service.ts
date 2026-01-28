import api from './api';

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
    medicalRecords: number;
    mrConsentTemplates: number;
    consentTemplates: number;
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
    apiAccess: boolean;
    backup: string;
    supportResponseTime: string;
  };
  popular?: boolean;
}

export const plansService = {
  async getAll(): Promise<PlanConfig[]> {
    const { data } = await api.get<PlanConfig[]>('/plans');
    return data;
  },

  async getOne(id: string): Promise<PlanConfig> {
    const { data } = await api.get<PlanConfig>(`/plans/${id}`);
    return data;
  },

  async update(id: string, updateData: Partial<PlanConfig>): Promise<PlanConfig> {
    const { data } = await api.put<PlanConfig>(`/plans/${id}`, updateData);
    return data;
  },

  getPlanById(plans: PlanConfig[], planId: string): PlanConfig | undefined {
    return plans.find(p => p.id === planId);
  },

  calculatePrice(plan: PlanConfig, billingCycle: 'monthly' | 'annual'): number {
    return billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
  },

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  },

  formatStorage(mb: number): string {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(0)} GB`;
    }
    return `${mb} MB`;
  },
};
