import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../profiles/guards/permissions.guard';
import { RequirePermission } from '../profiles/decorators/require-permission.decorator';
import { RequireSuperAdmin } from '../profiles/decorators/require-super-admin.decorator';
import { PaymentStatus } from './entities/payment.entity';
import { ProfilesService } from '../profiles/profiles.service';

@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly profilesService: ProfilesService,
  ) {}

  @Post()
  @RequireSuperAdmin()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @RequirePermission('payments', 'view')
  async findAll(
    @Request() req,
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Verificar si es Super Admin usando el servicio centralizado
    const user = await this.profilesService['userRepository'].findOne({
      where: { id: req.user.id },
      relations: ['profile', 'role', 'tenant'],
    });

    const isSuperAdmin = this.profilesService['isSuperAdmin'](user);
    const userTenantId = user.tenant?.id;

    const filters: any = {};

    if (!isSuperAdmin) {
      filters.tenantId = userTenantId;
    } else if (tenantId) {
      filters.tenantId = tenantId;
    }

    if (status) {
      filters.status = status;
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    return await this.paymentsService.findAll(filters);
  }

  @Get(':id')
  @RequirePermission('payments', 'view')
  async findOne(@Request() req, @Param('id') id: string) {
    const payment = await this.paymentsService.findOne(id);

    // Verificar si es Super Admin usando el servicio centralizado
    const user = await this.profilesService['userRepository'].findOne({
      where: { id: req.user.id },
      relations: ['profile', 'role', 'tenant'],
    });

    const isSuperAdmin = this.profilesService['isSuperAdmin'](user);
    const userTenantId = user.tenant?.id;

    if (!isSuperAdmin && payment.tenantId !== userTenantId) {
      throw new ForbiddenException('No tienes permisos para ver este pago');
    }

    return payment;
  }

  @Get('tenant/:tenantId')
  @RequireSuperAdmin()
  async findByTenant(@Param('tenantId') tenantId: string) {
    return await this.paymentsService.findByTenant(tenantId);
  }
}
