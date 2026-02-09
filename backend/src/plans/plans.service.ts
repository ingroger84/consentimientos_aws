import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PLANS, PlanConfig } from '../tenants/plans.config';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdatePlanPricingDto } from './dto/update-plan-pricing.dto';
import { TenantsService } from '../tenants/tenants.service';
import { PlanPricing } from './entities/plan-pricing.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PlansService {
  // Ruta al archivo de configuración en src (no en dist)
  private plansConfigPath = path.join(process.cwd(), 'src', 'tenants', 'plans.config.ts');
  private plans: Record<string, PlanConfig> = { ...PLANS };

  constructor(
    @InjectRepository(PlanPricing)
    private planPricingRepository: Repository<PlanPricing>,
    @Inject(forwardRef(() => TenantsService))
    private tenantsService: TenantsService,
  ) {
    console.log('[PlansService] Ruta de configuración de planes:', this.plansConfigPath);
    console.log('[PlansService] Archivo existe:', fs.existsSync(this.plansConfigPath));
  }

  findAll(): PlanConfig[] {
    return Object.values(this.plans);
  }

  findOne(id: string): PlanConfig {
    const plan = this.plans[id];
    if (!plan) {
      throw new NotFoundException(`Plan ${id} no encontrado`);
    }
    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<PlanConfig> {
    const plan = this.findOne(id);

    // Actualizar el plan en memoria
    this.plans[id] = {
      ...plan,
      ...updatePlanDto,
      limits: {
        ...plan.limits,
        ...(updatePlanDto.limits || {}),
      },
      features: {
        ...plan.features,
        ...(updatePlanDto.features || {}),
      },
    };

    // Guardar cambios en el archivo de configuración
    this.savePlansToFile();

    // ⚠️ SINCRONIZACIÓN DESHABILITADA:
    // Los cambios en el plan NO afectan a tenants existentes.
    // Solo se aplicarán a nuevas asignaciones del plan.
    // Si necesitas actualizar tenants existentes, hazlo manualmente desde la gestión de tenants.
    
    console.log(`[PlansService] Plan ${id} actualizado. Los cambios solo afectarán a nuevas asignaciones.`);

    return this.plans[id];
  }

  /**
   * MÉTODO DESHABILITADO: Actualiza los límites de todos los tenants con un plan específico
   * 
   * Este método está comentado porque la política actual es que los cambios en planes
   * NO afecten a tenants existentes, solo a nuevas asignaciones.
   * 
   * Si necesitas habilitar la sincronización automática en el futuro:
   * 1. Descomenta este método
   * 2. Llama a this.updateTenantsWithPlan() en el método update()
   * 3. Considera agregar un flag 'hasCustomLimits' para no sobrescribir límites personalizados
   */
  /*
  private async updateTenantsWithPlan(planId: string, planConfig: PlanConfig): Promise<void> {
    try {
      console.log(`[PlansService] Actualizando tenants con plan: ${planId}`);
      
      // Obtener todos los tenants con este plan
      const tenantsWithPlan = await this.tenantsService.findByPlan(planId);
      
      console.log(`[PlansService] Encontrados ${tenantsWithPlan.length} tenants con plan ${planId}`);

      // Actualizar los límites de cada tenant
      for (const tenant of tenantsWithPlan) {
        await this.tenantsService.updateLimitsFromPlan(tenant.id, planConfig.limits);
        console.log(`[PlansService] Límites actualizados para tenant: ${tenant.name}`);
      }

      console.log(`[PlansService] Actualización de tenants completada`);
    } catch (error) {
      console.error('[PlansService] Error al actualizar tenants:', error);
      // No lanzar el error para no bloquear la actualización del plan
    }
  }
  */

  private savePlansToFile(): void {
    try {
      // Verificar que la ruta existe
      const dirPath = path.dirname(this.plansConfigPath);
      if (!fs.existsSync(dirPath)) {
        throw new Error(`El directorio no existe: ${dirPath}`);
      }

      // Verificar que el archivo existe
      if (!fs.existsSync(this.plansConfigPath)) {
        throw new Error(`El archivo no existe: ${this.plansConfigPath}`);
      }

      const plansContent = this.generatePlansFileContent();
      fs.writeFileSync(this.plansConfigPath, plansContent, 'utf-8');
      console.log('[PlansService] Configuración de planes actualizada exitosamente en:', this.plansConfigPath);
    } catch (error) {
      console.error('[PlansService] Error al guardar configuración de planes:', error);
      console.error('[PlansService] Ruta intentada:', this.plansConfigPath);
      throw error;
    }
  }

  private generatePlansFileContent(): string {
    const plansJson = JSON.stringify(this.plans, null, 2);
    
    return `export interface PlanConfig {
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
    backup: 'none' | 'weekly' | 'daily';
    supportResponseTime: string;
  };
  popular?: boolean;
}

export const PLANS: Record<string, PlanConfig> = ${plansJson};

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
`;
  }

  // ==================== MÉTODOS PARA GESTIÓN DE PRECIOS POR REGIÓN ====================

  /**
   * Obtiene todos los precios de un plan para todas las regiones
   */
  async getPlanPricingByRegion(planId: string): Promise<PlanPricing[]> {
    return this.planPricingRepository.find({
      where: { planId, isActive: true },
      order: { region: 'ASC' },
    });
  }

  /**
   * Obtiene el precio de un plan para una región específica
   */
  async getPlanPricingForRegion(planId: string, region: string): Promise<PlanPricing | null> {
    return this.planPricingRepository.findOne({
      where: { planId, region, isActive: true },
    });
  }

  /**
   * Obtiene todos los precios de todas las regiones agrupados por plan
   */
  async getAllPlansPricing(): Promise<Record<string, PlanPricing[]>> {
    const allPricing = await this.planPricingRepository.find({
      where: { isActive: true },
      order: { planId: 'ASC', region: 'ASC' },
    });

    // Agrupar por planId
    const grouped: Record<string, PlanPricing[]> = {};
    for (const pricing of allPricing) {
      if (!grouped[pricing.planId]) {
        grouped[pricing.planId] = [];
      }
      grouped[pricing.planId].push(pricing);
    }

    return grouped;
  }

  /**
   * Actualiza el precio de un plan para una región específica
   */
  async updatePlanPricing(
    planId: string,
    region: string,
    updateDto: UpdatePlanPricingDto,
  ): Promise<PlanPricing> {
    const pricing = await this.planPricingRepository.findOne({
      where: { planId, region },
    });

    if (!pricing) {
      throw new NotFoundException(
        `Precio no encontrado para plan ${planId} en región ${region}`,
      );
    }

    // Actualizar campos
    if (updateDto.priceMonthly !== undefined) {
      pricing.priceMonthly = updateDto.priceMonthly;
    }
    if (updateDto.priceAnnual !== undefined) {
      pricing.priceAnnual = updateDto.priceAnnual;
    }
    if (updateDto.taxRate !== undefined) {
      pricing.taxRate = updateDto.taxRate;
    }
    if (updateDto.taxName !== undefined) {
      pricing.taxName = updateDto.taxName;
    }

    return this.planPricingRepository.save(pricing);
  }

  /**
   * Obtiene todas las regiones disponibles
   */
  async getAvailableRegions(): Promise<Array<{ region: string; regionName: string; currency: string }>> {
    const regions = await this.planPricingRepository
      .createQueryBuilder('pp')
      .select('pp.region', 'region')
      .addSelect('pp.regionName', 'regionName')
      .addSelect('pp.currency', 'currency')
      .addSelect('pp.currencySymbol', 'currencySymbol')
      .where('pp.isActive = :isActive', { isActive: true })
      .groupBy('pp.region')
      .addGroupBy('pp.regionName')
      .addGroupBy('pp.currency')
      .addGroupBy('pp.currencySymbol')
      .orderBy('pp.region', 'ASC')
      .getRawMany();

    return regions;
  }
}