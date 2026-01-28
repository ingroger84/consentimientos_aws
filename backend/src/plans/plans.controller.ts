import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../roles/entities/role.entity';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN)
  findAll() {
    return this.plansService.findAll();
  }

  @Get('public')
  findAllPublic() {
    return this.plansService.findAll();
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
