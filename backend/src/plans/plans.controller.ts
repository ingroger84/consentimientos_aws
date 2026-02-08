import { Controller, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../roles/entities/role.entity';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { GeoDetectionService } from '../common/services/geo-detection.service';
import { getRegionPricing, getPlanPrice } from '../tenants/pricing-regions.config';

@Controller('plans')
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly geoDetectionService: GeoDetectionService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN)
  findAll() {
    return this.plansService.findAll();
  }

  @Get('public')
  async findAllPublic(@Req() req: Request) {
    // Detectar país del usuario
    const country = await this.geoDetectionService.detectCountry(req);
    const regionPricing = getRegionPricing(country);
    
    // Obtener planes base
    const plans = this.plansService.findAll();
    
    // Aplicar precios según región
    const plansWithRegionalPricing = plans.map(plan => ({
      ...plan,
      priceMonthly: regionPricing.plans[plan.id]?.priceMonthly || 0,
      priceAnnual: regionPricing.plans[plan.id]?.priceAnnual || 0,
    }));
    
    return {
      region: regionPricing.region,
      currency: regionPricing.currency,
      symbol: regionPricing.symbol,
      taxRate: regionPricing.taxRate,
      taxName: regionPricing.taxName,
      plans: plansWithRegionalPricing,
    };
  }

  @Get('public/:id')
  async findOnePublic(@Param('id') id: string, @Req() req: Request) {
    // Detectar país del usuario
    const country = await this.geoDetectionService.detectCountry(req);
    const regionPricing = getRegionPricing(country);
    
    // Obtener plan base
    const plan = this.plansService.findOne(id);
    
    // Aplicar precios según región
    const planWithRegionalPricing = {
      ...plan,
      priceMonthly: regionPricing.plans[plan.id]?.priceMonthly || 0,
      priceAnnual: regionPricing.plans[plan.id]?.priceAnnual || 0,
    };
    
    return {
      region: regionPricing.region,
      currency: regionPricing.currency,
      symbol: regionPricing.symbol,
      taxRate: regionPricing.taxRate,
      taxName: regionPricing.taxName,
      plan: planWithRegionalPricing,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }
}
