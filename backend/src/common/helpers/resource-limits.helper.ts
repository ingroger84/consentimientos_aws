import { ForbiddenException } from '@nestjs/common';
import { Tenant } from '../../tenants/entities/tenant.entity';

export interface ResourceCount {
  current: number;
  max: number;
  resourceType: string;
}

export class ResourceLimitsHelper {
  /**
   * Valida si se puede crear un nuevo recurso según los límites del tenant
   */
  static validateResourceLimit(
    currentCount: number,
    maxLimit: number,
    resourceType: string,
    tenantName?: string,
  ): void {
    if (currentCount >= maxLimit) {
      const message = tenantName
        ? `El tenant "${tenantName}" ha alcanzado el límite de ${resourceType} (${currentCount}/${maxLimit}). Por favor, actualiza tu plan para continuar.`
        : `Has alcanzado el límite de ${resourceType} (${currentCount}/${maxLimit}). Por favor, actualiza tu plan para continuar.`;

      throw new ForbiddenException({
        message,
        error: 'RESOURCE_LIMIT_REACHED',
        resourceType,
        current: currentCount,
        max: maxLimit,
      });
    }
  }

  /**
   * Valida límite de usuarios
   */
  static validateUserLimit(tenant: Tenant, currentUserCount: number): void {
    this.validateResourceLimit(
      currentUserCount,
      tenant.maxUsers,
      'usuarios',
      tenant.name,
    );
  }

  /**
   * Valida límite de sedes
   */
  static validateBranchLimit(tenant: Tenant, currentBranchCount: number): void {
    this.validateResourceLimit(
      currentBranchCount,
      tenant.maxBranches,
      'sedes',
      tenant.name,
    );
  }

  /**
   * Valida límite de consentimientos
   */
  static validateConsentLimit(tenant: Tenant, currentConsentCount: number): void {
    this.validateResourceLimit(
      currentConsentCount,
      tenant.maxConsents,
      'consentimientos',
      tenant.name,
    );
  }

  /**
   * Valida límite de servicios
   */
  static validateServiceLimit(tenant: Tenant, currentServiceCount: number): void {
    const maxServices = tenant.maxServices || 999999;
    this.validateResourceLimit(
      currentServiceCount,
      maxServices,
      'servicios médicos',
      tenant.name,
    );
  }

  /**
   * Valida límite de preguntas
   */
  static validateQuestionLimit(tenant: Tenant, currentQuestionCount: number): void {
    const maxQuestions = tenant.maxQuestions || 999999;
    this.validateResourceLimit(
      currentQuestionCount,
      maxQuestions,
      'preguntas personalizadas',
      tenant.name,
    );
  }

  /**
   * Calcula el porcentaje de uso de un recurso
   */
  static calculateUsagePercentage(current: number, max: number): number {
    if (max === 0) return 0;
    return Math.round((current / max) * 100);
  }

  /**
   * Verifica si un recurso está cerca del límite (>= 80%)
   */
  static isNearLimit(current: number, max: number): boolean {
    return this.calculateUsagePercentage(current, max) >= 80;
  }

  /**
   * Verifica si un recurso alcanzó el límite (>= 100%)
   */
  static isAtLimit(current: number, max: number): boolean {
    return current >= max;
  }

  /**
   * Obtiene el estado de uso de un recurso
   */
  static getUsageStatus(
    current: number,
    max: number,
  ): 'normal' | 'warning' | 'critical' {
    const percentage = this.calculateUsagePercentage(current, max);
    if (percentage >= 100) return 'critical';
    if (percentage >= 80) return 'warning';
    return 'normal';
  }
}
