import { Controller, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../profiles/guards/permissions.guard';
import { RequireSuperAdmin } from '../profiles/decorators/require-super-admin.decorator';
import { ProfilesService } from '../profiles/profiles.service';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdatePlanPricingDto } from './dto/update-plan-pricing.dto';
import { GeoDetectionService } from '../common/services/geo-detection.service';

@Controller('plans')
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly geoDetectionService: GeoDetectionService,
    private readonly profilesService: ProfilesService,
  ) {}

  // ==================== ENDPOINTS DE GESTIÓN DE PRECIOS POR REGIÓN ====================
  // IMPORTANTE: Estos endpoints deben ir ANTES de los endpoints con :id para evitar conflictos

  /**
   * Obtiene todas las regiones disponibles
   */
  @Get('regions/available')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireSuperAdmin()
  async getAvailableRegions() {
    return this.plansService.getAvailableRegions();
  }

  /**
   * Obtiene todos los precios de todos los planes agrupados por región
   */
  @Get('pricing/all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireSuperAdmin()
  async getAllPlansPricing() {
    return this.plansService.getAllPlansPricing();
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireSuperAdmin()
  findAll() {
    return this.plansService.findAll();
  }

  @Get('public')
  async findAllPublic(@Req() req: Request) {
    // Detectar país del usuario
    const country = await this.geoDetectionService.detectCountry(req);
    const region = country === 'CO' ? 'CO' : country === 'US' ? 'US' : 'DEFAULT';
    
    // Obtener planes base
    const plans = this.plansService.findAll();
    
    // Obtener precios desde la base de datos
    const plansWithRegionalPricing = await Promise.all(
      plans.map(async (plan) => {
        const pricing = await this.plansService.getPlanPricingForRegion(plan.id, region);
        
        return {
          ...plan,
          priceMonthly: pricing?.priceMonthly || 0,
          priceAnnual: pricing?.priceAnnual || 0,
        };
      })
    );
    
    // Obtener información de la región
    const firstPricing = await this.plansService.getPlanPricingForRegion(plans[0]?.id, region);
    
    return {
      region: firstPricing?.regionName || 'International',
      currency: firstPricing?.currency || 'USD',
      symbol: firstPricing?.currencySymbol || '$',
      taxRate: firstPricing?.taxRate || 0,
      taxName: firstPricing?.taxName || 'Tax',
      plans: plansWithRegionalPricing,
    };
  }

  @Get('public/:id')
  async findOnePublic(@Param('id') id: string, @Req() req: Request) {
    // Detectar país del usuario
    const country = await this.geoDetectionService.detectCountry(req);
    const region = country === 'CO' ? 'CO' : country === 'US' ? 'US' : 'DEFAULT';
    
    // Obtener plan base
    const plan = this.plansService.findOne(id);
    
    // Obtener precios desde la base de datos
    const pricing = await this.plansService.getPlanPricingForRegion(plan.id, region);
    
    // Aplicar precios según región
    const planWithRegionalPricing = {
      ...plan,
      priceMonthly: pricing?.priceMonthly || 0,
      priceAnnual: pricing?.priceAnnual || 0,
    };
    
    return {
      region: pricing?.regionName || 'International',
      currency: pricing?.currency || 'USD',
      symbol: pricing?.currencySymbol || '$',
      taxRate: pricing?.taxRate || 0,
      taxName: pricing?.taxName || 'Tax',
      plan: planWithRegionalPricing,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireSuperAdmin()
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  /**
   * Obtiene los precios de un plan específico para todas las regiones
   */
  @Get(':id/pricing')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireSuperAdmin()
  async getPlanPricing(@Param('id') id: string) {
    return this.plansService.getPlanPricingByRegion(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireSuperAdmin()
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  /**
   * Actualiza el precio de un plan para una región específica
   */
  @Put(':id/pricing/:region')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireSuperAdmin()
  async updatePlanPricing(
    @Param('id') planId: string,
    @Param('region') region: string,
    @Body() updateDto: UpdatePlanPricingDto,
  ) {
    return this.plansService.updatePlanPricing(planId, region, updateDto);
  }
}
