import { CreateTenantDto } from './dto/create-tenant.dto';
import { getPlanConfig, calculatePrice } from './plans.config';
import { TenantPlan, BillingCycle } from './entities/tenant.entity';

export function applyPlanLimits(dto: CreateTenantDto): CreateTenantDto {
  const planId = dto.plan || TenantPlan.FREE;
  const planConfig = getPlanConfig(planId);

  if (!planConfig) {
    throw new Error(`Plan no encontrado: ${planId}`);
  }

  const billingCycle = dto.billingCycle || BillingCycle.MONTHLY;

  // Aplicar límites del plan
  dto.maxUsers = dto.maxUsers || planConfig.limits.users;
  dto.maxBranches = dto.maxBranches || planConfig.limits.branches;
  dto.maxConsents = dto.maxConsents || planConfig.limits.consents;
  dto.maxServices = dto.maxServices || planConfig.limits.services;
  dto.maxQuestions = dto.maxQuestions || planConfig.limits.questions;
  dto.storageLimitMb = dto.storageLimitMb || planConfig.limits.storageMb;

  // Aplicar precio del plan
  dto.planPrice = calculatePrice(planId, billingCycle);

  // Aplicar features del plan
  dto.features = {
    customization: planConfig.features.customization,
    advancedReports: planConfig.features.advancedReports,
    prioritySupport: planConfig.features.prioritySupport,
    customDomain: planConfig.features.customDomain,
    whiteLabel: planConfig.features.whiteLabel,
    backup: planConfig.features.backup,
  };

  // Establecer fechas del plan
  const now = new Date();
  dto.planStartedAt = now;

  // Calcular fecha de expiración según el ciclo de facturación
  const expiresAt = new Date(now);
  if (billingCycle === BillingCycle.ANNUAL) {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }
  dto.planExpiresAt = expiresAt;

  // Auto-renovación por defecto
  if (dto.autoRenew === undefined) {
    dto.autoRenew = true;
  }

  return dto;
}
