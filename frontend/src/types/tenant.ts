export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  EXPIRED = 'expired',
}

export enum TenantPlan {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export interface PlanFeatures {
  watermark?: boolean;
  customization?: boolean;
  advancedReports?: boolean;
  apiAccess?: boolean;
  prioritySupport?: boolean;
  customDomain?: boolean;
  whiteLabel?: boolean;
  backup?: 'none' | 'weekly' | 'daily';
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  status: TenantStatus;
  plan: TenantPlan;
  planPrice?: number;
  billingCycle?: BillingCycle;
  billingDay?: number; // Día del mes para corte de facturación (1-28)
  planStartedAt?: string;
  planExpiresAt?: string;
  autoRenew?: boolean;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  maxUsers: number;
  maxConsents: number;
  maxBranches: number;
  maxServices?: number;
  maxQuestions?: number;
  storageLimitMb?: number;
  features?: PlanFeatures;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  settings: Record<string, any> | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  // Relaciones para métricas de consumo
  users?: any[];
  branches?: any[];
  services?: any[];
  consents?: any[];
}

export interface TenantStats {
  totalUsers: number;
  totalBranches: number;
  totalServices: number;
  totalConsents: number;
  maxUsers: number;
  maxBranches: number;
  maxConsents: number;
  usagePercentage: {
    users: number;
    branches: number;
    consents: number;
  };
  status: TenantStatus;
  plan: TenantPlan;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
}

export interface GlobalStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  trialTenants: number;
  expiredTenants: number;
  totalUsers: number;
  totalBranches: number;
  totalServices: number;
  totalConsents: number;
  tenantsNearLimit: number;
  tenantsAtLimit: number;
  planDistribution: {
    free: number;
    basic: number;
    professional: number;
    enterprise: number;
  };
  growthData: Array<{ month: string; tenants: number; users: number; consents: number }>;
  tenantsByPlan: Array<{ plan: string; count: number }>;
  topTenants: Array<{
    id: string;
    name: string;
    plan: string;
    consentsCount: number;
    usersCount: number;
    lastActivity: string;
  }>;
}

export interface AdminUserDto {
  name: string;
  email: string;
  password: string;
}

export interface CreateTenantDto {
  name: string;
  slug?: string;
  logo?: string;
  status?: TenantStatus;
  plan?: TenantPlan;
  planPrice?: number;
  billingCycle?: BillingCycle;
  billingDay?: number; // Día del mes para corte de facturación (1-28)
  autoRenew?: boolean;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  maxUsers?: number;
  maxConsents?: number;
  maxBranches?: number;
  maxServices?: number;
  maxQuestions?: number;
  storageLimitMb?: number;
  features?: PlanFeatures;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  adminUser: AdminUserDto; // Usuario administrador del tenant (requerido)
}

export interface UpdateTenantDto extends Partial<Omit<CreateTenantDto, 'adminUser'>> {}
