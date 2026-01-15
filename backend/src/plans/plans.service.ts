import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PLANS, PlanConfig } from '../tenants/plans.config';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { TenantsService } from '../tenants/tenants.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PlansService {
  // Ruta al archivo de configuración en src (no en dist)
  private plansConfigPath = path.join(process.cwd(), 'src', 'tenants', 'plans.config.ts');
  private plans: Record<string, PlanConfig> = { ...PLANS };

  constructor(
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
    services: number;
    questions: number;
    storageMb: number;
  };
  features: {
    watermark: boolean;
    customization: boolean;
    advancedReports: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    customDomain: boolean;
    whiteLabel: boolean;
    backup: 'none' | 'weekly' | 'daily';
    supportResponseTime: string;
  };
  popular?: boolean;
}

export const PLANS: Record<string, PlanConfig> = ${plansJson};

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
`;
  }
}
